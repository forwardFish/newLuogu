import { NextRequest } from "next/server";
import { jsonResponse } from "@/src/lib/json";
import { listAttemptAnalyses, readLocalJson, runPnpm } from "@/src/server/local-loop/local-loop-files";

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
  const body = await request.json().catch(() => ({})) as { problemPid?: string };
  const args = ["tsx", "scripts/csps200-ai-post-analysis.ts", "--action", "attempt"];
  if (body.problemPid) args.push("--problemPid", body.problemPid);
  const run = await runPnpm(args);
  const reviews = await listAttemptAnalyses();
  return jsonResponse({ status: "OK", run, reviews });
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "_");
}
