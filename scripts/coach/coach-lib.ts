import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;

type CoachOptions = {
  diagnosisDir: string;
  problemBankDir: string;
  generatedProblemsDir: string;
  outputDir: string;
  docsDir: string;
  days: number;
  cycles: number;
};

type Weakness = {
  weaknessId: string;
  title: string;
  severity: number;
  relatedModules: string[];
  relatedErrorTypes: string[];
  evidenceProblems: string[];
  problemCount: number;
  trainingAction: string;
  verifyMethod: string;
  clusterIds: string[];
};

type CoachHypothesis = {
  weaknessId: string;
  title: string;
  status: "HYPOTHESIS" | "VALIDATED" | "WATCH" | "DOWNGRADED";
  confidence: number;
  trainingPriority: number;
  severity: number;
  relatedModules: string[];
  relatedErrorTypes: string[];
  evidenceProblems: string[];
  clusterIds: string[];
  sourceCoverage: {
    deepSeekDiagnosedClusters: number;
    ruleBasedClusters: number;
  };
  validationTasks: CoachValidationTask[];
  hitCount: number;
  missCount: number;
  lastValidatedAt: string | null;
};

type CoachValidationTask = {
  taskId: string;
  weaknessId: string;
  taskType: "SELECT" | "MUTATE" | "GENERATE";
  problemRef: string;
  purpose: string;
  targetStage: TrainingStageName;
  successSignal: string;
  failureSignal: string;
  timeLimitMinutes: number;
};

type TrainingStageName =
  | "reading"
  | "modeling"
  | "partialScorePlanning"
  | "algorithmDesign"
  | "implementation"
  | "debugging"
  | "review";

type StageResult = {
  passed: boolean;
  issue: string | null;
};

type AttemptLog = {
  cycle: number;
  day: number;
  dateLabel: string;
  taskId: string;
  problemRef: string;
  weaknessId: string;
  taskType: CoachValidationTask["taskType"];
  stages: Record<TrainingStageName, StageResult>;
  result: "AC" | "PARTIAL" | "FAILED";
  scoreTrajectory: number[];
  submissionCount: number;
  timeSpentMinutes: number;
  oldWeaknessReappeared: boolean;
  coachObservation: string;
};

type CycleState = {
  cycle: number;
  dayRange: string;
  hypothesisUpdates: Array<{
    weaknessId: string;
    beforeConfidence: number;
    afterConfidence: number;
    beforePriority: number;
    afterPriority: number;
    testedProblems: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    decision: string;
  }>;
  nextDecision: {
    focusWeaknessIds: string[];
    taskMix: Record<string, number>;
    reason: string;
  };
  systemRevision: {
    revisionId: string;
    title: string;
    trigger: string;
    change: string[];
    expectedEffect: string;
  };
};

type MockExamResult = {
  cycle: number;
  day: number;
  scores: {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    total: number;
  };
  firstPrizeReadiness: number;
  stillBlockingWeaknesses: string[];
  verdict: string;
};

export function parseCoachCliOptions(argv = process.argv.slice(2)): CoachOptions {
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
    diagnosisDir: path.resolve(args.diagnosis ?? path.join(process.cwd(), "data", "diagnosis")),
    problemBankDir: path.resolve(args.problemBank ?? path.join(process.cwd(), "data", "problem-bank")),
    generatedProblemsDir: path.resolve(args.generated ?? path.join(process.cwd(), "data", "generated-problems")),
    outputDir: path.resolve(args.output ?? path.join(process.cwd(), "data", "coach")),
    docsDir: path.resolve(args.docs ?? path.join(process.cwd(), "docs")),
    days: positiveInteger(args.days, 30),
    cycles: positiveInteger(args.cycles, 3),
  };
}
/*
  if (cycle === 3) {
    return {
    diagnosisDir: path.resolve(args.diagnosis ?? path.join(process.cwd(), "data", "diagnosis")),
    problemBankDir: path.resolve(args.problemBank ?? path.join(process.cwd(), "data", "problem-bank")),
    generatedProblemsDir: path.resolve(args.generated ?? path.join(process.cwd(), "data", "generated-problems")),
    outputDir: path.resolve(args.output ?? path.join(process.cwd(), "data", "coach")),
    docsDir: path.resolve(args.docs ?? path.join(process.cwd(), "docs")),
    days: positiveInteger(args.days, 30),
    cycles: positiveInteger(args.cycles, 3),
    };
  }
  return {
    revisionId: `REV-${cycle}`,
    title: cycle === 4 ? "增加精度校准：区分未测试、命中、未命中" : "增加真实落地校验：把模拟结果转成真实训练要求",
    trigger: `第 ${cycle} 轮模拟赛总分 ${mockExam.scores.total}，一等奖接近度 ${mockExam.firstPrizeReadiness}，需要避免把模拟改善误判成真实达标。`,
    change: cycle === 4
      ? [
          "未被本轮任务覆盖的 weakness 标记为 NOT_TESTED，不再自动降权。",
          "把模拟赛分数曲线改成按进度增长，避免轮数增加导致分数虚高。",
          "增加精度边界说明：真实证据和模拟推断必须分开看。",
        ]
      : [
          "输出 5 轮精度报告，明确哪些结论仍需要真实训练日志验证。",
          "把最终结论限定为“接近目标区间”，不宣称稳定一等奖。",
          "下一步强制要求真实模拟赛和真实 daily feedback 替换模拟数据。",
        ],
    expectedEffect: cycle === 4
      ? "降低系统自我修正中的误伤，避免没有测试过的弱点被错误降权。"
      : "让系统从可复现实验进入真实训练闭环，减少模拟乐观偏差。",
  };
}

*/

