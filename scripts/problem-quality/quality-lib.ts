import { execFile, spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

type JsonObject = Record<string, unknown>;

type ProblemQualityOptions = {
  problemId: string | null;
  generatedProblemsDir: string;
  problemBankDir: string;
};

type QualityReport = {
  problemId: string;
  status: "DRAFT_NOT_USABLE" | "LLM_GENERATED_NEEDS_REVIEW" | "PASSED_FOR_TRAINING";
  compiler?: {
    command: string;
    version: string;
    standard: "c++17";
  };
  checks: {
    statementComplete: boolean;
    solutionComplete: boolean;
    bruteForceExists: boolean;
    stdExists: boolean;
    generatorExists: boolean;
    compilerAvailable: boolean;
    bruteforceCompiled: boolean;
    stdCompiled: boolean;
    generatorCompiled: boolean;
    stressTestPassed: boolean;
    testCount: number;
  };
  allowedUsage: "NOT_USABLE" | "TRAINING_DRAFT" | "TRAINING_ONLY";
  blockers: string[];
};

type CompilerInfo = {
  command: string;
  binDir: string | null;
  version: string;
  standard: "c++17";
};

type StressResult = {
  passed: boolean;
  testCount: number;
  failure?: string;
};

const execFileAsync = promisify(execFile);

export function parseProblemQualityCliOptions(argv = process.argv.slice(2)): ProblemQualityOptions {
  const args: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
    if (key && value) args[key] = value;
  }
  return {
    problemId: args.problem ?? args.problemId ?? null,
    generatedProblemsDir: path.resolve(args.generated ?? path.join(process.cwd(), "data", "generated-problems")),
    problemBankDir: path.resolve(args.problemBank ?? path.join(process.cwd(), "data", "problem-bank")),
  };
}

export async function buildProblemQualityReports(options: ProblemQualityOptions): Promise<QualityReport[]> {
  const specs = await readJson<{ items?: JsonObject[] }>(path.join(options.problemBankDir, "generated_problem_specs.json"));
  const problemIds = (specs.items ?? [])
    .map((item) => getString(item, "generatedProblemId"))
    .filter((id) => id && (!options.problemId || id === options.problemId));
  const reports: QualityReport[] = [];
  for (const problemId of problemIds) {
    const report = await buildQualityReport(options.generatedProblemsDir, problemId);
    reports.push(report);
    await writeJson(path.join(options.generatedProblemsDir, problemId, "quality_report.json"), report);
  }
  await writeJson(path.join(options.generatedProblemsDir, "quality_summary.json"), {
    generatedAt: new Date().toISOString(),
    items: reports.map((report) => ({
      problemId: report.problemId,
      status: report.status,
      allowedUsage: report.allowedUsage,
      blockers: report.blockers,
    })),
  });
  return reports;
}

async function buildQualityReport(root: string, problemId: string): Promise<QualityReport> {
  const dir = path.join(root, problemId);
  const statement = await readTextIfExists(path.join(dir, "statement.md"));
  const solution = await readTextIfExists(path.join(dir, "solution.md"));
  const brutePath = path.join(dir, "bruteforce.cpp");
  const stdPath = path.join(dir, "std.cpp");
  const generatorPath = path.join(dir, "generator.cpp");
  const bruteForceExists = await exists(brutePath);
  const stdExists = await exists(stdPath);
  const generatorExists = await exists(generatorPath);
  const compiler = await resolveCppCompiler();
  const compileResults = compiler
    ? {
        bruteforceCompiled: bruteForceExists ? await compileCpp(compiler, brutePath, path.join(dir, ".quality", "bruteforce.exe")) : false,
        stdCompiled: stdExists ? await compileCpp(compiler, stdPath, path.join(dir, ".quality", "std.exe")) : false,
        generatorCompiled: generatorExists ? await compileCpp(compiler, generatorPath, path.join(dir, ".quality", "generator.exe")) : false,
      }
    : { bruteforceCompiled: false, stdCompiled: false, generatorCompiled: false };
  const stress = compiler && compileResults.bruteforceCompiled && compileResults.stdCompiled && compileResults.generatorCompiled
    ? await runStressTests(compiler, dir, problemId)
    : { passed: false, testCount: 0 };
  const checks = {
    statementComplete: statement.includes("#") && /输入|输出|样例|数据|范围|input|output|sample/i.test(statement),
    solutionComplete: solution.length > 200,
    bruteForceExists,
    stdExists,
    generatorExists,
    compilerAvailable: Boolean(compiler),
    ...compileResults,
    stressTestPassed: stress.passed,
    testCount: stress.testCount,
  };
  const blockers = Object.entries(checks)
    .filter(([key, value]) => !value && key !== "compilerAvailable" && key !== "stressTestPassed" && key !== "testCount")
    .map(([key]) => key);
  if (!checks.compilerAvailable) blockers.push("compilerUnavailable");
  if (checks.compilerAvailable && !checks.stressTestPassed) blockers.push("stressTestNotPassed");
  if (stress.failure) blockers.push(`stressFailure:${stress.failure}`);
  const structurallyUsable = checks.statementComplete && checks.solutionComplete && checks.bruteForceExists && checks.stdExists && checks.generatorExists;
  return {
    problemId,
    status: checks.stressTestPassed ? "PASSED_FOR_TRAINING" : structurallyUsable ? "LLM_GENERATED_NEEDS_REVIEW" : "DRAFT_NOT_USABLE",
    compiler: compiler ? { command: compiler.command, version: compiler.version, standard: compiler.standard } : undefined,
    checks,
    allowedUsage: checks.stressTestPassed ? "TRAINING_ONLY" : structurallyUsable ? "TRAINING_DRAFT" : "NOT_USABLE",
    blockers,
  };
}

