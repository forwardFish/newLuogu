import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;
type Cand = { pid: string; title: string; source: string; tags: string[]; abilities: string[]; slot: string; difficulty: number; raw: Obj };

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");
const args = parseArgs(process.argv.slice(2));

main().catch((error) => { console.error(error); process.exit(1); });

async function main() {
  await mkdir(LOCAL);
  const config = await readJson<Obj>(path.join(LOCAL, "config.json"), {});
  const student = await readJson<Obj>(path.join(LOCAL, "student_analysis_report.json"), {});
  const quality = await readJson<Obj>(path.join(LOCAL, "analysis_quality_report.json"), {});
  const dataQuality = str(quality, "dataQuality.overall") || str(student, "sourceQuality.overall") || "LOW";

  if (dataQuality === "LOW") {
    const block = lowBlock(student, quality);
    await writeJson(path.join(LOCAL, "data_quality_block.json"), block);
    await fs.writeFile(path.join(LOCAL, "data_quality_block.md"), renderBlock(block), "utf8");
    console.log(JSON.stringify({ status: "BLOCKED_LOW_DATA_QUALITY", file: rel(path.join(LOCAL, "data_quality_block.md")) }, null, 2));
    return;
  }

  const candidates = mergeMeta(await loadCandidates(config), await loadMeta());
  const today = selectToday(config, student, dataQuality, candidates);
  await writeJson(path.join(LOCAL, "today.json"), today);
  await fs.writeFile(path.join(LOCAL, "today.md"), renderToday(today), "utf8");
  console.log(JSON.stringify({ status: "OK", mode: today.mode, tasks: arr(today.tasks).length, files: [rel(path.join(LOCAL, "today.json")), rel(path.join(LOCAL, "today.md"))] }, null, 2));
}

function selectToday(config: Obj, student: Obj, dataQuality: string, candidates: Cand[]) {
  const weak = objs(student.knowledgeMastery).filter((x) => num(x, "score") < 65);
  const evidence = objs(student.evidenceProblems);
  const stage = rec(student.currentStage);
  const score = num(student, "scoreEstimate.estimatedCurrentScore");
  const targetScore = num(rec(student.target), "targetScore") || num(config, "targetScore") || 200;
  const mode = dataQuality === "MEDIUM" ? "MEDIUM_CONSERVATIVE" : "HIGH_STANDARD";
  const requested = Number(args.count || 0);
  const taskCount = clamp(requested || (dataQuality === "MEDIUM" ? 3 : score >= 150 ? 4 : 3), dataQuality === "MEDIUM" ? 2 : 3, dataQuality === "HIGH" ? 4 : 3);
  const used = new Set<string>();
  const picked: any[] = [];

  const foundation = pick(candidates, used, (c) => (c.slot === "T1" ? 60 : 0) + (has(c, ["implementation", "simulation", "basic", "模拟", "枚举"]) ? 25 : 0) + (c.difficulty && c.difficulty <= 1400 ? 10 : 0));
  picked.push(task(1, "foundation", "T1", foundation, `当前阶段 ${str(stage, "stage") || "未知"}，先保证保分题稳定。`, 35));
  mark(used, foundation);

  const weakness = pickWeak(candidates, used, weak[0]);
  if (taskCount >= 3 || dataQuality === "HIGH") {
    picked.push(task(picked.length + 1, "weakness", slotOf(weakness, "T2"), weakness, weak[0] ? `最大短板：${str(weak[0], "name")}，掌握度 ${num(weak[0], "score")}。` : "训练当前最大短板。", 55));
    mark(used, weakness);
  }

  const review = pickEvidence(candidates, used, evidence[0]);
  picked.push(task(picked.length + 1, "reviewOrTransfer", slotOf(review, "T2"), review, evidence[0] ? `证据题：${str(evidence[0], "reason") || str(evidence[0], "diagnosis")}` : "复盘/迁移题。", 45));
  mark(used, review);

  if (taskCount >= 4) {
    const partial = pick(candidates, used, (c) => (["T3", "T4"].includes(c.slot) ? 40 : 0) + (has(c, ["partial", "部分分", "dp", "tree", "segment"]) ? 20 : 0) + (c.difficulty >= 1800 ? 10 : 0));
    picked.push(task(picked.length + 1, "partialOrMock", slotOf(partial, "T3"), partial, "第 4 题用于 T3 部分分或四题结构验证。", 70));
  }

  return {
    version: "csps200-task-selector-v1",
    generatedAt: new Date().toISOString(),
    mode,
    dataQuality,
    targetScore,
    currentStage: student.currentStage || null,
    slotReadiness: student.slotReadiness || null,
    weakestKnowledge: weak.slice(0, 5),
    evidenceProblems: evidence.slice(0, 5),
    selectionInputs: { candidateCount: candidates.length, weakKnowledgeCount: weak.length, evidenceProblemCount: evidence.length },
    taskPolicy: {
      dynamicTaskRange: dataQuality === "MEDIUM" ? [2, 3] : [3, 4],
      mediumStrategy: "保守训练：优先保分题、证据题和最大短板题，减少新题和高难题。",
      highStrategy: "标准训练：保分题 + 短板题 + 复盘/迁移题，必要时加入第 4 题模拟/部分分训练。",
      noPreSolveHint: true
    },
    tasks: picked,
  };
}

