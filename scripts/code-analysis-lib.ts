import { promises as fs } from "fs";
import path from "path";

export type JudgeResult =
  | "AC"
  | "WA"
  | "TLE"
  | "RE"
  | "CE"
  | "MLE"
  | "OLE"
  | "UKE"
  | "PC"
  | "UNKNOWN";

export type SubmissionManifestItem = {
  filePath: string;
  fileName: string;
  recordId: string | null;
  problemPid: string | null;
  problemTitle: string | null;
  result: JudgeResult;
  score: number | null;
  language: string;
  submitTime: string | null;
  fileSize: number;
  source: "luogu_code_export" | "local_code_file";
};

export type SubmissionManifest = {
  generatedAt: string;
  inputDir: string;
  indexPath: string | null;
  totalFiles: number;
  supportedFiles: number;
  items: SubmissionManifestItem[];
  summary: {
    byResult: Record<string, number>;
    byLanguage: Record<string, number>;
    problems: number;
    withSubmitTime: number;
  };
};

export type CodeStaticMetric = {
  filePath: string;
  recordId: string | null;
  problemPid: string | null;
  result: JudgeResult;
  score: number | null;
  lineCount: number;
  nonEmptyLineCount: number;
  blankLineCount: number;
  commentLineCount: number;
  includeCount: number;
  maxLineLength: number;
  avgLineLength: number;
  includeBits: boolean;
  useDefineIntLongLong: boolean;
  useTypedefLongLong: boolean;
  useUsingNamespaceStd: boolean;
  useLongLong: boolean;
  useGlobalArray: boolean;
  globalArrayCount: number;
  globalVectorCount: number;
  functionCount: number;
  mainLineCount: number | null;
  maxBraceDepth: number;
  maxIndentDepth: number;
  loopCount: number;
  nestedLoopDepth: number;
  branchCount: number;
  recursionLikely: boolean;
  usesFreopen: boolean;
  usesMemset: boolean;
  usesModulo: boolean;
  usesLambda: boolean;
  usesStruct: boolean;
  usesClass: boolean;
  usesPriorityQueue: boolean;
  usesMapSet: boolean;
  usesQueueStack: boolean;
  usesVector: boolean;
  usesSort: boolean;
  usesBinarySearch: boolean;
  riskFlags: string[];
};

export type CodeStaticMetricsFile = {
  generatedAt: string;
  totalFiles: number;
  summary: {
    avgNonEmptyLineCount: number;
    avgMaxLineLength: number;
    avgFunctionCount: number;
    maxNonEmptyLineCount: number;
    maxBraceDepth: number;
    filesWithRisk: number;
    riskFlagCounts: Record<string, number>;
  };
  items: CodeStaticMetric[];
};

export type TimelineAttempt = {
  filePath: string;
  recordId: string | null;
  result: JudgeResult;
  score: number | null;
  submitTime: string | null;
  nonEmptyLineCount: number;
  maxBraceDepth: number;
  riskFlags: string[];
};

export type ProblemTimelineItem = {
  problemPid: string;
  problemTitle: string | null;
  attemptCount: number;
  acCount: number;
  firstSubmitTime: string | null;
  lastSubmitTime: string | null;
  firstAcTime: string | null;
  bestScore: number | null;
  solved: boolean;
  finalResult: JudgeResult;
  finalScore: number | null;
  tags: string[];
  attempts: TimelineAttempt[];
};

export type ProblemTimelineFile = {
  generatedAt: string;
  totalProblems: number;
  summary: {
    solvedProblems: number;
    unsolvedProblems: number;
    multiAttemptProblems: number;
    stuckProblems: number;
    averageAttemptsPerProblem: number;
    tagCounts: Record<string, number>;
  };
  items: ProblemTimelineItem[];
};

export type AlgorithmModuleName =
  | "dp"
  | "knapsack_dp"
  | "interval_dp"
  | "tree_dp"
  | "state_compression_dp"
  | "graph"
  | "shortest_path"
  | "dfs_bfs"
  | "dsu"
  | "segment_tree"
  | "fenwick_tree"
  | "heap"
  | "greedy"
  | "binary_search"
  | "math"
  | "string"
  | "search"
  | "toposort"
  | "mst"
  | "tree";

export type FileModuleDetection = {
  filePath: string;
  problemPid: string | null;
  recordId: string | null;
  result: JudgeResult;
  modules: Array<{
    name: AlgorithmModuleName;
    confidence: number;
    evidence: string[];
  }>;
};

export type AlgorithmModuleStatsFile = {
  generatedAt: string;
  summary: Record<
    AlgorithmModuleName,
    {
      fileCount: number;
      problemCount: number;
      acProblemCount: number;
      avgAttempts: number;
      representativeProblems: string[];
    }
  >;
  files: FileModuleDetection[];
};

type AnalysisContext = {
  manifest: SubmissionManifest;
  metrics: CodeStaticMetricsFile;
  timeline: ProblemTimelineFile;
  modules: AlgorithmModuleStatsFile;
};

const CODE_EXTENSIONS = new Set([".cpp", ".cc", ".cxx", ".c", ".hpp", ".h", ".py", ".txt"]);
const RESULT_VALUES = new Set<JudgeResult>([
  "AC",
  "WA",
  "TLE",
  "RE",
  "CE",
  "MLE",
  "OLE",
  "UKE",
  "PC",
  "UNKNOWN",
]);

const MODULE_ORDER: AlgorithmModuleName[] = [
  "dp",
  "knapsack_dp",
  "interval_dp",
  "tree_dp",
  "state_compression_dp",
  "graph",
  "shortest_path",
  "dfs_bfs",
  "dsu",
  "segment_tree",
  "fenwick_tree",
  "heap",
  "greedy",
  "binary_search",
  "math",
  "string",
  "search",
  "toposort",
  "mst",
  "tree",
];

type LuoguIndexItem = {
  recordId?: unknown;
  problemPid?: unknown;
  problemTitle?: unknown;
  normalizedResult?: unknown;
  score?: unknown;
  submitTime?: unknown;
  codePath?: unknown;
};

export type CliOptions = {
  input: string;
  output: string;
  index: string | null;
};

export function parseCliOptions(argv = process.argv.slice(2)): CliOptions {
  const options: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token) continue;

    if (token.startsWith("--")) {
      const [rawKey, inlineValue] = token.slice(2).split("=", 2);
      const key = rawKey.trim();
      const value = inlineValue ?? argv[index + 1];
      if (inlineValue === undefined) index += 1;
      if (key && value) options[key] = value;
    }
  }

  const input =
    options.input ??
    path.join(
      process.cwd(),
      "data",
      "code",
      "luogu-1024038-2026-06-23T03-23-15-197Z",
      "codes",
    );
  const output = options.output ?? path.join(process.cwd(), "data", "analysis");
  const index = options.index ?? inferIndexPath(input);

  return {
    input: path.resolve(input),
    output: path.resolve(output),
    index: index ? path.resolve(index) : null,
  };
}

