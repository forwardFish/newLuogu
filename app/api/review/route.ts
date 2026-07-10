import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { formatErrorDetail, jsonResponse } from "@/src/lib/json";
import { isDatabaseMissing } from "@/src/server/local-loop/api-fallback";
import { listAttemptAnalyses, readLocalJson, runPnpm, writeLocalJson } from "@/src/server/local-loop/local-loop-files";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const problemPid = request.nextUrl.searchParams.get("problemPid");
  if (problemPid) {
    const review = await readLocalJson(`data/local-loop/attempt-analysis/${safeFileName(problemPid)}.json`, null);
    return jsonResponse({ status: review ? "OK" : "NO_REVIEW", problemPid, review });
  }
  const reviews = await listAttemptAnalyses();
  return jsonResponse({ status: reviews.length ? "OK" : "NO_REVIEWS", reviews });
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return jsonResponse({ status: "INVALID_INPUT", error: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  let localStatus = "UNCHANGED";
  if (body.studentSummary !== undefined) {
    const log = await readLocalJson<{ items?: Array<Record<string, unknown>> }>("data/training/training_log.json", { items: [] });
    const items = Array.isArray(log.items) ? log.items.slice() : [];
    const index = [...items].reverse().findIndex((item) => String(item.problemPid ?? "") === body.problemPid);
    if (index >= 0) {
      const actualIndex = items.length - 1 - index;
      items[actualIndex] = { ...items[actualIndex], studentSummary: body.studentSummary, updatedAt: new Date().toISOString() };
      await writeLocalJson("data/training/training_log.json", { ...log, items, updatedAt: new Date().toISOString() });
      localStatus = "UPDATED";
    } else {
      return jsonResponse({ status: "NO_TRAINING_LOG", problemPid: body.problemPid }, { status: 404 });
    }
  }

  const args = ["tsx", "scripts/csps200-ai-post-analysis.ts", "--action", "attempt", "--problemPid", body.problemPid];
  const run = await runPnpm(args).catch((error) => ({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  let databaseStatus: string = "SKIPPED_NO_SUBJECT";
  if (body.subjectId) {
    try {
      const subjectId = BigInt(body.subjectId);
      const problem = await prisma.problem.findUnique({ where: { luoguPid: body.problemPid } });
      await prisma.manualReview.create({
        data: {
          subjectId,
          problemId: problem?.id,
          problemPid: body.problemPid,
          result: body.result ?? null,
          timeSpentMinutes: body.timeMinutes ?? null,
          solutionUsage: body.solutionUsage ?? "unknown",
          errorTypes: body.errorTypes ?? [],
          selfNote: body.studentSummary ?? null
        }
      });
      databaseStatus = "WRITTEN";
    } catch (error) {
      databaseStatus = isDatabaseMissing(error) ? "BLOCKED_NO_DATABASE" : `ERROR: ${formatErrorDetail(error)}`;
    }
  }
  const reviews = await listAttemptAnalyses();
  const runFailed = "ok" in run && run.ok === false;
  return jsonResponse({ status: runFailed ? "REVIEW_GENERATION_FAILED" : "OK", problemPid: body.problemPid, localStatus, databaseStatus, run, reviews }, { status: runFailed ? 500 : 200 });
}

const schema = z.object({
  problemPid: z.string().trim().min(1).max(80),
  studentSummary: z.string().max(2000).optional(),
  subjectId: z.string().regex(/^\d+$/).optional(),
  result: z.string().max(30).optional(),
  timeMinutes: z.number().int().min(0).max(600).optional(),
  solutionUsage: z.string().max(40).optional(),
  errorTypes: z.array(z.string().max(80)).max(20).optional()
});

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "_");
}
