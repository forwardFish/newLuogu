import { prisma } from "@/src/lib/prisma";
import { asArray, asRecord } from "@/src/lib/json";
import { FeatureExtractorService } from "@/src/server/features/feature-extractor-service";
import { DataQualityService } from "@/src/server/quality/data-quality-service";
import { KNOWLEDGE_NODES } from "@/src/server/knowledge/knowledge-seed";
import { ScoringService, type FeatureJson } from "./scoring-service";
import { WeaknessDetectionService, type Weakness } from "./weakness-detection-service";

type AnalysisTarget = "CSP-S_FIRST_PRIZE";
type Slot = "T1" | "T2" | "T3" | "T4";

type ErrorPattern = {
  type: string;
  name: string;
  confidence: number;
  evidence: string[];
  relatedModules: string[];
};

type SlotReadinessItem = {
  score: number;
  estimatedExamScore: number;
  status: string;
  mainRisks: string[];
};

const KNOWLEDGE_NAME = new Map(KNOWLEDGE_NODES.map((node) => [node.code, node.name]));

export class StudentAnalysisV2Service {
  async generate(input: { subjectId: bigint; syncJobId?: bigint; target?: AnalysisTarget }) {
    const target = input.target ?? "CSP-S_FIRST_PRIZE";
    const subject = await prisma.analyzedSubject.findUniqueOrThrow({ where: { id: input.subjectId } });
    const dataQuality =
      (await new DataQualityService().latest(input.subjectId)) ??
      (await new DataQualityService().generate(input.subjectId, input.syncJobId));
    const featureSnapshot = await new FeatureExtractorService().generate({
      subjectId: input.subjectId,
      syncJobId: input.syncJobId,
      target,
      dataQualityReportId: dataQuality.id
    });
    const feature = featureSnapshot.featureJson as unknown as FeatureJson;
    const looseFeature = asRecord(featureSnapshot.featureJson);
    const scoring = new ScoringService().score(feature);
    const weaknesses = new WeaknessDetectionService().detect(feature);
    const [profile, knowledgeStats, attemptStats] = await Promise.all([
      prisma.luoguProfile.findUnique({ where: { subjectId: input.subjectId } }),
      prisma.subjectKnowledgeStat.findMany({ where: { subjectId: input.subjectId }, orderBy: [{ score: "asc" }, { solvedProblemCount: "asc" }] }),
      prisma.problemAttemptStat.findMany({
        where: { subjectId: input.subjectId },
        include: { problem: true },
        orderBy: [{ lastSubmitTime: "desc" }, { totalAttempts: "desc" }],
        take: 300
      })
    ]);
    const errorPatterns = buildErrorPatterns(feature, attemptStats);
    const slotReadiness = buildSlotReadiness(feature, errorPatterns, weaknesses);
    const scoreEstimate = estimateScore(feature, dataQuality.overallScore, slotReadiness);
    const knowledgeMastery = knowledgeStats.map((stat: (typeof knowledgeStats)[number]) => ({
      code: stat.knowledgeCode,
      name: knowledgeName(stat.knowledgeCode),
      score: stat.score,
      level: masteryLevel(stat.score),
      evidence: {
        solvedProblemCount: stat.solvedProblemCount,
        attemptedProblemCount: stat.attemptedProblemCount,
        acRate: round(Number(stat.acRate ?? 0), 2),
        avgAttemptsToAc: stat.avgAttemptsToAc === null ? null : round(Number(stat.avgAttemptsToAc), 2),
        maxDifficulty: stat.maxDifficulty ?? 0,
        avgDifficulty: stat.avgDifficulty === null ? null : round(Number(stat.avgDifficulty), 2),
        recent30dAttempts: stat.recent30dAttempts
      }
    }));
    const evidenceProblems = await selectEvidenceProblems(input.subjectId, attemptStats, weaknesses);
    const currentStage = inferCurrentStage(scoreEstimate.estimatedScore, slotReadiness, weaknesses);
    const trainingRecommendation = buildTrainingRecommendation({
      currentStage,
      slotReadiness,
      knowledgeMastery,
      errorPatterns,
      weaknesses
    });
    return {
      version: "student-analysis-v2.0.0",
      generatedAt: new Date().toISOString(),
      subject: {
        subjectId: subject.id,
        luoguUid: subject.luoguUid,
        displayName: subject.displayName,
        username: profile?.username ?? null,
        rating: profile?.rating ?? null,
        target: subject.target
      },
      dataQuality: {
        overallScore: dataQuality.overallScore,
        confidenceLevel: dataQuality.confidenceLevel,
        issueJson: dataQuality.issueJson,
        summary: dataQuality.summary,
        recordDepth: {
          totalSubmissions: numberAt(looseFeature, ["dataSummary", "totalSubmissions"]),
          attemptedProblemCount: numberAt(looseFeature, ["dataSummary", "totalAttemptedProblems"]),
          solvedProblemCount: numberAt(looseFeature, ["dataSummary", "totalSolvedProblems"]),
          problemsWithDetail: numberAt(looseFeature, ["dataSummary", "totalProblemsWithDetail"])
        },
        freshness: {
          firstSubmitTime: stringAt(looseFeature, ["dataSummary", "firstSubmitTime"]),
          lastSubmitTime: stringAt(looseFeature, ["dataSummary", "lastSubmitTime"]),
          activeDaysLast30: numberAt(looseFeature, ["activityFeatures", "activeDaysLast30"]),
          submissionsLast30: numberAt(looseFeature, ["activityFeatures", "submissionsLast30"])
        },
        limitations: buildLimitations(dataQuality.overallScore)
      },
      scoreEstimate,
      slotReadiness,
      knowledgeMastery,
      errorPatterns,
      evidenceProblems,
      currentStage,
      trainingRecommendation,
      debug: {
        featureSnapshotId: featureSnapshot.id,
        baselineAbilityScores: scoring.abilityScores,
        baselineTotalScore: scoring.totalScore,
        analysisConfidence: scoring.analysisConfidence
      }
    };
  }
}

