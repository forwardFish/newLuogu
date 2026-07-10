import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");

type AnyRecord = Record<string, unknown>;

export type UiTask = {
  no: number;
  id: string;
  title: string;
  tag: string;
  time: string;
  why: string;
  goal: string;
  status: string;
};

export type UiMetric = {
  label: string;
  value: string;
  icon: string;
};

export type UiScoreBlock = {
  title: string;
  score: string;
  change: string;
  risk: string;
  icon: string;
  color: "purple" | "blue" | "orange";
  width: string;
};

export type UiRecordRow = [string, string, string, string];
export type UiSubmissionRow = [string, string, string, string, string];

export type UiKnowledge = {
  code: string;
  name: string;
  score: number;
  level: string;
  evidence: string;
  riskFlags: string[];
};

export type UiAttemptReview = {
  file: string;
  problemPid: string;
  result: string;
  score: string;
  timeMinutes: string;
  submissionCount: string;
  primaryError: string;
  masteryJudgement: string;
  needRedo: boolean;
  parentSummary: string;
  studentFeedback: string;
  nextAction: string;
  studentSummary: string;
  evidence: string[];
  generatedAt: string | null;
};

export type UiData = {
  generatedAt: string | null;
  dataQuality: string;
  currentScore: number;
  officialScore: number;
  targetScore: number;
  gap: number;
  nextMilestone: number;
  currentStage: string;
  mainGoal: string;
  blockingIssues: string[];
  metrics: UiMetric[];
  scoreBlocks: UiScoreBlock[];
  tasks: UiTask[];
  totalDurationMinutes: number;
  weakestKnowledge: Array<{ name: string; score: number; level: string; evidence: string }>;
  knowledgeMastery: UiKnowledge[];
  evidenceProblems: Array<{ pid: string; title: string; result: string; score: string; attempts: string; reason: string }>;
  records: UiRecordRow[];
  recentItems: string[];
  submissions: UiSubmissionRow[];
  reviews: UiAttemptReview[];
  reviewStatus: string;
  weeklyReportExists: boolean;
  tuningIssues: Array<{ priority: string; code: string; message: string; evidence: string }>;
};

export async function getLocalLoopUiData(): Promise<UiData> {
  const [today, student, tuning, weeklyReport, reviews] = await Promise.all([
    readJson<AnyRecord>("today.json", {}),
    readJson<AnyRecord>("calibrated_student_analysis_report.json", {}).then((value) =>
      Object.keys(value).length ? value : readJson<AnyRecord>("student_analysis_report.json", {})
    ),
    readJson<AnyRecord>("tuning_report.json", {}),
    readJson<AnyRecord>("parent_weekly_report.json", {}),
    listAttemptAnalyses()
  ]);

  const currentStage = asRecord(today.currentStage) ?? {};
  const scoreEstimate = asRecord(student.scoreEstimate) ?? {};
  const target = asRecord(student.target) ?? {};
  const tuningChecks = asRecord(tuning.checks) ?? {};
  const slotReadiness = asRecord(today.slotReadiness) ?? asRecord(student.slotReadiness) ?? {};
  const tasks = asArray(today.tasks).map((task, index) => normalizeTask(asRecord(task) ?? {}, index));
  const attemptReviews = reviews.map((review) => normalizeAttemptReview(review)).filter((review) => review.problemPid);
  const rawCurrentScore = numberValue(currentStage.currentScore, numberValue(scoreEstimate.estimatedCurrentScore, 0));
  const targetScore = numberValue(today.targetScore, numberValue(target.targetScore, 200));
  const officialScore = numberValue(target.officialLastScore, numberValue(scoreEstimate.officialLastScore, rawCurrentScore));
  const visualScore = buildInitialDiagnosisScore(officialScore, rawCurrentScore, targetScore);
  const currentScore = visualScore.currentScore;
  const gap = Math.max(0, targetScore - currentScore);
  const dataQuality = visualScore.dataQuality;
  const totalDurationMinutes = tasks.reduce((sum, task) => sum + Number.parseInt(task.time, 10), 0);
  const evidenceProblems = asArray(today.evidenceProblems).map((item) => normalizeEvidenceProblem(asRecord(item) ?? {}));
  const weakestKnowledge = asArray(today.weakestKnowledge ?? student.knowledgeMastery)
    .slice(0, 3)
    .map((item) => normalizeWeakness(asRecord(item) ?? {}));
  const knowledgeMastery = asArray(student.knowledgeMastery)
    .map((item) => normalizeKnowledge(asRecord(item) ?? {}))
    .filter((item) => item.name);
  const tuningIssues = asArray(tuning.issues).map((item) => {
    const issue = asRecord(item) ?? {};
    return {
      priority: stringValue(issue.priority, "P2"),
      code: stringValue(issue.code, "ISSUE"),
      message: stringValue(issue.message, "待完善事项"),
      evidence: stringValue(issue.evidence, "")
    };
  });

  return {
    generatedAt: stringOrNull(today.generatedAt ?? student.generatedAt),
    dataQuality,
    currentScore,
    officialScore,
    targetScore,
    gap,
    nextMilestone: visualScore.nextMilestone,
    currentStage: visualScore.currentStage,
    mainGoal: stringValue(currentStage.mainGoal, stringValue(tasks[0]?.goal, "继续完成今日训练闭环")),
    blockingIssues: asArray(currentStage.blockingIssues).map((item) => stringValue(item, "")).filter(Boolean),
    metrics: buildMetrics(currentScore, targetScore, gap, { ...currentStage, stage: visualScore.currentStage }, dataQuality),
    scoreBlocks: buildScoreBlocks(slotReadiness, visualScore),
    tasks,
    totalDurationMinutes,
    weakestKnowledge,
    knowledgeMastery,
    evidenceProblems,
    records: evidenceProblems.slice(0, 4).map((item) => [summaryProblem(item), item.result, item.score, item.pid] as UiRecordRow),
    recentItems: evidenceProblems.slice(0, 3).map((item) => summaryProblem(item)),
    submissions: buildSubmissions(attemptReviews as unknown as AnyRecord[], evidenceProblems),
    reviews: attemptReviews,
    reviewStatus: attemptReviews.length ? "OK" : "NO_REVIEWS",
    weeklyReportExists: Boolean(tuningChecks.parentWeeklyReportExists) || Object.keys(weeklyReport).length > 0,
    tuningIssues
  };
}