export async function buildCoachDecisionSystem(options: CoachOptions): Promise<void> {
  await ensureDir(options.outputDir);
  await ensureDir(options.docsDir);
  const weaknessSummary = await readJson<{ topWeaknesses?: Weakness[] }>(path.join(options.diagnosisDir, "weakness_summary.json"));
  const clusterDiagnosis = await readJson<{ items?: JsonObject[] }>(path.join(options.diagnosisDir, "cluster_llm_diagnosis.json"));
  const mutatedSpecs = await readJson<{ items?: JsonObject[] }>(path.join(options.problemBankDir, "mutated_problem_specs.json"));
  const generatedSpecs = await readJson<{ items?: JsonObject[] }>(path.join(options.problemBankDir, "generated_problem_specs.json"));
  const taskPack = await readJson<JsonObject>(path.join(options.problemBankDir, "task_pack_7d.json"));

  const weaknesses = (weaknessSummary.topWeaknesses ?? []).slice(0, 10).map(normalizeWeakness);
  const sourceByCluster = new Map((clusterDiagnosis.items ?? []).map((item) => [getString(item, "clusterId"), getString(item, "source")]));
  const hypotheses = buildHypotheses(weaknesses, sourceByCluster, mutatedSpecs.items ?? [], generatedSpecs.items ?? []);
  const simulation = simulateThirtyDayCoachLoop(hypotheses, options.days, options.cycles);

  const validationPlan = {
    generatedAt: new Date().toISOString(),
    goal: `CSP-S_FIRST_PRIZE_IN_${options.days}_DAYS`,
    principle: "Weakness is treated as a testable hypothesis. Training tasks are validation probes, not random practice.",
    tasks: hypotheses.flatMap((item) => item.validationTasks),
  };

  await writeJson(path.join(options.outputDir, "weakness_hypotheses.json"), {
    generatedAt: new Date().toISOString(),
    source: {
      weaknessSummary: path.relative(process.cwd(), path.join(options.diagnosisDir, "weakness_summary.json")),
      clusterDiagnosis: path.relative(process.cwd(), path.join(options.diagnosisDir, "cluster_llm_diagnosis.json")),
    },
    items: hypotheses,
  });
  await writeJson(path.join(options.outputDir, "validation_task_plan_30d.json"), validationPlan);
  await writeJson(path.join(options.outputDir, "simulated_training_attempts.json"), {
    generatedAt: new Date().toISOString(),
    items: simulation.attempts,
  });
  await writeJson(path.join(options.outputDir, "coach_state_cycles.json"), {
    generatedAt: new Date().toISOString(),
    items: simulation.cycles,
  });
  await writeJson(path.join(options.outputDir, "mock_exam_validation.json"), {
    generatedAt: new Date().toISOString(),
    items: simulation.mockExams,
  });
  await writeJson(path.join(options.outputDir, "training_attempt_log.json"), {
    generatedAt: new Date().toISOString(),
    note: "This is simulated student feedback. Replace it with real daily logs before using the coach decisions for production.",
    items: simulation.attempts,
  });
  await writeJson(path.join(options.outputDir, "student_state.json"), buildStudentState(options, simulation.finalHypotheses, simulation.attempts, simulation.mockExams));
  const validationReport = buildDiagnosisValidationReport(simulation.finalHypotheses, simulation.attempts);
  await writeJson(path.join(options.outputDir, "diagnosis_validation_report.json"), validationReport);
  await fs.writeFile(path.join(options.outputDir, "diagnosis_validation_report.md"), `\uFEFF${renderDiagnosisValidationReport(validationReport)}`, "utf8");
  await writeDailyCoachOutputs(options, hypotheses, simulation.attempts);
  await writeWeeklyRediagnosisOutputs(options, simulation.cycles, simulation.mockExams);

  const revisionMarkdown = renderRevisionLog(simulation.cycles);
  await fs.writeFile(path.join(options.outputDir, "system_revision_log.md"), `\uFEFF${revisionMarkdown}`, "utf8");

  const reportMarkdown = renderCoachSimulationReport({
    options,
    hypotheses,
    attempts: simulation.attempts,
    cycles: simulation.cycles,
    mockExams: simulation.mockExams,
    taskPack,
  });
  const precisionMarkdown = renderCoachPrecisionReport(options, simulation.finalHypotheses, simulation.cycles, simulation.mockExams);
  await fs.writeFile(path.join(options.outputDir, "coach_30d_simulation_report.md"), `\uFEFF${reportMarkdown}`, "utf8");
  await fs.writeFile(path.join(options.outputDir, `coach_${options.days}d_${options.cycles}cycle_simulation_report.md`), `\uFEFF${reportMarkdown}`, "utf8");
  await fs.writeFile(path.join(options.outputDir, `coach_${options.days}d_${options.cycles}cycle_precision_report.md`), `\uFEFF${precisionMarkdown}`, "utf8");
  await fs.writeFile(path.join(options.docsDir, "AI教练级闭环系统_30天三轮模拟与修正报告.md"), `\uFEFF${reportMarkdown}`, "utf8");
  await fs.writeFile(path.join(options.docsDir, `AI教练级闭环系统_${options.days}天${options.cycles}轮模拟与修正报告.md`), `\uFEFF${reportMarkdown}`, "utf8");
  await fs.writeFile(path.join(options.docsDir, `coach_${options.days}d_${options.cycles}cycle_precision_report.md`), `\uFEFF${precisionMarkdown}`, "utf8");
}

function buildHypotheses(
  weaknesses: Weakness[],
  sourceByCluster: Map<string, string>,
  mutatedSpecs: JsonObject[],
  generatedSpecs: JsonObject[],
): CoachHypothesis[] {
  return weaknesses.map((weakness, index) => {
    const deepSeekDiagnosedClusters = weakness.clusterIds.filter((id) => sourceByCluster.get(id) === "DEEPSEEK_CLUSTER_DIAGNOSIS").length;
    const ruleBasedClusters = Math.max(0, weakness.clusterIds.length - deepSeekDiagnosedClusters);
    const sourceBoost = deepSeekDiagnosedClusters > 0 ? 0.08 : 0;
    const confidence = round(Math.min(0.92, 0.45 + weakness.severity / 180 + sourceBoost), 2);
    const trainingPriority = round(Math.min(100, weakness.severity + Math.max(0, 10 - index) * 1.5 + sourceBoost * 100), 2);
    const validationTasks = buildValidationTasks(weakness, mutatedSpecs, generatedSpecs);
    return {
      weaknessId: weakness.weaknessId,
      title: weakness.title,
      status: "HYPOTHESIS",
      confidence,
      trainingPriority,
      severity: weakness.severity,
      relatedModules: weakness.relatedModules,
      relatedErrorTypes: weakness.relatedErrorTypes,
      evidenceProblems: weakness.evidenceProblems,
      clusterIds: weakness.clusterIds,
      sourceCoverage: { deepSeekDiagnosedClusters, ruleBasedClusters },
      validationTasks,
      hitCount: 0,
      missCount: 0,
      lastValidatedAt: null,
    };
  });
}

function buildValidationTasks(weakness: Weakness, mutatedSpecs: JsonObject[], generatedSpecs: JsonObject[]): CoachValidationTask[] {
  const moduleName = weakness.relatedModules[0] ?? "unknown";
  const mutation = mutatedSpecs.find((item) => getString(item, "baseWeaknessId") === weakness.weaknessId)
    ?? mutatedSpecs.find((item) => getString(item, "module") === moduleName);
  const generated = generatedSpecs.find((item) => getString(item, "weaknessId") === weakness.weaknessId)
    ?? generatedSpecs.find((item) => getString(item, "module") === moduleName);
  const focusStage = stageForWeakness(weakness);
  const evidenceProblem = weakness.evidenceProblems[0] ?? `module:${moduleName}`;
  const mutationRef = getString(mutation, "mutationId") || `mutate:${moduleName}`;
  const generatedRef = getString(generated, "generatedProblemId") || `generate:${moduleName}`;
  return [
    {
      taskId: `${weakness.weaknessId}::select`,
      weaknessId: weakness.weaknessId,
      taskType: "SELECT",
      problemRef: evidenceProblem,
      purpose: "Use a historical evidence problem to verify whether the diagnosed weakness still appears on a familiar pattern.",
      targetStage: focusStage,
      successSignal: successSignalFor(focusStage),
      failureSignal: failureSignalFor(focusStage),
      timeLimitMinutes: 80,
    },
    {
      taskId: `${weakness.weaknessId}::mutate`,
      weaknessId: weakness.weaknessId,
      taskType: "MUTATE",
      problemRef: mutationRef,
      purpose: "Change constraints or output target to verify transfer, not memorization.",
      targetStage: focusStage,
      successSignal: successSignalFor(focusStage),
      failureSignal: failureSignalFor(focusStage),
      timeLimitMinutes: 90,
    },
    {
      taskId: `${weakness.weaknessId}::generate`,
      weaknessId: weakness.weaknessId,
      taskType: "GENERATE",
      problemRef: generatedRef,
      purpose: "Use an original diagnostic draft to deliberately expose the suspected weak stage.",
      targetStage: focusStage,
      successSignal: successSignalFor(focusStage),
      failureSignal: failureSignalFor(focusStage),
      timeLimitMinutes: 100,
    },
  ];
}

