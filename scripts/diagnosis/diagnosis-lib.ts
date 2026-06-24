import { promises as fs } from "fs";
import path from "path";
import {
  callDeepSeekClusterDiagnosis,
  DeepSeekTrace,
  resolveDeepSeekDiagnosisConfig,
} from "./deepseek-diagnosis-client";

type JsonObject = Record<string, unknown>;

export type DiagnosisOptions = {
  analysisDir: string;
  diagnosisDir: string;
};

type Attempt = {
  filePath: string;
  recordId: string | null;
  result: string;
  score: number | null;
  submitTime: string | null;
  nonEmptyLineCount: number;
  maxBraceDepth: number;
  riskFlags: string[];
};

type TimelineProblem = {
  problemPid: string;
  problemTitle: string | null;
  attemptCount: number;
  acCount: number;
  firstSubmitTime: string | null;
  lastSubmitTime: string | null;
  bestScore: number | null;
  solved: boolean;
  finalResult: string;
  finalScore: number | null;
  tags: string[];
  attempts: Attempt[];
};

type FeatureVector = {
  problemPid: string;
  problemTitle: string | null;
  attemptCount: number;
  solved: boolean;
  bestScore: number | null;
  finalResult: string;
  scoreTrajectory: number[];
  scorePattern: string;
  resultPattern: string;
  firstSubmitTime: string | null;
  lastSubmitTime: string | null;
  isRecent: boolean;
  luoguTags: string[];
  luoguDifficulty: string | null;
  luoguPassRate: number | null;
  codeModules: string[];
  primaryModule: string;
  riskFlags: string[];
  staticMetrics: {
    maxLineCount: number;
    maxBraceDepth: number;
    maxLoopDepth: number;
    hasGlobalArray: boolean;
    usesRecursion: boolean;
  };
  versionDelta: {
    versionCount: number;
    lineCountChange: string;
    riskAdded: string[];
    riskRemoved: string[];
    featureAdded: string[];
    changePattern: string;
  };
  candidateErrorTypes: string[];
  cspAbilityRoles: string[];
  difficultyBand: string;
};

type PatternTags = {
  problemPid: string;
  tags: string[];
  primaryModule: string;
  mainErrorType: string;
  cspAbilityRoles: string[];
};

type ProblemCluster = {
  clusterId: string;
  clusterKey: string;
  clusterName: string;
  primaryModule: string;
  cspRoles: string[];
  problemCount: number;
  avgAttempts: number;
  solvedCount: number;
  unsolvedCount: number;
  partialScoreCount: number;
  commonTags: string[];
  problemPids: string[];
  weaknessScore: number;
  hypothesis: string;
};

type ClusterDiagnosis = {
  clusterId: string;
  clusterDiagnosis: string;
  commonErrorTypes: string[];
  evidenceSummary: string[];
  representativeProblems: string[];
  trainingAction: {
    module: string;
    tasks: string[];
    verifyMethod: string;
  };
  confidence: number;
  confidenceLevel: string;
  source: string;
};

type ProblemDiagnosis = {
  problemPid: string;
  clusterId: string;
  mainWeakness: string;
  likelyErrorTypes: string[];
  evidence: string[];
  trainingAction: {
    actionType: string;
    module: string;
    recommendation: string;
    verifyMethod: string;
  };
  confidence: number;
  confidenceLevel: string;
  source: string;
};

type AnalysisData = {
  timeline: { items: TimelineProblem[]; summary: JsonObject };
  metrics: { items: JsonObject[]; summary: JsonObject };
  modules: { files: JsonObject[]; summary: JsonObject };
  errors: JsonObject;
  deepReview: JsonObject;
};

const SCORE_PATTERN_ORDER = [
  "PARTIAL_TO_AC",
  "PARTIAL_STUCK",
  "ZERO_STUCK",
  "MULTI_FAIL_THEN_AC",
  "SCORE_VOLATILE",
  "QUICK_FIX_AC",
  "ONE_SHOT_AC",
  "UNKNOWN_PATTERN",
];

const MODULE_LABELS: Record<string, string> = {
  interval_dp: "区间 DP",
  dp: "DP",
  dsu: "并查集",
  binary_search: "二分答案",
  graph: "图论建模",
  shortest_path: "最短路",
  segment_tree: "线段树",
  fenwick_tree: "树状数组",
  state_compression_dp: "状态压缩 DP",
  string: "字符串",
  math: "数学",
  search: "搜索",
  dfs_bfs: "DFS/BFS",
  greedy: "贪心",
};

export function parseDiagnosisCliOptions(argv = process.argv.slice(2)): DiagnosisOptions {
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
    analysisDir: path.resolve(args.analysis ?? path.join(process.cwd(), "data", "analysis")),
    diagnosisDir: path.resolve(args.output ?? path.join(process.cwd(), "data", "diagnosis")),
  };
}

export async function buildProblemFeatureVectors(options: DiagnosisOptions): Promise<FeatureVector[]> {
  const analysis = await loadAnalysis(options);
  const moduleByProblem = buildModuleMap(analysis.modules.files);
  const metricByFile = new Map(analysis.metrics.items.map((item) => [getString(item, "filePath"), item]));
  const vectors = analysis.timeline.items.map((problem) => {
    const attempts = problem.attempts ?? [];
    const metrics = attempts.map((attempt) => metricByFile.get(attempt.filePath)).filter(isObject);
    const scoreTrajectory = attempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => typeof score === "number" && Number.isFinite(score));
    const codeModules = moduleByProblem.get(problem.problemPid) ?? [];
    const riskFlags = unique(attempts.flatMap((attempt) => attempt.riskFlags ?? []));
    const staticMetrics = {
      maxLineCount: max(metrics.map((metric) => getNumber(metric, "nonEmptyLineCount"))),
      maxBraceDepth: max(metrics.map((metric) => getNumber(metric, "maxBraceDepth"))),
      maxLoopDepth: max(metrics.map((metric) => getNumber(metric, "nestedLoopDepth"))),
      hasGlobalArray: metrics.some((metric) => Boolean(metric.useGlobalArray)),
      usesRecursion: metrics.some((metric) => Boolean(metric.recursionLikely)),
    };
    const scorePattern = getScorePattern(problem, scoreTrajectory);
    const primaryModule = choosePrimaryModule(codeModules, riskFlags, scorePattern);
    const candidateErrorTypes = inferErrorTypes(primaryModule, riskFlags, scorePattern, staticMetrics, problem);
    return {
      problemPid: problem.problemPid,
      problemTitle: problem.problemTitle,
      attemptCount: problem.attemptCount,
      solved: problem.solved,
      bestScore: problem.bestScore,
      finalResult: problem.finalResult,
      scoreTrajectory,
      scorePattern,
      resultPattern: getResultPattern(problem),
      firstSubmitTime: problem.firstSubmitTime,
      lastSubmitTime: problem.lastSubmitTime,
      isRecent: isRecent(problem.lastSubmitTime),
      luoguTags: [],
      luoguDifficulty: null,
      luoguPassRate: null,
      codeModules,
      primaryModule,
      riskFlags,
      staticMetrics,
      versionDelta: buildVersionDelta(attempts, metrics),
      candidateErrorTypes,
      cspAbilityRoles: inferCspRoles(primaryModule, scorePattern, problem),
      difficultyBand: inferDifficultyBand(primaryModule, problem, scorePattern),
    };
  });
  await writeJson(path.join(options.diagnosisDir, "problem_feature_vectors.json"), {
    generatedAt: new Date().toISOString(),
    totalProblems: vectors.length,
    items: vectors,
  });
  return vectors;
}