function task(order: number, role: string, slot: string, c: Cand | null, reason: string, duration: number) {
  const pid = c?.pid || "";
  return {
    order,
    role,
    targetSlot: slot,
    problemPid: pid || null,
    title: c?.title || null,
    source: c?.source || "fallback",
    reason,
    goal: goal(role, slot),
    durationMinutes: duration,
    requiredLogFields: ["problemPid", "result", "score", "timeMinutes", "submissionCount", "hintLevelUsed", "hasSeenSolution", "failedStage", "studentSummary", "needRedo"],
    noPreSolveHintPolicy: "做题前不提示算法名、模型名、关键转化、状态定义或具体数据结构；做完后再做 AI 证据分析。",
    logCommandTemplate: `pnpm csps200:log -- --problemPid ${pid || "Pxxxx"} --unitId UNKNOWN_UNIT --taskType ${role.toUpperCase()} --result AC --score 100 --timeMinutes ${duration} --submissionCount 1 --hintLevelUsed 0 --hasSeenSolution false --failedStage NONE --studentSummary "独立完成" --needRedo false`
  };
}

function goal(role: string, slot: string) {
  if (role === "foundation") return `${slot} 保分稳定性：限时完成，重点记录边界、初始化、数据范围和提交次数。`;
  if (role === "weakness") return "当前最大短板训练：先独立读题、写暴力和复杂度，不提前看题解。";
  if (role === "reviewOrTransfer") return "复盘/迁移证据题：验证是否摆脱旧错误，不能只看是否 AC。";
  return `${slot} 部分分或模拟结构验证：目标是写出可执行低分路线和止损策略。`;
}

function pickWeak(cands: Cand[], used: Set<string>, weak: Obj | undefined) {
  const terms = [str(weak, "code"), str(weak, "name")].filter(Boolean).map((x) => x.toLowerCase());
  return pick(cands, used, (c) => (c.slot === "T2" ? 20 : 0) + terms.reduce((s, t) => s + (text(c).includes(t) ? 45 : 0), 0) + (has(c, ["dp", "graph", "binary", "greedy", "data_structure", "动态规划", "图", "二分", "贪心"]) ? 15 : 0));
}

function pickEvidence(cands: Cand[], used: Set<string>, ev: Obj | undefined) {
  const pid = str(ev, "problemPid");
  if (pid && !used.has(pid)) {
    const found = cands.find((c) => c.pid === pid);
    return found || cand({ problemPid: pid, title: str(ev, "title"), abilities: [str(ev, "relatedAbility")], cspSlot: abilitySlot(str(ev, "relatedAbility")) }, "student_analysis_report.evidenceProblems");
  }
  return pick(cands, used, (c) => c.source.includes("daily") ? 20 : 0);
}

