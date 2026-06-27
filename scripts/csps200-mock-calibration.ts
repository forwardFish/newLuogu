import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, unknown>;

type SlotCalibrated = {
  slot: "T1" | "T2" | "T3" | "T4";
  mockScore: number;
  modelScore: number;
  calibratedScore: number;
  delta: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  action: string;
};

const ROOT = process.cwd();
const LOCAL = path.join(ROOT, "data", "local-loop");
const RESULT_PATH = path.join(LOCAL, "mock_exam_result.json");
const EXAMPLE_PATH = path.join(ROOT, "config", "mock_exam_result.example.json");
const CALIBRATION_JSON = path.join(LOCAL, "mock_calibration.json");
const CALIBRATION_MD = path.join(LOCAL, "mock_calibration.md");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await fs.mkdir(LOCAL, { recursive: true });
  const mock = await readJson<Obj>(RESULT_PATH, {});
  if (!Object.keys(mock).length) {
    await fs.copyFile(EXAMPLE_PATH, path.join(LOCAL, "mock_exam_result.template.json")).catch(() => undefined);
    const missing = {
      generatedAt: new Date().toISOString(),
      status: "NO_MOCK_EXAM_RESULT",
      message: "没有找到 data/local-loop/mock_exam_result.json。已尝试生成 mock_exam_result.template.json，请填写一次限时四题模拟结果后重跑。",
      template: "data/local-loop/mock_exam_result.template.json",
    };
    await writeJson(CALIBRATION_JSON, missing);
    await fs.writeFile(CALIBRATION_MD, renderMissing(missing), "utf8");
    console.log(JSON.stringify({ status: missing.status, template: missing.template }, null, 2));
    return;
  }

  const student = await readJson<Obj>(path.join(LOCAL, "student_analysis_report.json"), {});
  const slotReadiness = asRecord(student.slotReadiness);
  const slots = ["T1", "T2", "T3", "T4"] as const;
  const slotCalibrations: SlotCalibrated[] = slots.map((slot) => calibrateSlot(slot, mock, slotReadiness));
  const mockTotal = getNumber(mock, "totalScore") || slotCalibrations.reduce((sum, item) => sum + item.mockScore, 0);
  const modelTotal = slotCalibrations.reduce((sum, item) => sum + item.modelScore, 0);
  const calibratedTotal = Math.round(mockTotal * 0.7 + modelTotal * 0.3);
  const confidence = inferOverallConfidence(mock, slotCalibrations);
  const report = {
    generatedAt: new Date().toISOString(),
    status: "OK",
    exam: {
      name: getString(mock, "examName") || "CSP-S 四题结构模拟",
      date: getString(mock, "date"),
      timeLimitMinutes: getNumber(mock, "timeLimitMinutes"),
      isTimed: mock.isTimed === true,
      isIndependent: mock.isIndependent === true,
      hasSeenSolutionsBeforeExam: mock.hasSeenSolutionsBeforeExam === true,
    },
    total: {
      mockTotal,
      modelTotal,
      calibratedTotal,
      delta: mockTotal - modelTotal,
      confidence,
    },
    slots: slotCalibrations,
    scoreEstimatePatch: {
      estimatedCurrentScore: calibratedTotal,
      range: confidence === "HIGH" ? [calibratedTotal - 12, calibratedTotal + 12] : confidence === "MEDIUM" ? [calibratedTotal - 20, calibratedTotal + 20] : [calibratedTotal - 35, calibratedTotal + 35],
      reason: "已接入一次限时四题模拟结果，优先使用模拟赛校准当前训练代理分。",
    },
    nextTrainingFocus: buildFocus(slotCalibrations),
  };
  await writeJson(CALIBRATION_JSON, report);
  await fs.writeFile(CALIBRATION_MD, renderReport(report), "utf8");
  console.log(JSON.stringify({ status: "OK", calibratedTotal, confidence, file: rel(CALIBRATION_JSON) }, null, 2));
}

