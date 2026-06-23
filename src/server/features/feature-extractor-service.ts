import { prisma } from "@/src/lib/prisma";
import { startOfUtcDate } from "@/src/lib/time";

export class FeatureExtractorService {
  async generate(input: { subjectId: bigint; syncJobId?: bigint; target: string; dataQualityReportId?: bigint }) {
    const [dataQuality, submissions, attemptStats, knowledgeStats] = await Promise.all([
      input.dataQualityReportId
        ? prisma.dataQualityReport.findUnique({ where: { id: input.dataQualityReportId } })
        : prisma.dataQualityReport.findFirst({ where: { subjectId: input.subjectId }, orderBy: { createdAt: "desc" } }),
      prisma.submission.findMany({
        where: { subjectId: input.subjectId },
        include: { problem: true },
        orderBy: { submitTime: "asc" }
      }),
      prisma.problemAttemptStat.findMany({ where: { subjectId: input.subjectId }, include: { problem: true } }),
      prisma.subjectKnowledgeStat.findMany({ where: { subjectId: input.subjectId } })
    ]);
    const solvedStats = attemptStats.filter((stat: (typeof attemptStats)[number]) => stat.isAc);
    const dated = submissions.filter((s: (typeof submissions)[number]) => s.submitTime);
    const resultFeatures = buildResultFeatures(submissions.map((s: (typeof submissions)[number]) => s.normalizedResult ?? "UNKNOWN"));
    const difficultyFeatures = buildDifficultyFeatures(attemptStats);
    const attemptFeatures = buildAttemptFeatures(attemptStats);
    const activityFeatures = buildActivityFeatures(dated.map((s) => s.submitTime as Date));
    const cspReadinessFeatures = buildCspReadinessFeatures(difficultyFeatures, resultFeatures, attemptFeatures);
    const featureJson = {
      subjectId: Number(input.subjectId),
      target: input.target,
      dataSummary: {
        totalSubmissions: submissions.length,
        totalAttemptedProblems: attemptStats.length,
        totalSolvedProblems: solvedStats.length,
        totalProblemsWithDetail: attemptStats.filter((stat: (typeof attemptStats)[number]) => stat.problem?.fetchStatus === "ok").length,
        firstSubmitTime: dated[0]?.submitTime?.toISOString(),
        lastSubmitTime: dated[dated.length - 1]?.submitTime?.toISOString(),
        dataQualityScore: dataQuality?.overallScore ?? 0,
        confidenceLevel: dataQuality?.confidenceLevel ?? "LOW"
      },
      activityFeatures,
      difficultyFeatures,
      resultFeatures,
      attemptFeatures,
      knowledgeFeatures: {
        knowledgeStats: knowledgeStats.map((stat: (typeof knowledgeStats)[number]) => ({
          code: stat.knowledgeCode,
          name: stat.knowledgeCode,
          attemptedProblemCount: stat.attemptedProblemCount,
          solvedProblemCount: stat.solvedProblemCount,
          acRate: Number(stat.acRate ?? 0),
          maxDifficulty: stat.maxDifficulty ?? 0,
          avgDifficulty: Number(stat.avgDifficulty ?? 0),
          score: stat.score,
          weaknessLevel: stat.weaknessLevel ?? "severe"
        }))
      },
      cspReadinessFeatures
    };
    return prisma.featureSnapshot.create({
      data: {
        subjectId: input.subjectId,
        syncJobId: input.syncJobId,
        featureJson
      }
    });
  }
}

function buildResultFeatures(results: string[]) {
  const total = results.length || 1;
  const count = (key: string) => results.filter((result) => result === key).length;
  const acCount = count("AC");
  const waCount = count("WA");
  const tleCount = count("TLE");
  const mleCount = count("MLE");
  const reCount = count("RE");
  const ceCount = count("CE");
  const pcCount = count("PC");
  const unknownCount = count("UNKNOWN");
  return {
    acCount,
    waCount,
    tleCount,
    mleCount,
    reCount,
    ceCount,
    pcCount,
    unknownCount,
    acRate: acCount / total,
    wrongRate: (waCount + tleCount + mleCount + reCount + ceCount) / total,
    tleRate: tleCount / total,
    reRate: reCount / total,
    ceRate: ceCount / total
  };
}

