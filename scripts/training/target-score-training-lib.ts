import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;
type Slot = "T1" | "T2" | "T3" | "T4";
type SlotKey = "t1" | "t2" | "t3" | "t4";
type TrainingPriority = "P0" | "P1" | "P2";
type MasteryStatus = "NOT_STARTED" | "LEARNING" | "PRACTICING" | "UNSTABLE" | "PASSED_BASIC" | "PASSED_TRANSFER" | "CONTEST_READY";

const SLOT_KEYS: SlotKey[] = ["t1", "t2", "t3", "t4"];
const SLOT_BY_KEY: Record<SlotKey, Slot> = { t1: "T1", t2: "T2", t3: "T3", t4: "T4" };

type TargetTrainingOptions = {
  targetScore: number;
  weeklyHours: number;
  days: number;
  benchmarkDir: string;
  problemBankDir: string;
  trainingGoalDir: string;
  learningUnitsDir: string;
  problemLaddersDir: string;
  explanationsDir: string;
  trainingDir: string;
  masteryDir: string;
  mockExamDir: string;
};

type ExpectedLossItem = {
  abilityId: string;
  name: string;
  status: string;
  historicalEvidenceCount: number;
  pastProblemEvidenceCount: number;
  blindTestCount: number;
  masteryLevel: string;
  expectedLoss: {
    value: number;
    confidenceInterval: [number, number];
    confidence: number;
  };
  firstPrizeImpact: string;
  recommendedAction: string;
  relatedPastProblems: Array<{ year: number; slot: Slot; luoguPid: string; title: string }>;
};

type SkillMasteryItem = {
  abilityId: string;
  abilityName: string;
  masteryScore: number;
  masteryLevel: string;
  evidenceCount: number;
  negativeEvidenceCount: number;
  blindTestCount: number;
};

type GoalScorePlan = {
  generatedAt: string;
  targetScore: number;
  weeklyHours: number;
  scoreBreakdown: Record<SlotKey, {
    targetRange: [number, number];
    targetScore: number;
    role: string;
    trainingPriority: TrainingPriority;
    currentEstimate: number;
    gap: number;
  }>;
  calibration?: {
    source: string;
    method: string;
    baselineYear: number;
    baselineExamName: string;
    baselineTotalScore: number;
    rawEstimateTotal: number;
    calibratedTotal: number;
    confidence: string;
    note: string;
  } | null;
  trainingStrategy: {
    t1Ratio: number;
    t2Ratio: number;
    t3Ratio: number;
    t4Ratio: number;
    mockRatio: number;
    explanationRatio: number;
    reviewRatio: number;
  };
  route: string[];
};

type LearningUnit = {
  unitId: string;
  title: string;
  sourceAbilityId: string;
  targetScoreRole: Slot[];
  priority: TrainingPriority;
  goal: string;
  prerequisites: string[];
  conceptExplanation: {
    short: string;
    keyQuestions: string[];
  };
  commonMistakes: string[];
  passCriteria: string[];
  estimatedLoss: number;
  masteryLevel: string;
};

type LadderTask = {
  level: number;
  name: string;
  taskType: "EXPLANATION_PROBLEM" | "PRACTICE_BASIC" | "PRACTICE_STANDARD" | "MUTATION" | "CSP_STYLE_PROBLEM" | "GENERATE_DIAGNOSTIC";
  purpose: string;
  problemSource: "SELECT_EXISTING" | "MUTATE_EXISTING" | "GENERATE_DIAGNOSTIC";
  problemPid?: string;
  problemId?: string;
  title?: string;
  difficulty: string;
  timeLimitMinutes: number;
  passSignal: string;
};

type ProblemLadder = {
  unitId: string;
  ladder: LadderTask[];
};

type TrainingLogItem = {
  date: string;
  unitId: string;
  problemPid: string;
  taskType: string;
  result: string;
  score: number;
  timeMinutes: number;
  submissionCount: number;
  hintLevelUsed: number;
  hasSeenSolution: boolean;
  errorTypes: string[];
  failedStage: string | null;
  studentSummary: string;
  needRedo: boolean;
};

type TrainingSettlement = {
  generatedAt: string;
  date: string;
  targetScore: number;
  today: {
    completedTasks: number;
    xpGained: number;
    riskReduced: number;
    scoreProxyBefore: number;
    scoreProxyAfter: number;
    distanceBefore: number;
    distanceAfter: number;
    distanceDelta: number;
  };
  level: {
    before: number;
    after: number;
    title: string;
    upgraded: boolean;
    xpBefore: number;
    xpAfter: number;
    nextLevelXp: number;
  };
  abilityChanges: Array<{
    unitId: string;
    title: string;
    beforeStatus: MasteryStatus;
    afterStatus: MasteryStatus;
    statusChanged: boolean;
    todayScoreAverage: number;
    todayProblems: string[];
    riskReduced: number;
    message: string;
  }>;
  evidence: string[];
  nextAdjustment: {
    action: string;
    reason: string;
    nextUnitId: string;
    nextUnitTitle: string;
  };
};

type StudentExamBaseline = {
  year: number;
  examName: string;
  totalScore: number;
  perSlotScores?: Partial<Record<Slot, number | null>>;
  source: string;
  confidence: string;
  notes?: string[];
};

export function parseTargetTrainingOptions(argv = process.argv.slice(2)): TargetTrainingOptions {
  const args: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
    if (key && value) args[key] = value;
  }
  return {
    targetScore: positiveInteger(args.targetScore, 200),
    weeklyHours: positiveInteger(args.weeklyHours, 20),
    days: positiveInteger(args.days, 7),
    benchmarkDir: path.resolve(args.benchmark ?? path.join(process.cwd(), "data", "csp-s-benchmark")),
    problemBankDir: path.resolve(args.problemBank ?? path.join(process.cwd(), "data", "problem-bank")),
    trainingGoalDir: path.resolve(args.trainingGoal ?? path.join(process.cwd(), "data", "training-goal")),
    learningUnitsDir: path.resolve(args.learningUnits ?? path.join(process.cwd(), "data", "learning-units")),
    problemLaddersDir: path.resolve(args.problemLadders ?? path.join(process.cwd(), "data", "problem-ladders")),
    explanationsDir: path.resolve(args.explanations ?? path.join(process.cwd(), "data", "explanations")),
    trainingDir: path.resolve(args.training ?? path.join(process.cwd(), "data", "training")),
    masteryDir: path.resolve(args.mastery ?? path.join(process.cwd(), "data", "mastery")),
    mockExamDir: path.resolve(args.mockExam ?? path.join(process.cwd(), "data", "mock-exam")),
  };
}

export async function buildGoalScorePlan(options: TargetTrainingOptions): Promise<GoalScorePlan> {
  const losses = await loadExpectedLosses(options);
  const baseline = await loadLatestExamBaseline(options);
  const tLoss = lossBySlot(losses);
  const t1Target = clamp(Math.round(options.targetScore * 0.45), 80, 100);
  const t2Target = clamp(Math.round(options.targetScore * 0.35), 60, 90);
  const t3Target = clamp(Math.round(options.targetScore * 0.18), 30, 60);
  const t4Target = clamp(options.targetScore - t1Target - t2Target - t3Target, 0, 30);
  const rawCurrent: Record<SlotKey, number> = {
    t1: clamp(t1Target - Math.round(tLoss.T1), 0, 100),
    t2: clamp(t2Target - Math.round(tLoss.T2), 0, 100),
    t3: clamp(t3Target - Math.round(tLoss.T3), 0, 100),
    t4: clamp(t4Target - Math.round(tLoss.T4), 0, 100),
  };
  const { current, calibration } = calibrateCurrentEstimate(rawCurrent, baseline, options.targetScore);
  const plan: GoalScorePlan = {
    generatedAt: new Date().toISOString(),
    targetScore: options.targetScore,
    weeklyHours: options.weeklyHours,
    scoreBreakdown: {
      t1: scorePart([80, 100], t1Target, "Bottom-line score. T1 must be stable.", "P0", current.t1),
      t2: scorePart([60, 90], t2Target, "Main scoring zone. T2 modeling decides whether 200 is realistic.", "P0", current.t2),
      t3: scorePart([30, 60], t3Target, "Partial-score zone. Train 30/50/70 routes.", "P1", current.t3),
      t4: scorePart([0, 30], t4Target, "Strategy score. Take brute force and special properties without hurting T1/T2.", "P2", current.t4),
    },
    calibration,
    trainingStrategy: buildTrainingStrategy(options.targetScore, tLoss),
    route: [
      "First protect T1 and T2. A 200-point route cannot tolerate unstable low-level mistakes.",
      "Then train T3 partial-score decomposition. The goal is executable 30/50/70 routes, not immediate full marks.",
      "Use T4 only as strategy training unless T1/T2 are already stable.",
      "Every week must include one CSP-S-style set to verify transfer from single-problem practice to exam scoring.",
    ],
  };
  await writeJson(path.join(options.trainingGoalDir, "goal_score_plan.json"), plan);
  await fs.writeFile(path.join(options.trainingGoalDir, "goal_score_plan.md"), `\uFEFF${renderGoalScorePlan(plan)}`, "utf8");
  return plan;
}

