import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;
type Issue = { priority: "P0" | "P1" | "P2"; code: string; message: string; evidence: string };

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");
const OUT_JSON = path.join(LOCAL, "tuning_report.json");
const OUT_MD = path.join(LOCAL, "tuning_report.md");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await mkdir(LOCAL);
  const files = {
    student: path.join(LOCAL, "student_analysis_report.json"),
    calibratedStudent: path.join(LOCAL, "calibrated_student_analysis_report.json"),
    quality: path.join(LOCAL, "analysis_quality_report.json"),
    today: path.join(LOCAL, "today.json"),
    mockCalibration: path.join(LOCAL, "mock_calibration.json"),
    metadata: path.join(ROOT, "data", "problem-metadata", "problem_knowledge_map.json"),
    trainingLogValidation: path.join(LOCAL, "training_log_validation.json"),
    loopVerify: path.join(LOCAL, "loop_verify_report.json"),
    parentWeeklyReport: path.join(LOCAL, "parent_weekly_report.json"),
    attemptAnalysisDir: path.join(LOCAL, "attempt-analysis"),
  };

  const student = await readJson<Obj>(files.student, {});
  const calibratedStudent = await readJson<Obj>(files.calibratedStudent, {});
  const quality = await readJson<Obj>(files.quality, {});
  const today = await readJson<Obj>(files.today, {});
  const mockCalibration = await readJson<Obj>(files.mockCalibration, {});
  const metadata = await readJson<Obj>(files.metadata, {});
  const trainingLogValidation = await readJson<Obj>(files.trainingLogValidation, {});
  const loopVerify = await readJson<Obj>(files.loopVerify, {});
  const parentWeeklyReport = await readJson<Obj>(files.parentWeeklyReport, {});
  const attemptFiles = await countJsonFiles(files.attemptAnalysisDir);

  const dataQuality = getString(quality, "dataQuality.overall") || getString(student, "sourceQuality.overall") || "UNKNOWN";
  const metadataItems = Object.entries(metadata).filter(([key, value]) => !key.startsWith("$") && Object.keys(asRecord(value)).length);
  const unknownMetadata = metadataItems.filter(([, value]) => getString(value, "cspSlot") === "UNKNOWN").length;
  const lowConfidenceMetadata = metadataItems.filter(([, value]) => getString(value, "confidence") === "LOW").length;
  const tasks = arrayOfObjects(today.tasks);
  const fallbackTasks = tasks.filter((task) => getString(task, "source") === "fallback" || !getString(task, "problemPid")).length;
  const calibrationUsed = getBool(today, "selectionInputs.calibrationUsed");
  const mockStatus = getString(mockCalibration, "status") || "NO_REPORT";
  const calibratedStatus = getString(calibratedStudent, "calibration.status") || "NO_REPORT";
  const trainingBlocking = arrayOfObjects(trainingLogValidation.blockingIssues).length;
  const trainingWarnings = arrayOfObjects(trainingLogValidation.warnings).length;

  const issues: Issue[] = [
    ...issue(dataQuality === "LOW", "P0", "DATA_QUALITY_LOW", "数据质量 LOW，正式训练应阻断。", `dataQuality=${dataQuality}`),
    ...issue(!Object.keys(student).length, "P0", "STUDENT_ANALYSIS_MISSING", "缺少学生分析报告。", rel(files.student)),
    ...issue(tasks.length === 0 && dataQuality !== "LOW", "P0", "TODAY_TASKS_MISSING", "非 LOW 数据质量下没有今日任务。", rel(files.today)),
    ...issue(loopVerify.pass === false, "P0", "LOOP_VERIFY_FAILED", "闭环校验未通过。", rel(files.loopVerify)),
    ...issue(trainingBlocking > 0, "P0", "TRAINING_LOG_BLOCKING_FIELDS", "训练日志存在阻断字段缺失。", `${trainingBlocking} blocking issues`),
    ...issue(mockStatus !== "OK", "P1", "MOCK_CALIBRATION_MISSING", "模拟赛校准未完成或不可用。", `mockStatus=${mockStatus}`),
    ...issue(mockStatus === "OK" && calibratedStatus !== "APPLIED", "P1", "CALIBRATION_NOT_APPLIED", "模拟赛校准结果还没有应用到独立学生分析报告。", `calibratedStatus=${calibratedStatus}`),
    ...issue(mockStatus === "OK" && !calibrationUsed, "P1", "TODAY_NOT_USING_CALIBRATION", "今日选题没有使用校准后的学生分析报告。", rel(files.today)),
    ...issue(metadataItems.length > 0 && unknownMetadata / metadataItems.length > 0.15, "P1", "METADATA_UNKNOWN_HIGH", "题目元数据 UNKNOWN 题位比例偏高。", `${unknownMetadata}/${metadataItems.length}`),
    ...issue(metadataItems.length > 0 && lowConfidenceMetadata / metadataItems.length > 0.2, "P1", "METADATA_LOW_CONFIDENCE_HIGH", "题目元数据 LOW 置信度比例偏高。", `${lowConfidenceMetadata}/${metadataItems.length}`),
    ...issue(fallbackTasks > 0, "P1", "TODAY_HAS_FALLBACK_TASKS", "今日任务存在 fallback 或待人工选择题。", `${fallbackTasks}/${tasks.length}`),
    ...issue(trainingWarnings > 0, "P2", "TRAINING_LOG_WARNINGS", "训练日志有建议字段或独立性警告。", `${trainingWarnings} warnings`),
    ...issue(attemptFiles === 0, "P2", "ATTEMPT_ANALYSIS_MISSING", "尚未生成单题 AI 复盘。", rel(files.attemptAnalysisDir)),
    ...issue(!Object.keys(parentWeeklyReport).length, "P2", "PARENT_WEEKLY_REPORT_MISSING", "尚未生成家长周报。", rel(files.parentWeeklyReport)),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    status: issues.some((item) => item.priority === "P0") ? "BLOCKED" : issues.some((item) => item.priority === "P1") ? "NEEDS_TUNING" : "OK",
    dataQuality,
    checks: {
      metadataProblemCount: metadataItems.length,
      metadataUnknownCount: unknownMetadata,
      metadataLowConfidenceCount: lowConfidenceMetadata,
      todayTaskCount: tasks.length,
      fallbackTaskCount: fallbackTasks,
      todayCalibrationUsed: calibrationUsed,
      mockCalibrationStatus: mockStatus,
      calibratedStudentStatus: calibratedStatus,
      trainingLogBlockingIssueCount: trainingBlocking,
      trainingLogWarningCount: trainingWarnings,
      attemptAnalysisCount: attemptFiles,
      parentWeeklyReportExists: Object.keys(parentWeeklyReport).length > 0,
    },
    issues,
    priorityCounts: {
      P0: issues.filter((item) => item.priority === "P0").length,
      P1: issues.filter((item) => item.priority === "P1").length,
      P2: issues.filter((item) => item.priority === "P2").length,
    },
    recommendedNextCommands: recommendCommands(issues),
  };

  await writeJson(OUT_JSON, report);
  await fs.writeFile(OUT_MD, render(report), "utf8");
  console.log(JSON.stringify({ status: report.status, p0: report.priorityCounts.P0, p1: report.priorityCounts.P1, file: rel(OUT_MD) }, null, 2));
  if (report.priorityCounts.P0 > 0) process.exitCode = 2;
}

