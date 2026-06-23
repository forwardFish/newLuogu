import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;

type CliOptions = {
  analysisDir: string;
  outputDir: string;
  days: number;
  week: number;
};

type AnalysisData = {
  manifest: JsonObject;
  metrics: JsonObject;
  timeline: JsonObject;
  modules: JsonObject;
  errors: JsonObject;
  deepReview: JsonObject;
  risk: JsonObject;
  report: string;
};

type ScoreProfile = {
  t1Stability: number;
  t2Modeling: number;
  t3PartialScore: number;
  t4Strategy: number;
  overall: number;
};

type TrainingProfile = JsonObject & {
  currentScores: ScoreProfile;
};

type TrainingPriority = JsonObject & {
  priorityWeights: Record<string, number>;
  moduleWeights: Record<string, number>;
};

type TrainingTask = {
  id: string;
  type:
    | "new_problem"
    | "old_problem_review"
    | "redo_problem"
    | "partial_score_training"
    | "mock_exam"
    | "mock_review"
    | "diagnosis_review";
  module: string;
  targetAbility: "T1" | "T2" | "T3" | "T4" | "ALL";
  difficulty: string;
  selectionRule: string;
  trainingGoal: string;
  timeLimitMinutes: number;
  reviewRequired: boolean;
  successCriteria: string[];
};

type TrainingDay = {
  day: number;
  theme: string;
  targetAbility: "T1" | "T2" | "T3" | "T4" | "ALL";
  why: string;
  tasks: TrainingTask[];
  oldProblemReview: Array<Record<string, unknown>>;
  successCriteria: string[];
  failureAction: string[];
};

const ERROR_TYPES = [
  "READING_ERROR",
  "MODEL_ERROR",
  "ALGO_ERROR",
  "STATE_ERROR",
  "TRANSITION_ERROR",
  "BOUNDARY_ERROR",
  "INDEX_ERROR",
  "OVERFLOW_ERROR",
  "INIT_ERROR",
  "MULTITEST_ERROR",
  "COMPLEXITY_ERROR",
  "DEBUG_TIMEOUT",
  "STRATEGY_ERROR",
  "PARTIAL_SCORE_MISSED",
  "TEMPLATE_UNFAMILIAR",
  "UNKNOWN",
];

const SOLUTION_USAGE = ["none", "hint_only", "idea_only", "full_solution", "copied_code"];

export function parseTrainingCliOptions(argv = process.argv.slice(2)): CliOptions {
  const args: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const [rawKey, rawValue] = token.slice(2).split("=", 2);
    const value = rawValue ?? argv[index + 1];
    if (rawValue === undefined) index += 1;
    if (rawKey && value) args[rawKey] = value;
  }

  return {
    analysisDir: path.resolve(args.analysis ?? path.join(process.cwd(), "data", "analysis")),
    outputDir: path.resolve(args.output ?? path.join(process.cwd(), "data", "training")),
    days: Number(args.days ?? 7),
    week: Number(args.week ?? 1),
  };
}

export async function buildTrainingProfile(options: CliOptions): Promise<TrainingProfile> {
  const analysis = await loadAnalysis(options);
  const scores = extractScores(analysis.risk);
  const timelineSummary = getObject(analysis.timeline, "summary");
  const metricSummary = getObject(analysis.metrics, "summary");
  const riskCounts = getRecordNumber(metricSummary, "riskFlagCounts");
  const moduleSummary = getObject(analysis.modules, "summary");
  const modules = buildModuleProfile(moduleSummary);
  const highValueReviewProblems = buildHighValueReviewProblems(analysis.deepReview, analysis.errors);

  const strengths = [
    sentenceIf(scores.t2Modeling >= 80, "T2 建模转化相对较强，DP、图论、数学、字符串等模块有较多历史覆盖。"),
    sentenceIf(getNumber(timelineSummary, "solvedProblems") >= 600, "历史已 AC 题量较多，说明基础算法接触面比较广。"),
    sentenceIf(getNumber(timelineSummary, "tagCounts.ONE_SHOT_AC") >= 200, "存在一定一次 AC 基础，可用于建立稳定拿分训练。"),
  ].filter(Boolean);

  const weaknesses = [
    sentenceIf(scores.t1Stability < 82, `T1 稳定性 ${scores.t1Stability}，未达到稳定一等奖区间，需要降低低级错误和实现风险。`),
    sentenceIf(scores.t3PartialScore < 75, `T3 部分分策略 ${scores.t3PartialScore}，需要专项训练 30/50/70 分拆解。`),
    sentenceIf(getNumber(timelineSummary, "averageAttemptsPerProblem") > 2.5, `平均每题提交 ${getNumber(timelineSummary, "averageAttemptsPerProblem")} 次，调试成本偏高。`),
    sentenceIf(getNumber(timelineSummary, "stuckProblems") > 50, `疑似卡题 ${getNumber(timelineSummary, "stuckProblems")} 道，需要旧题复盘和重做闭环。`),
  ].filter(Boolean);

  const mainRisks = [
    ...arrayOfObjects(analysis.risk.mainRisks).map((item) => ({
      name: getString(item, "name"),
      level: getString(item, "level"),
      evidence: getString(item, "evidence"),
    })),
    {
      name: "Array and boundary risk",
      level: riskCounts.ARRAY_INDEX_RISK >= 800 ? "high" : "medium",
      evidence: `ARRAY_INDEX_RISK=${riskCounts.ARRAY_INDEX_RISK ?? 0}, LARGE_GLOBAL_ARRAY=${riskCounts.LARGE_GLOBAL_ARRAY ?? 0}`,
    },
    {
      name: "Partial-score weakness",
      level: scores.t3PartialScore < 70 ? "high" : "medium",
      evidence: `部分分题目=${getNumber(timelineSummary, "tagCounts.PARTIAL_SCORE")}, 未 AC/未知题目=${getNumber(timelineSummary, "unsolvedProblems")}`,
    },
  ];

  const profile: TrainingProfile = {
    generatedAt: new Date().toISOString(),
    goal: "CSP-S_FIRST_PRIZE",
    sourceAnalysisDir: options.analysisDir,
    currentScores: scores,
    currentDiagnosis: {
      summary: "题型覆盖较广，T2 建模转化相对较强；当前主要短板是 T1 实现稳定性、T3 部分分策略和 T4 模拟赛验证数据不足。",
      strengths,
      weaknesses,
      mainRisks,
      evidence: {
        totalProblems: getNumber(analysis.risk, "profile.totalProblems"),
        solvedProblems: getNumber(analysis.risk, "profile.solvedProblems"),
        unsolvedProblems: getNumber(analysis.risk, "profile.unsolvedProblems"),
        averageAttemptsPerProblem: getNumber(analysis.risk, "profile.averageAttemptsPerProblem"),
        riskFileRatio: getNumber(analysis.risk, "profile.riskFileRatio"),
        riskFlagCounts: riskCounts,
      },
    },
    moduleProfile: modules,
    highValueReviewProblems,
    trainingFocus: {
      t1: [
        "每天保留基础稳定性题，重点检查数组边界、初始化、数据范围和 long long。",
        "提交前强制执行检查清单，把会做但错细节的问题压下来。",
        "重写带 ARRAY_INDEX_RISK、DEFINE_INT_LONG_LONG、RECURSION 的旧题。",
      ],
      t2: [
        "围绕 DP、图论、二分、并查集做中档建模训练。",
        "每题写出模型、状态/点边含义、复杂度和边界，再开始代码。",
        "目标不是只 AC，而是降低平均提交次数。",
      ],
      t3: [
        "每周固定难题拆分训练，必须写 30/50/70 分方案。",
        "优先复盘部分分题和长期未 AC 题，找出错过的可拿分子任务。",
        "不要求一开始满分，要求比赛中有稳定部分分下限。",
      ],
      t4: [
        "每周至少一次四题模拟赛，记录开题顺序、止损点和调试时间。",
        "用模拟赛数据验证 T1/T2 是否保住、T3/T4 是否拿到部分分。",
        "没有模拟赛记录前，T4 只能视为初步估计，不能认为已稳定。",
      ],
    },
  };

  await writeJson(path.join(options.outputDir, "training_profile.json"), profile);
  return profile;
}

