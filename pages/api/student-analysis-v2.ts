import type { NextApiRequest, NextApiResponse } from "next";
import { StudentAnalysisV2Service } from "@/src/server/analysis/student-analysis-v2-service";
import { isDatabaseMissing, localStudentAnalysisV2 } from "@/src/server/local-loop/api-fallback";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const subjectId = Array.isArray(request.query.subjectId) ? request.query.subjectId[0] : request.query.subjectId;
    const syncJobId = Array.isArray(request.query.syncJobId) ? request.query.syncJobId[0] : request.query.syncJobId;
    if (!subjectId) return send(response, 400, { error: "Missing subjectId" });
    const report = await new StudentAnalysisV2Service().generate({
      subjectId: BigInt(subjectId),
      syncJobId: syncJobId ? BigInt(syncJobId) : undefined,
      target: "CSP-S_FIRST_PRIZE"
    });
    return send(response, 200, report);
  } catch (error) {
    if (isDatabaseMissing(error)) return send(response, 200, await localStudentAnalysisV2());
    return send(response, 400, { error: error instanceof Error ? error.message : String(error) });
  }
}

function send(response: NextApiResponse, status: number, data: unknown) {
  response.status(status).setHeader("Content-Type", "application/json");
  return response.end(JSON.stringify(data, (_key, value) => (typeof value === "bigint" ? value.toString() : value)));
}