export async function buildManifest(options: CliOptions): Promise<SubmissionManifest> {
  await ensureDir(options.output);

  const files = await listCodeFiles(options.input);
  const indexMap = options.index ? await loadIndexMap(options.index) : new Map<string, LuoguIndexItem>();
  const items: SubmissionManifestItem[] = [];

  for (const filePath of files) {
    const absolutePath = path.resolve(filePath);
    const stat = await fs.stat(absolutePath);
    const fileName = path.basename(absolutePath);
    const parsed = parseFileName(fileName);
    const indexItem = indexMap.get(normalizePathKey(absolutePath));
    const ext = path.extname(fileName).toLowerCase();

    const result = normalizeResult(stringOrNull(indexItem?.normalizedResult) ?? parsed.result);
    const problemPid = stringOrNull(indexItem?.problemPid) ?? parsed.problemPid;
    const score = numberOrNull(indexItem?.score) ?? parsed.score;

    items.push({
      filePath: absolutePath,
      fileName,
      recordId: stringOrNull(indexItem?.recordId) ?? parsed.recordId,
      problemPid,
      problemTitle: stringOrNull(indexItem?.problemTitle),
      result,
      score,
      language: languageFromExtension(ext),
      submitTime: normalizeDateString(stringOrNull(indexItem?.submitTime) ?? parsed.submitTime),
      fileSize: stat.size,
      source: indexItem ? "luogu_code_export" : "local_code_file",
    });
  }

  items.sort(compareManifestItems);

  const manifest: SubmissionManifest = {
    generatedAt: new Date().toISOString(),
    inputDir: options.input,
    indexPath: options.index,
    totalFiles: files.length,
    supportedFiles: items.length,
    items,
    summary: {
      byResult: countBy(items, (item) => item.result),
      byLanguage: countBy(items, (item) => item.language),
      problems: new Set(items.map((item) => item.problemPid).filter(Boolean)).size,
      withSubmitTime: items.filter((item) => item.submitTime).length,
    },
  };

  await writeJson(path.join(options.output, "submission_manifest.json"), manifest);
  return manifest;
}

export async function scanCodeStatic(options: CliOptions): Promise<CodeStaticMetricsFile> {
  await ensureDir(options.output);
  const manifest = await readOrBuildManifest(options);
  const items: CodeStaticMetric[] = [];

  for (const item of manifest.items) {
    const code = await fs.readFile(item.filePath, "utf8");
    items.push(scanSingleFile(item, code));
  }

  const riskFlagCounts = countRiskFlags(items);
  const metricsFile: CodeStaticMetricsFile = {
    generatedAt: new Date().toISOString(),
    totalFiles: items.length,
    summary: {
      avgNonEmptyLineCount: round(avg(items.map((item) => item.nonEmptyLineCount))),
      avgMaxLineLength: round(avg(items.map((item) => item.maxLineLength))),
      avgFunctionCount: round(avg(items.map((item) => item.functionCount))),
      maxNonEmptyLineCount: max(items.map((item) => item.nonEmptyLineCount)),
      maxBraceDepth: max(items.map((item) => item.maxBraceDepth)),
      filesWithRisk: items.filter((item) => item.riskFlags.length > 0).length,
      riskFlagCounts,
    },
    items,
  };

  await writeJson(path.join(options.output, "code_static_metrics.json"), metricsFile);
  return metricsFile;
}

