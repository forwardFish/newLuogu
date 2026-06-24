import { promises as fs } from "fs";
import path from "path";
import { buildDiagnosisSystem } from "../diagnosis/diagnosis-lib";

type JsonObject = Record<string, unknown>;

type ProblemBankOptions = {
  analysisDir: string;
  diagnosisDir: string;
  problemBankDir: string;
  generatedProblemsDir: string;
};

type Weakness = {
  weaknessId: string;
  title: string;
  severity: number;
  relatedModules: string[];
  relatedErrorTypes: string[];
  evidenceProblems: string[];
  problemCount: number;
  trainingAction: string;
  verifyMethod: string;
  clusterId: string;
};

type CatalogItem = {
  problemPid: string;
  title: string | null;
  difficulty: string;
  difficultyLevel: number;
  luoguTags: string[];
  source: string;
  problemUrl: string;
  passRate: number | null;
  submitCount: number | null;
  acceptedCount: number | null;
  isAlreadySolved: boolean;
  isAlreadyAttempted: boolean;
  historicalAttemptCount: number;
  relatedWeaknessTags: string[];
  lastUpdatedAt: string;
};

export function parseProblemBankCliOptions(argv = process.argv.slice(2)): ProblemBankOptions {
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
    analysisDir: path.resolve(args.analysis ?? path.join(process.cwd(), "data", "analysis")),
    diagnosisDir: path.resolve(args.diagnosis ?? path.join(process.cwd(), "data", "diagnosis")),
    problemBankDir: path.resolve(args.output ?? path.join(process.cwd(), "data", "problem-bank")),
    generatedProblemsDir: path.resolve(args.generated ?? path.join(process.cwd(), "data", "generated-problems")),
  };
}

export async function buildLuoguCatalog(options: ProblemBankOptions): Promise<CatalogItem[]> {
  await ensureDiagnosis(options);
  const existingPath = path.join(options.problemBankDir, "luogu_problem_catalog.json");
  if (await exists(existingPath)) {
    const existing = await readJson<{ items?: CatalogItem[] } | CatalogItem[]>(existingPath);
    if (Array.isArray(existing)) return existing;
    if (Array.isArray(existing.items)) return existing.items;
  }

  const vectors = await readDiagnosisItems<JsonObject>(options, "problem_feature_vectors.json");
  const problemDiagnosis = await readDiagnosisItems<JsonObject>(options, "problem_diagnosis.json");
  const diagnosisByPid = new Map(problemDiagnosis.map((item) => [getString(item, "problemPid"), item]));
  const catalog = vectors.map((vector) => {
    const pid = getString(vector, "problemPid");
    const diagnosis = diagnosisByPid.get(pid);
    const modules = arrayOfStrings(vector.codeModules);
    return {
      problemPid: pid,
      title: getString(vector, "problemTitle") || null,
      difficulty: getString(vector, "difficultyBand") || "未知",
      difficultyLevel: difficultyLevel(getString(vector, "difficultyBand")),
      luoguTags: modules.map((item) => moduleToChinese(item)),
      source: "luogu_history",
      problemUrl: `https://www.luogu.com.cn/problem/${pid}`,
      passRate: null,
      submitCount: null,
      acceptedCount: null,
      isAlreadySolved: Boolean(vector.solved),
      isAlreadyAttempted: true,
      historicalAttemptCount: getNumber(vector, "attemptCount"),
      relatedWeaknessTags: arrayOfStrings(diagnosis?.likelyErrorTypes),
      lastUpdatedAt: new Date().toISOString(),
    };
  });
  await writeJson(existingPath, {
    generatedAt: new Date().toISOString(),
    source: "history_derived_catalog",
    note: "No external Luogu catalog was required. This catalog is derived from historical attempted problems.",
    items: catalog,
  });
  return catalog;
}