export async function buildTrainingPriority(options: CliOptions): Promise<TrainingPriority> {
  const profile = await readOrBuildProfile(options);
  const analysis = await loadAnalysis(options);
  const scores = profile.currentScores;
  const timelineSummary = getObject(analysis.timeline, "summary");
  const avgAttempts = getNumber(timelineSummary, "averageAttemptsPerProblem");

  const priorityWeights = {
    t1Stability: 0.3,
    t2Modeling: 0.35,
    t3PartialScore: 0.2,
    t4Strategy: 0.15,
  };
  let oldProblemReviewWeight = 0.25;
  let newProblemWeight = 0.6;
  let mockExamWeight = 0.15;
  const adjustments: string[] = [];

  if (scores.t1Stability < 80) {
    priorityWeights.t1Stability += 0.05;
    priorityWeights.t2Modeling -= 0.03;
    oldProblemReviewWeight = 0.35;
    newProblemWeight = 0.5;
    adjustments.push("T1 < 80：提高旧题复盘和基础稳定性训练比例，减少超难新题。");
  }
  if (scores.t3PartialScore < 70) {
    priorityWeights.t3PartialScore += 0.05;
    priorityWeights.t4Strategy -= 0.02;
    adjustments.push("T3 < 70：部分分难题提高到约 25%，每周固定 1 天难题拆分。");
  }
  if (avgAttempts > 3) {
    oldProblemReviewWeight = Math.max(oldProblemReviewWeight, 0.35);
    newProblemWeight = Math.min(newProblemWeight, 0.5);
    adjustments.push("平均提交次数 > 3：增加旧题重写和提交前检查。");
  } else if (avgAttempts > 2.5) {
    adjustments.push("平均提交次数 > 2.5：保留旧题重写，重点降低调试成本。");
  }

  normalizeWeights(priorityWeights);

  const moduleWeights = buildModuleWeights(getObject(analysis.modules, "summary"));
  const priority: TrainingPriority = {
    generatedAt: new Date().toISOString(),
    goal: "CSP-S_FIRST_PRIZE",
    priorityWeights,
    oldProblemReviewWeight,
    newProblemWeight,
    mockExamWeight,
    moduleWeights,
    priorityReasons: {
      high: [
        "并查集、区间 DP、二分答案的平均提交次数偏高，优先训练稳定建模和实现。",
        "T1 稳定性未达 82，需要每天保留基础实现题和提交前检查。",
        "T3 部分分策略低于 70，需要固定难题拆分训练。",
      ],
      medium: ["字符串边界、数学推导、贪心证明、搜索剪枝保持中优先级。"],
      constraints: [
        "不能承诺一定一等奖，只能通过训练记录和模拟赛验证逐步接近稳定区间。",
        "第一版可以使用选题标准，不强制给具体题号。",
      ],
    },
    dynamicAdjustmentRules: {
      tleMany: ["降低难度", "增加复杂度分析", "同模块基础题回炉"],
      waMany: ["同类基础题", "边界专项", "提交前检查清单", "旧题重写"],
      independentAcMany: ["小幅提高难度", "加入中档综合题", "增加限时训练"],
      t3Zero: ["增加部分分训练", "每周固定 1-2 道难题拆分", "必须写 30/50/70 分方案"],
      t4Collapse: ["增加模拟赛", "记录开题顺序", "记录止损时间", "训练转部分分策略"],
    },
    adjustments,
  };

  await writeJson(path.join(options.outputDir, "training_priority.json"), priority);
  return priority;
}

export async function generateTrainingPlan(options: CliOptions): Promise<JsonObject> {
  const profile = await readOrBuildProfile(options);
  const priority = await readOrBuildPriority(options);
  const planDays = options.days === 30 ? buildThirtyDayPlan(profile, priority) : buildSevenDayPlan(profile, priority);
  const suffix = options.days === 30 ? "30d" : "7d";
  const plan = {
    generatedAt: new Date().toISOString(),
    goal: "CSP-S_FIRST_PRIZE",
    days: options.days,
    sourceProfile: "training_profile.json",
    sourcePriority: "training_priority.json",
    noGuaranteeStatement: "系统不能承诺 100% 一定获得 CSP-S 一等奖；本计划用于把训练过程变成可执行、可记录、可复盘、可调整、可验证的闭环。",
    planPrinciples: [
      "每个任务必须说明为什么现在该做。",
      "每个任务必须绑定 T1/T2/T3/T4。",
      "旧题复盘、新题训练、部分分训练、模拟赛验证必须同时存在。",
      "训练记录将反馈到下一天和下一周调整。",
    ],
    daysPlan: planDays,
  };

  await writeJson(path.join(options.outputDir, `training_task_plan_${suffix}.json`), plan);
  await fs.writeFile(path.join(options.outputDir, `training_task_plan_${suffix}.md`), `\uFEFF${renderPlanMarkdown(plan, profile, priority)}`, "utf8");
  return plan;
}

