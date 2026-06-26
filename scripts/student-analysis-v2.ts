import { StudentAnalysisV2Service } from "@/src/server/analysis/student-analysis-v2-service";

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (!args.subjectId) throw new Error("Missing --subjectId");
  const report = await new StudentAnalysisV2Service().generate({
    subjectId: BigInt(args.subjectId),
    syncJobId: args.syncJobId ? BigInt(args.syncJobId) : undefined,
    target: "CSP-S_FIRST_PRIZE"
  });
  console.log(JSON.stringify(report, (_key, value) => (typeof value === "bigint" ? value.toString() : value), 2));
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
