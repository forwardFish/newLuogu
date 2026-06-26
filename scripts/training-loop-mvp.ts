import { TrainingLoopService } from "@/src/server/training/training-loop-service";

const args = parseArgs(process.argv.slice(2));
const action = args.action ?? "help";
const service = new TrainingLoopService();

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (action === "create-goal") {
    requireArg("subjectId");
    requireArg("currentScore");
    requireArg("targetScore");
    const result = await service.createGoal({
      subjectId: BigInt(args.subjectId),
      currentScore: Number(args.currentScore),
      targetScore: Number(args.targetScore),
      examDate: args.examDate ? new Date(args.examDate) : null,
      weeklyHours: args.weeklyHours ? Number(args.weeklyHours) : undefined,
      dailyProblemNum: args.dailyProblemNum ? Number(args.dailyProblemNum) : undefined
    });
    print(result);
    return;
  }

  if (action === "daily") {
    requireArg("goalId");
    const result = await service.generateDailyPlan({
      goalId: BigInt(args.goalId),
      date: args.date ? new Date(args.date) : undefined
    });
    print(result);
    return;
  }

  if (action === "attempt") {
    requireArg("taskId");
    requireArg("result");
    requireArg("timeMinutes");
    const result = await service.recordAttempt(BigInt(args.taskId), {
      result: normalizeResult(args.result),
      score: args.score === undefined ? undefined : Number(args.score),
      timeMinutes: Number(args.timeMinutes),
      submissionCount: args.submissionCount ? Number(args.submissionCount) : undefined,
      hintLevelUsed: args.hintLevelUsed ? Number(args.hintLevelUsed) : undefined,
      hasSeenSolution: args.hasSeenSolution === "true",
      errorTypes: splitList(args.errorTypes),
      selfNote: args.selfNote
    });
    print(result);
    return;
  }

  if (action === "weekly") {
    requireArg("goalId");
    requireArg("weekStart");
    requireArg("weekEnd");
    const result = await service.generateWeeklyReport({
      goalId: BigInt(args.goalId),
      weekStart: new Date(args.weekStart),
      weekEnd: new Date(args.weekEnd)
    });
    print(result);
    return;
  }

  console.log(`Usage:

pnpm tsx scripts/training-loop-mvp.ts --action create-goal --subjectId 1 --currentScore 80 --targetScore 200 --examDate 2026-10-20
pnpm tsx scripts/training-loop-mvp.ts --action daily --goalId 1
pnpm tsx scripts/training-loop-mvp.ts --action attempt --taskId 1 --result AC --score 100 --timeMinutes 35 --submissionCount 1 --hintLevelUsed 0 --hasSeenSolution false --errorTypes "BOUNDARY_ERROR"
pnpm tsx scripts/training-loop-mvp.ts --action weekly --goalId 1 --weekStart 2026-06-22 --weekEnd 2026-06-28
`);
}

function parseArgs(argv: string[]) {
  const output: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
    if (key && value !== undefined) output[key] = value;
  }
  return output;
}

function requireArg(key: string) {
  if (!args[key]) throw new Error(`Missing --${key}`);
}

function splitList(value: string | undefined) {
  return value ? value.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean) : [];
}

function normalizeResult(value: string) {
  const allowed = ["AC", "PARTIAL", "FAILED", "GIVE_UP"] as const;
  if (allowed.includes(value as (typeof allowed)[number])) return value as (typeof allowed)[number];
  throw new Error(`Invalid result: ${value}`);
}

function print(value: unknown) {
  console.log(JSON.stringify(value, (_key, inner) => (typeof inner === "bigint" ? inner.toString() : inner), 2));
}