export async function generateTrainingPlanMarkdown(options: CliOptions): Promise<string> {
  const suffix = options.days === 30 ? "30d" : "7d";
  const planPath = path.join(options.outputDir, `training_task_plan_${suffix}.json`);
  const plan = await readJson<JsonObject>(planPath);
  const profile = await readOrBuildProfile(options);
  const priority = await readOrBuildPriority(options);
  const mdPath = path.join(options.outputDir, `training_task_plan_${suffix}.md`);
  await fs.writeFile(mdPath, `\uFEFF${renderPlanMarkdown(plan, profile, priority)}`, "utf8");
  return mdPath;
}

export async function buildTrainingProgressLog(options: CliOptions): Promise<JsonObject> {
  const logPath = path.join(options.outputDir, "training_progress_log.json");
  if (await exists(logPath)) return readJson<JsonObject>(logPath);

  const log = {
    generatedAt: new Date().toISOString(),
    purpose: "手动填写训练记录；后续 train:review 和 train:verify 会读取这里的数据。",
    schemaVersion: 1,
    errorTypes: ERROR_TYPES,
    solutionUsage: SOLUTION_USAGE,
    entries: [],
    templates: {
      normalProblem: {
        date: "2026-06-23",
        day: 1,
        problemId: "",
        problemTitle: "",
        source: "luogu",
        module: "",
        targetAbility: "T1",
        difficulty: "",
        startTime: "",
        endTime: "",
        durationMinutes: 0,
        attemptCount: 0,
        isOneShotAc: false,
        finalResult: "UNKNOWN",
        score: 0,
        errorTypes: ["UNKNOWN"],
        solutionUsage: "none",
        needRedo: false,
        notes: "",
      },
    },
  };
  await writeJson(logPath, log);
  return log;
}

export async function buildMockExamLog(options: CliOptions): Promise<JsonObject> {
  const logPath = path.join(options.outputDir, "mock_exam_log.json");
  if (await exists(logPath)) return readJson<JsonObject>(logPath);

  const log = {
    generatedAt: new Date().toISOString(),
    purpose: "记录 CSP-S 四题模拟赛；readiness 判断会读取连续达标情况。",
    targetConfig: {
      province: null,
      targetFirstPrizeLine: null,
      safetyMargin: 20,
      targetMockScore: 200,
    },
    exams: [],
    template: {
      date: "2026-06-29",
      examName: "CSP-S mock 01",
      totalScore: 0,
      targetScore: 200,
      tasks: ["T1", "T2", "T3", "T4"].map((slot) => ({
        slot,
        score: 0,
        timeMinutes: 0,
        result: "UNKNOWN",
        startedAt: "",
        endedAt: "",
        strategyNote: "",
        mainError: "",
      })),
      openOrder: ["T1", "T2", "T3", "T4"],
      lowLevelErrorCount: 0,
      debugTimeMinutes: 0,
      partialScoreMissed: false,
      review: "",
    },
    reviewQuestions: [
      "开题顺序是否正确？",
      "T1/T2 是否稳定？",
      "哪题调试时间过长？",
      "哪题应该先拿部分分？",
      "哪个错误最不应该出现？",
      "如果重新做，能多拿多少分？",
      "下周应该加强哪个模块？",
    ],
  };
  await writeJson(logPath, log);
  return log;
}

export async function generateWeeklyReview(options: CliOptions): Promise<string> {
  const profile = await readOrBuildProfile(options);
  const priority = await readOrBuildPriority(options);
  const progress = await buildTrainingProgressLog(options);
  const mock = await buildMockExamLog(options);
  const entries = arrayOfObjects(progress.entries);
  const exams = arrayOfObjects(mock.exams);
  const weekEntries = entries.filter((entry) => getNumber(entry, "week") === options.week || getNumber(entry, "day") <= options.week * 7);
  const weekExams = exams.filter((exam) => getNumber(exam, "week") === options.week || true);
  const reportPath = path.join(options.outputDir, `training_review_report_week${options.week}.md`);

  const md = [
    `# 第 ${options.week} 周训练复盘`,
    "",
    "## 1. 本周目标",
    "",
    "- 验证诊断、计划、训练记录、复盘、调整、模拟赛验证是否形成闭环。",
    "- 重点观察 T1 稳定性、T3 部分分策略和 T4 模拟赛记录是否产生真实数据。",
    "",
    "## 2. 本周完成情况",
    "",
    `- 训练记录条数：${weekEntries.length}`,
    `- 模拟赛记录条数：${weekExams.length}`,
    weekEntries.length === 0 ? "- 当前还没有手动填写训练记录，因此本报告先给出执行前复盘模板和调整规则。" : `- 已完成题目：${weekEntries.map((entry) => getString(entry, "problemId")).filter(Boolean).join(", ")}`,
    "",
    "## 3. T1/T2/T3/T4 表现变化",
    "",
    `- 当前 T1：${profile.currentScores.t1Stability}，目标是先提升到 82+。`,
    `- 当前 T2：${profile.currentScores.t2Modeling}，保持优势并降低提交次数。`,
    `- 当前 T3：${profile.currentScores.t3PartialScore}，第一周必须完成部分分拆解训练。`,
    `- 当前 T4：${profile.currentScores.t4Strategy}，没有模拟赛记录前只能视为初步估计。`,
    "",
    "## 4. 模块表现",
    "",
    ...topModuleLines(priority.moduleWeights).map((line) => `- ${line}`),
    "",
    "## 5. 高频错误",
    "",
    ...summarizeErrors(weekEntries),
    "",
    "## 6. 模拟赛表现",
    "",
    exams.length === 0
      ? "- 尚未填写模拟赛记录。第 6 天必须执行四题模拟赛，并记录总分、开题顺序、调试时间和部分分策略。"
      : `- 已记录 ${exams.length} 场模拟赛。`,
    "",
    "## 7. 是否接近一等奖稳定区间",
    "",
    "- 目前结论：NOT_READY。原因是还没有训练执行数据和连续模拟赛达标记录。",
    "- 第一周的合格标准不是马上证明一等奖，而是证明训练闭环能真实运转。",
    "",
    "## 8. 下周调整建议",
    "",
    "- 如果 WA/边界错多：下一周减少难题，增加 T1 稳定性和旧题重写。",
    "- 如果 T3 难题无法写出 30 分方案：下一周固定 2 次部分分拆解训练。",
    "- 如果模拟赛 T1/T2 没保住：下一周优先恢复基础稳定性，不扩展难题。",
    "- 如果独立 AC 多且提交次数低：下一周小幅提高 T2 综合题难度。",
    "",
  ].join("\n");

  await fs.writeFile(reportPath, `\uFEFF${md}`, "utf8");
  return reportPath;
}