export async function buildCspSProblemMap(options: ProblemBankOptions): Promise<JsonObject> {
  const catalog = await buildLuoguCatalog(options);
  const map = {
    generatedAt: new Date().toISOString(),
    abilityBuckets: {
      T1_STABILITY: catalog.filter((item) => item.difficultyLevel <= 3).slice(0, 80).map((item) => item.problemPid),
      T2_MODELING: catalog.filter((item) => item.difficultyLevel >= 3 && item.difficultyLevel <= 5).slice(0, 100).map((item) => item.problemPid),
      T3_PARTIAL_SCORE: catalog.filter((item) => item.difficultyLevel >= 5 || item.relatedWeaknessTags.includes("PARTIAL_SCORE_MISSED")).slice(0, 80).map((item) => item.problemPid),
      T4_STRATEGY: catalog.filter((item) => item.historicalAttemptCount >= 5).slice(0, 80).map((item) => item.problemPid),
    },
    moduleBuckets: groupCatalogByModule(catalog),
  };
  await writeJson(path.join(options.problemBankDir, "csp_s_problem_map.json"), map);
  return map;
}

export async function selectTrainingTasks(options: ProblemBankOptions): Promise<JsonObject> {
  const catalog = await buildLuoguCatalog(options);
  const weaknesses = await readWeaknesses(options);
  const tasks = weaknesses.slice(0, 10).map((weakness) => {
    const module = weakness.relatedModules[0] ?? "implementation";
    const evidenceSet = new Set(weakness.evidenceProblems);
    const evidenceCandidates = catalog
      .filter((item) => evidenceSet.has(item.problemPid))
      .sort((a, b) => b.historicalAttemptCount - a.historicalAttemptCount);
    const moduleCandidates = catalog
      .filter((item) => item.luoguTags.includes(moduleToChinese(module)) || item.relatedWeaknessTags.some((tag) => weakness.relatedErrorTypes.includes(tag)))
      .sort((a, b) => Number(a.isAlreadySolved) - Number(b.isAlreadySolved) || b.historicalAttemptCount - a.historicalAttemptCount)
      .filter((item) => !evidenceSet.has(item.problemPid));
    const candidates = uniqueBy([...evidenceCandidates, ...moduleCandidates], (item) => item.problemPid).slice(0, 4);
    return {
      weaknessId: weakness.weaknessId,
      targetAbility: targetAbilityForWeakness(weakness),
      tasks: candidates.length > 0
        ? candidates.map((item) => ({
            taskType: "SELECT_EXISTING",
            source: item.source,
            problemPid: item.problemPid,
            problemUrl: item.problemUrl,
            module,
            difficulty: item.difficulty,
            selectionReason: `用于验证薄弱点：${weakness.title}`,
            trainingGoal: weakness.trainingAction,
            timeLimitMinutes: item.difficultyLevel >= 5 ? 80 : 60,
            verifyMethod: weakness.verifyMethod,
          }))
        : [
            {
              taskType: "SELECT_BY_RULE",
              source: "luogu",
              module,
              difficulty: "提高",
              selectionRule: `选择 2-4 道 ${moduleToChinese(module)} 题，重点验证：${weakness.title}`,
              trainingGoal: weakness.trainingAction,
              timeLimitMinutes: 60,
              verifyMethod: weakness.verifyMethod,
            },
          ],
    };
  });
  const output = { generatedAt: new Date().toISOString(), items: tasks };
  await writeJson(path.join(options.problemBankDir, "selected_training_tasks.json"), output);
  return output;
}