export async function classifyProblemPatterns(options: DiagnosisOptions): Promise<PatternTags[]> {
  const vectors = await readOrBuildVectors(options);
  const tags = vectors.map((vector) => {
    const allTags = unique([
      vector.scorePattern,
      vector.resultPattern,
      ...moduleRiskTags(vector),
      ...implementationRiskTags(vector),
      ...vector.cspAbilityRoles,
      ...(vector.isRecent ? ["RECENT_WEAKNESS"] : []),
    ].filter(Boolean));
    return {
      problemPid: vector.problemPid,
      tags: allTags,
      primaryModule: vector.primaryModule,
      mainErrorType: vector.candidateErrorTypes[0] ?? "UNKNOWN",
      cspAbilityRoles: vector.cspAbilityRoles,
    };
  });
  await writeJson(path.join(options.diagnosisDir, "problem_pattern_tags.json"), {
    generatedAt: new Date().toISOString(),
    totalProblems: tags.length,
    items: tags,
  });
  return tags;
}

export async function buildProblemClusters(options: DiagnosisOptions): Promise<ProblemCluster[]> {
  const vectors = await readOrBuildVectors(options);
  const patterns = await readOrBuildPatterns(options);
  const patternByPid = new Map(patterns.map((item) => [item.problemPid, item]));
  const groups = new Map<string, FeatureVector[]>();
  for (const vector of vectors) {
    const pattern = patternByPid.get(vector.problemPid);
    const key = buildClusterKey(vector, pattern);
    const group = groups.get(key) ?? [];
    group.push(vector);
    groups.set(key, group);
  }
  const clusters = [...groups.entries()]
    .map(([key, items], index) => makeCluster(key, items, index + 1, patternByPid))
    .sort((a, b) => b.weaknessScore - a.weaknessScore);
  await writeJson(path.join(options.diagnosisDir, "problem_clusters.json"), {
    generatedAt: new Date().toISOString(),
    clusterCount: clusters.length,
    clusters,
  });
  return clusters;
}

export async function selectClusterRepresentatives(options: DiagnosisOptions): Promise<JsonObject[]> {
  const vectors = await readOrBuildVectors(options);
  const clusters = await readOrBuildClusters(options);
  const vectorByPid = new Map(vectors.map((item) => [item.problemPid, item]));
  const output = clusters.map((cluster) => {
    const candidates = cluster.problemPids.map((pid) => vectorByPid.get(pid)).filter((item): item is FeatureVector => Boolean(item));
    const selected = selectRepresentativesForCluster(candidates).map((problem) => ({
      problemPid: problem.problemPid,
      reason: representativeReason(problem),
      role: representativeRole(problem),
      attemptCount: problem.attemptCount,
      scorePattern: problem.scorePattern,
      includeCodeVersions: ["first", "best", "firstAc", "final"],
    }));
    return { clusterId: cluster.clusterId, representatives: selected };
  });
  await writeJson(path.join(options.diagnosisDir, "cluster_representatives.json"), {
    generatedAt: new Date().toISOString(),
    items: output,
  });
  return output;
}

export async function buildLlmEvidencePacks(options: DiagnosisOptions): Promise<JsonObject[]> {
  const analysis = await loadAnalysis(options);
  const vectors = await readOrBuildVectors(options);
  const clusters = await readOrBuildClusters(options);
  const representatives = await readOrBuildRepresentatives(options);
  const vectorByPid = new Map(vectors.map((item) => [item.problemPid, item]));
  const metricByFile = new Map(analysis.metrics.items.map((item) => [getString(item, "filePath"), item]));
  const timelineByPid = new Map(analysis.timeline.items.map((item) => [item.problemPid, item]));

  const packs = clusters.map((cluster) => {
    const rep = representatives.find((item) => getString(item, "clusterId") === cluster.clusterId);
    const repItems = arrayOfObjects(rep?.representatives);
    return {
      clusterId: cluster.clusterId,
      clusterHypothesis: cluster.hypothesis,
      commonFeatures: {
        primaryModule: cluster.primaryModule,
        avgAttempts: cluster.avgAttempts,
        partialScoreRatio: round(cluster.partialScoreCount / Math.max(cluster.problemCount, 1)),
        commonRiskFlags: cluster.commonTags.filter((tag) => tag.includes("RISK")).slice(0, 8),
        commonScorePatterns: commonValues(cluster.problemPids.map((pid) => vectorByPid.get(pid)?.scorePattern).filter(Boolean) as string[]),
      },
      representativeProblems: repItems.map((item) => {
        const pid = getString(item, "problemPid");
        const problem = vectorByPid.get(pid);
        const timeline = timelineByPid.get(pid);
        return {
          problemPid: pid,
          attemptCount: problem?.attemptCount ?? 0,
          scoreTrajectory: problem?.scoreTrajectory ?? [],
          modules: problem?.codeModules ?? [],
          versionDiffSummary: problem?.versionDelta.changePattern ?? "",
          selectedCodeSnippets: buildSelectedSnippets(timeline, metricByFile),
        };
      }),
      requiredOutputSchema: {
        clusterDiagnosis: "string",
        commonErrorTypes: [],
        evidenceSummary: [],
        trainingAction: {},
        verifyMethod: "string",
        confidence: 0,
      },
    };
  });
  await writeJson(path.join(options.diagnosisDir, "llm_evidence_packs.json"), {
    generatedAt: new Date().toISOString(),
    note: "Evidence packs are compressed cluster inputs. Full source code is not included.",
    items: packs,
  });
  return packs;
}

