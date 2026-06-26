import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");

main().catch((error) => { console.error(error); process.exit(1); });

async function main() {
  const config = await readJson<Obj>(path.join(LOCAL, "config.json"), {});
  const files = {
    config: path.join(LOCAL, "config.json"),
    studentAnalysis: path.join(LOCAL, "student_analysis_report.json"),
    analysisQuality: path.join(LOCAL, "analysis_quality_report.json"),
    today: path.join(LOCAL, "today.json"),
    todayMd: path.join(LOCAL, "today.md"),
    trainingLog: path.join(str(config.trainingDir) || "data/training", "training_log.json"),
    attemptAnalysisDir: path.join(LOCAL, "attempt-analysis"),
    dailyAiSummary: path.join(LOCAL, "daily_ai_summary.md"),
    parentWeeklyReport: path.join(LOCAL, "parent_weekly_report.md"),
    problemMetadataExample: path.join(ROOT, "config", "problem_knowledge_map.example.json"),
  };
  const checks: Obj[] = [];
  for (const [name, file] of Object.entries(files)) checks.push({ name, path: rel(file), exists: await exists(file) });
  const student = await readJson<Obj>(files.studentAnalysis, {});
  const quality = await readJson<Obj>(files.analysisQuality, {});
  const today = await readJson<Obj>(files.today, {});
  const log = await readJson<Obj>(files.trainingLog, { items: [] });
  const dataQuality = str(pathGet(quality, "dataQuality.overall")) || str(pathGet(student, "sourceQuality.overall")) || "UNKNOWN";
  const tasks = objs(today.tasks);
  const logItems = objs(log.items);
  const issues = [
    ...required(dataQuality !== "UNKNOWN", "analysis quality missing"),
    ...required(Object.keys(student).length > 0, "student_analysis_report missing"),
    ...required(tasks.length > 0, "today tasks missing"),
    ...required(str(today, "version").includes("task-selector") || str(today, "sourceStudentAnalysis") || today.analysisDriven, "today is not analysis-driven"),
    ...required(dataQuality !== "LOW" || !(tasks.length > 0), "LOW data quality should not produce formal tasks"),
    ...required(logItems.every(hasCoreLogFields), "some training log items miss core fields"),
  ];
  const result = { generatedAt: new Date().toISOString(), pass: issues.length === 0, dataQuality, checks, taskCount: tasks.length, trainingLogCount: logItems.length, issues };
  await mkdir(LOCAL);
  await writeJson(path.join(LOCAL, "loop_verify_report.json"), result);
  await fs.writeFile(path.join(LOCAL, "loop_verify_report.md"), render(result), "utf8");
  if (!result.pass) process.exitCode = 2;
  console.log(JSON.stringify({ pass: result.pass, dataQuality, taskCount: tasks.length, issues: issues.length, file: rel(path.join(LOCAL, "loop_verify_report.md")) }, null, 2));
}

function hasCoreLogFields(x: Obj) { return ["problemPid", "result", "score", "timeMinutes", "submissionCount", "hintLevelUsed", "hasSeenSolution"].every((k) => x[k] !== undefined && x[k] !== null && String(x[k]).length > 0); }
function required(ok: boolean, message: string) { return ok ? [] : [message]; }
function render(r: Obj) { return ["# CSP-S 200 闭环校验", "", `通过：${r.pass ? "是" : "否"}`, `数据质量：${str(r, "dataQuality")}`, `今日任务数：${num(r, "taskCount")}`, `训练日志数：${num(r, "trainingLogCount")}`, "", "## 文件检查", "", ...objs(r.checks).map((x) => `- ${x.exists ? "✅" : "❌"} ${str(x, "name")}: ${str(x, "path")}`), "", "## 问题", "", ...(arr(r.issues).length ? arr(r.issues).map((x) => `- ${String(x)}`) : ["- 无"]), ""].join("\n"); }
async function exists(p: string) { try { await fs.access(path.resolve(p)); return true; } catch { return false; } }
async function mkdir(p: string) { await fs.mkdir(path.resolve(p), { recursive: true }); }
async function readJson<T>(p: string, fb: T): Promise<T> { return await exists(p) ? JSON.parse(await fs.readFile(path.resolve(p), "utf8")) as T : fb; }
async function writeJson(p: string, v: unknown) { await mkdir(path.dirname(p)); await fs.writeFile(path.resolve(p), `${JSON.stringify(v, null, 2)}\n`, "utf8"); }
function arr(v: unknown): unknown[] { return Array.isArray(v) ? v : []; }
function objs(v: unknown): Obj[] { return arr(v).filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Obj[]; }
function pathGet(v: unknown, k: string): unknown { return k.split(".").reduce((a, b) => (a && typeof a === "object" && !Array.isArray(a) ? (a as Obj)[b] : undefined), v); }
function str(v: unknown, k?: string): string { const x = k ? (v as Obj)?.[k] : v; return typeof x === "string" ? x : typeof x === "number" || typeof x === "boolean" ? String(x) : ""; }
function num(v: unknown, k?: string): number { const x = k ? (v as Obj)?.[k] : v; return typeof x === "number" ? x : typeof x === "string" && Number.isFinite(Number(x)) ? Number(x) : 0; }
function rel(p: string) { return path.relative(ROOT, path.resolve(p)) || "."; }
