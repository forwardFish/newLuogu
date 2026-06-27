import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;

type MetadataItem = {
  title: string;
  tags: string[];
  difficulty: number | null;
  cspSlot: "T1" | "T2" | "T3" | "T4" | "UNKNOWN";
  abilities: string[];
  phase: string;
  source: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  evidence: string[];
};

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "problem-metadata");
const OUT_JSON = path.join(OUT_DIR, "problem_knowledge_map.json");
const OUT_REPORT = path.join(OUT_DIR, "problem_knowledge_map_report.md");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const [vectorsFile, timelineFile, existing] = await Promise.all([
    readJson<Obj>("data/diagnosis/problem_feature_vectors.json", {}),
    readJson<Obj>("data/analysis/problem_code_timeline.json", {}),
    readJson<Obj>("data/problem-metadata/problem_knowledge_map.json", {}),
  ]);
  const vectors = arrayOfObjects(vectorsFile.items);
  const timeline = arrayOfObjects(timelineFile.items);
  const map: Record<string, MetadataItem> = {};

  for (const item of timeline) {
    const pid = getPid(item);
    if (!pid) continue;
    map[pid] = mergeItem(map[pid], inferFromProblem(item, "timeline"));
  }

  for (const vector of vectors) {
    const pid = getPid(vector);
    if (!pid) continue;
    map[pid] = mergeItem(map[pid], inferFromProblem(vector, "feature_vector"));
  }

  for (const [pid, value] of Object.entries(existing)) {
    if (pid.startsWith("$")) continue;
    map[pid] = mergeItem(map[pid], normalizeExisting(value as Obj));
  }

  const output = {
    $schema: "csps200.problemKnowledgeMap.v1",
    $generatedAt: new Date().toISOString(),
    $source: "scripts/csps200-build-problem-metadata.ts",
    ...Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b))),
  };
  await writeJson(OUT_JSON, output);
  await fs.writeFile(OUT_REPORT, renderReport(map), "utf8");
  console.log(JSON.stringify({ problems: Object.keys(map).length, json: rel(OUT_JSON), report: rel(OUT_REPORT) }, null, 2));
}

function inferFromProblem(item: Obj, source: string): MetadataItem {
  const title = getString(item, "title") || getString(item, "problemTitle") || getString(item, "name") || "";
  const rawTags = unique([
    ...strings(item.tags),
    ...strings(item.luoguTags),
    ...strings(item.codeModules),
    getString(item, "primaryModule"),
    getString(item, "difficultyBand"),
  ].filter(Boolean));
  const tags = normalizeTags(rawTags);
  const abilities = unique([
    ...strings(item.abilities),
    ...strings(item.cspAbilityRoles),
    ...tags.map(tagToAbility).flat(),
  ].filter(Boolean));
  const difficulty = getNumber(item, "luoguDifficulty") || getNumber(item, "difficulty") || null;
  const slot = inferSlot({ tags, abilities, difficulty, item });
  return {
    title,
    tags,
    difficulty,
    cspSlot: slot,
    abilities: unique([...abilities, slot === "UNKNOWN" ? "" : `${slot}_INFERRED`].filter(Boolean)),
    phase: inferPhase(slot, difficulty),
    source,
    confidence: inferConfidence(item, difficulty, tags, slot),
    evidence: buildEvidence(item, tags, slot),
  };
}

function normalizeExisting(item: Obj): MetadataItem {
  const slot = normalizeSlot(getString(item, "cspSlot"));
  return {
    title: getString(item, "title"),
    tags: normalizeTags([...strings(item.tags), ...strings(item.luoguTags)]),
    difficulty: getNumber(item, "difficulty") || getNumber(item, "luoguDifficulty") || null,
    cspSlot: slot,
    abilities: unique([...strings(item.abilities), ...strings(item.cspAbilityRoles)]),
    phase: getString(item, "phase") || inferPhase(slot, getNumber(item, "difficulty")),
    source: getString(item, "source") || "manual",
    confidence: normalizeConfidence(getString(item, "confidence")) || "HIGH",
    evidence: strings(item.evidence),
  };
}

