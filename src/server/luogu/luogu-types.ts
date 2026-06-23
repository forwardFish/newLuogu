export interface RawHttpResponse {
  url: string;
  status: number;
  ok: boolean;
  body: string;
  json?: unknown;
  fetchedAt: string;
}

export interface NormalizedLuoguProfile {
  luoguUid: string;
  username?: string;
  rating?: number | null;
  passedProblemPids: string[];
  fetchedAt: string;
  parserVersion: string;
}

export type NormalizedResult =
  | "AC"
  | "WA"
  | "TLE"
  | "MLE"
  | "RE"
  | "CE"
  | "PC"
  | "UKE"
  | "JUDGING"
  | "WAITING"
  | "UNKNOWN";

export interface NormalizedSubmission {
  luoguRecordId?: string;
  luoguUid: string;
  problemPid: string;
  problemTitle?: string;
  result: string;
  normalizedResult: NormalizedResult;
  score?: number;
  language?: string;
  submitTime?: string;
  source: "luogu";
}

export interface NormalizedProblem {
  luoguPid: string;
  title?: string;
  difficulty?: number;
  difficultyName?: string;
  tags: string[];
  source?: string;
  acceptedCount?: number;
  submittedCount?: number;
  fetchedAt: string;
}
