import { promises as fs } from "fs";
import path from "path";
import * as cheerio from "cheerio";

type CliOptions = {
  sourceUrl: string;
  output: string;
  startPage: number;
  maxPages: number;
  delayMs: number;
  retry: number;
  contentOnly: boolean;
  stopWhenEmpty: boolean;
  htmlFallback: boolean;
};

type PageProblem = {
  pid: string;
  title: string;
  difficultyLevel: number | null;
  tagIds: number[];
  tagNames: string[];
  stats: {
    totalSubmit: number | null;
    accepted: number | null;
    passRate: number | null;
  };
};

type ParsedPage = {
  items: PageProblem[];
  totalCount: number | null;
  parser: "json" | "html";
};

type NormalizedProblem = {
  pid: string;
  title: string;
  url: string;
  difficulty: {
    level: number | null;
    name: string;
    band: string;
  };
  rawLuoguTags: string[];
  luoguTagIds: number[];
  tags: string[];
  categories: Record<string, string[]>;
  trainingTarget: string;
  stats: PageProblem["stats"];
  source: "luogu_problem_list";
  lastUpdatedAt: string;
};

type TagRule = {
  pattern: RegExp;
  tag: string;
  bucket: string;
};

const DEFAULT_OUTPUT = path.join(process.cwd(), "data", "problem-bank", "luogu_problem_catalog.json");
const DEFAULT_SOURCE_URL = "https://www.luogu.com.cn/problem/list";

const DIFFICULTY_NAME: Record<number, string> = {
  0: "暂无评定",
  1: "入门",
  2: "普及−",
  3: "普及/提高−",
  4: "普及+/提高",
  5: "提高+/省选−",
  6: "省选/NOI−",
  7: "NOI/NOI+/CTSC",
};