function mergeItem(a: MetadataItem | undefined, b: MetadataItem): MetadataItem {
  if (!a) return b;
  const confidence = rankConfidence(a.confidence) >= rankConfidence(b.confidence) ? a.confidence : b.confidence;
  return {
    title: a.title || b.title,
    tags: unique([...a.tags, ...b.tags]),
    difficulty: a.difficulty ?? b.difficulty,
    cspSlot: a.cspSlot !== "UNKNOWN" ? a.cspSlot : b.cspSlot,
    abilities: unique([...a.abilities, ...b.abilities]),
    phase: a.phase || b.phase,
    source: unique([a.source, b.source]).join("+"),
    confidence,
    evidence: unique([...a.evidence, ...b.evidence]).slice(0, 10),
  };
}

function normalizeTags(tags: string[]) {
  const out: string[] = [];
  for (const tag of tags) {
    const text = tag.toLowerCase();
    if (/dp|dynamic|状态|递推/.test(text)) out.push("dp");
    else if (/graph|tree|dfs|bfs|shortest|tarjan|图|树/.test(text)) out.push("graph");
    else if (/binary|二分/.test(text)) out.push("binary_search");
    else if (/greedy|贪心/.test(text)) out.push("greedy");
    else if (/data_structure|segment|fenwick|heap|dsu|set|map|结构|并查/.test(text)) out.push("data_structure");
    else if (/math|number|gcd|组合|数学/.test(text)) out.push("math");
    else if (/string|kmp|trie|字符串/.test(text)) out.push("string");
    else if (/partial|subtask|部分分/.test(text)) out.push("partial_score");
    else if (/implementation|simulation|basic|模拟|枚举|排序/.test(text)) out.push("implementation");
    else if (text) out.push(text.replace(/\s+/g, "_"));
  }
  return unique(out);
}

function tagToAbility(tag: string) {
  const map: Record<string, string[]> = {
    implementation: ["IMPLEMENTATION", "T1_STABILITY"],
    binary_search: ["T2_MODELING", "COMPLEXITY"],
    greedy: ["T2_MODELING", "COMPLEXITY"],
    dp: ["STATE_DESIGN", "T2_MODELING", "T3_PARTIAL_SCORE"],
    graph: ["GRAPH_MODELING", "T2_MODELING"],
    data_structure: ["DATA_STRUCTURE", "T2_MODELING"],
    partial_score: ["T3_PARTIAL_SCORE"],
    math: ["MATH_REASONING"],
    string: ["STRING_MODELING"],
  };
  return map[tag] ?? [];
}

function inferSlot(input: { tags: string[]; abilities: string[]; difficulty: number | null; item: Obj }): MetadataItem["cspSlot"] {
  const explicit = normalizeSlot(getString(input.item, "cspSlot"));
  if (explicit !== "UNKNOWN") return explicit;
  const text = `${input.tags.join(" ")} ${input.abilities.join(" ")} ${strings(input.item.cspAbilityRoles).join(" ")}`.toUpperCase();
  if (text.includes("T4")) return "T4";
  if (text.includes("T3") || text.includes("PARTIAL")) return "T3";
  if (text.includes("T2") || /DP|GRAPH|BINARY|GREEDY|DATA_STRUCTURE/.test(text)) return "T2";
  if (text.includes("T1") || text.includes("IMPLEMENTATION")) return "T1";
  if (input.difficulty !== null) {
    if (input.difficulty <= 1300) return "T1";
    if (input.difficulty <= 1900) return "T2";
    if (input.difficulty <= 2600) return "T3";
    return "T4";
  }
  return "UNKNOWN";
}

