import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { jsonResponse } from "@/src/lib/json";
import { SyncJobService } from "@/src/server/sync/sync-job-service";

export const runtime = "nodejs";

const schema = z.object({
  subjectId: z.coerce.bigint().optional(),
  luoguUid: z.string().trim().regex(/^\d+$/).optional(),
  displayName: z.string().trim().optional(),
  maxRecordPages: z.coerce.number().int().positive().max(100).optional(),
  syncType: z.string().default("baseline"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonResponse({ error: parsed.error.flatten() }, { status: 400 });
  if (!parsed.data.subjectId && !parsed.data.luoguUid) return jsonResponse({ error: "subjectId or luoguUid is required" }, { status: 400 });

  const subjectId = parsed.data.subjectId ?? (await prisma.analyzedSubject.upsert({
    where: { luoguUid_subjectType: { luoguUid: parsed.data.luoguUid!, subjectType: "PUBLIC_UID" } },
    update: { displayName: parsed.data.displayName },
    create: {
      luoguUid: parsed.data.luoguUid!,
      displayName: parsed.data.displayName,
      subjectType: "PUBLIC_UID",
      target: "CSP-S_FIRST_PRIZE",
    },
  })).id;

  const service = new SyncJobService();
  const job = await service.start({ subjectId, maxRecordPages: parsed.data.maxRecordPages, syncType: parsed.data.syncType });
  await service.run(job.id);
  const finished = await service.get(job.id);
  return jsonResponse({ status: finished?.status ?? "UNKNOWN", syncJobId: job.id, subjectId, progress: finished, errors: finished?.errorJson ?? [] });
}
