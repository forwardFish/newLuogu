import fs from "fs/promises";
import path from "path";
import { chromium, type Page } from "playwright";
import { sha1 } from "@/src/lib/hash";
import { normalizeRecordPage } from "@/src/server/luogu/luogu-normalizer";
import type { NormalizedSubmission, RawHttpResponse } from "@/src/server/luogu/luogu-types";

interface Args {
  uid: string;
  cdpUrl: string;
  maxPages: number;
  intervalMs: number;
  stopWhenEmptyPageCount: number;
  outDir: string;
}

interface RawPageFile {
  page: number;
  url: string;
  status: number;
  contentType: string | null;
  fetchedAt: string;
  rawText: string;
  json: unknown | null;
  recordsParsed: number;
}

interface AttemptStat {
  problemPid: string;
  problemTitle?: string;
  totalAttempts: number;
  acAttempts: number;
  wrongAttempts: number;
  firstSubmitTime?: string;
  firstAcTime?: string;
  lastSubmitTime?: string;
  isAc: boolean;
  bestScore?: number;
  mainErrorType?: string;
  hardStuck: boolean;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(args.outDir);
  const pagesDir = path.join(runDir, "raw-pages");
  await fs.mkdir(pagesDir, { recursive: true });

  const browser = await chromium.connectOverCDP(args.cdpUrl);
  const context = browser.contexts()[0] ?? (await browser.newContext());
  const page = context.pages()[0] ?? (await context.newPage());

  const rawPages: RawPageFile[] = [];
  const submissions: NormalizedSubmission[] = [];
  const errors: string[] = [];
  let emptyPages = 0;