function estimateScore(feature: FeatureJson, dataQualityScore: number, slotReadiness: Record<Slot, SlotReadinessItem>) {
  const estimatedScore = clamp(
    slotReadiness.T1.estimatedExamScore +
      slotReadiness.T2.estimatedExamScore +
      slotReadiness.T3.estimatedExamScore +
      slotReadiness.T4.estimatedExamScore,
    0,
    300
  );
  const confidence = round(clamp(dataQualityScore / 100, 0.25, 0.95), 2);
  const width = confidence >= 0.8 ? 18 : confidence >= 0.6 ? 30 : 45;
  return {
    estimatedScore,
    range: [clamp(estimatedScore - width, 0, 300), clamp(estimatedScore + width, 0, 300)] as [number, number],
    confidence,
    level: stageLabel(estimatedScore),
    explanation: scoreExplanation(estimatedScore, feature)
  };
}

function buildSlotReadiness(feature: FeatureJson, errorPatterns: ErrorPattern[], weaknesses: Weakness[]): Record<Slot, SlotReadinessItem> {
  const readiness = feature.cspReadinessFeatures;
  const implementationRisk = hasPattern(errorPatterns, "IMPLEMENTATION_RISK") || weaknesses.some((w) => w.module === "implementation");
  const complexityRisk = hasPattern(errorPatterns, "COMPLEXITY_ERROR") || weaknesses.some((w) => w.module === "complexity");
  return {
    T1: {
      score: readiness.t1StabilityScore,
      estimatedExamScore: clamp(Math.round(readiness.t1StabilityScore * 0.95 - (implementationRisk ? 8 : 0)), 0, 100),
      status: readiness.t1StabilityScore >= 80 ? "T1 基本稳定" : readiness.t1StabilityScore >= 55 ? "T1 有基础但稳定性不足" : "T1 保分能力不足",
      mainRisks: compact([implementationRisk ? "边界/实现错误" : null, "读题遗漏", "提交前检查不足"])
    },
    T2: {
      score: readiness.t2SolvingScore,
      estimatedExamScore: clamp(Math.round(readiness.t2SolvingScore * 0.9 - (complexityRisk ? 5 : 0)), 0, 95),
      status: readiness.t2SolvingScore >= 75 ? "T2 有主得分能力" : readiness.t2SolvingScore >= 45 ? "T2 有突破机会但建模不稳定" : "T2 暂未形成稳定得分区",
      mainRisks: compact(["二分/DP/图建模", complexityRisk ? "复杂度判断" : null, "从暴力到正解的迁移"])
    },
    T3: {
      score: readiness.t3PartialScore,
      estimatedExamScore: clamp(Math.round(readiness.t3PartialScore * 0.7), 0, 75),
      status: readiness.t3PartialScore >= 65 ? "T3 具备部分分策略" : readiness.t3PartialScore >= 35 ? "T3 可训练 30/50 分路线" : "T3 目前主要缺少部分分拆解",
      mainRisks: ["状态设计", "部分分拆解", "复杂度优化"]
    },
    T4: {
      score: readiness.t4StrategyScore,
      estimatedExamScore: clamp(Math.round(readiness.t4StrategyScore * 0.3), 0, 30),
      status: readiness.t4StrategyScore >= 50 ? "T4 可争取策略分" : "T4 暂不作为主攻目标",
      mainRisks: ["时间分配", "特殊性质分", "不影响 T1/T2 的取舍策略"]
    }
  };
}

