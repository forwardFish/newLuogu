import { promises as fs } from "fs";
import path from "path";
import { buildDiagnosisSystem } from "../diagnosis/diagnosis-lib";
import {
  type DeepSeekDiagnosisConfig,
  resolveDeepSeekDiagnosisConfig,
} from "../diagnosis/deepseek-diagnosis-client";

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

type GeneratedProblemContent = {
  statementMd: string;
  solutionMd: string;
  bruteForceCpp: string;
  standardSolutionCpp: string;
  generatorCpp: string;
  checkerMd: string;
  testsReadmeMd: string;
  status: string;
  generationSource: string;
};

type GeneratedContentBodyKey = Exclude<keyof GeneratedProblemContent, "status" | "generationSource">;

type ProblemGenerationTrace = {
  generatedProblemId: string;
  status: "SUCCESS" | "PROVIDER_FAILURE" | "SKIPPED";
  providerId: string;
  model: string;
  baseUrl: string;
  latencyMs: number;
  errorMessage?: string;
};

type MutationGenerationTrace = {
  mutationId: string;
  status: "SUCCESS" | "PROVIDER_FAILURE" | "SKIPPED";
  providerId: string;
  model: string;
  baseUrl: string;
  latencyMs: number;
  errorMessage?: string;
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
  const config = problemBankLlmEnabled() ? await resolveDeepSeekDiagnosisConfig() : null;
  ensureProblemBankLlmRequirement(config);
  const traces: MutationGenerationTrace[] = [];
  const specs: JsonObject[] = [];
  for (const [index, weakness] of weaknesses.slice(0, 8).entries()) {
    const module = weakness.relatedModules[0] ?? "implementation";
    const mutationId = `mut_${module}_${String(index + 1).padStart(3, "0")}`;
    const fallbackMutation = buildRuleMutationSpec(weakness, module, index);
    let mutation = fallbackMutation;
    let generationSource = "RULE_FALLBACK";
    let status = "RULE_SPEC_READY_FOR_REVIEW";
    if (config && problemBankLlmCallAllowed(index)) {
      const result = await callMutationSpecLlm({ config, mutationId, module, weakness, fallbackMutation });
      traces.push(result.trace);
      mutation = result.mutation;
      generationSource = result.generationSource;
      status = result.status;
    } else {
      traces.push({
        mutationId,
        status: "SKIPPED",
        providerId: "deepseek",
        model: "",
        baseUrl: "",
        latencyMs: 0,
        errorMessage: config && !problemBankLlmCallAllowed(index)
          ? "PROBLEM_BANK_LLM_LIMIT reached; rule-generated mutation spec was used."
          : problemBankLlmEnabled()
          ? "AI_API_KEY/DEEPSEEK_API_KEY not found; rule-generated mutation spec was used."
          : "PROBLEM_BANK_LLM_ENABLE=false; rule-generated mutation spec was used.",
      });
    }
    specs.push({
      mutationId,
      baseWeaknessId: weakness.weaknessId,
      baseProblemPids: weakness.evidenceProblems.slice(0, 3),
      mutationGoal: mutationGoalFor(module, weakness.relatedErrorTypes),
      targetAbility: targetAbilityForWeakness(weakness),
      module,
      difficulty: difficultyForWeakness(weakness),
      problemArchetype: archetypeFor(module, weakness.relatedErrorTypes),
      newProblemSpec: mutation,
      verifyMethod: weakness.verifyMethod,
      status,
      generationSource,
    });
  }
  const output = { generatedAt: new Date().toISOString(), items: specs };
  await writeJson(path.join(options.problemBankDir, "mutated_problem_specs.json"), output);
  await writeJson(path.join(options.problemBankDir, "mutated_problem_traces.json"), {
    generatedAt: new Date().toISOString(),
    provider: providerTraceSummary(config),
    traces,
  });
  return output;
}

