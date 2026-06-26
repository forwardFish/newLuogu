import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;

type LocalLoopConfig = {
  uid?: string;
  currentScore?: number;
  targetScore?: number;
  analysisDir?: string;
  diagnosisDir?: string;
  benchmarkDir?: string;
  trainingDir?: string;
  masteryDir?: string;
};

type EvidenceProblem = {
  problemPid: string;
  title: string | null;
  reason: string;
  relatedAbility: string;
  attemptCount: number;
  finalResult: string;
  bestScore: number | null;
  diagnosis: string;
};

const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");
const CONFIG_PATH = path.join(LOCAL_DIR, "config.json");
const EXAMPLE_CONFIG_PATH = path.join(ROOT, "config", "local-loop.example.json");

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const config = await loadConfig();
  applyOverrides(config, args);
  const report = await buildStudentAnalysisReport(config);
  await ensureDir(LOCAL_DIR);
  await writeJson(path.join(LOCAL_DIR, "student_analysis_report.json"), report.studentAnalysisReport);
  await writeJson(path.join(LOCAL_DIR, "analysis_quality_report.json"), report.analysisQualityReport);
  await fs.writeFile(path.join(LOCAL_DIR, "student_analysis_report.md"), renderStudentAnalysisMarkdown(report.studentAnalysisReport), "utf8");
  console.log(JSON.stringify({
    files: [
      relative(path.join(LOCAL_DIR, "student_analysis_report.json")),
      relative(path.join(LOCAL_DIR, "student_analysis_report.md")),
      relative(path.join(LOCAL_DIR, "analysis_quality_report.json")),
    ],
    quality: report.analysisQualityReport.dataQuality.overall,
    estimatedCurrentScore: getNumber(report.studentAnalysisReport, "scoreEstimate.estimatedCurrentScore"),
  }, null, 2));
}

async function buildStudentAnalysisReport(config: LocalLoopConfig) {
  const analysisDir = path.resolve(config.analysisDir ?? "data/analysis");
  const diagnosisDir = path.resolve(config.diagnosisDir ?? "data/diagnosis");
  const benchmarkDir = path.resolve(config.benchmarkDir ?? "data/csp-s-benchmark");
  const [manifest, metrics, timeline, modules, riskProfile, vectorsFile, weaknessSummary, knowledgeTree] = await Promise.all([
    readJsonIfExists<JsonObject>(path.join(analysisDir, "submission_manifest.json"), {}),
    readJsonIfExists<JsonObject>(path.join(analysisDir, "code_static_metrics.json"), {}),
    readJsonIfExists<JsonObject>(path.join(analysisDir, "problem_code_timeline.json"), {}),
    readJsonIfExists<JsonObject>(path.join(analysisDir, "algorithm_module_stats.json"), {}),
    readJsonIfExists<JsonObject>(path.join(analysisDir, "csp_s_risk_profile.json"), {}),
    readJsonIfExists<JsonObject>(path.join(diagnosisDir, "problem_feature_vectors.json"), {}),
    readJsonIfExists<JsonObject>(path.join(diagnosisDir, "weakness_summary.json"), {}),
    readJsonIfExists<JsonObject>(path.join(benchmarkDir, "knowledge_ability_tree.json"), {}),
  ]);

  const manifestItems = arrayOfObjects(manifest.items);
  const metricItems = arrayOfObjects(metrics.items);
  const timelineItems = arrayOfObjects(timeline.items);
  const vectors = arrayOfObjects(vectorsFile.items);
  const sourceQuality = buildSourceQuality({ config, manifestItems, metricItems, timelineItems, vectors, knowledgeTree });
  const slotReadiness = buildSlotReadiness({ manifestItems, metricItems, timelineItems, vectors, riskProfile });
  const scoreEstimate = buildScoreEstimate(config, sourceQuality, slotReadiness);
  const knowledgeMastery = buildKnowledgeMastery({ modules, vectors, metricItems, timelineItems }).slice(0, 30);
  const errorPatterns = buildErrorPatterns({ metricItems, timelineItems, vectors, weaknessSummary });
  const evidenceProblems = buildEvidenceProblems({ timelineItems, vectors, errorPatterns }).slice(0, 12);
  const currentStage = buildCurrentStage(scoreEstimate, slotReadiness, errorPatterns);
  const trainingRecommendation = buildTrainingRecommendation(currentStage, knowledgeMastery, errorPatterns, sourceQuality);
  const analysisQualityReport = buildAnalysisQualityReport({ sourceQuality, manifest, metrics, timeline, vectorsFile, knowledgeTree });

  return {
    studentAnalysisReport: {
      version: "csps200-student-analysis-v1",
      generatedAt: new Date().toISOString(),
      target: {
        uid: config.uid ?? null,
        officialLastScore: Number(config.currentScore ?? 104),
        targetScore: Number(config.targetScore ?? 200),
      },
      sourceQuality,
      scoreEstimate,
      slotReadiness,
      knowledgeMastery,
      errorPatterns,
      evidenceProblems,
      currentStage,
      trainingRecommendation,
      policy: {
        ruleFirst: true,
        llmRole: "证据解释器，不直接下无证据结论",
        noPreSolveHint: true,
        noFullSolution: true,
        noScorePromise: true,
      },
    },
    analysisQualityReport,
  };
}

