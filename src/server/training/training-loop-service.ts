import { prisma } from "@/src/lib/prisma";
import { asArray, toJsonValue } from "@/src/lib/json";
import { KNOWLEDGE_NODES } from "@/src/server/knowledge/knowledge-seed";

const MILESTONES = [50, 100, 150, 200, 250, 300];
const RECENT_DAYS = 14;

type GoalRow = { id: bigint; subjectId: bigint; currentScore: number; targetScore: number; examDate: Date | null; weeklyHours: number; dailyProblemNum: number; status: string; createdAt: Date; updatedAt: Date };
type StageRow = { id: bigint; goalId: bigint; stageIndex: number; fromScore: number; toScore: number; title: string; focusJson: unknown; exitCriteriaJson: unknown; status: string; createdAt: Date };
type PlanRow = { id: bigint; goalId: bigint; subjectId: bigint; date: Date; stageScore: number; focus: string; reasonJson: unknown; status: string; createdAt: Date; updatedAt: Date };
type TaskRow = { id: bigint; dailyPlanId: bigint; subjectId: bigint; problemId: bigint | null; problemPid: string; problemTitle: string | null; taskOrder: number; taskType: string; targetModule: string; targetScoreRole: string; difficultyLevel: number | null; estimatedMinutes: number; explanationJson: unknown; status: string; createdAt: Date; updatedAt: Date };
type AttemptInput = { result: "AC" | "PARTIAL" | "FAILED" | "GIVE_UP"; score?: number | null; timeMinutes: number; submissionCount?: number; hintLevelUsed?: number; hasSeenSolution?: boolean; errorTypes?: string[]; selfNote?: string | null };
type AttemptRow = { id: bigint; taskId: bigint; subjectId: bigint; result: string; score: number | null; timeMinutes: number; submissionCount: number; hintLevelUsed: number; hasSeenSolution: boolean; errorTypes: unknown; selfNote: string | null; createdAt: Date };
type Candidate = { id: bigint | null; luoguPid: string; title: string | null; difficulty: number | null; difficultyName: string | null };

export class TrainingLoopService {
  async createGoal(input: { subjectId: bigint; currentScore: number; targetScore: number; examDate?: Date | null; weeklyHours?: number; dailyProblemNum?: number }) {
    if (input.targetScore <= input.currentScore) throw new Error("targetScore must be greater than currentScore");
    const subject = await prisma.analyzedSubject.findUniqueOrThrow({ where: { id: input.subjectId } });
    await prisma.$executeRawUnsafe(`UPDATE "training_goals" SET "status" = 'ARCHIVED', "updatedAt" = NOW() WHERE "subjectId" = $1 AND "status" = 'ACTIVE'`, input.subjectId);
    const goal = await one<GoalRow>(`INSERT INTO "training_goals" ("subjectId", "currentScore", "targetScore", "examDate", "weeklyHours", "dailyProblemNum", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`, input.subjectId, input.currentScore, input.targetScore, input.examDate ?? null, input.weeklyHours ?? 14, input.dailyProblemNum ?? 3);
    const drafts = buildStages(input.currentScore, input.targetScore);
    for (const stage of drafts) {
      await prisma.$executeRawUnsafe(`INSERT INTO "training_stages" ("goalId", "stageIndex", "fromScore", "toScore", "title", "focusJson", "exitCriteriaJson", "status") VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8)`, goal.id, stage.stageIndex, stage.fromScore, stage.toScore, stage.title, JSON.stringify(stage.focusJson), JSON.stringify(stage.exitCriteriaJson), stage.status);
    }
    const roadmap = await stages(goal.id);
    return { goal, subject, roadmap };
  }

  async listGoals(subjectId?: bigint) {
    const goals = subjectId ? await many<GoalRow>(`SELECT * FROM "training_goals" WHERE "subjectId" = $1 ORDER BY "createdAt" DESC LIMIT 20`, subjectId) : await many<GoalRow>(`SELECT * FROM "training_goals" ORDER BY "createdAt" DESC LIMIT 20`);
    return Promise.all(goals.map(async (goal) => ({ ...goal, stages: await stages(goal.id) })));
  }