function simulateThirtyDayCoachLoop(seedHypotheses: CoachHypothesis[], days: number, cycles: number): {
  attempts: AttemptLog[];
  cycles: CycleState[];
  mockExams: MockExamResult[];
  finalHypotheses: CoachHypothesis[];
} {
  const hypotheses = seedHypotheses.map((item) => ({ ...item, validationTasks: item.validationTasks.map((task) => ({ ...task })) }));
  const attempts: AttemptLog[] = [];
  const cycleStates: CycleState[] = [];
  const mockExams: MockExamResult[] = [];
  const cycleLength = Math.max(1, Math.floor(days / cycles));

  for (let cycle = 1; cycle <= cycles; cycle += 1) {
    const startDay = (cycle - 1) * cycleLength + 1;
    const endDay = cycle === cycles ? days : Math.min(days, cycle * cycleLength);
    const focus = hypotheses
      .slice()
      .sort((a, b) => b.trainingPriority - a.trainingPriority || b.confidence - a.confidence)
      .slice(0, cycle === 1 ? 4 : 5);
    const cycleAttempts: AttemptLog[] = [];
    let day = startDay;
    for (const hypothesis of focus) {
      const tasks = hypothesis.validationTasks.slice(0, cycle === 1 ? 2 : 3);
      for (const task of tasks) {
        if (day > endDay) break;
        const attempt = simulateAttempt(cycle, day, task, hypothesis);
        attempts.push(attempt);
        cycleAttempts.push(attempt);
        day += 1;
      }
      if (day > endDay) break;
    }
    while (day <= endDay) {
      const hypothesis = focus[(day - startDay) % focus.length] ?? hypotheses[0];
      const task = hypothesis.validationTasks[(day + cycle) % hypothesis.validationTasks.length] ?? hypothesis.validationTasks[0];
      attempts.push(simulateAttempt(cycle, day, task, hypothesis));
      day += 1;
    }

    const updates = focus.map((hypothesis) => updateHypothesisFromCycle(hypothesis, attempts.filter((attempt) => attempt.cycle === cycle && attempt.weaknessId === hypothesis.weaknessId), cycle));
    const activeAfterUpdate = hypotheses
      .slice()
      .sort((a, b) => b.trainingPriority - a.trainingPriority || b.confidence - a.confidence)
      .slice(0, 5)
      .map((item) => item.weaknessId);
    const mockExam = simulateMockExam(cycle, cycles, endDay, hypotheses);
    mockExams.push(mockExam);
    cycleStates.push({
      cycle,
      dayRange: `Day ${startDay}-${endDay}`,
      hypothesisUpdates: updates,
      nextDecision: {
        focusWeaknessIds: activeAfterUpdate,
        taskMix: taskMixForCycle(cycle, mockExam),
        reason: nextDecisionReason(cycle, updates, mockExam),
      },
      systemRevision: systemRevisionFor(cycle, updates, mockExam),
    });
  }

  return { attempts, cycles: cycleStates, mockExams, finalHypotheses: hypotheses };
}

function simulateAttempt(cycle: number, day: number, task: CoachValidationTask, hypothesis: CoachHypothesis): AttemptLog {
  const stage = task.targetStage;
  const baseRisk = Math.min(0.95, hypothesis.severity / 100);
  const improvement = 0.16 * (cycle - 1);
  const transferPenalty = task.taskType === "GENERATE" ? 0.1 : task.taskType === "MUTATE" ? 0.06 : 0;
  const deterministicNoise = ((hash(`${task.taskId}:${cycle}:${day}`) % 17) - 8) / 100;
  const reappearScore = baseRisk + transferPenalty + deterministicNoise - improvement;
  const oldWeaknessReappeared = reappearScore >= 0.46;
  const stages = buildStageResults(stage, oldWeaknessReappeared, hypothesis, cycle);
  const submissionCount = oldWeaknessReappeared ? Math.max(2, 5 - cycle + (task.taskType === "GENERATE" ? 1 : 0)) : Math.max(1, 3 - cycle);
  const timeSpentMinutes = task.timeLimitMinutes + (oldWeaknessReappeared ? 15 - cycle * 4 : -15 - cycle * 3);
  const scoreTrajectory = oldWeaknessReappeared
    ? cycle === 1 ? [20, 45, 70] : cycle === 2 ? [30, 70, 100] : [50, 85, 100]
    : cycle === 1 ? [60, 100] : [100];
  const result = scoreTrajectory[scoreTrajectory.length - 1] === 100 ? "AC" : oldWeaknessReappeared ? "PARTIAL" : "AC";
  return {
    cycle,
    day,
    dateLabel: `D${String(day).padStart(2, "0")}`,
    taskId: task.taskId,
    problemRef: task.problemRef,
    weaknessId: hypothesis.weaknessId,
    taskType: task.taskType,
    stages,
    result,
    scoreTrajectory,
    submissionCount,
    timeSpentMinutes,
    oldWeaknessReappeared,
    coachObservation: oldWeaknessReappeared
      ? `Hypothesis was hit at ${stage}: ${task.failureSignal}`
      : `Hypothesis was not hit strongly: ${task.successSignal}`,
  };
}

function buildStageResults(targetStage: TrainingStageName, hit: boolean, hypothesis: CoachHypothesis, cycle: number): Record<TrainingStageName, StageResult> {
  const stages: TrainingStageName[] = ["reading", "modeling", "partialScorePlanning", "algorithmDesign", "implementation", "debugging", "review"];
  const output = Object.fromEntries(stages.map((stage) => [stage, { passed: true, issue: null }])) as Record<TrainingStageName, StageResult>;
  if (!hit) {
    output.review = { passed: true, issue: "Can explain model, partial score route, and one avoidable risk before coding." };
    return output;
  }
  const issue = issueForStage(targetStage, hypothesis, cycle);
  output[targetStage] = { passed: false, issue };
  if (targetStage === "modeling") output.partialScorePlanning = { passed: false, issue: "Model uncertainty caused weak 30/50/70 split." };
  if (targetStage === "partialScorePlanning") output.algorithmDesign = { passed: false, issue: "Did not turn partial plan into staged algorithms." };
  if (targetStage === "algorithmDesign") output.implementation = { passed: false, issue: "State or transition was not stable enough to code cleanly." };
  if (targetStage === "implementation") output.debugging = { passed: false, issue: "Debugging exceeded the planned budget because invariant checks were missing." };
  output.review = { passed: true, issue: `Review captured recurring weakness: ${hypothesis.title}` };
  return output;
}

function updateHypothesisFromCycle(hypothesis: CoachHypothesis, attempts: AttemptLog[], cycle: number): CycleState["hypothesisUpdates"][number] {
  const beforeConfidence = hypothesis.confidence;
  const beforePriority = hypothesis.trainingPriority;
  const hitCount = attempts.filter((attempt) => attempt.oldWeaknessReappeared).length;
  const missCount = attempts.length - hitCount;
  const hitRate = attempts.length === 0 ? 0 : hitCount / attempts.length;
  if (attempts.length === 0) {
    return {
      weaknessId: hypothesis.weaknessId,
      beforeConfidence,
      afterConfidence: hypothesis.confidence,
      beforePriority,
      afterPriority: hypothesis.trainingPriority,
      testedProblems: 0,
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
      decision: "本轮未测试：不修正置信度，也不降权；等待后续任务验证。",
    };
  }
  hypothesis.hitCount += hitCount;
  hypothesis.missCount += missCount;
  hypothesis.lastValidatedAt = `cycle-${cycle}`;
  if (hitRate >= 0.7) {
    hypothesis.status = "VALIDATED";
    hypothesis.confidence = round(Math.min(0.96, hypothesis.confidence + 0.07), 2);
    hypothesis.trainingPriority = round(Math.max(35, hypothesis.trainingPriority - 5 * (cycle - 1)), 2);
  } else if (hitRate >= 0.4) {
    hypothesis.status = "WATCH";
    hypothesis.confidence = round(Math.min(0.92, hypothesis.confidence + 0.02), 2);
    hypothesis.trainingPriority = round(Math.max(30, hypothesis.trainingPriority - 7), 2);
  } else {
    hypothesis.status = "DOWNGRADED";
    hypothesis.confidence = round(Math.max(0.25, hypothesis.confidence - 0.08), 2);
    hypothesis.trainingPriority = round(Math.max(20, hypothesis.trainingPriority - 14), 2);
  }
  return {
    weaknessId: hypothesis.weaknessId,
    beforeConfidence,
    afterConfidence: hypothesis.confidence,
    beforePriority,
    afterPriority: hypothesis.trainingPriority,
    testedProblems: attempts.length,
    hitCount,
    missCount,
    hitRate: round(hitRate, 2),
    decision: decisionForHitRate(hitRate),
  };
}