function buildErrorPatterns(
  feature: FeatureJson,
  attemptStats: Array<{ totalAttempts: number; isAc: boolean; bestScore: number | null; mainErrorType: string | null }>
): ErrorPattern[] {
  const patterns: ErrorPattern[] = [];
  const result = feature.resultFeatures;
  const hardStuckCount = attemptStats.filter((item) => (item.totalAttempts >= 5 && !item.isAc) || item.totalAttempts >= 8).length;
  const partialStuckCount = attemptStats.filter((item) => !item.isAc && (item.bestScore ?? 0) > 0).length;
  const avgAttemptsToAc = feature.attemptFeatures.avgAttemptsToAc;
  if (result.tleRate >= 0.12) {
    patterns.push({
      type: "COMPLEXITY_ERROR",
      name: "复杂度判断不足",
      confidence: round(Math.min(0.9, 0.45 + result.tleRate * 2), 2),
      evidence: [`TLE 比例 ${Math.round(result.tleRate * 100)}%`, `卡住题数量 ${hardStuckCount}`],
      relatedModules: ["complexity", "dp", "graph"]
    });
  }
  if (result.reRate + result.ceRate >= 0.08) {
    patterns.push({
      type: "IMPLEMENTATION_RISK",
      name: "实现稳定性不足",
      confidence: round(Math.min(0.88, 0.4 + (result.reRate + result.ceRate) * 2), 2),
      evidence: [`RE+CE 比例 ${Math.round((result.reRate + result.ceRate) * 100)}%`, `平均 AC 前提交 ${round(avgAttemptsToAc, 1)} 次`],
      relatedModules: ["implementation"]
    });
  }
  if (hardStuckCount >= 5) {
    patterns.push({
      type: "MODEL_OR_KNOWLEDGE_GAP",
      name: "模型或知识点断层",
      confidence: round(Math.min(0.85, 0.45 + hardStuckCount / 50), 2),
      evidence: [`高卡住题 ${hardStuckCount} 道`, `部分分卡住题 ${partialStuckCount} 道`],
      relatedModules: ["dp", "graph", "data_structure"]
    });
  }
  if (avgAttemptsToAc >= 3) {
    patterns.push({
      type: "DEBUG_EFFICIENCY",
      name: "调试和一次通过能力不足",
      confidence: round(Math.min(0.82, 0.35 + avgAttemptsToAc / 10), 2),
      evidence: [`AC 题平均提交 ${round(avgAttemptsToAc, 1)} 次`, `一遍 AC 率 ${Math.round(feature.attemptFeatures.oneShotAcRate * 100)}%`],
      relatedModules: ["implementation", "review"]
    });
  }
  if (patterns.length === 0) {
    patterns.push({
      type: "INSUFFICIENT_ERROR_SIGNAL",
      name: "公开数据中的错因信号不足",
      confidence: 0.35,
      evidence: ["需要每日训练反馈补充是否看提示、是否独立完成、具体错因"],
      relatedModules: ["manual_review"]
    });
  }
  return patterns.slice(0, 6);
}