export async function buildLearningUnits(options: TargetTrainingOptions): Promise<LearningUnit[]> {
  const losses = await loadExpectedLosses(options);
  const mastery = await loadSkillMastery(options);
  const masteryByAbility = new Map(mastery.map((item) => [item.abilityId, item]));
  const coreUnits = requiredUnits().map((template) => {
    const loss = losses.find((item) => item.abilityId === template.sourceAbilityId);
    const state = masteryByAbility.get(template.sourceAbilityId);
    return makeLearningUnit(template, loss, state);
  });
  const topLossUnits = losses
    .slice(0, 12)
    .filter((loss) => !coreUnits.some((unit) => unit.sourceAbilityId === loss.abilityId))
    .map((loss) => makeLearningUnit(templateForAbility(loss.abilityId), loss, masteryByAbility.get(loss.abilityId)));
  const units = [...coreUnits, ...topLossUnits]
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.estimatedLoss - a.estimatedLoss);
  await writeJson(path.join(options.learningUnitsDir, "learning_units.json"), {
    generatedAt: new Date().toISOString(),
    targetScore: options.targetScore,
    items: units,
  });
  await fs.writeFile(path.join(options.learningUnitsDir, "learning_units.md"), `\uFEFF${renderLearningUnits(units)}`, "utf8");
  return units;
}

export async function buildProblemLadders(options: TargetTrainingOptions): Promise<ProblemLadder[]> {
  const units = await readOrBuildLearningUnits(options);
  const losses = await loadExpectedLosses(options);
  const selectedTasks = await loadSelectedTrainingTasks(options);
  const mutated = await loadMutatedProblems(options);
  const generated = await loadGeneratedProblems(options);
  const ladders = units.map((unit) => {
    const loss = losses.find((item) => item.abilityId === unit.sourceAbilityId);
    const related = loss?.relatedPastProblems ?? [];
    const selected = selectedTasks.filter((item) => unitMatchesProblem(unit, item)).slice(0, 4);
    const mutation = mutated.find((item) => unitMatchesProblem(unit, item));
    const diagnostic = generated.find((item) => unitMatchesProblem(unit, item));
    const firstSelected = selected[0];
    const secondSelected = selected[1] ?? selected[0];
    const cspProblem = related[0];
    return {
      unitId: unit.unitId,
      ladder: [
        ladderTask(1, "Concept problem", "EXPLANATION_PROBLEM", "Understand the core model before coding.", "SELECT_EXISTING", firstSelected, unit, 25),
        ladderTask(2, "Basic practice", "PRACTICE_BASIC", "Finish the standard form with low pressure.", "SELECT_EXISTING", firstSelected, unit, 35),
        ladderTask(3, "Standard practice", "PRACTICE_STANDARD", "Handle boundary, complexity and submission stability.", "SELECT_EXISTING", secondSelected, unit, 60),
        mutation
          ? ladderTask(4, "Isomorphic mutation", "MUTATION", "Verify transfer instead of memorizing the original problem.", "MUTATE_EXISTING", mutation, unit, 45)
          : generated
            ? ladderTask(4, "Generated diagnostic", "GENERATE_DIAGNOSTIC", "Expose the target weakness with a focused generated task.", "GENERATE_DIAGNOSTIC", diagnostic, unit, 45)
            : fallbackLadderTask(4, unit),
        cspProblem
          ? {
              level: 5,
              name: "CSP-S past/style problem",
              taskType: "CSP_STYLE_PROBLEM",
              purpose: "Verify contest transfer under time pressure.",
              problemSource: "SELECT_EXISTING",
              problemPid: cspProblem.luoguPid,
              title: `${cspProblem.year}${cspProblem.slot} ${cspProblem.title}`,
              difficulty: cspProblem.slot,
              timeLimitMinutes: cspProblem.slot === "T1" ? 45 : cspProblem.slot === "T2" ? 75 : 110,
              passSignal: "Reach the slot target score without full-solution hint.",
            } satisfies LadderTask
          : fallbackLadderTask(5, unit),
      ],
    };
  });
  await writeJson(path.join(options.problemLaddersDir, "problem_ladders.json"), {
    generatedAt: new Date().toISOString(),
    items: ladders,
  });
  await fs.writeFile(path.join(options.problemLaddersDir, "problem_ladders.md"), `\uFEFF${renderProblemLadders(ladders)}`, "utf8");
  return ladders;
}

export async function buildExplanations(options: TargetTrainingOptions): Promise<void> {
  const units = await readOrBuildLearningUnits(options);
  const ladders = await readOrBuildProblemLadders(options);
  const unitById = new Map(units.map((unit) => [unit.unitId, unit]));
  const items = ladders.flatMap((ladder) => {
    const unit = unitById.get(ladder.unitId);
    return ladder.ladder
      .filter((task) => task.problemPid || task.problemId)
      .map((task) => buildProblemExplanation(unit, task));
  });
  await writeJson(path.join(options.explanationsDir, "problem_explanations.json"), {
    generatedAt: new Date().toISOString(),
    policy: "Do not reveal the full solution before the student has attempted lower-level hints.",
    items,
  });
}

export async function generateDailyTraining(options: TargetTrainingOptions): Promise<void> {
  const goal = await readOrBuildGoalScorePlan(options);
  const units = await readOrBuildLearningUnits(options);
  const ladders = await readOrBuildProblemLadders(options);
  const mastery = await updateMastery(options);
  const masteryByUnit = new Map(mastery.map((item) => [String(item.unitId), item]));
  const candidates = units
    .filter((unit) => !["PASSED_TRANSFER", "CONTEST_READY"].includes(getString(masteryByUnit.get(unit.unitId), "status")))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.estimatedLoss - a.estimatedLoss);
  const unit = candidates[0] ?? units[0];
  const ladder = ladders.find((item) => item.unitId === unit.unitId);
  const daily = {
    generatedAt: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    targetScore: options.targetScore,
    todayGoal: unit.title,
    whyToday: [
      `This unit is ${unit.priority} for target score ${options.targetScore}.`,
      `Estimated loss: ${unit.estimatedLoss}.`,
      `Current mastery: ${unit.masteryLevel}.`,
      "The task order follows concept -> basic -> standard -> transfer -> review.",
    ],
    tasks: buildDailyTasks(unit, ladder),
    passCriteria: unit.passCriteria,
    scoreRouteReminder: goal.route,
  };
  await writeJson(path.join(options.trainingDir, "daily_training_plan.json"), daily);
  await fs.writeFile(path.join(options.trainingDir, "daily_training_plan.md"), `\uFEFF${renderDailyTraining(daily)}`, "utf8");
}

export async function recordTrainingLog(options: TargetTrainingOptions, argv = process.argv.slice(2)): Promise<void> {
  await ensureDir(options.trainingDir);
  const logPath = path.join(options.trainingDir, "training_log.json");
  const current = await readJsonIfExists<{ generatedAt?: string; items?: TrainingLogItem[]; schema?: JsonObject }>(logPath, {
    generatedAt: new Date().toISOString(),
    items: [],
    schema: trainingLogSchema(),
  });
  const args = parseArgs(argv);
  if (!args.problemPid) {
    await writeJson(logPath, { ...current, schema: trainingLogSchema(), note: "No --problemPid provided. This file is initialized and ready for real training logs." });
    return;
  }
  const item: TrainingLogItem = {
    date: args.date ?? new Date().toISOString().slice(0, 10),
    unitId: args.unitId ?? "UNKNOWN_UNIT",
    problemPid: args.problemPid,
    taskType: args.taskType ?? "PRACTICE_STANDARD",
    result: args.result ?? "UNKNOWN",
    score: numberField(args.score, 0),
    timeMinutes: numberField(args.timeMinutes, 0),
    submissionCount: numberField(args.submissionCount, 0),
    hintLevelUsed: numberField(args.hintLevelUsed, 0),
    hasSeenSolution: booleanField(args.hasSeenSolution),
    errorTypes: splitList(args.errorTypes),
    failedStage: args.failedStage ?? null,
    studentSummary: args.studentSummary ?? "",
    needRedo: booleanField(args.needRedo),
  };
  await writeJson(logPath, {
    generatedAt: current.generatedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schema: trainingLogSchema(),
    items: [...(current.items ?? []), item],
  });
  await updateMastery(options);
  await buildTrainingSettlement(options);
}

