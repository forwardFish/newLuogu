import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");

type AnyRecord = Record<string, unknown>;

export type LocalLoopProfile = {
  displayName: string;
  uid: string;
  grade: string;
  targetLabel: string;
  targetScore: number;
  currentScore: number;
  dataQuality: string;
  submissionCount: number;
  problemCount: number;
  codeFileCount: number;
  latestSubmitDate: string | null;
  generatedAt: string | null;
  examDate: string | null;
};

export async function getLocalLoopProfile(): Promise<LocalLoopProfile> {
  const [config, student, today] = await Promise.all([
    readJson<AnyRecord>("config.json", {}),
    readJson<AnyRecord>("calibrated_student_analysis_report.json", {}).then((value) =>
      Object.keys(value).length ? value : readJson<AnyRecord>("student_analysis_report.json", {})
    ),
    readJson<AnyRecord>("today.json", {})
  ]);

  const target = asRecord(student.target) ?? {};
  const scoreEstimate = asRecord(student.scoreEstimate) ?? {};
  const sourceQuality = asRecord(student.sourceQuality) ?? {};
  const currentStage = asRecord(today.currentStage) ?? {};

  const uid = stringValue(config.uid, stringValue(target.uid, "未配置 UID"));
  const targetScore = numberValue(today.targetScore, numberValue(config.targetScore, numberValue(target.targetScore, 200)));
  const currentScore = numberValue(
    currentStage.currentScore,
    numberValue(scoreEstimate.estimatedCurrentScore, numberValue(config.currentScore, 0))
  );

  return {
    displayName: uid === "未配置 UID" ? "公开 UID 学生" : `Luogu ${uid}`,
    uid,
    grade: "CSP-S",
    targetLabel: `CSP-S 目标 ${targetScore}`,
    targetScore,
    currentScore,
    dataQuality: stringValue(today.dataQuality, stringValue(sourceQuality.overall, "UNKNOWN")),
    submissionCount: numberValue(sourceQuality.submissionCount, 0),
    problemCount: numberValue(sourceQuality.problemCount, 0),
    codeFileCount: numberValue(sourceQuality.codeFileCount, 0),
    latestSubmitDate: stringOrNull(sourceQuality.latestSubmitDate),
    generatedAt: stringOrNull(today.generatedAt ?? student.generatedAt),
    examDate: stringOrNull(config.examDate)
  };
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : null;
}

function numberValue(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