export async function mutateProblemSpecs(options: ProblemBankOptions): Promise<JsonObject> {
  const weaknesses = await readWeaknesses(options);
  const specs = weaknesses.slice(0, 8).map((weakness, index) => {
    const module = weakness.relatedModules[0] ?? "implementation";
    return {
      mutationId: `mut_${module}_${String(index + 1).padStart(3, "0")}`,
      baseWeaknessId: weakness.weaknessId,
      baseProblemPids: weakness.evidenceProblems.slice(0, 3),
      mutationGoal: mutationGoalFor(module, weakness.relatedErrorTypes),
      targetAbility: targetAbilityForWeakness(weakness),
      module,
      difficulty: difficultyForWeakness(weakness),
      problemArchetype: archetypeFor(module, weakness.relatedErrorTypes),
      newProblemSpec: {
        title: `${moduleToChinese(module)} 迁移诊断题 ${index + 1}`,
        storyBrief: "全新语境，保留核心能力点，不复制原题题面。",
        inputSpec: "根据具体变式补充输入格式。",
        outputSpec: "根据具体变式补充输出格式。",
        constraints: "应包含小数据、特殊性质和完整数据范围。",
        requiredSubtasks: ["30 分暴力", "60 分基础模型", "100 分完整做法"],
      },
      verifyMethod: weakness.verifyMethod,
      status: "SPEC_DRAFT_NEEDS_AUTHORING",
    };
  });
  const output = { generatedAt: new Date().toISOString(), items: specs };
  await writeJson(path.join(options.problemBankDir, "mutated_problem_specs.json"), output);
  return output;
}

export async function generateDiagnosticProblems(options: ProblemBankOptions): Promise<JsonObject> {
  const weaknesses = await readWeaknesses(options);
  const specs = weaknesses.slice(0, 3).map((weakness, index) => {
    const module = weakness.relatedModules[0] ?? "implementation";
    const problemId = `gen_${module}_${String(index + 1).padStart(3, "0")}`;
    return {
      generatedProblemId: problemId,
      weaknessId: weakness.weaknessId,
      targetAbility: targetAbilityForWeakness(weakness),
      module,
      difficulty: difficultyForWeakness(weakness),
      goal: `诊断并训练：${weakness.title}`,
      problemPackage: {
        statementPath: path.join("data", "generated-problems", problemId, "statement.md"),
        solutionPath: path.join("data", "generated-problems", problemId, "solution.md"),
        bruteForcePath: path.join("data", "generated-problems", problemId, "bruteforce.cpp"),
        standardSolutionPath: path.join("data", "generated-problems", problemId, "std.cpp"),
        generatorPath: path.join("data", "generated-problems", problemId, "generator.cpp"),
        testsPath: path.join("data", "generated-problems", problemId, "tests"),
      },
      subtasks: [
        { score: 30, description: "小 n 暴力" },
        { score: 60, description: "特殊性质或基础模型" },
        { score: 100, description: "完整正解" },
      ],
      status: "DRAFT_NOT_FOR_FORMAL_TEST",
    };
  });
  for (const spec of specs) await writeGeneratedProblemPackage(options, spec);
  const output = { generatedAt: new Date().toISOString(), items: specs };
  await writeJson(path.join(options.problemBankDir, "generated_problem_specs.json"), output);
  return output;
}

