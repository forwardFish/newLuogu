import { jsonResponse } from "@/src/lib/json";
import { readLocalJson, readLocalText, runPnpm } from "@/src/server/local-loop/local-loop-files";

export const runtime = "nodejs";

export async function GET() {
  const report = await readLocalJson("data/local-loop/parent_weekly_report.json", null);
  const markdown = await readLocalText("data/local-loop/parent_weekly_report.md");
  const scoreCurve = await readLocalJson("data/local-loop/score_curve.json", null);
  return jsonResponse({ status: report ? "OK" : "NO_WEEKLY_REPORT", report, markdown, scoreCurve });
}

export async function POST() {
  const run = await runPnpm(["csps200:parent-week"]);
  const report = await readLocalJson("data/local-loop/parent_weekly_report.json", null);
  return jsonResponse({ status: report ? "OK" : "NO_WEEKLY_REPORT", run, report });
}