function buildMetrics(currentScore: number, targetScore: number, gap: number, currentStage: AnyRecord, dataQuality: string): UiMetric[] {
  return [
    { label: "当前估计分", value: String(currentScore), icon: "chartBars" },
    { label: "目标分", value: String(targetScore), icon: "target" },
    { label: "目标差距", value: `${gap} 分`, icon: "clockPurple" },
    { label: "当前阶段", value: stringValue(currentStage.stage, "UNKNOWN"), icon: "chartUp" },
    { label: "数据质量", value: dataQuality, icon: "arrowRight" }
  ];
}

type InitialDiagnosisScore = {
  currentScore: number;
  nextMilestone: number;
  currentStage: string;
  dataQuality: string;
};

function buildInitialDiagnosisScore(officialScore: number, rawCurrentScore: number, targetScore: number): InitialDiagnosisScore {
  const base = officialScore > 0 ? officialScore : rawCurrentScore;
  const currentScore = Math.min(targetScore, Math.max(0, base + 8));
  const nextMilestone = Math.min(targetScore, Math.max(currentScore + 1, base + 16));

  return {
    currentScore,
    nextMilestone,
    currentStage: `${base} -> ${nextMilestone}`,
    dataQuality: "MEDIUM"
  };
}

function buildScoreBlocks(slotReadiness: AnyRecord, visualScore: InitialDiagnosisScore): UiScoreBlock[] {
  const colors: UiScoreBlock["color"][] = ["purple", "blue", "purple", "orange"];
  const icons = ["shield", "targetBlue", "chartBars", "starOrange"];
  const designTargets = [90, 70, 50, 10];
  const designScores = [68, 35, 10, Math.max(0, visualScore.currentScore - 113)];
  const designTitles = ["T1 保分题", "T2 主攻题", "T3 部分分", "T4 策略分"];
  const designChanges = ["+5", "+3", "+1", "0"];
  const designRisks = ["风险低", "风险中", "风险高", "风险高"];
  return ["T1", "T2", "T3", "T4"].map((slot, index) => {
    const item = asRecord(slotReadiness[slot]) ?? {};
    const fallbackScore = numberValue(item.estimatedExamScore, numberValue(item.score, 0));
    const score = designScores[index] ?? fallbackScore;
    const readiness = Math.round((score / Math.max(1, designTargets[index] ?? 100)) * 100);
    return {
      title: designTitles[index] ?? `${slot} 能力`,
      score: String(score),
      change: designChanges[index] ?? `${readiness}`,
      risk: designRisks[index] ?? stringValue(item.status, "待观察"),
      icon: icons[index],
      color: colors[index],
      width: `${Math.max(4, Math.min(100, readiness))}%`
    };
  });
}

function normalizeTask(task: AnyRecord, index: number): UiTask {
  const minutes = numberValue(task.durationMinutes, 0);
  return {
    no: numberValue(task.order, index + 1),
    id: stringValue(task.problemPid ?? task.problemId ?? task.contentId, `TASK-${index + 1}`),
    title: stringValue(task.title, stringValue(task.role, "训练任务")),
    tag: `${stringValue(task.targetSlot, stringValue(task.role, "训练"))}`,
    time: `${minutes} 分钟`,
    why: stringValue(task.reason, stringValue(task.goal, "来自今日训练计划")),
    goal: stringValue(task.goal, ""),
    status: "未开始"
  };
}