export async function generateDiagnosticProblems(options: ProblemBankOptions): Promise<JsonObject> {
  const weaknesses = await readWeaknesses(options);
  const traces: ProblemGenerationTrace[] = [];
  const config = problemBankLlmEnabled() ? await resolveDeepSeekDiagnosisConfig() : null;
  ensureProblemBankLlmRequirement(config);
  const specs: JsonObject[] = [];
  for (const [index, weakness] of weaknesses.slice(0, 3).entries()) {
    const module = weakness.relatedModules[0] ?? "implementation";
    const problemId = `gen_${module}_${String(index + 1).padStart(3, "0")}`;
    const fallbackContent = buildRuleGeneratedProblemContent(problemId, module, weakness);
    let packageContent = fallbackContent;
    if (config && problemBankLlmCallAllowed(index)) {
      const result = await callProblemPackageLlm({
        config,
        generatedProblemId: problemId,
        module,
        weakness,
        fallbackContent,
      });
      traces.push(result.trace);
      packageContent = result.content;
    } else {
      traces.push({
        generatedProblemId: problemId,
        status: "SKIPPED",
        providerId: "deepseek",
        model: "",
        baseUrl: "",
        latencyMs: 0,
        errorMessage: config && !problemBankLlmCallAllowed(index)
          ? "PROBLEM_BANK_LLM_LIMIT reached; rule-generated package was used."
          : problemBankLlmEnabled()
          ? "AI_API_KEY/DEEPSEEK_API_KEY not found; rule-generated package was used."
          : "PROBLEM_BANK_LLM_ENABLE=false; rule-generated package was used.",
      });
    }
    specs.push({
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
      status: packageContent.status,
      generationSource: packageContent.generationSource,
      packageContent,
    });
  }
  for (const spec of specs) await writeGeneratedProblemPackage(options, spec);
  const output = { generatedAt: new Date().toISOString(), items: specs.map(withoutPackageContent) };
  await writeJson(path.join(options.problemBankDir, "generated_problem_specs.json"), output);
  await writeJson(path.join(options.problemBankDir, "generated_problem_traces.json"), {
    generatedAt: new Date().toISOString(),
    provider: providerTraceSummary(config),
    traces,
  });
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
  const content = normalizeGeneratedContent(isObject(spec.packageContent) ? spec.packageContent : {});
  await fs.writeFile(path.join(dir, "statement.md"), content.statementMd, "utf8");
  await fs.writeFile(path.join(dir, "solution.md"), content.solutionMd, "utf8");
  await fs.writeFile(path.join(dir, "bruteforce.cpp"), content.bruteForceCpp, "utf8");
  await fs.writeFile(path.join(dir, "std.cpp"), content.standardSolutionCpp, "utf8");
  await fs.writeFile(path.join(dir, "generator.cpp"), content.generatorCpp, "utf8");
  await fs.writeFile(path.join(dir, "checker.md"), content.checkerMd, "utf8");
  await writeJson(path.join(dir, "metadata.json"), withoutPackageContent(spec));
  await fs.writeFile(path.join(dir, "tests", "README.md"), content.testsReadmeMd, "utf8");
}

function buildRuleMutationSpec(weakness: Weakness, module: string, index: number): JsonObject {
  const label = moduleToChinese(module);
  const archetype = archetypeFor(module, weakness.relatedErrorTypes);
  return {
    title: `${label} 迁移诊断题 ${index + 1}`,
    storyBrief: `从 ${weakness.evidenceProblems.slice(0, 3).join("、") || "历史薄弱题"} 抽象能力点，改写为新的 ${label} 训练情境。`,
    inputSpec: `第一行给出 n 和若干约束参数；随后给出 ${label} 所需的序列、区间、图关系或查询数据。输入设计必须包含小数据、特殊性质和完整数据三档。`,
    outputSpec: "输出一个可唯一判定的数值或方案摘要；不得要求学生提交开放式证明。",
    constraints: "30 分：n <= 12，可暴力枚举；60 分：满足特殊性质或较小状态空间；100 分：需要完整模型和复杂度优化。",
    requiredSubtasks: ["30 分暴力", "60 分特殊性质或基础模型", "100 分完整做法"],
    coreAlgorithm: getString(archetype, "coreAlgorithm"),
    keyChallenge: getString(archetype, "keyChallenge"),
    mustTest: arrayOfStrings(archetype.mustTest),
    authoringChecklist: [
      "题面语境必须重写，不复制洛谷原题表达。",
      "核心能力点必须保留，但约束或输出目标至少改变一项。",
      "正式使用前必须补齐样例、标准解、暴力、生成器和测试点。",
    ],
  };
}

