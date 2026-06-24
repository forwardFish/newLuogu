import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;

export type DeepSeekDiagnosisConfig = {
  providerId: "deepseek";
  providerLabel: "DeepSeek";
  apiKey: string;
  baseUrl: string;
  model: string;
  requestTimeoutMs: number;
  maxTokens: number;
  temperature: number;
  concurrency: number;
  limit: number | null;
  requireReal: boolean;
  envSources: string[];
};

export type DeepSeekClusterDiagnosis = {
  clusterDiagnosis: string;
  commonErrorTypes: string[];
  evidenceSummary: string[];
  trainingAction: {
    module: string;
    tasks: string[];
    verifyMethod: string;
  };
  confidence: number;
  confidenceLevel?: string;
};

export type DeepSeekTrace = {
  clusterId: string;
  status: "SUCCESS" | "PROVIDER_FAILURE" | "SKIPPED";
  providerId: string;
  model: string;
  baseUrl: string;
  latencyMs: number;
  errorMessage?: string;
  requestSummary: {
    clusterId: string;
    representativeProblemCount: number;
    payloadBytes: number;
  };
};

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-pro";
const ALLOWED_ENV_KEYS = [
  "AI_API_KEY",
  "AI_BASE_URL",
  "AI_MODEL",
  "AI_REQUEST_TIMEOUT_MS",
  "AI_MAX_TOKENS",
  "AI_TEMPERATURE",
  "DIAGNOSIS_LLM_CONCURRENCY",
  "DIAGNOSIS_LLM_LIMIT",
  "DIAGNOSIS_LLM_REQUIRE_REAL",
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_BASE_URL",
  "DEEPSEEK_MODEL",
];