  async getRoadmap(goalId: bigint) {
    const goal = await one<GoalRow>(`SELECT * FROM "training_goals" WHERE "id" = $1`, goalId);
    const subject = await prisma.analyzedSubject.findUniqueOrThrow({ where: { id: goal.subjectId } });
    const roadmap = await stages(goal.id);
    const weeklyReports = await many<{ weekEnd: Date; scoreAfter: number; scoreDelta: number }>(`SELECT "weekEnd", "scoreAfter", "scoreDelta" FROM "weekly_training_reports" WHERE "goalId" = $1 ORDER BY "weekStart" ASC`, goal.id);
    return { goal: { ...goal, subject, stages: roadmap, weeklyReports }, activeStage: activeStage(roadmap), scoreCurve: weeklyReports.map((r) => ({ date: r.weekEnd.toISOString().slice(0, 10), score: r.scoreAfter, delta: r.scoreDelta })) };
  }

  async generateDailyPlan(input: { goalId: bigint; date?: Date }) {
    const goal = await one<GoalRow>(`SELECT * FROM "training_goals" WHERE "id" = $1`, input.goalId);
    if (goal.status !== "ACTIVE") throw new Error("training goal is not active");
    const date = startOfDate(input.date ?? new Date());
    const existing = await optional<PlanRow>(`SELECT * FROM "daily_training_plans" WHERE "goalId" = $1 AND "date" = $2`, goal.id, date);
    if (existing) return { ...existing, tasks: await tasks(existing.id) };
    const roadmap = await stages(goal.id);
    const stage = activeStage(roadmap);
    const toScore = stage?.toScore ?? goal.targetScore;
    const focus = focusForScore(toScore);
    const weak = await this.weakestModule(goal.subjectId, focus.modules);
    const recent = await this.recentPids(goal.subjectId);
    const modules = [focus.modules[0] ?? "implementation", weak, await this.reviewModule(goal.subjectId, weak)];
    const types = ["FOUNDATION", "WEAKNESS", "TRANSFER"] as const;
    const taskDrafts = [];
    for (let i = 0; i < Math.min(goal.dailyProblemNum, 5); i += 1) {
      const module = modules[i] ?? focus.modules[i % focus.modules.length] ?? "implementation";
      const problem = await this.pickProblem(goal.subjectId, module, toScore, recent, types[i] ?? "REVIEW");
      recent.add(problem.luoguPid);
      taskDrafts.push(makeTask(i + 1, types[i] ?? "REVIEW", module, toScore, problem));
    }
    const plan = await one<PlanRow>(`INSERT INTO "daily_training_plans" ("goalId", "subjectId", "date", "stageScore", "focus", "reasonJson", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6::jsonb,NOW()) RETURNING *`, goal.id, goal.subjectId, date, toScore, `${roleForScore(toScore)}：${taskDrafts.map((t) => nameOf(t.targetModule)).join("、")}`, JSON.stringify({ rule: "每日 3 题：保分题、短板题、迁移/复盘题", stage }));
    for (const task of taskDrafts) {
      await prisma.$executeRawUnsafe(`INSERT INTO "daily_training_tasks" ("dailyPlanId", "subjectId", "problemId", "problemPid", "problemTitle", "taskOrder", "taskType", "targetModule", "targetScoreRole", "difficultyLevel", "estimatedMinutes", "explanationJson", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,NOW())`, plan.id, goal.subjectId, task.problem.id, task.problem.luoguPid, task.problem.title, task.taskOrder, task.taskType, task.targetModule, task.targetScoreRole, task.problem.difficulty, task.estimatedMinutes, JSON.stringify(toJsonValue(task.explanationJson)));
    }
    return { ...plan, tasks: await tasks(plan.id) };
  }

  async recordAttempt(taskId: bigint, input: AttemptInput) {
    const task = await one<TaskRow>(`SELECT * FROM "daily_training_tasks" WHERE "id" = $1`, taskId);
    const attempt = await one<AttemptRow>(`INSERT INTO "training_task_attempts" ("taskId", "subjectId", "result", "score", "timeMinutes", "submissionCount", "hintLevelUsed", "hasSeenSolution", "errorTypes", "selfNote") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10) RETURNING *`, task.id, task.subjectId, input.result, input.score ?? null, input.timeMinutes, input.submissionCount ?? 1, input.hintLevelUsed ?? 0, input.hasSeenSolution ?? false, JSON.stringify(input.errorTypes ?? []), input.selfNote ?? null);
    await prisma.$executeRawUnsafe(`UPDATE "daily_training_tasks" SET "status" = 'DONE', "updatedAt" = NOW() WHERE "id" = $1`, task.id);
    await this.updateMastery(task, attempt);
    return { attempt, mastery: await this.mastery(task.subjectId) };
  }

