import { jsonResponse } from "@/src/lib/json";
import { readLocalJson, runPnpm } from "@/src/server/local-loop/local-loop-files";

export const runtime = "nodejs";

type TrainingLogBody = {
  problemPid?: string;
  unitId?: string;
  taskType?: string;
  result?: string;
  score?: number | string;
  timeMinutes?: number | string;
  submissionCount?: number | string;
  hintLevelUsed?: number | string;
  hasSeenSolution?: boolean | string;
  failedStage?: string;
  studentSummary?: string;
  errorTypes?: string[] | string;
  needRedo?: boolean | string;
};

export async function GET() {
  const trainingLog = await readLocalJson("data/training/training_log.json", null);
  const validation = await readLocalJson("data/local-loop/training_log_validation.json", null);
  return jsonResponse({ status: trainingLog ? "OK" : "NO_TRAINING_LOG", trainingLog, validation });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as TrainingLogBody;
  const problemPid = stringValue(body.problemPid);
  if (!problemPid) {
    return jsonResponse({ status: "INVALID_INPUT", message: "problemPid is required" }, { status: 400 });
  }

  const result = normalizeResult(body.result);
  const score = clampNumber(body.score, result === "AC" ? 100 : 0, 0, 100);
  const submissionCount = clampNumber(body.submissionCount, 1, 1, 99);
  const hintLevelUsed = clampNumber(body.hintLevelUsed, 0, 0, 9);
  const hasSeenSolution = booleanValue(body.hasSeenSolution);
  const needRedo = body.needRedo === undefined
    ? result !== "AC" || score < 90 || hasSeenSolution || hintLevelUsed > 0 || submissionCount >= 3
    : booleanValue(body.needRedo);

  const logRun = await runStep([
    "tsx",
    "scripts/training/record-training-log.ts",
    "--problemPid", problemPid,
    "--unitId", stringValue(body.unitId) || "UNKNOWN_UNIT",
    "--taskType", stringValue(body.taskType) || "PRACTICE_STANDARD",
    "--result", result,
    "--score", String(score),
    "--timeMinutes", String(clampNumber(body.timeMinutes, 0, 0, 600)),
    "--submissionCount", String(submissionCount),
    "--hintLevelUsed", String(hintLevelUsed),
    "--hasSeenSolution", String(hasSeenSolution),
    "--failedStage", stringValue(body.failedStage) || "NONE",
    "--studentSummary", stringValue(body.studentSummary) || "网页记录训练结果",
    "--needRedo", String(needRedo),
    "--errorTypes", errorTypesValue(body.errorTypes)
  ]);
  if (!logRun.ok) {
    return jsonResponse({ status: "LOG_FAILED", logRun }, { status: 500 });
  }

  const reviewRun = await runStep(["tsx", "scripts/csps200-ai-post-analysis.ts", "--action", "attempt", "--problemPid", problemPid]);
  const validationRun = await runStep(["csps200:validate-log"]);
  const dailyRun = reviewRun.ok ? await runStep(["csps200:parent-day"]) : null;
  const tuningRun = await runStep(["csps200:tuning"]);

  const [trainingLog, review, validation, tuning] = await Promise.all([
    readLocalJson("data/training/training_log.json", null),
    readLocalJson(`data/local-loop/attempt-analysis/${safeFileName(problemPid)}.json`, null),
    readLocalJson("data/local-loop/training_log_validation.json", null),
    readLocalJson("data/local-loop/tuning_report.json", null)
  ]);

  return jsonResponse({
    status: reviewRun.ok ? "OK" : "LOGGED_REVIEW_FAILED",
    problemPid,
    logRun,
    reviewRun,
    validationRun,
    dailyRun,
    tuningRun,
    trainingLog,
    review,
    validation,
    tuning
  }, { status: reviewRun.ok ? 200 : 207 });
}

async function runStep(args: string[]) {
  try {
    const run = await runPnpm(args);
    return { ok: true, ...run };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeResult(value: unknown) {
  const raw = stringValue(value).toUpperCase();
  if (["AC", "WA", "TLE", "RE", "CE", "MLE", "OLE", "PC", "UNKNOWN"].includes(raw)) return raw;
  if (raw === "ACCEPTED") return "AC";
  if (raw === "PARTIAL") return "PC";
  return "UNKNOWN";
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1" || value.toLowerCase() === "yes";
  return false;
}

function errorTypesValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).join(",");
  return stringValue(value);
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "_");
}
