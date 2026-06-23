import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  APP_BASE_URL: z.string().default("http://localhost:3000"),
  LLM_PROVIDER: z.string().default("openai"),
  LLM_BASE_URL: z.string().default("https://api.openai.com/v1"),
  LLM_API_KEY: z.string().optional().default(""),
  LLM_MODEL: z.string().default("gpt-4.1-mini"),
  LLM_ENABLE: z.coerce.boolean().default(true),
  LUOGU_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  LUOGU_REQUEST_RETRY_TIMES: z.coerce.number().int().min(0).default(3),
  LUOGU_REQUEST_INTERVAL_MS: z.coerce.number().int().min(0).default(500),
  LUOGU_MAX_RECORD_PAGES: z.coerce.number().int().positive().default(20),
  LUOGU_PROBLEM_CACHE_DAYS: z.coerce.number().int().positive().default(7),
  TEST_LUOGU_UID: z.string().optional().default("")
});

export const env = envSchema.parse(process.env);