async function resolveCppCompiler(): Promise<CompilerInfo | null> {
  const commands = uniqueStrings([
    process.env.CXX,
    path.resolve(process.cwd(), "..", "tools", "w64devkit-2.8.0", "w64devkit", "bin", "g++.exe"),
    "C:\\Program Files (x86)\\Dev-Cpp\\MinGW64\\bin\\g++.exe",
    "C:\\Program Files\\Dev-Cpp\\MinGW64\\bin\\g++.exe",
    "g++",
    "clang++",
  ].filter(Boolean) as string[]);
  for (const command of commands) {
    try {
      const binDir = path.isAbsolute(command) ? path.dirname(command) : null;
      const version = await execFileAsync(command, ["--version"], { timeout: 5000, env: envWithCompilerPath(binDir) });
      if (!(await supportsCpp17(command, binDir))) continue;
      return {
        command,
        binDir,
        version: firstLine(version.stdout),
        standard: "c++17",
      };
    } catch {
      // Try the next compiler.
    }
  }
  return null;
}

async function supportsCpp17(command: string, binDir: string | null): Promise<boolean> {
  const probeDir = path.join(process.cwd(), "temp", "problem-quality");
  const probeSource = path.join(probeDir, "cpp17_probe.cpp");
  const probeOutput = path.join(probeDir, "cpp17_probe.exe");
  await fs.mkdir(probeDir, { recursive: true });
  await fs.writeFile(probeSource, "#include <optional>\nint main(){std::optional<int> x=1; return *x-1;}\n", "utf8");
  try {
    await execFileAsync(command, ["-std=c++17", "-O2", probeSource, "-o", probeOutput], {
      timeout: 30_000,
      env: envWithCompilerPath(binDir),
    });
    return true;
  } catch {
    return false;
  }
}

async function compileCpp(compiler: CompilerInfo, source: string, output: string): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(output), { recursive: true });
    await execFileAsync(compiler.command, ["-std=c++17", "-O2", source, "-o", output], {
      timeout: 30_000,
      env: envWithCompilerPath(compiler.binDir),
    });
    return true;
  } catch {
    return false;
  }
}

async function runStressTests(compiler: CompilerInfo, dir: string, problemId: string): Promise<StressResult> {
  const qualityDir = path.join(dir, ".quality");
  const generatorExe = path.join(qualityDir, "generator.exe");
  const bruteExe = path.join(qualityDir, "bruteforce.exe");
  const stdExe = path.join(qualityDir, "std.exe");
  const cases = buildStressCases(problemId);
  let testCount = 0;
  for (const args of cases) {
    let input = "";
    try {
      input = await runExecutable(generatorExe, args, "", compiler.binDir, 10_000);
    } catch {
      continue;
    }
    try {
      const brute = await runExecutable(bruteExe, [], input, compiler.binDir, 10_000);
      const standard = await runExecutable(stdExe, [], input, compiler.binDir, 10_000);
      testCount += 1;
      if (normalizeOutput(brute) !== normalizeOutput(standard)) {
        return { passed: false, testCount, failure: `mismatch:${args.join(",") || "default"}` };
      }
    } catch (error) {
      return { passed: false, testCount, failure: `runtime:${error instanceof Error ? error.message.slice(0, 80) : String(error).slice(0, 80)}` };
    }
  }
  return { passed: testCount >= 5, testCount, failure: testCount >= 5 ? undefined : "insufficientRunnableCases" };
}

function buildStressCases(problemId: string): string[][] {
  const seeds = Array.from({ length: 8 }, (_, index) => String(1001 + index));
  if (problemId.includes("partial_score")) {
    const shapes = ["small", "random", "inc", "dec", "equal"];
    return seeds.flatMap((seed, index) => [[String(6 + index), String(2 + (index % 3)), seed, shapes[index % shapes.length]]]);
  }
  if (problemId.includes("math_002")) {
    return seeds.flatMap((seed, index) => [["1", String(5 + index), String(8 + index * 2), seed]]);
  }
  if (problemId.includes("math_003")) {
    return seeds.map((seed) => ["1", seed]);
  }
  return [
    ...seeds.map((seed) => [seed]),
    ...seeds.map((seed) => ["1", seed]),
    ...seeds.map((seed, index) => [String(6 + index), String(2 + (index % 3)), seed, "small"]),
  ];
}

function runExecutable(exePath: string, args: string[], input: string, binDir: string | null, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(exePath, args, {
      env: envWithCompilerPath(binDir),
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr.trim() || `exit ${code}`));
    });
    child.stdin.end(input);
  });
}

function envWithCompilerPath(binDir: string | null): NodeJS.ProcessEnv {
  if (!binDir) return process.env;
  return { ...process.env, PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}` };
}

function normalizeOutput(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function firstLine(value: string): string {
  return value.split(/\r?\n/)[0]?.trim() ?? "";
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

async function readTextIfExists(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getString(source: unknown, key: string): string {
  if (!isObject(source)) return "";
  const value = source[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