export async function buildTaskPack(options: ProblemBankOptions): Promise<JsonObject> {
  const selected = await readOrBuildSelectedTasks(options);
  const mutated = await readOrBuildMutations(options);
  const generated = await readOrBuildGeneratedProblems(options);
  const weaknessSummary = await readWeaknesses(options);
  const selectedItems = arrayOfObjects(selected.items);
  const mutationItems = arrayOfObjects(mutated.items);
  const generatedItems = arrayOfObjects(generated.items);
  const days = [
    {
      day: 1,
      theme: "T1 稳定性 + 边界检查",
      tasks: [
        {
          taskType: "SELECT_EXISTING",
          targetAbility: "T1_STABILITY",
          selectionRule: "选择 2 道模拟/前缀和/简单贪心题。",
          trainingGoal: "提高一次 AC，减少边界和初始化错误。",
          verifyMethod: "提交次数 <= 2，提交前完成检查清单。",
        },
      ],
    },
    ...weaknessSummary.slice(0, 5).map((weakness, index) => ({
      day: index + 2,
      theme: getString(weakness, "title"),
      tasks: [
        firstTaskForWeakness(selectedItems, getString(weakness, "weaknessId")),
        mutationItems[index]
          ? {
              taskType: "MUTATE_EXISTING",
              mutationId: getString(mutationItems[index], "mutationId"),
              module: getString(mutationItems[index], "module"),
              trainingGoal: getString(mutationItems[index], "mutationGoal"),
              verifyMethod: getString(mutationItems[index], "verifyMethod"),
            }
          : null,
      ].filter(Boolean),
    })),
    {
      day: 7,
      theme: "综合验证 + 原创诊断题草案",
      tasks: [
        {
          taskType: "GENERATE_DIAGNOSTIC_DRAFT",
          generatedProblemId: getString(generatedItems[0], "generatedProblemId"),
          targetAbility: getString(generatedItems[0], "targetAbility") || "T3_PARTIAL_SCORE",
          trainingGoal: "用草案题验证迁移能力；草案未补齐测试前不可作为正式比赛题。",
          verifyMethod: "必须写 30/50/70 分方案，并人工确认题包完整性。",
        },
      ],
    },
  ];
  const pack = {
    generatedAt: new Date().toISOString(),
    goal: "CSP-S_FIRST_PRIZE",
    basedOnWeaknesses: weaknessSummary.slice(0, 8).map((item) => getString(item, "weaknessId")),
    mixRatio: {
      selectExisting: 0.5,
      historicalReview: 0.2,
      mutateExisting: 0.2,
      generateDiagnostic: 0.1,
    },
    days,
  };
  await writeJson(path.join(options.problemBankDir, "task_pack_7d.json"), pack);
  await fs.writeFile(path.join(options.problemBankDir, "task_pack_7d.md"), `\uFEFF${renderTaskPackMarkdown(pack)}`, "utf8");
  return pack;
}

export async function buildProblemEngine(options: ProblemBankOptions): Promise<void> {
  await ensureDiagnosis(options);
  await ensureDir(options.problemBankDir);
  await ensureDir(options.generatedProblemsDir);
  await buildLuoguCatalog(options);
  await buildCspSProblemMap(options);
  await selectTrainingTasks(options);
  await mutateProblemSpecs(options);
  await generateDiagnosticProblems(options);
  await buildTaskPack(options);
}

async function ensureDiagnosis(options: ProblemBankOptions): Promise<void> {
  if (!(await exists(path.join(options.diagnosisDir, "weakness_summary.json")))) {
    await buildDiagnosisSystem({
      analysisDir: options.analysisDir,
      diagnosisDir: options.diagnosisDir,
    });
  }
}

async function readWeaknesses(options: ProblemBankOptions): Promise<Weakness[]> {
  await ensureDiagnosis(options);
  const summary = await readJson<{ topWeaknesses: Weakness[] }>(path.join(options.diagnosisDir, "weakness_summary.json"));
  return summary.topWeaknesses ?? [];
}

async function readDiagnosisItems<T extends JsonObject>(options: ProblemBankOptions, fileName: string): Promise<T[]> {
  const data = await readJson<{ items: T[] }>(path.join(options.diagnosisDir, fileName));
  return data.items ?? [];
}

async function readOrBuildSelectedTasks(options: ProblemBankOptions): Promise<JsonObject> {
  const filePath = path.join(options.problemBankDir, "selected_training_tasks.json");
  if (await exists(filePath)) return readJson<JsonObject>(filePath);
  return selectTrainingTasks(options);
}

async function readOrBuildMutations(options: ProblemBankOptions): Promise<JsonObject> {
  const filePath = path.join(options.problemBankDir, "mutated_problem_specs.json");
  if (await exists(filePath)) return readJson<JsonObject>(filePath);
  return mutateProblemSpecs(options);
}

async function readOrBuildGeneratedProblems(options: ProblemBankOptions): Promise<JsonObject> {
  const filePath = path.join(options.problemBankDir, "generated_problem_specs.json");
  if (await exists(filePath)) return readJson<JsonObject>(filePath);
  return generateDiagnosticProblems(options);
}

