import { prisma } from "@/src/lib/prisma";
import { daysBetween } from "@/src/lib/time";

export class DataQualityService {
  async generate(subjectId: bigint, syncJobId?: bigint) {
    const [totalSubmissions, attemptStats, manualReviewCount, latestSubmission] = await Promise.all([
      prisma.submission.count({ where: { subjectId } }),
      prisma.problemAttemptStat.findMany({
        where: { subjectId },
        include: { problem: true }
      }),
      prisma.manualReview.count({ where: { subjectId } }),
      prisma.submission.findFirst({
        where: { subjectId, submitTime: { not: null } },
        orderBy: { submitTime: "desc" }
      })
    ]);
    const totalProblems = attemptStats.length;
    const fetchedProblems = attemptStats.filter((stat: (typeof attemptStats)[number]) => stat.problem?.fetchStatus === "ok").length;
    const problemsWithTags = attemptStats.filter((stat: (typeof attemptStats)[number]) => {
      const tags = stat.problem?.tags;
      return Array.isArray(tags) && tags.length > 0;
    }).length;

    const recordDepthScore = calcRecordDepthScore(totalSubmissions);
    const problemDetailScore = calcProblemDetailScore(totalProblems, fetchedProblems);
    const tagCoverageScore = calcTagCoverageScore(problemsWithTags, totalProblems);
    const freshnessScore = calcFreshnessScore(latestSubmission?.submitTime ?? null);
    const manualReviewScore = calcManualReviewScore(manualReviewCount);
    const overallScore = Math.round(
      recordDepthScore * 0.3 +
        problemDetailScore * 0.25 +
        tagCoverageScore * 0.2 +
        freshnessScore * 0.15 +
        manualReviewScore * 0.1
    );
    const confidenceLevel = overallScore >= 80 ? "HIGH" : overallScore >= 60 ? "MEDIUM" : "LOW";
    const issues = buildIssues({
      totalSubmissions,
      totalProblems,
      problemDetailScore,
      tagCoverageScore,
      freshnessScore,
      manualReviewCount
    });
    return prisma.dataQualityReport.create({
      data: {
        subjectId,
        syncJobId,
        overallScore,
        recordDepthScore,
        problemDetailScore,
        tagCoverageScore,
        freshnessScore,
        manualReviewScore,
        confidenceLevel,
        issueJson: issues,
        summary: `数据质量 ${overallScore} 分，可信度 ${confidenceLevel}。`
      }
    });
  }

  async latest(subjectId: bigint) {
    return prisma.dataQualityReport.findFirst({
      where: { subjectId },
      orderBy: { createdAt: "desc" }
    });
  }
}

export function calcRecordDepthScore(totalSubmissions: number) {
  if (totalSubmissions >= 1000) return 100;
  if (totalSubmissions >= 500) return 85;
  if (totalSubmissions >= 200) return 70;
  if (totalSubmissions >= 100) return 55;
  if (totalSubmissions >= 50) return 40;
  return 20;
}

export function calcProblemDetailScore(totalProblems: number, fetchedProblems: number) {
  if (totalProblems === 0) return 0;
  return Math.round((fetchedProblems / totalProblems) * 100);
}

export function calcTagCoverageScore(problemsWithTags: number, totalProblems: number) {
  if (totalProblems === 0) return 0;
  return Math.round((problemsWithTags / totalProblems) * 100);
}

export function calcFreshnessScore(lastSubmitTime: Date | null) {
  if (!lastSubmitTime) return 0;
  const days = daysBetween(lastSubmitTime, new Date());
  if (days <= 7) return 100;
  if (days <= 14) return 85;
  if (days <= 30) return 70;
  if (days <= 60) return 50;
  if (days <= 90) return 35;
  return 20;
}

export function calcManualReviewScore(manualReviewCount: number) {
  if (manualReviewCount >= 50) return 100;
  if (manualReviewCount >= 30) return 80;
  if (manualReviewCount >= 15) return 60;
  if (manualReviewCount >= 5) return 40;
  return 10;
}

function buildIssues(input: {
  totalSubmissions: number;
  totalProblems: number;
  problemDetailScore: number;
  tagCoverageScore: number;
  freshnessScore: number;
  manualReviewCount: number;
}) {
  const issues: string[] = [];
  if (input.totalSubmissions < 100) issues.push("公开提交记录较少，能力判断的稳定性有限。");
  if (input.totalProblems === 0) issues.push("尚未解析到有效题目记录。");
  if (input.problemDetailScore < 80) issues.push("部分题目信息抓取失败，难度和标签分析可能偏保守。");
  if (input.tagCoverageScore < 70) issues.push("题目标签覆盖不足，知识点映射可信度会下降。");
  if (input.freshnessScore < 70) issues.push("最近提交活跃度不足，当前水平可能和公开记录有偏差。");
  if (input.manualReviewCount < 5) issues.push("手动复盘数据较少，无法准确判断独立完成能力。");
  return issues;
}