export async function updateMastery(options: TargetTrainingOptions): Promise<Array<JsonObject & { unitId: string; status: MasteryStatus }>> {
  const units = await readOrBuildLearningUnits(options);
  const logs = await readJsonIfExists<{ items?: TrainingLogItem[] }>(path.join(options.trainingDir, "training_log.json"), { items: [] });
  const skillMastery = await loadSkillMastery(options);
  const items = calculateMasteryItems(units, logs.items ?? [], skillMastery);
  await writeJson(path.join(options.masteryDir, "ability_mastery.json"), {
    generatedAt: new Date().toISOString(),
    items,
  });
  return items;
}

export async function buildTrainingSettlement(options: TargetTrainingOptions): Promise<TrainingSettlement> {
  const goal = await readOrBuildGoalScorePlan(options);
  const units = await readOrBuildLearningUnits(options);
  const skillMastery = await loadSkillMastery(options);
  const logs = await readJsonIfExists<{ items?: TrainingLogItem[] }>(path.join(options.trainingDir, "training_log.json"), { items: [] });
  const items = logs.items ?? [];
  const date = latestTrainingDate(items) ?? new Date().toISOString().slice(0, 10);
  const todayLogs = items.filter((item) => item.date === date);
  const beforeLogs = items.filter((item) => item.date < date);
  const beforeMastery = calculateMasteryItems(units, beforeLogs, skillMastery);
  const afterMastery = calculateMasteryItems(units, items, skillMastery);
  const beforeByUnit = new Map(beforeMastery.map((item) => [item.unitId, item]));
  const afterByUnit = new Map(afterMastery.map((item) => [item.unitId, item]));
  const unitById = new Map(units.map((unit) => [unit.unitId, unit]));
  const xpBefore = beforeLogs.reduce((sum, item) => sum + xpForLog(item), 0);
  const xpToday = todayLogs.reduce((sum, item) => sum + xpForLog(item), 0);
  const xpAfter = xpBefore + xpToday;
  const riskBefore = beforeLogs.reduce((sum, item) => sum + riskReductionForLog(item, unitById.get(item.unitId)), 0);
  const riskToday = todayLogs.reduce((sum, item) => sum + riskReductionForLog(item, unitById.get(item.unitId)), 0);
  const scoreBase = Object.values(goal.scoreBreakdown).reduce((sum, item) => sum + item.currentEstimate, 0);
  const beforeScore = clamp(round(scoreBase + riskBefore, 1), 0, options.targetScore);
  const afterScore = clamp(round(scoreBase + riskBefore + riskToday, 1), 0, options.targetScore);
  const distanceBefore = round(Math.max(0, options.targetScore - beforeScore), 1);
  const distanceAfter = round(Math.max(0, options.targetScore - afterScore), 1);
  const abilityChanges = units
    .filter((unit) => todayLogs.some((item) => item.unitId === unit.unitId))
    .map((unit) => {
      const unitTodayLogs = todayLogs.filter((item) => item.unitId === unit.unitId);
      const beforeStatus = beforeByUnit.get(unit.unitId)?.status ?? "NOT_STARTED";
      const afterStatus = afterByUnit.get(unit.unitId)?.status ?? "NOT_STARTED";
      const riskReduced = round(unitTodayLogs.reduce((sum, item) => sum + riskReductionForLog(item, unit), 0), 2);
      return {
        unitId: unit.unitId,
        title: unit.title,
        beforeStatus,
        afterStatus,
        statusChanged: beforeStatus !== afterStatus,
        todayScoreAverage: round(average(unitTodayLogs.map((item) => item.score)), 1),
        todayProblems: unitTodayLogs.map((item) => item.problemPid),
        riskReduced,
        message: settlementMessage(unit, unitTodayLogs, beforeStatus, afterStatus, riskReduced),
      };
    });
  const levelBefore = levelFromXp(xpBefore);
  const levelAfter = levelFromXp(xpAfter);
  const next = pickNextAdjustment(units, afterMastery, todayLogs);
  const settlement: TrainingSettlement = {
    generatedAt: new Date().toISOString(),
    date,
    targetScore: options.targetScore,
    today: {
      completedTasks: todayLogs.length,
      xpGained: xpToday,
      riskReduced: round(riskToday, 2),
      scoreProxyBefore: beforeScore,
      scoreProxyAfter: afterScore,
      distanceBefore,
      distanceAfter,
      distanceDelta: round(distanceBefore - distanceAfter, 1),
    },
    level: {
      before: levelBefore,
      after: levelAfter,
      title: levelTitle(levelAfter),
      upgraded: levelAfter > levelBefore,
      xpBefore,
      xpAfter,
      nextLevelXp: nextLevelXp(levelAfter),
    },
    abilityChanges,
    evidence: evidenceLines(todayLogs, unitById),
    nextAdjustment: next,
  };
  await writeJson(path.join(options.trainingDir, "training_settlement.json"), settlement);
  await fs.writeFile(path.join(options.trainingDir, "training_settlement.md"), `\uFEFF${renderTrainingSettlement(settlement)}`, "utf8");
  return settlement;
}

export async function buildMockExam(options: TargetTrainingOptions): Promise<void> {
  const goal = await readOrBuildGoalScorePlan(options);
  const losses = await loadExpectedLosses(options);
  const pastProblems = await loadPastProblems(options);
  const chosen = (["T1", "T2", "T3", "T4"] as Slot[]).map((slot) => {
    const highLoss = losses.find((loss) => loss.relatedPastProblems.some((problem) => problem.slot === slot));
    const problem = highLoss?.relatedPastProblems.find((item) => item.slot === slot)
      ?? pastProblems.find((item) => getString(item, "slot") === slot);
    return {
      slot,
      problemPid: getString(problem, "luoguPid"),
      title: getString(problem, "title"),
      targetScore: goal.scoreBreakdown[slot.toLowerCase() as "t1" | "t2" | "t3" | "t4"].targetScore,
      timeLimitMinutes: slot === "T1" ? 45 : slot === "T2" ? 75 : slot === "T3" ? 90 : 45,
      validationFocus: highLoss?.abilityId ?? "GENERAL_SCORE_STABILITY",
    };
  });
  const plan = {
    generatedAt: new Date().toISOString(),
    date: nextDate(7),
    targetScore: options.targetScore,
    examSource: "CSP-S past paper / mixed set",
    tasks: chosen,
    scoreTarget: Object.fromEntries(chosen.map((item) => [item.slot.toLowerCase(), item.targetScore])),
    rules: [
      "Do not use full solution before the timer ends.",
      "Record per-slot score, time usage, submission count, hint level and failed stage.",
      "If T1 or T2 collapses, next week must prioritize stability before hard problems.",
    ],
  };
  const review = buildMockReviewTemplate(plan);
  await writeJson(path.join(options.mockExamDir, "mock_exam_plan.json"), plan);
  await fs.writeFile(path.join(options.mockExamDir, "mock_exam_review.md"), `\uFEFF${review}`, "utf8");
}

export async function buildTargetScoreTrainingSystem(options: TargetTrainingOptions): Promise<void> {
  await buildGoalScorePlan(options);
  await buildLearningUnits(options);
  await buildProblemLadders(options);
  await buildExplanations(options);
  await recordTrainingLog(options, []);
  await updateMastery(options);
  await generateDailyTraining(options);
  await buildTrainingSettlement(options);
  await buildMockExam(options);
}

function scorePart(targetRange: [number, number], targetScore: number, role: string, priority: TrainingPriority, currentEstimate: number) {
  return {
    targetRange,
    targetScore,
    role,
    trainingPriority: priority,
    currentEstimate,
    gap: Math.max(0, targetScore - currentEstimate),
  };
}

