import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3001";
const resultPath = path.resolve("docs/auto-execute/results/api-smoke.json");
const snapshotRoots = ["data/training", "data/local-loop", "data/mastery"];

const endpoints = [
  ["POST", "/api/subjects", { luoguUid: "1024038", displayName: "local-smoke", subjectType: "PUBLIC_UID", target: "CSP-S_FIRST_PRIZE" }],
  ["POST", "/api/sync/start", { subjectId: ":subjectId", maxRecordPages: 1, syncType: "baseline" }],
  ["GET", "/api/sync/:syncJobId"],
  ["POST", "/api/analysis/baseline", { subjectId: ":subjectId", syncJobId: ":syncJobId", target: "CSP-S_FIRST_PRIZE" }],
  ["GET", "/api/analysis/baseline/:reportId"],
  ["GET", "/api/data-quality/:subjectId"],
  ["GET", "/api/training/today"],
  ["POST", "/api/training/log", { problemPid: "P1001", unitId: "T1-basic-001", taskType: "PRACTICE_STANDARD", result: "AC", score: 100, timeMinutes: 12, submissionCount: 1 }],
  ["POST", "/api/review", { problemPid: "P1001", studentSummary: "Acceptance user note: explain the boundary decision." }],
  ["GET", "/api/report/weekly"],
  ["POST", "/api/analyze", { subjectId: ":subjectId", syncJobId: ":syncJobId", target: "CSP-S_FIRST_PRIZE" }],
  ["GET", "/api/calibration/mock"],
  ["GET", "/api/student-analysis-v2?subjectId=:subjectId&syncJobId=:syncJobId"],
  ["POST", "/api/luogu/sync", { luoguUid: "1024038", maxRecordPages: 1, syncType: "baseline" }],
  ["GET", "/api/sync/not-a-number"],
  ["GET", "/api/analysis/baseline/not-a-number"],
  ["GET", "/api/data-quality/not-a-number"],
];

const expectedStatuses = new Map([
  ["GET /api/sync/not-a-number", 400],
  ["GET /api/analysis/baseline/not-a-number", 400],
  ["GET /api/data-quality/not-a-number", 400],
]);

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(root) {
  if (!(await pathExists(root))) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function takeSnapshot() {
  const files = new Map();
  const roots = new Set();
  for (const root of snapshotRoots.map((item) => path.resolve(item))) {
    roots.add(root);
    for (const file of await listFiles(root)) {
      files.set(file, await fs.readFile(file));
    }
  }
  return { roots, files };
}

async function restoreSnapshot(snapshot) {
  for (const root of snapshot.roots) {
    if (!(await pathExists(root))) continue;
    for (const file of await listFiles(root)) {
      if (!snapshot.files.has(file)) {
        await fs.rm(file, { force: true });
      }
    }
  }
  for (const [file, content] of snapshot.files) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content);
  }
}

const flowState = {
  subjectId: "1024038",
  syncJobId: "1024038001",
  reportId: "1024038002",
};

function replaceTokens(value) {
  if (typeof value === "string") {
    return value.replaceAll(":subjectId", flowState.subjectId)
      .replaceAll(":syncJobId", flowState.syncJobId)
      .replaceAll(":reportId", flowState.reportId);
  }
  if (Array.isArray(value)) return value.map(replaceTokens);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceTokens(item)]));
  }
  return value;
}

async function runEndpoint([method, route, body]) {
  const started = Date.now();
  const actualRoute = replaceTokens(route);
  const actualBody = replaceTokens(body);
  try {
    const response = await fetch(new URL(actualRoute, baseUrl), {
      method,
      headers: actualBody ? { "content-type": "application/json" } : undefined,
      body: actualBody ? JSON.stringify(actualBody) : undefined,
    });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (route === "/api/subjects" && response.ok && json?.subjectId !== undefined) {
      flowState.subjectId = String(json.subjectId);
    }
    if (route === "/api/sync/start" && response.ok && json?.syncJobId !== undefined) {
      flowState.syncJobId = String(json.syncJobId);
    }
    if (route === "/api/analysis/baseline" && response.ok && json?.analysisReportId !== undefined) {
      flowState.reportId = String(json.analysisReportId);
    }
    const expectedStatus = expectedStatuses.get(`${method} ${route}`) ?? 200;
    return {
      method,
      path: actualRoute,
      contract: route,
      status: response.status,
      ok: response.status === expectedStatus,
      durationMs: Date.now() - started,
      sampleKeys: json && typeof json === "object" ? Object.keys(json).slice(0, 8) : [],
      statusField: json?.status,
      source: json?.source,
      expectedStatus,
    };
  } catch (error) {
    return {
      method,
      path: actualRoute,
      contract: route,
      status: null,
      ok: false,
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const snapshot = await takeSnapshot();
let results = [];
try {
  for (const endpoint of endpoints) {
    results.push(await runEndpoint(endpoint));
  }
} finally {
  await restoreSnapshot(snapshot);
}

const summary = {
  baseUrl,
  count: results.length,
  pass: results.filter((result) => result.ok).length,
  fail: results.filter((result) => !result.ok).length,
  restoredSnapshotRoots: snapshotRoots,
  results,
};

await fs.mkdir(path.dirname(resultPath), { recursive: true });
await fs.writeFile(resultPath, JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify({ count: summary.count, pass: summary.pass, fail: summary.fail, restoredSnapshotRoots: snapshotRoots }, null, 2));

if (summary.fail) {
  process.exit(1);
}
