import { z } from "zod";
import { jsonResponse } from "@/src/lib/json";
import { BaselineAnalysisService } from "@/src/server/analysis/baseline-analysis-service";
import { StudentAnalysisV2Service } from "@/src/server/analysis/student-analysis-v2-service";
import { isDatabaseMissing, localBaselineReport, localStudentAnalysisV2 } from "@/src/server/local-loop/api-fallback";

export const runtime = "nodejs";

const schema = z.object({
  subjectId: z.coerce.bigint(),
  syncJobId: z.coerce.bigint().optional(),
  target: z.literal("CSP-S_FIRST_PRIZE").default("CSP-S_FIRST_PRIZE"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonResponse({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const baseline = await new BaselineAnalysisService().generate(parsed.data);
    const studentAnalysis = await new StudentAnalysisV2Service().generate(parsed.data);
    return jsonResponse({
      status: "OK",
      baseline: {
        analysisReportId: baseline.id,
        totalScore: baseline.totalScore,
        level: baseline.level,
        analysisConfidence: baseline.analysisConfidence,
        llmSummary: baseline.llmReportText?.slice(0, 240) ?? "",
      },
      studentAnalysis,
    });
  } catch (error) {
    if (isDatabaseMissing(error)) {
      return jsonResponse({
        status: "OK",
        baseline: await localBaselineReport(),
        studentAnalysis: await localStudentAnalysisV2(),
        source: "data/local-loop",
      });
    }
    throw error;
  }
}