export async function resolveDeepSeekDiagnosisConfig(projectRoot = process.cwd()): Promise<DeepSeekDiagnosisConfig | null> {
  const loaded = await loadAiEnv(projectRoot);
  const apiKey = String(loaded.env.AI_API_KEY || loaded.env.DEEPSEEK_API_KEY || "").trim();
  const requireReal = truthy(loaded.env.DIAGNOSIS_LLM_REQUIRE_REAL);
  if (!apiKey) {
    if (requireReal) throw new Error("DIAGNOSIS_LLM_REQUIRE_REAL=true but AI_API_KEY/DEEPSEEK_API_KEY was not found.");
    return null;
  }
  return {
    providerId: "deepseek",
    providerLabel: "DeepSeek",
    apiKey,
    baseUrl: cleanBaseUrl(loaded.env.AI_BASE_URL || loaded.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL),
    model: String(loaded.env.AI_MODEL || loaded.env.DEEPSEEK_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL,
    requestTimeoutMs: positiveNumber(loaded.env.AI_REQUEST_TIMEOUT_MS, 10 * 60 * 1000),
    maxTokens: positiveNumber(loaded.env.AI_MAX_TOKENS, 4096),
    temperature: boundedNumber(loaded.env.AI_TEMPERATURE, 0.15, 0, 1),
    concurrency: Math.max(1, Math.min(positiveNumber(loaded.env.DIAGNOSIS_LLM_CONCURRENCY, 1), 4)),
    limit: nullablePositiveInteger(loaded.env.DIAGNOSIS_LLM_LIMIT),
    requireReal,
    envSources: loaded.sources,
  };
}

export async function callDeepSeekClusterDiagnosis(params: {
  config: DeepSeekDiagnosisConfig;
  evidencePack: JsonObject;
  fallbackModule: string;
}): Promise<{ output: DeepSeekClusterDiagnosis; trace: DeepSeekTrace }> {
  const { config, evidencePack, fallbackModule } = params;
  const clusterId = getString(evidencePack, "clusterId") || "unknown_cluster";
  const payload = JSON.stringify(evidencePack);
  const startedAt = Date.now();
  const traceBase = {
    clusterId,
    providerId: config.providerId,
    model: config.model,
    baseUrl: config.baseUrl,
    requestSummary: {
      clusterId,
      representativeProblemCount: arrayOfObjects(evidencePack.representativeProblems).length,
      payloadBytes: Buffer.byteLength(payload, "utf8"),
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(evidencePack, fallbackModule) },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
      }),
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DeepSeek call failed: ${response.status} ${text.slice(0, 300)}`);
    }
    const json = (await response.json()) as JsonObject;
    const content = getString(json, "choices.0.message.content") || getString(json, "choices.0.message.reasoning_content");
    if (!content) throw new Error("DeepSeek response missing choices[0].message.content.");
    const parsed = extractJson(content);
    return {
      output: normalizeDiagnosis(parsed, fallbackModule),
      trace: {
        ...traceBase,
        status: "SUCCESS",
        latencyMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    return {
      output: normalizeDiagnosis({}, fallbackModule),
      trace: {
        ...traceBase,
        status: "PROVIDER_FAILURE",
        latencyMs: Date.now() - startedAt,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function buildSystemPrompt(): string {
  return [
    "你是 CSP-S 一等奖训练教练，任务是根据学生历史提交 evidence pack 做题目簇诊断。",
    "只分析提供的 evidence pack，不要虚构题面、代码细节或不存在的提交。",
    "重点找出：算法模块薄弱点、常见错误类型、为什么这些题会反复提交或卡部分分、后续训练动作。",
    "输出必须是严格 JSON，不要 Markdown，不要解释 JSON 外的内容。",
  ].join("\n");
}

function buildUserPrompt(evidencePack: JsonObject, fallbackModule: string): string {
  return [
    "请分析下面这个题目簇 evidence pack。",
    "",
    JSON.stringify(evidencePack, null, 2),
    "",
    "请返回如下 JSON schema：",
    JSON.stringify(
      {
        clusterDiagnosis: "一句明确诊断，说明该题目簇暴露的根因，而不是泛泛说模块不熟。",
        commonErrorTypes: ["MODEL_ERROR", "STATE_ERROR"],
        evidenceSummary: ["引用 evidence pack 中的提交次数、分数轨迹、风险标记、代表题等证据。至少 3 条。"],
        trainingAction: {
          module: fallbackModule,
          tasks: ["具体训练动作 1", "具体训练动作 2", "具体训练动作 3"],
          verifyMethod: "可验收标准，例如同类题提交 <= 2 次，能写出状态定义/边界/30-50-70 分方案。",
        },
        confidence: 0.8,
      },
      null,
      2,
    ),
    "",
    "要求：",
    "1. commonErrorTypes 只能使用这些枚举中的若干项：MODEL_ERROR, STATE_ERROR, TRANSITION_ERROR, INIT_ERROR, BOUNDARY_ERROR, INDEX_ERROR, OVERFLOW_ERROR, COMPLEXITY_ERROR, PARTIAL_SCORE_MISSED, IMPLEMENTATION_RISK, TEMPLATE_UNFAMILIAR, DEBUG_TIMEOUT。",
    "2. evidenceSummary 必须绑定 evidence pack 里的代表题、提交次数、分数轨迹、模块或风险标记。",
    "3. trainingAction 必须服务于 CSP-S 一等奖训练，能直接用于后续智能出题。",
    "4. 不要建议随机刷题。",
  ].join("\n");
}

function normalizeDiagnosis(parsed: JsonObject, fallbackModule: string): DeepSeekClusterDiagnosis {
  const trainingAction = isObject(parsed.trainingAction) ? parsed.trainingAction : {};
  const confidence = boundedNumber(parsed.confidence, 0.5, 0.1, 0.95);
  return {
    clusterDiagnosis: getString(parsed, "clusterDiagnosis") || `${fallbackModule} 题目簇需要进一步诊断。`,
    commonErrorTypes: normalizeErrorTypes(parsed.commonErrorTypes),
    evidenceSummary: arrayOfStrings(parsed.evidenceSummary).slice(0, 8),
    trainingAction: {
      module: getString(trainingAction, "module") || fallbackModule,
      tasks: arrayOfStrings(trainingAction.tasks).slice(0, 8),
      verifyMethod: getString(trainingAction, "verifyMethod") || "同类题提交次数 <= 2，并能复盘模型、边界和复杂度。",
    },
    confidence,
  };
}

function normalizeErrorTypes(value: unknown): string[] {
  const allowed = new Set([
    "MODEL_ERROR",
    "STATE_ERROR",
    "TRANSITION_ERROR",
    "INIT_ERROR",
    "BOUNDARY_ERROR",
    "INDEX_ERROR",
    "OVERFLOW_ERROR",
    "COMPLEXITY_ERROR",
    "PARTIAL_SCORE_MISSED",
    "IMPLEMENTATION_RISK",
    "TEMPLATE_UNFAMILIAR",
    "DEBUG_TIMEOUT",
  ]);
  const normalized = arrayOfStrings(value).map((item) => item.trim().toUpperCase()).filter((item) => allowed.has(item));
  return normalized.length > 0 ? [...new Set(normalized)].slice(0, 6) : ["IMPLEMENTATION_RISK"];
}

function extractJson(text: string): JsonObject {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = parseFirstJsonObject(cleaned);
  if (parsed) return parsed;
  throw new Error(`DeepSeek response did not contain a valid JSON object. Preview: ${cleaned.slice(0, 240) || "<empty>"}`);
}

function parseFirstJsonObject(text: string): JsonObject | null {
  const starts = [...text.matchAll(/\{/g)].map((match) => match.index ?? -1).filter((index) => index >= 0);
  const ends = [...text.matchAll(/\}/g)].map((match) => match.index ?? -1).filter((index) => index >= 0).reverse();
  for (const start of starts) {
    for (const end of ends) {
      if (end <= start) continue;
      const parsed = tryParseJsonObject(text.slice(start, end + 1));
      if (parsed) return parsed;
    }
  }
  return null;
}

function tryParseJsonObject(raw: string): JsonObject | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isObject(parsed) ? parsed : null;
  } catch {
    try {
      const parsed = JSON.parse(raw.replace(/\\(?!["\\/bfnrtu])/g, "\\\\")) as unknown;
      return isObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

async function loadAiEnv(projectRoot: string): Promise<{ env: Record<string, string>; sources: string[] }> {
  const env: Record<string, string> = {};
  const sources: string[] = [];
  for (const key of ALLOWED_ENV_KEYS) {
    const value = process.env[key];
    if (value) env[key] = value;
  }
  if (Object.keys(env).length > 0) sources.push("process.env");

  const candidates = [
    path.join(projectRoot, ".env"),
    path.join(projectRoot, "server", ".env"),
    path.resolve(projectRoot, "..", "scoremap", ".env"),
    path.resolve(projectRoot, "..", "scoremap", "server", ".env"),
    path.resolve(projectRoot, "..", "printersheet", "ai-exam-miniapp", "server", ".env"),
  ];
  for (const candidate of candidates) {
    const parsed = await readEnvFile(candidate);
    if (!parsed) continue;
    let used = false;
    for (const key of ALLOWED_ENV_KEYS) {
      if (env[key] || !parsed[key]) continue;
      env[key] = parsed[key];
      used = true;
    }
    if (used) sources.push(candidate);
  }
  return { env, sources };
}

async function readEnvFile(filePath: string): Promise<Record<string, string> | null> {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return parseEnvText(text);
  } catch {
    return null;
  }
}

function parseEnvText(text: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    if (!ALLOWED_ENV_KEYS.includes(key)) continue;
    parsed[key] = parseEnvValue(match[2] ?? "");
  }
  return parsed;
}

function parseEnvValue(value: string): string {
  let text = value.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  } else {
    const hashIndex = text.search(/\s#/);
    if (hashIndex >= 0) text = text.slice(0, hashIndex).trim();
  }
  return text.replace(/\\n/g, "\n");
}

function cleanBaseUrl(url: unknown): string {
  return String(url || "").trim().replace(/\/$/, "") || DEFAULT_BASE_URL;
}

function nullablePositiveInteger(value: unknown): number | null {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.floor(number);
}

function truthy(value: unknown): boolean {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function positiveNumber(value: unknown, fallback: number): number {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function getString(source: unknown, key: string): string {
  const value = getPath(source, key);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getPath(source: unknown, key: string): unknown {
  if (!key) return source;
  return key.split(".").reduce<unknown>((current, part) => {
    if (/^\d+$/.test(part) && Array.isArray(current)) return current[Number(part)];
    if (!isObject(current)) return undefined;
    return current[part];
  }, source);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
