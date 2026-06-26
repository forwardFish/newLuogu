import { promises as fs } from "fs";
import path from "path";
import OpenAI from "openai";

type JsonObject = Record<string, unknown>;

type LocalLoopConfig = {
  uid?: string;
  currentScore?: number;
  targetScore?: number;
  weeklyHours?: number;
  dailyProblemCount?: number;
  codeDir?: string;
  codeIndex?: string;
  analysisDir?: string;
  diagnosisDir?: string;
  trainingDir?: string;
  masteryDir?: string;
  mockExamDir?: string;
};

type AttemptAnalysis = {
  generatedAt: string;
  analysisMode: "LOCAL_RULES" | "LLM_ENHANCED";
  problemPid: string;
  taskContext: JsonObject;
  attempt: JsonObject;
  codeEvidence: JsonObject;
  similarHistory: JsonObject[];
  aiDiagnosis: {
    primaryError: string;
    secondaryErrors: string[];
    rootCause: string;
    evidence: string[];
    masteryJudgement: string;
    needRedo: boolean;
    nextAction: string;
    studentFeedback: string;
    parentSummary: string;
    systemUpdate: JsonObject;
  };
  policy: {
    noPreSolveHint: true;
    noFullSolution: true;
    noCodeOutput: true;
  };
};

const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");
const CONFIG_PATH = path.join(LOCAL_DIR, "config.json");
const EXAMPLE_CONFIG_PATH = path.join(ROOT, "config", "local-loop.example.json");
const ATTEMPT_ANALYSIS_DIR = path.join(LOCAL_DIR, "attempt-analysis");

