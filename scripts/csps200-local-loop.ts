import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { runFullCodeAnalysis } from "./code-analysis-lib";
import { buildCspBenchmarkSystem } from "./csp-benchmark/csp-benchmark-lib";
import { buildDiagnosisSystem } from "./diagnosis/diagnosis-lib";
import { buildProblemEngine } from "./problem-bank/problem-bank-lib";
import {
  buildMockExam,
  buildTargetScoreTrainingSystem,
  buildTrainingSettlement,
  generateDailyTraining,
  recordTrainingLog,
} from "./training/target-score-training-lib";

type JsonObject = Record<string, unknown>;

type LocalLoopConfig = {
  uid: string;
  currentScore?: number;
  targetScore: number;
  targetYear: number;
  targetProvince: string;
  examDate: string;
  weeklyHours: number;
  dailyProblemCount: number;
  safetyMargin: number;
  codeDir: string;
  codeIndex: string;
  analysisDir: string;
  diagnosisDir: string;
  benchmarkDir: string;
  problemBankDir: string;
  trainingGoalDir: string;
  learningUnitsDir: string;
  problemLaddersDir: string;
  explanationsDir: string;
  trainingDir: string;
  masteryDir: string;
  mockExamDir: string;
  generatedProblemsDir: string;
  coachDir: string;
  docsDir: string;
};

type LoopState = {
  generatedAt: string;
  action: string;
  targetScore: number;
  files: Record<string, string>;
  nextActions: string[];
  notes: string[];
};

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");
const LOCAL_CONFIG_PATH = path.join(LOCAL_DIR, "config.json");
const LOCAL_STRATEGY_PATH = path.join(ROOT, "data", "config", "csps-200-strategy.json");
const EXAMPLE_CONFIG_PATH = path.join(ROOT, "config", "local-loop.example.json");
const STRATEGY_TEMPLATE_PATH = path.join(ROOT, "config", "csps-200-strategy.json");
const STUDENT_ANALYSIS_PATH = path.join(LOCAL_DIR, "student_analysis_report.json");
const ANALYSIS_QUALITY_PATH = path.join(LOCAL_DIR, "analysis_quality_report.json");

const args = parseArgs(process.argv.slice(2));
const action = args.action ?? "help";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (action === "help") return printHelp();
  if (action === "init") return initLocalLoop();

  const config = await loadConfig();
  applyArgOverrides(config, args);

  if (action === "diagnose") {
    await runDiagnose(config);
    await runStudentAnalysis(config);
    return writeAndPrintState(config, "diagnose", [
      "查看 data/local-loop/student_analysis_report.md",
      "如果 data quality 不是 LOW，再执行 pnpm tsx scripts/csps200-local-loop.ts --action plan",
    ]);
  }

  if (action === "student-analysis") {
    await runStudentAnalysis(config);
    return writeAndPrintState(config, "student-analysis", [
      "查看 data/local-loop/student_analysis_report.md",
      "查看 data/local-loop/analysis_quality_report.json",
    ]);
  }

  if (action === "benchmark") {
    await runBenchmark(config);
    return writeAndPrintState(config, "benchmark", ["pnpm tsx scripts/csps200-local-loop.ts --action student-analysis"]);
  }

  if (action === "plan") {
    const gate = await ensurePlanGate(config, "plan");
    if (!gate.allowed) return writeAndPrintState(config, "plan-blocked", gate.nextActions);
    await runPlan(config);
    await normalizeToday(config);
    return writeAndPrintState(config, "plan", [
      "查看 data/training/daily_training_plan.md",
      "查看 data/local-loop/today.md",
      "做完题后执行 pnpm tsx scripts/csps200-local-loop.ts --action log -- ...",
    ]);
  }

  if (action === "today") {
    const gate = await ensurePlanGate(config, "today");
    if (!gate.allowed) return writeAndPrintState(config, "today-blocked", gate.nextActions);
    await generateDailyTraining(trainingOptions(config));
    await normalizeToday(config);
    return writeAndPrintState(config, "today", [
      "查看 data/local-loop/today.json",
      "查看 data/local-loop/today.md",
      "做完题后执行 pnpm tsx scripts/csps200-local-loop.ts --action log -- --problemPid Pxxxx --unitId UNIT --result AC --score 100 --timeMinutes 35",
    ]);
  }

  if (action === "log") {
    await runLog(config, process.argv.slice(2));
    await normalizeToday(config);
    return writeAndPrintState(config, "log", [
      "继续完成今日剩余题目",
      "今日结束后执行 pnpm tsx scripts/csps200-ai-post-analysis.ts --action daily",
      "或执行 pnpm tsx scripts/csps200-local-loop.ts --action settle",
    ]);
  }

  if (action === "settle") {
    await buildTrainingSettlement(trainingOptions(config));
    return writeAndPrintState(config, "settle", [
      "pnpm tsx scripts/csps200-local-loop.ts --action today",
      "pnpm tsx scripts/csps200-ai-post-analysis.ts --action week --week 1",
    ]);
  }

  if (action === "mock") {
    await buildMockExam(trainingOptions(config));
    return writeAndPrintState(config, "mock", ["填写 data/mock-exam/mock_exam_review.md 中的模拟赛结果"]);
  }

  if (action === "week") {
    await runWeek(config, Number(args.week ?? 1));
    return writeAndPrintState(config, "week", [
      "查看 data/local-loop/week1_report.md",
      "根据 data/local-loop/next_week_plan.json 执行下一周训练",
    ]);
  }

  if (action === "verify") {
    const verification = await verifyLocalLoop(config);
    console.log(JSON.stringify(verification, null, 2));
    return;
  }

  if (action === "all") {
    await initLocalLoop({ quiet: true });
    await runDiagnose(config);
    await runStudentAnalysis(config);
    const gate = await ensurePlanGate(config, "all");
    if (!gate.allowed) return writeAndPrintState(config, "all-blocked", gate.nextActions);
    await runBenchmark(config);
    await runPlan(config);
    await normalizeToday(config);
    return writeAndPrintState(config, "all", [
      "查看 data/local-loop/student_analysis_report.md",
      "查看 data/local-loop/today.json",
      "开始执行第 1 天训练并记录结果",
    ]);
  }

  throw new Error(`Unknown --action ${action}`);
}

