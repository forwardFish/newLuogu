import { promises as fs } from "fs";
import path from "path";

type Obj = Record<string, any>;
const root = process.cwd();
const local = path.join(root, "data/local-loop");
const input = path.join(local, "mock_exam_result.json");
const outJson = path.join(local, "mock_calibration_report.json");
const outMd = path.join(local, "mock_calibration_report.md");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await fs.mkdir(local, { recursive: true });
  const mock = await read(input, null);
  if (!mock) {
    const report = { status: "NO_MOCK_EXAM", message: "copy config/mock_exam_result.example.json to data/local-loop/mock_exam_result.json and fill real scores" };
    await write(outJson, report);
    await fs.writeFile(outMd, "# 模拟赛校准\n\n尚未录入模拟赛结果。请复制 config/mock_exam_result.example.json 到 data/local-loop/mock_exam_result.json 后填写真实分项。\n", "utf8");
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const slots = mock.slots || {};
  const names = ["T1", "T2", "T3", "T4"];
  const slotScores = Object.fromEntries(names.map((name) => [name, Number(slots[name]?.score || 0)]));
  const total = Number(mock.totalScore ?? names.reduce((sum, name) => sum + slotScores[name], 0));
  const independent = mock.isIndependent !== false && mock.independent !== false;
  const calibratedStage = total < 120 ? "104_TO_120" : total < 140 ? "120_TO_140" : total < 160 ? "140_TO_160" : total < 180 ? "160_TO_180" : "180_TO_200";
  const report = {
    generatedAt: new Date().toISOString(),
    status: independent ? "CALIBRATED" : "REFERENCE_ONLY",
    examName: mock.examName || "CSP-S mock exam",
    totalScore: total,
    slotScores,
    calibratedStage,
    confidence: independent && mock.isTimed !== false ? "HIGH" : "MEDIUM",
    warning: independent ? null : "not independent; do not use as official score calibration",
    nextTrainingFocus: focus(slotScores)
  };
  await write(outJson, report);
  await fs.writeFile(outMd, render(report), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

function focus(scores: Obj) {
  if (scores.T1 < 80) return ["T1_STABILITY", "BOUNDARY_AND_IMPLEMENTATION"];
  if (scores.T2 < 60) return ["T2_MODELING", "COMPLEXITY_OPTIMIZATION"];
  if (scores.T3 < 30) return ["T3_PARTIAL_SCORE", "BRUTE_FORCE_AND_SUBTASKS"];
  return ["MOCK_EXAM_STABILITY", "TIME_ALLOCATION"];
}

function render(r: Obj) {
  return [`# 模拟赛校准报告`, ``, `状态：${r.status}`, `总分：${r.totalScore}`, `校准阶段：${r.calibratedStage}`, `置信度：${r.confidence}`, ``, `## 分项`, `- T1：${r.slotScores.T1}`, `- T2：${r.slotScores.T2}`, `- T3：${r.slotScores.T3}`, `- T4：${r.slotScores.T4}`, ``, `## 下一步重点`, ...r.nextTrainingFocus.map((x: string) => `- ${x}`), ``].join("\n");
}

async function read(file: string, fallback: any) { try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return fallback; } }
async function write(file: string, value: any) { await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8"); }
