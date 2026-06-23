import { prisma } from "@/src/lib/prisma";
import { env } from "@/src/lib/env";
import { daysBetween } from "@/src/lib/time";
import { mapTagsToKnowledge } from "@/src/server/knowledge/tag-mapping";
import type { NormalizedProblem } from "@/src/server/luogu/luogu-types";

export class ProblemService {
  async shouldFetch(pid: string) {
    const problem = await prisma.problem.findUnique({ where: { luoguPid: pid } });
    if (!problem) return true;
    if (!problem.lastFetchedAt) return true;
    if (problem.fetchStatus !== "ok") return true;
    return daysBetween(problem.lastFetchedAt, new Date()) >= env.LUOGU_PROBLEM_CACHE_DAYS;
  }

  async upsertProblem(input: NormalizedProblem) {
    const problem = await prisma.problem.upsert({
      where: { luoguPid: input.luoguPid },
      update: {
        title: input.title,
        difficulty: input.difficulty,
        difficultyName: input.difficultyName,
        tags: input.tags,
        source: input.source,
        acceptedCount: input.acceptedCount,
        submittedCount: input.submittedCount,
        fetchStatus: "ok",
        lastFetchedAt: new Date(input.fetchedAt)
      },
      create: {
        luoguPid: input.luoguPid,
        title: input.title,
        difficulty: input.difficulty,
        difficultyName: input.difficultyName,
        tags: input.tags,
        source: input.source,
        acceptedCount: input.acceptedCount,
        submittedCount: input.submittedCount,
        fetchStatus: "ok",
        lastFetchedAt: new Date(input.fetchedAt)
      }
    });
    await this.mapKnowledge(problem.id, input.tags);
    return problem;
  }

  async ensurePlaceholder(pid: string, title?: string) {
    return prisma.problem.upsert({
      where: { luoguPid: pid },
      update: { title: title ?? undefined },
      create: { luoguPid: pid, title, fetchStatus: "unknown" }
    });
  }

  async markFetchFailed(pid: string, title?: string) {
    return prisma.problem.upsert({
      where: { luoguPid: pid },
      update: { title: title ?? undefined, fetchStatus: "failed" },
      create: { luoguPid: pid, title, fetchStatus: "failed" }
    });
  }

  private async mapKnowledge(problemId: bigint, tags: string[]) {
    const codes = mapTagsToKnowledge(tags);
    for (const code of codes) {
      await prisma.problemKnowledgeMap.upsert({
        where: { problemId_knowledgeCode: { problemId, knowledgeCode: code } },
        update: { source: "tag_rule", confidence: 0.8 },
        create: { problemId, knowledgeCode: code, source: "tag_rule", confidence: 0.8 }
      });
    }
  }
}