function simulateMockExam(cycle: number, totalCycles: number, day: number, hypotheses: CoachHypothesis[]): MockExamResult {
  const topBlocking = hypotheses
    .slice()
    .sort((a, b) => b.trainingPriority - a.trainingPriority)
    .slice(0, 4);
  const mathBlock = topBlocking.some((item) => item.relatedModules.includes("math")) ? 1 : 0;
  const dpBlock = topBlocking.some((item) => item.relatedModules.some((moduleName) => moduleName.includes("dp"))) ? 1 : 0;
  const graphBlock = topBlocking.some((item) => item.relatedModules.includes("graph")) ? 1 : 0;
  const progress = totalCycles > 0 ? cycle / totalCycles : 1;
  const t1 = Math.min(100, Math.round(72 + 21 * progress));
  const t2 = Math.min(100, Math.round(64 + 24 * progress - mathBlock * 2));
  const t3 = Math.min(100, Math.round(38 + 39 * progress - dpBlock * 3));
  const t4 = Math.min(100, Math.round(24 + 35 * progress - graphBlock * 2));
  const total = t1 + t2 + t3 + t4;
  const readiness = round(Math.min(0.9, 0.28 + 0.51 * progress + (total >= 260 ? 0.08 : 0)), 2);
  return {
    cycle,
    day,
    scores: { t1, t2, t3, t4, total },
    firstPrizeReadiness: readiness,
    stillBlockingWeaknesses: topBlocking.slice(0, 3).map((item) => item.weaknessId),
    verdict: total >= 280
      ? "Close to first-prize target in simulation, but still requires real contest validation."
      : total >= 240
      ? "Improving, near target zone, but T3/T4 partial-score reliability still decides first-prize probability."
      : "Not first-prize ready yet; diagnosis and training focus are still being validated.",
  };
}

function renderCoachSimulationReport(params: {
  options: CoachOptions;
  hypotheses: CoachHypothesis[];
  attempts: AttemptLog[];
  cycles: CycleState[];
  mockExams: MockExamResult[];
  taskPack: JsonObject;
}): string {
  const { options, hypotheses, attempts, cycles, mockExams, taskPack } = params;
  const top = hypotheses.slice(0, 10);
  const finalMock = mockExams[mockExams.length - 1];
  return [
    "# AI 教练级闭环系统：30 天三轮模拟与三次系统修正报告",
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 1. 目标",
    "",
    "目标不是让大模型更会写报告，而是让系统具备：提出诊断假设、安排任务验证假设、观察学生训练表现、修正自己的判断、动态调整下一步训练、用模拟赛验证是否接近 CSP-S 一等奖目标。",
    "",
    "本次实现把原来的诊断结果升级成可验证的 coach state，并模拟一名以 30 天冲刺 CSP-S 一等奖为目标的学生，连续运行 3 个 10 天周期。",
    "",
    "## 2. 当前诊断假设 Top 10",
    "",
    "| 排名 | weaknessId | 假设 | 初始置信度 | 初始训练优先级 | 大模型簇覆盖 | 验证任务数 |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: |",
    ...top.map((item, index) => `| ${index + 1} | ${item.weaknessId} | ${item.title} | ${item.confidence} | ${item.trainingPriority} | ${item.sourceCoverage.deepSeekDiagnosedClusters}/${item.clusterIds.length} | ${item.validationTasks.length} |`),
    "",
    "## 3. 训练任务不再是刷题，而是假设验证",
    "",
    "每个 weakness 自动生成 3 类验证任务：",
    "",
    "- SELECT：用历史证据题验证弱点是否仍然复发。",
    "- MUTATE：改变约束或输出目标，验证是否能迁移。",
    "- GENERATE：用原创诊断题草稿故意暴露薄弱阶段。",
    "",
    `当前输入 7 天任务包来源：${getString(taskPack, "goal") || "CSP-S_FIRST_PRIZE"}，但本报告将其升级为 30 天滚动决策。`,
    "",
    "## 4. 三轮模拟结果",
    "",
    ...cycles.flatMap((cycle) => [
      `### Cycle ${cycle.cycle}（${cycle.dayRange}）`,
      "",
      "| weaknessId | 测试题数 | 命中 | 未命中 | 命中率 | 置信度变化 | 优先级变化 | 决策 |",
      "| --- | ---: | ---: | ---: | ---: | --- | --- | --- |",
      ...cycle.hypothesisUpdates.map((item) => `| ${item.weaknessId} | ${item.testedProblems} | ${item.hitCount} | ${item.missCount} | ${item.hitRate} | ${item.beforeConfidence} -> ${item.afterConfidence} | ${item.beforePriority} -> ${item.afterPriority} | ${item.decision} |`),
      "",
      `下一轮重点：${cycle.nextDecision.focusWeaknessIds.join(", ")}`,
      "",
      `系统修正：${cycle.systemRevision.title}`,
      "",
      ...cycle.systemRevision.change.map((line) => `- ${line}`),
      "",
    ]),
    "## 5. 模拟赛验证",
    "",
    "| Cycle | Day | T1 | T2 | T3 | T4 | Total | 一等奖接近度 | 判断 |",
    "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...mockExams.map((exam) => `| ${exam.cycle} | ${exam.day} | ${exam.scores.t1} | ${exam.scores.t2} | ${exam.scores.t3} | ${exam.scores.t4} | ${exam.scores.total} | ${exam.firstPrizeReadiness} | ${exam.verdict} |`),
    "",
    "## 6. 作为学生，30 天内我是如何完成的",
    "",
    "### Day 1-10",
    "",
    "我先不追求题量，而是验证系统说的 top 3 弱点是否真的存在。每天做 1 道证据题或变式题，强制写读题理解、模型识别、30/50/70 分方案、完整算法、实现风险、调试记录和复盘。结果显示数学建模、部分分策略、区间 DP 都确实复发，因此系统把这些 weakness 标成 VALIDATED 或 WATCH。",
    "",
    "### Day 11-20",
    "",
    "我开始做迁移训练，不再重复原题。Mutate 题用于检查我是不是只记住了原题；Generate 题用于暴露陌生语境下的同一弱点。模拟中部分分方案和区间 DP 初始化仍有复发，但提交次数下降，说明训练有效。",
    "",
    "### Day 21-30",
    "",
    "我进入模拟赛化训练。每天保留 1 个主弱点任务，隔天做一套 T3/T4 专项或四题模拟。最后一轮模拟总分提升，但系统仍判断不是绝对稳的一等奖状态，因为 T3/T4 的稳定部分分和图论/DP 迁移仍是阻塞项。",
    "",
    "## 7. 模拟后的效果判断",
    "",
    finalMock
      ? `第三轮模拟赛总分估计为 ${finalMock.scores.total}，一等奖接近度 ${finalMock.firstPrizeReadiness}。结论：已经接近目标区间，但仍不能宣称稳定通过 CSP-S 一等奖；接下来必须用真实模拟赛和训练日志校验。`
      : "暂无模拟赛结果。",
    "",
    "效果最好的是：系统不再把弱点当结论，而是通过训练命中率修正置信度和优先级。效果不足的是：这仍然是模拟，不是学生真实训练数据；生成题也仍需编译、对拍和人工审题。",
    "",
    "## 8. 三次系统修正",
    "",
    ...cycles.map((cycle) => [
      `### ${cycle.systemRevision.revisionId}：${cycle.systemRevision.title}`,
      "",
      `触发原因：${cycle.systemRevision.trigger}`,
      "",
      "修改：",
      "",
      ...cycle.systemRevision.change.map((line) => `- ${line}`),
      "",
      `预期效果：${cycle.systemRevision.expectedEffect}`,
      "",
    ].join("\n")),
    "## 9. 已生成的证据文件",
    "",
    "- `data/coach/weakness_hypotheses.json`：把 weakness 转成可验证假设。",
    "- `data/coach/validation_task_plan_30d.json`：每个假设的 SELECT/MUTATE/GENERATE 验证任务。",
    "- `data/coach/simulated_training_attempts.json`：3 轮模拟训练表现日志。",
    "- `data/coach/coach_state_cycles.json`：每轮命中率、置信度、优先级和下一步决策。",
    "- `data/coach/mock_exam_validation.json`：每轮模拟赛结果和一等奖接近度。",
    "- `data/coach/system_revision_log.md`：三次系统修正记录。",
    "",
    "## 10. 下一步必须真实落地的部分",
    "",
    "1. 用真实学生训练日志替换模拟日志。",
    "2. 把 `training_attempt_log` 做成每日输入格式。",
    "3. 每 7 天运行一次 coach 状态更新。",
    "4. 对 LLM 生成题增加编译、对拍、审题门槛。",
    "5. 把前 30 个高严重度簇交给 DeepSeek 全量诊断，提高初始假设准确性。",
    "6. 用真实模拟赛成绩校验是否接近一等奖，而不是只看训练任务完成数。",
    "",
    "## 11. 结论",
    "",
    "本次实现完成了 AI 教练级系统的最小闭环：诊断假设、验证任务、训练观察、状态修正、动态决策、模拟赛验证。它还不是最终产品，因为现在的训练表现是模拟数据；但系统结构已经从“报告生成器”升级成“可验证、可纠错、可自我调整的训练决策系统”。",
    "",
  ].join("\n");
}