const TAG_RULES: TagRule[] = [
  { pattern: /模拟/, tag: "ALGO_SIMULATION", bucket: "algorithm" },
  { pattern: /枚举|暴力/, tag: "ALGO_ENUMERATION", bucket: "algorithm" },
  { pattern: /递推/, tag: "ALGO_RECURRENCE", bucket: "algorithm" },
  { pattern: /递归/, tag: "ALGO_RECURSION", bucket: "algorithm" },
  { pattern: /搜索/, tag: "ALGO_SEARCH", bucket: "algorithm" },
  { pattern: /深度优先搜索|DFS/i, tag: "SEARCH_DFS", bucket: "algorithm" },
  { pattern: /广度优先搜索|BFS/i, tag: "SEARCH_BFS", bucket: "algorithm" },
  { pattern: /剪枝/, tag: "SEARCH_PRUNING", bucket: "algorithm" },
  { pattern: /动态规划|\bDP\b/i, tag: "ALGO_DP", bucket: "algorithm" },
  { pattern: /线性\s*DP/i, tag: "DP_LINEAR", bucket: "algorithm" },
  { pattern: /区间\s*DP/i, tag: "DP_INTERVAL", bucket: "algorithm" },
  { pattern: /背包\s*DP|背包/i, tag: "DP_KNAPSACK", bucket: "algorithm" },
  { pattern: /树形\s*DP/i, tag: "DP_TREE", bucket: "algorithm" },
  { pattern: /状压\s*DP/i, tag: "DP_STATE_COMPRESSION", bucket: "algorithm" },
  { pattern: /数位\s*DP/i, tag: "DP_DIGIT", bucket: "algorithm" },
  { pattern: /记忆化搜索/, tag: "DP_MEMOIZED_SEARCH", bucket: "algorithm" },
  { pattern: /贪心/, tag: "ALGO_GREEDY", bucket: "algorithm" },
  { pattern: /反悔贪心/, tag: "GREEDY_REGRET", bucket: "algorithm" },
  { pattern: /二分/, tag: "ALGO_BINARY_SEARCH", bucket: "algorithm" },
  { pattern: /分治/, tag: "ALGO_DIVIDE_CONQUER", bucket: "algorithm" },
  { pattern: /排序/, tag: "ALGO_SORTING", bucket: "algorithm" },
  { pattern: /双指针|two-pointer/i, tag: "ALGO_TWO_POINTERS", bucket: "algorithm" },
  { pattern: /前缀和/, tag: "ALGO_PREFIX_SUM", bucket: "algorithm" },
  { pattern: /差分/, tag: "ALGO_DIFFERENCE", bucket: "algorithm" },
  { pattern: /单调队列/, tag: "DS_MONOTONIC_QUEUE", bucket: "dataStructure" },
  { pattern: /单调栈/, tag: "DS_MONOTONIC_STACK", bucket: "dataStructure" },
  { pattern: /栈/, tag: "DS_STACK", bucket: "dataStructure" },
  { pattern: /队列/, tag: "DS_QUEUE", bucket: "dataStructure" },
  { pattern: /堆|优先队列/, tag: "DS_HEAP_PRIORITY_QUEUE", bucket: "dataStructure" },
  { pattern: /并查集/, tag: "DS_DISJOINT_SET", bucket: "dataStructure" },
  { pattern: /树状数组/, tag: "DS_FENWICK", bucket: "dataStructure" },
  { pattern: /线段树/, tag: "DS_SEGMENT_TREE", bucket: "dataStructure" },
  { pattern: /树链剖分/, tag: "DS_HEAVY_LIGHT_DECOMPOSITION", bucket: "dataStructure" },
  { pattern: /树形数据结构|二叉树|树的直径/, tag: "DS_TREE", bucket: "dataStructure" },
  { pattern: /字符串/, tag: "TOPIC_STRING", bucket: "topic" },
  { pattern: /数学/, tag: "TOPIC_MATH", bucket: "topic" },
  { pattern: /高精度/, tag: "MATH_BIG_INTEGER", bucket: "topic" },
  { pattern: /最大公约数|gcd/i, tag: "MATH_GCD", bucket: "topic" },
  { pattern: /扩展欧几里德|逆元/, tag: "MATH_EXTGCD_INVERSE", bucket: "topic" },
  { pattern: /素数|质数|质因数/, tag: "MATH_PRIME", bucket: "topic" },
  { pattern: /组合数学|Catalan|卡特兰/i, tag: "MATH_COMBINATORICS", bucket: "topic" },
  { pattern: /进制/, tag: "MATH_BASE_CONVERSION", bucket: "topic" },
  { pattern: /图论/, tag: "GRAPH", bucket: "topic" },
  { pattern: /最短路/, tag: "GRAPH_SHORTEST_PATH", bucket: "topic" },
  { pattern: /Floyd/i, tag: "GRAPH_FLOYD", bucket: "topic" },
  { pattern: /Tarjan|强连通分量/i, tag: "GRAPH_TARJAN_SCC", bucket: "topic" },
  { pattern: /拓扑排序/, tag: "GRAPH_TOPOLOGICAL_SORT", bucket: "topic" },
  { pattern: /费用流|网络流|最大流/, tag: "GRAPH_FLOW", bucket: "topic" },
  { pattern: /计算几何/, tag: "GEOMETRY", bucket: "topic" },
  { pattern: /位运算/, tag: "BIT_OPERATION", bucket: "topic" },
  { pattern: /倍增/, tag: "ALGO_BINARY_LIFTING", bucket: "algorithm" },
  { pattern: /STL/i, tag: "LANG_CPP_STL", bucket: "implementation" },
  { pattern: /Special Judge/i, tag: "OJ_SPECIAL_JUDGE", bucket: "judge" },
  { pattern: /提交答案/, tag: "OJ_OUTPUT_ONLY", bucket: "judge" },
];

const CONTEST_RULES: TagRule[] = [
  { pattern: /CSP\s*-?\s*J|CSP-J|入门级/, tag: "CONTEST_CSP_J", bucket: "contest" },
  { pattern: /CSP\s*-?\s*S|CSP-S|提高级/, tag: "CONTEST_CSP_S", bucket: "contest" },
  { pattern: /NOIP.*普及组|NOIP\s*普及组|普及组/, tag: "CONTEST_NOIP_POPULAR", bucket: "contest" },
  { pattern: /NOIP.*提高组|NOIP\s*提高组|提高组/, tag: "CONTEST_NOIP_ADVANCED", bucket: "contest" },
  { pattern: /省选/, tag: "CONTEST_PROVINCIAL_SELECTION", bucket: "contest" },
  { pattern: /NOI/, tag: "CONTEST_NOI", bucket: "contest" },
];

function parseCliOptions(argv = process.argv.slice(2)): CliOptions {
  const args: Record<string, string | boolean> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }

  return {
    sourceUrl: stringArg(args.source, DEFAULT_SOURCE_URL),
    output: path.resolve(stringArg(args.output, DEFAULT_OUTPUT)),
    startPage: positiveIntArg(args["start-page"], 1),
    maxPages: positiveIntArg(args["max-pages"], 20),
    delayMs: positiveIntArg(args["delay-ms"], 1200),
    retry: positiveIntArg(args.retry, 3),
    contentOnly: args["no-content-only"] !== true,
    stopWhenEmpty: args["no-stop-when-empty"] !== true,
    htmlFallback: args["no-html-fallback"] !== true,
  };
}