function buildDifficultyFeatures(stats: Array<{ isAc: boolean; problem?: { difficulty: number | null } | null }>) {
  const attemptedByDifficulty: Record<string, number> = {};
  const solvedByDifficulty: Record<string, number> = {};
  const solvedDifficulties: number[] = [];
  for (const stat of stats) {
    const difficulty = stat.problem?.difficulty ?? 0;
    const key = String(difficulty);
    attemptedByDifficulty[key] = (attemptedByDifficulty[key] ?? 0) + 1;
    if (stat.isAc) {
      solvedByDifficulty[key] = (solvedByDifficulty[key] ?? 0) + 1;
      solvedDifficulties.push(difficulty);
    }
  }
  const acRateByDifficulty: Record<string, number> = {};
  for (const [difficulty, attempted] of Object.entries(attemptedByDifficulty)) {
    acRateByDifficulty[difficulty] = (solvedByDifficulty[difficulty] ?? 0) / attempted;
  }
  const sorted = [...solvedDifficulties].sort((a, b) => b - a);
  const top20 = sorted.slice(0, 20);
  return {
    attemptedByDifficulty,
    solvedByDifficulty,
    acRateByDifficulty,
    maxSolvedDifficulty: sorted[0] ?? 0,
    avgSolvedDifficulty: solvedDifficulties.length ? avg(solvedDifficulties) : 0,
    top20SolvedDifficultyAvg: top20.length ? avg(top20) : 0
  };
}

function buildAttemptFeatures(
  stats: Array<{ isAc: boolean; totalAttempts: number; problemPid: string }>
) {
  const attempts = stats.map((stat) => stat.totalAttempts);
  const acStats = stats.filter((stat) => stat.isAc);
  const oneShotAcCount = acStats.filter((stat) => stat.totalAttempts === 1).length;
  const hardStuckProblems = stats
    .filter((stat) => (stat.totalAttempts >= 5 && !stat.isAc) || stat.totalAttempts >= 8)
    .map((stat) => stat.problemPid);
  return {
    avgAttemptsPerProblem: attempts.length ? avg(attempts) : 0,
    avgAttemptsToAc: acStats.length ? avg(acStats.map((stat) => stat.totalAttempts)) : 0,
    oneShotAcCount,
    oneShotAcRate: acStats.length ? oneShotAcCount / acStats.length : 0,
    hardStuckProblemCount: hardStuckProblems.length,
    hardStuckProblems
  };
}

function buildActivityFeatures(times: Date[]) {
  const uniqueDays = Array.from(new Set(times.map(startOfUtcDate))).sort();
  const activeDaysLast = (days: number) => {
    const limit = Date.now() - days * 86_400_000;
    return new Set(times.filter((time) => time.getTime() >= limit).map(startOfUtcDate)).size;
  };
  const submissionsLast = (days: number) => {
    const limit = Date.now() - days * 86_400_000;
    return times.filter((time) => time.getTime() >= limit).length;
  };
  return {
    activeDaysLast7: activeDaysLast(7),
    activeDaysLast30: activeDaysLast(30),
    activeDaysLast90: activeDaysLast(90),
    submissionsLast7: submissionsLast(7),
    submissionsLast30: submissionsLast(30),
    submissionsLast90: submissionsLast(90),
    longestActiveStreak: streak(uniqueDays),
    currentActiveStreak: currentStreak(uniqueDays)
  };
}

function buildCspReadinessFeatures(
  difficulty: ReturnType<typeof buildDifficultyFeatures>,
  result: ReturnType<typeof buildResultFeatures>,
  attempt: ReturnType<typeof buildAttemptFeatures>
) {
  const solved = difficulty.solvedByDifficulty;
  const t1 = clamp((solved["2"] ?? 0) * 8 + (solved["3"] ?? 0) * 7 + result.acRate * 30);
  const t2 = clamp((solved["3"] ?? 0) * 5 + (solved["4"] ?? 0) * 8 + (solved["5"] ?? 0) * 4);
  const t3 = clamp((solved["5"] ?? 0) * 10 + (solved["6"] ?? 0) * 8 + attempt.hardStuckProblemCount * 2);
  const t4 = clamp((solved["6"] ?? 0) * 8 + (solved["7"] ?? 0) * 12 + result.pcCount * 2);
  return {
    t1StabilityScore: t1,
    t2SolvingScore: t2,
    t3PartialScore: t3,
    t4StrategyScore: Math.min(t4, 55),
    implementationScore: clamp(100 - result.reRate * 80 - result.ceRate * 60 - attempt.avgAttemptsToAc * 4),
    timeManagementScore: clamp(difficulty.top20SolvedDifficultyAvg * 12 + result.acRate * 30)
  };
}

function streak(days: string[]) {
  let best = 0;
  let current = 0;
  let previous = "";
  for (const day of days) {
    const diff = previous
      ? (new Date(day).getTime() - new Date(previous).getTime()) / 86_400_000
      : 1;
    current = diff === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return best;
}

function currentStreak(days: string[]) {
  if (!days.length) return 0;
  let current = 0;
  let cursor = new Date();
  const set = new Set(days);
  while (set.has(startOfUtcDate(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return current;
}

function avg(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