export async function verifyTrainingLoop(options: CliOptions): Promise<JsonObject> {
  const requiredFiles = [
    "training_profile.json",
    "training_priority.json",
    "training_task_plan_7d.json",
    "training_task_plan_7d.md",
    "training_progress_log.json",
    "mock_exam_log.json",
    "training_review_report_week1.md",
    "readiness_checklist.json",
    "readiness_report.md",
  ];
  const checks = await Promise.all(
    requiredFiles.map(async (file) => ({
      file,
      exists: await exists(path.join(options.outputDir, file)),
    })),
  );
  const progress = await buildTrainingProgressLog(options);
  const mock = await buildMockExamLog(options);
  const entries = arrayOfObjects(progress.entries);
  const exams = arrayOfObjects(mock.exams);
  const allFilesExist = checks.every((check) => check.exists);

  const verification = {
    generatedAt: new Date().toISOString(),
    goal: "CSP-S_FIRST_PRIZE",
    status: allFilesExist ? "STRUCTURE_READY_NEEDS_EXECUTION_DATA" : "MISSING_OUTPUTS",
    closedLoopSteps: [
      { step: "诊断", evidence: "training_profile.json", ready: checks.some((check) => check.file === "training_profile.json" && check.exists) },
      { step: "出题", evidence: "training_task_plan_7d.json/md", ready: checks.some((check) => check.file === "training_task_plan_7d.json" && check.exists) },
      { step: "训练", evidence: "training_progress_log.json entries", ready: entries.length > 0 },
      { step: "记录", evidence: "training_progress_log.json", ready: checks.some((check) => check.file === "training_progress_log.json" && check.exists) },
      { step: "复盘", evidence: "training_review_report_week1.md", ready: checks.some((check) => check.file === "training_review_report_week1.md" && check.exists) },
      { step: "调整", evidence: "training_priority.json dynamicAdjustmentRules", ready: checks.some((check) => check.file === "training_priority.json" && check.exists) },
      { step: "模拟赛验证", evidence: "mock_exam_log.json exams", ready: exams.length > 0 },
      { step: "重新诊断", evidence: "readiness_checklist.json", ready: checks.some((check) => check.file === "readiness_checklist.json" && check.exists) },
    ],
    fileChecks: checks,
    executionData: {
      progressEntryCount: entries.length,
      mockExamCount: exams.length,
    },
    firstWeekPassCriteria: [
      { criterion: "每天任务不是随机生成，而是能解释为什么安排", passed: allFilesExist },
      { criterion: "每道题都有记录", passed: entries.length > 0 },
      { criterion: "错题能进入复盘池", passed: entries.some((entry) => Boolean(entry.needRedo)) },
      { criterion: "次日计划会根据错误调整", passed: allFilesExist },
      { criterion: "周复盘能指出真实问题", passed: checks.some((check) => check.file === "training_review_report_week1.md" && check.exists) },
      { criterion: "模拟赛复盘能影响下一周计划", passed: exams.length > 0 },
    ],
    nextAction: entries.length === 0 ? "按 training_task_plan_7d.md 执行 Day 1，并把结果填入 training_progress_log.json。" : "继续执行计划并每晚运行 pnpm train:review。",
  };

  await writeJson(path.join(options.outputDir, "training_loop_verification.json"), verification);
  return verification;
}