async function main(): Promise<void> {
  const options = parseCliOptions();
  const problemByPid = new Map<string, NormalizedProblem>();
  const parsers = new Set<string>();
  let totalCountFromLuogu: number | null = null;

  for (let offset = 0; offset < options.maxPages; offset += 1) {
    const page = options.startPage + offset;
    const url = buildPageUrl(options, page);
    const text = await fetchWithRetry(url, options.retry);
    const parsed = parseJsonPage(text) ?? (options.htmlFallback ? parseHtmlPage(text) : null);

    if (!parsed) {
      throw new Error(`Unable to parse Luogu problem list page ${page}. URL=${url}`);
    }

    parsers.add(parsed.parser);
    totalCountFromLuogu = parsed.totalCount ?? totalCountFromLuogu;

    for (const item of parsed.items) {
      problemByPid.set(item.pid, normalizeProblem(item));
    }

    console.log(`[luogu] page=${page} parser=${parsed.parser} pageItems=${parsed.items.length} totalItems=${problemByPid.size}`);

    if (parsed.items.length === 0 && options.stopWhenEmpty) break;
    if (totalCountFromLuogu !== null && problemByPid.size >= totalCountFromLuogu) break;
    if (offset < options.maxPages - 1) await sleep(options.delayMs);
  }

  const items = [...problemByPid.values()].sort(compareProblemPid);
  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      name: "Luogu problem list",
      url: options.sourceUrl,
      contentOnly: options.contentOnly,
      maxPages: options.maxPages,
      startPage: options.startPage,
      delayMs: options.delayMs,
      parsers: [...parsers].sort(),
      note: "Only public problem metadata is stored: pid, title, difficulty, tags, stats and URL. Problem statements are intentionally not copied.",
    },
    totalCountFromLuogu,
    totalFetched: items.length,
    tagSchemaVersion: "2026-07-07",
    tagIndex: buildTagIndex(items),
    items,
  };

  await fs.mkdir(path.dirname(options.output), { recursive: true });
  await fs.writeFile(options.output, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`[luogu] written ${items.length} problems to ${options.output}`);
}

function buildPageUrl(options: CliOptions, page: number): string {
  const url = new URL(options.sourceUrl);
  url.searchParams.set("page", String(page));
  if (options.contentOnly) url.searchParams.set("_contentOnly", "1");
  return url.toString();
}

async function fetchWithRetry(url: string, retry: number): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retry; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
          Referer: DEFAULT_SOURCE_URL,
          "User-Agent": "newLuogu-catalog-bot/1.0 (+https://github.com/forwardFish/newLuogu)",
        },
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }
      return text;
    } catch (error) {
      lastError = error;
      if (attempt < retry) await sleep(800 * attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function parseJsonPage(text: string): ParsedPage | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;

  let json: unknown;
  try {
    json = JSON.parse(trimmed);
  } catch {
    return null;
  }

  const tagNameById = collectTagNames(json);
  const problemList = findFirstArray(json, ["result", "problems", "items", "data"]);
  if (!problemList) return null;

  const items = problemList
    .map((item) => normalizeApiProblem(item, tagNameById))
    .filter((item): item is PageProblem => item !== null);

  return {
    items,
    totalCount: findTotalCount(json),
    parser: "json",
  };
}

function parseHtmlPage(text: string): ParsedPage {
  const $ = cheerio.load(text);
  const items: PageProblem[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const pid = parsePidFromUrl(href);
    if (!pid || seen.has(pid)) return;

    const title = cleanText($(element).text()).replace(new RegExp(`^${pid}\\s*`), "");
    if (!title) return;

    seen.add(pid);
    const container = $(element).closest("li, article, section, div").first();
    const tagNames = container
      .find("a[href]")
      .toArray()
      .filter((tagElement) => parsePidFromUrl($(tagElement).attr("href") ?? "") === null)
      .map((tagElement) => cleanText($(tagElement).text()))
      .filter((value) => value && value !== title && value !== pid);

    items.push({
      pid,
      title,
      difficultyLevel: null,
      tagIds: [],
      tagNames: uniqueStrings([...tagNames, ...inferVisibleTags(`${title} ${container.text()}`)]),
      stats: {
        totalSubmit: null,
        accepted: null,
        passRate: null,
      },
    });
  });

  return { items, totalCount: null, parser: "html" };
}

