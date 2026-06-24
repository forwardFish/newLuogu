import { prisma } from "@/src/lib/prisma";
import { sha1 } from "@/src/lib/hash";
import type { NormalizedSubmission } from "@/src/server/luogu/luogu-types";

export class SubmissionService {
  async upsertMany(input: {
    subjectId: bigint;
    rawSnapshotId?: bigint;
    submissions: NormalizedSubmission[];
    problemByPid: Map<string, bigint>;
  }) {
    let count = 0;
    for (const submission of input.submissions) {
      const recordId =
        submission.luoguRecordId ??
        sha1(`${input.subjectId}:${submission.problemPid}:${submission.submitTime}:${submission.result}`);
      const problemId = input.problemByPid.get(submission.problemPid);
      await prisma.submission.upsert({
        where: { subjectId_luoguRecordId: { subjectId: input.subjectId, luoguRecordId: recordId } },
        update: {
          problemId,
          problemPid: submission.problemPid,
          problemTitle: submission.problemTitle,
          result: submission.result,
          normalizedResult: submission.normalizedResult,
          score: submission.score,
          language: submission.language,
          submitTime: submission.submitTime ? new Date(submission.submitTime) : undefined,
          rawSnapshotId: input.rawSnapshotId
        },
        create: {
          subjectId: input.subjectId,
          problemId,
          luoguRecordId: recordId,
          fallbackRecordKey: sha1(`${recordId}:${submission.problemPid}`),
          problemPid: submission.problemPid,
          problemTitle: submission.problemTitle,
          result: submission.result,
          normalizedResult: submission.normalizedResult,
          score: submission.score,
          language: submission.language,
          submitTime: submission.submitTime ? new Date(submission.submitTime) : undefined,
          rawSnapshotId: input.rawSnapshotId,
          source: submission.source
        }
      });
      count += 1;
    }
    return count;
  }

  async rebuildAttemptStats(subjectId: bigint) {
    const submissions = await prisma.submission.findMany({
      where: { subjectId, problemPid: { not: null } },
      orderBy: [{ problemPid: "asc" }, { submitTime: "asc" }, { id: "asc" }]
    });
    const byPid = new Map<string, typeof submissions>();
    for (const submission of submissions) {
      if (!submission.problemPid) continue;
      const list = byPid.get(submission.problemPid) ?? [];
      list.push(submission);
      byPid.set(submission.problemPid, list);
    }
    for (const [pid, items] of byPid) {
      const acItems = items.filter((item: (typeof submissions)[number]) => item.normalizedResult === "AC");
      const wrongItems = items.filter(
        (item: (typeof submissions)[number]) => item.normalizedResult && item.normalizedResult !== "AC"
      );
      const first = items[0];
      const last = items[items.length - 1];
      const scores = items
        .map((item: (typeof submissions)[number]) => item.score)
        .filter((score: number | null): score is number => score !== null);
      const mainErrorType = mostCommon(
        wrongItems
          .map((item: (typeof submissions)[number]) => item.normalizedResult)
          .filter((value: string | null): value is string => Boolean(value))
      );
      await prisma.problemAttemptStat.upsert({
        where: { subjectId_problemPid: { subjectId, problemPid: pid } },
        update: {
          problemId: first.problemId,
          totalAttempts: items.length,
          acAttempts: acItems.length,
          wrongAttempts: wrongItems.length,
          firstSubmitTime: first.submitTime,
          firstAcTime: acItems[0]?.submitTime,
          lastSubmitTime: last.submitTime,
          isAc: acItems.length > 0,
          bestScore: scores.length ? Math.max(...scores) : undefined,
          mainErrorType,
          avgScore: scores.length ? avg(scores) : undefined
        },
        create: {
          subjectId,
          problemId: first.problemId,
          problemPid: pid,
          totalAttempts: items.length,
          acAttempts: acItems.length,
          wrongAttempts: wrongItems.length,
          firstSubmitTime: first.submitTime,
          firstAcTime: acItems[0]?.submitTime,
          lastSubmitTime: last.submitTime,
          isAc: acItems.length > 0,
          bestScore: scores.length ? Math.max(...scores) : undefined,
          mainErrorType,
          avgScore: scores.length ? avg(scores) : undefined
        }
      });
    }
  }
}

function avg(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}