function buildSourceQuality(input: { config: LocalLoopConfig; manifestItems: JsonObject[]; metricItems: JsonObject[]; timelineItems: JsonObject[]; vectors: JsonObject[]; knowledgeTree: JsonObject }) {
  const submissionCount = input.manifestItems.length;
  const problemSet = new Set(input.manifestItems.map((item) => getString(item, "problemPid")).filter(Boolean));
  for (const item of input.timelineItems) if (getString(item, "problemPid")) problemSet.add(getString(item, "problemPid"));
  const problemCount = problemSet.size;
  const codeFileCount = input.metricItems.length;
  const codeCoverage = ratio(codeFileCount, Math.max(1, submissionCount));
  const metadataSignals = input.vectors.filter((vector) => {
    const tags = arrayOfObjects(vector.luoguTags).length + stringArray(vector.luoguTags).length;
    return tags > 0 || getNumber(vector, "luoguDifficulty") > 0 || getNumber(vector, "luoguPassRate") > 0 || getString(vector, "problemTitle");
  }).length;
  const problemMetadataCoverage = ratio(metadataSignals, Math.max(1, input.vectors.length || problemCount));
  const latestSubmitDate = latestDate([
    ...input.manifestItems.map((item) => getString(item, "submitTime")),
    ...input.timelineItems.map((item) => getString(item, "lastSubmitTime")),
  ]);
  const activeDaysLast30 = activeDays(input.manifestItems.map((item) => getString(item, "submitTime")), 30);
  const recentActivityCoverage = Math.min(1, round(activeDaysLast30 / 12, 2));
  const knowledgeTreeCoverage = arrayOfObjects(input.knowledgeTree.items).length > 0 || arrayOfObjects(input.knowledgeTree.domains).length > 0 ? 1 : 0;
  const weighted = codeCoverage * 0.35 + problemMetadataCoverage * 0.25 + recentActivityCoverage * 0.2 + knowledgeTreeCoverage * 0.1 + Math.min(1, problemCount / 120) * 0.1;
  const overall = weighted >= 0.78 ? "HIGH" : weighted >= 0.5 ? "MEDIUM" : "LOW";
  const limitations = [
    "无法仅凭洛谷公开记录判断是否独立完成或是否看题解",
    ...(problemMetadataCoverage < 0.65 ? ["部分题目缺少标签、难度或 CSP 题位映射"] : []),
    ...(codeCoverage < 0.7 ? ["部分提交缺少源码文件，代码级风险分析覆盖不足"] : []),
    ...(recentActivityCoverage < 0.5 ? ["最近训练活跃度不足，当前水平可能与历史数据有偏差"] : []),
  ];
  return {
    overall,
    score: round(weighted * 100),
    submissionCount,
    problemCount,
    codeFileCount,
    codeCoverage,
    problemMetadataCoverage,
    recentActivityCoverage,
    activeDaysLast30,
    latestSubmitDate,
    canJudgeIndependence: false,
    mainLimitations: limitations,
  };
}