async function initLocalLoop(options: { quiet?: boolean } = {}) {
  await ensureDir(LOCAL_DIR);
  await ensureDir(path.dirname(LOCAL_STRATEGY_PATH));
  if (!(await exists(LOCAL_CONFIG_PATH))) {
    await fs.copyFile(EXAMPLE_CONFIG_PATH, LOCAL_CONFIG_PATH);
  }
  if (!(await exists(LOCAL_STRATEGY_PATH))) {
    await fs.copyFile(STRATEGY_TEMPLATE_PATH, LOCAL_STRATEGY_PATH);
  }
  await ensureDir(path.join(ROOT, "data", "analysis"));
  await ensureDir(path.join(ROOT, "data", "diagnosis"));
  await ensureDir(path.join(ROOT, "data", "training"));
  if (!options.quiet) {
    console.log(`initialized local loop config: ${relative(LOCAL_CONFIG_PATH)}`);
    console.log(`initialized strategy config: ${relative(LOCAL_STRATEGY_PATH)}`);
    console.log("Next: edit data/local-loop/config.json, then run pnpm tsx scripts/csps200-local-loop.ts --action diagnose");
  }
}

async function loadConfig(): Promise<LocalLoopConfig> {
  if (!(await exists(LOCAL_CONFIG_PATH))) {
    await initLocalLoop({ quiet: true });
  }
  const raw = await readJson<LocalLoopConfig>(LOCAL_CONFIG_PATH);
  return {
    ...raw,
    currentScore: Number(raw.currentScore ?? 104),
    targetScore: Number(raw.targetScore ?? 200),
    targetYear: Number(raw.targetYear ?? 2026),
    weeklyHours: Number(raw.weeklyHours ?? 20),
    dailyProblemCount: Number(raw.dailyProblemCount ?? 3),
    safetyMargin: Number(raw.safetyMargin ?? 35),
  };
}

function applyArgOverrides(config: LocalLoopConfig, input: Record<string, string>) {
  for (const key of Object.keys(config) as Array<keyof LocalLoopConfig>) {
    if (input[String(key)] === undefined) continue;
    const current = config[key];
    (config as Record<string, unknown>)[key] = typeof current === "number" ? Number(input[String(key)]) : input[String(key)];
  }
}

async function runDiagnose(config: LocalLoopConfig) {
  await mustExist(config.codeDir, "codeDir");
  const codeIndex = (await exists(config.codeIndex)) ? path.resolve(config.codeIndex) : null;
  await runFullCodeAnalysis({
    input: path.resolve(config.codeDir),
    output: path.resolve(config.analysisDir),
    index: codeIndex,
  });
  await buildDiagnosisSystem({
    analysisDir: path.resolve(config.analysisDir),
    diagnosisDir: path.resolve(config.diagnosisDir),
  });
}

async function runStudentAnalysis(config: LocalLoopConfig) {
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const cliArgs = [
    "tsx",
    "scripts/csps200-student-analysis.ts",
    "--currentScore",
    String(config.currentScore ?? 104),
    "--targetScore",
    String(config.targetScore ?? 200),
  ];
  await execFileAsync(pnpm, cliArgs, { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 });
}