const args = parseArgs(process.argv.slice(2));
const action = args.action ?? "help";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (action === "help") return printHelp();
  const config = await loadConfig();

  if (["attempt", "analyze-attempt"].includes(action)) {
    const analysis = await generateAttemptAnalysis(config, args.problemPid);
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  if (["daily", "parent-day"].includes(action)) {
    const result = await generateDailySummary(config, args.date);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (["week", "parent-week"].includes(action)) {
    const result = await generateParentWeeklyReport(config, Number(args.week ?? 1));
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "all") {
    const analysis = await generateAttemptAnalysis(config, args.problemPid);
    const daily = await generateDailySummary(config, args.date);
    const week = await generateParentWeeklyReport(config, Number(args.week ?? 1));
    console.log(JSON.stringify({ attempt: analysis.problemPid, daily, week }, null, 2));
    return;
  }

  throw new Error(`Unknown --action ${action}`);
}

async function generateAttemptAnalysis(config: LocalLoopConfig, problemPidArg?: string): Promise<AttemptAnalysis> {
  await ensureDir(ATTEMPT_ANALYSIS_DIR);
  const logs = await loadTrainingLogs(config);
  const attempt = pickAttempt(logs, problemPidArg);
  const problemPid = getString(attempt, "problemPid");
  if (!problemPid) throw new Error("No problemPid found in training log. Pass --problemPid or record a training log first.");

  const [today, codeEvidence, similarHistory, diagnosisContext] = await Promise.all([
    readJsonIfExists<JsonObject>(path.join(LOCAL_DIR, "today.json"), {}),
    collectCodeEvidence(config, problemPid),
    collectSimilarHistory(logs, attempt),
    collectDiagnosisContext(config),
  ]);
  const taskContext = findTaskContext(today, problemPid);
  const localDraft = buildLocalAttemptAnalysis({ config, problemPid, taskContext, attempt, codeEvidence, similarHistory, diagnosisContext });
  const enhanced = await maybeEnhanceAttemptAnalysis(localDraft, diagnosisContext);
  const analysis = enforceNoSolutionPolicy(enhanced);
  const fileBase = safeFileName(problemPid);
  await writeJson(path.join(ATTEMPT_ANALYSIS_DIR, `${fileBase}.json`), analysis);
  await fs.writeFile(path.join(ATTEMPT_ANALYSIS_DIR, `${fileBase}.md`), renderAttemptAnalysisMarkdown(analysis), "utf8");
  return analysis;
}

async function generateDailySummary(config: LocalLoopConfig, dateArg?: string) {
  const logs = await loadTrainingLogs(config);
  const date = dateArg || (await inferTodayDate(logs));
  const todayEntries = logs.filter((entry) => getString(entry, "date") === date);
  const analyses = await Promise.all(todayEntries.map((entry) => loadOrGenerateAttemptAnalysis(config, getString(entry, "problemPid"))));
  const summary = summarizeEntries(todayEntries, analyses);
  const result = {
    generatedAt: new Date().toISOString(),
    date,
    targetScore: Number(config.targetScore ?? 200),
    summary,
    attemptAnalyses: analyses.map((item) => ({
      problemPid: item.problemPid,
      primaryError: item.aiDiagnosis.primaryError,
      masteryJudgement: item.aiDiagnosis.masteryJudgement,
      needRedo: item.aiDiagnosis.needRedo,
      parentSummary: item.aiDiagnosis.parentSummary,
    })),
    tomorrowAdjustment: buildTomorrowAdjustment(summary, analyses),
  };
  await writeJson(path.join(LOCAL_DIR, "daily_ai_summary.json"), result);
  await fs.writeFile(path.join(LOCAL_DIR, "daily_ai_summary.md"), renderDailySummaryMarkdown(result), "utf8");
  await fs.writeFile(path.join(LOCAL_DIR, "parent_daily_note.md"), renderParentDailyNote(result), "utf8");
  return { files: [relative(path.join(LOCAL_DIR, "daily_ai_summary.md")), relative(path.join(LOCAL_DIR, "parent_daily_note.md"))], summary };
}

async function generateParentWeeklyReport(config: LocalLoopConfig, week: number) {
  const logs = await loadTrainingLogs(config);
  const analyses = await loadAllAttemptAnalyses(logs);
  const mastery = await readJsonIfExists<{ items?: JsonObject[] }>(path.join(config.masteryDir ?? "data/mastery", "ability_mastery.json"), { items: [] });
  const summary = summarizeEntries(logs, analyses);
  const scoreCurve = buildScoreCurve(config, logs, analyses);
  const weakMastery = arrayOfObjects(mastery.items)
    .filter((item) => !["PASSED_TRANSFER", "CONTEST_READY"].includes(getString(item, "status")))
    .slice(0, 8);
  const nextWeekPlan = buildNextWeekFromAi(summary, analyses, weakMastery);
  const report = {
    generatedAt: new Date().toISOString(),
    week,
    targetScore: Number(config.targetScore ?? 200),
    currentScore: Number(config.currentScore ?? 104),
    summary,
    scoreCurve,
    keyAttemptAnalyses: analyses.slice(-12).map((item) => ({
      problemPid: item.problemPid,
      primaryError: item.aiDiagnosis.primaryError,
      masteryJudgement: item.aiDiagnosis.masteryJudgement,
      parentSummary: item.aiDiagnosis.parentSummary,
      nextAction: item.aiDiagnosis.nextAction,
    })),
    weakMastery,
    nextWeekPlan,
  };
  await writeJson(path.join(LOCAL_DIR, "score_curve.json"), scoreCurve);
  await writeJson(path.join(LOCAL_DIR, "parent_weekly_report.json"), report);
  await fs.writeFile(path.join(LOCAL_DIR, "parent_weekly_report.md"), renderParentWeeklyReport(report), "utf8");
  return { files: [relative(path.join(LOCAL_DIR, "score_curve.json")), relative(path.join(LOCAL_DIR, "parent_weekly_report.md"))], summary };
}

function buildLocalAttemptAnalysis(input: { config: LocalLoopConfig; problemPid: string; taskContext: JsonObject; attempt: JsonObject; codeEvidence: JsonObject; similarHistory: JsonObject[]; diagnosisContext: JsonObject }): AttemptAnalysis {
  const result = getString(input.attempt, "result") || "UNKNOWN";
  const score = getNumber(input.attempt, "score");
  const timeMinutes = getNumber(input.attempt, "timeMinutes");
  const submissionCount = getNumber(input.attempt, "submissionCount");
  const hintLevelUsed = getNumber(input.attempt, "hintLevelUsed");
  const hasSeenSolution = Boolean(input.attempt.hasSeenSolution);
  const failedStage = getString(input.attempt, "failedStage");
  const errorTypes = asArray(input.attempt.errorTypes).filter((item): item is string => typeof item === "string" && item.length > 0);
  const primaryError = choosePrimaryError({ result, score, submissionCount, hintLevelUsed, hasSeenSolution, failedStage, errorTypes });
  const secondaryErrors = chooseSecondaryErrors(primaryError, { result, score, submissionCount, hintLevelUsed, hasSeenSolution, failedStage, errorTypes, codeEvidence: input.codeEvidence });
  const evidence = buildEvidence({ result, score, timeMinutes, submissionCount, hintLevelUsed, hasSeenSolution, failedStage, errorTypes, codeEvidence: input.codeEvidence, similarHistory: input.similarHistory });
  const masteryJudgement = judgeMastery({ result, score, submissionCount, hintLevelUsed, hasSeenSolution });
  const needRedo = masteryJudgement !== "稳定掌握" || result !== "AC" || hasSeenSolution || hintLevelUsed >= 2 || submissionCount >= 3;
  const rootCause = rootCauseFor(primaryError, failedStage);
  return {
    generatedAt: new Date().toISOString(),
    analysisMode: "LOCAL_RULES",
    problemPid: input.problemPid,
    taskContext: input.taskContext,
    attempt: input.attempt,
    codeEvidence: input.codeEvidence,
    similarHistory: input.similarHistory,
    aiDiagnosis: {
      primaryError,
      secondaryErrors,
      rootCause,
      evidence,
      masteryJudgement,
      needRedo,
      nextAction: nextActionFor(primaryError, needRedo, masteryJudgement),
      studentFeedback: studentFeedbackFor(primaryError, masteryJudgement),
      parentSummary: parentSummaryFor(primaryError, masteryJudgement, needRedo),
      systemUpdate: {
        errorTypes: [primaryError, ...secondaryErrors],
        masteryDelta: masteryDeltaFor(masteryJudgement, { hintLevelUsed, hasSeenSolution, submissionCount }),
        needRedo,
        nextTaskType: needRedo ? "REVIEW_OR_TRANSFER_SAME_ABILITY" : "ADVANCE_OR_TRANSFER",
        noPreSolveHint: true,
      },
    },
    policy: { noPreSolveHint: true, noFullSolution: true, noCodeOutput: true },
  };
}

async function maybeEnhanceAttemptAnalysis(draft: AttemptAnalysis, diagnosisContext: JsonObject): Promise<AttemptAnalysis> {
  if (process.env.LLM_ENABLE === "false" || !process.env.LLM_API_KEY) return draft;
  try {
    const client = new OpenAI({ apiKey: process.env.LLM_API_KEY, baseURL: process.env.LLM_BASE_URL || undefined });
    const payload = {
      instruction: "你是 CSP-S 目标分训练教练。只做做题后错因分析，不输出完整题解，不输出代码，不给解法步骤，不补充题目前提示。每个判断必须基于证据。输出 JSON，字段必须兼容 ruleBasedDraft.aiDiagnosis。",
      ruleBasedDraft: draft,
      diagnosisContext,
    };
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "你只能分析训练证据和错因，不能泄露完整解法、算法实现或参考代码。" },
        { role: "user", content: JSON.stringify(payload).slice(0, 24000) },
      ],
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = parseJsonObject(text);
    const diagnosis = asRecord(parsed.aiDiagnosis ?? parsed);
    return {
      ...draft,
      analysisMode: "LLM_ENHANCED",
      aiDiagnosis: {
        ...draft.aiDiagnosis,
        primaryError: getString(diagnosis, "primaryError") || draft.aiDiagnosis.primaryError,
        secondaryErrors: stringArray(diagnosis.secondaryErrors).length ? stringArray(diagnosis.secondaryErrors) : draft.aiDiagnosis.secondaryErrors,
        rootCause: getString(diagnosis, "rootCause") || draft.aiDiagnosis.rootCause,
        evidence: stringArray(diagnosis.evidence).length ? stringArray(diagnosis.evidence) : draft.aiDiagnosis.evidence,
        masteryJudgement: getString(diagnosis, "masteryJudgement") || draft.aiDiagnosis.masteryJudgement,
        needRedo: typeof diagnosis.needRedo === "boolean" ? diagnosis.needRedo : draft.aiDiagnosis.needRedo,
        nextAction: getString(diagnosis, "nextAction") || draft.aiDiagnosis.nextAction,
        studentFeedback: getString(diagnosis, "studentFeedback") || draft.aiDiagnosis.studentFeedback,
        parentSummary: getString(diagnosis, "parentSummary") || draft.aiDiagnosis.parentSummary,
        systemUpdate: { ...draft.aiDiagnosis.systemUpdate, ...asRecord(diagnosis.systemUpdate) },
      },
    };
  } catch (error) {
    return {
      ...draft,
      aiDiagnosis: {
        ...draft.aiDiagnosis,
        evidence: [...draft.aiDiagnosis.evidence, `LLM 增强失败，已使用本地规则分析：${error instanceof Error ? error.message : String(error)}`],
      },
    };
  }
}