async function callMutationSpecLlm(params: {
  config: DeepSeekDiagnosisConfig;
  mutationId: string;
  module: string;
  weakness: Weakness;
  fallbackMutation: JsonObject;
}): Promise<{ mutation: JsonObject; trace: MutationGenerationTrace; status: string; generationSource: string }> {
  const startedAt = Date.now();
  const { config, mutationId, module, weakness, fallbackMutation } = params;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), problemPackageRequestTimeoutMs(config));
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: [
              "你是 CSP-S 智能出题教练。请生成同构变式题规格，不要复制洛谷原题题面。",
              "输出必须是严格 JSON 对象，回复的第一个字符必须是 {，最后一个字符必须是 }。",
              "不要 Markdown，不要代码围栏，不要 JSON 外解释。",
              "变式必须改变约束、输出目标、特殊性质或子任务设计中的至少一项，不能只是换背景。",
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                mutationId,
                module,
                weakness,
                requiredSchema: {
                  title: "题目标题",
                  storyBrief: "全新语境，说明如何避免复制原题",
                  inputSpec: "输入格式",
                  outputSpec: "输出格式",
                  constraints: "完整数据范围，含 30/60/100 分",
                  requiredSubtasks: ["30 分暴力", "60 分特殊性质", "100 分完整算法"],
                  coreAlgorithm: "核心算法",
                  keyChallenge: "主要考察点",
                  mustTest: ["必须覆盖的测试点"],
                  authoringChecklist: ["正式落题前需要核对的事项"],
                },
              },
              null,
              2,
            ),
          },
        ],
        temperature: config.temperature,
        max_tokens: Math.max(config.maxTokens, 4096),
        response_format: { type: "json_object" },
      }),
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Mutation LLM call failed: ${response.status} ${text.slice(0, 300)}`);
    }
    const json = (await response.json()) as JsonObject;
    const content = getString(json, "choices.0.message.content") || getString(json, "choices.0.message.reasoning_content");
    const parsed = extractJsonObject(content, "Mutation LLM response");
    return {
      mutation: normalizeMutationSpec(parsed, fallbackMutation),
      status: "LLM_SPEC_READY_FOR_REVIEW",
      generationSource: "LLM",
      trace: {
        mutationId,
        status: "SUCCESS",
        providerId: config.providerId,
        model: config.model,
        baseUrl: config.baseUrl,
        latencyMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    if (config.requireReal || problemBankRequireReal()) throw error;
    return {
      mutation: fallbackMutation,
      status: "RULE_SPEC_READY_FOR_REVIEW",
      generationSource: "RULE_FALLBACK",
      trace: {
        mutationId,
        status: "PROVIDER_FAILURE",
        providerId: config.providerId,
        model: config.model,
        baseUrl: config.baseUrl,
        latencyMs: Date.now() - startedAt,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function normalizeMutationSpec(parsed: JsonObject, fallback: JsonObject): JsonObject {
  return {
    title: getString(parsed, "title") || getString(fallback, "title"),
    storyBrief: getString(parsed, "storyBrief") || getString(fallback, "storyBrief"),
    inputSpec: getString(parsed, "inputSpec") || getString(fallback, "inputSpec"),
    outputSpec: getString(parsed, "outputSpec") || getString(fallback, "outputSpec"),
    constraints: getString(parsed, "constraints") || getString(fallback, "constraints"),
    requiredSubtasks: arrayOfStrings(parsed.requiredSubtasks).length
      ? arrayOfStrings(parsed.requiredSubtasks)
      : arrayOfStrings(fallback.requiredSubtasks),
    coreAlgorithm: getString(parsed, "coreAlgorithm") || getString(fallback, "coreAlgorithm"),
    keyChallenge: getString(parsed, "keyChallenge") || getString(fallback, "keyChallenge"),
    mustTest: arrayOfStrings(parsed.mustTest).length ? arrayOfStrings(parsed.mustTest) : arrayOfStrings(fallback.mustTest),
    authoringChecklist: arrayOfStrings(parsed.authoringChecklist).length
      ? arrayOfStrings(parsed.authoringChecklist)
      : arrayOfStrings(fallback.authoringChecklist),
  };
}

function buildRuleGeneratedProblemContent(problemId: string, module: string, weakness: Weakness): GeneratedProblemContent {
  if (module === "interval_dp") return buildIntervalDpPackage(problemId, weakness);
  return buildSegmentCountingPackage(problemId, module, weakness);
}

function buildIntervalDpPackage(problemId: string, weakness: Weakness): GeneratedProblemContent {
  const title = "能量石合并校准";
  const statementMd = [
    `# ${title}`,
    "",
    "状态：RULE_GENERATED_NEEDS_REVIEW",
    "",
    `对应薄弱点：${weakness.title}`,
    "",
    "有 n 块能量石排成一行，第 i 块能量石的能量为 a_i。每次可以选择相邻的两段已经合并好的连续区间，将它们合并成一段；本次代价为新区间内所有能量石能量之和。请计算把所有能量石合并成一段的最小总代价。",
    "",
    "这道题用于诊断区间 DP 的状态定义、初始化和区间长度枚举顺序。写代码前必须先写出 dp[l][r] 的含义和 len 枚举范围。",
    "",
    "## 输入格式",
    "",
    "第一行一个整数 n。第二行 n 个正整数 a_i。",
    "",
    "## 输出格式",
    "",
    "输出一个整数，表示最小总代价。",
    "",
    "## 样例",
    "",
    "```text",
    "4",
    "4 1 3 2",
    "```",
    "",
    "```text",
    "20",
    "```",
    "",
    "## 数据范围",
    "",
    "- 30 分：1 <= n <= 8",
    "- 60 分：1 <= n <= 80",
    "- 100 分：1 <= n <= 300，1 <= a_i <= 10^6",
    "",
    "## 验收标准",
    "",
    "- 能写出暴力区间递归或记忆化搜索。",
    "- 能独立说明 dp[l][r]、初始化、转移和 len 枚举顺序。",
    "- 同类题提交次数 <= 2。",
  ].join("\n");
  const solutionMd = [
    `# ${title} 解法`,
    "",
    "设 prefix[i] 为前缀和，sum(l,r)=prefix[r]-prefix[l-1]。",
    "",
    "状态：dp[l][r] 表示把区间 [l,r] 合并成一段的最小总代价。",
    "",
    "初始化：dp[i][i]=0。",
    "",
    "转移：枚举最后一次合并断点 k，dp[l][r]=min(dp[l][k]+dp[k+1][r]+sum(l,r))。",
    "",
    "枚举顺序：按 len 从 2 到 n 枚举，再枚举 l 和 r。",
    "",
    "复杂度：O(n^3)，空间 O(n^2)。",
    "",
    "暴力解法可以对区间递归枚举最后合并断点，用记忆化后与标准做法一致；不加记忆化只适合 30 分小数据。",
  ].join("\n");
  return {
    statementMd,
    solutionMd,
    bruteForceCpp: intervalDpBruteforceCpp(),
    standardSolutionCpp: intervalDpStandardCpp(),
    generatorCpp: numericArrayGeneratorCpp(),
    checkerMd: checkerDesign("单个整数答案，使用标准 checker 比较完全一致即可。"),
    testsReadmeMd: testsReadme(problemId, "包含 n=1、n=2、递增序列、全相等、随机小数据对拍、n=300 压力数据。"),
    status: "RULE_GENERATED_NEEDS_REVIEW",
    generationSource: "RULE_FALLBACK",
  };
}

