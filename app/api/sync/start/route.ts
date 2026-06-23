import { z } from "zod";
import { jsonResponse } from "@/src/lib/json";
import { SyncJobService } from "@/src/server/sync/sync-job-service";

const schema = z.object({
  subjectId: z.coerce.bigint(),
  maxRecordPages: z.coerce.number().int().positive().max(100).optional(),
  syncType: z.string().default("baseline")
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonResponse({ error: parsed.error.flatten() }, { status: 400 });
  const service = new SyncJobService();
  const job = await service.start(parsed.data);
  await service.run(job.id);
  const finished = await service.get(job.id);
  return jsonResponse({
    syncJobId: job.id,
    status: finished?.status ?? "UNKNOWN",
    progress: {
      recordPagesFetched: finished?.recordPagesFetched ?? 0,
      rawRecordsParsed: finished?.rawRecordsParsed ?? 0,
      submissionsUpserted: finished?.submissionsUpserted ?? 0,
      uniqueProblemsFound: finished?.uniqueProblemsFound ?? 0,
      problemsFetched: finished?.problemsFetched ?? 0,
      problemFetchFailed: finished?.problemFetchFailed ?? 0
    },
    errors: finished?.errorJson ?? []
  });
}