  async generateWeeklyReport(input: { goalId: bigint; weekStart: Date; weekEnd: Date }) {
    const goal = await one<GoalRow>(`SELECT * FROM "training_goals" WHERE "id" = $1`, input.goalId);
    const weekStart = startOfDate(input.weekStart);
    const weekEnd = endOfDate(input.weekEnd);
    const rows = await many<AttemptRow & { taskType: string; estimatedMinutes: number; targetModule: string }>(`SELECT a.*, t."taskType", t."estimatedMinutes", t."targetModule" FROM "training_task_attempts" a JOIN "daily_training_tasks" t ON t."id" = a."taskId" JOIN "daily_training_plans" p ON p."id" = t."dailyPlanId" WHERE p."goalId" = $1 AND a."createdAt" >= $2 AND a."createdAt" <= $3 ORDER BY a."createdAt" ASC`, goal.id, weekStart, weekEnd);
    const previous = await optional<{ scoreAfter: number }>(`SELECT "scoreAfter" FROM "weekly_training_reports" WHERE "goalId" = $1 AND "weekStart" < $2 ORDER BY "weekStart" DESC LIMIT 1`, goal.id, weekStart);
    const scoreBefore = previous?.scoreAfter ?? goal.currentScore;
    const scoreDelta = clamp(Math.round(rows.reduce((s, a) => s + deltaForAttempt(a), 0)), -10, 40);
    const scoreAfter = clamp(scoreBefore + scoreDelta, 0, goal.targetScore);
    const mastery = await this.mastery(goal.subjectId);
    const weakness = weaknessSummary(rows, mastery);
    const curve = { points: dailyCurve(scoreBefore, rows) };
    const nextPlan = nextPlanFor(goal.targetScore, activeStage(await stages(goal.id))?.toScore ?? goal.targetScore, weakness);
    const reportText = weeklyText({ scoreBefore, scoreAfter, scoreDelta, attempts: rows, weakness, nextPlan });
    const existing = await optional<{ id: bigint }>(`SELECT "id" FROM "weekly_training_reports" WHERE "goalId" = $1 AND "weekStart" = $2`, goal.id, weekStart);
    if (existing) {
      return one(`UPDATE "weekly_training_reports" SET "weekEnd"=$2,"scoreBefore"=$3,"scoreAfter"=$4,"scoreDelta"=$5,"masteryJson"=$6::jsonb,"weaknessJson"=$7::jsonb,"curveJson"=$8::jsonb,"nextPlanJson"=$9::jsonb,"reportText"=$10 WHERE "id"=$1 RETURNING *`, existing.id, weekEnd, scoreBefore, scoreAfter, scoreDelta, JSON.stringify(mastery), JSON.stringify(weakness), JSON.stringify(curve), JSON.stringify(nextPlan), reportText);
    }
    return one(`INSERT INTO "weekly_training_reports" ("goalId","subjectId","weekStart","weekEnd","scoreBefore","scoreAfter","scoreDelta","masteryJson","weaknessJson","curveJson","nextPlanJson","reportText") VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12) RETURNING *`, goal.id, goal.subjectId, weekStart, weekEnd, scoreBefore, scoreAfter, scoreDelta, JSON.stringify(mastery), JSON.stringify(weakness), JSON.stringify(curve), JSON.stringify(nextPlan), reportText);
  }

  private async weakestModule(subjectId: bigint, modules: string[]) {
    const stats = await prisma.subjectKnowledgeStat.findMany({ where: { subjectId, knowledgeCode: { in: modules } } });
    const masteryRows = await many<{ knowledgeCode: string; masteryScore: number }>(`SELECT "knowledgeCode", "masteryScore" FROM "training_mastery" WHERE "subjectId" = $1`, subjectId);
    const stat = new Map(stats.map((x: (typeof stats)[number]) => [x.knowledgeCode, x.score]));
    const train = new Map(masteryRows.map((x) => [x.knowledgeCode, x.masteryScore]));
    return modules.map((code) => ({ code, score: (stat.get(code) ?? 0) * 0.45 + (train.get(code) ?? 0) * 0.55 })).sort((a, b) => a.score - b.score)[0]?.code ?? "implementation";
  }