async function runBenchmark(config: LocalLoopConfig) {
  await buildCspBenchmarkSystem({
    benchmarkDir: path.resolve(config.benchmarkDir),
    analysisDir: path.resolve(config.analysisDir),
    diagnosisDir: path.resolve(config.diagnosisDir),
    problemBankDir: path.resolve(config.problemBankDir),
    coachDir: path.resolve(config.coachDir),
    docsDir: path.resolve(config.docsDir),
    targetYear: config.targetYear,
    targetProvince: config.targetProvince,
    targetScore: config.targetScore,
    weeklyHours: config.weeklyHours,
    safetyMargin: config.safetyMargin,
  });
}

async function runPlan(config: LocalLoopConfig) {
  await runBenchmark(config);
  await runStudentAnalysis(config);
  await buildProblemEngine({
    analysisDir: path.resolve(config.analysisDir),
    diagnosisDir: path.resolve(config.diagnosisDir),
    problemBankDir: path.resolve(config.problemBankDir),
    generatedProblemsDir: path.resolve(config.generatedProblemsDir),
  });
  await buildTargetScoreTrainingSystem(trainingOptions(config));
}

async function runLog(config: LocalLoopConfig, argv: string[]) {
  const passThrough = stripActionArgs(argv);
  await recordTrainingLog(trainingOptions(config), passThrough);
  await buildTrainingSettlement(trainingOptions(config));
}

function trainingOptions(config: LocalLoopConfig) {
  return {
    targetScore: config.targetScore,
    weeklyHours: config.weeklyHours,
    days: 7,
    benchmarkDir: path.resolve(config.benchmarkDir),
    problemBankDir: path.resolve(config.problemBankDir),
    trainingGoalDir: path.resolve(config.trainingGoalDir),
    learningUnitsDir: path.resolve(config.learningUnitsDir),
    problemLaddersDir: path.resolve(config.problemLaddersDir),
    explanationsDir: path.resolve(config.explanationsDir),
    trainingDir: path.resolve(config.trainingDir),
    masteryDir: path.resolve(config.masteryDir),
    mockExamDir: path.resolve(config.mockExamDir),
  };
}

async function ensurePlanGate(config: LocalLoopConfig, stage: string) {
  if (!(await exists(STUDENT_ANALYSIS_PATH)) || !(await exists(ANALYSIS_QUALITY_PATH))) {
    await runStudentAnalysis(config);
  }
  const quality = await readAnalysisQuality();
  const overall = getString(quality, "dataQuality.overall") || getString(quality, "overall") || "LOW";
  if (overall === "LOW") {
    await writeQualityBlock(config, quality, stage);
    return {
      allowed: false,
      nextActions: [
        "查看 data/local-loop/data_quality_block.md",
        "补齐 codeDir/codeIndex、题目元数据或最近训练数据后重新执行 diagnose",
        "pnpm tsx scripts/csps200-local-loop.ts --action diagnose",
      ],
    };
  }
  return { allowed: true, nextActions: [] as string[] };
}

async function writeQualityBlock(config: LocalLoopConfig, quality: JsonObject, stage: string) {
  const student = await readJsonIfExists<JsonObject>(STUDENT_ANALYSIS_PATH, {});
  const sourceQuality = asRecord(student.sourceQuality);
  const block = {
    generatedAt: new Date().toISOString(),
    blockedAction: stage,
    reason: "analysis quality is LOW",
    dataQuality: quality.dataQuality ?? sourceQuality,
    requiredFixes: buildDataFixes(sourceQuality, quality),
    nextCommand: "pnpm tsx scripts/csps200-local-loop.ts --action diagnose",
  };
  await writeJson(path.join(LOCAL_DIR, "data_quality_block.json"), block);
  await fs.writeFile(path.join(LOCAL_DIR, "data_quality_block.md"), renderQualityBlockMarkdown(block), "utf8");
}

function buildDataFixes(sourceQuality: JsonObject, quality: JsonObject) {
  const fixes = [
    "确认 data/local-loop/config.json 里的 codeDir 指向真实源码目录。",
    "确认 codeIndex 指向 code_files_index.json，保证 problemPid/result/submitTime 能对齐。",
    "重新执行 luogu:crawl-code 获取更多源码。",
    "重新执行 diagnose 生成 submission_manifest、code_static_metrics、problem_code_timeline、problem_feature_vectors。",
  ];
  if (getNumber(sourceQuality, "problemMetadataCoverage") < 0.65) fixes.push("补齐题目标签、难度、CSP 题位、知识点映射，否则 T1/T2/T3/T4 判断只能启发式估计。 ");
  if (getNumber(sourceQuality, "codeCoverage") < 0.7) fixes.push("源码覆盖不足，建议重新抓取或导入缺失提交源码。 ");
  if (getNumber(sourceQuality, "recentActivityCoverage") < 0.5) fixes.push("最近训练数据不足，建议补充近期训练记录后再生成正式计划。 ");
  const passCriteria = arrayOfObjects(quality.passCriteria).filter((item) => item.passed === false).map((item) => getString(item, "criterion"));
  return [...fixes, ...passCriteria.map((item) => `未通过检查：${item}`)];
}

