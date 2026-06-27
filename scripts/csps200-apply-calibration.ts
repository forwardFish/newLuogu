import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");
const STUDENT_PATH = path.join(LOCAL, "student_analysis_report.json");
const CALIBRATION_PATH = path.join(LOCAL, "mock_calibration.json");
const OUT_MD = path.join(LOCAL, "calibrated_student_analysis.md");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const student = await readJson<Obj>(STUDENT_PATH, {});
  const calibration = await readJson<Obj>(CALIBRATION_PATH, {});
  if (!Object.keys(student).length) throw new Error("student_analysis_report.json not found. Run csps200-student-analysis first.");
  if (getString(calibration, "status") !== "OK") {
    console.log(JSON.stringify({ status: "SKIPPED", reason: "mock calibration is missing or not OK" }, null, 2));
    return;
  }

  const patched = applyCalibration(student, calibration);
  await writeJson(STUDENT_PATH, patched);
  await fs.writeFile(OUT_MD, render(patched, calibration), "utf8");
  console.log(JSON.stringify({ status: "OK", file: rel(STUDENT_PATH), report: rel(OUT_MD), estimatedCurrentScore: getNumber(asRecord(patched.scoreEstimate), "estimatedCurrentScore") }, null, 2));
}

function applyCalibration(student: Obj, calibration: Obj) {
  const total = asRecord(calibration.total);
  const patch = asRecord(calibration.scoreEstimatePatch);
  const oldEstimate = asRecord(student.scoreEstimate);
  const oldStage = asRecord(student.currentStage);
  const estimatedCurrentScore = getNumber(patch, "estimatedCurrentScore") || getNumber(total, "calibratedTotal") || getNumber(oldEstimate, "estimatedCurrentScore");
  const confidence = getString(total, "confidence") || getString(oldEstimate, "confidence") || "MEDIUM";
  const calibratedSlots = asRecord(student.slotReadiness);
  for (const slot of arrayOfObjects(calibration.slots)) {
    const key = getString(slot, "slot");
    if (!["T1", "T2", "T3", "T4"].includes(key)) continue;
    calibratedSlots[key] = {
      ...asRecord(calibratedSlots[key]),
      mockScore: getNumber(slot, "mockScore"),
      modelScore: getNumber(slot, "modelScore"),
      estimatedExamScore: getNumber(slot, "calibratedScore"),
      calibrationDelta: getNumber(slot, "delta"),
      calibrationConfidence: getString(slot, "confidence"),
      nextAction: getString(slot, "action"),
    };
  }
  return {
    ...student,
    calibratedAt: new Date().toISOString(),
    scoreEstimate: {
      ...oldEstimate,
      estimatedCurrentScore,
      range: patch.range ?? oldEstimate.range,
      confidence,
      reason: getString(patch, "reason") || "已使用模拟赛结果校准。",
      calibrationSource: "mock_exam_result",
      previousEstimatedCurrentScore: getNumber(oldEstimate, "estimatedCurrentScore"),
    },
    slotReadiness: calibratedSlots,
    currentStage: {
      ...oldStage,
      stage: stageFor(estimatedCurrentScore),
      currentScore: estimatedCurrentScore,
      mainGoal: goalFor(estimatedCurrentScore),
    },
    mockCalibration: {
      status: "APPLIED",
      exam: calibration.exam,
      total: calibration.total,
      nextTrainingFocus: calibration.nextTrainingFocus,
    },
  };
}

function stageFor(score: number) {
  if (score < 120) return "104 → 120";
  if (score < 140) return "120 → 140";
  if (score < 160) return "140 → 160";
  if (score < 180) return "160 → 180";
  return "180 → 200";
}

function goalFor(score: number) {
  if (score < 120) return "先修 T1 稳定性，同时建立 T2 入口";
  if (score < 140) return "T1 稳住，系统训练 T2 建模";
  if (score < 160) return "让 T2 成为稳定得分区";
  if (score < 180) return "训练 T3 部分分路线";
  return "模拟赛稳定性和低级错误控制";
}

function render(student: Obj, calibration: Obj) {
  const score = asRecord(student.scoreEstimate);
  return [
    "# 模拟赛校准已应用",
    "",
    `校准后当前代理分：${getNumber(score, "estimatedCurrentScore")}`,
    `置信度：${getString(score, "confidence")}`,
    `阶段：${getString(student, "currentStage.stage")}`,
    "",
    "## 下次训练重点",
    "",
    ...arrayOfObjects(calibration.nextTrainingFocus).map((item) => `- ${getString(item, "slot")}：${getString(item, "action")}`),
    "",
  ].join("\n");
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> { try { return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T; } catch { return fallback; } }
async function writeJson(filePath: string, value: unknown) { await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function asRecord(value: unknown): Obj { return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {}; }
function arrayOfObjects(value: unknown): Obj[] { return Array.isArray(value) ? value.map(asRecord).filter((item) => Object.keys(item).length > 0) : []; }
function getString(value: unknown, key?: string): string { const source = key ? key.split(".").reduce((cur, part) => asRecord(cur)[part], value) : value; return typeof source === "string" ? source : typeof source === "number" || typeof source === "boolean" ? String(source) : ""; }
function getNumber(value: Obj, key: string) { const v = value?.[key]; return typeof v === "number" ? v : typeof v === "string" && Number.isFinite(Number(v)) ? Number(v) : 0; }
function rel(filePath: string) { return path.relative(ROOT, filePath); }