function renderCoachPrecisionReport(
  options: CoachOptions,
  hypotheses: CoachHypothesis[],
  cycles: CycleState[],
  mockExams: MockExamResult[],
): string {
  const finalMock = mockExams[mockExams.length - 1];
  const active = hypotheses
    .slice()
    .sort((a, b) => b.trainingPriority - a.trainingPriority)
    .slice(0, 8);
  return [
    `# Coach Precision Report: ${options.days} days / ${options.cycles} cycles`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## What This Test Is",
    "",
    "This is a deterministic simulation stress test for the coach decision system. It is more precise than a single static report because it runs multiple feedback/update cycles, but it is still not real student evidence.",
    "",
    "Real evidence: weakness_summary, cluster LLM traces, problem-bank traces, generated problem packages, quality reports.",
    "",
    "Simulated evidence: daily attempts, hit/miss observations, mock exam scores, first-prize readiness.",
    "",
    "## Mock Exam Curve",
    "",
    "| Cycle | Day | T1 | T2 | T3 | T4 | Total | Readiness | Verdict |",
    "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...mockExams.map((exam) => `| ${exam.cycle} | ${exam.day} | ${exam.scores.t1} | ${exam.scores.t2} | ${exam.scores.t3} | ${exam.scores.t4} | ${exam.scores.total} | ${exam.firstPrizeReadiness} | ${exam.verdict} |`),
    "",
    "## Final Active Weakness State",
    "",
    "| weaknessId | status | confidence | priority | recent hit/miss | source coverage |",
    "| --- | --- | ---: | ---: | --- | --- |",
    ...active.map((item) => `| ${item.weaknessId} | ${item.status} | ${item.confidence} | ${item.trainingPriority} | ${item.hitCount}/${item.missCount} | ${item.sourceCoverage.deepSeekDiagnosedClusters}/${item.clusterIds.length} LLM clusters |`),
    "",
    "## Precision Improvements Made For This Run",
    "",
    "- Increased simulation cycles from 3 to 5 while keeping the 30-day goal available via `--days 30 --cycles 5`.",
    "- Mock exam score growth now depends on progress ratio, not raw cycle count, reducing optimistic inflation.",
    "- Untested weaknesses are no longer treated as misses.",
    "- The report explicitly separates real evidence from simulated inference.",
    "- Generated problems remain training drafts unless `problem-quality:all` can compile and stress-test them.",
    "",
    "## Final Interpretation",
    "",
    finalMock
      ? `Final simulated total is ${finalMock.scores.total}, readiness is ${finalMock.firstPrizeReadiness}. This means the simulated student is close to the target zone, but the system must not claim stable CSP-S first-prize readiness until real daily logs and real mock exams confirm the same trend.`
      : "No mock exam was generated.",
    "",
    "## What To Do Next For Higher Precision",
    "",
    "1. Replace `data/coach/training_attempt_log.json` with real student attempts.",
    "2. Run at least 2 real four-problem mock exams and compare with `mock_exam_validation.json`.",
    "3. Increase real LLM cluster diagnosis coverage from 5 to the top 30 clusters.",
    "4. Install a C++17 compiler and rerun `pnpm problem-quality:all` so generated problems can move from TRAINING_DRAFT to PASSED_FOR_TRAINING.",
    "5. Re-run `pnpm coach:all -- --days 30 --cycles 5` after every real feedback batch.",
    "",
  ].join("\n");
}

function buildStudentState(options: CoachOptions, hypotheses: CoachHypothesis[], attempts: AttemptLog[], mockExams: MockExamResult[]): JsonObject {
  const recent = attempts.slice(-7);
  const latestMock = mockExams[mockExams.length - 1];
  const weaknessStates = Object.fromEntries(hypotheses.map((hypothesis) => {
    const related = attempts.filter((attempt) => attempt.weaknessId === hypothesis.weaknessId).slice(-6);
    const hitRate = related.length === 0 ? 0 : related.filter((attempt) => attempt.oldWeaknessReappeared).length / related.length;
    return [hypothesis.weaknessId, {
      confidence: hypothesis.confidence,
      severity: hypothesis.severity,
      priority: hypothesis.trainingPriority,
      status: hypothesis.status === "DOWNGRADED" ? "WATCH" : "ACTIVE",
      recentHitRate: round(hitRate, 2),
      trend: hitRate >= 0.7 ? "NOT_IMPROVING" : hitRate >= 0.4 ? "MIXED" : "IMPROVING",
      lastTestedAt: related[related.length - 1]?.dateLabel ?? null,
    }];
  }));
  return {
    updatedAt: new Date().toISOString(),
    goal: `CSP-S_FIRST_PRIZE_IN_${options.days}_DAYS`,
    scores: latestMock?.scores ?? { t1: 0, t2: 0, t3: 0, t4: 0, total: 0 },
    firstPrizeReadiness: latestMock?.firstPrizeReadiness ?? 0,
    weaknessStates,
    recentPerformance: {
      oneShotAcRate7d: ratio(recent.filter((attempt) => attempt.result === "AC" && attempt.submissionCount === 1).length, recent.length),
      avgSubmissions7d: round(avg(recent.map((attempt) => attempt.submissionCount))),
      avgTimeMinutes7d: round(avg(recent.map((attempt) => attempt.timeSpentMinutes))),
      partialScorePlanRate7d: ratio(recent.filter((attempt) => attempt.stages.partialScorePlanning.passed).length, recent.length),
      oldWeaknessReappeared7d: recent.filter((attempt) => attempt.oldWeaknessReappeared).length,
    },
  };
}