export async function runClusterLlmDiagnosis(options: DiagnosisOptions): Promise<ClusterDiagnosis[]> {
  const clusters = await readOrBuildClusters(options);
  const representatives = await readOrBuildRepresentatives(options);
  const evidencePacks = await readOrBuildEvidencePacks(options);
  const packByCluster = new Map(evidencePacks.map((item) => [getString(item, "clusterId"), item]));
  const repByCluster = new Map(representatives.map((item) => [getString(item, "clusterId"), arrayOfObjects(item.representatives).map((rep) => getString(rep, "problemPid"))]));
  const deepSeekConfig = await resolveDeepSeekDiagnosisConfig();
  const traces: DeepSeekTrace[] = [];
  const realLlmLimit = deepSeekConfig?.limit ?? clusters.length;
  let realLlmCallCount = 0;

  const buildRuleDiagnosis = (cluster: ProblemCluster, source = "RULE_BASED_CLUSTER_DIAGNOSIS"): ClusterDiagnosis => {
    const errorTypes = inferClusterErrorTypes(cluster);
    const moduleLabel = MODULE_LABELS[cluster.primaryModule] ?? cluster.primaryModule;
    return {
      clusterId: cluster.clusterId,
      clusterDiagnosis: `${moduleLabel} 相关题目集中暴露出${cluster.hypothesis}。`,
      commonErrorTypes: errorTypes,
      evidenceSummary: [
        `问题簇包含 ${cluster.problemCount} 道题，平均提交 ${cluster.avgAttempts} 次。`,
        `未解决 ${cluster.unsolvedCount} 道，部分分题 ${cluster.partialScoreCount} 道。`,
        `共同标签：${cluster.commonTags.slice(0, 6).join(", ") || "无"}`,
      ],
      representativeProblems: repByCluster.get(cluster.clusterId) ?? [],
      trainingAction: {
        module: cluster.primaryModule,
        tasks: buildClusterTasks(cluster.primaryModule, errorTypes),
        verifyMethod: verifyMethodFor(cluster.primaryModule, errorTypes),
      },
      confidence: confidenceFor(cluster),
      confidenceLevel: confidenceLevel(confidenceFor(cluster)),
      source,
    };
  };

  const diagnoses: ClusterDiagnosis[] = [];
  for (const cluster of clusters) {
    const fallback = buildRuleDiagnosis(cluster);
    const evidencePack = packByCluster.get(cluster.clusterId);
    if (!deepSeekConfig || !evidencePack || realLlmCallCount >= realLlmLimit) {
      diagnoses.push(fallback);
      if (deepSeekConfig && realLlmCallCount >= realLlmLimit) {
        traces.push({
          clusterId: cluster.clusterId,
          status: "SKIPPED",
          providerId: deepSeekConfig.providerId,
          model: deepSeekConfig.model,
          baseUrl: deepSeekConfig.baseUrl,
          latencyMs: 0,
          errorMessage: `Skipped by DIAGNOSIS_LLM_LIMIT=${realLlmLimit}`,
          requestSummary: {
            clusterId: cluster.clusterId,
            representativeProblemCount: arrayOfObjects(evidencePack?.representativeProblems).length,
            payloadBytes: Buffer.byteLength(JSON.stringify(evidencePack ?? {}), "utf8"),
          },
        });
      }
      continue;
    }

    realLlmCallCount += 1;
    const { output, trace } = await callDeepSeekClusterDiagnosis({
      config: deepSeekConfig,
      evidencePack,
      fallbackModule: cluster.primaryModule,
    });
    traces.push(trace);
    if (trace.status !== "SUCCESS") {
      if (deepSeekConfig.requireReal) {
        throw new Error(`DeepSeek diagnosis failed for ${cluster.clusterId}: ${trace.errorMessage ?? "unknown provider error"}`);
      }
      diagnoses.push(buildRuleDiagnosis(cluster, "RULE_FALLBACK_AFTER_DEEPSEEK_FAILURE"));
      continue;
    }
    const confidence = output.confidence || fallback.confidence;
    diagnoses.push({
      clusterId: cluster.clusterId,
      clusterDiagnosis: output.clusterDiagnosis || fallback.clusterDiagnosis,
      commonErrorTypes: output.commonErrorTypes.length > 0 ? output.commonErrorTypes : fallback.commonErrorTypes,
      evidenceSummary: output.evidenceSummary.length > 0 ? output.evidenceSummary : fallback.evidenceSummary,
      representativeProblems: fallback.representativeProblems,
      trainingAction: {
        module: output.trainingAction.module || cluster.primaryModule,
        tasks: output.trainingAction.tasks.length > 0 ? output.trainingAction.tasks : fallback.trainingAction.tasks,
        verifyMethod: output.trainingAction.verifyMethod || fallback.trainingAction.verifyMethod,
      },
      confidence,
      confidenceLevel: confidenceLevel(confidence),
      source: "DEEPSEEK_CLUSTER_DIAGNOSIS",
    });
  }
  await writeJson(path.join(options.diagnosisDir, "cluster_llm_diagnosis_traces.json"), {
    generatedAt: new Date().toISOString(),
    provider: deepSeekConfig
      ? {
          providerId: deepSeekConfig.providerId,
          providerLabel: deepSeekConfig.providerLabel,
          baseUrl: deepSeekConfig.baseUrl,
          model: deepSeekConfig.model,
          keyPresent: true,
          envSources: deepSeekConfig.envSources,
          limit: deepSeekConfig.limit,
          concurrency: deepSeekConfig.concurrency,
          requireReal: deepSeekConfig.requireReal,
        }
      : {
          providerId: "deepseek",
          keyPresent: false,
        },
    traces,
  });
  await writeJson(path.join(options.diagnosisDir, "cluster_llm_diagnosis.json"), {
    generatedAt: new Date().toISOString(),
    note: deepSeekConfig
      ? "Cluster diagnosis is generated from DeepSeek evidence-pack calls with rule fallback on provider failures."
      : "DeepSeek key was not found. Deterministic rule-based cluster diagnosis was used as offline fallback.",
    provider: deepSeekConfig
      ? {
          providerId: deepSeekConfig.providerId,
          providerLabel: deepSeekConfig.providerLabel,
          baseUrl: deepSeekConfig.baseUrl,
          model: deepSeekConfig.model,
          keyPresent: true,
          envSources: deepSeekConfig.envSources,
          limit: deepSeekConfig.limit,
          requireReal: deepSeekConfig.requireReal,
        }
      : {
          providerId: "deepseek",
          keyPresent: false,
        },
    items: diagnoses,
  });
  return diagnoses;
}

export async function propagateClusterDiagnosis(options: DiagnosisOptions): Promise<ProblemDiagnosis[]> {
  const vectors = await readOrBuildVectors(options);
  const clusters = await readOrBuildClusters(options);
  const diagnoses = await readOrBuildClusterDiagnosis(options);
  const clusterByPid = new Map<string, ProblemCluster>();
  for (const cluster of clusters) {
    for (const pid of cluster.problemPids) clusterByPid.set(pid, cluster);
  }
  const diagnosisByCluster = new Map(diagnoses.map((item) => [item.clusterId, item]));
  const output = vectors.map((vector) => {
    const cluster = clusterByPid.get(vector.problemPid);
    const diagnosis = cluster ? diagnosisByCluster.get(cluster.clusterId) : undefined;
    const confidence = diagnosis ? Math.max(0.35, diagnosis.confidence - (vector.attemptCount <= 1 && vector.solved ? 0.18 : 0)) : 0.35;
    return {
      problemPid: vector.problemPid,
      clusterId: cluster?.clusterId ?? "unknown_cluster",
      mainWeakness: diagnosis?.clusterDiagnosis ?? `${vector.primaryModule} 题目需要进一步人工确认。`,
      likelyErrorTypes: diagnosis?.commonErrorTypes ?? vector.candidateErrorTypes,
      evidence: buildProblemEvidence(vector, cluster),
      trainingAction: {
        actionType: vector.solved && vector.attemptCount <= 2 ? "watch_and_keep" : "module_drill",
        module: vector.primaryModule,
        recommendation: diagnosis?.trainingAction.tasks.join("；") ?? trainingRecommendation(vector.primaryModule, vector.candidateErrorTypes),
        verifyMethod: diagnosis?.trainingAction.verifyMethod ?? verifyMethodFor(vector.primaryModule, vector.candidateErrorTypes),
      },
      confidence: round(confidence),
      confidenceLevel: confidenceLevel(confidence),
      source: diagnosis ? "CLUSTER_INFERRED" : "RULE_INFERRED",
    };
  });
  await writeJson(path.join(options.diagnosisDir, "problem_diagnosis.json"), {
    generatedAt: new Date().toISOString(),
    totalProblems: output.length,
    items: output,
  });
  await fs.writeFile(path.join(options.diagnosisDir, "problem_diagnosis.md"), `\uFEFF${renderProblemDiagnosisMarkdown(output)}`, "utf8");
  return output;
}

