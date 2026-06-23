import { asRecord } from "@/src/lib/json";
import { parseMaybeDate } from "@/src/lib/time";
import {
  arrayOfStrings,
  findPassedProblems,
  findProblemObject,
  findProfileObject,
  findRecordItems,
  numberOf,
  parseHtmlRecordItems,
  parseLuoguPayload,
  stringOf
} from "./luogu-parser";
import type {
  NormalizedLuoguProfile,
  NormalizedProblem,
  NormalizedResult,
  NormalizedSubmission,
  RawHttpResponse
} from "./luogu-types";

const PARSER_VERSION = "luogu-parser-v1.0.0";

export function normalizeProfile(uid: string, response: RawHttpResponse): NormalizedLuoguProfile {
  const payload = parseLuoguPayload(response.body, response.json);
  const profile = findProfileObject(payload);
  return {
    luoguUid: uid,
    username: stringOf(profile.name ?? profile.username ?? profile.slogan),
    rating: numberOf(profile.rating ?? profile.ccfRating) ?? null,
    passedProblemPids: findPassedProblems(payload),
    fetchedAt: response.fetchedAt,
    parserVersion: PARSER_VERSION
  };
}

export function normalizeRecordPage(uid: string, response: RawHttpResponse): NormalizedSubmission[] {
  const payload = parseLuoguPayload(response.body, response.json);
  const items = findRecordItems(payload);
  const fallbackItems = items.length > 0 ? items : parseHtmlRecordItems(response.body);
  return fallbackItems
    .map((item, index) => normalizeSubmission(uid, item, index))
    .filter((submission): submission is NormalizedSubmission => Boolean(submission?.problemPid));
}

export function normalizeProblem(pid: string, response: RawHttpResponse): NormalizedProblem {
  const payload = parseLuoguPayload(response.body, response.json);
  const problem = findProblemObject(payload);
  const tags = [
    ...arrayOfStrings(problem.tags),
    ...arrayOfStrings(problem.tagsRaw),
    ...arrayOfStrings(problem.algorithmTags),
    ...arrayOfStrings(problem.difficultyTags)
  ];
  return {
    luoguPid: stringOf(problem.pid ?? problem.id) ?? pid,
    title: stringOf(problem.title ?? problem.name),
    difficulty: numberOf(problem.difficulty ?? problem.type),
    difficultyName: difficultyName(numberOf(problem.difficulty ?? problem.type)),
    tags: Array.from(new Set(tags)),
    source: stringOf(problem.source),
    acceptedCount: numberOf(problem.acceptedCount ?? problem.totalAccepted),
    submittedCount: numberOf(problem.submittedCount ?? problem.totalSubmit),
    fetchedAt: response.fetchedAt
  };
}

function normalizeSubmission(
  uid: string,
  item: Record<string, unknown>,
  index: number
): NormalizedSubmission | null {
  const problem = asRecord(item.problem ?? item.problemData);
  const problemPid =
    stringOf(problem.pid ?? problem.id ?? item.problemPid ?? item.pid ?? item.problemId) ?? undefined;
  if (!problemPid) return null;
  const statusObject = asRecord(item.status);
  const rawResult =
    stringOf(item.status ?? item.result ?? item.verdict ?? statusObject.name ?? statusObject.type) ??
    String(item.score ?? "UNKNOWN");
  const submitTime = parseMaybeDate(
    item.submitTime ?? item.time ?? item.createTime ?? item.createdAt ?? item.date
  );
  const recordId = stringOf(item.id ?? item.recordId ?? item.rid);
  return {
    luoguRecordId: recordId ?? `${uid}:${problemPid}:${submitTime?.toISOString() ?? index}`,
    luoguUid: uid,
    problemPid,
    problemTitle: stringOf(problem.title ?? problem.name ?? item.problemTitle),
    result: rawResult,
    normalizedResult: normalizeResult(rawResult, numberOf(item.score)),
    score: numberOf(item.score),
    language: stringOf(item.language ?? asRecord(item.language).name),
    submitTime: submitTime?.toISOString(),
    source: "luogu"
  };
}

export function normalizeResult(raw: string, score?: number): NormalizedResult {
  const text = raw.toUpperCase();
  if (text.includes("AC") || text.includes("ACCEPT")) return "AC";
  if (text.includes("WA") || text.includes("WRONG")) return "WA";
  if (text.includes("TLE") || text.includes("TIME")) return "TLE";
  if (text.includes("MLE") || text.includes("MEMORY")) return "MLE";
  if (text.includes("RE") || text.includes("RUNTIME")) return "RE";
  if (text.includes("CE") || text.includes("COMPILE")) return "CE";
  if (text.includes("UKE")) return "UKE";
  if (text.includes("JUDG")) return "JUDGING";
  if (text.includes("WAIT")) return "WAITING";
  if (score !== undefined && score > 0 && score < 100) return "PC";
  if (score === 100) return "AC";
  return "UNKNOWN";
}

export function difficultyName(difficulty?: number) {
  const names = ["暂无评定", "入门", "普及-", "普及/提高-", "普及+/提高", "提高+/省选-", "省选/NOI-", "NOI/NOI+/CTSC"];
  if (difficulty === undefined || difficulty < 0 || difficulty >= names.length) return undefined;
  return names[difficulty];
}
