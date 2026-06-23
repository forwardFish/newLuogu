import { prisma } from "@/src/lib/prisma";
import { env } from "@/src/lib/env";
import { LuoguClient } from "@/src/server/luogu/luogu-client";
import { normalizeProblem, normalizeProfile, normalizeRecordPage } from "@/src/server/luogu/luogu-normalizer";
import { DataQualityService } from "@/src/server/quality/data-quality-service";
import { KnowledgeService } from "@/src/server/knowledge/knowledge-service";
import { ProblemService } from "@/src/server/problem/problem-service";
import { SubmissionService } from "@/src/server/submission/submission-service";
import { RawSnapshotService } from "./raw-snapshot-service";

export class SyncJobService {
  private client = new LuoguClient();
  private rawSnapshots = new RawSnapshotService();
  private problems = new ProblemService();
  private submissions = new SubmissionService();
  private knowledge = new KnowledgeService();

  async start(input: { subjectId: bigint; maxRecordPages?: number; syncType?: string }) {
    const subject = await prisma.analyzedSubject.findUniqueOrThrow({ where: { id: input.subjectId } });
    const job = await prisma.syncJob.create({
      data: {
        subjectId: subject.id,
        luoguUid: subject.luoguUid,
        maxRecordPages: input.maxRecordPages ?? env.LUOGU_MAX_RECORD_PAGES,
        syncType: input.syncType ?? "baseline",
        status: "PENDING"
      }
    });
    return job;
  }