function renderQualityBlockMarkdown(block: JsonObject) {
  return [
    "# 数据质量不足，已阻断正式训练计划",
    "",
    `阻断动作：${getString(block, "blockedAction")}`,
    `原因：${getString(block, "reason")}`,
    "",
    "## 需要补齐",
    "",
    ...asArray(block.requiredFixes).map((item) => `- ${String(item)}`),
    "",
    "## 下一步",
    "",
    "```bash",
    getString(block, "nextCommand"),
    "```",
    "",
  ].join("\n");
}

async function normalizeToday(config: LocalLoopConfig) {
  await ensureDir(LOCAL_DIR);
  const dailyPath = path.join(config.trainingDir, "daily_training_plan.json");
  if (!(await exists(dailyPath))) return;
  const daily = await readJson<JsonObject>(dailyPath);
  const strategy = await readJsonIfExists<JsonObject>(LOCAL_STRATEGY_PATH, {});
  const student = await readJsonIfExists<JsonObject>(STUDENT_ANALYSIS_PATH, {});
  const quality = await readAnalysisQuality();
  const rawTasks = arrayOfObjects(daily.tasks);
  const problemTasks = rawTasks.filter((task) => {
    const type = getString(task, "type");
    return type !== "CONCEPT_EXPLANATION" && type !== "REVIEW";
  });
  const normalizedTasks = pickTasksWithAnalysis(problemTasks, student).map((task, index) => ({
    order: index + 1,
    role: index === 0 ? "foundation" : index === 1 ? "weakness" : "reviewOrTransfer",
    problemPid: getString(task, "problemPid") || null,
    problemId: getString(task, "problemId") || null,
    type: getString(task, "type") || "PRACTICE_STANDARD",
    durationMinutes: getNumber(task, "durationMinutes"),
    goal: getString(task, "goal"),
    passSignal: getString(task, "passSignal"),
    source: getString(task, "source") || "training_ladder",
    logCommandTemplate: buildLogTemplate(task),
  }));
  const analysisDriven = buildAnalysisDrivenContext(student, quality);
  const today = {
    generatedAt: new Date().toISOString(),
    date: getString(daily, "date") || new Date().toISOString().slice(0, 10),
    targetScore: config.targetScore,
    dataQuality: getString(quality, "dataQuality.overall") || getString(student, "sourceQuality.overall") || "UNKNOWN",
    analysisDriven,
    strategy: {
      slotTarget: strategy.slotTarget,
      dailyMix: strategy.dailyMix,
      principle: strategy.principle,
    },
    sourceDailyPlan: relative(dailyPath),
    sourceStudentAnalysis: (await exists(STUDENT_ANALYSIS_PATH)) ? relative(STUDENT_ANALYSIS_PATH) : null,
    todayGoal: buildTodayGoalFromAnalysis(daily, student),
    whyToday: buildWhyToday(daily, student),
    tasks: normalizedTasks,
    passCriteria: asArray(daily.passCriteria),
    scoreRouteReminder: asArray(daily.scoreRouteReminder),
    recordSchema: asArray(strategy.logFields),
    noPreSolveHintPolicy: {
      enabled: true,
      rule: "做题前不提示算法名、模型名、关键转化、状态定义或具体数据结构；AI 只做做题后证据分析。",
    },
  };
  await writeJson(path.join(LOCAL_DIR, "today.json"), today);
  await fs.writeFile(path.join(LOCAL_DIR, "today.md"), renderTodayMarkdown(today), "utf8");
}

function pickTasksWithAnalysis(tasks: JsonObject[], student: JsonObject) {
  const output = pickThreeTasks(tasks);
  const weak = arrayOfObjects(student.knowledgeMastery).filter((item) => getNumber(item, "score") < 65);
  const evidence = arrayOfObjects(student.evidenceProblems);
  const stage = asRecord(student.currentStage);
  if (output[0]) {
    output[0] = {
      ...output[0],
      source: "student_analysis_report + training_ladder",
      goal: `T1 保分/稳定性训练。当前阶段：${getString(stage, "stage") || "未知"}。${getString(output[0], "goal")}`,
    };
  }
  if (output[1]) {
    const target = weak[0];
    output[1] = {
      ...output[1],
      source: "student_analysis_report + training_ladder",
      goal: target ? `当前最大短板：${getString(target, "name")}（${getNumber(target, "score")}分）。${getString(output[1], "goal")}` : getString(output[1], "goal"),
    };
  }
  if (output[2]) {
    const evidenceProblem = evidence[0];
    if (evidenceProblem) {
      output[2] = {
        ...output[2],
        source: "student_analysis_report.evidenceProblems",
        problemPid: getString(evidenceProblem, "problemPid") || getString(output[2], "problemPid"),
        title: getString(evidenceProblem, "title") || getString(output[2], "title"),
        goal: `复盘/迁移证据题：${getString(evidenceProblem, "problemPid")}。原因：${getString(evidenceProblem, "diagnosis") || getString(evidenceProblem, "reason")}`,
        passSignal: "不看题解独立完成或能清楚记录卡点阶段，否则继续保留为重做题。",
      };
    }
  }
  return output;
}