async function writeGeneratedProblemPackage(options: ProblemBankOptions, spec: JsonObject): Promise<void> {
  const problemId = getString(spec, "generatedProblemId");
  const dir = path.join(options.generatedProblemsDir, problemId);
  await ensureDir(path.join(dir, "tests"));
  const module = getString(spec, "module");
  const title = `${moduleToChinese(module)} 诊断题草案`;
  await fs.writeFile(path.join(dir, "statement.md"), `# ${title}\n\n状态：DRAFT_NOT_FOR_FORMAL_TEST\n\n本题用于诊断 ${moduleToChinese(module)} 相关薄弱点。题面需要在正式使用前由教练补全和审查。\n\n## 输入格式\n\n待补充。\n\n## 输出格式\n\n待补充。\n\n## 数据范围\n\n应包含 30/60/100 三档子任务。\n`, "utf8");
  await fs.writeFile(path.join(dir, "solution.md"), `# ${title} 解法草案\n\n正式使用前必须补齐标准解、复杂度证明和边界讨论。\n`, "utf8");
  await fs.writeFile(path.join(dir, "bruteforce.cpp"), "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }\n", "utf8");
  await fs.writeFile(path.join(dir, "std.cpp"), "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }\n", "utf8");
  await fs.writeFile(path.join(dir, "generator.cpp"), "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }\n", "utf8");
  await fs.writeFile(path.join(dir, "checker.md"), "# Checker 设计\n\n当前为草案。正式使用前需要补齐数据生成与对拍说明。\n", "utf8");
  await writeJson(path.join(dir, "metadata.json"), spec);
  await fs.writeFile(path.join(dir, "tests", "README.md"), "测试点尚未生成。草案题不可用于正式测试。\n", "utf8");
}

function firstTaskForWeakness(selectedItems: JsonObject[], weaknessId: string): JsonObject {
  const group = selectedItems.find((item) => getString(item, "weaknessId") === weaknessId);
  const tasks = arrayOfObjects(group?.tasks);
  return tasks[0] ?? {
    taskType: "SELECT_BY_RULE",
    selectionRule: "选择与该薄弱点匹配的洛谷成熟题。",
    trainingGoal: "验证薄弱点是否改善。",
    verifyMethod: "记录提交次数、用时和错误类型。",
  };
}

function groupCatalogByModule(catalog: CatalogItem[]): Record<string, string[]> {
  const buckets: Record<string, string[]> = {};
  for (const item of catalog) {
    for (const tag of item.luoguTags) {
      const key = chineseToModule(tag);
      const list = buckets[key] ?? [];
      list.push(item.problemPid);
      buckets[key] = list;
    }
  }
  return buckets;
}

function moduleToChinese(module: string): string {
  const map: Record<string, string> = {
    interval_dp: "区间 DP",
    state_compression_dp: "状态压缩 DP",
    dsu: "并查集",
    binary_search: "二分答案",
    segment_tree: "线段树",
    fenwick_tree: "树状数组",
    graph: "图论",
    dp: "DP",
    math: "数学",
    string: "字符串",
    search: "搜索",
    dfs_bfs: "DFS/BFS",
    implementation: "实现",
    partial_score: "部分分",
  };
  return map[module] ?? module;
}

function chineseToModule(label: string): string {
  const entry = Object.entries({
    interval_dp: "区间 DP",
    state_compression_dp: "状态压缩 DP",
    dsu: "并查集",
    binary_search: "二分答案",
    segment_tree: "线段树",
    fenwick_tree: "树状数组",
    graph: "图论",
    dp: "DP",
    math: "数学",
    string: "字符串",
  }).find(([, value]) => value === label);
  return entry?.[0] ?? label;
}