export async function generateWeaknessSummary(options: DiagnosisOptions): Promise<JsonObject> {
  const clusters = await readOrBuildClusters(options);
  const diagnoses = await readOrBuildClusterDiagnosis(options);
  const diagnosisByCluster = new Map(diagnoses.map((item) => [item.clusterId, item]));
  const groups = new Map<string, { clusters: ProblemCluster[]; diagnoses: ClusterDiagnosis[] }>();
  for (const cluster of clusters) {
    const diagnosis = diagnosisByCluster.get(cluster.clusterId);
    const key = `${cluster.primaryModule}:${(diagnosis?.commonErrorTypes ?? inferClusterErrorTypes(cluster)).slice(0, 3).join("_")}:${cluster.hypothesis}`;
    const group = groups.get(key) ?? { clusters: [], diagnoses: [] };
    group.clusters.push(cluster);
    if (diagnosis) group.diagnoses.push(diagnosis);
    groups.set(key, group);
  }

  const topWeaknesses = [...groups.entries()].map(([key, group], index) => {
    const firstCluster = group.clusters[0];
    const firstDiagnosis = group.diagnoses[0] ?? (firstCluster ? diagnosisByCluster.get(firstCluster.clusterId) : undefined);
    const problemIds = unique(group.clusters.flatMap((cluster) => cluster.problemPids));
    const severity = normalizeScore(
      avg(group.clusters.map((cluster) => cluster.weaknessScore)) * 0.55 +
        Math.min(problemIds.length / 20, 1) * 25 +
        Math.min(group.clusters.reduce((sum, cluster) => sum + cluster.unsolvedCount, 0) / 12, 1) * 10 +
        Math.min(group.clusters.reduce((sum, cluster) => sum + cluster.partialScoreCount, 0) / 12, 1) * 10,
    );
    const module = firstCluster?.primaryModule ?? key.split(":")[0] ?? "unknown";
    const relatedErrorTypes = unique(group.diagnoses.flatMap((item) => item.commonErrorTypes));
    const title = `${MODULE_LABELS[module] ?? module}：${firstCluster?.hypothesis ?? firstDiagnosis?.clusterDiagnosis ?? "需要进一步诊断"}`;
    const weaknessId = `${module}_${(relatedErrorTypes[0] ?? "weakness").toLowerCase()}_${index + 1}`;
    return {
      weaknessId,
      title,
      severity,
      relatedModules: [module],
      relatedErrorTypes,
      evidenceProblems: problemIds.slice(0, 12),
      problemCount: problemIds.length,
      trainingAction: firstDiagnosis?.trainingAction.tasks.join("；") ?? trainingRecommendation(module, relatedErrorTypes),
      verifyMethod: firstDiagnosis?.trainingAction.verifyMethod ?? verifyMethodFor(module, relatedErrorTypes),
      clusterIds: group.clusters.map((cluster) => cluster.clusterId),
    };
  }).sort((a, b) => b.severity - a.severity).slice(0, 20);
  const summary = {
    generatedAt: new Date().toISOString(),
    topWeaknesses,
  };
  await writeJson(path.join(options.diagnosisDir, "weakness_summary.json"), summary);
  await buildModuleWeaknessMatrix(options);
  await buildErrorTypeDistribution(options);
  await buildVersionDiffInsights(options);
  return summary;
}

export async function buildModuleWeaknessMatrix(options: DiagnosisOptions): Promise<JsonObject[]> {
  const vectors = await readOrBuildVectors(options);
  const clusters = await readOrBuildClusters(options);
  const byModule = new Map<string, FeatureVector[]>();
  for (const vector of vectors) {
    const group = byModule.get(vector.primaryModule) ?? [];
    group.push(vector);
    byModule.set(vector.primaryModule, group);
  }
  const matrix = [...byModule.entries()]
    .map(([module, items]) => {
      const relatedClusters = clusters.filter((cluster) => cluster.primaryModule === module);
      const unsolved = items.filter((item) => !item.solved).length;
      const partial = items.filter((item) => item.scorePattern.includes("PARTIAL")).length;
      const highAttempt = items.filter((item) => item.attemptCount >= 5).length;
      const risk = items.filter((item) => item.riskFlags.length > 0).length;
      const critical = items.filter((item) => !item.solved && item.attemptCount >= 8).length;
      const avgAttempts = round(avg(items.map((item) => item.attemptCount)));
      const weaknessScore = normalizeScore(avgAttempts * 12 + (unsolved / items.length) * 25 + (partial / items.length) * 20 + (highAttempt / items.length) * 20 + (risk / items.length) * 15 + (critical / items.length) * 25);
      return {
        module,
        problemCount: items.length,
        acProblemCount: items.filter((item) => item.solved).length,
        unsolvedCount: unsolved,
        avgAttempts,
        highAttemptProblemCount: highAttempt,
        partialScoreProblemCount: partial,
        criticalProblemCount: critical,
        riskProblemCount: risk,
        weaknessScore,
        mainWeakness: hypothesisFor(module, commonValues(items.flatMap((item) => item.candidateErrorTypes))[0] ?? "UNKNOWN"),
        evidenceProblems: relatedClusters.flatMap((cluster) => cluster.problemPids).slice(0, 10),
      };
    })
    .sort((a, b) => getNumber(b, "weaknessScore") - getNumber(a, "weaknessScore"));
  await writeJson(path.join(options.diagnosisDir, "module_weakness_matrix.json"), {
    generatedAt: new Date().toISOString(),
    items: matrix,
  });
  return matrix;
}

export async function buildErrorTypeDistribution(options: DiagnosisOptions): Promise<JsonObject> {
  const problemDiagnosis = await readOrBuildProblemDiagnosis(options);
  const distribution: Record<string, { problemCount: number; evidenceProblems: string[]; relatedModules: string[]; trainingAction: string }> = {};
  for (const item of problemDiagnosis) {
    for (const errorType of item.likelyErrorTypes) {
      const entry = distribution[errorType] ?? { problemCount: 0, evidenceProblems: [], relatedModules: [], trainingAction: trainingActionForError(errorType) };
      entry.problemCount += 1;
      if (entry.evidenceProblems.length < 12) entry.evidenceProblems.push(item.problemPid);
      if (!entry.relatedModules.includes(item.trainingAction.module)) entry.relatedModules.push(item.trainingAction.module);
      distribution[errorType] = entry;
    }
  }
  const sorted = Object.fromEntries(Object.entries(distribution).sort((a, b) => b[1].problemCount - a[1].problemCount));
  await writeJson(path.join(options.diagnosisDir, "error_type_distribution.json"), {
    generatedAt: new Date().toISOString(),
    items: sorted,
  });
  return sorted;
}

export async function buildVersionDiffInsights(options: DiagnosisOptions): Promise<JsonObject[]> {
  const vectors = await readOrBuildVectors(options);
  const insights = vectors
    .filter((vector) => vector.attemptCount > 1)
    .map((vector) => ({
      problemPid: vector.problemPid,
      versionCount: vector.versionDelta.versionCount,
      scorePattern: vector.scoreTrajectory.join(" -> ") || vector.scorePattern,
      lineCountChange: vector.versionDelta.lineCountChange,
      riskFlagChange: {
        added: vector.versionDelta.riskAdded,
        removed: vector.versionDelta.riskRemoved,
      },
      likelyChangeReason: vector.versionDelta.changePattern,
    }));
  await writeJson(path.join(options.diagnosisDir, "version_diff_insights.json"), {
    generatedAt: new Date().toISOString(),
    items: insights,
  });
  return insights;
}

export async function generateWeaknessReport(options: DiagnosisOptions): Promise<string> {
  const summary = await readOrBuildWeaknessSummary(options);
  const matrix = await readJson<{ items: JsonObject[] }>(path.join(options.diagnosisDir, "module_weakness_matrix.json"));
  const errors = await readJson<{ items: Record<string, JsonObject> }>(path.join(options.diagnosisDir, "error_type_distribution.json"));
  const topWeaknesses = arrayOfObjects(summary.topWeaknesses).slice(0, 10);
  const md = [
    "# 全题目级薄弱点诊断报告",
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 1. 总览",
    "",
    "本报告基于所有历史题目的提交轨迹、代码静态指标、算法模块识别和问题簇归类生成。当前版本先用规则完成全量覆盖，并为后续 LLM 代表题分析预留证据包。",
    "",
    "## 2. 最严重的 10 个薄弱点",
    "",
    ...topWeaknesses.map((item, index) => `${index + 1}. ${getString(item, "title")}（严重度 ${getNumber(item, "severity")}，证据题：${arrayOfStrings(item.evidenceProblems).slice(0, 6).join(", ")}）`),
    "",
    "## 3. 模块弱点矩阵 Top 10",
    "",
    "| 模块 | 题目数 | 未解决 | 平均提交 | 高提交题 | 部分分题 | 弱点分 |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...matrix.items.slice(0, 10).map((item) => `| ${getString(item, "module")} | ${getNumber(item, "problemCount")} | ${getNumber(item, "unsolvedCount")} | ${getNumber(item, "avgAttempts")} | ${getNumber(item, "highAttemptProblemCount")} | ${getNumber(item, "partialScoreProblemCount")} | ${getNumber(item, "weaknessScore")} |`),
    "",
    "## 4. 错误类型分布 Top 10",
    "",
    ...Object.entries(errors.items).slice(0, 10).map(([type, item]) => `- ${type}：${getNumber(item, "problemCount")} 题；证据：${arrayOfStrings(item.evidenceProblems).slice(0, 6).join(", ")}`),
    "",
    "## 5. 针对性训练建议",
    "",
    ...topWeaknesses.slice(0, 6).map((item) => `- ${getString(item, "title")}：${getString(item, "trainingAction")} 验收：${getString(item, "verifyMethod")}`),
    "",
    "## 6. 下一步",
    "",
    "- 执行 `pnpm problem-bank:all` 生成 Select / Mutate / Generate 训练任务包。",
    "- 对高严重度问题簇的代表题进行人工或 LLM 深度复盘。",
    "- 完成训练后把结果回填到训练记录，再重新运行诊断。",
    "",
  ].join("\n");
  const reportPath = path.join(options.diagnosisDir, "weakness_report.md");
  await fs.writeFile(reportPath, `\uFEFF${md}`, "utf8");
  return reportPath;
}