function buildSegmentCountingPackage(problemId: string, module: string, weakness: Weakness): GeneratedProblemContent {
  const label = moduleToChinese(module);
  const title = `${label}余数分组诊断`;
  const statementMd = [
    `# ${title}`,
    "",
    "状态：RULE_GENERATED_NEEDS_REVIEW",
    "",
    `对应薄弱点：${weakness.title}`,
    "",
    "给定一个长度为 n 的正整数序列 a 和一个正整数 m。你需要统计有多少个连续子段的元素和可以被 m 整除。",
    "",
    "这道题用于训练从暴力枚举到前缀和余数计数的迁移。若把它作为 T3 部分分训练，必须先写出 30/60/100 分方案。",
    "",
    "## 输入格式",
    "",
    "第一行两个整数 n,m。第二行 n 个正整数 a_i。",
    "",
    "## 输出格式",
    "",
    "输出一个整数，表示满足条件的连续子段数量。",
    "",
    "## 样例",
    "",
    "```text",
    "5 3",
    "1 2 3 4 5",
    "```",
    "",
    "```text",
    "7",
    "```",
    "",
    "## 数据范围",
    "",
    "- 30 分：1 <= n <= 200",
    "- 60 分：1 <= n <= 5000",
    "- 100 分：1 <= n <= 200000，1 <= m <= 200000，1 <= a_i <= 10^9",
    "",
    "## 验收标准",
    "",
    "- 能写出 O(n^2) 暴力并说明为什么只能拿小数据。",
    "- 能写出前缀和余数计数的 O(n) 做法。",
    "- 能说明为什么相同前缀余数可以组成合法子段。",
  ].join("\n");
  const solutionMd = [
    `# ${title} 解法`,
    "",
    "设 s_i 为前 i 个数的和。子段 [l,r] 的和为 s_r-s_{l-1}。",
    "",
    "若 (s_r-s_{l-1}) mod m = 0，则 s_r mod m = s_{l-1} mod m。",
    "",
    "从左到右扫描前缀和余数，统计之前出现过多少个相同余数。初始余数 0 出现一次。",
    "",
    "复杂度 O(n)，空间 O(m)。答案可能达到 O(n^2)，需要 long long。",
  ].join("\n");
  return {
    statementMd,
    solutionMd,
    bruteForceCpp: segmentCountingBruteforceCpp(),
    standardSolutionCpp: segmentCountingStandardCpp(),
    generatorCpp: segmentCountingGeneratorCpp(),
    checkerMd: checkerDesign("单个整数答案，使用标准 checker 比较完全一致即可。"),
    testsReadmeMd: testsReadme(problemId, "包含 n=1、m=1、无合法子段、全合法子段、随机小数据对拍、n=200000 压力数据。"),
    status: "RULE_GENERATED_NEEDS_REVIEW",
    generationSource: "RULE_FALLBACK",
  };
}