function normalizeApiProblem(raw: unknown, tagNameById: Map<number, string>): PageProblem | null {
  if (!isObject(raw)) return null;

  const pid = getString(raw.pid) || getString(raw.problemPid) || getString(raw.id);
  const title = getString(raw.title) || getString(raw.name);
  if (!pid || !title) return null;

  const normalizedTags = normalizeRawTags(raw.tags, tagNameById);
  const totalSubmit = firstNumber(raw.totalSubmit, raw.submitCount, raw.totalSubmitCount, raw.submitted, raw.submit);
  const accepted = firstNumber(raw.accepted, raw.totalAccepted, raw.acceptedCount, raw.passCount, raw.acCount);
  const explicitPassRate = firstNumber(raw.passRate, raw.acRate, raw.acceptedRate);
  const passRate = explicitPassRate ?? (totalSubmit && accepted !== null ? accepted / totalSubmit : null);

  return {
    pid,
    title,
    difficultyLevel: firstNumber(raw.difficulty, raw.difficultyLevel, raw.level),
    tagIds: normalizedTags.tagIds,
    tagNames: uniqueStrings([...normalizedTags.tagNames, ...inferVisibleTags(title)]),
    stats: {
      totalSubmit,
      accepted,
      passRate,
    },
  };
}

function normalizeProblem(problem: PageProblem): NormalizedProblem {
  const textForClassification = `${problem.title} ${problem.tagNames.join(" ")}`;
  const categories = classifyTags(textForClassification, problem.tagNames);
  const difficulty = normalizeDifficulty(problem.difficultyLevel);
  const tags = uniqueStrings(Object.values(categories).flat()).sort();

  return {
    pid: problem.pid,
    title: problem.title,
    url: `https://www.luogu.com.cn/problem/${problem.pid}`,
    difficulty,
    rawLuoguTags: uniqueStrings(problem.tagNames),
    luoguTagIds: uniqueNumbers(problem.tagIds),
    tags,
    categories,
    trainingTarget: inferTrainingTarget(categories, difficulty.level),
    stats: problem.stats,
    source: "luogu_problem_list",
    lastUpdatedAt: new Date().toISOString(),
  };
}

function classifyTags(text: string, rawTags: string[]): Record<string, string[]> {
  const buckets: Record<string, Set<string>> = {
    algorithm: new Set(),
    dataStructure: new Set(),
    topic: new Set(),
    implementation: new Set(),
    contest: new Set(),
    year: new Set(),
    judge: new Set(),
  };

  for (const rule of [...TAG_RULES, ...CONTEST_RULES]) {
    if (rule.pattern.test(text)) buckets[rule.bucket]?.add(rule.tag);
  }

  for (const match of text.matchAll(/\b(19\d{2}|20\d{2})\b/g)) {
    buckets.year.add(`YEAR_${match[1]}`);
  }

  for (const rawTag of rawTags) {
    const safe = toAsciiTag(rawTag);
    if (safe) buckets.topic.add(`LUOGU_${safe}`);
  }

  return Object.fromEntries(
    Object.entries(buckets)
      .map(([key, value]) => [key, [...value].sort()])
      .filter(([, value]) => (value as string[]).length > 0),
  );
}

function normalizeDifficulty(level: number | null): NormalizedProblem["difficulty"] {
  if (level === null || Number.isNaN(level)) {
    return { level: null, name: "未知", band: "UNKNOWN" };
  }

  const name = DIFFICULTY_NAME[level] ?? `未知难度 ${level}`;
  if (level <= 1) return { level, name, band: "BEGINNER" };
  if (level <= 3) return { level, name, band: "CSP_J" };
  if (level <= 5) return { level, name, band: "CSP_S" };
  if (level === 6) return { level, name, band: "PROVINCIAL_SELECTION" };
  return { level, name, band: "NOI_PLUS" };
}

function inferTrainingTarget(categories: Record<string, string[]>, difficultyLevel: number | null): string {
  const contests = categories.contest ?? [];
  if (contests.includes("CONTEST_CSP_S") || contests.includes("CONTEST_NOIP_ADVANCED")) return "CSP_S";
  if (contests.includes("CONTEST_CSP_J") || contests.includes("CONTEST_NOIP_POPULAR")) return "CSP_J";
  if (difficultyLevel !== null && difficultyLevel >= 4) return "CSP_S";
  if (difficultyLevel !== null && difficultyLevel <= 3) return "CSP_J";
  return "MIXED";
}