function calibrateCurrentEstimate(
  rawCurrent: Record<SlotKey, number>,
  baseline: StudentExamBaseline | null,
  targetScore: number,
): { current: Record<SlotKey, number>; calibration: GoalScorePlan["calibration"] } {
  if (!baseline || !Number.isFinite(baseline.totalScore)) {
    return { current: rawCurrent, calibration: null };
  }
  const rawEstimateTotal = sumSlotScores(rawCurrent);
  const baselineTotalScore = clamp(Math.round(baseline.totalScore), 0, targetScore);
  const explicitSlotScores = Object.fromEntries(
    SLOT_KEYS.flatMap((key) => {
      const value = baseline.perSlotScores?.[SLOT_BY_KEY[key]];
      return Number.isFinite(value) ? [[key, clamp(Math.round(Number(value)), 0, 100)]] : [];
    }),
  ) as Partial<Record<SlotKey, number>>;
  const method = Object.keys(explicitSlotScores).length > 0
    ? "official_slot_scores_with_proportional_unknown_slots"
    : "official_total_score_proportional_slot_estimate";
  const current = Object.keys(explicitSlotScores).length > 0
    ? distributeUnknownSlots(rawCurrent, explicitSlotScores, baselineTotalScore)
    : scaleSlotScoresToTotal(rawCurrent, baselineTotalScore);

  return {
    current,
    calibration: {
      source: baseline.source,
      method,
      baselineYear: baseline.year,
      baselineExamName: baseline.examName,
      baselineTotalScore,
      rawEstimateTotal,
      calibratedTotal: sumSlotScores(current),
      confidence: baseline.confidence,
      note: Object.keys(explicitSlotScores).length > 0
        ? "Official per-slot scores are used where present; missing slots are distributed by model proportion."
        : "Only the official total score is known, so T1/T2/T3/T4 are proportional estimates, not real slot scores.",
    },
  };
}

function distributeUnknownSlots(rawCurrent: Record<SlotKey, number>, knownScores: Partial<Record<SlotKey, number>>, targetTotal: number): Record<SlotKey, number> {
  const knownTotal = SLOT_KEYS.reduce((sum, key) => sum + (knownScores[key] ?? 0), 0);
  const unknownKeys = SLOT_KEYS.filter((key) => knownScores[key] === undefined);
  const unknownTarget = clamp(targetTotal - knownTotal, 0, unknownKeys.length * 100);
  const scaledUnknown = scaleSlotSubsetToTotal(rawCurrent, unknownKeys, unknownTarget);
  return normalizeSlotTotal({
    t1: knownScores.t1 ?? scaledUnknown.t1 ?? 0,
    t2: knownScores.t2 ?? scaledUnknown.t2 ?? 0,
    t3: knownScores.t3 ?? scaledUnknown.t3 ?? 0,
    t4: knownScores.t4 ?? scaledUnknown.t4 ?? 0,
  }, targetTotal);
}

function scaleSlotScoresToTotal(rawCurrent: Record<SlotKey, number>, targetTotal: number): Record<SlotKey, number> {
  return scaleSlotSubsetToTotal(rawCurrent, SLOT_KEYS, targetTotal);
}

function scaleSlotSubsetToTotal(rawCurrent: Record<SlotKey, number>, keys: SlotKey[], targetTotal: number): Record<SlotKey, number> {
  const rawTotal = keys.reduce((sum, key) => sum + rawCurrent[key], 0);
  const weighted = Object.fromEntries(SLOT_KEYS.map((key) => [key, 0])) as Record<SlotKey, number>;
  if (keys.length === 0 || targetTotal <= 0) return weighted;
  for (const key of keys) {
    weighted[key] = rawTotal > 0
      ? clamp(Math.round(rawCurrent[key] / rawTotal * targetTotal), 0, 100)
      : clamp(Math.round(targetTotal / keys.length), 0, 100);
  }
  return normalizeSlotTotal(weighted, targetTotal, keys);
}

function normalizeSlotTotal(scores: Record<SlotKey, number>, targetTotal: number, adjustableKeys = SLOT_KEYS): Record<SlotKey, number> {
  const output = { ...scores };
  let diff = targetTotal - sumSlotScores(output);
  while (diff !== 0) {
    const direction = diff > 0 ? 1 : -1;
    const key = adjustableKeys.find((item) => direction > 0 ? output[item] < 100 : output[item] > 0);
    if (!key) break;
    output[key] += direction;
    diff -= direction;
  }
  return output;
}

function sumSlotScores(scores: Record<SlotKey, number>): number {
  return SLOT_KEYS.reduce((sum, key) => sum + scores[key], 0);
}

function buildTrainingStrategy(targetScore: number, tLoss: Record<Slot, number>) {
  const totalLoss = Math.max(1, tLoss.T1 + tLoss.T2 + tLoss.T3 + tLoss.T4);
  const base = targetScore <= 220
    ? { t1Ratio: 0.25, t2Ratio: 0.4, t3Ratio: 0.25, t4Ratio: 0.0, mockRatio: 0.1, explanationRatio: 0.2, reviewRatio: 0.2 }
    : { t1Ratio: 0.2, t2Ratio: 0.35, t3Ratio: 0.3, t4Ratio: 0.05, mockRatio: 0.1, explanationRatio: 0.18, reviewRatio: 0.22 };
  return {
    ...base,
    t1Ratio: round(Math.max(base.t1Ratio, tLoss.T1 / totalLoss * 0.3)),
    t2Ratio: round(Math.max(base.t2Ratio, tLoss.T2 / totalLoss * 0.35)),
    t3Ratio: round(Math.max(base.t3Ratio, tLoss.T3 / totalLoss * 0.3)),
    t4Ratio: round(Math.max(base.t4Ratio, tLoss.T4 / totalLoss * 0.1)),
  };
}

function requiredUnits(): Array<Partial<LearningUnit> & { unitId: string; sourceAbilityId: string }> {
  return [
    template("T1.SIMULATION", "PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION", "T1 simulation and reading stability", ["T1"], "P0"),
    template("IMPLEMENTATION.INDEX_BOUNDARY", "IMPLEMENTATION.INDEX_BOUNDARY", "Index and boundary stability", ["T1", "T2"], "P0"),
    template("IMPLEMENTATION.INTEGER_OVERFLOW", "IMPLEMENTATION.INTEGER_OVERFLOW", "Integer range and overflow", ["T1", "T2"], "P0"),
    template("BINARY_SEARCH.ANSWER_CHECK", "BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY", "Binary answer check monotonicity", ["T2", "T3"], "P0"),
    template("DP.LINEAR.STATE_TRANSITION", "DP.GENERAL.STATE_TRANSITION", "DP state and transition", ["T2", "T3"], "P0"),
    template("DP.INTERVAL.INIT_AND_ORDER", "DP.INTERVAL.INIT_AND_ORDER", "Interval DP init and order", ["T2", "T3"], "P1"),
    template("GRAPH.BASIC_MODELING", "GRAPH.MODELING.GRAPH_ABSTRACTION", "Graph modeling", ["T2", "T3"], "P0"),
    template("DSU.SET_MEANING", "DATA_STRUCTURE.DSU.SET_MEANING", "DSU set meaning", ["T2", "T3"], "P1"),
    template("GREEDY.PROOF_EXCHANGE", "GREEDY.PROOF.EXCHANGE_ARGUMENT", "Greedy proof and counterexample", ["T2", "T3", "T4"], "P0"),
    template("PARTIAL_SCORE.SUBTASK_ANALYSIS", "PARTIAL_SCORE.SUBTASK_ANALYSIS", "Partial-score subtask decomposition", ["T3", "T4"], "P0"),
    template("PARTIAL_SCORE.BRUTE_FORCE", "PARTIAL_SCORE.SUBTASK_ANALYSIS", "Executable brute-force route", ["T3", "T4"], "P1"),
    template("CONTEST.TIME_ALLOCATION", "COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION", "Contest time allocation", ["T1", "T2", "T3", "T4"], "P1"),
  ];
}

function template(unitId: string, sourceAbilityId: string, title: string, slots: Slot[], priority: TrainingPriority) {
  return { unitId, sourceAbilityId, title, targetScoreRole: slots, priority };
}

function templateForAbility(abilityId: string) {
  const unitId = abilityId
    .replace("BASIC_ALGORITHM.", "")
    .replace("DATA_STRUCTURE.", "")
    .replace(/\./g, "_");
  return template(unitId, abilityId, readableAbilityTitle(abilityId), slotsForAbility(abilityId), abilityId.includes("PARTIAL") ? "P0" : "P1");
}

