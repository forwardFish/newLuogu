import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");
const STUDENT_PATH = path.join(LOCAL, "student_analysis_report.json");
const CALIBRATION_PATH = path.join(LOCAL, "mock_calibration.json");
const OUT_JSON = path.join(LOCAL, "calibrated_student_analysis_report.json");
const OUT_MD = path.join(LOCAL, "calibrated_student_analysis_report.md");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await mkdir(LOCAL);
  const student = await readJson<Obj>(STUDENT_PATH, {});
  const calibration = await readJson<Obj>(CALIBRATION_PATH, {});

  if (!Object.keys(student).length) {
    const skipped = skippedReport("STUDENT_ANALYSIS_MISSING", "没有找到 data/local-loop/student_analysis_report.json，请先运行学生分析。");
    await writeJson(OUT_JSON, skipped);
    await fs.writeFile(OUT_MD, renderSkipped(skipped), "utf8");
    console.log(JSON.stringify({ status: "SKIPPED", reason: skipped.reason, file: rel(OUT_JSON) }, null, 2));
    return;
  }

  if (getString(calibration, "status") !== "OK") {
    const skipped = {
      ...student,
      calibration: skippedReport("MOCK_CALIBRATION_NOT_OK", "mock_calibration.json 缺失或状态不是 OK，未应用模拟赛校准。"),
    };
    await writeJson(OUT_JSON, skipped);
    await fs.writeFile(OUT_MD, renderSkipped(asRecord(skipped.calibration), student), "utf8");
    console.log(JSON.stringify({ status: "SKIPPED", reason: getString(skipped.calibration, "reason"), file: rel(OUT_JSON) }, null, 2));
    return;
  }

  const appliedAt = new Date().toISOString();
  const patched = applyCalibration(student, calibration, appliedAt);
  await writeJson(OUT_JSON, patched);
  await fs.writeFile(OUT_MD, renderApplied(patched, calibration), "utf8");
  console.log(JSON.stringify({
    status: "APPLIED",
    file: rel(OUT_JSON),
    report: rel(OUT_MD),
    calibratedScore: getNumber(patched, "scoreEstimate.estimatedCurrentScore"),
  }, null, 2));
}

function applyCalibration(student: Obj, calibration: Obj, appliedAt: string) {
  const total = asRecord(calibration.total);
  const patch = asRecord(calibration.scoreEstimatePatch);
  const oldEstimate = asRecord(student.scoreEstimate);
  const oldSlotReadiness = asRecord(student.slotReadiness);
  const calibratedTotal = getNumber(total, "calibratedTotal") || getNumber(patch, "estimatedCurrentScore") || getNumber(oldEstimate, "estimatedCurrentScore");
  const confidence = getString(total, "confidence") || getString(oldEstimate, "confidence") || "MEDIUM";
  const slotReadiness: Obj = { ...oldSlotReadiness };

  for (const slot of arrayOfObjects(calibration.slots)) {
    const key = getString(slot, "slot");
    if (!["T1", "T2", "T3", "T4"].includes(key)) continue;
    const calibratedScore = getNumber(slot, "calibratedScore");
    slotReadiness[key] = {
      ...asRecord(slotReadiness[key]),
      mockScore: getNumber(slot, "mockScore"),
      modelScore: getNumber(slot, "modelScore"),
      calibratedScore,
      estimatedExamScore: calibratedScore || getNumber(asRecord(slotReadiness[key]), "estimatedExamScore"),
      calibrationDelta: getNumber(slot, "delta"),
      calibrationConfidence: getString(slot, "confidence"),
      calibrationAction: getString(slot, "action"),
    };
  }

  const previousScore = getNumber(oldEstimate, "estimatedCurrentScore");
  return {
    ...student,
    scoreEstimate: {
      ...oldEstimate,
      estimatedCurrentScoreBeforeCalibration: previousScore,
      previousEstimatedCurrentScore: previousScore,
      estimatedCurrentScore: calibratedTotal,
      range: patch.range ?? oldEstimate.range,
      confidence,
      reason: "已接入限时四题模拟结果校准。",
      calibrationSource: "mock_exam",
    },
    slotReadiness,
    currentStage: patchCurrentStage(asRecord(student.currentStage), calibratedTotal),
    calibration: {
      status: "APPLIED",
      source: "mock_exam",
      exam: calibration.exam ?? null,
      total: calibration.total ?? null,
      nextTrainingFocus: calibration.nextTrainingFocus ?? [],
      appliedAt,
    },
  };
}

function patchCurrentStage(stage: Obj, score: number) {
  if (!score) return stage;
  return {
    ...stage,
    stage: stageFor(score),
    currentScore: score,
    mainGoal: goalFor(score),
  };
}

function stageFor(score: number) {
  if (score < 120) return "104 -> 120";
  if (score < 140) return "120 -> 140";
  if (score < 160) return "140 -> 160";
  if (score < 180) return "160 -> 180";
  return "180 -> 200";
}

function goalFor(score: number) {
  if (score < 120) return "先修 T1 稳定性，同时建立 T2 入口";
  if (score < 140) return "T1 稳住，系统训练 T2 建模";
  if (score < 160) return "让 T2 成为稳定得分区";
  if (score < 180) return "训练 T3 部分分路线";
  return "模拟赛稳定性和低级错误控制";
}

function skippedReport(code: string, reason: string) {
  return {
    status: "SKIPPED",
    code,
    reason,
    source: "mock_exam",
    generatedAt: new Date().toISOString(),
  };
}

function renderSkipped(report: Obj, student: Obj = {}) {
  return [
    "# 模拟赛校准未应用",
    "",
    `状态：${getString(report, "status")}`,
    `原因：${getString(report, "reason")}`,
    "",
    Object.keys(student).length ? `当前学生分析分：${getNumber(student, "scoreEstimate.estimatedCurrentScore") || "未知"}` : "",
    "",
    "下一步：",
    "",
    "```bash",
    "pnpm csps200:mock-calibrate",
    "pnpm csps200:apply-mock-calibration",
    "```",
    "",
  ].filter((line) => line !== "").join("\n");
}

function renderApplied(student: Obj, calibration: Obj) {
  const score = asRecord(student.scoreEstimate);
  const slots = arrayOfObjects(calibration.slots);
  return [
    "# 模拟赛校准后学生分析报告",
    "",
    `校准前代理分：${getNumber(score, "estimatedCurrentScoreBeforeCalibration")}`,
    `校准后代理分：${getNumber(score, "estimatedCurrentScore")}`,
    `置信度：${getString(score, "confidence")}`,
    `阶段：${getString(student, "currentStage.stage")}`,
    "",
    "## 四题校准",
    "",
    ...slots.map((slot) => `- ${getString(slot, "slot")}: mock ${getNumber(slot, "mockScore")} / model ${getNumber(slot, "modelScore")} / calibrated ${getNumber(slot, "calibratedScore")} / delta ${getNumber(slot, "delta")}`),
    "",
    "## 下次训练重点",
    "",
    ...arrayOfObjects(calibration.nextTrainingFocus).map((item) => `- ${getString(item, "slot")}：${getString(item, "action")}`),
    "",
  ].join("\n");
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

function asRecord(value: unknown): Obj {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {};
}

function arrayOfObjects(value: unknown): Obj[] {
  return Array.isArray(value) ? value.map(asRecord).filter((item) => Object.keys(item).length > 0) : [];
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

function rel(filePath: string) {
  return path.relative(ROOT, path.resolve(filePath)) || ".";
}