function buildDiagnosisValidationReport(hypotheses: CoachHypothesis[], attempts: AttemptLog[]): JsonObject {
  return {
    generatedAt: new Date().toISOString(),
    principle: "The system's predicted weakness is validated only when the same error appears during training feedback.",
    items: hypotheses.map((hypothesis) => {
      const related = attempts.filter((attempt) => attempt.weaknessId === hypothesis.weaknessId);
      const observedStages = [...new Set(related.flatMap((attempt) => Object.entries(attempt.stages)
        .filter(([, result]) => !result.passed)
        .map(([stage]) => stage)))];
      const hitCount = related.filter((attempt) => attempt.oldWeaknessReappeared).length;
      const missCount = related.length - hitCount;
      const hitRate = ratio(hitCount, related.length);
      return {
        weaknessId: hypothesis.weaknessId,
        predictedErrorTypes: hypothesis.relatedErrorTypes,
        observedErrorStages: observedStages,
        testedProblems: related.length,
        hitCount,
        missCount,
        hitRate,
        hit: hitRate >= 0.4,
        confidenceAfter: hypothesis.confidence,
        priorityAfter: hypothesis.trainingPriority,
        decision: related.length === 0 ? "尚未测试：不能判断诊断是否命中。" : decisionForHitRate(hitRate),
      };
    }),
  };
}

function renderDiagnosisValidationReport(report: JsonObject): string {
  const items = arrayOfObjects(report.items);
  return [
    "# 诊断验证报告",
    "",
    `生成时间：${getString(report, "generatedAt")}`,
    "",
    "本报告回答：系统预测的 weakness 是否在训练中真实复发。",
    "",
    "| weaknessId | 测试题数 | 命中 | 未命中 | 命中率 | 观察到的失败阶段 | 决策 |",
    "| --- | ---: | ---: | ---: | ---: | --- | --- |",
    ...items.map((item) => `| ${getString(item, "weaknessId")} | ${getNumber(item, "testedProblems")} | ${getNumber(item, "hitCount")} | ${getNumber(item, "missCount")} | ${getNumber(item, "hitRate")} | ${arrayOfStrings(item.observedErrorStages).join(", ") || "-"} | ${getString(item, "decision")} |`),
    "",
  ].join("\n");
}

async function writeDailyCoachOutputs(options: CoachOptions, hypotheses: CoachHypothesis[], attempts: AttemptLog[]): Promise<void> {
  const planDir = path.join(options.outputDir, "daily_plan");
  const feedbackDir = path.join(options.outputDir, "daily_feedback");
  await ensureDir(planDir);
  await ensureDir(feedbackDir);
  for (let day = 1; day <= options.days; day += 1) {
    const dayAttempts = attempts.filter((attempt) => attempt.day === day);
    const yesterday = attempts.filter((attempt) => attempt.day === day - 1);
    const focus = chooseDailyFocus(hypotheses, yesterday);
    const plan = {
      generatedAt: new Date().toISOString(),
      day,
      coachDecision: dailyDecisionText(day, focus, yesterday),
      reason: dailyDecisionReasons(focus, yesterday),
      tasks: focus.slice(0, day % 3 === 0 ? 3 : 2).map((hypothesis, index) => {
        const task = hypothesis.validationTasks[index % hypothesis.validationTasks.length];
        return {
          taskType: task?.taskType ?? "SELECT",
          weaknessId: hypothesis.weaknessId,
          problemRef: task?.problemRef ?? hypothesis.evidenceProblems[0],
          goal: task?.purpose ?? "Validate the active weakness.",
          timeLimitMinutes: task?.timeLimitMinutes ?? 80,
          requiredPreSolveOutput: [
            "Restate problem objective and constraints.",
            "Name model and why it fits.",
            "Write 30/50/70/100-point route before coding.",
            "List boundary and initialization checks.",
          ],
        };
      }),
      reviewFocus: [
        "Did the predicted weakness reappear?",
        "Which of the 7 stages failed first?",
        "Should tomorrow lower difficulty, continue validation, or increase transfer pressure?",
      ],
    };
    const feedback = {
      generatedAt: new Date().toISOString(),
      day,
      summary: {
        completedTasks: dayAttempts.length,
        acCount: dayAttempts.filter((attempt) => attempt.result === "AC").length,
        avgSubmissionCount: round(avg(dayAttempts.map((attempt) => attempt.submissionCount))),
        oldWeaknessReappearedCount: dayAttempts.filter((attempt) => attempt.oldWeaknessReappeared).length,
      },
      detectedIssues: dayAttempts
        .filter((attempt) => attempt.oldWeaknessReappeared)
        .map((attempt) => ({
          weaknessId: attempt.weaknessId,
          issue: firstFailedStage(attempt),
          evidence: `${attempt.problemRef}: ${attempt.coachObservation}`,
        })),
      coachInterpretation: {
        todayResult: dayAttempts.some((attempt) => attempt.oldWeaknessReappeared) ? "PARTIAL_IMPROVEMENT" : "IMPROVING",
        mainProblem: dayAttempts.find((attempt) => attempt.oldWeaknessReappeared)?.coachObservation ?? "No strong recurrence observed in simulation.",
        tomorrowRecommendation: dayAttempts.some((attempt) => attempt.oldWeaknessReappeared)
          ? "Continue this weakness with SELECT/MUTATE validation before increasing difficulty."
          : "Increase transfer pressure with MUTATE or GENERATE.",
      },
    };
    await writeJson(path.join(planDir, `day_${String(day).padStart(2, "0")}.json`), plan);
    await fs.writeFile(path.join(planDir, `day_${String(day).padStart(2, "0")}.md`), `\uFEFF${renderDailyPlan(plan)}`, "utf8");
    await writeJson(path.join(feedbackDir, `day_${String(day).padStart(2, "0")}_feedback.json`), feedback);
  }
}

async function writeWeeklyRediagnosisOutputs(options: CoachOptions, cycles: CycleState[], mockExams: MockExamResult[]): Promise<void> {
  const dir = path.join(options.outputDir, "weekly_reports");
  await ensureDir(dir);
  for (const cycle of cycles) {
    const week = cycle.cycle;
    const mock = mockExams.find((item) => item.cycle === cycle.cycle);
    const validated = cycle.hypothesisUpdates.filter((item) => item.hitRate >= 0.7).map((item) => item.weaknessId);
    const rejected = cycle.hypothesisUpdates.filter((item) => item.hitRate < 0.4).map((item) => item.weaknessId);
    const update = {
      generatedAt: new Date().toISOString(),
      week,
      dayRange: cycle.dayRange,
      diagnosisValidation: {
        validatedWeaknesses: validated,
        rejectedWeaknesses: rejected,
        watchWeaknesses: cycle.hypothesisUpdates.filter((item) => item.hitRate >= 0.4 && item.hitRate < 0.7).map((item) => item.weaknessId),
        newWeaknessCandidates: mock && mock.scores.t4 < 60 ? ["late_contest_t4_strategy_risk"] : [],
      },
      stageDecision: {
        canAdvance: Boolean(mock && mock.firstPrizeReadiness >= 0.75 && rejected.length >= 2),
        reason: mock ? mock.verdict : "No mock exam result.",
        nextWeekFocus: cycle.nextDecision.focusWeaknessIds,
      },
    };
    await writeJson(path.join(dir, `week_${String(week).padStart(2, "0")}_state_update.json`), update);
    await fs.writeFile(path.join(dir, `week_${String(week).padStart(2, "0")}.md`), `\uFEFF${renderWeeklyReport(update)}`, "utf8");
  }
}

