import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const jsonSafe = (value) => JSON.parse(JSON.stringify(value, (_, item) => (typeof item === "bigint" ? item.toString() : item)));

try {
  const [knowledgeNodeCount, subjects, syncJobs, baselineReports, manualReviews] = await Promise.all([
    prisma.knowledgeNode.count(),
    prisma.analyzedSubject.findMany({
      orderBy: { id: "asc" },
      select: { id: true, luoguUid: true, displayName: true, subjectType: true, target: true },
    }),
    prisma.syncJob.findMany({
      orderBy: { id: "desc" },
      take: 10,
      select: { id: true, subjectId: true, status: true, syncType: true, recordPagesFetched: true, submissionsUpserted: true, problemsFetched: true, problemFetchFailed: true },
    }),
    prisma.baselineAnalysisReport.findMany({
      orderBy: { id: "desc" },
      take: 10,
      select: { id: true, subjectId: true, syncJobId: true, target: true, totalScore: true, level: true },
    }),
    prisma.manualReview.findMany({
      orderBy: { id: "desc" },
      take: 10,
      select: { id: true, subjectId: true, problemPid: true, result: true, timeSpentMinutes: true, solutionUsage: true, selfNote: true },
    }),
  ]);

  const evidence = jsonSafe({
    generatedAt: new Date().toISOString(),
    database: "ai_oi_coach",
    checks: {
      knowledgeNodesSeeded: knowledgeNodeCount >= 39,
      subjectCreated: subjects.length > 0,
      syncJobWritten: syncJobs.length > 0,
      baselineReportWritten: baselineReports.length > 0,
      manualReviewWritten: manualReviews.length > 0,
    },
    counts: {
      knowledgeNodes: knowledgeNodeCount,
      subjects: subjects.length,
      syncJobs: syncJobs.length,
      baselineReports: baselineReports.length,
      manualReviews: manualReviews.length,
    },
    subjects,
    syncJobs,
    baselineReports,
    manualReviews,
  });

  const resultPath = path.resolve("docs/auto-execute/results/db-readback.json");
  await fs.mkdir(path.dirname(resultPath), { recursive: true });
  await fs.writeFile(resultPath, JSON.stringify(evidence, null, 2), "utf8");
  const failedChecks = Object.entries(evidence.checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({ resultPath, status: failedChecks.length === 0 ? "PASS" : "FAIL", counts: evidence.counts, failedChecks }, null, 2));
  if (failedChecks.length > 0) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