export async function generateTargetedTrainingPlan(options: DiagnosisOptions): Promise<string> {
  const summary = await readOrBuildWeaknessSummary(options);
  const topWeaknesses = arrayOfObjects(summary.topWeaknesses).slice(0, 8);
  const md = [
    "# 针对性训练计划",
    "",
    "本计划不是随机刷题，而是按薄弱点生成训练动作。每个训练动作都绑定证据题和验收方式。",
    "",
    ...topWeaknesses.flatMap((item, index) => [
      `## 薄弱点 ${index + 1}：${getString(item, "title")}`,
      "",
      `严重度：${getNumber(item, "severity")}`,
      "",
      `证据题：${arrayOfStrings(item.evidenceProblems).slice(0, 8).join(", ")}`,
      "",
      `训练动作：${getString(item, "trainingAction")}`,
      "",
      `验收方式：${getString(item, "verifyMethod")}`,
      "",
    ]),
  ].join("\n");
  const filePath = path.join(options.diagnosisDir, "targeted_training_plan.md");
  await fs.writeFile(filePath, `\uFEFF${md}`, "utf8");
  return filePath;
}

export async function buildDiagnosisSystem(options: DiagnosisOptions): Promise<void> {
  await ensureDir(options.diagnosisDir);
  await buildProblemFeatureVectors(options);
  await classifyProblemPatterns(options);
  await buildProblemClusters(options);
  await selectClusterRepresentatives(options);
  await buildLlmEvidencePacks(options);
  await runClusterLlmDiagnosis(options);
  await propagateClusterDiagnosis(options);
  await generateWeaknessSummary(options);
  await generateWeaknessReport(options);
  await generateTargetedTrainingPlan(options);
}

async function loadAnalysis(options: DiagnosisOptions): Promise<AnalysisData> {
  const timeline = await readJson<{ items: TimelineProblem[]; summary: JsonObject }>(path.join(options.analysisDir, "problem_code_timeline.json"));
  const metrics = await readJson<{ items: JsonObject[]; summary: JsonObject }>(path.join(options.analysisDir, "code_static_metrics.json"));
  const modules = await readJson<{ files: JsonObject[]; summary: JsonObject }>(path.join(options.analysisDir, "algorithm_module_stats.json"));
  const errors = await readJson<JsonObject>(path.join(options.analysisDir, "error_pattern_candidates.json"));
  const deepReview = await readJson<JsonObject>(path.join(options.analysisDir, "deep_review_samples.json"));
  return { timeline, metrics, modules, errors, deepReview };
}

async function readOrBuildVectors(options: DiagnosisOptions): Promise<FeatureVector[]> {
  const filePath = path.join(options.diagnosisDir, "problem_feature_vectors.json");
  if (await exists(filePath)) return (await readJson<{ items: FeatureVector[] }>(filePath)).items;
  return buildProblemFeatureVectors(options);
}

async function readOrBuildPatterns(options: DiagnosisOptions): Promise<PatternTags[]> {
  const filePath = path.join(options.diagnosisDir, "problem_pattern_tags.json");
  if (await exists(filePath)) return (await readJson<{ items: PatternTags[] }>(filePath)).items;
  return classifyProblemPatterns(options);
}

async function readOrBuildClusters(options: DiagnosisOptions): Promise<ProblemCluster[]> {
  const filePath = path.join(options.diagnosisDir, "problem_clusters.json");
  if (await exists(filePath)) return (await readJson<{ clusters: ProblemCluster[] }>(filePath)).clusters;
  return buildProblemClusters(options);
}

async function readOrBuildRepresentatives(options: DiagnosisOptions): Promise<JsonObject[]> {
  const filePath = path.join(options.diagnosisDir, "cluster_representatives.json");
  if (await exists(filePath)) return (await readJson<{ items: JsonObject[] }>(filePath)).items;
  return selectClusterRepresentatives(options);
}

async function readOrBuildEvidencePacks(options: DiagnosisOptions): Promise<JsonObject[]> {
  const filePath = path.join(options.diagnosisDir, "llm_evidence_packs.json");
  if (await exists(filePath)) return (await readJson<{ items: JsonObject[] }>(filePath)).items;
  return buildLlmEvidencePacks(options);
}

async function readOrBuildClusterDiagnosis(options: DiagnosisOptions): Promise<ClusterDiagnosis[]> {
  const filePath = path.join(options.diagnosisDir, "cluster_llm_diagnosis.json");
  if (await exists(filePath)) return (await readJson<{ items: ClusterDiagnosis[] }>(filePath)).items;
  return runClusterLlmDiagnosis(options);
}

async function readOrBuildProblemDiagnosis(options: DiagnosisOptions): Promise<ProblemDiagnosis[]> {
  const filePath = path.join(options.diagnosisDir, "problem_diagnosis.json");
  if (await exists(filePath)) return (await readJson<{ items: ProblemDiagnosis[] }>(filePath)).items;
  return propagateClusterDiagnosis(options);
}

async function readOrBuildWeaknessSummary(options: DiagnosisOptions): Promise<JsonObject> {
  const filePath = path.join(options.diagnosisDir, "weakness_summary.json");
  if (await exists(filePath)) return readJson<JsonObject>(filePath);
  return generateWeaknessSummary(options);
}

function buildModuleMap(moduleFiles: JsonObject[]): Map<string, string[]> {
  const map = new Map<string, Set<string>>();
  for (const file of moduleFiles) {
    const pid = getString(file, "problemPid");
    if (!pid) continue;
    const set = map.get(pid) ?? new Set<string>();
    for (const mod of arrayOfObjects(file.modules)) {
      const name = getString(mod, "name");
      if (name) set.add(name);
    }
    map.set(pid, set);
  }
  return new Map([...map.entries()].map(([pid, set]) => [pid, [...set]]));
}

function getScorePattern(problem: TimelineProblem, scores: number[]): string {
  if (problem.attemptCount === 1 && problem.solved) return "ONE_SHOT_AC";
  if (problem.solved && problem.attemptCount <= 4) return "QUICK_FIX_AC";
  if (!problem.solved && scores.length > 0 && Math.max(...scores) === 0) return "ZERO_STUCK";
  if (!problem.solved && (problem.bestScore ?? 0) > 0 && (problem.bestScore ?? 0) < 100) return "PARTIAL_STUCK";
  if (problem.solved && scores.some((score) => score > 0 && score < 100)) return "PARTIAL_TO_AC";
  if (isVolatile(scores)) return "SCORE_VOLATILE";
  if (problem.solved && problem.attemptCount >= 5) return "MULTI_FAIL_THEN_AC";
  return "UNKNOWN_PATTERN";
}