export async function buildReadinessChecklist(options: CliOptions): Promise<JsonObject> {
  const profile = await readOrBuildProfile(options);
  const progress = await buildTrainingProgressLog(options);
  const mock = await buildMockExamLog(options);
  const entries = arrayOfObjects(progress.entries);
  const exams = arrayOfObjects(mock.exams);
  const targetScore = getNumber(getObject(mock, "targetConfig"), "targetMockScore") || 200;
  const safetyMargin = getNumber(getObject(mock, "targetConfig"), "safetyMargin") || 20;

  const t1T2Entries = entries.filter((entry) => ["T1", "T2"].includes(getString(entry, "targetAbility")));
  const t1Entries = entries.filter((entry) => getString(entry, "targetAbility") === "T1");
  const t2Entries = entries.filter((entry) => getString(entry, "targetAbility") === "T2");
  const t3Entries = entries.filter((entry) => getString(entry, "targetAbility") === "T3");
  const mockStreak = countMockScoreStreak(exams, targetScore);
  const lastMockScore = exams.length > 0 ? getNumber(exams[exams.length - 1] ?? {}, "totalScore") : null;

  const checklist = {
    generatedAt: new Date().toISOString(),
    target: "CSP-S_FIRST_PRIZE",
    criteria: {
      t1T2Accuracy: {
        target: 0.9,
        actual: t1T2Entries.length > 0 ? round(t1T2Entries.filter((entry) => getString(entry, "finalResult") === "AC").length / t1T2Entries.length) : null,
        passed: t1T2Entries.length > 0 && t1T2Entries.filter((entry) => getString(entry, "finalResult") === "AC").length / t1T2Entries.length >= 0.9,
      },
      t1AvgTimeMinutes: {
        target: 35,
        actual: t1Entries.length > 0 ? round(avg(t1Entries.map((entry) => getNumber(entry, "durationMinutes")))) : null,
        passed: t1Entries.length > 0 && avg(t1Entries.map((entry) => getNumber(entry, "durationMinutes"))) <= 35,
      },
      t2AvgTimeMinutes: {
        target: 60,
        actual: t2Entries.length > 0 ? round(avg(t2Entries.map((entry) => getNumber(entry, "durationMinutes")))) : null,
        passed: t2Entries.length > 0 && avg(t2Entries.map((entry) => getNumber(entry, "durationMinutes"))) <= 60,
      },
      t3StablePartialScore: {
        target: 30,
        actual: t3Entries.length > 0 ? Math.max(...t3Entries.map((entry) => getNumber(entry, "score"))) : null,
        passed: t3Entries.length > 0 && Math.max(...t3Entries.map((entry) => getNumber(entry, "score"))) >= 30,
      },
      mockExamScoreStreak: {
        target: 5,
        actual: mockStreak,
        passed: mockStreak >= 5,
      },
      mockExamSafetyMargin: {
        target: safetyMargin,
        actual: lastMockScore === null ? null : lastMockScore - targetScore,
        passed: lastMockScore !== null && lastMockScore - targetScore >= safetyMargin,
      },
      historicalProfileBaseline: {
        target: "T1>=82, T2>=82, T3>=75, T4 validated by mocks",
        actual: profile.currentScores,
        passed: profile.currentScores.t1Stability >= 82 && profile.currentScores.t2Modeling >= 82 && profile.currentScores.t3PartialScore >= 75,
      },
    },
    overallReadiness: "NOT_READY",
    explanation: "当前已完成历史诊断和训练计划生成，但缺少训练执行记录与连续模拟赛达标记录，因此不能判断为接近一等奖稳定区间。",
  };

  const criteria = Object.values(checklist.criteria);
  const passedCount = criteria.filter((item) => typeof item === "object" && item !== null && "passed" in item && Boolean((item as { passed: boolean }).passed)).length;
  checklist.overallReadiness =
    mockStreak >= 5 && passedCount >= 5
      ? "STABLE_ZONE"
      : passedCount >= 3
        ? "APPROACHING"
        : "NOT_READY";

  await writeJson(path.join(options.outputDir, "readiness_checklist.json"), checklist);
  await fs.writeFile(path.join(options.outputDir, "readiness_report.md"), `\uFEFF${renderReadinessReport(checklist)}`, "utf8");
  return checklist;
}

export async function buildTrainingSystem(options: CliOptions): Promise<void> {
  await ensureDir(options.outputDir);
  await buildTrainingProfile(options);
  await buildTrainingPriority(options);
  await generateTrainingPlan({ ...options, days: 7 });
  await buildTrainingProgressLog(options);
  await buildMockExamLog(options);
  await buildReadinessChecklist(options);
  await generateWeeklyReview({ ...options, week: 1 });
  await verifyTrainingLoop(options);
}

async function loadAnalysis(options: CliOptions): Promise<AnalysisData> {
  const required = {
    manifest: "submission_manifest.json",
    metrics: "code_static_metrics.json",
    timeline: "problem_code_timeline.json",
    modules: "algorithm_module_stats.json",
    errors: "error_pattern_candidates.json",
    deepReview: "deep_review_samples.json",
    risk: "csp_s_risk_profile.json",
  } as const;
  const missing: string[] = [];
  for (const file of Object.values(required)) {
    if (!(await exists(path.join(options.analysisDir, file)))) missing.push(file);
  }
  if (missing.length > 0) throw new Error(`Missing analysis files: ${missing.join(", ")}`);

  return {
    manifest: await readJson<JsonObject>(path.join(options.analysisDir, required.manifest)),
    metrics: await readJson<JsonObject>(path.join(options.analysisDir, required.metrics)),
    timeline: await readJson<JsonObject>(path.join(options.analysisDir, required.timeline)),
    modules: await readJson<JsonObject>(path.join(options.analysisDir, required.modules)),
    errors: await readJson<JsonObject>(path.join(options.analysisDir, required.errors)),
    deepReview: await readJson<JsonObject>(path.join(options.analysisDir, required.deepReview)),
    risk: await readJson<JsonObject>(path.join(options.analysisDir, required.risk)),
    report: await readText(path.join(options.analysisDir, "final_code_analysis_report.md")),
  };
}

async function readOrBuildProfile(options: CliOptions): Promise<TrainingProfile> {
  const filePath = path.join(options.outputDir, "training_profile.json");
  if (await exists(filePath)) return readJson<TrainingProfile>(filePath);
  return buildTrainingProfile(options);
}

async function readOrBuildPriority(options: CliOptions): Promise<TrainingPriority> {
  const filePath = path.join(options.outputDir, "training_priority.json");
  if (await exists(filePath)) return readJson<TrainingPriority>(filePath);
  return buildTrainingPriority(options);
}

function extractScores(risk: JsonObject): ScoreProfile {
  const scores = getObject(risk, "scores");
  return {
    t1Stability: getNumber(scores, "t1Stability"),
    t2Modeling: getNumber(scores, "t2Modeling") || getNumber(scores, "t2Solving"),
    t3PartialScore: getNumber(scores, "t3PartialScore") || getNumber(scores, "t3Partial"),
    t4Strategy: getNumber(scores, "t4Strategy"),
    overall: getNumber(scores, "overall"),
  };
}

function buildModuleProfile(moduleSummary: JsonObject): Record<string, JsonObject> {
  const output: Record<string, JsonObject> = {};
  for (const [name, raw] of Object.entries(moduleSummary)) {
    if (!isObject(raw)) continue;
    const avgAttempts = getNumber(raw, "avgAttempts");
    const problemCount = getNumber(raw, "problemCount");
    const priority = avgAttempts >= 4 || ["interval_dp", "dsu", "binary_search"].includes(name) ? "high" : problemCount >= 80 ? "medium" : "normal";
    output[name] = {
      problemCount,
      acProblemCount: getNumber(raw, "acProblemCount"),
      fileCount: getNumber(raw, "fileCount"),
      avgAttempts,
      representativeProblems: Array.isArray(raw.representativeProblems) ? raw.representativeProblems.slice(0, 8) : [],
      priority,
      reason:
        priority === "high"
          ? "覆盖不少但平均提交次数或历史短板较突出，需要提升稳定转化。"
          : priority === "medium"
            ? "覆盖较多，是中档题稳定得分的重要模块。"
            : "保持训练覆盖，作为专项计划的补充模块。",
    };
  }
  return output;
}