function enforceNoSolutionPolicy(analysis: AttemptAnalysis): AttemptAnalysis {
  const scrub = (value: string) => value
    .replace(/参考代码[:：][\s\S]*/g, "参考代码已隐藏。")
    .replace(/完整代码[:：][\s\S]*/g, "完整代码已隐藏。")
    .replace(/代码如下[:：][\s\S]*/g, "代码内容已隐藏。");
  return {
    ...analysis,
    aiDiagnosis: {
      ...analysis.aiDiagnosis,
      rootCause: scrub(analysis.aiDiagnosis.rootCause),
      nextAction: scrub(analysis.aiDiagnosis.nextAction),
      studentFeedback: scrub(analysis.aiDiagnosis.studentFeedback),
      parentSummary: scrub(analysis.aiDiagnosis.parentSummary),
      evidence: analysis.aiDiagnosis.evidence.map(scrub),
    },
    policy: { noPreSolveHint: true, noFullSolution: true, noCodeOutput: true },
  };
}

async function loadOrGenerateAttemptAnalysis(config: LocalLoopConfig, problemPid: string) {
  const file = path.join(ATTEMPT_ANALYSIS_DIR, `${safeFileName(problemPid)}.json`);
  if (problemPid && await exists(file)) return readJson<AttemptAnalysis>(file);
  return generateAttemptAnalysis(config, problemPid || undefined);
}

async function loadAllAttemptAnalyses(logs: JsonObject[]) {
  const output: AttemptAnalysis[] = [];
  for (const entry of logs) {
    const pid = getString(entry, "problemPid");
    if (!pid) continue;
    const file = path.join(ATTEMPT_ANALYSIS_DIR, `${safeFileName(pid)}.json`);
    if (await exists(file)) output.push(await readJson<AttemptAnalysis>(file));
  }
  return output;
}

async function loadTrainingLogs(config: LocalLoopConfig) {
  const trainingDir = config.trainingDir ?? "data/training";
  const log = await readJsonIfExists<{ items?: JsonObject[] }>(path.join(trainingDir, "training_log.json"), { items: [] });
  return arrayOfObjects(log.items);
}

function pickAttempt(logs: JsonObject[], problemPid?: string) {
  const candidates = problemPid ? logs.filter((item) => getString(item, "problemPid") === problemPid) : logs;
  const picked = candidates[candidates.length - 1];
  if (!picked) throw new Error(problemPid ? `No training log found for ${problemPid}` : "No training log found");
  return picked;
}

function findTaskContext(today: JsonObject, problemPid: string) {
  return arrayOfObjects(today.tasks).find((task) => getString(task, "problemPid") === problemPid) ?? {};
}

async function collectDiagnosisContext(config: LocalLoopConfig) {
  const diagnosisDir = config.diagnosisDir ?? "data/diagnosis";
  const analysisDir = config.analysisDir ?? "data/analysis";
  return {
    weaknessSummary: await readJsonIfExists(path.join(diagnosisDir, "weakness_summary.json"), {}),
    riskProfile: await readJsonIfExists(path.join(analysisDir, "csp_s_risk_profile.json"), {}),
    moduleStats: await readJsonIfExists(path.join(analysisDir, "algorithm_module_stats.json"), {}),
    timeline: await readJsonIfExists(path.join(analysisDir, "problem_code_timeline.json"), {}),
  };
}