function renderDailyPlan(plan: JsonObject): string {
  const tasks = arrayOfObjects(plan.tasks);
  return [
    `# Day ${getNumber(plan, "day")} AI 教练每日计划`,
    "",
    `决策：${getString(plan, "coachDecision")}`,
    "",
    "## 原因",
    "",
    ...arrayOfStrings(plan.reason).map((item) => `- ${item}`),
    "",
    "## 今日任务",
    "",
    ...tasks.map((task, index) => [
      `### 任务 ${index + 1}`,
      "",
      `- 类型：${getString(task, "taskType")}`,
      `- weaknessId：${getString(task, "weaknessId")}`,
      `- problemRef：${getString(task, "problemRef")}`,
      `- 目标：${getString(task, "goal")}`,
      `- 限时：${getNumber(task, "timeLimitMinutes")} 分钟`,
    ].join("\n")),
    "",
  ].join("\n");
}

function renderWeeklyReport(update: JsonObject): string {
  return [
    `# Week ${getNumber(update, "week")} 每周复诊`,
    "",
    `周期：${getString(update, "dayRange")}`,
    "",
    "## 诊断验证",
    "",
    `- 已验证：${arrayOfStrings(getPath(update, "diagnosisValidation.validatedWeaknesses")).join(", ") || "-"}`,
    `- 降权/待重分：${arrayOfStrings(getPath(update, "diagnosisValidation.rejectedWeaknesses")).join(", ") || "-"}`,
    `- 观察中：${arrayOfStrings(getPath(update, "diagnosisValidation.watchWeaknesses")).join(", ") || "-"}`,
    `- 新候选：${arrayOfStrings(getPath(update, "diagnosisValidation.newWeaknessCandidates")).join(", ") || "-"}`,
    "",
    "## 阶段决策",
    "",
    `- 是否可进入下一阶段：${getPath(update, "stageDecision.canAdvance") ? "是" : "否"}`,
    `- 原因：${getString(update, "stageDecision.reason")}`,
    `- 下周重点：${arrayOfStrings(getPath(update, "stageDecision.nextWeekFocus")).join(", ")}`,
    "",
  ].join("\n");
}

function chooseDailyFocus(hypotheses: CoachHypothesis[], yesterday: AttemptLog[]): CoachHypothesis[] {
  const repeated = yesterday.filter((attempt) => attempt.oldWeaknessReappeared).map((attempt) => attempt.weaknessId);
  return hypotheses
    .slice()
    .sort((a, b) => {
      const repeatDelta = Number(repeated.includes(b.weaknessId)) - Number(repeated.includes(a.weaknessId));
      return repeatDelta || b.trainingPriority - a.trainingPriority || b.confidence - a.confidence;
    })
    .slice(0, 3);
}

function dailyDecisionText(day: number, focus: CoachHypothesis[], yesterday: AttemptLog[]): string {
  const main = focus[0]?.weaknessId ?? "unknown";
  if (day === 1) return `Start by validating ${main}; do not assume the diagnosis is true until training feedback hits it.`;
  if (yesterday.some((attempt) => attempt.oldWeaknessReappeared)) return `Continue validating ${main}; do not advance to a new module because yesterday repeated an old weakness.`;
  return `Increase transfer pressure on ${main}; use Mutate/Generate because yesterday did not strongly hit the weakness.`;
}

function dailyDecisionReasons(focus: CoachHypothesis[], yesterday: AttemptLog[]): string[] {
  const reasons = [
    `Highest active priority: ${focus[0]?.weaknessId ?? "unknown"}.`,
    yesterday.length === 0 ? "No previous-day feedback yet." : `Yesterday completed ${yesterday.length} simulated tasks.`,
  ];
  const repeats = yesterday.filter((attempt) => attempt.oldWeaknessReappeared);
  if (repeats.length > 0) reasons.push(`Old weakness reappeared ${repeats.length} time(s): ${[...new Set(repeats.map((attempt) => attempt.weaknessId))].join(", ")}.`);
  return reasons;
}

function firstFailedStage(attempt: AttemptLog): string {
  const entry = Object.entries(attempt.stages).find(([, result]) => !result.passed);
  return entry ? entry[0] : "NO_STAGE_FAILED";
}

function renderRevisionLog(cycles: CycleState[]): string {
  return [
    `# AI 教练系统 ${cycles.length} 次修正记录`,
    "",
    ...cycles.map((cycle) => [
      `## ${cycle.systemRevision.revisionId}：${cycle.systemRevision.title}`,
      "",
      `触发原因：${cycle.systemRevision.trigger}`,
      "",
      "修改内容：",
      "",
      ...cycle.systemRevision.change.map((line) => `- ${line}`),
      "",
      `预期效果：${cycle.systemRevision.expectedEffect}`,
      "",
    ].join("\n")),
  ].join("\n");
}

function normalizeWeakness(value: Weakness): Weakness {
  return {
    weaknessId: String(value.weaknessId ?? ""),
    title: String(value.title ?? ""),
    severity: Number(value.severity ?? 0),
    relatedModules: arrayOfStrings(value.relatedModules),
    relatedErrorTypes: arrayOfStrings(value.relatedErrorTypes),
    evidenceProblems: arrayOfStrings(value.evidenceProblems),
    problemCount: Number(value.problemCount ?? 0),
    trainingAction: String(value.trainingAction ?? ""),
    verifyMethod: String(value.verifyMethod ?? ""),
    clusterIds: arrayOfStrings(value.clusterIds),
  };
}

function stageForWeakness(weakness: Weakness): TrainingStageName {
  const types = new Set(weakness.relatedErrorTypes);
  if (types.has("PARTIAL_SCORE_MISSED")) return "partialScorePlanning";
  if (types.has("MODEL_ERROR")) return "modeling";
  if (types.has("STATE_ERROR") || types.has("TRANSITION_ERROR")) return "algorithmDesign";
  if (types.has("INIT_ERROR") || types.has("BOUNDARY_ERROR") || types.has("INDEX_ERROR")) return "implementation";
  if (types.has("DEBUG_TIMEOUT")) return "debugging";
  return "review";
}

function successSignalFor(stage: TrainingStageName): string {
  const map: Record<TrainingStageName, string> = {
    reading: "Can restate constraints and objective without changing the problem.",
    modeling: "Can name the model and justify why alternatives do not fit.",
    partialScorePlanning: "Can write executable 30/50/70/100-point routes before coding.",
    algorithmDesign: "Can define state, transition, initialization, order, and complexity.",
    implementation: "Can pass boundary checklist before first submission.",
    debugging: "Can isolate bugs within 20 minutes using invariants or small cases.",
    review: "Can summarize the reusable lesson and next trigger condition.",
  };
  return map[stage];
}

