import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");
const CONFIG = path.join(LOCAL, "config.json");
const args = parseArgs(process.argv.slice(2));

main().catch((error) => { console.error(error); process.exit(1); });

async function main() {
  const config = await readJson<Obj>(CONFIG, {});
  const trainingDir = str(args.trainingDir) || str(config.trainingDir) || "data/training";
  const logPath = path.resolve(trainingDir, "training_log.json");
  const log = await readJson<Obj>(logPath, { items: [] });
  const items = objs(log.items);
  const report = validate(items);
  await mkdir(LOCAL);
  await writeJson(path.join(LOCAL, "training_log_validation.json"), report);
  await fs.writeFile(path.join(LOCAL, "training_log_validation.md"), render(report), "utf8");
  if (!report.pass) process.exitCode = 2;
  console.log(JSON.stringify({ pass: report.pass, total: report.total, blockingIssues: report.blockingIssues.length, file: rel(path.join(LOCAL, "training_log_validation.md")) }, null, 2));
}

function validate(items: Obj[]) {
  const required = ["problemPid", "result", "score", "timeMinutes", "submissionCount", "hintLevelUsed", "hasSeenSolution", "needRedo"];
  const recommended = ["failedStage", "studentSummary"];
  const issues: Obj[] = [];
  for (const [index, item] of items.entries()) {
    for (const field of required) if (!has(item, field)) issues.push(issue(index, item, field, "BLOCKING", "必填字段缺失，不能计入稳定掌握。"));
    for (const field of recommended) if (!has(item, field)) issues.push(issue(index, item, field, "WARNING", "建议字段缺失，AI 分析和家长周报置信度下降。"));
    if (bool(item.hasSeenSolution) && str(item, "result") === "AC") issues.push(issue(index, item, "hasSeenSolution", "WARNING", "看过题解后的 AC 不能算独立掌握。"));
    if (num(item, "hintLevelUsed") > 0 && str(item, "result") === "AC") issues.push(issue(index, item, "hintLevelUsed", "WARNING", "使用提示后的 AC 需要迁移题复验。"));
    if (num(item, "submissionCount") >= 4) issues.push(issue(index, item, "submissionCount", "WARNING", "提交次数偏高，说明调试或建模稳定性不足。"));
  }
  const blockingIssues = issues.filter((x) => x.level === "BLOCKING");
  return { generatedAt: new Date().toISOString(), pass: blockingIssues.length === 0, total: items.length, requiredFields: required, recommendedFields: recommended, blockingIssues, warnings: issues.filter((x) => x.level === "WARNING") };
}

function issue(index: number, item: Obj, field: string, level: string, message: string) { return { index, problemPid: str(item, "problemPid"), field, level, message }; }
function render(r: Obj) { return ["# 训练日志校验", "", `通过：${r.pass ? "是" : "否"}`, `记录数：${num(r, "total")}`, "", "## 阻断问题", "", ...objs(r.blockingIssues).map((x) => `- #${num(x, "index")} ${str(x, "problemPid")} ${str(x, "field")}: ${str(x, "message")}`), "", "## 警告", "", ...objs(r.warnings).slice(0, 50).map((x) => `- #${num(x, "index")} ${str(x, "problemPid")} ${str(x, "field")}: ${str(x, "message")}`), ""].join("\n"); }
function parseArgs(argv: string[]) { const o: Record<string, string> = {}; for (let i = 0; i < argv.length; i++) { const t = argv[i]; if (!t?.startsWith("--")) continue; const [k, v] = t.slice(2).split("=", 2); o[k] = v ?? argv[++i]; } return o; }
async function exists(p: string) { try { await fs.access(path.resolve(p)); return true; } catch { return false; } }
async function mkdir(p: string) { await fs.mkdir(path.resolve(p), { recursive: true }); }
async function readJson<T>(p: string, fb: T): Promise<T> { return await exists(p) ? JSON.parse(await fs.readFile(path.resolve(p), "utf8")) as T : fb; }
async function writeJson(p: string, v: unknown) { await mkdir(path.dirname(p)); await fs.writeFile(path.resolve(p), `${JSON.stringify(v, null, 2)}\n`, "utf8"); }
function objs(v: unknown): Obj[] { return Array.isArray(v) ? v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Obj[] : []; }
function has(o: Obj, k: string) { return o[k] !== undefined && o[k] !== null && String(o[k]).length > 0; }
function str(v: unknown, k?: string): string { const x = k ? (v as Obj)?.[k] : v; return typeof x === "string" ? x : typeof x === "number" || typeof x === "boolean" ? String(x) : ""; }
function num(v: unknown, k?: string): number { const x = k ? (v as Obj)?.[k] : v; return typeof x === "number" ? x : typeof x === "string" && Number.isFinite(Number(x)) ? Number(x) : 0; }
function bool(v: unknown): boolean { return v === true || v === "true"; }
function rel(p: string) { return path.relative(ROOT, path.resolve(p)) || "."; }
