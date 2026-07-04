import { promises as fs } from "fs";
import path from "path";
import { jsonResponse } from "@/src/lib/json";
import { readLocalJson, readLocalText, runPnpm } from "@/src/server/local-loop/local-loop-files";

export const runtime = "nodejs";

type MockSlotInput = {
  problemPid?: string;
  title?: string;
  score?: number | string;
  maxScore?: number | string;
  timeMinutes?: number | string;
  submissionCount?: number | string;
  notes?: string;
};

type MockCalibrationBody = {
  examName?: string;
  date?: string;
  timeLimitMinutes?: number | string;
  isTimed?: boolean | string;
  isIndependent?: boolean | string;
  hasSeenSolutionsBeforeExam?: boolean | string;
  totalScore?: number | string;
  slots?: Partial<Record<"T1" | "T2" | "T3" | "T4", MockSlotInput>>;
};

const ROOT = process.cwd();
const MOCK_RESULT_PATH = path.join(ROOT, "data", "local-loop", "mock_exam_result.json");
const SLOT_KEYS = ["T1", "T2", "T3", "T4"] as const;

export async function GET() {
  const [mockExamResult, mockCalibration, calibratedStudent, tuning, markdown] = await Promise.all([
    readLocalJson("data/local-loop/mock_exam_result.json", null),
    readLocalJson("data/local-loop/mock_calibration.json", null),
    readLocalJson("data/local-loop/calibrated_student_analysis_report.json", null),
    readLocalJson("data/local-loop/tuning_report.json", null),
    readLocalText("data/local-loop/mock_calibration.md")
  ]);
  const status = mockExamResult ? (mockCalibration ? getStatus(mockCalibration) : "NO_MOCK_CALIBRATION") : "NO_MOCK_EXAM_RESULT";
  const calibrationApplied = status === "OK" && getStatusPath(calibratedStudent, "calibration.status") === "APPLIED";
  return jsonResponse({
    status,
    mockExamResult,
    mockCalibration: status === "OK" ? mockCalibration : null,
    calibratedStudent: calibrationApplied ? calibratedStudent : null,
    artifactState: {
      rawMockCalibrationStatus: mockCalibration ? getStatus(mockCalibration) : "NO_MOCK_CALIBRATION",
      rawCalibratedStudentStatus: getStatusPath(calibratedStudent, "calibration.status") || "NO_REPORT",
      calibrationApplied
    },
    tuning,
    markdown
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as MockCalibrationBody;
  const normalized = normalizeMockExamResult(body);
  if (!normalized.ok) {
    return jsonResponse({ status: "INVALID_INPUT", issues: normalized.issues }, { status: 400 });
  }

  await fs.mkdir(path.dirname(MOCK_RESULT_PATH), { recursive: true });
  await fs.writeFile(MOCK_RESULT_PATH, `${JSON.stringify(normalized.value, null, 2)}\n`, "utf8");

  const mockRun = await runStep(["csps200:mock-calibrate"]);
  if (!mockRun.ok) return jsonResponse({ status: "MOCK_CALIBRATION_FAILED", mockRun }, { status: 500 });

  const applyRun = await runStep(["csps200:apply-mock-calibration"]);
  const todayRun = applyRun.ok ? await runStep(["csps200:today"]) : null;
  const tuningRun = await runStep(["csps200:tuning"]);

  const [mockExamResult, mockCalibration, calibratedStudent, today, tuning] = await Promise.all([
    readLocalJson("data/local-loop/mock_exam_result.json", null),
    readLocalJson("data/local-loop/mock_calibration.json", null),
    readLocalJson("data/local-loop/calibrated_student_analysis_report.json", null),
    readLocalJson("data/local-loop/today.json", null),
    readLocalJson("data/local-loop/tuning_report.json", null)
  ]);

  const status = applyRun.ok && todayRun?.ok ? "OK" : "CALIBRATION_PARTIAL";
  return jsonResponse({
    status,
    mockRun,
    applyRun,
    todayRun,
    tuningRun,
    mockExamResult,
    mockCalibration,
    calibratedStudent,
    today,
    tuning
  }, { status: status === "OK" ? 200 : 207 });
}

async function runStep(args: string[]) {
  try {
    const run = await runPnpm(args);
    return { ok: true, ...run };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function normalizeMockExamResult(body: MockCalibrationBody): { ok: true; value: Record<string, unknown> } | { ok: false; issues: string[] } {
  const issues: string[] = [];
  const slots = body.slots ?? {};
  const normalizedSlots: Record<string, unknown> = {};
  for (const key of SLOT_KEYS) {
    const slot = slots[key];
    if (!slot) {
      issues.push(`${key} is required`);
      continue;
    }
    const score = clampNumber(slot.score, Number.NaN, 0, 100);
    if (!Number.isFinite(score)) issues.push(`${key}.score must be a number from 0 to 100`);
    normalizedSlots[key] = {
      problemPid: stringValue(slot.problemPid) || `${key}-UNKNOWN`,
      title: stringValue(slot.title) || `${key} mock problem`,
      score: Number.isFinite(score) ? score : 0,
      maxScore: clampNumber(slot.maxScore, 100, 1, 100),
      timeMinutes: clampNumber(slot.timeMinutes, 0, 0, 240),
      submissionCount: clampNumber(slot.submissionCount, 0, 0, 99),
      notes: stringValue(slot.notes)
    };
  }
  if (issues.length) return { ok: false, issues };

  const slotTotal = SLOT_KEYS.reduce((sum, key) => sum + Number((normalizedSlots[key] as MockSlotInput).score ?? 0), 0);
  return {
    ok: true,
    value: {
      $schema: "csps200.mockExamResult.v1",
      examName: stringValue(body.examName) || "CSP-S 四题结构模拟",
      date: stringValue(body.date) || new Date().toISOString().slice(0, 10),
      timeLimitMinutes: clampNumber(body.timeLimitMinutes, 240, 1, 480),
      isTimed: booleanValue(body.isTimed, true),
      isIndependent: booleanValue(body.isIndependent, true),
      hasSeenSolutionsBeforeExam: booleanValue(body.hasSeenSolutionsBeforeExam, false),
      totalScore: clampNumber(body.totalScore, slotTotal, 0, 400),
      slots: normalizedSlots
    }
  };
}

function getStatus(value: unknown) {
  return value && typeof value === "object" && "status" in value ? String((value as { status?: unknown }).status ?? "UNKNOWN") : "UNKNOWN";
}

function getStatusPath(value: unknown, key: string) {
  const found = key.split(".").reduce<unknown>((current, part) => {
    return current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined;
  }, value);
  return typeof found === "string" ? found : "";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function booleanValue(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }
  return fallback;
}