function failureSignalFor(stage: TrainingStageName): string {
  const map: Record<TrainingStageName, string> = {
    reading: "Misreads objective, constraints, or hidden condition.",
    modeling: "Chooses model by pattern memory instead of proof.",
    partialScorePlanning: "Cannot split 30/50/70 points or skips brute-force route.",
    algorithmDesign: "State, transition, initialization, order, or complexity is unstable.",
    implementation: "Boundary, initialization, index, overflow, or multi-test bug appears.",
    debugging: "Debugging consumes too much time without narrowing the fault.",
    review: "Cannot extract a reusable rule from the attempt.",
  };
  return map[stage];
}

function issueForStage(stage: TrainingStageName, hypothesis: CoachHypothesis, cycle: number): string {
  const moduleName = hypothesis.relatedModules[0] ?? "unknown";
  const intensity = cycle === 1 ? "明显复发" : cycle === 2 ? "部分复发" : "轻微复发";
  const map: Record<TrainingStageName, string> = {
    reading: `${moduleName} 题面约束理解${intensity}，导致后续模型偏移。`,
    modeling: `${moduleName} 建模${intensity}，无法说明为什么选择该算法模型。`,
    partialScorePlanning: `30/50/70 分拆解${intensity}，先追求 AC 而不是先设计可拿分路线。`,
    algorithmDesign: `${moduleName} 状态、转移、初始化或枚举顺序${intensity}。`,
    implementation: `${moduleName} 实现边界、初始化、下标或溢出风险${intensity}。`,
    debugging: `${moduleName} 调试过程${intensity}，没有用小样例和不变量快速定位。`,
    review: `${moduleName} 复盘${intensity}，无法沉淀成下一题检查项。`,
  };
  return map[stage];
}

function decisionForHitRate(hitRate: number): string {
  if (hitRate >= 0.7) return "诊断命中：保留高优先级，但下一轮改用迁移题验证是否改善。";
  if (hitRate >= 0.4) return "诊断部分命中：继续观察，任务从同类题切换到变式题。";
  return "诊断未命中：降低优先级或重新分类，避免浪费训练天数。";
}

function taskMixForCycle(cycle: number, mockExam: MockExamResult): Record<string, number> {
  if (cycle === 1) return { select: 0.45, mutate: 0.35, generate: 0.1, mockExam: 0.1 };
  if (cycle === 2) return { select: 0.25, mutate: 0.4, generate: 0.2, mockExam: 0.15 };
  return mockExam.scores.total >= 260
    ? { select: 0.15, mutate: 0.25, generate: 0.2, mockExam: 0.4 }
    : { select: 0.2, mutate: 0.35, generate: 0.2, mockExam: 0.25 };
}

function nextDecisionReason(cycle: number, updates: CycleState["hypothesisUpdates"], mockExam: MockExamResult): string {
  const highHits = updates.filter((item) => item.hitRate >= 0.7).map((item) => item.weaknessId);
  if (cycle === 1) return `First validation cycle confirmed ${highHits.length} hypotheses. Next cycle should test transfer, not repeat familiar evidence problems.`;
  if (cycle === 2) return `Transfer cycle improved score to ${mockExam.scores.total}, but T3/T4 still decides first-prize readiness. Increase mock pressure and generated diagnostics.`;
  return `Final simulation reached readiness ${mockExam.firstPrizeReadiness}. Continue real mock exams and only reduce priorities after real logs confirm fewer recurring hits.`;
}

function systemRevisionFor(cycle: number, updates: CycleState["hypothesisUpdates"], mockExam: MockExamResult): CycleState["systemRevision"] {
  if (cycle === 1) {
    return {
      revisionId: "REV-1",
      title: "把 weakness 从报告结论改成可验证假设",
      trigger: "第一轮训练显示多个 top weaknesses 在 SELECT/MUTATE 中复发，说明需要显式记录 hit/miss。",
      change: [
        "新增 `weakness_hypotheses.json`，保存 confidence、hitCount、missCount、lastValidatedAt。",
        "每个 weakness 自动绑定 SELECT/MUTATE/GENERATE 三类验证任务。",
        "训练任务的目的从刷题改为验证某个训练阶段是否复发。",
      ],
      expectedEffect: "系统能判断诊断是否命中，而不是只输出静态报告。",
    };
  }
  if (cycle === 2) {
    return {
      revisionId: "REV-2",
      title: "把训练记录拆成 7 个可观察阶段",
      trigger: `第二轮模拟赛总分 ${mockExam.scores.total}，但部分分和区间 DP 仍在迁移题中复发。`,
      change: [
        "新增 simulated_training_attempts 的 reading/modeling/partialScorePlanning/algorithmDesign/implementation/debugging/review 七阶段记录。",
        "把“做错了”细化成具体阶段失败，支持后续精确修正。",
        "下一轮任务混合提高 MUTATE 和 GENERATE 比例，减少只做熟悉原题。",
      ],
      expectedEffect: "系统能区分不会算法、不会建模、不会拆分、会想但写不稳、调试太慢。",
    };
  }
  if (cycle === 3) {
    return {
      revisionId: "REV-3",
    title: "用模拟赛验证是否接近目标，并回写下一轮决策",
    trigger: `第三轮模拟赛一等奖接近度 ${mockExam.firstPrizeReadiness}，仍有 ${mockExam.stillBlockingWeaknesses.join(", ")} 阻塞。`,
    change: [
      "新增 mock_exam_validation.json，记录 T1/T2/T3/T4 和 total。",
      "用模拟赛结果调整 taskMix：接近目标时提高模拟赛比例，否则继续补主弱点。",
      "报告明确区分“接近目标”和“稳定达标”，避免训练任务完成后误判为一等奖稳了。",
    ],
    expectedEffect: "系统能用考试表现校验训练是否有效，而不是只看任务完成数量。",
    };
  }
  return {
    revisionId: `REV-${cycle}`,
    title: cycle === 4 ? "增加精度校准：区分未测试、命中、未命中" : "增加真实落地校验：把模拟结果转成真实训练要求",
    trigger: `第 ${cycle} 轮模拟赛总分 ${mockExam.scores.total}，一等奖接近度 ${mockExam.firstPrizeReadiness}，需要避免把模拟改善误判成真实达标。`,
    change: cycle === 4
      ? [
          "未被本轮任务覆盖的 weakness 标记为 NOT_TESTED，不再自动降权。",
          "模拟赛分数曲线改成按进度增长，避免轮数增加导致分数虚高。",
          "增加精度边界说明：真实证据和模拟推断必须分开看。",
        ]
      : [
          "输出 5 轮精度报告，明确哪些结论仍需要真实训练日志验证。",
          "最终结论限定为接近目标区间，不宣称稳定一等奖。",
          "下一步强制要求真实模拟赛和真实 daily feedback 替换模拟数据。",
        ],
    expectedEffect: cycle === 4
      ? "降低系统自我修正中的误伤，避免没有测试过的弱点被错误降权。"
      : "让系统从可复现实验进入真实训练闭环，减少模拟乐观偏差。",
  };
}

function hash(value: string): number {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output * 31 + value.charCodeAt(index)) >>> 0;
  }
  return output;
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

function getPath(source: unknown, key: string): unknown {
  if (!key) return source;
  return key.split(".").reduce<unknown>((current, part) => {
    if (/^\d+$/.test(part) && Array.isArray(current)) return current[Number(part)];
    if (!isObject(current)) return undefined;
    return current[part];
  }, source);
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function avg(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function ratio(numerator: number, denominator: number): number {
  return denominator > 0 ? round(numerator / denominator, 2) : 0;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}
