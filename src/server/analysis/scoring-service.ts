export interface FeatureJson {
  dataSummary: {
    dataQualityScore: number;
    confidenceLevel: string;
  };
  activityFeatures: {
    activeDaysLast30: number;
  };
  difficultyFeatures: {
    top20SolvedDifficultyAvg: number;
  };
  resultFeatures: {
    acRate: number;
    reRate: number;
    ceRate: number;
    tleRate: number;
  };
  attemptFeatures: {
    avgAttemptsToAc: number;
    oneShotAcRate: number;
  };
  knowledgeFeatures: {
    knowledgeStats: Array<{
      code: string;
      solvedProblemCount: number;
      score: number;
    }>;
  };
  cspReadinessFeatures: {
    t1StabilityScore: number;
    t2SolvingScore: number;
    t3PartialScore: number;
    t4StrategyScore: number;
  };
}

export class ScoringService {
  score(feature: FeatureJson) {
    const abilityScores = {
      knowledgeCoverage: calcKnowledgeCoverageScore(feature.knowledgeFeatures.knowledgeStats),
      difficultyCeiling: calcDifficultyCeilingScore(feature.difficultyFeatures.top20SolvedDifficultyAvg),
      submissionStability: calcSubmissionStabilityScore(feature.resultFeatures.acRate),
      implementation: calcImplementationScore({
        reRate: feature.resultFeatures.reRate,
        ceRate: feature.resultFeatures.ceRate,
        avgAttemptsToAc: feature.attemptFeatures.avgAttemptsToAc,
        oneShotAcRate: feature.attemptFeatures.oneShotAcRate
      }),
      trainingConsistency: calcTrainingConsistencyScore(feature.activityFeatures.activeDaysLast30),
      cspReadiness: calcCspReadinessScore(feature.cspReadinessFeatures)
    };
    const totalScore = Math.round(
      abilityScores.knowledgeCoverage * 0.2 +
        abilityScores.difficultyCeiling * 0.2 +
        abilityScores.submissionStability * 0.15 +
        abilityScores.implementation * 0.15 +
        abilityScores.trainingConsistency * 0.1 +
        abilityScores.cspReadiness * 0.2
    );
    return {
      abilityScores,
      totalScore,
      level: totalScore >= 85 ? "A" : totalScore >= 70 ? "B" : totalScore >= 55 ? "C" : "D",
      analysisConfidence: Math.round((feature.dataSummary.dataQualityScore / 100) * 100) / 100
    };
  }
}

export function calcDifficultyCeilingScore(top20SolvedDifficultyAvg: number) {
  if (top20SolvedDifficultyAvg >= 5.5) return 95;
  if (top20SolvedDifficultyAvg >= 5.0) return 85;
  if (top20SolvedDifficultyAvg >= 4.5) return 75;
  if (top20SolvedDifficultyAvg >= 4.0) return 65;
  if (top20SolvedDifficultyAvg >= 3.5) return 55;
  if (top20SolvedDifficultyAvg >= 3.0) return 45;
  return 30;
}

export function calcSubmissionStabilityScore(acRate: number) {
  if (acRate >= 0.55) return 90;
  if (acRate >= 0.45) return 80;
  if (acRate >= 0.35) return 65;
  if (acRate >= 0.25) return 50;
  return 35;
}

export function calcImplementationScore(input: {
  reRate: number;
  ceRate: number;
  avgAttemptsToAc: number;
  oneShotAcRate: number;
}) {
  let score = 100;
  score -= input.reRate * 100 * 0.8;
  score -= input.ceRate * 100 * 0.6;
  if (input.avgAttemptsToAc > 5) score -= 25;
  else if (input.avgAttemptsToAc > 3) score -= 15;
  else if (input.avgAttemptsToAc > 2) score -= 8;
  if (input.oneShotAcRate > 0.4) score += 5;
  return clamp(score);
}

export function calcTrainingConsistencyScore(activeDaysLast30: number) {
  if (activeDaysLast30 >= 24) return 100;
  if (activeDaysLast30 >= 18) return 85;
  if (activeDaysLast30 >= 12) return 70;
  if (activeDaysLast30 >= 6) return 50;
  return 30;
}

function calcCspReadinessScore(input: FeatureJson["cspReadinessFeatures"]) {
  return Math.round(
    input.t1StabilityScore * 0.35 +
      input.t2SolvingScore * 0.3 +
      input.t3PartialScore * 0.25 +
      input.t4StrategyScore * 0.1
  );
}

function calcKnowledgeCoverageScore(stats: FeatureJson["knowledgeFeatures"]["knowledgeStats"]) {
  const coreCodes = [
    "implementation",
    "binary_search",
    "greedy",
    "prefix_sum",
    "difference",
    "search",
    "knapsack_dp",
    "linear_dp",
    "interval_dp",
    "tree_dp",
    "bfs_dfs_graph",
    "shortest_path",
    "mst",
    "toposort",
    "dsu",
    "fenwick",
    "segment_tree",
    "number_theory",
    "combinatorics"
  ];
  const byCode = new Map(stats.map((stat) => [stat.code, stat]));
  const covered = coreCodes.filter((code) => {
    const stat = byCode.get(code);
    return stat && (stat.solvedProblemCount >= 3 || stat.score >= 70);
  }).length;
  return Math.round((covered / coreCodes.length) * 100);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