  private async recentPids(subjectId: bigint) {
    const rows = await many<{ problemPid: string }>(`SELECT "problemPid" FROM "daily_training_tasks" WHERE "subjectId" = $1 AND "createdAt" >= $2`, subjectId, new Date(Date.now() - RECENT_DAYS * 86_400_000));
    return new Set(rows.map((x) => x.problemPid));
  }

  private async reviewModule(subjectId: bigint, fallback: string) {
    const row = await optional<{ targetModule: string }>(`SELECT t."targetModule" FROM "training_task_attempts" a JOIN "daily_training_tasks" t ON t."id"=a."taskId" WHERE a."subjectId"=$1 AND a."result" IN ('FAILED','PARTIAL','GIVE_UP') ORDER BY a."createdAt" DESC LIMIT 1`, subjectId);
    return row?.targetModule ?? fallback;
  }

  private async pickProblem(subjectId: bigint, module: string, toScore: number, recent: Set<string>, taskType: string): Promise<Candidate> {
    const maxDiff = maxDifficulty(toScore);
    const maps = await prisma.problemKnowledgeMap.findMany({ where: { knowledgeCode: module }, include: { problem: true }, take: 150 });
    const stats = await prisma.problemAttemptStat.findMany({ where: { subjectId } });
    const stat = new Map(stats.map((x: (typeof stats)[number]) => [x.problemPid, x]));
    const ranked = maps.map((x: (typeof maps)[number]) => x.problem).filter((p: (typeof maps)[number]["problem"]) => !recent.has(p.luoguPid) && (p.difficulty ?? 0) <= maxDiff).map((p: (typeof maps)[number]["problem"]) => ({ p, score: rankProblem(p, stat.get(p.luoguPid), taskType, maxDiff) })).sort((a, b) => b.score - a.score)[0]?.p;
    const picked = ranked ?? await prisma.problem.findFirst({ where: { difficulty: { lte: maxDiff } }, orderBy: [{ difficulty: "asc" }, { updatedAt: "desc" }] });
    if (picked) return { id: picked.id, luoguPid: picked.luoguPid, title: picked.title, difficulty: picked.difficulty, difficultyName: picked.difficultyName };
    return { id: null, luoguPid: `MANUAL_${taskType}_${module}`.replace(/[^A-Z0-9_]/gi, "_").slice(0, 80), title: "待人工选择题目", difficulty: maxDiff, difficultyName: diffName(maxDiff) };
  }

  private async updateMastery(task: TaskRow, attempt: AttemptRow) {
    const modules = new Set([task.targetModule]);
    if (task.problemId) (await prisma.problemKnowledgeMap.findMany({ where: { problemId: task.problemId } })).forEach((x: { knowledgeCode: string }) => modules.add(x.knowledgeCode));
    for (const code of modules) {
      const old = await optional<{ masteryScore: number }>(`SELECT * FROM "training_mastery" WHERE "subjectId"=$1 AND "knowledgeCode"=$2`, task.subjectId, code);
      const next = clamp((old?.masteryScore ?? 0) + masteryDelta(attempt, task.estimatedMinutes), 0, 100);
      const incIndependent = attempt.result === "AC" && attempt.hintLevelUsed === 0 && !attempt.hasSeenSolution ? 1 : 0;
      const incHint = attempt.result === "AC" && (attempt.hintLevelUsed > 0 || attempt.hasSeenSolution) ? 1 : 0;
      const incPartial = attempt.result === "PARTIAL" ? 1 : 0;
      const incFailed = ["FAILED", "GIVE_UP"].includes(attempt.result) ? 1 : 0;
      if (old) await prisma.$executeRawUnsafe(`UPDATE "training_mastery" SET "masteryScore"=$3,"status"=$4,"independentAcCount"="independentAcCount"+$5,"hintAcCount"="hintAcCount"+$6,"partialCount"="partialCount"+$7,"failedCount"="failedCount"+$8,"avgTimeMinutes"=$9,"lastPracticedAt"=NOW(),"updatedAt"=NOW() WHERE "subjectId"=$1 AND "knowledgeCode"=$2`, task.subjectId, code, next, masteryStatus(next), incIndependent, incHint, incPartial, incFailed, attempt.timeMinutes);
      else await prisma.$executeRawUnsafe(`INSERT INTO "training_mastery" ("subjectId","knowledgeCode","masteryScore","status","independentAcCount","hintAcCount","partialCount","failedCount","avgTimeMinutes","lastPracticedAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`, task.subjectId, code, next, masteryStatus(next), incIndependent, incHint, incPartial, incFailed, attempt.timeMinutes);
    }
  }