async function collectCodeEvidence(config: LocalLoopConfig, problemPid: string) {
  const codePath = await findCodePath(config, problemPid);
  const source = codePath ? await fs.readFile(codePath, "utf8").catch(() => "") : "";
  const lines = source.split(/\r?\n/);
  return {
    codePath: codePath ? relative(codePath) : null,
    sourceAvailable: Boolean(source),
    lineCount: source ? lines.length : 0,
    nonEmptyLineCount: source ? lines.filter((line) => line.trim()).length : 0,
    hasBitsHeader: /#include\s*<bits\/stdc\+\+\.h>/.test(source),
    hasDefineIntLongLong: /#\s*define\s+int\s+long\s+long/.test(source),
    loopCount: countMatches(source, /\b(for|while)\s*\(/g),
    branchCount: countMatches(source, /\b(if|else\s+if|switch)\b/g),
    vectorUse: /\bvector\s*</.test(source),
    graphLike: /\b(edge|edges|adj|g\[|vector\s*<\s*vector|addEdge)\b/i.test(source),
    dpLike: /\bdp\b|f\[|memo|记忆化/.test(source),
    sourceSnippetForLlm: source.slice(0, 8000),
  };
}

async function findCodePath(config: LocalLoopConfig, problemPid: string): Promise<string | null> {
  const indexPath = config.codeIndex ? path.resolve(config.codeIndex) : "";
  if (indexPath && await exists(indexPath)) {
    const index = await readJson<unknown>(indexPath);
    const found = findCodePathInIndex(index, problemPid, path.dirname(indexPath));
    if (found && await exists(found)) return found;
  }
  const codeDir = config.codeDir ? path.resolve(config.codeDir) : "";
  if (!codeDir || !(await exists(codeDir))) return null;
  const scanned = await scanForCodeFile(codeDir, problemPid);
  return scanned;
}

function findCodePathInIndex(value: unknown, problemPid: string, baseDir: string): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCodePathInIndex(item, problemPid, baseDir);
      if (found) return found;
    }
    return null;
  }
  const object = asRecord(value);
  if (!Object.keys(object).length) return null;
  const pidValues = ["problemPid", "pid", "problemId", "luoguPid"].map((key) => getString(object, key));
  const matchesPid = pidValues.includes(problemPid);
  if (matchesPid) {
    const file = ["filePath", "path", "sourcePath", "codePath", "filename"].map((key) => getString(object, key)).find(Boolean);
    if (file) return path.isAbsolute(file) ? file : path.resolve(baseDir, file);
  }
  for (const child of Object.values(object)) {
    const found = findCodePathInIndex(child, problemPid, baseDir);
    if (found) return found;
  }
  return null;
}

async function scanForCodeFile(dir: string, problemPid: string): Promise<string | null> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await scanForCodeFile(full, problemPid);
      if (found) return found;
    } else if (entry.name.includes(problemPid) && /\.(cpp|cc|cxx|c|py|java|ts|js)$/.test(entry.name)) {
      return full;
    }
  }
  return null;
}

function collectSimilarHistory(logs: JsonObject[], attempt: JsonObject) {
  const unitId = getString(attempt, "unitId");
  const taskType = getString(attempt, "taskType");
  return logs
    .filter((item) => item !== attempt && ((unitId && getString(item, "unitId") === unitId) || (taskType && getString(item, "taskType") === taskType)))
    .slice(-8)
    .map((item) => ({
      date: getString(item, "date"),
      problemPid: getString(item, "problemPid"),
      result: getString(item, "result"),
      score: getNumber(item, "score"),
      submissionCount: getNumber(item, "submissionCount"),
      hintLevelUsed: getNumber(item, "hintLevelUsed"),
      hasSeenSolution: Boolean(item.hasSeenSolution),
    }));
}

function choosePrimaryError(input: { result: string; score: number; submissionCount: number; hintLevelUsed: number; hasSeenSolution: boolean; failedStage: string; errorTypes: string[] }) {
  if (input.errorTypes.length > 0 && input.errorTypes[0] !== "UNKNOWN") return input.errorTypes[0];
  if (input.hasSeenSolution || input.hintLevelUsed >= 3) return "SOLUTION_DEPENDENCY";
  if (["READING", "读题"].includes(input.failedStage)) return "READING_ERROR";
  if (["MODELING", "建模"].includes(input.failedStage)) return "MODEL_ERROR";
  if (["COMPLEXITY", "复杂度"].includes(input.failedStage)) return "COMPLEXITY_ERROR";
  if (["IMPLEMENTATION", "DEBUG", "调试"].includes(input.failedStage)) return "IMPLEMENTATION_RISK";
  if (input.result === "TLE") return "COMPLEXITY_ERROR";
  if (input.result === "RE" || input.result === "CE") return "IMPLEMENTATION_RISK";
  if (input.result !== "AC" && input.submissionCount >= 3) return "DEBUG_EFFICIENCY";
  if (input.score > 0 && input.score < 70) return "PARTIAL_SCORE_GAP";
  if (input.result === "AC" && input.submissionCount <= 2 && input.hintLevelUsed === 0 && !input.hasSeenSolution) return "NO_MAJOR_ERROR";
  return "UNKNOWN_ERROR";
}

function chooseSecondaryErrors(primary: string, input: { result: string; score: number; submissionCount: number; hintLevelUsed: number; hasSeenSolution: boolean; failedStage: string; errorTypes: string[]; codeEvidence: JsonObject }) {
  const errors = new Set(input.errorTypes.filter((item) => item && item !== primary));
  if (input.submissionCount >= 3) errors.add("DEBUG_EFFICIENCY");
  if (input.hintLevelUsed > 0 || input.hasSeenSolution) errors.add("INDEPENDENCE_RISK");
  if (getNumber(input.codeEvidence, "lineCount") > 120 || getNumber(input.codeEvidence, "branchCount") > 20) errors.add("IMPLEMENTATION_COMPLEXITY");
  if (primary !== "COMPLEXITY_ERROR" && input.result === "TLE") errors.add("COMPLEXITY_ERROR");
  return Array.from(errors).slice(0, 4);
}