function buildScoreEstimate(config: LocalLoopConfig, quality: JsonObject, slots: JsonObject) {
  const officialLastScore = Number(config.currentScore ?? 104);
  const slotTotal = ["T1", "T2", "T3", "T4"].reduce((sum, slot) => sum + getNumber(slots, `${slot}.estimatedExamScore`), 0);
  const estimatedCurrentScore = clamp(Math.round(officialLastScore * 0.55 + slotTotal * 0.45), 0, Number(config.targetScore ?? 200));
  const confidence = getString(quality, "overall");
  const width = confidence === "HIGH" ? 15 : confidence === "MEDIUM" ? 25 : 40;
  return {
    officialLastScore,
    estimatedCurrentScore,
    range: [Math.max(0, estimatedCurrentScore - width), Math.min(300, estimatedCurrentScore + width)],
    confidence,
    reason: scoreReason(estimatedCurrentScore, slots, quality),
  };
}

function buildSlotReadiness(input: { manifestItems: JsonObject[]; metricItems: JsonObject[]; timelineItems: JsonObject[]; vectors: JsonObject[]; riskProfile: JsonObject }) {
  const totalProblems = input.timelineItems.length || new Set(input.manifestItems.map((item) => getString(item, "problemPid")).filter(Boolean)).size || 1;
  const solvedProblems = input.timelineItems.filter((item) => Boolean(item.solved) || getString(item, "finalResult") === "AC").length;
  const avgAttempts = average(input.timelineItems.map((item) => getNumber(item, "attemptCount")).filter((value) => value > 0));
  const riskCounts = countAllRiskFlags(input.metricItems, input.vectors);
  const vectorRoles = input.vectors.flatMap((vector) => stringArray(vector.cspAbilityRoles));
  const moduleTexts = input.vectors.flatMap((vector) => [getString(vector, "primaryModule"), ...stringArray(vector.codeModules)]).join(" ").toUpperCase();
  const acRate = ratio(solvedProblems, totalProblems);
  const implPenalty = Math.min(35, (riskCounts.ARRAY_INDEX_RISK ?? 0) * 0.4 + (riskCounts.LARGE_GLOBAL_ARRAY ?? 0) * 0.2 + Math.max(0, avgAttempts - 2) * 6);
  const t1 = clamp(Math.round(45 + acRate * 35 + Math.min(20, solvedProblems / 8) - implPenalty), 0, 100);
  const t2Coverage = keywordScore(moduleTexts, ["BINARY", "DP", "GRAPH", "GREEDY", "DSU", "SHORTEST", "SEARCH"]);
  const t2 = clamp(Math.round(30 + t2Coverage * 35 + acRate * 20 - Math.max(0, avgAttempts - 2.5) * 5), 0, 100);
  const partialSignals = input.vectors.filter((vector) => stringArray(vector.cspAbilityRoles).some((role) => role.includes("PARTIAL")) || getString(vector, "scorePattern").includes("PARTIAL") || (getNumber(vector, "bestScore") > 0 && !Boolean(vector.solved))).length;
  const t3 = clamp(Math.round(15 + Math.min(45, partialSignals * 4) + keywordScore(moduleTexts, ["INTERVAL", "TREE", "STATE", "SEGMENT", "PARTIAL"]) * 25), 0, 100);
  const strategySignals = vectorRoles.filter((role) => role.includes("STRATEGY") || role.includes("T4")).length;
  const t4 = clamp(Math.round(5 + Math.min(35, strategySignals * 3)), 0, 100);
  return {
    T1: slotItem(t1, Math.round(t1 * 0.9), "T1 保分能力", t1 >= 80 ? "基本稳定" : t1 >= 55 ? "有基础但不稳定" : "保分能力不足", t1 >= 80 ? ["保持限时和低提交次数"] : ["边界错误", "初始化错误", "提交次数偏多"]),
    T2: slotItem(t2, Math.round(t2 * 0.8), "T2 主得分能力", t2 >= 75 ? "具备主得分潜力" : t2 >= 45 ? "建模入口不稳定" : "T2 证据不足", ["不会从暴力转优化", "复杂度判断不足", "中档题提交次数偏高"]),
    T3: slotItem(t3, Math.round(t3 * 0.55), "T3 部分分能力", t3 >= 60 ? "具备部分分路线" : t3 >= 35 ? "部分分能力待强化" : "部分分能力不足", ["不会拆子任务", "不会写可执行暴力", "难题策略不足"]),
    T4: slotItem(t4, Math.round(t4 * 0.25), "T4 策略分能力", t4 >= 45 ? "可做策略验证" : "暂不作为主攻目标", ["时间分配", "止损策略", "策略分意识不足"]),
  };
}