async function callProblemPackageLlm(params: {
  config: DeepSeekDiagnosisConfig;
  generatedProblemId: string;
  module: string;
  weakness: Weakness;
  fallbackContent: GeneratedProblemContent;
}): Promise<{ content: GeneratedProblemContent; trace: ProblemGenerationTrace }> {
  const startedAt = Date.now();
  const { config, generatedProblemId, module, weakness, fallbackContent } = params;
  try {
    const controller = new AbortController();
    const requestTimeoutMs = problemPackageRequestTimeoutMs(config);
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: [
              "你是 CSP-S 智能出题教练。请生成原创诊断题包，不能复制洛谷原题题面。",
              "输出必须是严格 JSON 对象，回复的第一个字符必须是 {，最后一个字符必须是 }。",
              "不要 Markdown，不要代码围栏，不要 JSON 外解释。",
              "题包必须包含题面、解法、暴力 C++、标准 C++、生成器 C++、checker 说明和测试点设计。",
              "不要输出空代码；如果题无法保证可测，必须把 status 设为 DRAFT_NOT_FOR_FORMAL_TEST。",
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                generatedProblemId,
                module,
                weakness,
                requiredSchema: {
                  statementMd: "完整题面 Markdown，含输入输出、样例、数据范围、验收标准",
                  solutionMd: "完整解法说明",
                  bruteForceCpp: "可编译暴力 C++17",
                  standardSolutionCpp: "可编译标准 C++17",
                  generatorCpp: "可编译随机数据生成器 C++17",
                  checkerMd: "checker 或对拍设计",
                  testsReadmeMd: "测试点设计",
                  status: "LLM_GENERATED_NEEDS_REVIEW 或 DRAFT_NOT_FOR_FORMAL_TEST",
                },
              },
              null,
              2,
            ),
          },
        ],
        temperature: config.temperature,
        max_tokens: problemPackageMaxTokens(config),
        response_format: { type: "json_object" },
      }),
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Problem package LLM call failed: ${response.status} ${text.slice(0, 300)}`);
    }
    const json = (await response.json()) as JsonObject;
    const responseContent = getString(json, "choices.0.message.content") || getString(json, "choices.0.message.reasoning_content");
    let content: JsonObject;
    try {
      content = unwrapGeneratedPackageContent(extractJsonObject(responseContent, "Problem package LLM response"));
      if (!hasGeneratedPackageFields(content)) {
        content = await callProblemPackageRepairLlm({ config, generatedProblemId, module, weakness });
      }
    } catch (error) {
      content = await callProblemPackageRepairLlm({
        config,
        generatedProblemId,
        module,
        weakness,
        previousError: error instanceof Error ? error.message : String(error),
      });
    }
    assertGeneratedPackageFields(content, "Problem package LLM response");
    return {
      content: normalizeGeneratedContent({
        ...content,
        generationSource: "LLM",
        status: getString(content, "status") || "LLM_GENERATED_NEEDS_REVIEW",
      }, fallbackContent),
      trace: {
        generatedProblemId,
        status: "SUCCESS",
        providerId: config.providerId,
        model: config.model,
        baseUrl: config.baseUrl,
        latencyMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    if (config.requireReal || problemBankRequireReal()) throw error;
    return {
      content: fallbackContent,
      trace: {
        generatedProblemId,
        status: "PROVIDER_FAILURE",
        providerId: config.providerId,
        model: config.model,
        baseUrl: config.baseUrl,
        latencyMs: Date.now() - startedAt,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function callProblemPackageRepairLlm(params: {
  config: DeepSeekDiagnosisConfig;
  generatedProblemId: string;
  module: string;
  weakness: Weakness;
  previousError?: string;
}): Promise<JsonObject> {
  const { config, generatedProblemId, module, weakness, previousError } = params;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), problemPackageRequestTimeoutMs(config));
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content: [
            "You are a CSP-S problem authoring engine.",
            "Generate one original Chinese programming problem package.",
            "Return only one strict JSON object.",
            "The root object must contain exactly these usable fields: statementMd, solutionMd, bruteForceCpp, standardSolutionCpp, generatorCpp, checkerMd, testsReadmeMd, status.",
            "Do not echo the request. Do not wrap the answer in packageContent, problemPackage, content, or output.",
            "All C++ fields must contain complete C++17 source code.",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              generatedProblemId,
              module,
              weaknessSummary: {
                weaknessId: weakness.weaknessId,
                title: weakness.title,
                relatedModules: weakness.relatedModules,
                relatedErrorTypes: weakness.relatedErrorTypes,
                evidenceProblems: weakness.evidenceProblems.slice(0, 3),
                trainingAction: weakness.trainingAction,
                verifyMethod: weakness.verifyMethod,
              },
              previousError: previousError?.slice(0, 500),
            },
            null,
            2,
          ),
        },
      ],
      temperature: config.temperature,
      max_tokens: problemPackageMaxTokens(config),
      response_format: { type: "json_object" },
    }),
  }).finally(() => clearTimeout(timeout));
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Problem package repair LLM call failed: ${response.status} ${text.slice(0, 300)}`);
  }
  const json = (await response.json()) as JsonObject;
  const responseContent = getString(json, "choices.0.message.content") || getString(json, "choices.0.message.reasoning_content");
  return unwrapGeneratedPackageContent(extractJsonObject(responseContent, "Problem package repair LLM response"));
}