async function selectEvidenceProblems(
  subjectId: bigint,
  attemptStats: Array<{ problemId: bigint | null; problemPid: string; totalAttempts: number; isAc: boolean; bestScore: number | null; mainErrorType: string | null; problem?: { title: string | null; difficulty: number | null; difficultyName: string | null } | null }>,
  weaknesses: Weakness[]
) {
  const candidates = attemptStats
    .map((stat) => ({
      stat,
      score: (stat.totalAttempts >= 5 ? 30 : stat.totalAttempts * 4) + (!stat.isAc ? 25 : 0) + ((stat.bestScore ?? 0) > 0 && !stat.isAc ? 15 : 0) + ((stat.problem?.difficulty ?? 0) * 4)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  const problemIds = candidates.map((item) => item.stat.problemId).filter((id): id is bigint => id !== null);
  const maps = problemIds.length
    ? await prisma.problemKnowledgeMap.findMany({ where: { problemId: { in: problemIds } } })
    : [];
  const moduleByProblem = new Map<bigint, string[]>();
  for (const map of maps) {
    const current = moduleByProblem.get(map.problemId) ?? [];
    current.push(map.knowledgeCode);
    moduleByProblem.set(map.problemId, current);
  }
  return candidates.slice(0, 8).map(({ stat }) => {
    const modules = stat.problemId ? moduleByProblem.get(stat.problemId) ?? [] : [];
    const module = modules[0] ?? weaknesses[0]?.module ?? "unknown";
    return {
      problemPid: stat.problemPid,
      title: stat.problem?.title ?? null,
      difficulty: stat.problem?.difficulty ?? null,
      difficultyName: stat.problem?.difficultyName ?? null,
      module,
      moduleName: knowledgeName(module),
      attemptCount: stat.totalAttempts,
      finalResult: stat.isAc ? "AC" : stat.bestScore && stat.bestScore > 0 ? "PARTIAL" : stat.mainErrorType ?? "UNKNOWN",
      bestScore: stat.bestScore,
      diagnosis: evidenceDiagnosis(stat.totalAttempts, stat.isAc, stat.bestScore, module)
    };
  });
}

function inferCurrentStage(score: number, slots: Record<Slot, SlotReadinessItem>, weaknesses: Weakness[]) {
  const nextMilestone = [50, 100, 150, 200, 250, 300].find((item) => item > score) ?? 300;
  const previous = nextMilestone === 50 ? 0 : nextMilestone - 50;
  const blockingIssues = compact([
    slots.T1.estimatedExamScore < Math.min(80, nextMilestone * 0.45) ? "T1 稳定性不足" : null,
    nextMilestone >= 150 && slots.T2.estimatedExamScore < 45 ? "T2 建模能力不足" : null,
    nextMilestone >= 200 && slots.T3.estimatedExamScore < 25 ? "T3 部分分拆解不足" : null,
    ...weaknesses.slice(0, 3).map((item) => item.name)
  ]);
  return {
    stage: `${previous} → ${nextMilestone}`,
    currentScore: score,
    nextMilestone,
    stageGoal: stageGoal(nextMilestone),
    canMoveToNextStage: blockingIssues.length === 0,
    blockingIssues
  };
}

function buildTrainingRecommendation(input: {
  currentStage: ReturnType<typeof inferCurrentStage>;
  slotReadiness: Record<Slot, SlotReadinessItem>;
  knowledgeMastery: Array<{ code: string; name: string; score: number }>;
  errorPatterns: ErrorPattern[];
  weaknesses: Weakness[];
}) {
  const weakKnowledge = input.knowledgeMastery.filter((item) => item.score < 65).slice(0, 5);
  const priorityCodes = Array.from(new Set([
    ...input.weaknesses.map((item) => item.module),
    ...weakKnowledge.map((item) => item.code),
    ...input.errorPatterns.flatMap((item) => item.relatedModules)
  ])).slice(0, 6);
  return {
    priority: priorityCodes.map((code) => ({ code, name: knowledgeName(code) })),
    dailyPlanSuggestion: {
      problemCount: 3,
      mix: { foundation: 1, weakness: 1, reviewOrTransfer: 1 },
      note: "训练任务必须绑定本分析报告中的证据题和薄弱模块。"
    },
    firstWeekGoal: firstWeekGoal(input.currentStage.nextMilestone, input.slotReadiness),
    guardrails: [
      "不承诺必拿一等奖，只给基于公开数据的阶段判断。",
      "如果用户手填当前分与系统估算差距超过 40 分，建议做一次限时模拟校准。",
      "公开数据无法判断是否独立完成，训练反馈必须记录是否看提示/题解。"
    ]
  };
}

function buildLimitations(score: number) {
  const base = ["无法判断是否独立完成", "无法判断是否看题解", "无法还原比赛临场时间分配"];
  if (score < 70) base.push("公开提交记录或题目标签覆盖不足，结论需要训练反馈校准");
  return base;
}

function evidenceDiagnosis(attempts: number, isAc: boolean, bestScore: number | null, module: string) {
  if (!isAc && (bestScore ?? 0) > 0) return `在 ${knowledgeName(module)} 上有部分分但未完成，说明需要训练部分分到完整解的迁移。`;
  if (!isAc) return `多次尝试仍未 AC，说明 ${knowledgeName(module)} 可能存在知识点或建模断层。`;
  if (attempts >= 5) return `最终 AC 但提交次数较多，说明 ${knowledgeName(module)} 的一次通过和调试效率不足。`;
  return `该题可作为 ${knowledgeName(module)} 能力的正向证据。`;
}

function scoreExplanation(score: number, feature: FeatureJson) {
  if (score < 100) return "当前主要任务是把 T1 保分能力建立起来，减少实现和边界错误。";
  if (score < 150) return "T1 有一定基础，但 T2 建模、基础 DP 或二分稳定性还不足。";
  if (score < 200) return "已经进入 T2 主攻阶段，需要把中档题得分稳定下来。";
  if (score < 250) return "T1/T2 具备基础，需要训练 T3 的部分分拆解和综合建模。";
  return feature.resultFeatures.tleRate > 0.1 ? "接近高分段，但复杂度和比赛策略仍是主要风险。" : "已接近高分段，重点应转向模拟赛稳定性和策略分。";
}

function firstWeekGoal(nextMilestone: number, slots: Record<Slot, SlotReadinessItem>) {
  if (nextMilestone <= 100) return "第一周先把 T1 保分题做稳，目标是减少边界和实现错误。";
  if (nextMilestone <= 150) return "第一周保持 T1 稳定，同时用二分、基础 DP、搜索训练 T2 入口。";
  if (nextMilestone <= 200) return "第一周主攻 T2 模型题，要求每题写出暴力、优化思路和复杂度。";
  if (nextMilestone <= 250) return "第一周训练 T3 30/50 分路线，不追求直接满分。";
  return slots.T1.estimatedExamScore < 90 ? "先校准 T1/T2 稳定性，再进入高分模拟赛。" : "第一周加入限时模拟和 T4 特殊性质分策略。";
}

function stageGoal(nextMilestone: number) {
  if (nextMilestone <= 100) return "建立 T1 保分能力。";
  if (nextMilestone <= 150) return "T1 稳定，T2 开始形成得分入口。";
  if (nextMilestone <= 200) return "T2 成为主得分区。";
  if (nextMilestone <= 250) return "T3 能稳定拿部分分。";
  return "T1/T2 高稳定，T3/T4 通过策略拿分。";
}

function hasPattern(patterns: ErrorPattern[], type: string) {
  return patterns.some((item) => item.type === type && item.confidence >= 0.5);
}

function masteryLevel(score: number) {
  if (score >= 80) return "稳定掌握";
  if (score >= 65) return "基本掌握";
  if (score >= 45) return "练习中";
  if (score > 0) return "明显薄弱";
  return "暂无证据";
}

function stageLabel(score: number) {
  if (score < 50) return "0-50阶段";
  if (score < 100) return "50-100阶段";
  if (score < 150) return "100-150阶段";
  if (score < 200) return "150-200阶段";
  if (score < 250) return "200-250阶段";
  return "250-300阶段";
}

function knowledgeName(code: string) {
  const normalized = code === "partial_score" ? "部分分策略" : code;
  return KNOWLEDGE_NAME.get(normalized) ?? normalized;
}

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter((item): item is T => Boolean(item));
}

function numberAt(obj: Record<string, unknown>, path: string[]) {
  let current: unknown = obj;
  for (const key of path) current = asRecord(current)[key];
  return typeof current === "number" && Number.isFinite(current) ? current : 0;
}

function stringAt(obj: Record<string, unknown>, path: string[]) {
  let current: unknown = obj;
  for (const key of path) current = asRecord(current)[key];
  return typeof current === "string" ? current : null;
}

function round(value: number, digits = 0) {
  const base = 10 ** digits;
  return Math.round(value * base) / base;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