function makeLearningUnit(templateUnit: Partial<LearningUnit> & { unitId: string; sourceAbilityId: string }, loss?: ExpectedLossItem, state?: SkillMasteryItem): LearningUnit {
  const abilityId = templateUnit.sourceAbilityId;
  const title = templateUnit.title ?? readableAbilityTitle(abilityId);
  return {
    unitId: templateUnit.unitId,
    title,
    sourceAbilityId: abilityId,
    targetScoreRole: templateUnit.targetScoreRole ?? slotsForAbility(abilityId),
    priority: templateUnit.priority ?? priorityForLoss(loss),
    goal: goalForAbility(abilityId),
    prerequisites: prerequisitesForAbility(abilityId),
    conceptExplanation: {
      short: conceptForAbility(abilityId),
      keyQuestions: questionsForAbility(abilityId),
    },
    commonMistakes: mistakesForAbility(abilityId),
    passCriteria: passCriteriaForAbility(abilityId),
    estimatedLoss: loss?.expectedLoss.value ?? 0,
    masteryLevel: state?.masteryLevel ?? "NO_EVIDENCE",
  };
}

function ladderTask(
  level: number,
  name: string,
  taskType: LadderTask["taskType"],
  purpose: string,
  problemSource: LadderTask["problemSource"],
  source: JsonObject | undefined,
  unit: LearningUnit,
  timeLimitMinutes: number,
): LadderTask {
  return {
    level,
    name,
    taskType,
    purpose,
    problemSource,
    problemPid: getString(source, "problemPid") || undefined,
    problemId: getString(source, "mutationId") || getString(source, "generatedProblemId") || undefined,
    title: getString(source, "title") || getString(source, "goal") || unit.title,
    difficulty: getString(source, "difficulty") || difficultyForUnit(unit),
    timeLimitMinutes,
    passSignal: passSignalForTask(taskType, unit),
  };
}

function fallbackLadderTask(level: number, unit: LearningUnit): LadderTask {
  return {
    level,
    name: level === 5 ? "CSP-S style validation" : "Transfer validation",
    taskType: level === 5 ? "CSP_STYLE_PROBLEM" : "MUTATION",
    purpose: level === 5 ? "Verify contest ability." : "Verify transfer ability.",
    problemSource: "SELECT_EXISTING",
    title: unit.title,
    difficulty: difficultyForUnit(unit),
    timeLimitMinutes: level === 5 ? 100 : 45,
    passSignal: passSignalForTask(level === 5 ? "CSP_STYLE_PROBLEM" : "MUTATION", unit),
  };
}

function buildProblemExplanation(unit: LearningUnit | undefined, task: LadderTask) {
  const title = unit?.title ?? task.title ?? "Training task";
  const keyQuestions = unit?.conceptExplanation.keyQuestions ?? ["What is the model?", "What is the boundary?", "What is the complexity?"];
  return {
    problemRef: task.problemPid ?? task.problemId ?? task.title,
    unitId: unit?.unitId ?? "UNKNOWN_UNIT",
    stagePlan: [
      {
        stage: "PRE_SOLVE",
        content: {
          thisProblemTrains: title,
          beforeCodingQuestions: keyQuestions,
          doNotReveal: ["full code", "full solution"],
        },
      },
      {
        stage: "HINTS",
        hints: [
          { level: 1, type: "DIRECTION", content: `Identify which part of ${title} is being tested.` },
          { level: 2, type: "MODEL", content: "Write the model in natural language before writing code." },
          { level: 3, type: "KEY_STEP", content: keyQuestions[0] ?? "Write the key invariant or state meaning." },
          { level: 4, type: "SOLUTION_OUTLINE", content: "Describe the algorithm route, but still write the code independently." },
          { level: 5, type: "FULL_SOLUTION", content: "Use only after the attempt is finished; mark hasSeenSolution=true in the log." },
        ],
      },
      {
        stage: "AFTER_SUBMISSION",
        content: {
          diagnosis: "Compare the actual failed stage with the target ability. Do not treat AC after high-level hints as full mastery.",
          errorTypes: unit?.commonMistakes ?? [],
          fixSuggestion: unit?.passCriteria ?? [],
        },
      },
      {
        stage: "REVIEW",
        content: {
          summaryQuestions: [
            "What was the key idea?",
            "Which hint level did you use?",
            "Which failed stage appeared?",
            "Should this unit be redone tomorrow?",
          ],
          needRedoRule: "Redo if score < target, submissionCount > 2, hintLevelUsed >= 3, or hasSeenSolution=true.",
        },
      },
    ],
  };
}

function buildDailyTasks(unit: LearningUnit, ladder?: ProblemLadder) {
  const steps = ladder?.ladder ?? [];
  return [
    {
      order: 1,
      type: "CONCEPT_EXPLANATION",
      durationMinutes: 10,
      contentId: unit.unitId,
      goal: unit.conceptExplanation.short,
      beforeCodingQuestions: unit.conceptExplanation.keyQuestions,
    },
    ...steps.slice(1, 4).map((task, index) => ({
      order: index + 2,
      type: task.taskType,
      problemPid: task.problemPid,
      problemId: task.problemId,
      durationMinutes: task.timeLimitMinutes,
      goal: task.purpose,
      passSignal: task.passSignal,
    })),
    {
      order: 5,
      type: "REVIEW",
      durationMinutes: 20,
      goal: "Record result, score, submissions, hint level, failed stage and next redo decision.",
    },
  ];
}

function masteryStatusFor(unitLogs: TrainingLogItem[], acLogs: TrainingLogItem[], transferLogs: TrainingLogItem[], cspLogs: TrainingLogItem[], source?: SkillMasteryItem): MasteryStatus {
  if (unitLogs.length === 0) {
    if (!source || source.masteryLevel === "NO_EVIDENCE") return "NOT_STARTED";
    if (["EXPOSED", "UNSTABLE"].includes(source.masteryLevel)) return "LEARNING";
    return "PRACTICING";
  }
  if (cspLogs.some((item) => item.score >= 80 && !item.hasSeenSolution && item.hintLevelUsed <= 1)) return "CONTEST_READY";
  if (transferLogs.some((item) => item.score >= 80 && item.hintLevelUsed <= 2)) return "PASSED_TRANSFER";
  if (acLogs.length >= 2 && acLogs.every((item) => item.submissionCount <= 2 && item.hintLevelUsed <= 2)) return "PASSED_BASIC";
  if (unitLogs.some((item) => item.needRedo || item.score < 60 || item.hintLevelUsed >= 4)) return "UNSTABLE";
  return "PRACTICING";
}

function buildMockReviewTemplate(plan: JsonObject): string {
  const tasks = arrayOfObjects(plan.tasks);
  return [
    "# Weekly CSP-S target-score mock review",
    "",
    `Target score: ${getString(plan, "targetScore")}`,
    "",
    "## Planned Set",
    "",
    ...tasks.map((task) => `- ${getString(task, "slot")}: ${getString(task, "problemPid")} ${getString(task, "title")} | target ${getString(task, "targetScore")} | focus ${getString(task, "validationFocus")}`),
    "",
    "## Fill After Exam",
    "",
    "```json",
    JSON.stringify({
      date: getString(plan, "date"),
      scores: { t1: 0, t2: 0, t3: 0, t4: 0, total: 0 },
      timeUsage: { t1: 0, t2: 0, t3: 0, t4: 0 },
      review: {
        t1Stable: false,
        t2MainIssue: "",
        t3PartialScore: "",
        t4Strategy: "",
        nextWeekFocus: [],
      },
    }, null, 2),
    "```",
    "",
    "## Decision Rules",
    "",
    "- If T1 < target, next week returns to T1 stability units.",
    "- If T2 < target, prioritize modeling units before T3/T4 hard practice.",
    "- If T3 has no valid partial-score route, prioritize PARTIAL_SCORE.SUBTASK_ANALYSIS.",
    "- If total reaches target for 3-5 sets, raise the next target score or move toward first-prize safety line.",
    "",
  ].join("\n");
}