function inferPhase(slot: string, difficulty: number | null) {
  if (slot === "T1") return "104_TO_120";
  if (slot === "T2") return difficulty && difficulty >= 1700 ? "140_TO_160" : "120_TO_140";
  if (slot === "T3") return "160_TO_180";
  if (slot === "T4") return "180_TO_200";
  return "UNKNOWN";
}

function inferConfidence(item: Obj, difficulty: number | null, tags: string[], slot: string): MetadataItem["confidence"] {
  let score = 0;
  if (getString(item, "problemTitle") || getString(item, "title")) score += 1;
  if (tags.length) score += 1;
  if (difficulty !== null) score += 1;
  if (slot !== "UNKNOWN") score += 1;
  if (strings(item.luoguTags).length) score += 1;
  return score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW";
}

function buildEvidence(item: Obj, tags: string[], slot: string) {
  return unique([
    getString(item, "problemTitle") ? `title:${getString(item, "problemTitle")}` : "",
    tags.length ? `tags:${tags.join(",")}` : "",
    slot !== "UNKNOWN" ? `slot:${slot}` : "",
    getString(item, "scorePattern") ? `scorePattern:${getString(item, "scorePattern")}` : "",
  ].filter(Boolean));
}

function renderReport(map: Record<string, MetadataItem>) {
  const items = Object.entries(map);
  const bySlot = countBy(items.map(([, item]) => item.cspSlot));
  const byConfidence = countBy(items.map(([, item]) => item.confidence));
  return [
    "# CSP-S 题目元数据映射报告",
    "",
    `生成时间：${new Date().toISOString()}`,
    `题目数量：${items.length}`,
    "",
    "## 按题位统计",
    "",
    ...Object.entries(bySlot).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## 按置信度统计",
    "",
    ...Object.entries(byConfidence).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## 低置信度题目 Top 30",
    "",
    ...items.filter(([, item]) => item.confidence === "LOW").slice(0, 30).map(([pid, item]) => `- ${pid} ${item.title || ""} | ${item.cspSlot} | ${item.tags.join(",")}`),
    "",
  ].join("\n");
}

function normalizeSlot(value: string): MetadataItem["cspSlot"] {
  const upper = value.toUpperCase();
  return ["T1", "T2", "T3", "T4"].includes(upper) ? upper as MetadataItem["cspSlot"] : "UNKNOWN";
}
function normalizeConfidence(value: string): MetadataItem["confidence"] | null {
  const upper = value.toUpperCase();
  return ["LOW", "MEDIUM", "HIGH"].includes(upper) ? upper as MetadataItem["confidence"] : null;
}
function rankConfidence(value: MetadataItem["confidence"]) { return value === "HIGH" ? 3 : value === "MEDIUM" ? 2 : 1; }
async function readJson<T>(relativePath: string, fallback: T): Promise<T> { try { return JSON.parse(await fs.readFile(path.join(ROOT, relativePath), "utf8")) as T; } catch { return fallback; } }
async function writeJson(filePath: string, value: unknown) { await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function arrayOfObjects(value: unknown): Obj[] { return Array.isArray(value) ? value.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Obj[] : []; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.length > 0) : []; }
function getPid(item: Obj) { return getString(item, "problemPid") || getString(item, "pid") || getString(item, "problemId") || getString(item, "luoguPid"); }
function getString(item: Obj, key: string) { const v = item?.[key]; return typeof v === "string" ? v : typeof v === "number" ? String(v) : ""; }
function getNumber(item: Obj, key: string) { const v = item?.[key]; return typeof v === "number" ? v : typeof v === "string" && Number.isFinite(Number(v)) ? Number(v) : 0; }
function unique<T>(values: T[]) { return [...new Set(values.filter(Boolean))]; }
function countBy(values: string[]) { const out: Record<string, number> = {}; for (const v of values) out[v] = (out[v] ?? 0) + 1; return out; }
function rel(filePath: string) { return path.relative(ROOT, filePath); }
