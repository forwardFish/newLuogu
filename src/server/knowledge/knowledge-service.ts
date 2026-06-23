import { prisma } from "@/src/lib/prisma";

export class KnowledgeService {
  async rebuildSubjectStats(subjectId: bigint) {
    const maps = await prisma.problemKnowledgeMap.findMany({
      include: {
        problem: {
          include: {
            submissions: { where: { subjectId } },
            attemptStats: { where: { subjectId } }
          }
        }
      }
    });
    const grouped = new Map<
      string,
      {
        attemptedPids: Set<string>;
        solvedPids: Set<string>;
        acSubmissions: number;
        totalSubmissions: number;
        attemptsToAc: number[];
        difficulties: number[];
        recent30dAttempts: number;
      }
    >();
    const recentLimit = Date.now() - 30 * 86_400_000;
    for (const map of maps) {
      const item =
        grouped.get(map.knowledgeCode) ??
        {
          attemptedPids: new Set<string>(),
          solvedPids: new Set<string>(),
          acSubmissions: 0,
          totalSubmissions: 0,
          attemptsToAc: [],
          difficulties: [],
          recent30dAttempts: 0
        };
      const p = map.problem;
      const stat = p.attemptStats[0];
      if (p.submissions.length > 0) item.attemptedPids.add(p.luoguPid);
      if (stat?.isAc) item.solvedPids.add(p.luoguPid);
      if (stat?.isAc && stat.totalAttempts > 0) item.attemptsToAc.push(stat.totalAttempts);
      if (stat?.isAc && p.difficulty !== null) item.difficulties.push(p.difficulty);
      item.acSubmissions += p.submissions.filter((s: (typeof p.submissions)[number]) => s.normalizedResult === "AC").length;
      item.totalSubmissions += p.submissions.length;
      item.recent30dAttempts += p.submissions.filter(
        (s: (typeof p.submissions)[number]) => s.submitTime && s.submitTime.getTime() >= recentLimit
      ).length;
      grouped.set(map.knowledgeCode, item);
    }

    for (const [knowledgeCode, item] of grouped) {
      const solvedProblemCount = item.solvedPids.size;
      const attemptedProblemCount = item.attemptedPids.size;
      const acRate = item.totalSubmissions ? item.acSubmissions / item.totalSubmissions : 0;
      const avgDifficulty = item.difficulties.length ? avg(item.difficulties) : 0;
      const score = calcKnowledgeScore({
        solvedProblemCount,
        attemptedProblemCount,
        acRate,
        avgDifficulty,
        maxDifficulty: item.difficulties.length ? Math.max(...item.difficulties) : 0
      });
      await prisma.subjectKnowledgeStat.upsert({
        where: { subjectId_knowledgeCode: { subjectId, knowledgeCode } },
        update: {
          solvedProblemCount,
          attemptedProblemCount,
          acSubmissionCount: item.acSubmissions,
          totalSubmissionCount: item.totalSubmissions,
          acRate,
          avgAttemptsToAc: item.attemptsToAc.length ? avg(item.attemptsToAc) : undefined,
          maxDifficulty: item.difficulties.length ? Math.max(...item.difficulties) : undefined,
          avgDifficulty: item.difficulties.length ? avgDifficulty : undefined,
          recent30dAttempts: item.recent30dAttempts,
          score,
          weaknessLevel: getKnowledgeWeakness(score, solvedProblemCount),
          calculatedAt: new Date()
        },
        create: {
          subjectId,
          knowledgeCode,
          solvedProblemCount,
          attemptedProblemCount,
          acSubmissionCount: item.acSubmissions,
          totalSubmissionCount: item.totalSubmissions,
          acRate,
          avgAttemptsToAc: item.attemptsToAc.length ? avg(item.attemptsToAc) : undefined,
          maxDifficulty: item.difficulties.length ? Math.max(...item.difficulties) : undefined,
          avgDifficulty: item.difficulties.length ? avgDifficulty : undefined,
          recent30dAttempts: item.recent30dAttempts,
          score,
          weaknessLevel: getKnowledgeWeakness(score, solvedProblemCount)
        }
      });
    }
  }
}

export function getKnowledgeWeakness(score: number, solvedProblemCount: number) {
  if (solvedProblemCount === 0) return "severe";
  if (score < 40) return "severe";
  if (score < 60) return "medium";
  if (score < 75) return "mild";
  return "none";
}

function calcKnowledgeScore(input: {
  solvedProblemCount: number;
  attemptedProblemCount: number;
  acRate: number;
  avgDifficulty: number;
  maxDifficulty: number;
}) {
  const coverage = Math.min(100, input.solvedProblemCount * 18 + input.attemptedProblemCount * 4);
  const difficulty = Math.min(100, input.avgDifficulty * 14 + input.maxDifficulty * 6);
  const stability = Math.round(input.acRate * 100);
  return Math.round(coverage * 0.45 + difficulty * 0.35 + stability * 0.2);
}

function avg(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