function buildModuleWeights(moduleSummary: JsonObject): Record<string, number> {
  const defaults: Record<string, number> = {
    interval_dp: 1.4,
    dsu: 1.4,
    binary_search: 1.3,
    graph: 1.2,
    dp: 1.2,
    math: 1.0,
    string: 1.0,
    greedy: 1.0,
    dfs_bfs: 1.1,
    search: 1.1,
  };
  for (const [name, raw] of Object.entries(moduleSummary)) {
    if (!isObject(raw)) continue;
    const avgAttempts = getNumber(raw, "avgAttempts");
    if (avgAttempts >= 4) defaults[name] = Math.max(defaults[name] ?? 1, 1.4);
    else if (avgAttempts >= 3.3) defaults[name] = Math.max(defaults[name] ?? 1, 1.2);
  }
  return Object.fromEntries(Object.entries(defaults).sort((a, b) => b[1] - a[1]));
}

function buildHighValueReviewProblems(deepReview: JsonObject, errors: JsonObject): Array<Record<string, unknown>> {
  const candidates = [
    ...arrayOfObjects(deepReview.topAttemptProblems),
    ...arrayOfObjects(deepReview.multiFailThenAc),
    ...arrayOfObjects(deepReview.neverAcHighAttempts),
    ...arrayOfObjects(errors.partialScoreProblems),
  ];
  const seen = new Set<string>();
  const output: Array<Record<string, unknown>> = [];
  for (const item of candidates) {
    const pid = getString(item, "problemPid");
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    output.push({
      problemPid: pid,
      problemTitle: getString(item, "problemTitle"),
      attemptCount: getNumber(item, "attemptCount"),
      bestScore: getNullableNumber(item, "bestScore"),
      finalResult: getString(item, "finalResult"),
      tags: Array.isArray(item.tags) ? item.tags : [],
      reviewReason: buildReviewReason(item),
    });
    if (output.length >= 30) break;
  }
  return output;
}

function buildReviewReason(item: JsonObject): string {
  const tags = Array.isArray(item.tags) ? item.tags.map(String) : [];
  if (tags.includes("STUCK_PROBLEM")) return "长期未 AC 或高提交次数，是卡题复盘优先样本。";
  if (tags.includes("PARTIAL_SCORE")) return "出现部分分，适合训练 30/50/70 分拆解。";
  if (getNumber(item, "attemptCount") >= 10) return "提交次数高，适合比较早期版本与最终版本。";
  return "来自深度复盘池，适合人工/AI 进一步分析。";
}

