import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

type StepResult = {
  name: string;
  command: string;
  ok: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

type Obj = Record<string, unknown>;

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");
const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await ensureDir(LOCAL_DIR);
  const strict = args.strict === "true" || args.strict === "1";
  const steps: Array<[string, string[]]> = [
    ["init", ["tsx", "scripts/csps200-local-loop.ts", "--action", "init"]],
    ["student-analysis", ["tsx", "scripts/csps200-student-analysis.ts"]],
    ["select-today", ["tsx", "scripts/csps200-task-selector.ts"]],
    ["validate-training-log", ["tsx", "scripts/csps200-validate-training-log.ts"]],
    ["verify-loop", ["tsx", "scripts/csps200-verify-loop.ts"]],
  ];

  const results: StepResult[] = [];
  for (const [name, command] of steps) {
    const result = await runStep(name, command);
    results.push(result);
    if (strict && !result.ok) break;
  }

  const summary = await buildSummary(results);
  await writeJson(path.join(LOCAL_DIR, "e2e_summary.json"), summary);
  await fs.writeFile(path.join(LOCAL_DIR, "e2e_summary.md"), renderSummary(summary), "utf8");
  console.log(JSON.stringify({ ok: summary.ok, report: "data/local-loop/e2e_summary.md", failedSteps: summary.failedSteps }, null, 2));
  if (!summary.ok && strict) process.exitCode = 2;
}

async function runStep(name: string, command: string[]): Promise<StepResult> {
  const cmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const display = `pnpm ${command.join(" ")}`;
  try {
    const { stdout, stderr } = await execFileAsync(cmd, command, { cwd: ROOT, maxBuffer: 20 * 1024 * 1024 });
    return { name, command: display, ok: true, exitCode: 0, stdout, stderr };
  } catch (error) {
    const err = error as Error & { code?: number; stdout?: string; stderr?: string };
    return { name, command: display, ok: false, exitCode: typeof err.code === "number" ? err.code : null, stdout: err.stdout ?? "", stderr: err.stderr ?? err.message };
  }
}

async function buildSummary(results: StepResult[]) {
  const student = await readJsonIfExists<Obj>(path.join(LOCAL_DIR, "student_analysis_report.json"), {});
  const quality = await readJsonIfExists<Obj>(path.join(LOCAL_DIR, "analysis_quality_report.json"), {});
  const today = await readJsonIfExists<Obj>(path.join(LOCAL_DIR, "today.json"), {});
  const verify = await readJsonIfExists<Obj>(path.join(LOCAL_DIR, "loop_verify_report.json"), {});
  const validation = await readJsonIfExists<Obj>(path.join(LOCAL_DIR, "training_log_validation.json"), {});
  const dataQuality = getString(quality, "dataQuality.overall") || getString(student, "sourceQuality.overall") || "UNKNOWN";
  const failedSteps = results.filter((step) => !step.ok).map((step) => step.name);
  return {
    generatedAt: new Date().toISOString(),
    ok: failedSteps.length === 0 && dataQuality !== "LOW",
    dataQuality,
    failedSteps,
    steps: results.map((step) => ({ name: step.name, command: step.command, ok: step.ok, exitCode: step.exitCode, stderrTail: tail(step.stderr) })),
    reports: {
      studentAnalysis: await fileState("data/local-loop/student_analysis_report.json"),
      analysisQuality: await fileState("data/local-loop/analysis_quality_report.json"),
      today: await fileState("data/local-loop/today.json"),
      todayMarkdown: await fileState("data/local-loop/today.md"),
      dataQualityBlock: await fileState("data/local-loop/data_quality_block.md"),
      trainingLogValidation: await fileState("data/local-loop/training_log_validation.json"),
      loopVerify: await fileState("data/local-loop/loop_verify_report.json"),
    },
    snapshot: {
      estimatedCurrentScore: getNumber(student, "scoreEstimate.estimatedCurrentScore"),
      currentStage: getString(student, "currentStage.stage"),
      todayTaskCount: arrayOfObjects(today.tasks).length,
      verifyPass: verify.pass === true,
      trainingLogValidationPass: validation.pass === true,
    },
  };
}

function renderSummary(summary: Obj) {
  const steps = arrayOfObjects(summary.steps);
  const reports = asRecord(summary.reports);
  const snapshot = asRecord(summary.snapshot);
  return [
    "# CSP-S 200 E2E 总报告",
    "",
    `生成时间：${getString(summary, "generatedAt")}`,
    `整体状态：${summary.ok ? "通过" : "需要处理"}`,
    `数据质量：${getString(summary, "dataQuality")}`,
    `当前代理分：${getNumber(snapshot, "estimatedCurrentScore")}`,
    `当前阶段：${getString(snapshot, "currentStage") || "未知"}`,
    `今日任务数：${getNumber(snapshot, "todayTaskCount")}`,
    "",
    "## 步骤结果",
    "",
    ...steps.map((step) => `- ${step.ok ? "✅" : "❌"} ${getString(step, "name")}：${getString(step, "command")}`),
    "",
    "## 产物检查",
    "",
    ...Object.entries(reports).map(([name, value]) => {
      const record = asRecord(value);
      return `- ${record.exists ? "✅" : "❌"} ${name}: ${getString(record, "path")}`;
    }),
    "",
    "## 失败步骤",
    "",
    ...(arrayOfObjects(summary.steps).filter((step) => !step.ok).length
      ? arrayOfObjects(summary.steps).filter((step) => !step.ok).map((step) => `### ${getString(step, "name")}\n\n${getString(step, "stderrTail")}`)
      : ["无"]),
    "",
  ].join("\n");
}

async function fileState(relativePath: string) {
  const absolute = path.join(ROOT, relativePath);
  return { path: relativePath, exists: await exists(absolute), absolute };
}

async function writeJson(filePath: string, value: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function ensureDir(dir: string) {
  await fs.mkdir(path.resolve(dir), { recursive: true });
}

async function exists(filePath: string) {
  try {
    await fs.access(path.resolve(filePath));
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T;
}

function parseArgs(argv: string[]) {
  const output: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const [key, inline] = token.slice(2).split("=", 2);
    const value = inline ?? argv[index + 1];
    if (inline === undefined) index += 1;
    if (key && value !== undefined) output[key] = value;
  }
  return output;
}

function asRecord(value: unknown): Obj {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {};
}

function arrayOfObjects(value: unknown): Obj[] {
  return Array.isArray(value) ? value.map(asRecord).filter((item) => Object.keys(item).length > 0) : [];
}

function getPath(value: unknown, pathText: string): unknown {
  return pathText.split(".").reduce((current, key) => asRecord(current)[key], value);
}

function getString(value: unknown, key?: string): string {
  const source = key ? getPath(value, key) : value;
  if (typeof source === "string") return source;
  if (typeof source === "number" || typeof source === "boolean") return String(source);
  return "";
}

function getNumber(value: unknown, key?: string): number {
  const source = key ? getPath(value, key) : value;
  if (typeof source === "number" && Number.isFinite(source)) return source;
  if (typeof source === "string" && Number.isFinite(Number(source))) return Number(source);
  return 0;
}

function tail(text: string, max = 1200) {
  return text.length > max ? text.slice(-max) : text;
}