function slotItem(score: number, estimatedExamScore: number, role: string, status: string, mainRisks: string[]) {
  return { score, estimatedExamScore, role, status, mainRisks };
}

function buildKnowledgeMastery(input: { modules: JsonObject; vectors: JsonObject[]; metricItems: JsonObject[]; timelineItems: JsonObject[] }) {
  const groups = new Map<string, JsonObject[]>();
  for (const vector of input.vectors) {
    const modules = [getString(vector, "primaryModule"), ...stringArray(vector.codeModules)].filter(Boolean);
    const key = normalizeKnowledgeCode(modules[0] || "unknown");
    groups.set(key, [...(groups.get(key) ?? []), vector]);
  }
  if (groups.size === 0) {
    for (const item of input.timelineItems) groups.set("unknown", [...(groups.get("unknown") ?? []), item]);
  }
  return [...groups.entries()].map(([code, items]) => {
    const attempted = items.length;
    const solved = items.filter((item) => Boolean(item.solved) || getString(item, "finalResult") === "AC").length;
    const avgAttempts = average(items.map((item) => getNumber(item, "attemptCount")).filter((value) => value > 0));
    const riskFlags = topEntries(countBy(items.flatMap((item) => stringArray(item.riskFlags))), 5).map(([key]) => key);
    const score = clamp(Math.round(ratio(solved, attempted || 1) * 55 + Math.max(0, 5 - avgAttempts) * 8 + Math.min(15, attempted)), 0, 100);
    return {
      code,
      name: readableKnowledgeName(code),
      score,
      level: masteryLevel(score),
      evidence: { attempted, solved, avgAttempts: round(avgAttempts, 2), riskFlags },
    };
  }).sort((a, b) => a.score - b.score || b.evidence.attempted - a.evidence.attempted);
}

function buildErrorPatterns(input: { metricItems: JsonObject[]; timelineItems: JsonObject[]; vectors: JsonObject[]; weaknessSummary: JsonObject }) {
  const riskCounts = countAllRiskFlags(input.metricItems, input.vectors);
  const avgAttempts = average(input.timelineItems.map((item) => getNumber(item, "attemptCount")).filter((value) => value > 0));
  const stuckProblems = input.timelineItems.filter((item) => getNumber(item, "attemptCount") >= 4 && getString(item, "finalResult") !== "AC" && !Boolean(item.solved)).length;
  const partialProblems = input.timelineItems.filter((item) => getNumber(item, "bestScore") > 0 && getNumber(item, "bestScore") < 100).length;
  const patterns = [];
  if (avgAttempts >= 2.5 || stuckProblems >= 5) patterns.push(pattern("MODEL_ERROR", "建模入口不稳定", 0.72, [`平均提交次数 ${round(avgAttempts, 2)}`, `高卡住题 ${stuckProblems} 道`, "多次提交后仍未通过的题目会影响 T2 主得分区"]));
  if ((riskCounts.ARRAY_INDEX_RISK ?? 0) + (riskCounts.LARGE_GLOBAL_ARRAY ?? 0) + (riskCounts.RECURSION_RISK ?? 0) > 0) patterns.push(pattern("IMPLEMENTATION_RISK", "实现稳定性不足", 0.64, [`静态风险标记：${JSON.stringify(riskCounts)}`, "实现风险会直接影响 T1/T2 保分"]));
  if (partialProblems >= 3) patterns.push(pattern("PARTIAL_SCORE_GAP", "部分分转完整解不足", 0.58, [`部分分相关题 ${partialProblems} 道`, "T3 需要能写 30/50/70 分路线"]));
  if (patterns.length === 0) patterns.push(pattern("INSUFFICIENT_ERROR_SIGNAL", "错因信号不足", 0.35, ["当前公开数据不足以稳定归因，需要训练日志补充是否看题解、卡点阶段和自评"]));
  return patterns.slice(0, 8);
}

function pattern(type: string, name: string, confidence: number, evidence: string[]) {
  return { type, name, confidence, evidence };
}