function issue(condition: boolean, priority: Issue["priority"], code: string, message: string, evidence: string): Issue[] {
  return condition ? [{ priority, code, message, evidence }] : [];
}

function recommendCommands(issues: Issue[]) {
  const codes = new Set(issues.map((item) => item.code));
  const commands: string[] = [];
  if (codes.has("STUDENT_ANALYSIS_MISSING") || codes.has("DATA_QUALITY_LOW")) commands.push("pnpm csps200:student-analysis");
  if (codes.has("MOCK_CALIBRATION_MISSING")) commands.push("pnpm csps200:mock-calibrate");
  if (codes.has("CALIBRATION_NOT_APPLIED")) commands.push("pnpm csps200:apply-mock-calibration");
  if (codes.has("TODAY_NOT_USING_CALIBRATION") || codes.has("TODAY_TASKS_MISSING") || codes.has("TODAY_HAS_FALLBACK_TASKS")) commands.push("pnpm csps200:today");
  if (codes.has("TRAINING_LOG_BLOCKING_FIELDS") || codes.has("TRAINING_LOG_WARNINGS")) commands.push("pnpm csps200:validate-log");
  if (codes.has("ATTEMPT_ANALYSIS_MISSING")) commands.push("pnpm csps200:parent-day");
  if (codes.has("PARENT_WEEKLY_REPORT_MISSING")) commands.push("pnpm csps200:parent-week");
  return [...new Set(commands)];
}

