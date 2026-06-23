import fs from "fs/promises";
import path from "path";
import { chromium, type Page } from "playwright";
import { sha1 } from "@/src/lib/hash";

interface Args {
  uid: string;
  cdpUrl: string;
  input: string;
  outDir: string;
  intervalMs: number;
  limit: number;
}

interface SubmissionRef {
  luoguRecordId?: string;
  problemPid: string;
  problemTitle?: string;
  normalizedResult?: string;
  score?: number;
  language?: string;
  submitTime?: string;
}

interface CodeIndexItem {
  recordId: string;
  problemPid: string;
  problemTitle?: string;
  normalizedResult?: string;
  score?: number;
  submitTime?: string;
  language?: string;
  sourceCodeLength?: number;
  codePath?: string;
  rawDetailPath?: string;
  status: "saved" | "missing_source" | "failed" | "skipped_existing";
  error?: string;
  metrics?: CodeMetrics;
}

interface CodeMetrics {
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  includeCount: number;
  functionLikeCount: number;
  loopCount: number;
  branchCount: number;
  maxLineLength: number;
  usesBitsStdCpp: boolean;
  usesDefineIntLongLong: boolean;
  usesRecursionHint: boolean;
  usesGlobalArrayHint: boolean;
  usesVector: boolean;
  usesMapSet: boolean;
  usesPriorityQueue: boolean;
  usesQueueStack: boolean;
  usesDpHint: boolean;
  usesGraphHint: boolean;
  usesModHint: boolean;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = JSON.parse(await fs.readFile(path.resolve(args.input), "utf8"));
  const submissions: SubmissionRef[] = input.submissions ?? [];
  const selected = submissions
    .filter((item) => item.luoguRecordId)
    .slice(0, args.limit > 0 ? args.limit : submissions.length);

  const outDir = path.resolve(args.outDir);
  const rawDir = path.join(outDir, "raw-record-details");
  const codeDir = path.join(outDir, "codes");
  await fs.mkdir(rawDir, { recursive: true });
  await fs.mkdir(codeDir, { recursive: true });

  const browser = await chromium.connectOverCDP(args.cdpUrl);
  const context = browser.contexts()[0] ?? (await browser.newContext());
  const page = context.pages()[0] ?? (await context.newPage());

  const items: CodeIndexItem[] = [];
  const errors: string[] = [];

  try {
    await page.goto(`https://www.luogu.com.cn/user/${args.uid}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    for (let i = 0; i < selected.length; i += 1) {
      const submission = selected[i];
      const recordId = String(submission.luoguRecordId);
      const rawDetailPath = path.join(rawDir, `${recordId}.json`);
      const existing = await readExistingCodeIndex(rawDetailPath, codeDir, submission);
      if (existing) {
        items.push(existing);
        continue;
      }

      try {
        const detail = await fetchRecordDetail(page, recordId);
        await fs.writeFile(rawDetailPath, JSON.stringify(detail, null, 2), "utf8");
        const record = detail.json?.currentData?.record;
        const sourceCode = typeof record?.sourceCode === "string" ? record.sourceCode : "";
        if (!sourceCode) {
          items.push({
            recordId,
            problemPid: submission.problemPid,
            problemTitle: submission.problemTitle,
            normalizedResult: submission.normalizedResult,
            score: submission.score,
            submitTime: submission.submitTime,
            language: String(record?.language ?? submission.language ?? ""),
            rawDetailPath,
            status: "missing_source"
          });
        } else {
          const ext = inferExtension(sourceCode, record?.language ?? submission.language);
          const codePath = path.join(
            codeDir,
            `${recordId}_${sanitizeFilename(submission.problemPid)}_${submission.normalizedResult ?? "UNKNOWN"}.${ext}`
          );
          await fs.writeFile(codePath, sourceCode, "utf8");
          items.push({
            recordId,
            problemPid: submission.problemPid,
            problemTitle: submission.problemTitle,
            normalizedResult: submission.normalizedResult,
            score: submission.score,
            submitTime: submission.submitTime,
            language: String(record?.language ?? submission.language ?? ""),
            sourceCodeLength: record?.sourceCodeLength,
            codePath,
            rawDetailPath,
            status: "saved",
            metrics: analyzeCode(sourceCode)
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${recordId}: ${message}`);
        items.push({
          recordId,
          problemPid: submission.problemPid,
          problemTitle: submission.problemTitle,
          normalizedResult: submission.normalizedResult,
          score: submission.score,
          submitTime: submission.submitTime,
          status: "failed",
          error: message
        });
      }