function pickThreeTasks(tasks: JsonObject[]) {
  if (tasks.length >= 3) return tasks.slice(0, 3);
  const output = [...tasks];
  while (output.length < 3) {
    output.push({
      type: output.length === 0 ? "PRACTICE_BASIC" : output.length === 1 ? "PRACTICE_STANDARD" : "REVIEW_REDO",
      goal: output.length === 2 ? "根据 student_analysis_report 的 evidenceProblems 选择重做/迁移题。" : "从 problem_ladders 中人工选择一题补齐。",
      durationMinutes: output.length === 2 ? 45 : 35,
      source: "fallback",
    });
  }
  return output;
}

function buildAnalysisDrivenContext(student: JsonObject, quality: JsonObject) {
  return {
    dataQuality: getString(quality, "dataQuality.overall") || getString(student, "sourceQuality.overall") || "UNKNOWN",
    currentStage: student.currentStage ?? null,
    slotReadiness: student.slotReadiness ?? null,
    weakestKnowledge: arrayOfObjects(student.knowledgeMastery).filter((item) => getNumber(item, "score") < 65).slice(0, 5),
    evidenceProblems: arrayOfObjects(student.evidenceProblems).slice(0, 5),
    blockingIssues: asArray(asRecord(student.currentStage).blockingIssues),
  };
}

function buildTodayGoalFromAnalysis(daily: JsonObject, student: JsonObject) {
  const stage = asRecord(student.currentStage);
  const weak = arrayOfObjects(student.knowledgeMastery).find((item) => getNumber(item, "score") < 65);
  if (getString(stage, "stage") || weak) {
    return `当前阶段 ${getString(stage, "stage") || "未知"}：${getString(stage, "mainGoal") || "按最大短板训练"}。今日优先覆盖：${getString(weak, "name") || "保分题 + 短板题 + 复盘/迁移题"}`;
  }
  return getString(daily, "todayGoal") || "按照当前最高风险单元训练。";
}

function buildWhyToday(daily: JsonObject, student: JsonObject) {
  const reasons = [...asArray(daily.whyToday).map(String)];
  const stage = asRecord(student.currentStage);
  if (getString(stage, "mainGoal")) reasons.unshift(`来自 student_analysis_report：${getString(stage, "mainGoal")}`);
  for (const issue of asArray(stage.blockingIssues).slice(0, 3)) reasons.push(`阻塞问题：${String(issue)}`);
  return reasons;
}

function buildLogTemplate(task: JsonObject) {
  const pid = getString(task, "problemPid") || "Pxxxx";
  return `pnpm tsx scripts/csps200-local-loop.ts --action log -- --problemPid ${pid} --unitId UNKNOWN_UNIT --taskType ${getString(task, "type") || "PRACTICE_STANDARD"} --result AC --score 100 --timeMinutes 35 --submissionCount 1 --hintLevelUsed 0 --hasSeenSolution false --errorTypes ""`;
}

async function runWeek(config: LocalLoopConfig, week: number) {
  await ensureDir(LOCAL_DIR);
  const logPath = path.join(config.trainingDir, "training_log.json");
  const masteryPath = path.join(config.masteryDir, "ability_mastery.json");
  const settlementPath = path.join(config.trainingDir, "training_settlement.json");
  const strategy = await readJsonIfExists<JsonObject>(LOCAL_STRATEGY_PATH, {});
  const student = await readJsonIfExists<JsonObject>(STUDENT_ANALYSIS_PATH, {});
  const log = await readJsonIfExists<{ items?: JsonObject[] }>(logPath, { items: [] });
  const mastery = await readJsonIfExists<{ items?: JsonObject[] }>(masteryPath, { items: [] });
  const settlement = await readJsonIfExists<JsonObject>(settlementPath, {});
  const entries = log.items ?? [];
  const weekEntries = entries.filter((item) => Boolean(getString(item, "date")));
  const summary = summarizeTrainingEntries(weekEntries);
  const weakMastery = arrayOfObjects(mastery.items)
    .filter((item) => !["PASSED_TRANSFER", "CONTEST_READY"].includes(getString(item, "status")))
    .slice(0, 8);
  const nextWeekPlan = buildNextWeekPlan(summary, weakMastery, strategy, student);
  const report = {
    generatedAt: new Date().toISOString(),
    week,
    targetScore: config.targetScore,
    studentAnalysis: {
      currentStage: student.currentStage ?? null,
      sourceQuality: student.sourceQuality ?? null,
      topWeakness: arrayOfObjects(student.knowledgeMastery).slice(0, 5),
    },
    summary,
    weakMastery,
    latestSettlement: settlement,
    nextWeekPlan,
  };
  await writeJson(path.join(LOCAL_DIR, `week${week}_report.json`), report);
  await writeJson(path.join(LOCAL_DIR, "next_week_plan.json"), nextWeekPlan);
  await fs.writeFile(path.join(LOCAL_DIR, `week${week}_report.md`), renderWeekMarkdown(report), "utf8");
}