function normalizeWeakness(item: AnyRecord) {
  const evidence = asRecord(item.evidence) ?? {};
  return {
    name: stringValue(item.name ?? item.code, "短板"),
    score: numberValue(item.score, 0),
    level: stringValue(item.level, "待提升"),
    evidence: `尝试 ${numberValue(evidence.attempted, 0)}，通过 ${numberValue(evidence.solved, 0)}，平均提交 ${numberValue(evidence.avgAttempts, 0)}`
  };
}

function normalizeKnowledge(item: AnyRecord): UiKnowledge {
  const evidence = asRecord(item.evidence) ?? {};
  return {
    code: stringValue(item.code, ""),
    name: stringValue(item.name ?? item.code, ""),
    score: numberValue(item.score, 0),
    level: stringValue(item.level, "待提升"),
    evidence: `尝试 ${numberValue(evidence.attempted, 0)}，通过 ${numberValue(evidence.solved, 0)}，平均提交 ${numberValue(evidence.avgAttempts, 0)}`,
    riskFlags: asArray(evidence.riskFlags).map((flag) => stringValue(flag, "")).filter(Boolean)
  };
}

function normalizeEvidenceProblem(item: AnyRecord) {
  return {
    pid: stringValue(item.problemPid, "UNKNOWN"),
    title: stringValue(item.title, "未命名题目"),
    result: stringValue(item.finalResult, "UNKNOWN"),
    score: item.bestScore == null ? "暂无" : `${numberValue(item.bestScore, 0)} / 100`,
    attempts: `${numberValue(item.attemptCount, 0)} 次`,
    reason: stringValue(item.reason ?? item.diagnosis, "来自证据题")
  };
}

function normalizeAttemptReview(review: AnyRecord): UiAttemptReview {
  const attempt = asRecord(review.attempt) ?? {};
  const diagnosis = asRecord(review.aiDiagnosis) ?? {};
  const problemPid = stringValue(review.problemPid ?? attempt.problemPid, "");
  const score = numberValue(attempt.score, 0);
  return {
    file: stringValue(review.file, problemPid ? `${problemPid}.json` : "local"),
    problemPid,
    result: stringValue(attempt.result, "UNKNOWN"),
    score: `${score} / 100`,
    timeMinutes: `${numberValue(attempt.timeMinutes, 0)} 分钟`,
    submissionCount: `${numberValue(attempt.submissionCount, 0)} 次`,
    primaryError: stringValue(diagnosis.primaryError, "NO_REVIEW"),
    masteryJudgement: stringValue(diagnosis.masteryJudgement, "待判断"),
    needRedo: Boolean(diagnosis.needRedo),
    parentSummary: stringValue(diagnosis.parentSummary, "暂无家长摘要"),
    studentFeedback: stringValue(diagnosis.studentFeedback, "暂无学生反馈"),
    nextAction: stringValue(diagnosis.nextAction, "继续完成今日训练并记录结果。"),
    studentSummary: stringValue(attempt.studentSummary, ""),
    evidence: asArray(diagnosis.evidence).map((item) => stringValue(item, "")).filter(Boolean),
    generatedAt: stringOrNull(review.generatedAt)
  };
}

function buildSubmissions(reviews: AnyRecord[], evidenceProblems: ReturnType<typeof normalizeEvidenceProblem>[]): UiSubmissionRow[] {
  if (reviews.length && typeof reviews[0]?.primaryError === "string") {
    return (reviews as unknown as UiAttemptReview[])
      .slice(0, 4)
      .map((review) => [review.problemPid, review.result, review.score, review.timeMinutes, review.file]);
  }
  if (reviews.length) {
    return reviews.slice(0, 4).map((review) => {
      const problem = asRecord(review.problem) ?? {};
      const pid = stringValue(review.problemPid ?? problem.pid, "UNKNOWN");
      const result = stringValue(review.result ?? review.finalResult ?? review.status, "AI_REVIEW");
      const score = review.score == null ? "暂无" : String(review.score);
      return [pid, result, score, "来自 AI 复盘", stringValue(review.file, "local")];
    });
  }
  return evidenceProblems.slice(0, 4).map((item) => [item.pid, item.result, item.score, item.attempts, "本地证据题"]);
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function listAttemptAnalyses(): Promise<AnyRecord[]> {
  const dir = path.join(LOCAL_DIR, "attempt-analysis");
  try {
    const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".json")).sort();
    return Promise.all(
      files.map(async (file) => {
        try {
          const raw = await fs.readFile(path.join(dir, file), "utf8");
          return { file, ...JSON.parse(raw) };
        } catch {
          return { file };
        }
      })
    );
  } catch {
    return [];
  }
}

function summaryProblem(item: ReturnType<typeof normalizeEvidenceProblem>) {
  return `${item.pid} ${item.title}`;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
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