function buildEvidence(input: { result: string; score: number; timeMinutes: number; submissionCount: number; hintLevelUsed: number; hasSeenSolution: boolean; failedStage: string; errorTypes: string[]; codeEvidence: JsonObject; similarHistory: JsonObject[] }) {
  const evidence = [
    `本题结果：${input.result || "UNKNOWN"}，得分 ${input.score}。`,
    `用时 ${input.timeMinutes} 分钟，提交 ${input.submissionCount} 次。`,
  ];
  if (input.hintLevelUsed > 0) evidence.push(`使用了 ${input.hintLevelUsed} 级提示。`);
  if (input.hasSeenSolution) evidence.push("本题看过题解或完整解法，因此不能计为独立掌握。");
  if (input.failedStage) evidence.push(`学生记录的卡点阶段：${input.failedStage}。`);
  if (input.errorTypes.length) evidence.push(`学生/系统记录错因：${input.errorTypes.join(", ")}。`);
  if (getString(input.codeEvidence, "codePath")) evidence.push(`已读取代码文件：${getString(input.codeEvidence, "codePath")}。`);
  if (getNumber(input.codeEvidence, "lineCount") > 0) evidence.push(`代码规模：${getNumber(input.codeEvidence, "lineCount")} 行，分支 ${getNumber(input.codeEvidence, "branchCount")} 个，循环 ${getNumber(input.codeEvidence, "loopCount")} 个。`);
  if (input.similarHistory.length) evidence.push(`同类/同单元历史记录 ${input.similarHistory.length} 条，可用于判断迁移稳定性。`);
  return evidence;
}

function judgeMastery(input: { result: string; score: number; submissionCount: number; hintLevelUsed: number; hasSeenSolution: boolean }) {
  if (input.result === "AC" && input.score >= 90 && input.submissionCount <= 2 && input.hintLevelUsed === 0 && !input.hasSeenSolution) return "稳定掌握";
  if (input.result === "AC" && input.score >= 80 && !input.hasSeenSolution && input.hintLevelUsed <= 1) return "基本掌握";
  if (input.score >= 40 && !input.hasSeenSolution) return "部分掌握";
  if (input.hasSeenSolution || input.hintLevelUsed >= 3) return "接触过但未掌握";
  return "未掌握";
}

function rootCauseFor(primary: string, failedStage: string) {
  const byPrimary: Record<string, string> = {
    READING_ERROR: "题意和限制条件没有先转成清晰的输入、输出、边界要求，导致后续实现建立在不稳定理解上。",
    MODEL_ERROR: "开题阶段没有形成可执行模型，后续代码修改主要是在修补现象，没有解决根因。",
    STATE_ERROR: "状态含义或变量含义不够稳定，导致实现时无法保证每一步都对应正确语义。",
    COMPLEXITY_ERROR: "能想到直接做法，但没有充分根据数据范围判断瓶颈和优化方向。",
    IMPLEMENTATION_RISK: "主要失分来自实现稳定性，包括边界、初始化、数组范围、数据类型或多测清空。",
    DEBUG_EFFICIENCY: "调试成本偏高，说明提交前自测和定位 bug 的流程还不稳定。",
    SOLUTION_DEPENDENCY: "本题推进依赖提示或题解，不能作为独立掌握证据。",
    PARTIAL_SCORE_GAP: "已经产生部分得分证据，但从部分方案到完整方案的迁移还不稳定。",
    NO_MAJOR_ERROR: "本题是正向训练证据，暂未发现明显阻塞点。",
  };
  return byPrimary[primary] ?? (failedStage ? `主要卡在 ${failedStage} 阶段，需要结合自评和代码复盘。` : "公开记录不足，需要补充学生自评后再判断根因。");
}

function nextActionFor(primary: string, needRedo: boolean, mastery: string) {
  if (!needRedo && mastery === "稳定掌握") return "可以进入同能力点迁移题或小幅提高难度。";
  if (primary === "SOLUTION_DEPENDENCY") return "明天必须安排原题重做或同类迁移题，要求不看题解，限时完成。";
  if (primary === "READING_ERROR") return "下一题降低算法压力，强化读题、边界和样例构造记录。";
  if (primary === "MODEL_ERROR" || primary === "STATE_ERROR") return "安排同能力点迁移题，要求先写暴力方案和失败阶段记录，不提前给算法提示。";
  if (primary === "COMPLEXITY_ERROR") return "安排复杂度判断专项，要求提交前写出数据范围、暴力复杂度和瓶颈。";
  if (primary === "IMPLEMENTATION_RISK" || primary === "DEBUG_EFFICIENCY") return "安排保分题或旧题重写，重点执行提交前检查清单和本地小样例验证。";
  if (primary === "PARTIAL_SCORE_GAP") return "安排部分分拆解训练，要求写出可执行的低分路线和升级路线。";
  return "保留复盘，下一次训练继续记录具体卡点。";
}

function studentFeedbackFor(primary: string, mastery: string) {
  if (primary === "NO_MAJOR_ERROR") return `这题是有效正向证据，目前判断为${mastery}。继续保持独立完成、低提交次数和限时完成。`;
  if (primary === "SOLUTION_DEPENDENCY") return "这题看过提示或题解，不能算真正掌握。下次要验证的是：不看答案能不能独立推进。";
  if (primary === "MODEL_ERROR") return "这题主要不是代码问题，而是开题时没有形成稳定方案。下次先写暴力和卡点，再开始实现。";
  if (primary === "COMPLEXITY_ERROR") return "这题暴露的是复杂度判断问题。下次先根据数据范围判断暴力会卡在哪里。";
  return "这题产生了有效训练证据。重点不是只看 AC，而是看你卡在哪一步，以及下次如何避免。";
}