function summarizeTrainingEntries(entries: JsonObject[]) {
  const resultCounts = countBy(entries, (item) => getString(item, "result") || "UNKNOWN");
  const errorCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const error of asArray(entry.errorTypes)) {
      if (typeof error !== "string" || !error) continue;
      errorCounts[error] = (errorCounts[error] ?? 0) + 1;
    }
  }
  const total = entries.length;
  const hintOrSolution = entries.filter((item) => getNumber(item, "hintLevelUsed") > 0 || Boolean(item.hasSeenSolution)).length;
  const needRedo = entries.filter((item) => Boolean(item.needRedo) || getNumber(item, "score") < 60).length;
  return {
    total,
    resultCounts,
    averageScore: total ? round(entries.reduce((sum, item) => sum + getNumber(item, "score"), 0) / total, 1) : 0,
    averageTimeMinutes: total ? round(entries.reduce((sum, item) => sum + getNumber(item, "timeMinutes"), 0) / total, 1) : 0,
    hintOrSolutionRate: total ? round(hintOrSolution / total, 2) : 0,
    needRedoCount: needRedo,
    errorCounts,
    problems: entries.map((item) => getString(item, "problemPid")).filter(Boolean),
  };
}

function buildNextWeekPlan(summary: JsonObject, weakMastery: JsonObject[], strategy: JsonObject, student: JsonObject) {
  const errorCounts = getRecordNumber(summary, "errorCounts");
  const studentWeak = arrayOfObjects(student.knowledgeMastery).slice(0, 5).map((item) => ({
    code: getString(item, "code"),
    name: getString(item, "name"),
    score: getNumber(item, "score"),
  }));
  const focusModules = weakMastery.map((item) => ({
    unitId: getString(item, "unitId"),
    title: getString(item, "title"),
    status: getString(item, "status"),
  }));
  const adjustments: string[] = [];
  if ((errorCounts.BOUNDARY_ERROR ?? 0) + (errorCounts.INDEX_ERROR ?? 0) >= 2) adjustments.push(getString(strategy.decisionRules, "t1Collapse") || "增加 T1 稳定性训练。 ");
  if ((errorCounts.MODEL_ERROR ?? 0) + (errorCounts.STATE_ERROR ?? 0) >= 2) adjustments.push(getString(strategy.decisionRules, "t2Weak") || "继续 T2 建模训练。 ");
  if ((errorCounts.PARTIAL_SCORE_MISSED ?? 0) >= 1) adjustments.push(getString(strategy.decisionRules, "t3Zero") || "增加部分分拆解训练。 ");
  if (getNumber(summary, "hintOrSolutionRate") >= 0.35) adjustments.push(getString(strategy.decisionRules, "hintHeavy") || "看提示比例偏高，安排重做。 ");
  if (!adjustments.length && studentWeak.length) adjustments.push(`根据 student_analysis_report，下周优先覆盖：${studentWeak.map((item) => item.name).join("、")}`);
  return {
    generatedAt: new Date().toISOString(),
    targetScore: 200,
    dailyMix: strategy.dailyMix,
    studentWeaknessFocus: studentWeak,
    focusModules: focusModules.slice(0, 5),
    evidenceProblems: arrayOfObjects(student.evidenceProblems).slice(0, 8),
    adjustments: adjustments.length ? adjustments : ["保持每日 3 题：保分题、短板题、复盘/迁移题。"],
    weeklyStructure: strategy.weeklyMix,
    nextAction: "pnpm tsx scripts/csps200-local-loop.ts --action today",
  };
}