function buildEvidenceProblems(input: { timelineItems: JsonObject[]; vectors: JsonObject[]; errorPatterns: JsonObject[] }): EvidenceProblem[] {
  const vectorByPid = new Map(input.vectors.map((vector) => [getString(vector, "problemPid"), vector]));
  return input.timelineItems.map((item) => {
    const pid = getString(item, "problemPid");
    const vector = vectorByPid.get(pid) ?? {};
    const attemptCount = getNumber(item, "attemptCount") || getNumber(vector, "attemptCount");
    const finalResult = getString(item, "finalResult") || getString(vector, "finalResult") || (Boolean(item.solved) ? "AC" : "UNKNOWN");
    const bestScore = nullableNumber(item.bestScore ?? vector.bestScore);
    const ability = inferRelatedAbility(vector, item);
    const reason = evidenceReason(attemptCount, finalResult, bestScore, ability);
    return {
      problemPid: pid,
      title: getString(item, "problemTitle") || getString(vector, "problemTitle") || null,
      reason,
      relatedAbility: ability,
      attemptCount,
      finalResult,
      bestScore,
      diagnosis: diagnosisForEvidence(attemptCount, finalResult, bestScore, ability),
    };
  }).filter((item) => item.problemPid).sort((a, b) => evidenceWeight(b) - evidenceWeight(a));
}

function buildCurrentStage(scoreEstimate: JsonObject, slots: JsonObject, errorPatterns: JsonObject[]) {
  const score = getNumber(scoreEstimate, "estimatedCurrentScore");
  const next = [120, 140, 160, 180, 200].find((value) => score < value) ?? 200;
  const start = next === 120 ? 104 : next - 20;
  const blockers = [];
  if (getNumber(slots, "T1.score") < 80) blockers.push("T1 基础题仍有低级错误或稳定性不足");
  if (getNumber(slots, "T2.score") < 60) blockers.push("T2 建模入口不稳定");
  if (next >= 160 && getNumber(slots, "T3.score") < 45) blockers.push("T3 部分分能力不足");
  for (const item of errorPatterns.slice(0, 3)) blockers.push(getString(item, "name"));
  return {
    stage: `${start} → ${next}`,
    currentScore: score,
    nextMilestone: next,
    mainGoal: next <= 120 ? "先修 T1 稳定性，同时建立 T2 入口" : next <= 140 ? "T1 稳住，开始系统训练 T2 建模" : next <= 160 ? "让 T2 成为稳定得分区" : next <= 180 ? "训练 T3 部分分路线" : "模拟赛验证并冲刺 200",
    blockingIssues: unique(blockers),
  };
}

function buildTrainingRecommendation(stage: JsonObject, mastery: JsonObject[], errors: JsonObject[], quality: JsonObject) {
  const weak = mastery.filter((item) => getNumber(item, "score") < 65).slice(0, 5);
  return {
    dailyTaskCount: 3,
    dynamicTaskRange: [2, 4],
    mix: { foundation: 1, weakness: 1, reviewOrTransfer: 1 },
    firstWeekFocus: unique([
      "T1 保分题",
      getString(stage, "nextMilestone") === "120" ? "T2 建模入口" : "当前最大短板",
      "失败题重做",
      ...weak.slice(0, 3).map((item) => getString(item, "name")),
    ]),
    parentFocus: ["监督是否看题解", "监督是否记录用时", "监督是否完成重做", "不要只看 AC，要看是否独立完成"],
    dataWarning: getString(quality, "overall") === "LOW" ? "当前数据质量偏低，建议先补齐源码、题目元数据和训练记录后再强判断。" : null,
    basedOnEvidence: true,
  };
}

function buildAnalysisQualityReport(input: { sourceQuality: JsonObject; manifest: JsonObject; metrics: JsonObject; timeline: JsonObject; vectorsFile: JsonObject; knowledgeTree: JsonObject }) {
  const requiredFiles = {
    submission_manifest: Object.keys(input.manifest).length > 0,
    code_static_metrics: Object.keys(input.metrics).length > 0,
    problem_code_timeline: Object.keys(input.timeline).length > 0,
    problem_feature_vectors: Object.keys(input.vectorsFile).length > 0,
    knowledge_ability_tree: Object.keys(input.knowledgeTree).length > 0,
  };
  return {
    generatedAt: new Date().toISOString(),
    dataQuality: {
      overall: getString(input.sourceQuality, "overall"),
      score: getNumber(input.sourceQuality, "score"),
      checks: requiredFiles,
      mainLimitations: input.sourceQuality.mainLimitations,
    },
    passCriteria: [
      { criterion: "提交记录可读", passed: requiredFiles.submission_manifest },
      { criterion: "源码静态分析可读", passed: requiredFiles.code_static_metrics },
      { criterion: "题目提交轨迹可读", passed: requiredFiles.problem_code_timeline },
      { criterion: "题目级特征向量可读", passed: requiredFiles.problem_feature_vectors },
      { criterion: "题目元数据覆盖 >= 0.65", passed: getNumber(input.sourceQuality, "problemMetadataCoverage") >= 0.65 },
      { criterion: "源码覆盖 >= 0.70", passed: getNumber(input.sourceQuality, "codeCoverage") >= 0.7 },
    ],
  };
}