      if ((i + 1) % 50 === 0) {
        await writeOutputs(outDir, args.uid, items, errors, false);
        console.log(`saved ${i + 1}/${selected.length}`);
      }
      await sleep(args.intervalMs);
    }
  } finally {
    await browser.close();
  }

  await writeOutputs(outDir, args.uid, items, errors, true);
  await fs.mkdir(path.resolve("data/import"), { recursive: true });
  await fs.writeFile(
    path.resolve("data/import", `luogu-${args.uid}-code-latest.json`),
    JSON.stringify(buildSummary(args.uid, items, errors), null, 2),
    "utf8"
  );
  console.log(JSON.stringify({ outDir, summary: buildSummary(args.uid, items, errors).summary }, null, 2));
}

async function fetchRecordDetail(page: Page, recordId: string) {
  return page.evaluate(async (innerRecordId) => {
    const response = await fetch(`/record/${innerRecordId}?_contentOnly=1`, {
      credentials: "include",
      headers: {
        "x-luogu-type": "content-only",
        Accept: "application/json"
      },
      cache: "no-store"
    });
    const rawText = await response.text();
    let json: any = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      json = null;
    }
    return {
      recordId: innerRecordId,
      url: response.url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      fetchedAt: new Date().toISOString(),
      rawText,
      json
    };
  }, recordId);
}

async function readExistingCodeIndex(rawDetailPath: string, codeDir: string, submission: SubmissionRef) {
  try {
    const recordId = String(submission.luoguRecordId);
    await fs.access(rawDetailPath);
    const files = await fs.readdir(codeDir).catch(() => []);
    const codeFile = files.find((file) => file.startsWith(`${recordId}_`));
    if (!codeFile) return null;
    const codePath = path.join(codeDir, codeFile);
    const source = await fs.readFile(codePath, "utf8");
    return {
      recordId,
      problemPid: submission.problemPid,
      problemTitle: submission.problemTitle,
      normalizedResult: submission.normalizedResult,
      score: submission.score,
      submitTime: submission.submitTime,
      codePath,
      rawDetailPath,
      status: "skipped_existing" as const,
      metrics: analyzeCode(source)
    };
  } catch {
    return null;
  }
}

async function writeOutputs(outDir: string, uid: string, items: CodeIndexItem[], errors: string[], final: boolean) {
  const payload = buildSummary(uid, items, errors);
  await fs.writeFile(path.join(outDir, "code_files_index.json"), JSON.stringify(items, null, 2), "utf8");
  await fs.writeFile(path.join(outDir, "code_analysis_summary.json"), JSON.stringify(payload, null, 2), "utf8");
  if (final) {
    await fs.writeFile(path.join(outDir, "DONE"), new Date().toISOString(), "utf8");
  }
}

function buildSummary(uid: string, items: CodeIndexItem[], errors: string[]) {
  const saved = items.filter((item) => item.status === "saved" || item.status === "skipped_existing");
  const metrics = saved.map((item) => item.metrics).filter((item): item is CodeMetrics => Boolean(item));
  const byResult = countBy(saved, (item) => item.normalizedResult ?? "UNKNOWN");
  return {
    summary: {
      uid,
      fetchedAt: new Date().toISOString(),
      totalRecordsSeen: items.length,
      codeFilesSaved: saved.length,
      missingSource: items.filter((item) => item.status === "missing_source").length,
      failed: items.filter((item) => item.status === "failed").length,
      byResult,
      avgNonEmptyLines: average(metrics.map((item) => item.nonEmptyLines)),
      avgMaxLineLength: average(metrics.map((item) => item.maxLineLength)),
      usesBitsStdCppCount: metrics.filter((item) => item.usesBitsStdCpp).length,
      usesDefineIntLongLongCount: metrics.filter((item) => item.usesDefineIntLongLong).length,
      usesGlobalArrayHintCount: metrics.filter((item) => item.usesGlobalArrayHint).length,
      usesRecursionHintCount: metrics.filter((item) => item.usesRecursionHint).length,
      errors: errors.slice(0, 50)
    },
    topLargeFiles: saved
      .filter((item) => item.metrics)
      .sort((a, b) => (b.metrics?.nonEmptyLines ?? 0) - (a.metrics?.nonEmptyLines ?? 0))
      .slice(0, 20)
      .map(publicIndexItem),
    topLongLineFiles: saved
      .filter((item) => item.metrics)
      .sort((a, b) => (b.metrics?.maxLineLength ?? 0) - (a.metrics?.maxLineLength ?? 0))
      .slice(0, 20)
      .map(publicIndexItem),
    failedOrMissing: items
      .filter((item) => item.status === "failed" || item.status === "missing_source")
      .slice(0, 100)
      .map(publicIndexItem)
  };
}