async function verifyLocalLoop(config: LocalLoopConfig) {
  const files = {
    config: LOCAL_CONFIG_PATH,
    strategy: LOCAL_STRATEGY_PATH,
    studentAnalysis: STUDENT_ANALYSIS_PATH,
    analysisQuality: ANALYSIS_QUALITY_PATH,
    analysisReport: path.join(config.analysisDir, "final_code_analysis_report.md"),
    diagnosis: path.join(config.diagnosisDir, "weakness_summary.json"),
    benchmark: path.join(config.benchmarkDir, "first_prize_gap_report.md"),
    goal: path.join(config.trainingGoalDir, "goal_score_plan.json"),
    today: path.join(LOCAL_DIR, "today.json"),
    trainingLog: path.join(config.trainingDir, "training_log.json"),
    mastery: path.join(config.masteryDir, "ability_mastery.json"),
    settlement: path.join(config.trainingDir, "training_settlement.json"),
    weekReport: path.join(LOCAL_DIR, "week1_report.md"),
  };
  const checks: Record<string, boolean> = {};
  for (const [key, file] of Object.entries(files)) checks[key] = await exists(file);
  const log = await readJsonIfExists<{ items?: JsonObject[] }>(files.trainingLog, { items: [] });
  const quality = await readAnalysisQuality();
  return {
    generatedAt: new Date().toISOString(),
    status: checks.studentAnalysis && checks.today && checks.goal ? "STRUCTURE_READY" : "NEEDS_ANALYSIS_OR_PLAN",
    dataQuality: getString(quality, "dataQuality.overall") || "UNKNOWN",
    closedLoop: [
      { step: "诊断", ready: checks.analysisReport && checks.diagnosis },
      { step: "学生分析", ready: checks.studentAnalysis && checks.analysisQuality },
      { step: "质量门控", ready: getString(quality, "dataQuality.overall") !== "LOW" },
      { step: "200 分目标", ready: checks.strategy && checks.goal },
      { step: "每日任务", ready: checks.today },
      { step: "训练记录", ready: checks.trainingLog && (log.items?.length ?? 0) > 0 },
      { step: "掌握度", ready: checks.mastery },
      { step: "结算", ready: checks.settlement },
      { step: "周复盘", ready: checks.weekReport },
    ],
    files: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, { path: relative(file), exists: checks[key] }])),
    trainingLogCount: log.items?.length ?? 0,
  };
}

async function writeAndPrintState(config: LocalLoopConfig, currentAction: string, nextActions: string[]) {
  const quality = await readAnalysisQuality();
  const state: LoopState = {
    generatedAt: new Date().toISOString(),
    action: currentAction,
    targetScore: config.targetScore,
    files: {
      config: relative(LOCAL_CONFIG_PATH),
      strategy: relative(LOCAL_STRATEGY_PATH),
      studentAnalysis: relative(STUDENT_ANALYSIS_PATH),
      analysisQuality: relative(ANALYSIS_QUALITY_PATH),
      analysis: relative(config.analysisDir),
      diagnosis: relative(config.diagnosisDir),
      benchmark: relative(config.benchmarkDir),
      training: relative(config.trainingDir),
      today: relative(path.join(LOCAL_DIR, "today.json")),
      week: relative(path.join(LOCAL_DIR, "week1_report.md")),
    },
    nextActions,
    notes: [
      `Data quality: ${getString(quality, "dataQuality.overall") || "UNKNOWN"}`,
      "本脚本只使用本地文件，不依赖数据库。",
      "CSP-S 200 分策略固定为 T1 稳、T2 主攻、T3 部分分、T4 策略验证。",
      "训练结果必须记录 hintLevelUsed / hasSeenSolution，否则掌握度会被高估。",
      "做题前不输出算法提示；AI 只做做题后证据分析。",
    ],
  };
  await ensureDir(LOCAL_DIR);
  await writeJson(path.join(LOCAL_DIR, "loop_state.json"), state);
  console.log(JSON.stringify(state, null, 2));
}

function renderTodayMarkdown(today: JsonObject) {
  const tasks = arrayOfObjects(today.tasks);
  const analysis = asRecord(today.analysisDriven);
  return [
    "# CSP-S 200 今日训练",
    "",
    `Date: ${getString(today, "date")}`,
    `Target: ${getString(today, "targetScore")}`,
    `Data quality: ${getString(today, "dataQuality")}`,
    "",
    "## 今日目标",
    "",
    getString(today, "todayGoal") || "按照当前最高风险单元训练。",
    "",
    "## 分析依据",
    "",
    `- 当前阶段：${getString(asRecord(analysis.currentStage), "stage") || "未知"}`,
    `- 阻塞问题：${asArray(analysis.blockingIssues).join("；") || "暂无"}`,
    `- 薄弱知识点：${arrayOfObjects(analysis.weakestKnowledge).map((item) => `${getString(item, "name")}(${getNumber(item, "score")})`).join("、") || "暂无"}`,
    "",
    "## 今日任务",
    "",
    ...tasks.flatMap((task) => [
      `### ${getNumber(task, "order")}. ${getString(task, "role")}`,
      "",
      `- Problem: ${getString(task, "problemPid") || getString(task, "problemId") || "待人工选择"}`,
      `- Source: ${getString(task, "source")}`,
      `- Type: ${getString(task, "type")}`,
      `- Time: ${getNumber(task, "durationMinutes")} min`,
      `- Goal: ${getString(task, "goal")}`,
      `- Pass signal: ${getString(task, "passSignal")}`,
      "",
      "Record command:",
      "```bash",
      getString(task, "logCommandTemplate"),
      "```",
      "",
    ]),
    "## 无剧透训练规则",
    "",
    "- 做题前不提示算法名、模型名、关键转化、状态定义或具体数据结构。",
    "- 前 30 分钟优先独立读题、写暴力、估复杂度、记录卡点。",
    "- 做完后再用 AI 做错因分析和掌握判断。",
    "",
  ].join("\n");
}