function renderStudentAnalysisMarkdown(report: JsonObject) {
  const quality = asRecord(report.sourceQuality);
  const score = asRecord(report.scoreEstimate);
  const slots = asRecord(report.slotReadiness);
  const stage = asRecord(report.currentStage);
  const rec = asRecord(report.trainingRecommendation);
  return [
    "# CSP-S 200 学生分析报告",
    "",
    `生成时间：${getString(report, "generatedAt")}`,
    `目标分：${getNumber(asRecord(report.target), "targetScore")}`,
    "",
    "## 1. 数据质量",
    "",
    `- 等级：${getString(quality, "overall")}`,
    `- 分数：${getNumber(quality, "score")}`,
    `- 提交数：${getNumber(quality, "submissionCount")}`,
    `- 题目数：${getNumber(quality, "problemCount")}`,
    `- 源码覆盖：${Math.round(getNumber(quality, "codeCoverage") * 100)}%`,
    `- 题目元数据覆盖：${Math.round(getNumber(quality, "problemMetadataCoverage") * 100)}%`,
    "",
    "## 2. 当前分数估计",
    "",
    `- 去年/手动输入分：${getNumber(score, "officialLastScore")}`,
    `- 当前训练代理分：${getNumber(score, "estimatedCurrentScore")}`,
    `- 置信度：${getString(score, "confidence")}`,
    `- 解释：${getString(score, "reason")}`,
    "",
    "## 3. T1/T2/T3/T4",
    "",
    ...["T1", "T2", "T3", "T4"].flatMap((slot) => {
      const item = asRecord(slots[slot]);
      return [`### ${slot}`, `- 得分能力：${getNumber(item, "score")}`, `- 估计考试得分：${getNumber(item, "estimatedExamScore")}`, `- 状态：${getString(item, "status")}`, `- 风险：${asArray(item.mainRisks).join("、")}`, ""];
    }),
    "## 4. 薄弱知识点 Top 10",
    "",
    ...arrayOfObjects(report.knowledgeMastery).slice(0, 10).map((item) => `- ${getString(item, "name")}：${getNumber(item, "score")}，${getString(item, "level")}`),
    "",
    "## 5. 主要错因",
    "",
    ...arrayOfObjects(report.errorPatterns).map((item) => `- ${getString(item, "name")}（${getString(item, "type")}）：${asArray(item.evidence).join("；")}`),
    "",
    "## 6. 证据题目",
    "",
    ...arrayOfObjects(report.evidenceProblems).slice(0, 8).map((item) => `- ${getString(item, "problemPid")} ${getString(item, "title")}：${getString(item, "diagnosis")}`),
    "",
    "## 7. 当前阶段",
    "",
    `- 阶段：${getString(stage, "stage")}`,
    `- 目标：${getString(stage, "mainGoal")}`,
    `- 阻塞问题：${asArray(stage.blockingIssues).join("；")}`,
    "",
    "## 8. 下一步训练建议",
    "",
    `- 每日题量：${getNumber(rec, "dailyTaskCount")}，动态范围 ${asArray(rec.dynamicTaskRange).join("-")} 题`,
    `- 题目组合：保分题 ${getNumber(asRecord(rec.mix), "foundation")}，短板题 ${getNumber(asRecord(rec.mix), "weakness")}，复盘/迁移题 ${getNumber(asRecord(rec.mix), "reviewOrTransfer")}`,
    `- 第一周重点：${asArray(rec.firstWeekFocus).join("、")}`,
    `- 家长监督：${asArray(rec.parentFocus).join("、")}`,
    "",
    "说明：本报告由规则证据聚合生成，大模型只能用于解释证据，不能直接编造结论、题解或提分承诺。",
    "",
  ].join("\n");
}