function getResultPattern(problem: TimelineProblem): string {
  if (problem.tags?.includes("MULTI_FAIL_THEN_AC")) return "MULTI_FAIL_THEN_AC";
  if (problem.tags?.includes("STUCK_PROBLEM")) return "UNSOLVED_HIGH_ATTEMPT";
  if (problem.tags?.includes("ONE_SHOT_AC")) return "ONE_SHOT_AC";
  if (!problem.solved) return "NEVER_AC";
  return "SOLVED";
}

function choosePrimaryModule(modules: string[], riskFlags: string[], scorePattern: string): string {
  const priority = ["interval_dp", "state_compression_dp", "segment_tree", "fenwick_tree", "dsu", "binary_search", "shortest_path", "graph", "dp", "string", "math", "search", "dfs_bfs", "greedy"];
  if (scorePattern.includes("PARTIAL") && modules.length === 0) return "partial_score";
  if (riskFlags.includes("LONG_CODE")) return modules.find((item) => priority.includes(item)) ?? "implementation";
  return priority.find((item) => modules.includes(item)) ?? modules[0] ?? "implementation";
}

function inferErrorTypes(module: string, riskFlags: string[], scorePattern: string, metrics: FeatureVector["staticMetrics"], problem: TimelineProblem): string[] {
  const errors = new Set<string>();
  const byModule: Record<string, string[]> = {
    interval_dp: ["STATE_ERROR", "TRANSITION_ERROR", "INIT_ERROR", "BOUNDARY_ERROR"],
    dp: ["STATE_ERROR", "TRANSITION_ERROR", "INIT_ERROR"],
    dsu: ["MODEL_ERROR", "TEMPLATE_UNFAMILIAR", "INDEX_ERROR"],
    binary_search: ["MODEL_ERROR", "BOUNDARY_ERROR", "COMPLEXITY_ERROR"],
    graph: ["MODEL_ERROR", "COMPLEXITY_ERROR", "INDEX_ERROR"],
    shortest_path: ["INIT_ERROR", "COMPLEXITY_ERROR", "TEMPLATE_UNFAMILIAR"],
    segment_tree: ["TEMPLATE_UNFAMILIAR", "BOUNDARY_ERROR", "INDEX_ERROR"],
    fenwick_tree: ["INDEX_ERROR", "BOUNDARY_ERROR", "TEMPLATE_UNFAMILIAR"],
    math: ["MODEL_ERROR", "OVERFLOW_ERROR", "READING_ERROR"],
    string: ["BOUNDARY_ERROR", "INDEX_ERROR", "MODEL_ERROR"],
    implementation: ["IMPLEMENTATION_RISK", "BOUNDARY_ERROR"],
    partial_score: ["PARTIAL_SCORE_MISSED", "STRATEGY_ERROR"],
  };
  for (const error of byModule[module] ?? ["UNKNOWN"]) errors.add(error);
  if (riskFlags.includes("ARRAY_INDEX_RISK")) errors.add("INDEX_ERROR");
  if (riskFlags.includes("POSSIBLE_INT_OVERFLOW") || riskFlags.includes("DEFINE_INT_LONG_LONG")) errors.add("OVERFLOW_ERROR");
  if (riskFlags.includes("MEMSET_SENTINEL")) errors.add("INIT_ERROR");
  if (riskFlags.includes("RECURSION")) errors.add("RECURSION_STACK_RISK");
  if (riskFlags.includes("LONG_CODE")) errors.add("DEBUG_TIMEOUT");
  if (riskFlags.includes("DEEP_LOOP_NESTING")) errors.add("COMPLEXITY_ERROR");
  if (scorePattern === "PARTIAL_STUCK") errors.add("PARTIAL_SCORE_MISSED");
  if (!problem.solved && problem.attemptCount >= 8) errors.add("DEBUG_TIMEOUT");
  if (metrics.maxLoopDepth >= 4) errors.add("COMPLEXITY_ERROR");
  return [...errors].slice(0, 6);
}

function inferCspRoles(module: string, scorePattern: string, problem: TimelineProblem): string[] {
  const roles = new Set<string>();
  if (["implementation", "string", "math", "greedy"].includes(module)) roles.add("T1_STABILITY");
  if (["dp", "interval_dp", "dsu", "binary_search", "graph", "shortest_path", "search"].includes(module)) roles.add("T2_MODELING");
  if (scorePattern.includes("PARTIAL") || !problem.solved) roles.add("T3_PARTIAL_SCORE");
  if (problem.attemptCount >= 5) roles.add("T4_STRATEGY");
  return [...roles];
}

function inferDifficultyBand(module: string, problem: TimelineProblem, scorePattern: string): string {
  if (scorePattern === "PARTIAL_STUCK" || (!problem.solved && problem.attemptCount >= 8)) return "提高+/省选-";
  if (["state_compression_dp", "segment_tree", "interval_dp"].includes(module)) return "提高";
  if (problem.attemptCount <= 2 && problem.solved) return "普及+/提高-";
  return "提高";
}

function buildVersionDelta(attempts: Attempt[], metrics: JsonObject[]): FeatureVector["versionDelta"] {
  const first = metrics[0];
  const final = metrics[metrics.length - 1];
  const firstRisks = new Set(arrayOfStrings(first?.riskFlags));
  const finalRisks = new Set(arrayOfStrings(final?.riskFlags));
  const riskAdded = [...finalRisks].filter((flag) => !firstRisks.has(flag));
  const riskRemoved = [...firstRisks].filter((flag) => !finalRisks.has(flag));
  const lineDelta = (getNumber(final, "nonEmptyLineCount") || 0) - (getNumber(first, "nonEmptyLineCount") || 0);
  const featureAdded = [
    getNumber(final, "globalArrayCount") > getNumber(first, "globalArrayCount") ? "global_array" : "",
    Boolean(final?.usesMemset) && !Boolean(first?.usesMemset) ? "init_logic" : "",
    Boolean(final?.usesVector) && !Boolean(first?.usesVector) ? "vector_structure" : "",
  ].filter(Boolean);
  return {
    versionCount: attempts.length,
    lineCountChange: lineDelta >= 0 ? `+${lineDelta}` : String(lineDelta),
    riskAdded,
    riskRemoved,
    featureAdded,
    changePattern: inferChangePattern(attempts, lineDelta, riskAdded, riskRemoved, featureAdded),
  };
}

function inferChangePattern(attempts: Attempt[], lineDelta: number, riskAdded: string[], riskRemoved: string[], featureAdded: string[]): string {
  const scores = attempts.map((attempt) => attempt.score ?? 0);
  if (scores.some((score) => score > 0 && score < 100) && scores.some((score) => score >= 100)) return "从部分分到 AC，疑似逐步修正模型、边界或初始化。";
  if (Math.max(...scores) === 0) return "长期 0 分，优先检查模型、复杂度或读题理解。";
  if (lineDelta > 80) return "代码规模明显增加，可能从暴力改为复杂模型或增加数据结构。";
  if (riskRemoved.length > riskAdded.length) return "后续版本减少了部分实现风险，可能修复了边界或溢出问题。";
  if (featureAdded.length > 0) return `后续版本新增 ${featureAdded.join(", ")}，可能是关键修正点。`;
  return "版本变化不明显，需要结合人工复盘确认。";
}