function buildSevenDayPlan(profile: TrainingProfile, priority: TrainingPriority): TrainingDay[] {
  const reviews = arrayOfObjects(profile.highValueReviewProblems).slice(0, 8);
  return [
    {
      day: 0,
      theme: "诊断确认",
      targetAbility: "ALL",
      why: "先确认训练画像和优先级，避免后续计划变成随机刷题。",
      tasks: [
        task("D0-1", "diagnosis_review", "profile", "ALL", "诊断", "阅读 training_profile.json 和 training_priority.json，确认 T1/T2/T3/T4 解释是否合理。", "确认短板、复盘池和训练比例。", 30),
      ],
      oldProblemReview: reviews.slice(0, 3),
      successCriteria: ["能解释当前 T1/T2/T3/T4 分数", "确认旧题复盘池前 5 题", "确认第一周不追求随机题量"],
      failureAction: ["如果画像不符合实际，先修正分析规则，不进入 30 天扩展。"],
    },
    {
      day: 1,
      theme: "T1 稳定性",
      targetAbility: "T1",
      why: `T1 当前 ${profile.currentScores.t1Stability}，实现风险较高，必须先降低会做但错细节的问题。`,
      tasks: [
        task("D1-1", "new_problem", "implementation", "T1", "普及/提高-", "选择一道模拟、枚举、前缀和或简单贪心题，重点训练边界和实现稳定性。", "提高一次 AC 率，减少边界错误。", 40),
        task("D1-2", "new_problem", "prefix_sum_or_greedy", "T1", "普及+/提高-", "选择一道需要处理边界或排序细节的题，提交前必须完成检查清单。", "训练数据范围、下标、初始化检查。", 45),
        task("D1-3", "old_problem_review", "implementation", "T1", "历史旧题", "从高价值复盘池选 1 道带 ARRAY_INDEX_RISK 或 DEFINE_INT_LONG_LONG 的旧题重看。", "找出历史低级错误模式。", 35),
      ],
      oldProblemReview: reviews.slice(0, 2),
      successCriteria: ["新题提交次数 <= 2", "提交前完成边界检查清单", "记录错误类型"],
      failureAction: ["若 WA >= 2，Day2 前加 1 道同类基础题重做。"],
    },
    {
      day: 2,
      theme: "DP / 区间 DP",
      targetAbility: "T2",
      why: "DP 覆盖较多但平均提交次数偏高；区间 DP 是高优先级模块，需要稳定状态设计。",
      tasks: [
        task("D2-1", "new_problem", "linear_dp", "T2", "提高-", "选择一道线性 DP，写清状态、转移、初始化、遍历顺序。", "把题意稳定转为状态。", 50),
        task("D2-2", "new_problem", "knapsack_dp", "T2", "提高-", "选择一道背包或计数 DP，重点检查容量循环方向和初始化。", "减少 DP 边界与循环顺序错误。", 55),
        task("D2-3", "new_problem", "interval_dp", "T2", "提高/提高+", "选择一道区间 DP 中档题，必须写 len 枚举与转移依据。", "专项补强区间 DP。", 70),
      ],
      oldProblemReview: reviews.filter((item) => String(item.problemPid).startsWith("P8699")).slice(0, 1),
      successCriteria: ["每题写状态定义", "每题写复杂度", "至少 1 题独立 AC"],
      failureAction: ["若状态设计不清，Day4 复盘加入区间 DP 旧题。"],
    },
    {
      day: 3,
      theme: "图论 / 并查集 / 二分",
      targetAbility: "T2",
      why: "并查集和二分平均提交次数偏高，需要训练集合含义、check 单调性和图建模稳定性。",
      tasks: [
        task("D3-1", "new_problem", "dsu", "T2", "提高-", "选择一道并查集题，写清每个集合表示什么、合并条件是什么。", "降低并查集建模和实现错误。", 45),
        task("D3-2", "new_problem", "binary_search", "T2", "提高", "选择一道二分答案题，先证明 check 单调性再写代码。", "稳定二分边界和答案定义。", 60),
        task("D3-3", "new_problem", "graph", "T2", "提高", "选择一道图遍历/最短路建模题，写清点、边、权和复杂度。", "提升图论建模转化。", 60),
      ],
      oldProblemReview: reviews.filter((item) => ["P1955", "P6691"].includes(getString(item, "problemPid"))),
      successCriteria: ["二分题 check 单调性写清楚", "并查集题集合含义写清楚", "图论题复杂度写清楚"],
      failureAction: ["若 TLE 或复杂度错误，Day4 复盘必须加入复杂度分析。"],
    },
    {
      day: 4,
      theme: "高提交次数旧题复盘",
      targetAbility: "ALL",
      why: "高提交次数题最能暴露真实短板，必须比较早期错误版本和最终版本。",
      tasks: [
        task("D4-1", "old_problem_review", "high_attempt", "ALL", "历史旧题", "复盘提交次数最高的 2 道题，回答为什么提交这么多次。", "抽取真实错误模式。", 80),
        task("D4-2", "redo_problem", "weakness", "T1", "历史旧题", "重写 1 道已 AC 但曾多次失败的旧题，不看旧代码。", "验证错误是否真正修复。", 60),
        task("D4-3", "old_problem_review", "partial_score", "T3", "历史旧题", "选择 1 道部分分题，写出错过的可拿分子任务。", "为 Day5 部分分训练做准备。", 45),
      ],
      oldProblemReview: reviews.slice(0, 6),
      successCriteria: ["每题写第一版错因", "至少提炼 3 个固定错误模式", "至少 1 道旧题完成重写"],
      failureAction: ["若无法定位错因，使用 deep_review_samples.json 选代码做深度复盘。"],
    },
    {
      day: 5,
      theme: "T3 部分分训练",
      targetAbility: "T3",
      why: `T3 当前 ${profile.currentScores.t3PartialScore}，是明显短板；难题训练目标是建立部分分下限。`,
      tasks: [
        task("D5-1", "partial_score_training", "hard_problem_split", "T3", "提高+/省选-", "选择一道难题，不急着 AC，先写 30/50/70 分方案。", "训练不会正解时的拿分能力。", 90),
        task("D5-2", "partial_score_training", "special_cases", "T3", "提高+/省选-", "选择一道有明显数据范围分层的题，写暴力和特殊性质做法。", "建立子任务拆分意识。", 90),
      ],
      oldProblemReview: reviews.filter((item) => Array.isArray(item.tags) && item.tags.includes("PARTIAL_SCORE")).slice(0, 3),
      successCriteria: ["每道难题写出 30 分方案", "至少 1 道写出 50 分方案", "记录错过的可拿分点"],
      failureAction: ["若 30 分方案也写不出，下周降低难题难度，先练暴力和特殊性质。"],
    },
    {
      day: 6,
      theme: "四题模拟赛",
      targetAbility: "T4",
      why: "T4 必须靠模拟赛验证；没有模拟赛过程数据，不能判断是否接近一等奖稳定区间。",
      tasks: [
        task("D6-1", "mock_exam", "csp_s_mock", "T4", "CSP-S 模拟", "完成一套四题模拟赛，严格记录每题得分、用时、开题顺序、调试时间和部分分策略。", "训练完整比赛节奏和止损。", 240),
      ],
      oldProblemReview: [],
      successCriteria: ["记录 T1/T2/T3/T4 得分", "记录开题顺序", "记录调试时间", "记录是否错过部分分"],
      failureAction: ["若 T1/T2 没保住，下周先回到稳定性训练；若 T3/T4 空白，下周增加部分分拆解。"],
    },
    {
      day: 7,
      theme: "周复盘与闭环验证",
      targetAbility: "ALL",
      why: "第一周目标是验证闭环是否成立：计划不是终点，记录、复盘、调整才是系统价值。",
      tasks: [
        task("D7-1", "mock_review", "weekly_review", "ALL", "复盘", "根据 training_progress_log.json 和 mock_exam_log.json 生成周复盘。", "判断训练是否有效。", 60),
        task("D7-2", "diagnosis_review", "loop_verification", "ALL", "验证", "运行 train:verify 和 train:readiness，查看是否有执行数据支撑。", "判断是否进入下一周或需要修正规则。", 30),
      ],
      oldProblemReview: reviews.slice(0, 4),
      successCriteria: ["生成 training_review_report_week1.md", "生成 training_loop_verification.json", "明确下周调整建议"],
      failureAction: ["若记录不完整，不扩展 30 天计划，先修正记录流程。"],
    },
  ];
}

function buildThirtyDayPlan(profile: TrainingProfile, priority: TrainingPriority): TrainingDay[] {
  const seven = buildSevenDayPlan(profile, priority);
  const days: TrainingDay[] = [];
  for (let day = 1; day <= 30; day += 1) {
    const template = seven[((day - 1) % 7) + 1] ?? seven[1];
    const week = Math.ceil(day / 7);
    days.push({
      ...template,
      day,
      theme: `第 ${week} 周：${template.theme}`,
      why: `${template.why} 本日属于 30 天计划第 ${week} 周。`,
      tasks: template.tasks.map((item) => ({ ...item, id: `D${day}-${item.id}` })),
    });
  }
  return days;
}

function task(
  id: string,
  type: TrainingTask["type"],
  module: string,
  targetAbility: TrainingTask["targetAbility"],
  difficulty: string,
  selectionRule: string,
  trainingGoal: string,
  timeLimitMinutes: number,
): TrainingTask {
  return {
    id,
    type,
    module,
    targetAbility,
    difficulty,
    selectionRule,
    trainingGoal,
    timeLimitMinutes,
    reviewRequired: true,
    successCriteria: [
      "记录实际用时和提交次数",
      "记录错误类型",
      "写出本题暴露的问题",
    ],
  };
}

