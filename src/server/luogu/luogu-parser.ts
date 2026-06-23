import * as cheerio from "cheerio";
import { asArray, asRecord } from "@/src/lib/json";
import { parseMaybeDate } from "@/src/lib/time";

export function parseLuoguPayload(raw: string, json?: unknown): unknown {
  if (json !== undefined) return json;
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    const scripts = extractScriptJsonCandidates(trimmed);
    return scripts[0] ?? { html: trimmed };
  }
}

export function findProfileObject(payload: unknown): Record<string, unknown> {
  const found = findFirstObject(payload, (obj) => {
    const keys = Object.keys(obj);
    return keys.includes("user") || keys.includes("passedProblems") || keys.includes("ranking");
  });
  const record = asRecord(found);
  return asRecord(record.user ?? record.currentUser ?? record);
}

export function findPassedProblems(payload: unknown): string[] {
  const candidates = findAllArrays(payload).flat();
  return Array.from(
    new Set(
      candidates
        .map((item) => {
          if (typeof item === "string") return item;
          const obj = asRecord(item);
          return stringOf(obj.pid ?? obj.problemId ?? obj.luoguPid);
        })
        .filter((pid): pid is string => Boolean(pid && /^P?\d+[A-Z]?|[A-Z]+\d+/.test(pid)))
    )
  );
}

export function findRecordItems(payload: unknown): Record<string, unknown>[] {
  const arrays = findAllArrays(payload);
  const scored = arrays
    .map((items) => ({
      items,
      score: items.filter((item) => {
        const obj = asRecord(item);
        return Boolean(
          obj.problem || obj.problemId || obj.pid || obj.recordId || obj.id || obj.status || obj.score
        );
      }).length
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return (scored[0]?.items ?? []).map(asRecord).filter((item) => Object.keys(item).length > 0);
}

export function findProblemObject(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  const current = asRecord(root.currentData ?? root.data ?? root);
  const problem = asRecord(current.problem ?? current.problemData ?? current);
  return problem;
}

export function parseHtmlRecordItems(html: string): Record<string, unknown>[] {
  const $ = cheerio.load(html);
  const rows: Record<string, unknown>[] = [];
  $("tr").each((_, tr) => {
    const text = $(tr).text().replace(/\s+/g, " ").trim();
    const pid = text.match(/\b([A-Z]\d{3,5}[A-Z]?|P\d{3,6}[A-Z]?)\b/)?.[1];
    if (!pid) return;
    rows.push({
      problem: { pid, title: text },
      status: text,
      submitTime: parseMaybeDate(text)?.toISOString()
    });
  });
  return rows;
}

function extractScriptJsonCandidates(html: string): unknown[] {
  const $ = cheerio.load(html);
  const candidates: unknown[] = [];
  $("script").each((_, element) => {
    const content = $(element).text();
    for (const match of content.matchAll(/JSON\.parse\("([\s\S]+?)"\)|window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]+?\});/g)) {
      const raw = match[1] ? match[1].replace(/\\"/g, '"') : match[2];
      try {
        candidates.push(JSON.parse(raw));
      } catch {
        // Ignore non-JSON scripts.
      }
    }
  });
  return candidates;
}

function findFirstObject(
  value: unknown,
  predicate: (obj: Record<string, unknown>) => boolean
): Record<string, unknown> | undefined {
  const obj = asRecord(value);
  if (Object.keys(obj).length > 0 && predicate(obj)) return obj;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstObject(item, predicate);
      if (found) return found;
    }
  } else {
    for (const item of Object.values(obj)) {
      const found = findFirstObject(item, predicate);
      if (found) return found;
    }
  }
  return undefined;
}

function findAllArrays(value: unknown): unknown[][] {
  const arrays: unknown[][] = [];
  if (Array.isArray(value)) {
    arrays.push(value);
    for (const item of value) arrays.push(...findAllArrays(item));
    return arrays;
  }
  const obj = asRecord(value);
  for (const item of Object.values(obj)) arrays.push(...findAllArrays(item));
  return arrays;
}

export function stringOf(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return undefined;
}

export function numberOf(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

export function arrayOfStrings(value: unknown): string[] {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string") return item;
      const obj = asRecord(item);
      return stringOf(obj.name ?? obj.title ?? obj.tag ?? obj.value);
    })
    .filter((item): item is string => Boolean(item));
}
