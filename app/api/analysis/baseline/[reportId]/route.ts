import { prisma } from "@/src/lib/prisma";
import { jsonResponse } from "@/src/lib/json";

export async function GET(_request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const report = await prisma.baselineAnalysisReport.findUnique({
    where: { id: BigInt(reportId) },
    include: { dataQualityReport: true }
  });
  if (!report) return jsonResponse({ error: "baseline report not found" }, { status: 404 });
  const gap = report.gapJson as {
    cspReadiness?: unknown;
    dataQuality?: { score?: number; confidenceLevel?: string; issues?: unknown };
  };
  return jsonResponse({
    analysisReportId: report.id,
    subjectId: report.subjectId,
    totalScore: report.totalScore,
    level: report.level,
    analysisConfidence: Number(report.analysisConfidence),
    dataQuality: {
      score: gap.dataQuality?.score ?? report.dataQualityReport?.overallScore,
      confidenceLevel: gap.dataQuality?.confidenceLevel ?? report.dataQualityReport?.confidenceLevel,
      issues: gap.dataQuality?.issues ?? report.dataQualityReport?.issueJson
    },
    abilityScores: report.abilityJson,
    cspReadiness: gap.cspReadiness,
    weaknesses: report.weaknessJson,
    recommendations: report.recommendationJson,
    llmReportText: report.llmReportText
  });
}