function problemBankLlmEnabled(): boolean {
  return !["0", "false", "no", "off"].includes(String(process.env.PROBLEM_BANK_LLM_ENABLE ?? "true").trim().toLowerCase());
}

function problemBankRequireReal(): boolean {
  return ["1", "true", "yes", "on"].includes(String(process.env.PROBLEM_BANK_LLM_REQUIRE_REAL ?? "").trim().toLowerCase());
}

function problemBankLlmCallAllowed(index: number): boolean {
  const limit = Number(process.env.PROBLEM_BANK_LLM_LIMIT ?? 0);
  if (!Number.isFinite(limit) || limit <= 0) return true;
  return index < Math.floor(limit);
}

function ensureProblemBankLlmRequirement(config: DeepSeekDiagnosisConfig | null): void {
  if (problemBankRequireReal() && !config) {
    throw new Error("PROBLEM_BANK_LLM_REQUIRE_REAL=true but AI_API_KEY/DEEPSEEK_API_KEY was not found.");
  }
}

function providerTraceSummary(config: DeepSeekDiagnosisConfig | null): JsonObject {
  return config
    ? {
        providerId: config.providerId,
        providerLabel: config.providerLabel,
        baseUrl: config.baseUrl,
        model: config.model,
        keyPresent: true,
        envSources: config.envSources,
      }
    : {
        providerId: "deepseek",
        keyPresent: false,
      };
}

function problemPackageRequestTimeoutMs(config: DeepSeekDiagnosisConfig): number {
  const raw = Number(process.env.PROBLEM_BANK_LLM_TIMEOUT_MS ?? 45_000);
  const configured = Number.isFinite(raw) && raw > 0 ? raw : 45_000;
  return Math.min(config.requestTimeoutMs, configured);
}

function problemPackageMaxTokens(config: DeepSeekDiagnosisConfig): number {
  const raw = Number(process.env.PROBLEM_BANK_LLM_MAX_TOKENS ?? 12_000);
  const configured = Number.isFinite(raw) && raw > 0 ? raw : 12_000;
  return Math.max(config.maxTokens, configured);
}

const GENERATED_CONTENT_FIELD_KEYS: Record<GeneratedContentBodyKey, string[]> = {
  statementMd: ["statementMd", "statementMarkdown", "statement", "problemStatement", "problemStatementMd"],
  solutionMd: ["solutionMd", "solutionMarkdown", "solution", "editorial", "editorialMd"],
  bruteForceCpp: ["bruteForceCpp", "bruteforceCpp", "bruteForce", "bruteforce", "bruteCpp"],
  standardSolutionCpp: ["standardSolutionCpp", "standardCpp", "stdCpp", "standardSolution", "solutionCpp"],
  generatorCpp: ["generatorCpp", "dataGeneratorCpp", "generator", "testGeneratorCpp"],
  checkerMd: ["checkerMd", "checkerMarkdown", "checker", "checkerDesign"],
  testsReadmeMd: ["testsReadmeMd", "testsReadme", "testsMarkdown", "testPlan", "tests"],
};

function unwrapGeneratedPackageContent(value: JsonObject): JsonObject {
  for (const key of ["packageContent", "problemPackage", "generatedProblem", "problem", "content", "output"]) {
    const nested = getPath(value, key);
    if (isObject(nested)) return nested;
  }
  return value;
}

