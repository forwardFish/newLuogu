import { jsonResponse } from "@/src/lib/json";
import { DataQualityService } from "@/src/server/quality/data-quality-service";

export async function GET(_request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;
  const report = await new DataQualityService().latest(BigInt(subjectId));
  if (!report) return jsonResponse({ error: "data quality report not found" }, { status: 404 });
  return jsonResponse({
    dataQualityReportId: report.id,
    subjectId: report.subjectId,
    overallScore: report.overallScore,
    confidenceLevel: report.confidenceLevel,
    recordDepthScore: report.recordDepthScore,
    problemDetailScore: report.problemDetailScore,
    tagCoverageScore: report.tagCoverageScore,
    freshnessScore: report.freshnessScore,
    manualReviewScore: report.manualReviewScore,
    issues: report.issueJson,
    summary: report.summary,
    createdAt: report.createdAt
  });
}