  private mastery(subjectId: bigint) {
    return many<{ knowledgeCode: string; masteryScore: number; status: string; independentAcCount: number; hintAcCount: number; partialCount: number; failedCount: number; avgTimeMinutes: number | null }>(`SELECT "knowledgeCode", "masteryScore", "status", "independentAcCount", "hintAcCount", "partialCount", "failedCount", "avgTimeMinutes" FROM "training_mastery" WHERE "subjectId"=$1 ORDER BY "masteryScore" ASC, "updatedAt" DESC LIMIT 20`, subjectId).then((rows) => rows.map((x) => ({ ...x, name: nameOf(x.knowledgeCode) })));
  }
}

async function many<T>(sql: string, ...params: unknown[]) { return prisma.$queryRawUnsafe<T[]>(sql, ...params); }
async function one<T>(sql: string, ...params: unknown[]) { const rows = await many<T>(sql, ...params); if (!rows[0]) throw new Error("record not found"); return rows[0]; }
async function optional<T>(sql: string, ...params: unknown[]) { const rows = await many<T>(sql, ...params); return rows[0] ?? null; }
async function stages(goalId: bigint) { return many<StageRow>(`SELECT * FROM "training_stages" WHERE "goalId"=$1 ORDER BY "stageIndex" ASC`, goalId); }
async function tasks(planId: bigint) { return many<TaskRow>(`SELECT * FROM "daily_training_tasks" WHERE "dailyPlanId"=$1 ORDER BY "taskOrder" ASC`, planId); }
export function buildStages(currentScore: number, targetScore: number) { const points = [currentScore, ...MILESTONES.filter((x) => x > currentScore && x < targetScore), targetScore]; return points.slice(1).map((toScore, i) => ({ stageIndex: i + 1, fromScore: points[i], toScore, title: `${points[i]} → ${toScore} 分阶段`, focusJson: focusForScore(toScore), exitCriteriaJson: { scoreProxy: toScore, conditions: ["保分题稳定", "看提示比例下降", "错因可复盘", "完成每周综合验证"] }, status: i === 0 ? "ACTIVE" : "PENDING" })); }
function makeTask(order: number, type: string, module: string, toScore: number, problem: Candidate) { return { taskOrder: order, taskType: type, targetModule: module, targetScoreRole: roleForScore(toScore), estimatedMinutes: Math.min(120, (problem.difficulty ?? maxDifficulty(toScore)) * 10 + (type === "FOUNDATION" ? 10 : 25)), problem, explanationJson: { knowledgePoint: nameOf(module), whyThisProblem: `${typeName(type)}：用于 ${roleForScore(toScore)} 阶段训练。`, beforeSolve: { thinkingEntry: entryFor(module), readQuestionFocus: ["圈出数据范围", "先写暴力思路", "估算复杂度", "列边界样例"] }, hints: [{ level: 1, text: "先说模型，不要急着写代码。" }, { level: 2, text: hintFor(module) }], commonMistakes: mistakesFor(module), afterSolveReview: ["是否独立完成", "是否一次 AC", "是否看提示", "错因是否能归类"], boundary: "不输出完整题解，不输出完整代码。" } }; }
function focusForScore(score: number) { if (score <= 100) return { level: "FOUNDATION_TO_T1", modules: ["implementation", "prefix_sum", "difference", "greedy", "binary_search"], description: "先把 T1 稳定性打出来。" }; if (score <= 150) return { level: "T1_TO_T2_BRIDGE", modules: ["binary_search", "linear_dp", "dfs_bfs", "greedy", "bfs_dfs_graph"], description: "开始突破 T2 常见模型。" }; if (score <= 200) return { level: "T2_MAIN_SCORE", modules: ["linear_dp", "knapsack_dp", "shortest_path", "dsu", "binary_search"], description: "把 T2 变成主得分区。" }; if (score <= 250) return { level: "T3_PARTIAL_SCORE", modules: ["interval_dp", "tree_dp", "segment_tree", "graph", "shortest_path"], description: "训练 T3 部分分拆解。" }; return { level: "CONTEST_STRATEGY", modules: ["dp", "graph", "data_structure", "partial_score", "implementation"], description: "进入模拟赛和策略分阶段。" }; }
function activeStage<T extends { status: string; toScore: number }>(s: T[]) { return s.find((x) => x.status === "ACTIVE") ?? s.find((x) => x.status === "PENDING") ?? s[0]; }
function roleForScore(s: number) { return s <= 100 ? "T1_STABILITY" : s <= 150 ? "T1_T2_BRIDGE" : s <= 200 ? "T2_MAIN_SCORE" : s <= 250 ? "T3_PARTIAL_SCORE" : "T4_STRATEGY"; }
function maxDifficulty(s: number) { return s <= 100 ? 3 : s <= 150 ? 4 : s <= 200 ? 5 : s <= 250 ? 6 : 7; }
function rankProblem(p: { difficulty: number | null; submittedCount: number | null; acceptedCount: number | null }, stat: { isAc: boolean; wrongAttempts: number } | undefined, type: string, maxDiff: number) { let score = 100 - Math.abs((p.difficulty ?? 0) - maxDiff) * 12; if (!stat) score += 10; if (stat && !stat.isAc) score += type === "TRANSFER" ? 22 : 8; if (stat?.isAc && type !== "FOUNDATION") score -= 18; if ((stat?.wrongAttempts ?? 0) >= 3) score += 10; if (p.submittedCount && p.acceptedCount && type === "FOUNDATION" && p.acceptedCount / p.submittedCount >= 0.3) score += 6; return score; }
function masteryDelta(a: { result: string; timeMinutes: number; hintLevelUsed: number; hasSeenSolution: boolean }, expected: number) { let d = a.result === "AC" ? 8 : a.result === "PARTIAL" ? 4 : a.result === "FAILED" ? -2 : -3; if (a.hintLevelUsed > 0) d -= 2; if (a.hasSeenSolution) d -= 5; if (a.timeMinutes > expected * 1.5) d -= 2; return d; }
function masteryStatus(s: number) { return s <= 20 ? "NOT_STARTED" : s <= 40 ? "LEARNING" : s <= 60 ? "PRACTICING" : s <= 75 ? "PASSED_BASIC" : s <= 90 ? "PASSED_TRANSFER" : "CONTEST_READY"; }
function deltaForAttempt(a: AttemptRow & { taskType: string; estimatedMinutes: number }) { let d = a.result === "AC" ? 2.2 : a.result === "PARTIAL" ? 1.1 : a.result === "FAILED" ? 0.1 : -0.2; if (a.score !== null) d += (a.score - 60) / 60; if (a.taskType === "WEAKNESS") d *= 1.2; if (a.hintLevelUsed > 0) d -= 0.35 * a.hintLevelUsed; if (a.hasSeenSolution) d -= 0.8; if (a.submissionCount >= 4) d -= 0.4; if (a.timeMinutes > a.estimatedMinutes * 1.5) d -= 0.4; return d; }
function weaknessSummary(attempts: Array<AttemptRow & { targetModule: string }>, mastery: Array<{ knowledgeCode: string; name: string; masteryScore: number }>) { const errorCounts: Record<string, number> = {}; const moduleCounts: Record<string, number> = {}; attempts.forEach((a) => { asArray(a.errorTypes).forEach((e) => { if (typeof e === "string") errorCounts[e] = (errorCounts[e] ?? 0) + 1; }); if (a.result !== "AC") moduleCounts[a.targetModule] = (moduleCounts[a.targetModule] ?? 0) + 1; }); return { errorCounts, moduleCounts, weakMastery: mastery.filter((m) => m.masteryScore < 60).slice(0, 8) }; }
function dailyCurve(scoreBefore: number, attempts: Array<AttemptRow & { taskType: string; estimatedMinutes: number }>) { let score = scoreBefore; const grouped = new Map<string, typeof attempts>(); attempts.forEach((a) => { const k = a.createdAt.toISOString().slice(0, 10); grouped.set(k, [...(grouped.get(k) ?? []), a]); }); return [...grouped.entries()].map(([date, list]) => { score += list.reduce((s, a) => s + deltaForAttempt(a), 0); return { date, score: Math.max(0, Math.round(score)), completedTasks: list.length }; }); }
function nextPlanFor(targetScore: number, stageScore: number, weakness: { moduleCounts: Record<string, number>; weakMastery: Array<{ knowledgeCode: string }> }) { const modules = Array.from(new Set([...Object.keys(weakness.moduleCounts), ...weakness.weakMastery.map((m) => m.knowledgeCode), ...focusForScore(stageScore).modules])).slice(0, 5); return { targetScore, stageScore, focusModules: modules.map((code) => ({ code, name: nameOf(code) })), taskMix: { foundation: 1, weakness: 1, transferOrReview: 1 }, note: "下周继续每天 3 题：保分题、最大短板题、迁移/复盘题。" }; }
function weeklyText(i: { scoreBefore: number; scoreAfter: number; scoreDelta: number; attempts: AttemptRow[]; weakness: { errorCounts: Record<string, number>; weakMastery: Array<{ name: string; masteryScore: number }> }; nextPlan: { focusModules: Array<{ name: string }>; note: string } }) { const total = i.attempts.length; const ac = i.attempts.filter((a) => a.result === "AC").length; const partial = i.attempts.filter((a) => a.result === "PARTIAL").length; const avg = total ? Math.round(i.attempts.reduce((s, a) => s + a.timeMinutes, 0) / total) : 0; const hintRate = total ? Math.round((i.attempts.filter((a) => a.hintLevelUsed > 0 || a.hasSeenSolution).length / total) * 100) : 0; return [`# 每周训练报告`, ``, `## 1. 分数曲线`, `本周分数代理从 ${i.scoreBefore} 到 ${i.scoreAfter}，变化 ${i.scoreDelta >= 0 ? "+" : ""}${i.scoreDelta}。`, ``, `## 2. 完成情况`, `本周完成 ${total} 次训练记录：AC ${ac}，部分分 ${partial}。平均用时 ${avg} 分钟，看提示/题解比例 ${hintRate}%。`, ``, `## 3. 主要错因`, Object.entries(i.weakness.errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `- ${k}: ${v} 次`).join("\n") || "本周错因数据不足。", ``, `## 4. 薄弱知识点`, i.weakness.weakMastery.map((m) => `- ${m.name}: ${m.masteryScore}`).join("\n") || "暂无明显薄弱项。", ``, `## 5. 下周计划`, `重点模块：${i.nextPlan.focusModules.map((m) => m.name).join("、") || "保持当前阶段"}。${i.nextPlan.note}`].join("\n"); }
function startOfDate(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
function endOfDate(d: Date) { return new Date(startOfDate(d).getTime() + 86_400_000 - 1); }
function nameOf(code: string) { return KNOWLEDGE_NODES.find((n) => n.code === code)?.name ?? code; }
function typeName(t: string) { return t === "FOUNDATION" ? "保分题" : t === "WEAKNESS" ? "短板题" : t === "TRANSFER" ? "迁移题" : "复盘题"; }
function entryFor(m: string) { return m.includes("dp") ? "先定义状态、转移、初始化和遍历顺序。" : m.includes("graph") || m === "shortest_path" ? "先把题意翻译成点、边、状态和边权。" : m === "binary_search" ? "先判断答案是否具有单调性，再写 check。" : "先做暴力，再看瓶颈。"; }
function hintFor(m: string) { return m.includes("dp") ? "只写状态含义和边界，不要直接看题解。" : m === "binary_search" ? "先判断条件随答案变大是更容易还是更难满足。" : "先写小数据版本，再定位可优化部分。"; }
function mistakesFor(m: string) { return m.includes("dp") ? ["状态定义不清", "初始化错误", "转移顺序错误"] : m === "binary_search" ? ["单调性判断错", "边界更新错", "答案范围漏边界"] : ["读题漏条件", "边界样例不足", "复杂度估计错误"]; }
function diffName(d: number) { return ["暂无评定", "入门", "普及-", "普及/提高-", "普及+/提高", "提高+/省选-", "省选/NOI-", "NOI/NOI+/CTSC"][d] ?? "未知"; }
function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)); }