function scoreReason(score: number, slots: JsonObject, quality: JsonObject) {
  if (getString(quality, "overall") === "LOW") return "数据质量偏低，当前分数只能作为粗略训练代理分。";
  if (score < 120) return "当前应优先修复 T1 稳定性，并建立 T2 开题入口。";
  if (score < 140) return "T1 有基础，但 T2 建模和中档题稳定性仍是主要增量来源。";
  if (score < 160) return "已进入 T2 主攻阶段，需要让中档题形成稳定得分。";
  if (score < 180) return "需要训练 T3 部分分路线，并用模拟赛验证迁移。";
  return "接近 200 分训练区，重点是模拟赛稳定性和低级错误控制。";
}

function normalizeKnowledgeCode(raw: string) {
  const text = raw.toUpperCase();
  if (text.includes("DP")) return "dp";
  if (text.includes("GRAPH") || text.includes("BFS") || text.includes("DFS") || text.includes("SHORTEST")) return "graph";
  if (text.includes("BINARY")) return "binary_search";
  if (text.includes("GREEDY")) return "greedy";
  if (text.includes("IMPLEMENT") || text.includes("BASIC") || text.includes("SIMULATION")) return "implementation";
  if (text.includes("DATA_STRUCTURE") || text.includes("DSU") || text.includes("SEGMENT")) return "data_structure";
  if (text.includes("MATH")) return "math";
  if (text.includes("STRING")) return "string";
  if (text.includes("PARTIAL")) return "partial_score";
  return raw || "unknown";
}

function readableKnowledgeName(code: string) {
  const names: Record<string, string> = {
    implementation: "模拟与实现",
    dp: "动态规划",
    graph: "图论",
    binary_search: "二分",
    greedy: "贪心",
    data_structure: "数据结构",
    math: "数学",
    string: "字符串",
    partial_score: "部分分策略",
    unknown: "未知模块",
  };
  return names[code] ?? code;
}

function masteryLevel(score: number) {
  if (score >= 80) return "稳定掌握";
  if (score >= 65) return "基本掌握";
  if (score >= 45) return "练习中";
  if (score > 0) return "明显薄弱";
  return "暂无证据";
}

function inferRelatedAbility(vector: JsonObject, item: JsonObject) {
  const roles = stringArray(vector.cspAbilityRoles);
  if (roles.includes("T1") || roles.some((role) => role.includes("STABLE"))) return "T1_STABILITY";
  if (roles.includes("T2") || roles.some((role) => role.includes("MODELING"))) return "T2_MODELING";
  if (roles.includes("T3") || roles.some((role) => role.includes("PARTIAL"))) return "T3_PARTIAL_SCORE";
  if (roles.includes("T4") || roles.some((role) => role.includes("STRATEGY"))) return "T4_STRATEGY";
  const module = normalizeKnowledgeCode(getString(vector, "primaryModule"));
  if (["implementation"].includes(module)) return "T1_STABILITY";
  if (["dp", "graph", "binary_search", "greedy", "data_structure"].includes(module)) return "T2_MODELING";
  return getString(item, "finalResult") === "AC" ? "POSITIVE_EVIDENCE" : "GENERAL_WEAKNESS";
}

function evidenceReason(attempts: number, result: string, bestScore: number | null, ability: string) {
  if (result !== "AC" && attempts >= 4) return `多次提交后仍未 AC，暴露 ${ability} 问题`;
  if (bestScore !== null && bestScore > 0 && bestScore < 100) return `存在部分分但未完成，适合作为 ${ability} 证据`;
  if (result === "AC" && attempts >= 4) return `最终 AC 但提交次数偏多，说明 ${ability} 稳定性不足`;
  return `可作为 ${ability} 的训练证据`;
}

function diagnosisForEvidence(attempts: number, result: string, bestScore: number | null, ability: string) {
  if (result !== "AC" && attempts >= 4) return "不能简单归为粗心，更像是模型、复杂度或实现流程没有稳定。";
  if (bestScore !== null && bestScore > 0 && bestScore < 100) return "已有部分得分能力，但需要训练从部分分到更高分的迁移。";
  if (result === "AC" && attempts >= 4) return "虽然最终通过，但不能算稳定掌握，需要降低提交次数。";
  return "这是正向证据，但仍需结合是否独立完成判断。";
}

