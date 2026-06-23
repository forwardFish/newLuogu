import { z } from "zod";
import { jsonResponse } from "@/src/lib/json";
import { BaselineAnalysisService } from "@/src/server/analysis/baseline-analysis-service";

const schema = z.object({
  subjectId: z.coerce.bigint(),
  syncJobId: z.coerce.bigint().optional(),
  target: z.literal("CSP-S_FIRST_PRIZE").default("CSP-S_FIRST_PRIZE")
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonResponse({ error: parsed.error.flatten() }, { status: 400 });
  const report = await new BaselineAnalysisService().generate(parsed.data);
  return jsonResponse({
    analysisReportId: report.id,
    totalScore: report.totalScore,
    level: report.level,
    analysisConfidence: Number(report.analysisConfidence),
    llmSummary: report.llmReportText?.slice(0, 240) ?? ""
  });
}