function moduleRiskTags(vector: FeatureVector): string[] {
  const tags: string[] = [];
  if (vector.codeModules.includes("dp")) tags.push("DP_STATE_RISK", "DP_INIT_RISK");
  if (vector.codeModules.includes("interval_dp")) tags.push("INTERVAL_DP_ORDER_RISK");
  if (vector.codeModules.includes("binary_search")) tags.push("BINARY_SEARCH_BOUNDARY_RISK", "BINARY_SEARCH_CHECK_RISK");
  if (vector.codeModules.includes("dsu")) tags.push("DSU_MODEL_RISK", "DSU_DISCRETIZATION_RISK");
  if (vector.codeModules.includes("graph")) tags.push("GRAPH_MODEL_RISK");
  if (vector.codeModules.includes("shortest_path")) tags.push("SHORTEST_PATH_INIT_RISK");
  if (vector.codeModules.includes("segment_tree")) tags.push("SEGMENT_TREE_TEMPLATE_RISK");
  if (vector.codeModules.includes("fenwick_tree")) tags.push("FENWICK_INDEX_RISK");
  if (vector.codeModules.includes("string")) tags.push("STRING_BOUNDARY_RISK");
  if (vector.codeModules.includes("math")) tags.push("MATH_OVERFLOW_RISK");
  if (vector.codeModules.includes("search")) tags.push("SEARCH_PRUNING_RISK");
  return tags;
}

function implementationRiskTags(vector: FeatureVector): string[] {
  const tags: string[] = [];
  if (vector.riskFlags.includes("ARRAY_INDEX_RISK")) tags.push("ARRAY_INDEX_RISK");
  if (vector.riskFlags.includes("POSSIBLE_INT_OVERFLOW") || vector.riskFlags.includes("DEFINE_INT_LONG_LONG")) tags.push("OVERFLOW_RISK");
  if (vector.riskFlags.includes("MEMSET_SENTINEL")) tags.push("INIT_RISK");
  if (vector.riskFlags.includes("RECURSION")) tags.push("RECURSION_STACK_RISK");
  if (vector.riskFlags.includes("LONG_CODE")) tags.push("LONG_CODE_DEBUG_RISK");
  if (vector.riskFlags.includes("DEEP_BRACE_NESTING") || vector.riskFlags.includes("DEEP_LOOP_NESTING")) tags.push("DEEP_NESTING_RISK");
  return tags;
}

function buildClusterKey(vector: FeatureVector, pattern?: PatternTags): string {
  const mainError = simplifyErrorGroup(pattern?.mainErrorType ?? vector.candidateErrorTypes[0] ?? "UNKNOWN");
  const roles = vector.cspAbilityRoles.includes("T3_PARTIAL_SCORE") ? "T3" : vector.cspAbilityRoles.includes("T2_MODELING") ? "T2" : vector.cspAbilityRoles[0] ?? "T1";
  return `${vector.primaryModule}:${mainError}:${vector.scorePattern}:${vector.difficultyBand}:${roles}`;
}

function makeCluster(key: string, items: FeatureVector[], index: number, patternByPid: Map<string, PatternTags>): ProblemCluster {
  const [module, errorGroup, scorePattern, difficultyBand, role] = key.split(":");
  const solvedCount = items.filter((item) => item.solved).length;
  const partialScoreCount = items.filter((item) => item.scorePattern.includes("PARTIAL")).length;
  const avgAttempts = round(avg(items.map((item) => item.attemptCount)));
  const highAttemptRatio = items.filter((item) => item.attemptCount >= 5).length / items.length;
  const unsolvedRatio = (items.length - solvedCount) / items.length;
  const partialRatio = partialScoreCount / items.length;
  const recentRatio = items.filter((item) => item.isRecent).length / items.length;
  const cspImportance = role === "T3" ? 0.9 : role === "T2" ? 0.8 : 0.6;
  const weaknessScore = normalizeScore(Math.min(avgAttempts / 8, 1) * 25 + unsolvedRatio * 20 + partialRatio * 20 + highAttemptRatio * 15 + recentRatio * 10 + cspImportance * 10);
  const commonTags = commonValues(items.flatMap((item) => patternByPid.get(item.problemPid)?.tags ?? [])).slice(0, 10);
  return {
    clusterId: `${module}_${errorGroup}_${String(index).padStart(3, "0")}`.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase(),
    clusterKey: key,
    clusterName: `${MODULE_LABELS[module] ?? module}：${humanErrorGroup(errorGroup)}`,
    primaryModule: module,
    cspRoles: unique(items.flatMap((item) => item.cspAbilityRoles)),
    problemCount: items.length,
    avgAttempts,
    solvedCount,
    unsolvedCount: items.length - solvedCount,
    partialScoreCount,
    commonTags,
    problemPids: items.sort((a, b) => b.attemptCount - a.attemptCount).map((item) => item.problemPid),
    weaknessScore,
    hypothesis: hypothesisFor(module, errorGroup, scorePattern, difficultyBand),
  };
}

function selectRepresentativesForCluster(candidates: FeatureVector[]): FeatureVector[] {
  const selected = new Map<string, FeatureVector>();
  const add = (item: FeatureVector | undefined) => {
    if (item) selected.set(item.problemPid, item);
  };
  add([...candidates].sort((a, b) => b.attemptCount - a.attemptCount)[0]);
  add([...candidates].sort((a, b) => Number(a.solved) - Number(b.solved) || b.attemptCount - a.attemptCount)[0]);
  add(candidates.find((item) => item.scorePattern === "PARTIAL_TO_AC"));
  add([...candidates].filter((item) => item.lastSubmitTime).sort((a, b) => Date.parse(b.lastSubmitTime ?? "") - Date.parse(a.lastSubmitTime ?? ""))[0]);
  add([...candidates].sort((a, b) => Math.abs(Number.parseInt(b.versionDelta.lineCountChange, 10)) - Math.abs(Number.parseInt(a.versionDelta.lineCountChange, 10)))[0]);
  return [...selected.values()].slice(0, 5);
}

function representativeRole(problem: FeatureVector): string {
  if (!problem.solved && problem.attemptCount >= 8) return "SEVERE_UNSOLVED";
  if (problem.scorePattern === "PARTIAL_TO_AC") return "INFORMATIVE_PARTIAL_TO_AC";
  if (problem.isRecent) return "RECENT_LEVEL";
  if (problem.attemptCount >= 8) return "SEVERE_AND_INFORMATIVE";
  return "TYPICAL";
}

function representativeReason(problem: FeatureVector): string {
  if (!problem.solved) return "未 AC 或长期卡住，能代表该簇的关键薄弱点。";
  if (problem.scorePattern === "PARTIAL_TO_AC") return "存在部分分到 AC 的轨迹，适合分析修正过程。";
  if (problem.attemptCount >= 8) return "提交次数高，适合比较多个版本的错误修正。";
  return "特征接近该问题簇，适合作为典型样本。";
}

function buildSelectedSnippets(timeline: TimelineProblem | undefined, metricByFile: Map<string, JsonObject>) {
  if (!timeline) return {};
  const attempts = timeline.attempts ?? [];
  const picked = [attempts[0], attempts.find((attempt) => attempt.result === "AC"), attempts[attempts.length - 1]].filter(Boolean) as Attempt[];
  const uniquePicked = [...new Map(picked.map((attempt) => [attempt.filePath, attempt])).values()];
  const snippets: Record<string, unknown> = {};
  uniquePicked.forEach((attempt, index) => {
    const metric = metricByFile.get(attempt.filePath);
    snippets[index === 0 ? "firstVersion" : attempt.result === "AC" ? "firstAcOrBestVersion" : "finalVersion"] = {
      filePath: attempt.filePath,
      result: attempt.result,
      score: attempt.score,
      metrics: {
        nonEmptyLineCount: getNumber(metric, "nonEmptyLineCount"),
        maxBraceDepth: getNumber(metric, "maxBraceDepth"),
        riskFlags: arrayOfStrings(metric?.riskFlags),
      },
      snippetPolicy: "Full source is intentionally omitted. Use this file path for manual local review when needed.",
    };
  });
  return snippets;
}