function render(report: Obj) {
  const checks = asRecord(report.checks);
  const issues = arrayOfObjects(report.issues);
  const counts = asRecord(report.priorityCounts);
  return [
    "# CSP-S 200 调参诊断报告",
    "",
    `生成时间：${getString(report, "generatedAt")}`,
    `状态：${getString(report, "status")}`,
    `数据质量：${getString(report, "dataQuality")}`,
    `P0/P1/P2：${getNumber(counts, "P0")} / ${getNumber(counts, "P1")} / ${getNumber(counts, "P2")}`,
    "",
    "## 关键指标",
    "",
    `- metadata：${getNumber(checks, "metadataProblemCount")} 题，UNKNOWN ${getNumber(checks, "metadataUnknownCount")}，LOW confidence ${getNumber(checks, "metadataLowConfidenceCount")}`,
    `- 今日任务：${getNumber(checks, "todayTaskCount")}，fallback ${getNumber(checks, "fallbackTaskCount")}，使用校准：${getBool(checks, "todayCalibrationUsed") ? "是" : "否"}`,
    `- 模拟赛校准：${getString(checks, "mockCalibrationStatus")}，校准报告：${getString(checks, "calibratedStudentStatus")}`,
    `- 训练日志：阻断 ${getNumber(checks, "trainingLogBlockingIssueCount")}，警告 ${getNumber(checks, "trainingLogWarningCount")}`,
    `- 单题复盘：${getNumber(checks, "attemptAnalysisCount")}，家长周报：${getBool(checks, "parentWeeklyReportExists") ? "已生成" : "未生成"}`,
    "",
    "## 问题清单",
    "",
    ...(issues.length ? issues.map((item) => `- ${getString(item, "priority")} ${getString(item, "code")}：${getString(item, "message")}（${getString(item, "evidence")}）`) : ["- 无"]),
    "",
    "## 建议命令",
    "",
    ...(asArray(report.recommendedNextCommands).length ? asArray(report.recommendedNextCommands).map((cmd) => `- \`${String(cmd)}\``) : ["- 暂无"]),
    "",
  ].join("\n");
}

async function countJsonFiles(dir: string) {
  try {
    const entries = await fs.readdir(path.resolve(dir), { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

async function mkdir(dir: string) {
  await fs.mkdir(path.resolve(dir), { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath));
  await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Obj {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {};
}

function arrayOfObjects(value: unknown): Obj[] {
  return asArray(value).map(asRecord).filter((item) => Object.keys(item).length > 0);
}

function getPath(value: unknown, key: string): unknown {
  return key.split(".").reduce((current, part) => asRecord(current)[part], value);
}

function getString(value: unknown, key?: string): string {
  const source = key ? getPath(value, key) : value;
  return typeof source === "string" ? source : typeof source === "number" || typeof source === "boolean" ? String(source) : "";
}

function getNumber(value: unknown, key?: string): number {
  const source = key ? getPath(value, key) : value;
  return typeof source === "number" && Number.isFinite(source) ? source : typeof source === "string" && Number.isFinite(Number(source)) ? Number(source) : 0;
}

function getBool(value: unknown, key: string): boolean {
  const source = getPath(value, key);
  return source === true || source === "true";
}

function rel(filePath: string) {
  return path.relative(ROOT, path.resolve(filePath)) || ".";
}