function pick(cands: Cand[], used: Set<string>, score: (c: Cand) => number) {
  return cands.filter((c) => c.pid && !used.has(c.pid)).map((c) => ({ c, s: score(c) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0]?.c || null;
}

function mark(used: Set<string>, c: Cand | null) { if (c?.pid) used.add(c.pid); }
function slotOf(c: Cand | null, fallback: string) { return c?.slot || fallback; }
function has(c: Cand, keys: string[]) { const t = text(c); return keys.some((k) => t.includes(k.toLowerCase())); }
function text(c: Cand) { return `${c.pid} ${c.title} ${c.tags.join(" ")} ${c.abilities.join(" ")} ${c.slot}`.toLowerCase(); }

async function loadCandidates(config: Obj) {
  const out: Cand[] = [];
  out.push(...await loadJsonDir(str(config, "problemLaddersDir") || "data/problem-ladders", "problem_ladders"));
  out.push(...await loadJsonDir(str(config, "problemBankDir") || "data/problem-bank", "problem_bank"));
  const daily = await readJson<Obj>(path.join(str(config, "trainingDir") || "data/training", "daily_training_plan.json"), {});
  out.push(...objects(daily).filter((x) => pid(x)).map((x) => cand(x, "daily_training_plan")));
  return dedupe(out);
}

async function loadJsonDir(dir: string, source: string) {
  const files = await jsonFiles(path.resolve(dir));
  const out: Cand[] = [];
  for (const file of files) {
    const data = await readJson<Obj>(file, {});
    out.push(...objects(data).filter((x) => pid(x)).map((x) => cand(x, source)));
  }
  return out;
}

async function loadMeta() {
  const files = [path.join(ROOT, "data/problem-metadata/problem_knowledge_map.json"), path.join(ROOT, "config/problem_knowledge_map.example.json")];
  const map: Record<string, Obj> = {};
  for (const file of files) {
    const data = await readJson<Obj>(file, {});
    for (const [k, v] of Object.entries(data)) if (!k.startsWith("$")) map[k] = { ...rec(map[k]), ...rec(v), problemPid: k };
  }
  return map;
}

function mergeMeta(cands: Cand[], meta: Record<string, Obj>) {
  const out = [...cands];
  for (const [p, m] of Object.entries(meta)) {
    const existing = out.find((c) => c.pid === p);
    if (existing) {
      existing.tags = uniq([...existing.tags, ...strings(m.tags)]);
      existing.abilities = uniq([...existing.abilities, ...strings(m.abilities)]);
      existing.slot = existing.slot || str(m, "cspSlot");
      existing.difficulty = existing.difficulty || num(m, "difficulty");
      existing.source += "+metadata";
    } else out.push(cand(m, "metadata"));
  }
  return dedupe(out);
}

function cand(o: Obj, source: string): Cand {
  return { pid: pid(o), title: str(o, "title") || str(o, "problemTitle"), source, tags: uniq([...strings(o.tags), ...strings(o.luoguTags), str(o, "knowledgeCode")]), abilities: uniq([...strings(o.abilities), ...strings(o.cspAbilityRoles), str(o, "relatedAbility")]), slot: str(o, "cspSlot") || abilitySlot(`${strings(o.abilities).join(" ")} ${strings(o.cspAbilityRoles).join(" ")} ${str(o, "relatedAbility")}`), difficulty: num(o, "difficulty") || num(o, "luoguDifficulty"), raw: o };
}

function abilitySlot(s: string) { const u = s.toUpperCase(); return u.includes("T1") ? "T1" : u.includes("T2") ? "T2" : u.includes("T3") ? "T3" : u.includes("T4") ? "T4" : ""; }
function pid(o: Obj) { return str(o, "problemPid") || str(o, "pid") || str(o, "problemId") || str(o, "luoguPid"); }

function lowBlock(student: Obj, quality: Obj) { return { generatedAt: new Date().toISOString(), reason: "analysis quality is LOW", fixes: uniq(["确认 codeDir/codeIndex 指向最新洛谷源码导出。", "重新执行 pnpm csps200:diagnose。", "补齐题目元数据 problem_knowledge_map.json。", ...objs(quality.passCriteria).filter((x) => x.passed === false).map((x) => `未通过检查：${str(x, "criterion")}`), ...arr(pathGet(student, "sourceQuality.mainLimitations")).map(String)]) }; }
function renderBlock(b: Obj) { return ["# 数据质量 LOW，今日任务已阻断", "", ...arr(b.fixes).map((x) => `- ${String(x)}`), "", "```bash", "pnpm csps200:diagnose", "pnpm csps200:select-today", "```", ""].join("\n"); }
function renderToday(t: Obj) { return ["# CSP-S 200 今日分析驱动训练", "", `模式：${str(t, "mode")}`, `数据质量：${str(t, "dataQuality")}`, `目标分：${num(t, "targetScore")}`, "", `当前阶段：${str(t, "currentStage.stage") || "未知"}`, "", "## 今日任务", "", ...objs(t.tasks).flatMap((x) => [`### ${num(x, "order")}. ${str(x, "role")} / ${str(x, "targetSlot")}`, `- 题目：${str(x, "problemPid") || "待人工选择"} ${str(x, "title")}`, `- 来源：${str(x, "source")}`, `- 原因：${str(x, "reason")}`, `- 目标：${str(x, "goal")}`, `- 时间：${num(x, "durationMinutes")} 分钟`, `- 无剧透：${str(x, "noPreSolveHintPolicy")}`, "", "```bash", str(x, "logCommandTemplate"), "```", ""]), "## 必填日志字段", "problemPid / result / score / timeMinutes / submissionCount / hintLevelUsed / hasSeenSolution / failedStage / studentSummary / needRedo", ""].join("\n"); }

async function jsonFiles(dir: string): Promise<string[]> { if (!(await exists(dir))) return []; const out: string[] = []; for (const e of await fs.readdir(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) out.push(...await jsonFiles(p)); else if (e.name.endsWith(".json")) out.push(p); } return out; }
function objects(v: unknown): Obj[] { const out: Obj[] = []; const visit = (x: unknown) => { if (Array.isArray(x)) return x.forEach(visit); const r = rec(x); if (!Object.keys(r).length) return; if (pid(r)) out.push(r); for (const child of Object.values(r)) if (typeof child === "object") visit(child); }; visit(v); return out; }
function dedupe(xs: Cand[]) { const m = new Map<string, Cand>(); for (const x of xs) if (x.pid && !m.has(x.pid)) m.set(x.pid, x); return [...m.values()]; }
function parseArgs(argv: string[]) { const o: Record<string, string> = {}; for (let i = 0; i < argv.length; i++) { const t = argv[i]; if (!t?.startsWith("--")) continue; const [k, v] = t.slice(2).split("=", 2); o[k] = v ?? argv[++i]; } return o; }
async function exists(p: string) { try { await fs.access(path.resolve(p)); return true; } catch { return false; } }
async function mkdir(p: string) { await fs.mkdir(path.resolve(p), { recursive: true }); }
async function readJson<T>(p: string, fb: T): Promise<T> { return await exists(p) ? JSON.parse(await fs.readFile(path.resolve(p), "utf8")) as T : fb; }
async function writeJson(p: string, v: unknown) { await mkdir(path.dirname(p)); await fs.writeFile(path.resolve(p), `${JSON.stringify(v, null, 2)}\n`, "utf8"); }
function rec(v: unknown): Obj { return v && typeof v === "object" && !Array.isArray(v) ? v as Obj : {}; }
function arr(v: unknown): unknown[] { return Array.isArray(v) ? v : []; }
function objs(v: unknown): Obj[] { return arr(v).map(rec).filter((x) => Object.keys(x).length); }
function strings(v: unknown): string[] { return arr(v).filter((x): x is string => typeof x === "string" && x.length > 0); }
function pathGet(v: unknown, k: string): unknown { return k.split(".").reduce((a, b) => rec(a)[b], v); }
function str(v: unknown, k?: string): string { const x = k ? pathGet(v, k) : v; return typeof x === "string" ? x : typeof x === "number" ? String(x) : ""; }
function num(v: unknown, k?: string): number { const x = k ? pathGet(v, k) : v; return typeof x === "number" ? x : typeof x === "string" && Number.isFinite(Number(x)) ? Number(x) : 0; }
function uniq<T>(xs: T[]): T[] { return [...new Set(xs.filter(Boolean))]; }
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }
function rel(p: string) { return path.relative(ROOT, path.resolve(p)) || "."; }