  try {
    await page.goto(`https://www.luogu.com.cn/user/${args.uid}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    for (let pageNo = 1; pageNo <= args.maxPages; pageNo += 1) {
      const result = await fetchRecordPageInBrowser(page, args.uid, pageNo);
      const rawResponse: RawHttpResponse = {
        url: result.url,
        status: result.status,
        ok: result.status >= 200 && result.status < 300,
        body: result.rawText,
        json: result.json ?? undefined,
        fetchedAt: result.fetchedAt
      };
      const normalized = normalizeRecordPage(args.uid, rawResponse);
      const rawPage: RawPageFile = {
        ...result,
        recordsParsed: normalized.length
      };
      rawPages.push(rawPage);
      submissions.push(...normalized);

      await fs.writeFile(
        path.join(pagesDir, `records-page-${String(pageNo).padStart(3, "0")}.json`),
        JSON.stringify(rawPage, null, 2),
        "utf8"
      );

      if (isLoginHtml(result.rawText, result.url)) {
        errors.push(`page ${pageNo}: login_required_or_not_authorized`);
        break;
      }
      if (normalized.length === 0) emptyPages += 1;
      else emptyPages = 0;
      if (emptyPages >= args.stopWhenEmptyPageCount) break;
      await sleep(args.intervalMs);
    }
  } finally {
    await browser.close();
  }

  const dedupedSubmissions = dedupeSubmissions(submissions);
  const attemptStats = buildAttemptStats(dedupedSubmissions);
  const summary = {
    uid: args.uid,
    source: "luogu-browser-cdp-record-list",
    fetchedAt: new Date().toISOString(),
    pagesFetched: rawPages.length,
    rawRecordsParsed: submissions.length,
    submissionsDeduped: dedupedSubmissions.length,
    totalAttemptedProblems: attemptStats.length,
    totalAcProblems: attemptStats.filter((item) => item.isAc).length,
    totalUnsolvedProblems: attemptStats.filter((item) => !item.isAc).length,
    hardStuckProblemCount: attemptStats.filter((item) => item.hardStuck).length,
    errors
  };

  await fs.writeFile(path.join(runDir, "raw_snapshots.json"), JSON.stringify(rawPages, null, 2), "utf8");
  await fs.writeFile(path.join(runDir, "submissions.json"), JSON.stringify(dedupedSubmissions, null, 2), "utf8");
  await fs.writeFile(path.join(runDir, "problem_attempt_stats.json"), JSON.stringify(attemptStats, null, 2), "utf8");
  await fs.writeFile(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  await fs.mkdir(path.resolve("data/import"), { recursive: true });
  await fs.writeFile(
    path.resolve("data/import", `luogu-${args.uid}-latest.json`),
    JSON.stringify(
      {
        summary,
        rawSnapshots: rawPages,
        submissions: dedupedSubmissions,
        problemAttemptStats: attemptStats
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(JSON.stringify({ runDir, summary }, null, 2));
}

async function fetchRecordPageInBrowser(page: Page, uid: string, pageNo: number) {
  return page.evaluate(
    async ({ uid: innerUid, pageNo: innerPageNo }) => {
      const url = `/record/list?user=${encodeURIComponent(innerUid)}&page=${innerPageNo}&_contentOnly=1`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "x-luogu-type": "content-only",
          Accept: "application/json,text/html;q=0.9,*/*;q=0.8"
        },
        cache: "no-store"
      });
      const rawText = await response.text();
      let json: unknown | null = null;
      try {
        json = JSON.parse(rawText);
      } catch {
        json = null;
      }
      return {
        page: innerPageNo,
        url: response.url,
        status: response.status,
        contentType: response.headers.get("content-type"),
        fetchedAt: new Date().toISOString(),
        rawText,
        json
      };
    },
    { uid, pageNo }
  );
}

function buildAttemptStats(submissions: NormalizedSubmission[]): AttemptStat[] {
  const byPid = new Map<string, NormalizedSubmission[]>();
  for (const submission of submissions) {
    const list = byPid.get(submission.problemPid) ?? [];
    list.push(submission);
    byPid.set(submission.problemPid, list);
  }

  return Array.from(byPid.entries())
    .map(([problemPid, items]) => {
      const sorted = [...items].sort((a, b) => timeValue(a.submitTime) - timeValue(b.submitTime));
      const acItems = sorted.filter((item) => item.normalizedResult === "AC");
      const wrongItems = sorted.filter((item) => item.normalizedResult !== "AC");
      const scores = sorted.map((item) => item.score).filter((score): score is number => typeof score === "number");
      return {
        problemPid,
        problemTitle: sorted.find((item) => item.problemTitle)?.problemTitle,
        totalAttempts: sorted.length,
        acAttempts: acItems.length,
        wrongAttempts: wrongItems.length,
        firstSubmitTime: sorted[0]?.submitTime,
        firstAcTime: acItems[0]?.submitTime,
        lastSubmitTime: sorted[sorted.length - 1]?.submitTime,
        isAc: acItems.length > 0,
        bestScore: scores.length ? Math.max(...scores) : undefined,
        mainErrorType: mostCommon(wrongItems.map((item) => item.normalizedResult)),
        hardStuck: (sorted.length >= 5 && acItems.length === 0) || sorted.length >= 8
      };
    })
    .sort((a, b) => timeValue(b.lastSubmitTime) - timeValue(a.lastSubmitTime));
}

function dedupeSubmissions(submissions: NormalizedSubmission[]) {
  const seen = new Set<string>();
  const result: NormalizedSubmission[] = [];
  for (const submission of submissions) {
    const key =
      submission.luoguRecordId ??
      sha1(
        JSON.stringify({
          problemPid: submission.problemPid,
          normalizedResult: submission.normalizedResult,
          score: submission.score ?? null,
          submitTime: submission.submitTime ?? null,
          language: submission.language ?? null
        })
      );
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(submission);
  }
  return result;
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function timeValue(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isLoginHtml(text: string, url: string) {
  return /\/auth\/login|登录|登陆|Welcome - Luogu Spilopelia/i.test(`${url}\n${text.slice(0, 2000)}`);
}

function parseArgs(argv: string[]): Args {
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    values.set(arg.slice(2), argv[i + 1]);
    i += 1;
  }
  const uid = values.get("uid") ?? "1024038";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return {
    uid,
    cdpUrl: values.get("cdp-url") ?? "http://127.0.0.1:9223",
    maxPages: Number(values.get("max-pages") ?? 20),
    intervalMs: Number(values.get("interval-ms") ?? 800),
    stopWhenEmptyPageCount: Number(values.get("stop-empty-pages") ?? 2),
    outDir: values.get("out-dir") ?? path.join("data", "crawl", `luogu-${uid}-${timestamp}`)
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