function inferClusterErrorTypes(cluster: ProblemCluster): string[] {
  const key = cluster.clusterKey;
  const errors = new Set<string>();
  if (key.includes("STATE")) errors.add("STATE_ERROR");
  if (key.includes("INIT")) errors.add("INIT_ERROR");
  if (key.includes("BOUNDARY")) errors.add("BOUNDARY_ERROR");
  if (key.includes("MODEL")) errors.add("MODEL_ERROR");
  if (key.includes("INDEX")) errors.add("INDEX_ERROR");
  if (key.includes("OVERFLOW")) errors.add("OVERFLOW_ERROR");
  if (key.includes("COMPLEXITY")) errors.add("COMPLEXITY_ERROR");
  if (key.includes("PARTIAL")) errors.add("PARTIAL_SCORE_MISSED");
  if (errors.size === 0) errors.add("IMPLEMENTATION_RISK");
  return [...errors].slice(0, 5);
}

function buildClusterTasks(module: string, errors: string[]): string[] {
  const label = MODULE_LABELS[module] ?? module;
  const tasks = [`2 道 ${label} 基础题，要求写清模型含义。`, `2 道 ${label} 中档题，限时并记录提交次数。`];
  if (errors.includes("BOUNDARY_ERROR") || errors.includes("INIT_ERROR")) tasks.push("每题提交前必须写边界和初始化检查清单。");
  if (errors.includes("PARTIAL_SCORE_MISSED")) tasks.push("至少 1 道难题拆 30/50/70 分方案，不要求直接 AC。");
  return tasks;
}

function verifyMethodFor(module: string, errors: string[]): string {
  if (module === "binary_search") return "同类题提交次数 <= 2，能独立证明 check 单调性并说明边界收缩。";
  if (module === "interval_dp") return "同类题提交次数 <= 2，能独立说明状态定义、初始化和 len 枚举顺序。";
  if (module === "dsu") return "能说明集合含义、合并条件和离散化方式，提交次数 <= 2。";
  if (errors.includes("PARTIAL_SCORE_MISSED")) return "能写出 30/50/70 分方案，并至少实现 30 分暴力。";
  return "同类题提交次数 <= 2，复盘中能说明模型、复杂度和边界。";
}

function buildProblemEvidence(vector: FeatureVector, cluster?: ProblemCluster): string[] {
  return [
    cluster ? `属于问题簇 ${cluster.clusterId}` : "未找到明确问题簇",
    `提交次数 ${vector.attemptCount}`,
    `分数轨迹 ${vector.scorePattern}`,
    vector.riskFlags.length > 0 ? `存在风险标签 ${vector.riskFlags.slice(0, 5).join(", ")}` : "静态风险较少",
    vector.codeModules.length > 0 ? `代码模块 ${vector.codeModules.slice(0, 5).join(", ")}` : "代码模块不明确",
  ];
}

function renderProblemDiagnosisMarkdown(items: ProblemDiagnosis[]): string {
  const top = [...items].sort((a, b) => b.confidence - a.confidence).slice(0, 80);
  return [
    "# 全题目级诊断清单",
    "",
    `题目总数：${items.length}`,
    "",
    ...top.map((item) => `- ${item.problemPid}：${item.mainWeakness}；错误类型：${item.likelyErrorTypes.join(", ")}；验收：${item.trainingAction.verifyMethod}`),
    "",
  ].join("\n");
}

function hypothesisFor(module: string, errorGroup: string, scorePattern = "", difficultyBand = ""): string {
  if (module === "interval_dp") return "区间 DP 的状态设计、初始化和枚举顺序不稳定";
  if (module === "dsu") return "并查集的集合含义、合并条件或离散化细节不稳定";
  if (module === "binary_search") return "二分答案的 check 单调性和边界处理不稳定";
  if (module === "segment_tree") return "线段树模板、区间边界和懒标记细节不稳定";
  if (module === "fenwick_tree") return "树状数组下标和前缀关系不稳定";
  if (module === "dp") return "DP 状态、转移和初始化需要进一步稳定";
  if (module === "partial_score" || scorePattern.includes("PARTIAL")) return "难题部分分拆解和得分策略不足";
  if (errorGroup.includes("OVERFLOW")) return "数据范围和整型溢出判断不稳定";
  if (difficultyBand.includes("省选")) return "高难题部分分与取舍策略不足";
  return `${MODULE_LABELS[module] ?? module} 相关建模或实现稳定性不足`;
}

function trainingRecommendation(module: string, errors: string[]): string {
  return buildClusterTasks(module, errors).join("；");
}

function trainingActionForError(errorType: string): string {
  const map: Record<string, string> = {
    BOUNDARY_ERROR: "安排边界专项题，并强制提交前检查。",
    STATE_ERROR: "每道 DP 题先写状态定义和转移表。",
    INIT_ERROR: "训练初始化和多测清空，提交前列初始化清单。",
    MODEL_ERROR: "训练题意到模型的转化，写清变量/集合/图含义。",
    INDEX_ERROR: "安排数组下标和区间边界专项。",
    OVERFLOW_ERROR: "训练数据范围估算和 long long 使用规范。",
    PARTIAL_SCORE_MISSED: "训练 30/50/70 分子任务拆解。",
    DEBUG_TIMEOUT: "重做高提交次数题，限制调试时间并记录止损点。",
  };
  return map[errorType] ?? "安排同类题复盘和重做。";
}

function simplifyErrorGroup(error: string): string {
  if (["STATE_ERROR", "TRANSITION_ERROR", "INIT_ERROR", "BOUNDARY_ERROR"].includes(error)) return "STATE_INIT_BOUNDARY";
  if (["MODEL_ERROR", "TEMPLATE_UNFAMILIAR"].includes(error)) return "MODEL_TEMPLATE";
  if (["INDEX_ERROR", "BOUNDARY_ERROR"].includes(error)) return "INDEX_BOUNDARY";
  if (["OVERFLOW_ERROR"].includes(error)) return "OVERFLOW";
  if (["COMPLEXITY_ERROR"].includes(error)) return "COMPLEXITY";
  if (["PARTIAL_SCORE_MISSED", "STRATEGY_ERROR"].includes(error)) return "PARTIAL_SCORE";
  return error;
}

function humanErrorGroup(group: string): string {
  const map: Record<string, string> = {
    STATE_INIT_BOUNDARY: "状态、初始化和边界问题",
    MODEL_TEMPLATE: "建模和模板熟练度问题",
    INDEX_BOUNDARY: "下标和边界问题",
    OVERFLOW: "数据范围和溢出问题",
    COMPLEXITY: "复杂度和剪枝问题",
    PARTIAL_SCORE: "部分分策略问题",
  };
  return map[group] ?? group;
}

function confidenceFor(cluster: ProblemCluster): number {
  const base = 0.45 + Math.min(cluster.problemCount / 20, 0.2) + Math.min(cluster.avgAttempts / 10, 0.15) + Math.min(cluster.weaknessScore / 100, 0.2);
  return round(Math.min(base, 0.92));
}

function confidenceLevel(value: number): string {
  if (value >= 0.78) return "HIGH";
  if (value >= 0.58) return "MEDIUM";
  if (value > 0) return "LOW";
  return "UNKNOWN";
}

function normalizeScore(value: number): number {
  return round(Math.max(0, Math.min(100, value)));
}

function isVolatile(scores: number[]): boolean {
  if (scores.length < 3) return false;
  let changes = 0;
  for (let index = 1; index < scores.length; index += 1) {
    if ((scores[index] ?? 0) < (scores[index - 1] ?? 0)) changes += 1;
  }
  return changes >= 2;
}

function isRecent(value: string | null): boolean {
  if (!value) return false;
  const days = (Date.now() - Date.parse(value)) / 86_400_000;
  return Number.isFinite(days) && days <= 120;
}

function commonValues(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
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
    if (!isObject(current)) return undefined;
    return current[part];
  }, source);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function avg(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function max(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length > 0 ? Math.max(...filtered) : 0;
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

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
