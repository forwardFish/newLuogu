import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const acceptanceSubjectId = process.env.ACCEPTANCE_SUBJECT_ID || "1024038";
const acceptanceSyncJobId = process.env.ACCEPTANCE_SYNC_JOB_ID || "1024038001";
const acceptanceBaselineReportId = process.env.ACCEPTANCE_BASELINE_REPORT_ID || "1024038002";
const outDir = path.resolve("docs/auto-execute/screenshots/current");
const chromeFallbacks = [
  process.env.PLAYWRIGHT_CHROME_EXECUTABLE,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  path.join(process.env.LOCALAPPDATA || "", "Microsoft\\Edge\\Application\\msedge.exe"),
].filter(Boolean);

const pages = [
  { id: "home", path: "/", viewport: { width: 1024, height: 1536 }, reference: "首页.png" },
  { id: "login", path: "/login", viewport: { width: 1484, height: 1060 }, reference: "登陆页面.png" },
  { id: "onboarding-1", path: "/onboarding", reference: "引导页-1.png" },
  { id: "onboarding-2", path: "/onboarding/step-2", reference: "引导页-2.png" },
  { id: "onboarding-3", path: "/onboarding/step-3", reference: "引导页-3.png" },
  { id: "onboarding-4", path: "/onboarding/step-4", reference: "引导页-4.png" },
  { id: "analysis-loading", path: "/analysis/loading", reference: "AI分析中.png" },
  { id: "analysis-result", path: "/analysis/result", reference: "分析结果页面.png" },
  { id: "insufficient", path: "/insufficient", reference: "补充数据.png" },
  { id: "dashboard", path: "/dashboard", viewport: { width: 1123, height: 1401 }, reference: "总览.png" },
  { id: "today", path: "/today", reference: "今日训练.png" },
  { id: "training-result", path: "/training-result", reference: "训练结果.png" },
  { id: "calendar", path: "/calendar", reference: "训练日历.png" },
  { id: "review", path: "/review", viewport: { width: 1024, height: 1536 }, reference: "AI训练复盘.png" },
  { id: "report", path: "/report", reference: "backup/家长周报.png" },
  { id: "payment", path: "/payment", reference: "付费页面.png" },
  { id: "sync", path: "/sync", reference: "同步洛谷.png" },
  { id: "ability-map", path: "/ability-map" },
  { id: "analyze", path: "/analyze" },
  { id: "baseline", path: `/baseline/${acceptanceBaselineReportId}` },
  { id: "data-quality", path: `/data-quality/${acceptanceSubjectId}` },
  { id: "settings", path: "/settings" },
  { id: "sync-job", path: `/sync/${acceptanceSyncJobId}` },
  { id: "training", path: "/training" },
];

await fs.mkdir(outDir, { recursive: true });

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Executable doesn't exist")) {
      throw error;
    }
    for (const executablePath of chromeFallbacks) {
      try {
        await fs.access(executablePath);
        return await chromium.launch({ headless: true, executablePath });
      } catch {
        // Try the next local browser path.
      }
    }
    throw error;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({
  viewport: { width: 1448, height: 1086 },
  deviceScaleFactor: 1,
});

const results = [];

for (const item of pages) {
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText || "unknown";
    const url = request.url();
    if (failure === "net::ERR_ABORTED" && url.includes("_rsc=")) {
      return;
    }
    failedRequests.push({
      url,
      failure,
    });
  });

  if (item.viewport) {
    await page.setViewportSize(item.viewport);
  } else {
    await page.setViewportSize({ width: 1448, height: 1086 });
  }

  const started = Date.now();
  const url = new URL(item.path, baseUrl).toString();
  let status = null;
  let error = null;
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    status = response?.status() ?? null;
    await page.evaluate(async () => {
      const withTimeout = (promise, timeoutMs = 1500) =>
        Promise.race([
          promise,
          new Promise((resolve) => setTimeout(resolve, timeoutMs)),
        ]);
      const visibleImages = Array.from(document.images).filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.bottom >= 0 && rect.right >= 0 && rect.top <= window.innerHeight && rect.left <= window.innerWidth;
      });
      await Promise.all(visibleImages.map((img) => withTimeout(img.decode().catch(() => undefined))));
    });
    await page.waitForTimeout(500);
  } catch (caught) {
    error = String(caught);
  }

  const screenshot = path.join(outDir, `${item.id}.png`);
  if (!error) {
    await page.screenshot({ path: screenshot, fullPage: false });
  }

  const brokenImages = error
    ? []
    : await page.evaluate(() =>
        Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.getAttribute("src") || img.currentSrc)
      );

  results.push({
    id: item.id,
    path: item.path,
    url,
    status,
    ok: !error && status !== null && status < 400 && brokenImages.length === 0 && pageErrors.length === 0 && failedRequests.length === 0,
    screenshot: error ? null : screenshot.replaceAll("\\", "/"),
    reference: item.reference ? `docs/UI/web/${item.reference}` : null,
    durationMs: Date.now() - started,
    brokenImages,
    consoleMessages,
    pageErrors,
    failedRequests,
    error,
  });
  await page.close();
}

await browser.close();

const resultPath = path.resolve("docs/auto-execute/results/visual-capture.json");
await fs.mkdir(path.dirname(resultPath), { recursive: true });
await fs.writeFile(resultPath, JSON.stringify({ baseUrl, pages: results }, null, 2), "utf8");
console.log(JSON.stringify({ baseUrl, count: results.length, failures: results.filter((item) => !item.ok).length }, null, 2));