function normalizeGeneratedContent(value: JsonObject, fallbackContent?: GeneratedProblemContent): GeneratedProblemContent {
  const fallback = fallbackContent ?? buildSegmentCountingPackage("fallback_problem", "implementation", {
    weaknessId: "fallback",
    title: "实现稳定性训练",
    severity: 50,
    relatedModules: ["implementation"],
    relatedErrorTypes: [],
    evidenceProblems: [],
    problemCount: 0,
    trainingAction: "完成基础实现训练。",
    verifyMethod: "提交次数 <= 2。",
    clusterId: "fallback",
  });
  const generationSource = firstString(value, ["generationSource", "source"]) || fallback.generationSource;
  return {
    statementMd: firstString(value, GENERATED_CONTENT_FIELD_KEYS.statementMd) || fallback.statementMd,
    solutionMd: firstString(value, GENERATED_CONTENT_FIELD_KEYS.solutionMd) || fallback.solutionMd,
    bruteForceCpp: firstString(value, GENERATED_CONTENT_FIELD_KEYS.bruteForceCpp) || fallback.bruteForceCpp,
    standardSolutionCpp: firstString(value, GENERATED_CONTENT_FIELD_KEYS.standardSolutionCpp) || fallback.standardSolutionCpp,
    generatorCpp: firstString(value, GENERATED_CONTENT_FIELD_KEYS.generatorCpp) || fallback.generatorCpp,
    checkerMd: firstString(value, GENERATED_CONTENT_FIELD_KEYS.checkerMd) || fallback.checkerMd,
    testsReadmeMd: firstString(value, GENERATED_CONTENT_FIELD_KEYS.testsReadmeMd) || fallback.testsReadmeMd,
    status: normalizeGeneratedStatus(firstString(value, ["status", "reviewStatus"]), fallback.status, generationSource),
    generationSource,
  };
}

function normalizeGeneratedStatus(value: string, fallback: string, generationSource: string): string {
  const normalized = value.trim().toUpperCase();
  if (!normalized && generationSource === "LLM") return "LLM_GENERATED_NEEDS_REVIEW";
  if (!normalized) return fallback;
  if (["LLM_GENERATED_NEEDS_REVIEW", "DRAFT_NOT_FOR_FORMAL_TEST", "RULE_GENERATED_NEEDS_REVIEW"].includes(normalized)) return normalized;
  if (["DRAFT", "OK", "COMPLETED", "COMPLETE", "READY", "REVIEW"].includes(normalized)) return "LLM_GENERATED_NEEDS_REVIEW";
  return fallback;
}

function assertGeneratedPackageFields(value: JsonObject, label: string): void {
  const missing = (Object.entries(GENERATED_CONTENT_FIELD_KEYS) as Array<[GeneratedContentBodyKey, string[]]>)
    .filter(([, keys]) => !firstString(value, keys).trim())
    .map(([field]) => field);
  if (missing.length > 0) {
    throw new Error(`${label} missing required generated package fields: ${missing.join(", ")}. Top-level keys: ${Object.keys(value).slice(0, 20).join(", ") || "<none>"}`);
  }
}

function hasGeneratedPackageFields(value: JsonObject): boolean {
  return (Object.entries(GENERATED_CONTENT_FIELD_KEYS) as Array<[GeneratedContentBodyKey, string[]]>)
    .every(([, keys]) => Boolean(firstString(value, keys).trim()));
}

function firstString(source: unknown, keys: string[]): string {
  for (const key of keys) {
    const value = getString(source, key).trim();
    if (value) return value;
  }
  return "";
}

function withoutPackageContent(spec: JsonObject): JsonObject {
  const { packageContent: _packageContent, ...rest } = spec;
  return rest;
}