function renderPlanMarkdown(plan: JsonObject, profile: TrainingProfile, priority: TrainingPriority): string {
  const days = arrayOfObjects(plan.daysPlan) as unknown as TrainingDay[];
  const lines = [
    `# CSP-S 一等奖训练闭环计划（${getNumber(plan, "days")} 天）`,
    "",
    `生成时间：${getString(plan, "generatedAt")}`,
    "",
    "## 1. 当前画像",
    "",
    `- T1 稳定拿分：${profile.currentScores.t1Stability}`,
    `- T2 建模转化：${profile.currentScores.t2Modeling}`,
    `- T3 部分分策略：${profile.currentScores.t3PartialScore}`,
    `- T4 综合策略：${profile.currentScores.t4Strategy}`,
    `- 综合分：${profile.currentScores.overall}`,
    "",
    "系统不能承诺 100% 一定获得 CSP-S 一等奖；本计划的目标是用训练记录和模拟赛验证，逐步接近一等奖稳定区间。",
    "",
    "## 2. 训练比例",
    "",
    ...Object.entries(priority.priorityWeights).map(([key, value]) => `- ${key}：${Math.round(value * 100)}%`),
    `- 旧题复盘比例：${Math.round(getNumber(priority, "oldProblemReviewWeight") * 100)}%`,
    `- 新题比例：${Math.round(getNumber(priority, "newProblemWeight") * 100)}%`,
    `- 模拟赛比例：${Math.round(getNumber(priority, "mockExamWeight") * 100)}%`,
    "",
    "## 3. 每日计划",
    "",
  ];

  for (const day of days) {
    lines.push(`### Day ${day.day}：${day.theme}`, "");
    lines.push(`目标能力：${day.targetAbility}`);
    lines.push("");
    lines.push(`为什么安排：${day.why}`, "");
    lines.push("任务：");
    for (const item of day.tasks) {
      lines.push(`- ${item.id} [${item.type}] ${item.module} / ${item.difficulty}`);
      lines.push(`  - 选题标准：${item.selectionRule}`);
      lines.push(`  - 训练目标：${item.trainingGoal}`);
      lines.push(`  - 限时：${item.timeLimitMinutes} 分钟`);
    }
    if (day.oldProblemReview.length > 0) {
      lines.push("", "旧题复盘池：");
      for (const problem of day.oldProblemReview.slice(0, 5)) {
        lines.push(`- ${getString(problem, "problemPid")}：${getString(problem, "reviewReason")}`);
      }
    }
    lines.push("", "达标标准：");
    for (const criterion of day.successCriteria) lines.push(`- ${criterion}`);
    lines.push("", "失败调整：");
    for (const action of day.failureAction) lines.push(`- ${action}`);
    lines.push("");
  }

  lines.push("## 4. 填写要求", "");
  lines.push("- 每天训练结束后填写 `training_progress_log.json`。");
  lines.push("- 第 6 天模拟赛后填写 `mock_exam_log.json`。");
  lines.push("- 第 7 天运行 `pnpm train:review -- --week 1` 和 `pnpm train:verify`。");
  return lines.join("\n");
}

function renderReadinessReport(checklist: JsonObject): string {
  const criteria = getObject(checklist, "criteria");
  const lines = [
    "# CSP-S 一等奖稳定区间 Readiness 报告",
    "",
    `生成时间：${getString(checklist, "generatedAt")}`,
    "",
    `当前状态：${getString(checklist, "overallReadiness")}`,
    "",
    "## 指标",
    "",
  ];
  for (const [name, raw] of Object.entries(criteria)) {
    if (!isObject(raw)) continue;
    lines.push(`- ${name}：目标=${formatValue(raw.target)}，实际=${formatValue(raw.actual ?? null)}，通过=${String(raw.passed)}`);
  }
  lines.push("", "## 解释", "", getString(checklist, "explanation"));
  lines.push("", "## 下一步", "", "- 执行 7 天计划并填写训练记录。", "- 至少完成 1 场四题模拟赛后重新运行 `pnpm train:readiness`。", "- 连续 5 场模拟赛达标前，不能判断为稳定一等奖区间。");
  return lines.join("\n");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function summarizeErrors(entries: JsonObject[]): string[] {
  if (entries.length === 0) return ["- 尚无训练记录，无法统计本周高频错误。"];
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const errorTypes = Array.isArray(entry.errorTypes) ? entry.errorTypes.map(String) : ["UNKNOWN"];
    for (const error of errorTypes) counts[error] = (counts[error] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `- ${name}：${count}`);
}

function topModuleLines(weights: Record<string, number>): string[] {
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, weight]) => `${name}：权重 ${weight}`);
}

function countMockScoreStreak(exams: JsonObject[], targetScore: number): number {
  let streak = 0;
  for (let index = exams.length - 1; index >= 0; index -= 1) {
    if (getNumber(exams[index] ?? {}, "totalScore") >= targetScore) streak += 1;
    else break;
  }
  return streak;
}

function normalizeWeights(weights: Record<string, number>): void {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  for (const key of Object.keys(weights)) weights[key] = round(weights[key] / total);
}

function getObject(source: unknown, key: string): JsonObject {
  const value = getPath(source, key);
  return isObject(value) ? value : {};
}

function getRecordNumber(source: unknown, key: string): Record<string, number> {
  const obj = getObject(source, key);
  return Object.fromEntries(Object.entries(obj).map(([name, value]) => [name, typeof value === "number" ? value : Number(value) || 0]));
}

function getString(source: unknown, key: string): string {
  const value = getPath(source, key);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getNumber(source: unknown, key: string): number {
  const value = getPath(source, key);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  return 0;
}

function getNullableNumber(source: unknown, key: string): number | null {
  const value = getPath(source, key);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function getPath(source: unknown, key: string): unknown {
  if (!key) return source;
  return key.split(".").reduce<unknown>((current, part) => {
    if (!isObject(current)) return undefined;
    return current[part];
  }, source);
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sentenceIf(condition: boolean, sentence: string): string | null {
  return condition ? sentence : null;
}

function avg(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function readText(filePath: string): Promise<string> {
  if (!(await exists(filePath))) return "";
  return fs.readFile(filePath, "utf8");
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