function calibrateSlot(slot: "T1" | "T2" | "T3" | "T4", mock: Obj, slotReadiness: Obj): SlotCalibrated {
  const mockSlot = asRecord(asRecord(mock.slots)[slot]);
  const mockScore = getNumber(mockSlot, "score");
  const modelScore = getNumber(asRecord(slotReadiness[slot]), "estimatedExamScore") || getNumber(asRecord(slotReadiness[slot]), "score");
  const calibratedScore = Math.round(mockScore * 0.75 + modelScore * 0.25);
  const delta = mockScore - modelScore;
  const confidence = mock.isTimed === true && mock.isIndependent === true && mock.hasSeenSolutionsBeforeExam !== true ? "HIGH" : mock.isTimed === true ? "MEDIUM" : "LOW";
  return { slot, mockScore, modelScore, calibratedScore, delta, confidence, action: actionFor(slot, mockScore, delta) };
}

function actionFor(slot: string, score: number, delta: number) {
  if (slot === "T1" && score < 80) return "继续 T1 保分稳定性训练，目标是低提交次数和低级错误归零。";
  if (slot === "T2" && score < 50) return "优先训练 T2 建模入口：暴力、复杂度、优化路径三步固定化。";
  if (slot === "T3" && score < 30) return "训练 T3 部分分路线：先写可执行暴力和子任务得分。";
  if (slot === "T4" && score <= 10) return "T4 暂不主攻，只保留读题和止损策略训练。";
  if (delta < -15) return "模型高估该题位，需要下调训练目标并增加证据题。";
  return "保持训练节奏，用迁移题验证稳定性。";
}

function inferOverallConfidence(mock: Obj, slots: SlotCalibrated[]) {
  if (mock.isTimed === true && mock.isIndependent === true && mock.hasSeenSolutionsBeforeExam !== true && slots.every((slot) => slot.confidence === "HIGH")) return "HIGH";
  if (mock.isTimed === true) return "MEDIUM";
  return "LOW";
}

function buildFocus(slots: SlotCalibrated[]) {
  return slots
    .slice()
    .sort((a, b) => a.calibratedScore - b.calibratedScore)
    .slice(0, 3)
    .map((item) => ({ slot: item.slot, score: item.calibratedScore, action: item.action }));
}

function renderMissing(report: Obj) {
  return [
    "# 模拟赛校准未完成",
    "",
    getString(report, "message"),
    "",
    "下一步：",
    "",
    "```bash",
    "cp data/local-loop/mock_exam_result.template.json data/local-loop/mock_exam_result.json",
    "# 填写 T1/T2/T3/T4 分项得分后运行",
    "pnpm tsx scripts/csps200-mock-calibration.ts",
    "```",
    "",
  ].join("\n");
}

function renderReport(report: Obj) {
  const total = asRecord(report.total);
  const slots = arrayOfObjects(report.slots);
  return [
    "# CSP-S 模拟赛校准报告",
    "",
    `模拟总分：${getNumber(total, "mockTotal")}`,
    `模型估计：${getNumber(total, "modelTotal")}`,
    `校准后代理分：${getNumber(total, "calibratedTotal")}`,
    `置信度：${getString(total, "confidence")}`,
    "",
    "## 四题结构校准",
    "",
    ...slots.map((slot) => `- ${getString(slot, "slot")}: 模拟 ${getNumber(slot, "mockScore")} / 模型 ${getNumber(slot, "modelScore")} / 校准 ${getNumber(slot, "calibratedScore")}｜${getString(slot, "action")}`),
    "",
    "## 下次训练重点",
    "",
    ...arrayOfObjects(report.nextTrainingFocus).map((item) => `- ${getString(item, "slot")}：${getString(item, "action")}`),
    "",
  ].join("\n");
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> { try { return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T; } catch { return fallback; } }
async function writeJson(filePath: string, value: unknown) { await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function asRecord(value: unknown): Obj { return value && typeof value === "object" && !Array.isArray(value) ? value as Obj : {}; }
function arrayOfObjects(value: unknown): Obj[] { return Array.isArray(value) ? value.map(asRecord).filter((item) => Object.keys(item).length > 0) : []; }
function getString(value: Obj, key: string) { const v = value?.[key]; return typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : ""; }
function getNumber(value: Obj, key: string) { const v = value?.[key]; return typeof v === "number" ? v : typeof v === "string" && Number.isFinite(Number(v)) ? Number(v) : 0; }
function rel(filePath: string) { return path.relative(ROOT, filePath); }