function buildTagIndex(items: NormalizedProblem[]): Record<string, { count: number; buckets: string[] }> {
  const index = new Map<string, { count: number; buckets: Set<string> }>();
  for (const item of items) {
    for (const [bucket, tags] of Object.entries(item.categories)) {
      for (const tag of tags) {
        const current = index.get(tag) ?? { count: 0, buckets: new Set<string>() };
        current.count += 1;
        current.buckets.add(bucket);
        index.set(tag, current);
      }
    }
  }

  return Object.fromEntries(
    [...index.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, value]) => [tag, { count: value.count, buckets: [...value.buckets].sort() }]),
  );
}

function collectTagNames(value: unknown, output = new Map<number, string>(), depth = 0): Map<number, string> {
  if (depth > 7) return output;
  if (Array.isArray(value)) {
    for (const item of value) collectTagNames(item, output, depth + 1);
    return output;
  }
  if (!isObject(value)) return output;

  const id = firstNumber(value.id, value.tagId);
  const name = getString(value.name) || getString(value.title);
  const looksLikeTag = id !== null && name && !getString(value.pid) && !getString(value.problemPid) && name.length <= 40;
  if (looksLikeTag) output.set(id, name);

  for (const child of Object.values(value)) collectTagNames(child, output, depth + 1);
  return output;
}

function normalizeRawTags(raw: unknown, tagNameById: Map<number, string>): { tagIds: number[]; tagNames: string[] } {
  const tagIds: number[] = [];
  const tagNames: string[] = [];
  const tags = Array.isArray(raw) ? raw : [];

  for (const tag of tags) {
    if (typeof tag === "number") {
      tagIds.push(tag);
      const name = tagNameById.get(tag);
      if (name) tagNames.push(name);
      continue;
    }
    if (typeof tag === "string") {
      tagNames.push(tag);
      continue;
    }
    if (isObject(tag)) {
      const id = firstNumber(tag.id, tag.tagId);
      const name = getString(tag.name) || getString(tag.title);
      if (id !== null) tagIds.push(id);
      if (name) tagNames.push(name);
    }
  }

  return { tagIds: uniqueNumbers(tagIds), tagNames: uniqueStrings(tagNames) };
}

function findFirstArray(value: unknown, preferredKeys: string[], depth = 0): unknown[] | null {
  if (depth > 8) return null;
  if (Array.isArray(value)) return value;
  if (!isObject(value)) return null;

  for (const key of preferredKeys) {
    const child = value[key];
    if (Array.isArray(child)) return child;
    const nested = findFirstArray(child, preferredKeys, depth + 1);
    if (nested) return nested;
  }

  for (const child of Object.values(value)) {
    const nested = findFirstArray(child, preferredKeys, depth + 1);
    if (nested) return nested;
  }

  return null;
}

function findTotalCount(value: unknown, depth = 0): number | null {
  if (depth > 8 || !isObject(value)) return null;
  const direct = firstNumber(value.count, value.totalCount, value.total, value.problemCount);
  if (direct !== null && direct > 0) return direct;
  for (const child of Object.values(value)) {
    const nested = findTotalCount(child, depth + 1);
    if (nested !== null) return nested;
  }
  return null;
}

function inferVisibleTags(text: string): string[] {
  const tags: string[] = [];
  for (const rule of [...TAG_RULES, ...CONTEST_RULES]) {
    if (rule.pattern.test(text)) tags.push(rule.tag.replace(/^(ALGO|TOPIC|DS|MATH|GRAPH|CONTEST)_/, ""));
  }
  for (const match of text.matchAll(/\b(19\d{2}|20\d{2})\b/g)) tags.push(match[1]);
  return uniqueStrings(tags);
}

function parsePidFromUrl(url: string): string | null {
  const match = url.match(/\/problem\/([A-Z]+\d+[A-Z]?)/i);
  return match ? match[1].toUpperCase() : null;
}

function compareProblemPid(a: NormalizedProblem, b: NormalizedProblem): number {
  const pa = splitPid(a.pid);
  const pb = splitPid(b.pid);
  if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
  if (pa.number !== pb.number) return pa.number - pb.number;
  return a.pid.localeCompare(b.pid);
}

function splitPid(pid: string): { prefix: string; number: number } {
  const match = pid.match(/^([A-Z]+)(\d+)/i);
  return { prefix: match?.[1] ?? pid, number: Number(match?.[2] ?? Number.MAX_SAFE_INTEGER) };
}

function stringArg(value: string | boolean | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function positiveIntArg(value: string | boolean | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getString(value: unknown): string {
  return typeof value === "string" ? cleanText(value) : "";
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => cleanText(value)).filter(Boolean))];
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);
}

function toAsciiTag(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase()
    .slice(0, 64);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
