import type { FeatureJson } from "./scoring-service";

export function extractCspReadiness(feature: FeatureJson) {
  return {
    t1Stability: feature.cspReadinessFeatures.t1StabilityScore,
    t2Solving: feature.cspReadinessFeatures.t2SolvingScore,
    t3Partial: feature.cspReadinessFeatures.t3PartialScore,
    t4Strategy: feature.cspReadinessFeatures.t4StrategyScore
  };
}