function targetAbilityForWeakness(weakness: Weakness): string {
  if (weakness.relatedErrorTypes.includes("PARTIAL_SCORE_MISSED")) return "T3_PARTIAL_SCORE";
  if (weakness.relatedModules.some((item) => ["dp", "interval_dp", "dsu", "binary_search", "graph"].includes(item))) return "T2_MODELING";
  if (weakness.relatedErrorTypes.includes("DEBUG_TIMEOUT")) return "T4_STRATEGY";
  return "T1_STABILITY";
}

function difficultyForWeakness(weakness: Weakness): string {
  if (weakness.severity >= 80) return "提高+/省选-";
  if (weakness.severity >= 60) return "提高";
  return "普及+/提高-";
}

function mutationGoalFor(module: string, errors: string[]): string {
  if (module === "interval_dp") return "改变输出目标或初始化条件，验证是否真正理解区间 DP 状态和 len 枚举。";
  if (module === "binary_search") return "改变判定函数含义，验证 check 单调性和边界。";
  if (module === "dsu") return "改变集合关系和离散化输入，验证集合含义是否清晰。";
  if (errors.includes("PARTIAL_SCORE_MISSED")) return "改变子任务数据范围，训练 30/50/70 分拆解。";
  return "改变约束和输出目标，验证同构迁移能力。";
}

function archetypeFor(module: string, errors: string[]) {
  if (module === "interval_dp") return { coreAlgorithm: "interval_dp", stateShape: "dp[l][r]", keyChallenge: "初始化与区间长度枚举", mustTest: ["len=1", "len=2", "full interval", "empty transition"] };
  if (module === "binary_search") return { coreAlgorithm: "binary_search_answer", stateShape: "check(x)", keyChallenge: "单调性与边界收缩", mustTest: ["min answer", "max answer", "boundary false/true"] };
  if (module === "dsu") return { coreAlgorithm: "disjoint_set_union", stateShape: "fa[x]", keyChallenge: "集合含义与离散化", mustTest: ["duplicate values", "conflicting relations", "single element"] };
  return { coreAlgorithm: module, stateShape: "module-specific", keyChallenge: errors.join(", ") || "implementation", mustTest: ["small case", "boundary case", "stress case"] };
}

function renderTaskPackMarkdown(pack: JsonObject): string {
  const days = arrayOfObjects(pack.days);
  return [
    "# CSP-S 智能出题任务包 7 天",
    "",
    `生成时间：${getString(pack, "generatedAt")}`,
    "",
    "## 任务比例",
    "",
    "- Select：50%",
    "- 历史错题重做：20%",
    "- Mutate：20%",
    "- Generate：10%",
    "",
    "## 每日任务",
    "",
    ...days.flatMap((day) => [
      `### Day ${getNumber(day, "day")}：${getString(day, "theme")}`,
      "",
      ...arrayOfObjects(day.tasks).map((task) => `- ${getString(task, "taskType")}：${getString(task, "problemPid") || getString(task, "selectionRule") || getString(task, "mutationId") || getString(task, "generatedProblemId")}\n  - 目标：${getString(task, "trainingGoal")}\n  - 验收：${getString(task, "verifyMethod")}`),
      "",
    ]),
  ].join("\n");
}

function difficultyLevel(value: string): number {
  if (value.includes("省选")) return 6;
  if (value.includes("提高+")) return 5;
  if (value.includes("提高")) return 4;
  if (value.includes("普及+")) return 3;
  return 2;
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function uniqueBy<T>(items: T[], picker: (item: T) => string): T[] {
  const seen = new Set<string>();
  const output: T[] = [];
  for (const item of items) {
    const key = picker(item);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function getString(source: unknown, key: string): string {
  const value = getPath(source, key);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getNumber(source: unknown, key: string): number {
  const value = getPath(source, key);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  return 0;
}

function getPath(source: unknown, key: string): unknown {
  if (!key) return source;
  return key.split(".").reduce<unknown>((current, part) => {
    if (!isObject(current)) return undefined;
    return current[part];
  }, source);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