function extractJsonObject(content: string, label = "LLM response"): JsonObject {
  const cleaned = String(content || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = parseFirstJsonObject(cleaned);
  if (parsed) return parsed;
  throw new Error(`${label} did not contain a valid JSON object. Preview: ${cleaned.slice(0, 240) || "<empty>"}`);
}

function parseFirstJsonObject(text: string): JsonObject | null {
  const starts = [...text.matchAll(/\{/g)].map((match) => match.index ?? -1).filter((index) => index >= 0);
  const ends = [...text.matchAll(/\}/g)].map((match) => match.index ?? -1).filter((index) => index >= 0).reverse();
  for (const start of starts) {
    for (const end of ends) {
      if (end <= start) continue;
      const parsed = tryParseJsonObject(text.slice(start, end + 1));
      if (parsed) return parsed;
    }
  }
  return null;
}

function tryParseJsonObject(raw: string): JsonObject | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isObject(parsed) ? parsed : null;
  } catch {
    try {
      const parsed = JSON.parse(raw.replace(/\\(?!["\\/bfnrtu])/g, "\\\\")) as unknown;
      return isObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

function checkerDesign(note: string): string {
  return ["# Checker 设计", "", note, "", "正式使用前建议用 bruteforce.cpp 与 std.cpp 对拍 1000 组随机小数据。"].join("\n");
}

function testsReadme(problemId: string, note: string): string {
  return [
    `# ${problemId} 测试点设计`,
    "",
    note,
    "",
    "当前目录记录测试点设计；正式评测数据需要用 generator.cpp 生成并用 brute/std 对拍确认。",
  ].join("\n");
}

function intervalDpStandardCpp(): string {
  return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n + 1), pref(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        pref[i] = pref[i - 1] + a[i];
    }
    const long long INF = (1LL << 62);
    vector<vector<long long>> dp(n + 2, vector<long long>(n + 2, 0));
    for (int len = 2; len <= n; ++len) {
        for (int l = 1; l + len - 1 <= n; ++l) {
            int r = l + len - 1;
            dp[l][r] = INF;
            long long sum = pref[r] - pref[l - 1];
            for (int k = l; k < r; ++k) {
                dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r] + sum);
            }
        }
    }
    cout << dp[1][n] << '\\n';
    return 0;
}
`;
}

function intervalDpBruteforceCpp(): string {
  return `#include <bits/stdc++.h>
using namespace std;

vector<long long> pref;
map<pair<int,int>, long long> memo;

long long solve(int l, int r) {
    if (l == r) return 0;
    auto key = make_pair(l, r);
    if (memo.count(key)) return memo[key];
    long long sum = pref[r] - pref[l - 1];
    long long best = (1LL << 62);
    for (int k = l; k < r; ++k) {
        best = min(best, solve(l, k) + solve(k + 1, r) + sum);
    }
    return memo[key] = best;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n + 1);
    pref.assign(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        pref[i] = pref[i - 1] + a[i];
    }
    cout << solve(1, n) << '\\n';
    return 0;
}
`;
}

function segmentCountingStandardCpp(): string {
  return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long m;
    if (!(cin >> n >> m)) return 0;
    vector<long long> cnt(m, 0);
    cnt[0] = 1;
    long long pref = 0;
    long long ans = 0;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        pref = (pref + x) % m;
        ans += cnt[pref];
        cnt[pref]++;
    }
    cout << ans << '\\n';
    return 0;
}
`;
}

function segmentCountingBruteforceCpp(): string {
  return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long m;
    if (!(cin >> n >> m)) return 0;
    vector<long long> a(n);
    for (long long &x : a) cin >> x;
    long long ans = 0;
    for (int l = 0; l < n; ++l) {
        long long sum = 0;
        for (int r = l; r < n; ++r) {
            sum += a[r];
            if (sum % m == 0) ans++;
        }
    }
    cout << ans << '\\n';
    return 0;
}
`;
}

function numericArrayGeneratorCpp(): string {
  return `#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    long long seed = argc > 1 ? atoll(argv[1]) : chrono::steady_clock::now().time_since_epoch().count();
    mt19937_64 rng(seed);
    int n = argc > 2 ? atoi(argv[2]) : 20;
    int mode = argc > 3 ? atoi(argv[3]) : 0;
    if (mode == 1) {
        long long m = argc > 4 ? atoll(argv[4]) : 7;
        cout << n << ' ' << m << '\\n';
    } else {
        cout << n << '\\n';
    }
    for (int i = 1; i <= n; ++i) {
        if (i > 1) cout << ' ';
        cout << (long long)(rng() % 100 + 1);
    }
    cout << '\\n';
    return 0;
}
`;
}

function segmentCountingGeneratorCpp(): string {
  return `#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    long long seed = argc > 1 ? atoll(argv[1]) : chrono::steady_clock::now().time_since_epoch().count();
    mt19937_64 rng(seed);
    int n = argc > 2 ? atoi(argv[2]) : 20;
    long long m = argc > 3 ? atoll(argv[3]) : 7;
    cout << n << ' ' << m << '\\n';
    for (int i = 1; i <= n; ++i) {
        if (i > 1) cout << ' ';
        cout << (long long)(rng() % 100 + 1);
    }
    cout << '\\n';
    return 0;
}
`;
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
    if (/^\d+$/.test(part) && Array.isArray(current)) return current[Number(part)];
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