function renderWeekMarkdown(report: JsonObject) {
  const summary = asRecord(report.summary);
  const next = asRecord(report.nextWeekPlan);
  const weak = arrayOfObjects(report.weakMastery);
  return [
    `# CSP-S 200 第 ${getNumber(report, "week")} 周复盘`,
    "",
    `Target score: ${getNumber(report, "targetScore")}`,
    "",
    "## 1. 本周完成情况",
    "",
    `- 训练记录数：${getNumber(summary, "total")}`,
    `- 平均得分：${getNumber(summary, "averageScore")}`,
    `- 平均用时：${getNumber(summary, "averageTimeMinutes")} 分钟`,
    `- 看提示/题解比例：${Math.round(getNumber(summary, "hintOrSolutionRate") * 100)}%`,
    `- 需要重做数：${getNumber(summary, "needRedoCount")}`,
    "",
    "## 2. 高频错因",
    "",
    ...Object.entries(getRecordNumber(summary, "errorCounts")).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## 3. 未通过单元",
    "",
    ...(weak.length ? weak.map((item) => `- ${getString(item, "unitId")}: ${getString(item, "status")}`) : ["- 暂无 mastery 数据。"]),
    "",
    "## 4. 下周调整",
    "",
    ...asArray(next.adjustments).map((item) => `- ${String(item)}`),
    "",
  ].join("\n");
}

function printHelp() {
  console.log(`CSP-S 200 local file loop\n\nActions:\n  pnpm tsx scripts/csps200-local-loop.ts --action init\n  pnpm tsx scripts/csps200-local-loop.ts --action diagnose\n  pnpm tsx scripts/csps200-local-loop.ts --action student-analysis\n  pnpm tsx scripts/csps200-local-loop.ts --action benchmark\n  pnpm tsx scripts/csps200-local-loop.ts --action plan\n  pnpm tsx scripts/csps200-local-loop.ts --action today\n  pnpm tsx scripts/csps200-local-loop.ts --action log -- --problemPid Pxxxx --unitId UNIT --result AC --score 100 --timeMinutes 35 --submissionCount 1 --hintLevelUsed 0 --hasSeenSolution false --errorTypes ""\n  pnpm tsx scripts/csps200-local-loop.ts --action settle\n  pnpm tsx scripts/csps200-local-loop.ts --action mock\n  pnpm tsx scripts/csps200-local-loop.ts --action week --week 1\n  pnpm tsx scripts/csps200-local-loop.ts --action verify\n  pnpm tsx scripts/csps200-local-loop.ts --action all\n`);
}

function stripActionArgs(argv: string[]) {
  const output: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--action") {
      index += 1;
      continue;
    }
    if (token.startsWith("--action=")) continue;
    output.push(token);
  }
  return output;
}

function parseArgs(argv: string[]) {
  const output: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
    if (key && value !== undefined) output[key] = value;
  }
  return output;
}

async function readAnalysisQuality() {
  return readJsonIfExists<JsonObject>(ANALYSIS_QUALITY_PATH, {});
}

async function mustExist(filePath: string, label: string) {
  if (!(await exists(filePath))) {
    throw new Error(`${label} not found: ${filePath}. Edit data/local-loop/config.json first.`);
  }
}

async function exists(filePath: string) {
  try {
    await fs.access(path.resolve(filePath));
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir: string) {
  await fs.mkdir(path.resolve(dir), { recursive: true });
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T;
}

async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  if (!(await exists(filePath))) return fallback;
  return readJson<T>(filePath);
}

async function writeJson(filePath: string, value: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return asArray(value).map(asRecord).filter((item) => Object.keys(item).length > 0);
}

function getString(value: unknown, key?: string): string {
  const source = key ? getPath(value, key) : value;
  if (typeof source === "string") return source;
  if (typeof source === "number" || typeof source === "bigint") return String(source);
  return "";
}

function getNumber(value: unknown, key?: string): number {
  const source = key ? getPath(value, key) : value;
  if (typeof source === "number" && Number.isFinite(source)) return source;
  if (typeof source === "string" && source.trim() && Number.isFinite(Number(source))) return Number(source);
  return 0;
}

function getPath(value: unknown, pathText: string): unknown {
  return pathText.split(".").reduce((current, key) => asRecord(current)[key], value);
}

function getRecordNumber(value: unknown, key: string): Record<string, number> {
  const record = asRecord(getPath(value, key));
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, getNumber(v)]));
}

function countBy(items: JsonObject[], keyFn: (item: JsonObject) => string) {
  const output: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    output[key] = (output[key] ?? 0) + 1;
  }
  return output;
}

function round(value: number, digits = 0) {
  const base = 10 ** digits;
  return Math.round(value * base) / base;
}

function relative(filePath: string) {
  return path.relative(ROOT, path.resolve(filePath)) || ".";
}
