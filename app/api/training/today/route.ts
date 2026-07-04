import { jsonResponse } from "@/src/lib/json";
import { readLocalJson, readLocalText, runPnpm } from "@/src/server/local-loop/local-loop-files";

export const runtime = "nodejs";

export async function GET() {
  const today = await readLocalJson("data/local-loop/today.json", null);
  const markdown = await readLocalText("data/local-loop/today.md");
  const tuning = await readLocalJson("data/local-loop/tuning_report.json", null);
  return jsonResponse({ status: today ? "OK" : "NO_TODAY_REPORT", today, markdown, tuning });
}

export async function POST() {
  const run = await runPnpm(["csps200:today"]);
  const today = await readLocalJson("data/local-loop/today.json", null);
  return jsonResponse({ status: today ? "OK" : "NO_TODAY_REPORT", run, today });
}
