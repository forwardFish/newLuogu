import { jsonResponse } from "@/src/lib/json";
import { SyncJobService } from "@/src/server/sync/sync-job-service";

export async function GET(_request: Request, { params }: { params: Promise<{ syncJobId: string }> }) {
  const { syncJobId } = await params;
  const id = BigInt(syncJobId);
  const job = await new SyncJobService().get(id);
  if (!job) return jsonResponse({ error: "sync job not found" }, { status: 404 });
  return jsonResponse({
    syncJobId: job.id,
    subjectId: job.subjectId,
    status: job.status,
    progress: {
      recordPagesFetched: job.recordPagesFetched,
      rawRecordsParsed: job.rawRecordsParsed,
      submissionsUpserted: job.submissionsUpserted,
      uniqueProblemsFound: job.uniqueProblemsFound,
      problemsFetched: job.problemsFetched,
      problemFetchFailed: job.problemFetchFailed
    },
    errors: job.errorJson,
    steps: job.steps.map((step: (typeof job.steps)[number]) => ({
      stepName: step.stepName,
      status: step.status,
      errorMessage: step.errorMessage
    }))
  });
}
