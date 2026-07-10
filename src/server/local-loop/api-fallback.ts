import { formatErrorDetail } from "@/src/lib/json";
import { readLocalJson } from "./local-loop-files";
import { getLocalLoopProfile } from "./profile";
import { getLocalLoopUiData } from "./ui-data";

export const LOCAL_SUBJECT_ID = 1024038;
export const LOCAL_SYNC_JOB_ID = 1024038001;
export const LOCAL_BASELINE_REPORT_ID = 1024038002;

export function isDatabaseMissing(error: unknown) {
  const detail = formatErrorDetail(error);
  return [
    "DATABASE_URL",
    "DIRECT_URL",
    "Can't reach database server",
    "database server at",
    "P1001",
    "P1000",
    "password authentication failed"
  ].some((marker) => detail.includes(marker));
}

export async function localSubject() {
  const profile = await getLocalLoopProfile();
  return {
    subjectId: LOCAL_SUBJECT_ID,
    luoguUid: profile.uid,
    subjectType: "PUBLIC_UID",
    target: "CSP-S_FIRST_PRIZE",
    source: "data/local-loop"
  };
}

export async function localSyncJob() {
  const [profile, today, calibration, tuning] = await Promise.all([
    getLocalLoopProfile(),
    readLocalJson<Record<string, unknown>>("data/local-loop/today.json", {}),
    readLocalJson<Record<string, unknown>>("data/local-loop/calibrated_student_analysis_report.json", {}),
    readLocalJson<Record<string, unknown>>("data/local-loop/tuning_report.json", {})
  ]);
  const steps = [
    { stepName: "student_analysis_report", status: profile.generatedAt ? "DONE" : "MISSING", errorMessage: null },
    { stepName: "today_selection", status: Object.keys(today).length ? "DONE" : "MISSING", errorMessage: null },
    { stepName: "mock_calibration", status: pathStatusOf(calibration, "calibration.status") === "APPLIED" ? "DONE" : "MISSING", errorMessage: null },
    { stepName: "quality_tuning", status: String(tuning.status ?? "UNKNOWN") === "OK" ? "DONE" : "MISSING", errorMessage: null }
  ];
  return {
    syncJobId: LOCAL_SYNC_JOB_ID,
    subjectId: LOCAL_SUBJECT_ID,
    luoguUid: profile.uid,
    status: "DONE",
    progress: {
      recordPagesFetched: 0,
      rawRecordsParsed: profile.submissionCount,
      submissionsUpserted: profile.submissionCount,
      uniqueProblemsFound: profile.problemCount,
      problemsFetched: profile.problemCount,
      problemFetchFailed: 0
    },
    errors: [],
    steps,
    source: "data/local-loop"
  };
}

export async function localDataQuality() {
  const profile = await getLocalLoopProfile();
  return {
    dataQualityReportId: 1024038003,
    subjectId: LOCAL_SUBJECT_ID,
    overallScore: profile.dataQuality === "HIGH" ? 81 : 60,
    confidenceLevel: profile.dataQuality,
    recordDepthScore: Math.min(100, Math.round(profile.submissionCount / 20)),
    problemDetailScore: Math.min(100, Math.round(profile.problemCount / 8)),
    tagCoverageScore: 100,
    freshnessScore: profile.latestSubmitDate ? 65 : 30,
    manualReviewScore: profile.codeFileCount > 0 ? 90 : 40,
    issues: [],
    summary: `Local-loop analysis for Luogu ${profile.uid}: ${profile.submissionCount} submissions, ${profile.problemCount} problems, ${profile.codeFileCount} code files.`,
    createdAt: profile.generatedAt ?? new Date().toISOString(),
    source: "data/local-loop"
  };
}

export async function localBaselineReport() {
  const [profile, data, student, calibration] = await Promise.all([
    getLocalLoopProfile(),
    getLocalLoopUiData(),
    readLocalJson<Record<string, unknown>>("data/local-loop/calibrated_student_analysis_report.json", {}),
    readLocalJson<Record<string, unknown>>("data/local-loop/mock_calibration.json", {})
  ]);
  return {
    analysisReportId: LOCAL_BASELINE_REPORT_ID,
    subjectId: LOCAL_SUBJECT_ID,
    totalScore: data.currentScore,
    level: data.currentStage,
    analysisConfidence: profile.dataQuality === "HIGH" ? 0.86 : 0.62,
    dataQuality: await localDataQuality(),
    abilityScores: student.slotReadiness ?? {},
    cspReadiness: {
      currentScore: data.currentScore,
      targetScore: data.targetScore,
      gap: data.gap,
      nextMilestone: data.nextMilestone
    },
    weaknesses: data.weakestKnowledge,
    recommendations: {
      mainGoal: data.mainGoal,
      blockingIssues: data.blockingIssues,
      todayTasks: data.tasks
    },
    llmReportText: JSON.stringify({
      source: "data/local-loop",
      generatedAt: data.generatedAt,
      mockCalibration: calibration,
      reviews: data.reviews.map((review) => ({
        problemPid: review.problemPid,
        primaryError: review.primaryError,
        needRedo: review.needRedo
      }))
    }, null, 2),
    source: "data/local-loop"
  };
}

export async function localStudentAnalysisV2() {
  const baseline = await localBaselineReport();
  return {
    ...baseline,
    analysisReportId: LOCAL_BASELINE_REPORT_ID,
    summary: "Local-loop student analysis generated from synced Luogu artifacts, calibration, today plan, and training review.",
    status: "OK"
  };
}

function pathStatusOf(value: unknown, key: string) {
  const found = key.split(".").reduce<unknown>((current, part) => {
    return current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined;
  }, value);
  return typeof found === "string" ? found : "UNKNOWN";
}