function publicIndexItem(item: CodeIndexItem) {
  return {
    recordId: item.recordId,
    problemPid: item.problemPid,
    problemTitle: item.problemTitle,
    normalizedResult: item.normalizedResult,
    score: item.score,
    submitTime: item.submitTime,
    codePath: item.codePath,
    status: item.status,
    error: item.error,
    metrics: item.metrics
  };
}

function analyzeCode(source: string): CodeMetrics {
  const lines = source.split(/\r?\n/);
  const nonEmptyLines = lines.filter((line) => line.trim()).length;
  const stripped = stripComments(source);
  return {
    bytes: Buffer.byteLength(source, "utf8"),
    lines: lines.length,
    nonEmptyLines,
    includeCount: matchCount(stripped, /^\s*#\s*include/gm),
    functionLikeCount: matchCount(stripped, /\b[a-zA-Z_][\w:<>,\s*&]*\s+[a-zA-Z_]\w*\s*\([^;{}]*\)\s*\{/g),
    loopCount: matchCount(stripped, /\b(for|while)\s*\(/g),
    branchCount: matchCount(stripped, /\b(if|else if|switch)\b/g),
    maxLineLength: Math.max(0, ...lines.map((line) => line.length)),
    usesBitsStdCpp: /#\s*include\s*<bits\/stdc\+\+\.h>/.test(stripped),
    usesDefineIntLongLong: /#\s*define\s+int\s+long\s+long/.test(stripped),
    usesRecursionHint: /\bdfs\s*\(|\bsolve\s*\([^;]*\)\s*\{[\s\S]*\bsolve\s*\(/.test(stripped),
    usesGlobalArrayHint: /^\s*(?:int|long long|double|bool|char)\s+\w+\s*\[[^\]]+\]/m.test(stripped),
    usesVector: /\bvector\s*</.test(stripped),
    usesMapSet: /\b(map|set|unordered_map|unordered_set)\s*</.test(stripped),
    usesPriorityQueue: /\bpriority_queue\s*</.test(stripped),
    usesQueueStack: /\b(queue|stack|deque)\s*</.test(stripped),
    usesDpHint: /\bdp\b|\bf\b\s*\[/.test(stripped),
    usesGraphHint: /\b(edge|edges|head|to|nxt|adj|g)\b/.test(stripped) && /\b(add|push_back)\b/.test(stripped),
    usesModHint: /\bmod\b|1000000007|998244353/.test(stripped)
  };
}

function stripComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function inferExtension(source: string, language: unknown) {
  const lang = String(language ?? "").toLowerCase();
  if (lang.includes("python") || /^\s*import\s+\w+/m.test(source)) return "py";
  if (lang.includes("java") || /\bpublic\s+class\b/.test(source)) return "java";
  if (lang.includes("c++") || /#\s*include|using\s+namespace\s+std/.test(source)) return "cpp";
  if (lang.includes("c")) return "c";
  return "txt";
}

function sanitizeFilename(value: string) {
  return value.replace(/[^\w.-]+/g, "_").slice(0, 80);
}

function matchCount(source: string, pattern: RegExp) {
  return source.match(pattern)?.length ?? 0;
}

function countBy<T>(items: T[], keyFn: (item: T) => string) {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
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
    input: values.get("input") ?? path.join("data", "import", `luogu-${uid}-latest.json`),
    outDir: values.get("out-dir") ?? path.join("data", "code", `luogu-${uid}-${timestamp}`),
    intervalMs: Number(values.get("interval-ms") ?? 800),
    limit: Number(values.get("limit") ?? 0)
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