function renderGoalScorePlan(plan: GoalScorePlan): string {
  return [
    "# CSP-S target-score training route",
    "",
    `Target score: ${plan.targetScore}`,
    `Weekly hours: ${plan.weeklyHours}`,
    "",
    "## Score Breakdown",
    "",
    "| Slot | Target | Current estimate | Gap | Role | Priority |",
    "|---|---:|---:|---:|---|---|",
    ...Object.entries(plan.scoreBreakdown).map(([slot, item]) => `| ${slot.toUpperCase()} | ${item.targetScore} | ${item.currentEstimate} | ${item.gap} | ${item.role} | ${item.trainingPriority} |`),
    "",
    ...(plan.calibration ? [
      "## Calibration",
      "",
      `- Source: ${plan.calibration.source}`,
      `- Method: ${plan.calibration.method}`,
      `- Baseline: ${plan.calibration.baselineYear} ${plan.calibration.baselineExamName}, total ${plan.calibration.baselineTotalScore}`,
      `- Raw estimate total: ${plan.calibration.rawEstimateTotal}`,
      `- Calibrated total: ${plan.calibration.calibratedTotal}`,
      `- Confidence: ${plan.calibration.confidence}`,
      `- Note: ${plan.calibration.note}`,
      "",
    ] : []),
    "## Training Ratio",
    "",
    ...Object.entries(plan.trainingStrategy).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Route",
    "",
    ...plan.route.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function renderLearningUnits(units: LearningUnit[]): string {
  return [
    "# Learning units",
    "",
    "| Unit | Ability | Slots | Priority | Loss | Mastery |",
    "|---|---|---|---|---:|---|",
    ...units.map((unit) => `| ${unit.unitId} | ${unit.sourceAbilityId} | ${unit.targetScoreRole.join("/")} | ${unit.priority} | ${unit.estimatedLoss} | ${unit.masteryLevel} |`),
    "",
    "## Pass Criteria",
    "",
    ...units.slice(0, 20).flatMap((unit) => [
      `### ${unit.unitId}`,
      "",
      ...unit.passCriteria.map((item) => `- ${item}`),
      "",
    ]),
  ].join("\n");
}

function renderProblemLadders(ladders: ProblemLadder[]): string {
  return [
    "# Problem ladders",
    "",
    ...ladders.slice(0, 20).flatMap((ladder) => [
      `## ${ladder.unitId}`,
      "",
      ...ladder.ladder.map((task) => `- L${task.level} ${task.name}: ${task.problemPid ?? task.problemId ?? task.title ?? "-"} | ${task.taskType} | ${task.purpose}`),
      "",
    ]),
  ].join("\n");
}

function renderDailyTraining(plan: JsonObject): string {
  const tasks = arrayOfObjects(plan.tasks);
  return [
    "# Daily target-score training plan",
    "",
    `Date: ${getString(plan, "date")}`,
    `Target score: ${getString(plan, "targetScore")}`,
    `Today goal: ${getString(plan, "todayGoal")}`,
    "",
    "## Why Today",
    "",
    ...arrayOfStrings(plan.whyToday).map((item) => `- ${item}`),
    "",
    "## Tasks",
    "",
    ...tasks.map((task) => `- ${getString(task, "order")}. ${getString(task, "type")} ${getString(task, "problemPid") || getString(task, "problemId") || getString(task, "contentId")} (${getString(task, "durationMinutes")} min): ${getString(task, "goal")}`),
    "",
    "## Pass Criteria",
    "",
    ...arrayOfStrings(plan.passCriteria).map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function passRulesFor(unit: LearningUnit) {
  return {
    PASSED_BASIC: unit.passCriteria.slice(0, 2),
    PASSED_TRANSFER: ["Finish one mutation or generated diagnostic task.", "No repeated core mistake.", "Explain why the solution still works after the variant."],
    CONTEST_READY: ["Finish one CSP-S style task under time limit.", "Reach the slot target score.", "Do not use full solution."],
  };
}

function calculateMasteryItems(units: LearningUnit[], logs: TrainingLogItem[], skillMastery: SkillMasteryItem[]): Array<JsonObject & { unitId: string; status: MasteryStatus }> {
  const skillByAbility = new Map(skillMastery.map((item) => [item.abilityId, item]));
  return units.map((unit) => {
    const unitLogs = logs.filter((item) => item.unitId === unit.unitId);
    const acLogs = unitLogs.filter((item) => item.result === "AC" || item.score >= 100);
    const cspLogs = unitLogs.filter((item) => item.taskType === "CSP_STYLE_PROBLEM");
    const transferLogs = unitLogs.filter((item) => item.taskType === "MUTATION" || item.taskType === "GENERATE_DIAGNOSTIC");
    const source = skillByAbility.get(unit.sourceAbilityId);
    const avgScore = average(unitLogs.map((item) => item.score));
    const maxHint = Math.max(0, ...unitLogs.map((item) => item.hintLevelUsed));
    const status = masteryStatusFor(unitLogs, acLogs, transferLogs, cspLogs, source);
    return {
      unitId: unit.unitId,
      title: unit.title,
      sourceAbilityId: unit.sourceAbilityId,
      status,
      historicalMasteryLevel: unit.masteryLevel,
      estimatedLoss: unit.estimatedLoss,
      completedTasks: unitLogs.length,
      acTasks: acLogs.length,
      averageScore: round(avgScore),
      maxHintLevelUsed: maxHint,
      passRules: passRulesFor(unit),
      nextAction: nextActionForStatus(status, unit),
    };
  });
}

function nextActionForStatus(status: MasteryStatus, unit: LearningUnit): string {
  if (status === "NOT_STARTED") return `Start with concept explanation for ${unit.unitId}.`;
  if (status === "LEARNING") return "Do concept -> basic -> standard tasks before mutation.";
  if (status === "PRACTICING") return "Add standard and mutation tasks.";
  if (status === "UNSTABLE") return "Redo with review; do not advance to next unit.";
  if (status === "PASSED_BASIC") return "Move to mutation and CSP-style validation.";
  if (status === "PASSED_TRANSFER") return "Schedule CSP-S style validation.";
  return "Maintain with weekly mock exams.";
}

function trainingLogSchema(): JsonObject {
  return {
    requiredFields: ["date", "unitId", "problemPid", "taskType", "result", "score", "timeMinutes", "submissionCount", "hintLevelUsed", "hasSeenSolution", "errorTypes", "failedStage", "studentSummary", "needRedo"],
    exampleCommand: "pnpm train:log -- --unitId BINARY_SEARCH.ANSWER_CHECK --problemPid P2678 --taskType PRACTICE_STANDARD --result AC --score 100 --timeMinutes 45 --submissionCount 2 --hintLevelUsed 1 --hasSeenSolution false",
  };
}

function latestTrainingDate(logs: TrainingLogItem[]): string | null {
  return logs.map((item) => item.date).filter(Boolean).sort().at(-1) ?? null;
}

function xpForLog(log: TrainingLogItem): number {
  const taskBase = taskWeight(log.taskType);
  const scoreXp = Math.max(0, log.score) * taskBase;
  const qualityBonus = (log.submissionCount <= 2 ? 12 : 0) + (log.hintLevelUsed <= 1 ? 12 : 0);
  const penalty = (log.hasSeenSolution ? 35 : 0) + (log.needRedo ? 20 : 0) + Math.max(0, log.submissionCount - 2) * 6 + Math.max(0, log.hintLevelUsed - 2) * 8;
  return Math.max(5, Math.round(20 + scoreXp + qualityBonus - penalty));
}

function taskWeight(taskType: string): number {
  if (taskType === "CSP_STYLE_PROBLEM") return 1.35;
  if (taskType === "MUTATION" || taskType === "GENERATE_DIAGNOSTIC") return 1.15;
  if (taskType === "PRACTICE_STANDARD") return 0.95;
  if (taskType === "PRACTICE_BASIC") return 0.75;
  return 0.65;
}

function riskReductionForLog(log: TrainingLogItem, unit?: LearningUnit): number {
  const unitLoss = Math.max(1, unit?.estimatedLoss ?? 2);
  const scoreFactor = clamp(log.score / 100, 0, 1.1);
  const qualityFactor = clamp(1.15 - log.hintLevelUsed * 0.12 - Math.max(0, log.submissionCount - 1) * 0.07 - (log.hasSeenSolution ? 0.35 : 0) - (log.needRedo ? 0.3 : 0), 0.1, 1.15);
  const taskFactor = taskWeight(log.taskType);
  return round(Math.min(unitLoss * 0.35, unitLoss * 0.12 * scoreFactor * qualityFactor * taskFactor), 2);
}

function levelFromXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / 300) + 1;
}

function nextLevelXp(level: number): number {
  return Math.max(1, level) * 300;
}

function levelTitle(level: number): string {
  if (level >= 12) return "CSP-S target closer";
  if (level >= 8) return "Contest transfer builder";
  if (level >= 5) return "Stable scoring builder";
  if (level >= 3) return "Core skill builder";
  return "Training starter";
}

function settlementMessage(unit: LearningUnit, logs: TrainingLogItem[], before: MasteryStatus, after: MasteryStatus, riskReduced: number): string {
  const avgScore = round(average(logs.map((item) => item.score)), 1);
  const hardFlags = logs.filter((item) => item.needRedo || item.hasSeenSolution || item.hintLevelUsed >= 3 || item.submissionCount >= 3);
  if (before !== after) return `${unit.title}: ${before} -> ${after}. This is real progress because today's evidence changed the mastery state.`;
  if (hardFlags.length > 0) return `${unit.title}: average score ${avgScore}, but hints/submissions/redo show the weakness is not cleared yet. Keep it in the next plan.`;
  if (avgScore >= 85) return `${unit.title}: stable positive evidence. Estimated target-score risk reduced by ${riskReduced} points.`;
  return `${unit.title}: partial progress. The system records evidence, but it needs another clean task before upgrading.`;
}

function evidenceLines(logs: TrainingLogItem[], unitById: Map<string, LearningUnit>): string[] {
  if (logs.length === 0) return ["No real training log yet. Finish today's tasks and record them with pnpm train:log."];
  return logs.map((log) => {
    const unit = unitById.get(log.unitId);
    const quality = log.hasSeenSolution ? "used full solution" : log.hintLevelUsed > 0 ? `hint level ${log.hintLevelUsed}` : "no hint";
    return `${log.problemPid}: ${unit?.title ?? log.unitId}, score ${log.score}, ${log.submissionCount} submissions, ${quality}, failedStage=${log.failedStage ?? "none"}.`;
  });
}

function pickNextAdjustment(units: LearningUnit[], mastery: Array<JsonObject & { unitId: string; status: MasteryStatus }>, todayLogs: TrainingLogItem[]) {
  const masteryByUnit = new Map(mastery.map((item) => [item.unitId, item]));
  const redo = todayLogs.find((item) => item.needRedo || item.score < 60 || item.hintLevelUsed >= 4 || item.hasSeenSolution);
  if (redo) {
    const unit = units.find((item) => item.unitId === redo.unitId) ?? units[0];
    return {
      action: "REDO_AND_REVIEW",
      reason: `${redo.problemPid} still has unstable evidence, so tomorrow should not blindly advance.`,
      nextUnitId: unit?.unitId ?? "UNKNOWN_UNIT",
      nextUnitTitle: unit?.title ?? "Unknown unit",
    };
  }
  const nextUnit = units.find((unit) => !["PASSED_TRANSFER", "CONTEST_READY"].includes(getString(masteryByUnit.get(unit.unitId), "status"))) ?? units[0];
  return {
    action: "ADVANCE_OR_TRANSFER",
    reason: "No blocking failure in the latest settlement. Continue with the highest-loss unit that is not transfer-ready.",
    nextUnitId: nextUnit?.unitId ?? "UNKNOWN_UNIT",
    nextUnitTitle: nextUnit?.title ?? "Unknown unit",
  };
}

function renderTrainingSettlement(settlement: TrainingSettlement): string {
  return [
    "# Daily training settlement",
    "",
    `Date: ${settlement.date}`,
    `Target score: ${settlement.targetScore}`,
    "",
    "## Growth",
    "",
    `- Completed tasks: ${settlement.today.completedTasks}`,
    `- XP gained: ${settlement.today.xpGained}`,
    `- Level: ${settlement.level.before} -> ${settlement.level.after} (${settlement.level.title})`,
    `- Upgraded: ${settlement.level.upgraded ? "yes" : "no"}`,
    `- Score proxy: ${settlement.today.scoreProxyBefore} -> ${settlement.today.scoreProxyAfter}`,
    `- Distance to target: ${settlement.today.distanceBefore} -> ${settlement.today.distanceAfter}`,
    `- Estimated risk reduced: ${settlement.today.riskReduced}`,
    "",
    "## Ability Changes",
    "",
    ...settlement.abilityChanges.flatMap((item) => [
      `### ${item.unitId}`,
      "",
      `- ${item.beforeStatus} -> ${item.afterStatus}`,
      `- Problems: ${item.todayProblems.join(", ")}`,
      `- Average score: ${item.todayScoreAverage}`,
      `- Risk reduced: ${item.riskReduced}`,
      `- ${item.message}`,
      "",
    ]),
    "## Evidence",
    "",
    ...settlement.evidence.map((item) => `- ${item}`),
    "",
    "## Next Adjustment",
    "",
    `- Action: ${settlement.nextAdjustment.action}`,
    `- Reason: ${settlement.nextAdjustment.reason}`,
    `- Next unit: ${settlement.nextAdjustment.nextUnitId} ${settlement.nextAdjustment.nextUnitTitle}`,
    "",
  ].join("\n");
}

async function readOrBuildGoalScorePlan(options: TargetTrainingOptions): Promise<GoalScorePlan> {
  const filePath = path.join(options.trainingGoalDir, "goal_score_plan.json");
  if (await exists(filePath)) return readJson<GoalScorePlan>(filePath);
  return buildGoalScorePlan(options);
}

async function readOrBuildLearningUnits(options: TargetTrainingOptions): Promise<LearningUnit[]> {
  const filePath = path.join(options.learningUnitsDir, "learning_units.json");
  if (await exists(filePath)) return (await readJson<{ items: LearningUnit[] }>(filePath)).items;
  return buildLearningUnits(options);
}

async function readOrBuildProblemLadders(options: TargetTrainingOptions): Promise<ProblemLadder[]> {
  const filePath = path.join(options.problemLaddersDir, "problem_ladders.json");
  if (await exists(filePath)) return (await readJson<{ items: ProblemLadder[] }>(filePath)).items;
  return buildProblemLadders(options);
}

async function loadExpectedLosses(options: TargetTrainingOptions): Promise<ExpectedLossItem[]> {
  const filePath = path.join(options.benchmarkDir, "expected_score_loss.json");
  return (await readJsonIfExists<{ items?: ExpectedLossItem[] }>(filePath, { items: [] })).items ?? [];
}

async function loadSkillMastery(options: TargetTrainingOptions): Promise<SkillMasteryItem[]> {
  const filePath = path.join(options.benchmarkDir, "skill_mastery.json");
  return (await readJsonIfExists<{ items?: SkillMasteryItem[] }>(filePath, { items: [] })).items ?? [];
}

async function loadPastProblems(options: TargetTrainingOptions): Promise<JsonObject[]> {
  const filePath = path.join(options.benchmarkDir, "past_problems_2019_2025.json");
  return (await readJsonIfExists<{ problems?: JsonObject[] }>(filePath, { problems: [] })).problems ?? [];
}

async function loadLatestExamBaseline(options: TargetTrainingOptions): Promise<StudentExamBaseline | null> {
  const filePath = path.join(options.benchmarkDir, "student_exam_baselines.json");
  const value = await readJsonIfExists<{ items?: StudentExamBaseline[] }>(filePath, { items: [] });
  const items = (value.items ?? [])
    .filter((item) => Number.isFinite(item.year) && Number.isFinite(item.totalScore))
    .sort((a, b) => a.year - b.year);
  return items.at(-1) ?? null;
}

async function loadSelectedTrainingTasks(options: TargetTrainingOptions): Promise<JsonObject[]> {
  const value = await readJsonIfExists<{ items?: Array<{ tasks?: JsonObject[] }> }>(path.join(options.problemBankDir, "selected_training_tasks.json"), { items: [] });
  return (value.items ?? []).flatMap((item) => item.tasks ?? []);
}

async function loadMutatedProblems(options: TargetTrainingOptions): Promise<JsonObject[]> {
  return (await readJsonIfExists<{ items?: JsonObject[] }>(path.join(options.problemBankDir, "mutated_problem_specs.json"), { items: [] })).items ?? [];
}

async function loadGeneratedProblems(options: TargetTrainingOptions): Promise<JsonObject[]> {
  return (await readJsonIfExists<{ items?: JsonObject[] }>(path.join(options.problemBankDir, "generated_problem_specs.json"), { items: [] })).items ?? [];
}

function lossBySlot(losses: ExpectedLossItem[]): Record<Slot, number> {
  const output: Record<Slot, number> = { T1: 0, T2: 0, T3: 0, T4: 0 };
  for (const loss of losses) {
    const slots = new Set(loss.relatedPastProblems.map((item) => item.slot));
    for (const slot of slots) output[slot] += loss.expectedLoss.value / Math.max(slots.size, 1);
  }
  return output;
}

function unitMatchesProblem(unit: LearningUnit, item: JsonObject): boolean {
  const text = JSON.stringify(item).toLowerCase();
  const ability = unit.sourceAbilityId.toLowerCase();
  const unitId = unit.unitId.toLowerCase();
  return text.includes(ability) || text.includes(unitId) || unit.sourceAbilityId.split(".").some((part) => part.length > 3 && text.includes(part.toLowerCase()));
}

function priorityForLoss(loss?: ExpectedLossItem): TrainingPriority {
  if (!loss) return "P2";
  if (loss.firstPrizeImpact === "CRITICAL" || loss.firstPrizeImpact === "HIGH") return "P0";
  if (loss.firstPrizeImpact === "MEDIUM") return "P1";
  return "P2";
}

function slotsForAbility(abilityId: string): Slot[] {
  if (abilityId.includes("PARTIAL_SCORE")) return ["T3", "T4"];
  if (abilityId.includes("TIME_ALLOCATION")) return ["T1", "T2", "T3", "T4"];
  if (abilityId.includes("IMPLEMENTATION")) return ["T1", "T2"];
  if (abilityId.includes("BINARY") || abilityId.includes("DP") || abilityId.includes("GRAPH") || abilityId.includes("GREEDY")) return ["T2", "T3"];
  return ["T2", "T3", "T4"];
}

function goalForAbility(abilityId: string): string {
  if (abilityId.includes("BINARY_SEARCH")) return "Recognize answer monotonicity, write a correct check function, and handle l/r/mid boundaries.";
  if (abilityId.includes("PARTIAL_SCORE")) return "Write executable 30/50/70/100-point routes before chasing the full solution.";
  if (abilityId.includes("IMPLEMENTATION")) return "Avoid low-level score loss from boundary, initialization, overflow and repeated submissions.";
  if (abilityId.includes("DP")) return "Define state, transition, initialization, enumeration order and complexity before coding.";
  if (abilityId.includes("GRAPH")) return "Translate entities and relations into graph nodes, edges, weights and states.";
  if (abilityId.includes("GREEDY")) return "Prove the local choice or find a counterexample before coding.";
  return `Pass the trainable ability ${abilityId}.`;
}

function prerequisitesForAbility(abilityId: string): string[] {
  if (abilityId.includes("BINARY_SEARCH")) return ["basic binary search", "greedy scanning", "complexity estimate"];
  if (abilityId.includes("DP")) return ["array/vector basics", "state meaning", "loop order"];
  if (abilityId.includes("GRAPH")) return ["DFS/BFS", "adjacency list", "complexity estimate"];
  if (abilityId.includes("PARTIAL_SCORE")) return ["constraint extraction", "brute force", "special-property recognition"];
  return ["reading constraints", "implementation stability"];
}

function conceptForAbility(abilityId: string): string {
  if (abilityId.includes("BINARY_SEARCH")) return "Binary answer search means binary searching a possible answer and using check(x) to decide feasibility.";
  if (abilityId.includes("PARTIAL_SCORE")) return "Partial-score training starts from data ranges: brute force for small data, special properties for middle score, full solution last.";
  if (abilityId.includes("DP")) return "DP training starts from state meaning, not from memorizing a template.";
  if (abilityId.includes("GRAPH")) return "Graph modeling is defining what a node, edge, weight and reachable state mean.";
  if (abilityId.includes("GREEDY")) return "Greedy is only valid after an exchange argument or invariant excludes counterexamples.";
  return "This unit trains a single observable ability with a pass criterion.";
}

function questionsForAbility(abilityId: string): string[] {
  if (abilityId.includes("BINARY_SEARCH")) return ["What is the answer?", "What does check(x) mean?", "Which direction is monotonic?", "What are l/r boundaries?", "What is the complexity?"];
  if (abilityId.includes("PARTIAL_SCORE")) return ["What are the constraints?", "What brute force gets 20-30 points?", "What special property gets 50-70?", "Can I code the partial route now?", "When should I stop chasing full marks?"];
  if (abilityId.includes("DP")) return ["What does dp state mean?", "Where does the transition come from?", "What is initialized?", "What is the iteration order?", "What is the complexity?"];
  if (abilityId.includes("GRAPH")) return ["What is a node?", "What is an edge?", "What does distance/connectivity mean?", "What is the start/end state?", "What is the complexity?"];
  return ["What does this unit train?", "What can go wrong?", "How do I verify it before submission?"];
}

function mistakesForAbility(abilityId: string): string[] {
  if (abilityId.includes("BINARY_SEARCH")) return ["check meaning reversed", "wrong monotonic direction", "l/r boundary error", "mid update infinite loop", "wrong answer range"];
  if (abilityId.includes("PARTIAL_SCORE")) return ["skip brute force", "no 30/50/70 route", "spend too long on full solution", "ignore special properties"];
  if (abilityId.includes("IMPLEMENTATION")) return ["off-by-one", "uninitialized array", "overflow", "multi-test not cleared"];
  if (abilityId.includes("DP")) return ["state not defined", "wrong transition source", "bad initialization", "wrong enumeration order"];
  if (abilityId.includes("GRAPH")) return ["wrong node meaning", "missing edge condition", "INF/init bug", "complexity too high"];
  return ["unclear model", "boundary not checked", "no small-case verification"];
}

function passCriteriaForAbility(abilityId: string): string[] {
  if (abilityId.includes("BINARY_SEARCH")) return ["Finish 2 binary-answer tasks with submissionCount <= 2.", "Write natural-language check meaning.", "Explain monotonicity.", "No boundary convergence error."];
  if (abilityId.includes("PARTIAL_SCORE")) return ["For 5 T3/T4 tasks, write 30/50/70 routes before coding.", "At least 3 routes are executable.", "Do not use full solution before attempt.", "Record actual score vs predicted route."];
  if (abilityId.includes("IMPLEMENTATION")) return ["Pass boundary checklist before submission.", "No overflow/index/init error in 3 consecutive tasks.", "submissionCount <= 2."];
  return ["Finish 2 basic tasks and 1 transfer task.", "submissionCount <= 2.", "Can explain model and complexity.", "No repeated core mistake."];
}

function readableAbilityTitle(abilityId: string): string {
  return abilityId.toLowerCase().replace(/[._]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function difficultyForUnit(unit: LearningUnit): string {
  if (unit.targetScoreRole.includes("T1")) return "intro/basic";
  if (unit.targetScoreRole.includes("T2")) return "basic+/intermediate";
  if (unit.targetScoreRole.includes("T3")) return "intermediate+/CSP-S";
  return "CSP-S strategy";
}

function passSignalForTask(taskType: LadderTask["taskType"], unit: LearningUnit): string {
  if (taskType === "MUTATION") return "Solve without using hint level >= 3 and explain what changed from the base problem.";
  if (taskType === "CSP_STYLE_PROBLEM") return "Reach the slot target score within the time limit.";
  if (taskType === "PRACTICE_BASIC") return unit.passCriteria[0] ?? "Finish the task.";
  return "Record result, submissions, hint usage and failed stage.";
}

function priorityRank(priority: TrainingPriority): number {
  return { P0: 0, P1: 1, P2: 2 }[priority];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function nextDate(days: number): string {
  const date = new Date(Date.now() + days * 86_400_000);
  return date.toISOString().slice(0, 10);
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
    if (key && value) args[key] = value;
  }
  return args;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  if (!(await exists(filePath))) return fallback;
  return readJson<T>(filePath);
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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

function getString(source: unknown, key: string): string {
  if (!isObject(source)) return "";
  const value = source[key];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function splitList(value: unknown): string[] {
  return String(value ?? "").split(/[;,，、|]/).map((item) => item.trim()).filter(Boolean);
}

function booleanField(value: unknown): boolean {
  return ["true", "1", "yes", "y"].includes(String(value ?? "").toLowerCase());
}

function numberField(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function average(values: number[]): number {
  const filtered = values.filter(Number.isFinite);
  return filtered.length > 0 ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : 0;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