function parentSummaryFor(primary: string, mastery: string, needRedo: boolean) {
  const redo = needRedo ? "需要安排重做或同类迁移验证。" : "可以进入迁移题或小幅升级。";
  if (primary === "NO_MAJOR_ERROR") return `这道题是较好的独立完成证据，当前判断为${mastery}，${redo}`;
  if (primary === "SOLUTION_DEPENDENCY") return `这道题虽然可能完成了，但依赖提示/题解，不能算掌握，${redo}`;
  if (primary === "MODEL_ERROR") return `这道题反映孩子在中档题开题和建模上不稳定，不是单纯粗心，${redo}`;
  if (primary === "IMPLEMENTATION_RISK" || primary === "DEBUG_EFFICIENCY") return `这道题主要暴露实现和调试稳定性问题，会直接影响 T1/T2 保分，${redo}`;
  return `这道题暴露 ${primary}，当前判断为${mastery}，${redo}`;
}

function masteryDeltaFor(mastery: string, input: { hintLevelUsed: number; hasSeenSolution: boolean; submissionCount: number }) {
  let delta = mastery === "稳定掌握" ? 8 : mastery === "基本掌握" ? 4 : mastery === "部分掌握" ? 1 : -3;
  if (input.hintLevelUsed > 0) delta -= input.hintLevelUsed;
  if (input.hasSeenSolution) delta -= 4;
  if (input.submissionCount >= 3) delta -= 1;
  return Math.max(-8, Math.min(8, delta));
}

function summarizeEntries(entries: JsonObject[], analyses: AttemptAnalysis[]) {
  const total = entries.length;
  const independentAc = entries.filter((item) => getString(item, "result") === "AC" && getNumber(item, "hintLevelUsed") === 0 && !item.hasSeenSolution).length;
  const withSolution = entries.filter((item) => Boolean(item.hasSeenSolution)).length;
  const hintOrSolution = entries.filter((item) => getNumber(item, "hintLevelUsed") > 0 || Boolean(item.hasSeenSolution)).length;
  const needRedo = analyses.filter((item) => item.aiDiagnosis.needRedo).length;
  const errorCounts: Record<string, number> = {};
  for (const analysis of analyses) {
    const errors = [analysis.aiDiagnosis.primaryError, ...analysis.aiDiagnosis.secondaryErrors];
    for (const error of errors) errorCounts[error] = (errorCounts[error] ?? 0) + 1;
  }
  return {
    total,
    independentAc,
    withSolution,
    hintOrSolution,
    hintOrSolutionRate: total ? round(hintOrSolution / total, 2) : 0,
    averageScore: total ? round(entries.reduce((sum, item) => sum + getNumber(item, "score"), 0) / total, 1) : 0,
    averageTimeMinutes: total ? round(entries.reduce((sum, item) => sum + getNumber(item, "timeMinutes"), 0) / total, 1) : 0,
    needRedo,
    errorCounts,
    problems: entries.map((item) => getString(item, "problemPid")).filter(Boolean),
  };
}

function buildTomorrowAdjustment(summary: JsonObject, analyses: AttemptAnalysis[]) {
  const errorCounts = getRecordNumber(summary, "errorCounts");
  const actions: string[] = [];
  if ((errorCounts.IMPLEMENTATION_RISK ?? 0) + (errorCounts.DEBUG_EFFICIENCY ?? 0) >= 1) actions.push("保留 1 道 T1/保分题，重点检查边界、初始化和提交前自测。");
  if ((errorCounts.MODEL_ERROR ?? 0) + (errorCounts.STATE_ERROR ?? 0) >= 1) actions.push("安排 1 道同能力点迁移题，要求独立完成，不给做题前算法提示。");
  if ((errorCounts.SOLUTION_DEPENDENCY ?? 0) >= 1) actions.push("减少新题，安排原题重做或同类题重做，验证是否摆脱题解依赖。");
  if ((errorCounts.PARTIAL_SCORE_GAP ?? 0) >= 1) actions.push("安排部分分拆解题，要求写出可执行低分路线。 ");
  if (!actions.length) actions.push("保持每日 3 题：保分题、短板题、复盘/迁移题。 ");
  return { actions, redoProblems: analyses.filter((item) => item.aiDiagnosis.needRedo).map((item) => item.problemPid) };
}

function buildScoreCurve(config: LocalLoopConfig, logs: JsonObject[], analyses: AttemptAnalysis[]) {
  const startScore = Number(config.currentScore ?? 104);
  const targetScore = Number(config.targetScore ?? 200);
  let score = startScore;
  const analysisByPid = new Map(analyses.map((item) => [item.problemPid, item]));
  const groups = new Map<string, JsonObject[]>();
  for (const log of logs) {
    const date = getString(log, "date") || "UNKNOWN_DATE";
    groups.set(date, [...(groups.get(date) ?? []), log]);
  }
  const points = [{ date: "START", score, delta: 0, note: "初始分" }];
  for (const [date, items] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const delta = round(items.reduce((sum, item) => sum + scoreDeltaFor(item, analysisByPid.get(getString(item, "problemPid"))), 0), 1);
    score = Math.max(0, Math.min(targetScore, round(score + delta, 1)));
    points.push({ date, score, delta, note: `${items.length} 条训练记录` });
  }
  return { generatedAt: new Date().toISOString(), startScore, targetScore, points };
}

function scoreDeltaFor(entry: JsonObject, analysis?: AttemptAnalysis) {
  let delta = 0;
  const result = getString(entry, "result");
  const score = getNumber(entry, "score");
  if (result === "AC") delta += score >= 90 ? 1.8 : 1.1;
  else if (score >= 40) delta += 0.6;
  else delta -= 0.1;
  if (getNumber(entry, "hintLevelUsed") > 0) delta -= 0.25 * getNumber(entry, "hintLevelUsed");
  if (entry.hasSeenSolution) delta -= 0.8;
  if (getNumber(entry, "submissionCount") >= 3) delta -= 0.2;
  if (analysis?.aiDiagnosis.masteryJudgement === "稳定掌握") delta += 0.6;
  if (analysis?.aiDiagnosis.needRedo) delta -= 0.2;
  return delta;
}

