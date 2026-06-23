import type { Weakness } from "@/src/server/analysis/weakness-detection-service";

export interface BaselineCoachReportInput {
  dataQuality: unknown;
  abilityScores: unknown;
  cspReadiness: unknown;
  knowledgeStats: unknown;
  weaknesses: Weakness[];
}