function evidenceWeight(item: EvidenceProblem) {
  return item.attemptCount * 5 + (item.finalResult === "AC" ? 0 : 30) + (item.bestScore && item.bestScore > 0 && item.bestScore < 100 ? 15 : 0);
}

function countAllRiskFlags(metrics: JsonObject[], vectors: JsonObject[]) {
  return countBy([...metrics.flatMap((item) => stringArray(item.riskFlags)), ...vectors.flatMap((item) => stringArray(item.riskFlags))]);
}

function keywordScore(text: string, keywords: string[]) {
  const count = keywords.filter((keyword) => text.includes(keyword)).length;
  return Math.min(1, count / Math.max(1, keywords.length));
}

async function loadConfig(): Promise<LocalLoopConfig> {
  const configPath = await exists(CONFIG_PATH) ? CONFIG_PATH : EXAMPLE_CONFIG_PATH;
  return readJsonIfExists<LocalLoopConfig>(configPath, { currentScore: 104, targetScore: 200, analysisDir: "data/analysis", diagnosisDir: "data/diagnosis", benchmarkDir: "data/csp-s-benchmark" });
}

function applyOverrides(config: LocalLoopConfig, input: Record<string, string>) {
  for (const [key, value] of Object.entries(input)) {
    if (key === "action") continue;
    const current = (config as JsonObject)[key];
    (config as JsonObject)[key] = typeof current === "number" ? Number(value) : value;
  }
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

async function exists(filePath: string) {
  try { await fs.access(path.resolve(filePath)); return true; } catch { return false; }
}
async function ensureDir(dir: string) { await fs.mkdir(path.resolve(dir), { recursive: true }); }
async function readJson<T>(filePath: string): Promise<T> { return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8")) as T; }
async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> { return await exists(filePath) ? readJson<T>(filePath) : fallback; }
async function writeJson(filePath: string, value: unknown) { await ensureDir(path.dirname(filePath)); await fs.writeFile(path.resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function asArray(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function asRecord(value: unknown): JsonObject { return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }
function arrayOfObjects(value: unknown): JsonObject[] { return asArray(value).map(asRecord).filter((item) => Object.keys(item).length > 0); }
function stringArray(value: unknown): string[] { return asArray(value).filter((item): item is string => typeof item === "string" && item.length > 0); }
function getString(value: unknown, key?: string): string { const source = key ? getPath(value, key) : value; if (typeof source === "string") return source; if (typeof source === "number" || typeof source === "bigint") return String(source); return ""; }
function getNumber(value: unknown, key?: string): number { const source = key ? getPath(value, key) : value; if (typeof source === "number" && Number.isFinite(source)) return source; if (typeof source === "string" && source.trim() && Number.isFinite(Number(source))) return Number(source); return 0; }
function getPath(value: unknown, pathText: string): unknown { return pathText.split(".").reduce((current, key) => asRecord(current)[key], value); }
function nullableNumber(value: unknown): number | null { const number = getNumber(value); return Number.isFinite(number) && number !== 0 ? number : null; }
function ratio(a: number, b: number) { return b <= 0 ? 0 : round(Math.max(0, Math.min(1, a / b)), 2); }
function round(value: number, digits = 0) { const base = 10 ** digits; return Math.round(value * base) / base; }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function average(values: number[]) { const list = values.filter((value) => Number.isFinite(value)); return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0; }
function countBy(values: string[]) { const output: Record<string, number> = {}; for (const value of values) output[value] = (output[value] ?? 0) + 1; return output; }
function topEntries(record: Record<string, number>, limit: number) { return Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, limit); }
function unique<T>(values: T[]) { return [...new Set(values.filter(Boolean))]; }
function latestDate(values: string[]) { const times = values.map((value) => Date.parse(value)).filter(Number.isFinite); return times.length ? new Date(Math.max(...times)).toISOString() : null; }
function activeDays(values: string[], days: number) { const cutoff = Date.now() - days * 86_400_000; return new Set(values.map((value) => Date.parse(value)).filter((time) => Number.isFinite(time) && time >= cutoff).map((time) => new Date(time).toISOString().slice(0, 10))).size; }
function relative(filePath: string) { return path.relative(ROOT, path.resolve(filePath)) || "."; }