function buildNextWeekFromAi(summary: JsonObject, analyses: AttemptAnalysis[], weakMastery: JsonObject[]) {
  const errorCounts = getRecordNumber(summary, "errorCounts");
  const adjustments: string[] = [];
  if ((errorCounts.IMPLEMENTATION_RISK ?? 0) + (errorCounts.DEBUG_EFFICIENCY ?? 0) >= 2) adjustments.push("T1/保分稳定性不足：下周减少难题，增加基础题、旧题重写和提交前检查。 ");
  if ((errorCounts.MODEL_ERROR ?? 0) + (errorCounts.STATE_ERROR ?? 0) >= 2) adjustments.push("T2 建模入口不稳定：下周保留同能力点迁移题，不急着加 T3 难题。 ");
  if ((errorCounts.SOLUTION_DEPENDENCY ?? 0) >= 1 || getNumber(summary, "hintOrSolutionRate") >= 0.35) adjustments.push("题解依赖偏高：下周降低新题比例，增加重做和迁移验证。 ");
  if ((errorCounts.PARTIAL_SCORE_GAP ?? 0) >= 1) adjustments.push("T3 部分分不足：下周固定安排部分分拆解训练。 ");
  if (!adjustments.length) adjustments.push("保持每日 2-4 题动态训练，标准日 3 题，周末 4 题模拟。 ");
  return {
    adjustments,
    redoProblems: analyses.filter((item) => item.aiDiagnosis.needRedo).map((item) => item.problemPid).slice(0, 10),
    weakUnits: weakMastery.map((item) => ({ unitId: getString(item, "unitId"), status: getString(item, "status") })).slice(0, 8),
    recommendedDailyMix: { foundation: 1, weakness: 1, reviewOrTransfer: 1 },
    mockExam: "每周至少一次 4 题模拟，用于验证单题训练是否迁移到真实 CSP-S 结构。",
  };
}

function renderAttemptAnalysisMarkdown(analysis: AttemptAnalysis) {
  return [
    `# 做题后 AI 分析：${analysis.problemPid}`,
    "",
    `- 分析模式：${analysis.analysisMode}`,
    `- 结果：${getString(analysis.attempt, "result")}`,
    `- 得分：${getNumber(analysis.attempt, "score")}`,
    `- 用时：${getNumber(analysis.attempt, "timeMinutes")} 分钟`,
    `- 提交次数：${getNumber(analysis.attempt, "submissionCount")}`,
    "",
    "## 1. 主要判断",
    "",
    `- 主要错因：${analysis.aiDiagnosis.primaryError}`,
    `- 次要错因：${analysis.aiDiagnosis.secondaryErrors.join(", ") || "无"}`,
    `- 掌握判断：${analysis.aiDiagnosis.masteryJudgement}`,
    `- 是否重做：${analysis.aiDiagnosis.needRedo ? "是" : "否"}`,
    "",
    "## 2. 证据",
    "",
    ...analysis.aiDiagnosis.evidence.map((item) => `- ${item}`),
    "",
    "## 3. 根因解释",
    "",
    analysis.aiDiagnosis.rootCause,
    "",
    "## 4. 给孩子的反馈",
    "",
    analysis.aiDiagnosis.studentFeedback,
    "",
    "## 5. 给家长的说明",
    "",
    analysis.aiDiagnosis.parentSummary,
    "",
    "## 6. 下一步",
    "",
    analysis.aiDiagnosis.nextAction,
    "",
    "说明：本分析只基于做题后证据，不提供做题前解法提示，不输出完整题解或代码。",
    "",
  ].join("\n");
}

function renderDailySummaryMarkdown(result: JsonObject) {
  const summary = asRecord(result.summary);
  const adjustment = asRecord(result.tomorrowAdjustment);
  const analyses = arrayOfObjects(result.attemptAnalyses);
  return [
    `# 每日 AI 训练小结`,
    "",
    `日期：${getString(result, "date")}`,
    `目标分：${getNumber(result, "targetScore")}`,
    "",
    "## 1. 完成情况",
    "",
    `- 训练记录：${getNumber(summary, "total")}`,
    `- 独立 AC：${getNumber(summary, "independentAc")}`,
    `- 看提示/题解：${getNumber(summary, "hintOrSolution")}`,
    `- 平均得分：${getNumber(summary, "averageScore")}`,
    `- 平均用时：${getNumber(summary, "averageTimeMinutes")} 分钟`,
    `- 需要重做：${getNumber(summary, "needRedo")}`,
    "",
    "## 2. 单题 AI 判断",
    "",
    ...(analyses.length ? analyses.flatMap((item) => [
      `### ${getString(item, "problemPid")}`,
      `- 主要错因：${getString(item, "primaryError")}`,
      `- 掌握判断：${getString(item, "masteryJudgement")}`,
      `- 家长说明：${getString(item, "parentSummary")}`,
      "",
    ]) : ["暂无单题分析。"]),
    "## 3. 明日调整",
    "",
    ...asArray(adjustment.actions).map((item) => `- ${String(item)}`),
    "",
  ].join("\n");
}

function renderParentDailyNote(result: JsonObject) {
  const summary = asRecord(result.summary);
  const adjustment = asRecord(result.tomorrowAdjustment);
  return [
    "# 家长每日简报",
    "",
    `今天完成 ${getNumber(summary, "total")} 条训练记录，独立 AC ${getNumber(summary, "independentAc")} 条，看提示/题解 ${getNumber(summary, "hintOrSolution")} 条。`,
    "",
    getNumber(summary, "needRedo") > 0
      ? `今天有 ${getNumber(summary, "needRedo")} 道题需要重做或迁移验证，不能只看是否 AC。`
      : "今天没有明显重做项，可以继续按计划推进。",
    "",
    "## 明日重点",
    "",
    ...asArray(adjustment.actions).map((item) => `- ${String(item)}`),
    "",
  ].join("\n");
}