  async run(syncJobId: bigint) {
    const job = await prisma.syncJob.findUniqueOrThrow({ where: { id: syncJobId } });
    const errors: string[] = [];
    try {
      await prisma.syncJob.update({
        where: { id: syncJobId },
        data: { status: "RUNNING", startedAt: new Date() }
      });

      await this.withStep(syncJobId, "FETCH_PROFILE", async () => {
        const response = await this.client.fetchUserProfile(job.luoguUid);
        const snapshot = await this.rawSnapshots.save({
          subjectId: job.subjectId,
          syncJobId,
          sourceType: "USER_PROFILE",
          sourceKey: job.luoguUid,
          response,
          parserVersion: "luogu-parser-v1.0.0"
        });
        const profile = normalizeProfile(job.luoguUid, response);
        await prisma.luoguProfile.upsert({
          where: { subjectId: job.subjectId },
          update: {
            luoguUid: profile.luoguUid,
            username: profile.username,
            rating: profile.rating,
            passedProblemPids: profile.passedProblemPids,
            rawSnapshotId: snapshot.id,
            fetchedAt: new Date(profile.fetchedAt)
          },
          create: {
            subjectId: job.subjectId,
            luoguUid: profile.luoguUid,
            username: profile.username,
            rating: profile.rating,
            passedProblemPids: profile.passedProblemPids,
            rawSnapshotId: snapshot.id,
            fetchedAt: new Date(profile.fetchedAt)
          }
        });
      });

      const allPids = new Set<string>();
      const problemTitles = new Map<string, string | undefined>();
      let rawRecordsParsed = 0;
      let submissionsUpserted = 0;
      let pagesFetched = 0;
      let emptyPages = 0;

      await this.withStep(syncJobId, "FETCH_RECORD_PAGES", async () => {
        for (let page = 1; page <= job.maxRecordPages; page += 1) {
          const response = await this.client.fetchRecordPage(job.luoguUid, page);
          const snapshot = await this.rawSnapshots.save({
            subjectId: job.subjectId,
            syncJobId,
            sourceType: "RECORD_LIST_PAGE",
            sourceKey: `${job.luoguUid}:page:${page}`,
            response,
            parserVersion: "luogu-parser-v1.0.0"
          });
          pagesFetched += 1;
          const records = normalizeRecordPage(job.luoguUid, response);
          rawRecordsParsed += records.length;
          if (records.length === 0) emptyPages += 1;
          else emptyPages = 0;
          for (const record of records) {
            allPids.add(record.problemPid);
            problemTitles.set(record.problemPid, record.problemTitle);
          }
          const problemByPid = await this.ensureProblemPlaceholders(records.map((record) => record.problemPid), problemTitles);
          submissionsUpserted += await this.submissions.upsertMany({
            subjectId: job.subjectId,
            rawSnapshotId: snapshot.id,
            submissions: records,
            problemByPid
          });
          await prisma.syncJob.update({
            where: { id: syncJobId },
            data: {
              recordPagesFetched: pagesFetched,
              rawRecordsParsed,
              submissionsUpserted,
              uniqueProblemsFound: allPids.size
            }
          });
          if (emptyPages >= 2) break;
        }
      });

      const profile = await prisma.luoguProfile.findUnique({ where: { subjectId: job.subjectId } });
      for (const pid of Array.isArray(profile?.passedProblemPids) ? profile.passedProblemPids : []) {
        if (typeof pid === "string") allPids.add(pid);
      }

      let problemsFetched = 0;
      let problemFetchFailed = 0;
      await this.withStep(syncJobId, "FETCH_PROBLEMS", async () => {
        for (const pid of allPids) {
          try {
            if (!(await this.problems.shouldFetch(pid))) continue;
            const response = await this.client.fetchProblem(pid);
            await this.rawSnapshots.save({
              subjectId: job.subjectId,
              syncJobId,
              sourceType: "PROBLEM_DETAIL",
              sourceKey: pid,
              response,
              parserVersion: "luogu-parser-v1.0.0"
            });
            if (!response.ok) throw new Error(`Problem ${pid} HTTP ${response.status}`);
            await this.problems.upsertProblem(normalizeProblem(pid, response));
            problemsFetched += 1;
          } catch (error) {
            problemFetchFailed += 1;
            await this.problems.markFetchFailed(pid, problemTitles.get(pid));
            errors.push(error instanceof Error ? error.message : String(error));
          }
          await prisma.syncJob.update({
            where: { id: syncJobId },
            data: { problemsFetched, problemFetchFailed }
          });
        }
      });

      await this.withStep(syncJobId, "REBUILD_STATS", async () => {
        await this.attachProblemIds(job.subjectId);
        await this.submissions.rebuildAttemptStats(job.subjectId);
        await this.knowledge.rebuildSubjectStats(job.subjectId);
        await new DataQualityService().generate(job.subjectId, syncJobId);
      });

      await prisma.syncJob.update({
        where: { id: syncJobId },
        data: {
          status: "DONE",
          finishedAt: new Date(),
          errorJson: errors,
          summaryJson: {
            recordPagesFetched: pagesFetched,
            rawRecordsParsed,
            submissionsUpserted,
            uniqueProblemsFound: allPids.size,
            problemsFetched,
            problemFetchFailed
          }
        }
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      await prisma.syncJob.update({
        where: { id: syncJobId },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          errorJson: errors
        }
      });
    }
  }

  async get(syncJobId: bigint) {
    return prisma.syncJob.findUnique({
      where: { id: syncJobId },
      include: { steps: { orderBy: { id: "asc" } } }
    });
  }

  private async withStep(syncJobId: bigint, stepName: string, fn: () => Promise<void>) {
    const step = await prisma.syncJobStep.create({
      data: { syncJobId, stepName, status: "RUNNING", startedAt: new Date() }
    });
    try {
      await fn();
      await prisma.syncJobStep.update({
        where: { id: step.id },
        data: { status: "DONE", finishedAt: new Date() }
      });
    } catch (error) {
      await prisma.syncJobStep.update({
        where: { id: step.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  private async ensureProblemPlaceholders(pids: string[], titles: Map<string, string | undefined>) {
    const problemByPid = new Map<string, bigint>();
    for (const pid of new Set(pids)) {
      const problem = await this.problems.ensurePlaceholder(pid, titles.get(pid));
      problemByPid.set(pid, problem.id);
    }
    return problemByPid;
  }

  private async attachProblemIds(subjectId: bigint) {
    const submissions = await prisma.submission.findMany({
      where: { subjectId, problemId: null, problemPid: { not: null } }
    });
    for (const submission of submissions) {
      if (!submission.problemPid) continue;
      const problem = await prisma.problem.findUnique({ where: { luoguPid: submission.problemPid } });
      if (!problem) continue;
      await prisma.submission.update({ where: { id: submission.id }, data: { problemId: problem.id } });
    }
  }
}
