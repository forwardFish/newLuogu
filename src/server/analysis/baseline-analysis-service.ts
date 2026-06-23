import { prisma } from "@/src/lib/prisma";
import { toJsonValue } from "@/src/lib/json";
import { FeatureExtractorService } from "@/src/server/features/feature-extractor-service";
import { DataQualityService } from "@/src/server/quality/data-quality-service";
import { LLMService } from "@/src/server/llm/llm-service";
import { extractCspReadiness } from "./csp-readiness-service";
import { ScoringService, type FeatureJson } from "./scoring-service";
import { WeaknessDetectionService } from "./weakness-detection-service";

export class BaselineAnalysisService {
  async generate(input: { subjectId: bigint; syncJobId?: bigint; target: string }) {
    const dataQuality =
      (await new DataQualityService().latest(input.subjectId)) ??
      (await new DataQualityService().generate(input.subjectId, input.syncJobId));
    const featureSnapshot = await new FeatureExtractorService().generate({
      subjectId: input.subjectId,
      syncJobId: input.syncJobId,
      target: input.target,
      dataQualityReportId: dataQuality.id
    });
    const feature = featureSnapshot.featureJson as unknown as FeatureJson;
    const scoring = new ScoringService().score(feature);
    const cspReadiness = extractCspReadiness(feature);
    const weaknesses = new WeaknessDetectionService().detect(feature);
    const llmReportText = await new LLMService().generateBaselineCoachReport({
      dataQuality: {
        score: dataQuality.overallScore,
        confidenceLevel: dataQuality.confidenceLevel,
        issues: dataQuality.issueJson
      },
      abilityScores: scoring.abilityScores,
      cspReadiness,
      knowledgeStats: feature.knowledgeFeatures.knowledgeStats,
      weaknesses
    });
    const report = await prisma.baselineAnalysisReport.create({
      data: {
        subjectId: input.subjectId,
        syncJobId: input.syncJobId,
        featureSnapshotId: featureSnapshot.id,
        dataQualityReportId: dataQuality.id,
        target: input.target,
        totalScore: scoring.totalScore,
        level: scoring.level,
        analysisConfidence: scoring.analysisConfidence,
        abilityJson: scoring.abilityScores,
        gapJson: {
          cspReadiness,
          dataQuality: {
            score: dataQuality.overallScore,
            confidenceLevel: dataQuality.confidenceLevel,
            issues: dataQuality.issueJson
          }
        },
        weaknessJson: toJsonValue(weaknesses) as object,
        recommendationJson: toJsonValue(weaknesses.map((item) => ({
          module: item.module,
          direction: item.trainingDirection
        }))) as object,
        llmReportText
      }
    });
    await prisma.analyzedSubject.update({
      where: { id: input.subjectId },
      data: { analysisConfidence: scoring.analysisConfidence }
    });
    return report;
  }
}