function renderParentWeeklyReport(report: JsonObject) {
  const summary = asRecord(report.summary);
  const scoreCurve = asRecord(report.scoreCurve);
  const next = asRecord(report.nextWeekPlan);
  const points = arrayOfObjects(scoreCurve.points);
  const lastPoint = points[points.length - 1] ?? {};
  return [
    `# CSP-S 200 分家长周报`,
    "",
    `目标分：${getNumber(report, "targetScore")}`,
    `当前代理分：${getNumber(lastPoint, "score") || getNumber(report, "currentScore")}`,
    "",
    "## 1. 本周完成情况",
    "",
    `- 训练记录：${getNumber(summary, "total")}`,
    `- 独立 AC：${getNumber(summary, "independentAc")}`,
    `- 看提示/题解：${getNumber(summary, "hintOrSolution")}`,
    `- 平均得分：${getNumber(summary, "averageScore")}`,
    `- 平均用时：${getNumber(summary, "averageTimeMinutes")} 分钟`,
    `- 需要重做：${getNumber(summary, "needRedo")}`,
    "",
    "## 2. 目标分曲线",
    "",
    ...points.map((point) => `- ${getString(point, "date")}: ${getNumber(point, "score")} (${getNumber(point, "delta") >= 0 ? "+" : ""}${getNumber(point, "delta")})`),
    "",
    "## 3. 高频错因",
    "",
    ...Object.entries(getRecordNumber(summary, "errorCounts")).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## 4. 下周调整",
    "",
    ...asArray(next.adjustments).map((item) => `- ${String(item)}`),
    "",
    "## 5. 家长监督重点",
    "",
    "- 每题是否记录用时、提交次数、是否看题解。",
    "- AC 后也要看是否独立完成。",
    "- 需要重做的题不要跳过。",
    "- 周末至少做一次 4 题结构验证。",
    "",
  ].join("\n");
}

function printHelp() {
  console.log(`CSP-S 200 post-attempt AI analysis\n\nActions:\n  pnpm tsx scripts/csps200-ai-post-analysis.ts --action attempt --problemPid Pxxxx\n  pnpm tsx scripts/csps200-ai-post-analysis.ts --action daily\n  pnpm tsx scripts/csps200-ai-post-analysis.ts --action week --week 1\n  pnpm tsx scripts/csps200-ai-post-analysis.ts --action all --problemPid Pxxxx\n\nOutputs:\n  data/local-loop/attempt-analysis/Pxxxx.json/md\n  data/local-loop/daily_ai_summary.md\n  data/local-loop/parent_daily_note.md\n  data/local-loop/parent_weekly_report.md\n  data/local-loop/score_curve.json\n`);
}

async function loadConfig(): Promise<LocalLoopConfig> {
  const configPath = await exists(CONFIG_PATH) ? CONFIG_PATH : EXAMPLE_CONFIG_PATH;
  return readJsonIfExists<LocalLoopConfig>(configPath, { targetScore: 200, currentScore: 104, trainingDir: "data/training", masteryDir: "data/mastery" });
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

async function inferTodayDate(logs: JsonObject[]) {
  const today = await readJsonIfExists<JsonObject>(path.join(LOCAL_DIR, "today.json"), {});
  return getString(today, "date") || getString(logs[logs.length - 1] ?? {}, "date") || new Date().toISOString().slice(0, 10);
}

function parseJsonObject(text: string): JsonObject {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return {};
  try { return JSON.parse(text.slice(start, end + 1)) as JsonObject; } catch { return {}; }
}

async function exists(filePath: string) {
  try { await fs.access(path.resolve(filePath)); return true; } catch { return false; }
}
async function ensureDir(dir: string) { await fs.mkdir(path.resolve(dir), { recursive: true }); }
async function readJson<T>(filePath: string): Promise<T> { return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T; }
async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> { return (await exists(filePath)) ? readJson<T>(filePath) : fallback; }
async function writeJson(filePath: string, value: unknown) { await ensureDir(path.dirname(filePath)); await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function asArray(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function asRecord(value: unknown): JsonObject { return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }
function arrayOfObjects(value: unknown): JsonObject[] { return asArray(value).map(asRecord).filter((item) => Object.keys(item).length > 0); }
function stringArray(value: unknown): string[] { return asArray(value).filter((item): item is string => typeof item === "string" && item.length > 0); }
function getString(value: unknown, key?: string): string { const source = key ? asRecord(value)[key] : value; if (typeof source === "string") return source; if (typeof source === "number" || typeof source === "bigint") return String(source); return ""; }
function getNumber(value: unknown, key?: string): number { const source = key ? asRecord(value)[key] : value; if (typeof source === "number" && Number.isFinite(source)) return source; if (typeof source === "string" && source.trim() && Number.isFinite(Number(source))) return Number(source); return 0; }
function getRecordNumber(value: unknown, key: string): Record<string, number> { const record = asRecord(asRecord(value)[key]); return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, getNumber(v)])); }
function countMatches(text: string, pattern: RegExp) { return [...text.matchAll(pattern)].length; }
function round(value: number, digits = 0) { const base = 10 ** digits; return Math.round(value * base) / base; }
function safeFileName(value: string) { return value.replace(/[^a-z0-9_-]/gi, "_"); }
function relative(filePath: string) { return path.relative(ROOT, path.resolve(filePath)) || "."; }