export async function buildProblemTimeline(options: CliOptions): Promise<ProblemTimelineFile> {
  await ensureDir(options.output);
  const manifest = await readOrBuildManifest(options);
  const metrics = await readOrScanMetrics(options, manifest);
  const metricMap = new Map(metrics.items.map((item) => [item.filePath, item]));
  const groups = new Map<string, SubmissionManifestItem[]>();

  for (const item of manifest.items) {
    const key = item.problemPid ?? `UNKNOWN:${item.filePath}`;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const timelineItems: ProblemTimelineItem[] = [];

  for (const [problemPid, attempts] of groups) {
    const sorted = [...attempts].sort(compareManifestItems);
    const richAttempts: TimelineAttempt[] = sorted.map((attempt) => {
      const metric = metricMap.get(attempt.filePath);
      return {
        filePath: attempt.filePath,
        recordId: attempt.recordId,
        result: attempt.result,
        score: attempt.score,
        submitTime: attempt.submitTime,
        nonEmptyLineCount: metric?.nonEmptyLineCount ?? 0,
        maxBraceDepth: metric?.maxBraceDepth ?? 0,
        riskFlags: metric?.riskFlags ?? [],
      };
    });
    const acAttempts = richAttempts.filter((attempt) => attempt.result === "AC");
    const finalAttempt = richAttempts[richAttempts.length - 1];
    const firstAc = acAttempts[0];
    const bestScore = bestScoreOf(richAttempts);
    const tags = buildTimelineTags(richAttempts, bestScore);

    timelineItems.push({
      problemPid,
      problemTitle: sorted.find((item) => item.problemTitle)?.problemTitle ?? null,
      attemptCount: richAttempts.length,
      acCount: acAttempts.length,
      firstSubmitTime: richAttempts[0]?.submitTime ?? null,
      lastSubmitTime: finalAttempt?.submitTime ?? null,
      firstAcTime: firstAc?.submitTime ?? null,
      bestScore,
      solved: acAttempts.length > 0,
      finalResult: finalAttempt?.result ?? "UNKNOWN",
      finalScore: finalAttempt?.score ?? null,
      tags,
      attempts: richAttempts,
    });
  }

  timelineItems.sort((a, b) => {
    const timeCompare = compareNullableTime(b.lastSubmitTime, a.lastSubmitTime);
    if (timeCompare !== 0) return timeCompare;
    return a.problemPid.localeCompare(b.problemPid);
  });

  const tagCounts: Record<string, number> = {};
  for (const item of timelineItems) {
    for (const tag of item.tags) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }

  const timeline: ProblemTimelineFile = {
    generatedAt: new Date().toISOString(),
    totalProblems: timelineItems.length,
    summary: {
      solvedProblems: timelineItems.filter((item) => item.solved).length,
      unsolvedProblems: timelineItems.filter((item) => !item.solved).length,
      multiAttemptProblems: timelineItems.filter((item) => item.attemptCount > 1).length,
      stuckProblems: timelineItems.filter((item) => item.tags.includes("STUCK_PROBLEM")).length,
      averageAttemptsPerProblem: round(avg(timelineItems.map((item) => item.attemptCount))),
      tagCounts,
    },
    items: timelineItems,
  };

  await writeJson(path.join(options.output, "problem_code_timeline.json"), timeline);
  return timeline;
}

export async function detectAlgorithmModules(options: CliOptions): Promise<AlgorithmModuleStatsFile> {
  await ensureDir(options.output);
  const manifest = await readOrBuildManifest(options);
  const metrics = await readOrScanMetrics(options, manifest);
  const timeline = await readOrBuildTimeline(options, manifest, metrics);
  const metricMap = new Map(metrics.items.map((item) => [item.filePath, item]));
  const files: FileModuleDetection[] = [];

  for (const item of manifest.items) {
    const code = await fs.readFile(item.filePath, "utf8");
    const metric = metricMap.get(item.filePath);
    files.push({
      filePath: item.filePath,
      problemPid: item.problemPid,
      recordId: item.recordId,
      result: item.result,
      modules: detectModulesFromCode(code, metric),
    });
  }

  const summary = createEmptyModuleSummary();
  const timelineByProblem = new Map(timeline.items.map((item) => [item.problemPid, item]));

  for (const moduleName of MODULE_ORDER) {
    const matchingFiles = files.filter((file) => file.modules.some((module) => module.name === moduleName));
    const problemIds = new Set(matchingFiles.map((file) => file.problemPid).filter((value): value is string => Boolean(value)));
    const timelines = [...problemIds].map((pid) => timelineByProblem.get(pid)).filter((value): value is ProblemTimelineItem => Boolean(value));

    summary[moduleName] = {
      fileCount: matchingFiles.length,
      problemCount: problemIds.size,
      acProblemCount: timelines.filter((item) => item.solved).length,
      avgAttempts: round(avg(timelines.map((item) => item.attemptCount))),
      representativeProblems: timelines
        .sort((a, b) => b.attemptCount - a.attemptCount)
        .slice(0, 8)
        .map((item) => item.problemPid),
    };
  }

  const output: AlgorithmModuleStatsFile = {
    generatedAt: new Date().toISOString(),
    summary,
    files,
  };

  await writeJson(path.join(options.output, "algorithm_module_stats.json"), output);
  return output;
}

export async function buildErrorPatternCandidates(options: CliOptions): Promise<unknown> {
  const context = await loadAnalysisContext(options);
  const data = makeErrorPatternCandidates(context);
  await writeJson(path.join(options.output, "error_pattern_candidates.json"), data);
  return data;
}

export async function selectDeepReviewSamples(options: CliOptions): Promise<unknown> {
  const context = await loadAnalysisContext(options);
  const data = makeDeepReviewSamples(context);
  await writeJson(path.join(options.output, "deep_review_samples.json"), data);
  return data;
}

export async function buildCspRiskProfile(options: CliOptions): Promise<unknown> {
  const context = await loadAnalysisContext(options);
  const data = makeCspRiskProfile(context);
  await writeJson(path.join(options.output, "csp_s_risk_profile.json"), data);
  return data;
}

export async function generateCodeAnalysisReport(options: CliOptions): Promise<string> {
  const context = await loadAnalysisContext(options);
  const errorCandidates = makeErrorPatternCandidates(context);
  const samples = makeDeepReviewSamples(context);
  const cspRisk = makeCspRiskProfile(context);
  const report = renderMarkdownReport(context, errorCandidates, samples, cspRisk);
  const reportPath = path.join(options.output, "final_code_analysis_report.md");
  await fs.writeFile(reportPath, `\uFEFF${report}`, "utf8");
  await writeJson(path.join(options.output, "error_pattern_candidates.json"), errorCandidates);
  await writeJson(path.join(options.output, "deep_review_samples.json"), samples);
  await writeJson(path.join(options.output, "csp_s_risk_profile.json"), cspRisk);
  return reportPath;
}

export async function runFullCodeAnalysis(options: CliOptions): Promise<void> {
  await buildManifest(options);
  await scanCodeStatic(options);
  await buildProblemTimeline(options);
  await detectAlgorithmModules(options);
  await buildErrorPatternCandidates(options);
  await selectDeepReviewSamples(options);
  await buildCspRiskProfile(options);
  await generateCodeAnalysisReport(options);
}

async function readOrBuildManifest(options: CliOptions): Promise<SubmissionManifest> {
  const filePath = path.join(options.output, "submission_manifest.json");
  if (await exists(filePath)) return readJson<SubmissionManifest>(filePath);
  return buildManifest(options);
}

async function readOrScanMetrics(
  options: CliOptions,
  _manifest?: SubmissionManifest,
): Promise<CodeStaticMetricsFile> {
  const filePath = path.join(options.output, "code_static_metrics.json");
  if (await exists(filePath)) return readJson<CodeStaticMetricsFile>(filePath);
  return scanCodeStatic(options);
}

async function readOrBuildTimeline(
  options: CliOptions,
  _manifest?: SubmissionManifest,
  _metrics?: CodeStaticMetricsFile,
): Promise<ProblemTimelineFile> {
  const filePath = path.join(options.output, "problem_code_timeline.json");
  if (await exists(filePath)) return readJson<ProblemTimelineFile>(filePath);
  return buildProblemTimeline(options);
}

async function readOrDetectModules(options: CliOptions): Promise<AlgorithmModuleStatsFile> {
  const filePath = path.join(options.output, "algorithm_module_stats.json");
  if (await exists(filePath)) return readJson<AlgorithmModuleStatsFile>(filePath);
  return detectAlgorithmModules(options);
}

async function loadAnalysisContext(options: CliOptions): Promise<AnalysisContext> {
  await ensureDir(options.output);
  const manifest = await readOrBuildManifest(options);
  const metrics = await readOrScanMetrics(options, manifest);
  const timeline = await readOrBuildTimeline(options, manifest, metrics);
  const modules = await readOrDetectModules(options);
  return { manifest, metrics, timeline, modules };
}

function scanSingleFile(item: SubmissionManifestItem, code: string): CodeStaticMetric {
  const normalized = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const stripped = stripCommentsAndStrings(normalized);
  const strippedLines = stripped.split("\n");
  const nonEmptyLineCount = lines.filter((line) => line.trim().length > 0).length;
  const commentLineCount = countCommentLines(lines);
  const functionNames = collectFunctionNames(strippedLines);
  const mainLine = lines.findIndex((line) => /\bint\s+main\s*\(/.test(line));
  const loops = countRegex(stripped, /\b(for|while)\s*\(/g) + countRegex(stripped, /\bdo\s*\{/g);
  const branchCount = countRegex(stripped, /\b(if|else\s+if|switch)\s*[\(\{]/g);
  const maxBraceDepth = calculateMaxBraceDepth(stripped);
  const nestedLoopDepth = calculateNestedLoopDepth(strippedLines);
  const maxIndentDepth = max(lines.map((line) => Math.floor((line.match(/^\s*/)?.[0].replace(/\t/g, "    ").length ?? 0) / 4)));

  const metric: CodeStaticMetric = {
    filePath: item.filePath,
    recordId: item.recordId,
    problemPid: item.problemPid,
    result: item.result,
    score: item.score,
    lineCount: lines.length,
    nonEmptyLineCount,
    blankLineCount: lines.length - nonEmptyLineCount,
    commentLineCount,
    includeCount: countRegex(stripped, /^\s*#\s*include\b/gm),
    maxLineLength: max(lines.map((line) => line.length)),
    avgLineLength: round(avg(lines.map((line) => line.length))),
    includeBits: /#\s*include\s*<bits\/stdc\+\+\.h>/.test(stripped),
    useDefineIntLongLong: /#\s*define\s+int\s+long\s+long\b/.test(stripped),
    useTypedefLongLong: /\btypedef\s+long\s+long\b|\busing\s+\w+\s*=\s*long\s+long\b/.test(stripped),
    useUsingNamespaceStd: /\busing\s+namespace\s+std\s*;/.test(stripped),
    useLongLong: /\blong\s+long\b|\bint64_t\b|\bll\b/.test(stripped),
    useGlobalArray: detectGlobalArray(stripped),
    globalArrayCount: countGlobalArrays(stripped),
    globalVectorCount: countGlobalVectors(stripped),
    functionCount: functionNames.length,
    mainLineCount: mainLine >= 0 ? mainLine + 1 : null,
    maxBraceDepth,
    maxIndentDepth,
    loopCount: loops,
    nestedLoopDepth,
    branchCount,
    recursionLikely: detectRecursion(stripped, functionNames),
    usesFreopen: /\bfreopen\s*\(/.test(stripped),
    usesMemset: /\bmemset\s*\(/.test(stripped),
    usesModulo: /%|mod\b|MOD\b/.test(stripped),
    usesLambda: /\[[^\]]*\]\s*\([^)]*\)\s*(?:->\s*[\w:<>]+)?\s*\{/.test(stripped),
    usesStruct: /\bstruct\s+\w+/.test(stripped),
    usesClass: /\bclass\s+\w+/.test(stripped),
    usesPriorityQueue: /\bpriority_queue\s*</.test(stripped),
    usesMapSet: /\b(map|set|unordered_map|unordered_set|multiset)\s*</.test(stripped),
    usesQueueStack: /\b(queue|stack|deque)\s*</.test(stripped),
    usesVector: /\bvector\s*</.test(stripped),
    usesSort: /\bsort\s*\(/.test(stripped),
    usesBinarySearch: /\b(lower_bound|upper_bound|binary_search)\s*\(/.test(stripped),
    riskFlags: [],
  };

  metric.riskFlags = buildRiskFlags(metric, stripped);
  return metric;
}

function buildRiskFlags(metric: CodeStaticMetric, code: string): string[] {
  const flags: string[] = [];
  if (metric.nonEmptyLineCount >= 180) flags.push("LONG_CODE");
  if (metric.maxLineLength >= 140) flags.push("LONG_LINE");
  if (metric.maxBraceDepth >= 8) flags.push("DEEP_BRACE_NESTING");
  if (metric.nestedLoopDepth >= 4) flags.push("DEEP_LOOP_NESTING");
  if (metric.useDefineIntLongLong) flags.push("DEFINE_INT_LONG_LONG");
  if (metric.useGlobalArray && /\[[^\]]*(1000000|1e6|N|MAX|M)[^\]]*\]/i.test(code)) flags.push("LARGE_GLOBAL_ARRAY");
  if (metric.usesMemset && /\bmemset\s*\([^,]+,\s*(1|0x3f|-1)/.test(code)) flags.push("MEMSET_SENTINEL");
  if (metric.recursionLikely && !/\bsetrecursionlimit\b/.test(code)) flags.push("RECURSION");
  if (/\bint\s+\w+\s*[+\-*]=|int\s+\w+\s*=\s*\w+\s*[*+]\s*\w+/.test(code) && !metric.useLongLong) {
    flags.push("POSSIBLE_INT_OVERFLOW");
  }
  if (/\[\s*\w+\s*[-+]\s*1\s*\]|\[\s*\w+\s*\]/.test(code) && metric.useGlobalArray) flags.push("ARRAY_INDEX_RISK");
  if (metric.result === "TLE" || metric.result === "MLE" || metric.result === "RE" || metric.result === "WA") {
    flags.push(`FAILED_${metric.result}`);
  }
  if (metric.result === "PC") flags.push("PARTIAL_SCORE_CODE");
  return [...new Set(flags)];
}

function detectModulesFromCode(
  rawCode: string,
  metric: CodeStaticMetric | undefined,
): FileModuleDetection["modules"] {
  const code = stripCommentsAndStrings(rawCode);
  const lower = code.toLowerCase();
  const found: FileModuleDetection["modules"] = [];

  const add = (name: AlgorithmModuleName, confidence: number, evidence: string[]) => {
    const existing = found.find((item) => item.name === name);
    if (existing) {
      existing.confidence = Math.min(1, round(Math.max(existing.confidence, confidence)));
      existing.evidence = [...new Set([...existing.evidence, ...evidence])].slice(0, 8);
      return;
    }
    found.push({ name, confidence: round(confidence), evidence: evidence.slice(0, 8) });
  };

  if (/\bdp\s*\[|\bf\s*\[[^\]]+\]\s*\[|memset\s*\(\s*dp|for\s*\([^)]*\)\s*for\s*\([^)]*\)\s*dp/.test(lower)) {
    add("dp", 0.72, ["dp/f array pattern"]);
  }
  if (/\b(v|w|weight|cost|val|volume)\s*\[|for\s*\([^)]*j\s*>=/.test(lower) && /\bdp\s*\[|\bf\s*\[/.test(lower)) {
    add("knapsack_dp", 0.68, ["capacity loop with dp"]);
  }
  if (/\blen\s*=|for\s*\([^)]*len|l\s*\+\s*len|dp\s*\[\s*i\s*\]\s*\[\s*j\s*\]/.test(lower)) {
    add("interval_dp", 0.62, ["interval length transition"]);
  }
  if (/\bdfs\s*\([^)]*\).*\bdp\s*\[|\btree\s*dp|dp\s*\[\s*u\s*\]/s.test(lower)) {
    add("tree_dp", 0.66, ["dfs with dp[u]"]);
  }
  if (/\b1\s*<<\s*n|\bmask\b|\bstate\b|dp\s*\[\s*1\s*<<|dp\s*\[\s*mask/.test(lower)) {
    add("state_compression_dp", 0.74, ["bitmask state"]);
  }
  if (/\bvector\s*<\s*(?:int|pair)|\baddedge\b|\bhead\s*\[|\bto\s*\[|\bnxt\s*\[|\badj\b|\bedge\b/.test(lower)) {
    add("graph", 0.68, ["adjacency/edge structure"]);
  }
  if (/\bdijkstra\b|\bspfa\b|\bfloyd\b|\bdis\s*\[|\bdist\s*\[|\bpriority_queue\s*<.*greater/s.test(lower)) {
    add("shortest_path", 0.76, ["distance array or shortest path keyword"]);
  }
  if (/\bdfs\s*\(|\bbfs\s*\(|\bvis\s*\[|\bvisited\s*\[/.test(lower)) {
    add("dfs_bfs", 0.72, ["dfs/bfs/visited"]);
  }
  if (/\bfa\s*\[|\bfather\s*\[|\bparent\s*\[|\bunion\b|\bfind\s*\(/.test(lower) && /\bfind\s*\(|\bparent\s*\[|\bfa\s*\[|\bfather\s*\[/.test(lower)) {
    add("dsu", 0.73, ["find/parent array"]);
  }
  if (/\bsegment\s*tree|\bpushup\b|\bpushdown\b|\blazy\b|\bquery\s*\([^)]*l[^)]*r|\bmodify\s*\([^)]*l[^)]*r|\btr\s*\[\s*\w+\s*<<\s*1/.test(lower)) {
    add("segment_tree", 0.78, ["segment tree operations"]);
  }
  if (/\blowbit\b|\bbit\s*\[|\bc\s*\[\s*\w+\s*\]\s*\+=|for\s*\([^;]*;\s*\w+\s*<=\s*n;\s*\w+\s*\+=\s*\w+\s*&\s*-\s*\w+/.test(lower)) {
    add("fenwick_tree", 0.74, ["lowbit/BIT update"]);
  }
  if (metric?.usesPriorityQueue || /\bmake_heap\b|\bpush_heap\b|\bpop_heap\b/.test(lower)) {
    add("heap", 0.72, ["priority_queue/heap"]);
  }
  if (metric?.usesSort && !/\bdp\s*\[/.test(lower)) {
    add("greedy", 0.54, ["sort driven solution"]);
  }
  if (metric?.usesBinarySearch || /\bwhile\s*\(\s*l\s*<=\s*r\s*\)|\bmid\s*=|\bcheck\s*\([^)]*\)/.test(lower)) {
    add("binary_search", 0.7, ["mid/check/lower_bound"]);
  }
  if (/\bgcd\s*\(|\blcm\s*\(|\bpow\s*\(|\bqpow\b|\bprime\b|\bsieve\b|\bphi\b|\bmod\b|%/.test(lower)) {
    add("math", 0.62, ["number theory/modulo"]);
  }
  if (/\bstring\s+|\bkmp\b|\bnext\s*\[|\bsubstr\s*\(|\bfind\s*\(|\bchar\s+\w+\s*\[/.test(lower)) {
    add("string", 0.62, ["string processing"]);
  }
  if (/\bbacktrack\b|\bperm\b|\bvis\s*\[.*\]\s*=\s*1|dfs\s*\([^)]*\)\s*\{[^{}]*(?:for|if)/s.test(lower)) {
    add("search", 0.58, ["dfs/backtracking"]);
  }
  if (/\bindeg|\bin_degree|\btopo|\bqueue\s*<\s*int\s*>/.test(lower) && /\bgraph\b|\badj\b|\bvector\s*</.test(lower)) {
    add("toposort", 0.64, ["indegree queue"]);
  }
  if (/\bkruskal\b|\bprim\b|\bmst\b|\bsort\s*\([^)]*edge/.test(lower) || (/\bfind\s*\(/.test(lower) && /\bedge\b/.test(lower))) {
    add("mst", 0.66, ["Kruskal/Prim evidence"]);
  }
  if (/\btree\b|\bson\b|\bdep\s*\[|\bdepth\s*\[|\bparent\s*\[|\blca\b|\bdfs\s*\(\s*(?:u|x|root)/.test(lower)) {
    add("tree", 0.6, ["tree/depth/lca"]);
  }

  return found.sort((a, b) => b.confidence - a.confidence);
}

function makeErrorPatternCandidates(context: AnalysisContext) {
  const metricByFile = new Map(context.metrics.items.map((item) => [item.filePath, item]));
  const selectProblems = (predicate: (item: ProblemTimelineItem) => boolean, limit = 50) =>
    context.timeline.items
      .filter(predicate)
      .sort((a, b) => b.attemptCount - a.attemptCount || compareNullableTime(b.lastSubmitTime, a.lastSubmitTime))
      .slice(0, limit)
      .map((item) => summarizeProblem(item));

  const metricSamples = (predicate: (item: CodeStaticMetric) => boolean, limit = 50) =>
    context.metrics.items
      .filter(predicate)
      .sort((a, b) => b.riskFlags.length - a.riskFlags.length || b.nonEmptyLineCount - a.nonEmptyLineCount)
      .slice(0, limit)
      .map((metric) => summarizeMetric(metric));

  const timelineWithMetricRisk = selectProblems((problem) =>
    problem.attempts.some((attempt) => {
      const metric = metricByFile.get(attempt.filePath);
      return Boolean(metric?.riskFlags.includes("POSSIBLE_INT_OVERFLOW") || metric?.riskFlags.includes("ARRAY_INDEX_RISK"));
    }),
  );

  return {
    generatedAt: new Date().toISOString(),
    notes: [
      "These are candidates generated by static analysis and submission sequence, not final diagnoses.",
      "Use deep_review_samples.json for files that deserve manual or LLM review.",
    ],
    waThenAc: selectProblems((item) => item.tags.includes("WA_THEN_AC")),
    tleThenAc: selectProblems((item) => item.tags.includes("TLE_THEN_AC")),
    reThenAc: selectProblems((item) => item.tags.includes("RE_THEN_AC")),
    neverAcHighAttempts: selectProblems((item) => item.tags.includes("STUCK_PROBLEM")),
    partialScoreProblems: selectProblems((item) => item.tags.includes("PARTIAL_SCORE")),
    longCodeRisks: metricSamples((item) => item.riskFlags.includes("LONG_CODE")),
    deepNestingRisks: metricSamples((item) => item.riskFlags.includes("DEEP_BRACE_NESTING") || item.riskFlags.includes("DEEP_LOOP_NESTING")),
    templateDependencyRisks: metricSamples((item) => item.includeBits || item.useDefineIntLongLong),
    integerRisks: metricSamples((item) => item.riskFlags.includes("POSSIBLE_INT_OVERFLOW") || item.riskFlags.includes("DEFINE_INT_LONG_LONG")),
    arrayBoundaryRisks: metricSamples((item) => item.riskFlags.includes("ARRAY_INDEX_RISK") || item.riskFlags.includes("LARGE_GLOBAL_ARRAY")),
    timelineWithMetricRisk,
  };
}

function makeDeepReviewSamples(context: AnalysisContext) {
  const moduleByFile = new Map(context.modules.files.map((item) => [item.filePath, item.modules.map((module) => module.name)]));
  const byAttempts = [...context.timeline.items].sort((a, b) => b.attemptCount - a.attemptCount).slice(0, 25).map(summarizeProblem);
  const multiFailThenAc = context.timeline.items
    .filter((item) => item.tags.includes("MULTI_FAIL_THEN_AC"))
    .sort((a, b) => b.attemptCount - a.attemptCount)
    .slice(0, 25)
    .map(summarizeProblem);
  const neverAcHighAttempts = context.timeline.items
    .filter((item) => item.tags.includes("STUCK_PROBLEM"))
    .sort((a, b) => b.attemptCount - a.attemptCount)
    .slice(0, 25)
    .map(summarizeProblem);
  const longestCodes = [...context.metrics.items]
    .sort((a, b) => b.nonEmptyLineCount - a.nonEmptyLineCount)
    .slice(0, 25)
    .map((metric) => ({ ...summarizeMetric(metric), modules: moduleByFile.get(metric.filePath) ?? [] }));
  const deepestNestingCodes = [...context.metrics.items]
    .sort((a, b) => b.maxBraceDepth - a.maxBraceDepth || b.nestedLoopDepth - a.nestedLoopDepth)
    .slice(0, 25)
    .map((metric) => ({ ...summarizeMetric(metric), modules: moduleByFile.get(metric.filePath) ?? [] }));
  const recentCodes = [...context.manifest.items]
    .filter((item) => item.submitTime)
    .sort((a, b) => compareNullableTime(b.submitTime, a.submitTime))
    .slice(0, 30)
    .map((item) => ({
      filePath: item.filePath,
      problemPid: item.problemPid,
      result: item.result,
      score: item.score,
      submitTime: item.submitTime,
      modules: moduleByFile.get(item.filePath) ?? [],
    }));

  const moduleRepresentatives: Record<string, unknown[]> = {};
  for (const moduleName of MODULE_ORDER) {
    const files = context.modules.files
      .filter((file) => file.modules.some((module) => module.name === moduleName))
      .slice(0, 8)
      .map((file) => ({
        filePath: file.filePath,
        problemPid: file.problemPid,
        result: file.result,
        recordId: file.recordId,
        evidence: file.modules.find((module) => module.name === moduleName)?.evidence ?? [],
      }));
    if (files.length > 0) moduleRepresentatives[moduleName] = files;
  }

  return {
    generatedAt: new Date().toISOString(),
    reviewPolicy: {
      purpose: "Pick a small, high-value set for manual/LLM deep review without reading all source files.",
      priorityOrder: [
        "high attempts",
        "multi-fail then AC",
        "never AC high attempts",
        "long or deeply nested code",
        "module representatives",
        "recent submissions",
      ],
    },
    topAttemptProblems: byAttempts,
    multiFailThenAc,
    neverAcHighAttempts,
    longestCodes,
    deepestNestingCodes,
    recentCodes,
    moduleRepresentatives,
  };
}

function makeCspRiskProfile(context: AnalysisContext) {
  const totalProblems = Math.max(context.timeline.totalProblems, 1);
  const solvedRatio = context.timeline.summary.solvedProblems / totalProblems;
  const stuckRatio = context.timeline.summary.stuckProblems / totalProblems;
  const riskFileRatio = context.metrics.summary.filesWithRisk / Math.max(context.metrics.totalFiles, 1);
  const avgAttempts = context.timeline.summary.averageAttemptsPerProblem;
  const moduleSummary = context.modules.summary;

  const dpProblems = moduleSummary.dp.problemCount + moduleSummary.knapsack_dp.problemCount + moduleSummary.interval_dp.problemCount + moduleSummary.tree_dp.problemCount + moduleSummary.state_compression_dp.problemCount;
  const graphProblems = moduleSummary.graph.problemCount + moduleSummary.shortest_path.problemCount + moduleSummary.dsu.problemCount + moduleSummary.tree.problemCount;
  const dataStructureProblems = moduleSummary.segment_tree.problemCount + moduleSummary.fenwick_tree.problemCount + moduleSummary.heap.problemCount;

  const t1Stability = clampScore(88 - riskFileRatio * 24 - stuckRatio * 18 + solvedRatio * 10);
  const t2Solving = clampScore(72 + Math.min(dpProblems, 120) * 0.05 + Math.min(graphProblems, 120) * 0.04 - Math.max(avgAttempts - 2.5, 0) * 4);
  const t3Partial = clampScore(62 + dataStructureProblems * 0.08 + moduleSummary.dp.problemCount * 0.04 - stuckRatio * 16);
  const t4Strategy = clampScore(70 - Math.max(avgAttempts - 2.2, 0) * 5 - stuckRatio * 12 + solvedRatio * 8);

  const mainRisks = [
    {
      name: "Debug iteration cost",
      level: avgAttempts >= 3 ? "high" : avgAttempts >= 2 ? "medium" : "low",
      evidence: `Average attempts per problem is ${avgAttempts}.`,
    },
    {
      name: "Implementation risk",
      level: riskFileRatio >= 0.45 ? "high" : riskFileRatio >= 0.25 ? "medium" : "low",
      evidence: `${context.metrics.summary.filesWithRisk}/${context.metrics.totalFiles} files carry static risk flags.`,
    },
    {
      name: "Complex code pressure",
      level: context.metrics.summary.avgNonEmptyLineCount >= 130 ? "medium" : "low",
      evidence: `Average non-empty lines: ${context.metrics.summary.avgNonEmptyLineCount}, max brace depth: ${context.metrics.summary.maxBraceDepth}.`,
    },
    {
      name: "Hard-problem partial scoring",
      level: context.timeline.summary.tagCounts.PARTIAL_SCORE >= 80 ? "high" : "medium",
      evidence: `${context.timeline.summary.tagCounts.PARTIAL_SCORE ?? 0} problems have partial-score submissions.`,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    scores: {
      t1Stability,
      t2Solving,
      t3Partial,
      t4Strategy,
      overall: clampScore((t1Stability + t2Solving + t3Partial + t4Strategy) / 4),
    },
    profile: {
      totalCodeFiles: context.manifest.supportedFiles,
      totalProblems,
      solvedProblems: context.timeline.summary.solvedProblems,
      unsolvedProblems: context.timeline.summary.unsolvedProblems,
      averageAttemptsPerProblem: avgAttempts,
      solvedRatio: round(solvedRatio),
      stuckRatio: round(stuckRatio),
      riskFileRatio: round(riskFileRatio),
      moduleCoverage: {
        dpProblems,
        graphProblems,
        dataStructureProblems,
        mathProblems: moduleSummary.math.problemCount,
        stringProblems: moduleSummary.string.problemCount,
      },
    },
    mainRisks,
    trainingFocus: [
      "Review high-attempt problems first and extract the first wrong assumption from each one.",
      "For partial-score problems, compare the accepted or best-score code against earlier code to identify missing cases.",
      "Create a small template-risk checklist: integer range, array boundary, initialization, recursion depth, and complexity proof.",
      "Use module representatives to build a personal template library, but keep each template tied to a verified problem.",
    ],
  };
}

function renderMarkdownReport(
  context: AnalysisContext,
  errorCandidates: unknown,
  samples: unknown,
  cspRisk: unknown,
): string {
  const risk = cspRisk as {
    scores: Record<string, number>;
    profile: {
      totalCodeFiles: number;
      totalProblems: number;
      solvedProblems: number;
      unsolvedProblems: number;
      averageAttemptsPerProblem: number;
      solvedRatio: number;
      riskFileRatio: number;
      moduleCoverage: Record<string, number>;
    };
    mainRisks: Array<{ name: string; level: string; evidence: string }>;
    trainingFocus: string[];
  };
  const error = errorCandidates as Record<string, unknown[]>;
  const review = samples as Record<string, unknown>;
  const topModules = MODULE_ORDER.map((name) => ({ name, ...context.modules.summary[name] }))
    .filter((item) => item.fileCount > 0)
    .sort((a, b) => b.problemCount - a.problemCount)
    .slice(0, 12);
  const topRisks = Object.entries(context.metrics.summary.riskFlagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  const recentFiles = Array.isArray(review.recentCodes) ? review.recentCodes.slice(0, 8) : [];

  return [
    "# 本地洛谷代码文件分析报告",
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 1. 总览",
    "",
    `- 代码文件：${context.manifest.supportedFiles}`,
    `- 题目数：${context.timeline.totalProblems}`,
    `- 已 AC 题目：${context.timeline.summary.solvedProblems}`,
    `- 未 AC/未知题目：${context.timeline.summary.unsolvedProblems}`,
    `- 平均每题提交次数：${context.timeline.summary.averageAttemptsPerProblem}`,
    `- 平均非空代码行数：${context.metrics.summary.avgNonEmptyLineCount}`,
    `- 静态风险文件数：${context.metrics.summary.filesWithRisk}`,
    "",
    "这份报告没有把全部源码直接交给模型读，而是先抽取 manifest、静态指标、题目时间线、算法模块和候选风险，再挑选深度复盘样本。这样能保留全量统计，同时把人工/LLM 深读集中在最值得看的代码上。",
    "",
    "## 2. CSP-S 风险画像",
    "",
    `- T1 稳定拿分能力：${risk.scores.t1Stability}`,
    `- T2 建模与转化能力：${risk.scores.t2Solving}`,
    `- T3 部分分策略：${risk.scores.t3Partial}`,
    `- T4 综合策略：${risk.scores.t4Strategy}`,
    `- 综合分：${risk.scores.overall}`,
    "",
    ...risk.mainRisks.map((item) => `- ${item.name}：${item.level}。${item.evidence}`),
    "",
    "## 3. 算法模块分布",
    "",
    "| 模块 | 文件数 | 题目数 | AC题目数 | 平均提交 | 代表题目 |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...topModules.map(
      (item) =>
        `| ${item.name} | ${item.fileCount} | ${item.problemCount} | ${item.acProblemCount} | ${item.avgAttempts} | ${item.representativeProblems.slice(0, 5).join(", ")} |`,
    ),
    "",
    "## 4. 高频静态风险",
    "",
    ...topRisks.map(([flag, count]) => `- ${flag}：${count}`),
    "",
    "## 5. 提交流程问题候选",
    "",
    `- 多次失败后 AC：${context.timeline.summary.tagCounts.MULTI_FAIL_THEN_AC ?? 0}`,
    `- 有 WA 后 AC：${context.timeline.summary.tagCounts.WA_THEN_AC ?? 0}`,
    `- 有 TLE 后 AC：${context.timeline.summary.tagCounts.TLE_THEN_AC ?? 0}`,
    `- 有 RE 后 AC：${context.timeline.summary.tagCounts.RE_THEN_AC ?? 0}`,
    `- 疑似卡题：${context.timeline.summary.tagCounts.STUCK_PROBLEM ?? 0}`,
    `- 部分分题目：${context.timeline.summary.tagCounts.PARTIAL_SCORE ?? 0}`,
    "",
    `候选详情已经写入 \`error_pattern_candidates.json\`。其中 longCodeRisks=${(error.longCodeRisks ?? []).length}，deepNestingRisks=${(error.deepNestingRisks ?? []).length}，integerRisks=${(error.integerRisks ?? []).length}，arrayBoundaryRisks=${(error.arrayBoundaryRisks ?? []).length}。`,
    "",
    "## 6. 建议优先复盘样本",
    "",
    "优先顺序：高提交次数题目、多次失败后 AC、长期未 AC、长代码/深嵌套、各算法模块代表代码、最近提交代码。",
    "",
    "最近提交样本：",
    "",
    ...recentFiles.map((item) => {
      const row = item as { problemPid?: string; result?: string; score?: number | null; submitTime?: string; filePath?: string };
      return `- ${row.problemPid ?? "UNKNOWN"} ${row.result ?? "UNKNOWN"} ${row.score ?? ""} ${row.submitTime ?? ""}：${row.filePath ?? ""}`;
    }),
    "",
    "完整样本清单见 `deep_review_samples.json`。",
    "",
    "## 7. 训练建议",
    "",
    ...risk.trainingFocus.map((item) => `- ${item}`),
    "",
    "## 8. 产物索引",
    "",
    "- `submission_manifest.json`：本地代码清单与洛谷提交元数据",
    "- `code_static_metrics.json`：每份代码的静态特征与风险标记",
    "- `problem_code_timeline.json`：按题聚合的提交时间线",
    "- `algorithm_module_stats.json`：算法模块识别与覆盖统计",
    "- `error_pattern_candidates.json`：错误模式候选",
    "- `deep_review_samples.json`：建议深度复盘样本",
    "- `csp_s_risk_profile.json`：CSP-S 风险画像",
    "",
  ].join("\n");
}

function buildTimelineTags(attempts: TimelineAttempt[], bestScore: number | null): string[] {
  const tags: string[] = [];
  const solved = attempts.some((attempt) => attempt.result === "AC");
  const firstAcIndex = attempts.findIndex((attempt) => attempt.result === "AC");
  const beforeAc = firstAcIndex >= 0 ? attempts.slice(0, firstAcIndex) : attempts;
  const failedBeforeAc = beforeAc.filter((attempt) => isFailedResult(attempt.result));

  if (attempts.length === 1 && solved) tags.push("ONE_SHOT_AC");
  if (solved && failedBeforeAc.length > 0) tags.push("MULTI_FAIL_THEN_AC");
  if (solved && beforeAc.some((attempt) => attempt.result === "WA")) tags.push("WA_THEN_AC");
  if (solved && beforeAc.some((attempt) => attempt.result === "TLE")) tags.push("TLE_THEN_AC");
  if (solved && beforeAc.some((attempt) => attempt.result === "RE")) tags.push("RE_THEN_AC");
  if (!solved) tags.push("NEVER_AC");
  if ((bestScore ?? 0) > 0 && (bestScore ?? 0) < 100) tags.push("PARTIAL_SCORE");
  if (!solved && attempts.length >= 3) tags.push("STUCK_PROBLEM");
  if (attempts.some((attempt) => attempt.nonEmptyLineCount >= 180)) tags.push("LONG_CODE_PROBLEM");
  if (attempts.some((attempt) => attempt.maxBraceDepth >= 8)) tags.push("DEEP_NESTING_PROBLEM");
  return tags;
}

function summarizeProblem(item: ProblemTimelineItem) {
  return {
    problemPid: item.problemPid,
    problemTitle: item.problemTitle,
    attemptCount: item.attemptCount,
    acCount: item.acCount,
    bestScore: item.bestScore,
    finalResult: item.finalResult,
    finalScore: item.finalScore,
    firstSubmitTime: item.firstSubmitTime,
    lastSubmitTime: item.lastSubmitTime,
    tags: item.tags,
    files: item.attempts.slice(-5).map((attempt) => ({
      filePath: attempt.filePath,
      result: attempt.result,
      score: attempt.score,
      submitTime: attempt.submitTime,
      riskFlags: attempt.riskFlags,
    })),
  };
}

function summarizeMetric(item: CodeStaticMetric) {
  return {
    filePath: item.filePath,
    problemPid: item.problemPid,
    recordId: item.recordId,
    result: item.result,
    score: item.score,
    nonEmptyLineCount: item.nonEmptyLineCount,
    maxLineLength: item.maxLineLength,
    maxBraceDepth: item.maxBraceDepth,
    nestedLoopDepth: item.nestedLoopDepth,
    functionCount: item.functionCount,
    riskFlags: item.riskFlags,
  };
}

async function listCodeFiles(root: string): Promise<string[]> {
  const output: string[] = [];
  const stack = [path.resolve(root)];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
      } else if (entry.isFile() && CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        output.push(absolutePath);
      }
    }
  }

  return output.sort((a, b) => a.localeCompare(b));
}

async function loadIndexMap(indexPath: string): Promise<Map<string, LuoguIndexItem>> {
  if (!(await exists(indexPath))) return new Map();
  const data = await readJson<LuoguIndexItem[]>(indexPath);
  const map = new Map<string, LuoguIndexItem>();
  for (const item of data) {
    const codePath = stringOrNull(item.codePath);
    if (codePath) map.set(normalizePathKey(codePath), item);
  }
  return map;
}

function parseFileName(fileName: string) {
  const base = path.basename(fileName, path.extname(fileName));
  const parts = base.split("_");
  const recordId = /^\d+$/.test(parts[0] ?? "") ? parts[0] : null;
  const problemPid = parts.find((part) => /^(?:P|B|U|T)\d{3,8}[A-Z]?$/i.test(part) || /^CF\d+[A-Z]\d*$/i.test(part)) ?? null;
  const result = normalizeResult(parts.find((part) => RESULT_VALUES.has(part as JudgeResult)) ?? null);
  const scorePart = parts.find((part) => /^\d{1,3}$/.test(part));
  const score = scorePart ? Number(scorePart) : null;
  const datePart = parts.find((part) => /^\d{4}-\d{2}-\d{2}/.test(part));

  return {
    recordId,
    problemPid,
    result,
    score,
    submitTime: datePart ?? null,
  };
}

function languageFromExtension(ext: string): string {
  if (ext === ".c") return "C";
  if (ext === ".py") return "Python";
  if (ext === ".txt") return "Text/Other";
  if (ext === ".h" || ext === ".hpp") return "C/C++ Header";
  return "C++";
}

function stripCommentsAndStrings(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (match) => "\n".repeat(match.split("\n").length - 1))
    .replace(/\/\/.*$/gm, "")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

function countCommentLines(lines: string[]): number {
  let inBlock = false;
  let count = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (inBlock) {
      count += 1;
      if (trimmed.includes("*/")) inBlock = false;
      continue;
    }
    if (trimmed.startsWith("//")) count += 1;
    if (trimmed.includes("/*")) {
      count += 1;
      if (!trimmed.includes("*/")) inBlock = true;
    }
  }

  return count;
}

function calculateMaxBraceDepth(code: string): number {
  let depth = 0;
  let maxDepth = 0;
  for (const char of code) {
    if (char === "{") {
      depth += 1;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === "}") {
      depth = Math.max(0, depth - 1);
    }
  }
  return maxDepth;
}

function calculateNestedLoopDepth(lines: string[]): number {
  let braceDepth = 0;
  let maxLoopDepth = 0;
  const loopStack: number[] = [];

  for (const line of lines) {
    while (loopStack.length > 0 && braceDepth < (loopStack[loopStack.length - 1] ?? 0)) loopStack.pop();
    if (/\b(for|while)\s*\(|\bdo\s*\{/.test(line)) {
      loopStack.push(braceDepth + 1);
      maxLoopDepth = Math.max(maxLoopDepth, loopStack.length);
    }
    for (const char of line) {
      if (char === "{") braceDepth += 1;
      if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
    }
  }

  return maxLoopDepth;
}

function detectGlobalArray(code: string): boolean {
  return countGlobalArrays(code) > 0;
}

function countGlobalArrays(code: string): number {
  const beforeMain = code.split(/\bint\s+main\s*\(/)[0] ?? code;
  return countRegex(beforeMain, /^\s*(?:const\s+)?(?:int|long\s+long|double|char|bool|string)\s+\w+\s*\[[^\]]+\]/gm);
}

function countGlobalVectors(code: string): number {
  const beforeMain = code.split(/\bint\s+main\s*\(/)[0] ?? code;
  return countRegex(beforeMain, /^\s*vector\s*<[^>]+>\s+\w+/gm);
}

function detectRecursion(code: string, functionNames: string[]): boolean {
  const ignored = new Set(["main", "sort", "max", "min", "swap", "read", "write"]);
  for (const name of new Set(functionNames.filter((item) => !ignored.has(item)))) {
    const declarationPattern = new RegExp(`\\b${escapeRegExp(name)}\\s*\\([^;{}]*\\)\\s*(?:const\\s*)?\\{`);
    const callPattern = new RegExp(`\\b${escapeRegExp(name)}\\s*\\(`, "g");
    const calls = countRegex(code, callPattern);
    if (declarationPattern.test(code) && calls >= 2) return true;
  }
  return false;
}

function collectFunctionNames(lines: string[]): string[] {
  const names: string[] = [];
  const controlKeywords = new Set(["if", "for", "while", "switch", "catch"]);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.includes("(") || !trimmed.includes("{") || trimmed.endsWith(";")) continue;
    const match = trimmed.match(/\b([A-Za-z_]\w*)\s*\([^;{}]*\)\s*(?:const\s*)?\{/);
    const name = match?.[1];
    if (name && !controlKeywords.has(name)) names.push(name);
  }

  return names;
}

function countRegex(text: string, regex: RegExp): number {
  return [...text.matchAll(regex)].length;
}

function countRiskFlags(items: CodeStaticMetric[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    for (const flag of item.riskFlags) counts[flag] = (counts[flag] ?? 0) + 1;
  }
  return counts;
}

function createEmptyModuleSummary(): AlgorithmModuleStatsFile["summary"] {
  const summary = {} as AlgorithmModuleStatsFile["summary"];
  for (const name of MODULE_ORDER) {
    summary[name] = {
      fileCount: 0,
      problemCount: 0,
      acProblemCount: 0,
      avgAttempts: 0,
      representativeProblems: [],
    };
  }
  return summary;
}

function compareManifestItems(a: SubmissionManifestItem, b: SubmissionManifestItem): number {
  const timeCompare = compareNullableTime(a.submitTime, b.submitTime);
  if (timeCompare !== 0) return timeCompare;
  const recordCompare = Number(a.recordId ?? 0) - Number(b.recordId ?? 0);
  if (recordCompare !== 0) return recordCompare;
  return a.filePath.localeCompare(b.filePath);
}

function compareNullableTime(a: string | null | undefined, b: string | null | undefined): number {
  const at = a ? Date.parse(a) : Number.NaN;
  const bt = b ? Date.parse(b) : Number.NaN;
  if (Number.isFinite(at) && Number.isFinite(bt)) return at - bt;
  if (Number.isFinite(at)) return -1;
  if (Number.isFinite(bt)) return 1;
  return 0;
}

function bestScoreOf(attempts: TimelineAttempt[]): number | null {
  const scores = attempts.map((attempt) => attempt.score).filter((value): value is number => typeof value === "number");
  if (scores.length === 0) return null;
  return Math.max(...scores);
}

function isFailedResult(result: JudgeResult): boolean {
  return ["WA", "TLE", "RE", "CE", "MLE", "OLE", "UKE", "PC", "UNKNOWN"].includes(result);
}

function inferIndexPath(input: string): string | null {
  const candidate = path.join(path.dirname(path.resolve(input)), "code_files_index.json");
  return candidate;
}

function normalizeResult(value: string | null | undefined): JudgeResult {
  const upper = (value ?? "UNKNOWN").trim().toUpperCase();
  return RESULT_VALUES.has(upper as JudgeResult) ? (upper as JudgeResult) : "UNKNOWN";
}

function normalizeDateString(value: string | null): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizePathKey(filePath: string): string {
  return path.resolve(filePath).toLowerCase();
}

function countBy<T>(items: T[], picker: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = picker(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function avg(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function max(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) return 0;
  return Math.max(...filtered);
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clampScore(value: number): number {
  return round(Math.max(0, Math.min(100, value)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
