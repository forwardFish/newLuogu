import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;

type CliOptions = {
  input: string;
  output: string;
};

type DifficultyInfo = {
  level: number | null;
  name: string;
  band: "UNKNOWN" | "BEGINNER" | "CSP_J" | "CSP_S" | "PROVINCIAL_SELECTION" | "NOI_PLUS";
};

type CatalogItem = {
  pid: string;
  title: string;
  url: string;
  difficulty: DifficultyInfo;
  rawLuoguTags: string[];
  luoguTagIds: number[];
  originalTags: string[];
  stats: {
    totalSubmit: number | null;
    accepted: number | null;
    passRate: number | null;
  };
};

type ModuleBucket = "implementation" | "search" | "dp" | "graph" | "dataStructure" | "math" | "string" | "algorithm" | "other";

type ModuleRule = {
  id: string;
  name: string;
  bucket: ModuleBucket;
  priority: number;
  patterns: RegExp[];
  abilityTags: string[];
  scoreFocus: string[];
  preCheck: string[];
  postCheck: string[];
  baseMinutes: number;
};

type DailyProblem = {
  pid: string;
  title: string;
  url: string;
  difficulty: DifficultyInfo;
  rawLuoguTags: string[];
  luoguTagIds: number[];
  originalTags: string[];
  classification: {
    targetTrack: "CSP_J" | "CSP_S" | "MIXED" | "ADVANCED";
    stage: "FOUNDATION" | "CSP_J_CORE" | "CSP_S_CORE" | "ADVANCED" | "REVIEW_ONLY";
    primaryModule: {
      id: string;
      name: string;
      bucket: ModuleBucket;
    };
    secondaryModules: string[];
    abilityTags: string[];
    contestTags: string[];
    yearTags: string[];
    cautionTags: string[];
  };
  dailyTraining: {
    recommendedUse: "WARMUP" | "NEW_LESSON" | "DAILY_DRILL" | "WEAKNESS_REPAIR" | "CONTEST_REVIEW" | "MOCK_SECTION" | "REVIEW_ONLY";
    recommendedMinutes: number;
    repeatGapDays: number[];
    trainingRoles: string[];
    scoreFocus: string[];
    preCheck: string[];
    postCheck: string[];
    selectionScore: {
      cspJ: number;
      cspS: number;
      daily: number;
    };
  };
  stats: CatalogItem["stats"];
  source: "luogu_problem_list";
  lastUpdatedAt: string;
};

const DEFAULT_INPUT = path.join(process.cwd(), "data", "problem-bank", "luogu_problem_catalog.json");
const DEFAULT_OUTPUT = path.join(process.cwd(), "data", "problem-bank", "luogu_daily_training_bank.json");

const DIFFICULTY_NAME: Record<number, string> = {
  0: "暂无评定",
  1: "入门",
  2: "普及−",
  3: "普及/提高−",
  4: "普及+/提高",
  5: "提高+/省选−",
  6: "省选/NOI−",
  7: "NOI/NOI+/CTSC",
};

const MODULE_RULES: ModuleRule[] = [
  {
    id: "dp_state_compression",
    name: "状态压缩 DP",
    bucket: "dp",
    priority: 130,
    patterns: [/状压|状态压缩|DP_STATE_COMPRESSION/i],
    abilityTags: ["BITMASK_STATE", "STATE_TRANSFER", "COMPLEXITY_ESTIMATION"],
    scoreFocus: ["状态是否合法", "位运算含义", "复杂度是否可过"],
    preCheck: ["先定义每一位代表什么", "预处理合法状态", "估算状态数量"],
    postCheck: ["检查位运算优先级", "检查状态转移是否重复", "检查初末状态"],
    baseMinutes: 75,
  },
  {
    id: "dp_interval",
    name: "区间 DP",
    bucket: "dp",
    priority: 125,
    patterns: [/区间\s*DP|DP_INTERVAL/i],
    abilityTags: ["INTERVAL_MODELING", "ENUMERATE_BREAKPOINT", "ORDER_BY_LENGTH"],
    scoreFocus: ["区间长度顺序", "断点枚举范围", "合并代价是否重复计算"],
    preCheck: ["先确定区间端点含义", "按长度递增设计循环", "列出 k 的枚举范围"],
    postCheck: ["检查 len=1/2 的初值", "检查左右端点是否越界", "检查答案区间"],
    baseMinutes: 60,
  },
  {
    id: "dp_knapsack",
    name: "背包 DP",
    bucket: "dp",
    priority: 120,
    patterns: [/背包|DP_KNAPSACK/i],
    abilityTags: ["STATE_DESIGN", "LOOP_ORDER", "CAPACITY_MODELING"],
    scoreFocus: ["容量维度是否正确", "01/完全/多重背包是否区分", "循环方向是否正确"],
    preCheck: ["判断物品是否只能选一次", "确认体积和价值含义", "先写朴素状态再优化"],
    postCheck: ["检查 j 的循环方向", "检查不可达状态", "确认输出最大值还是方案数"],
    baseMinutes: 50,
  },
  {
    id: "dp_foundation",
    name: "动态规划基础",
    bucket: "dp",
    priority: 110,
    patterns: [/动态规划|\bDP\b|ALGO_DP|线性\s*DP|递推|记忆化搜索/i],
    abilityTags: ["STATE_DESIGN", "TRANSITION_REASONING", "BOUNDARY_INITIALIZATION"],
    scoreFocus: ["状态定义是否清楚", "转移方程是否能解释", "初始化和边界是否漏掉"],
    preCheck: ["先写状态含义", "先列小样例表格", "确认答案取哪个状态"],
    postCheck: ["检查数组初值", "检查循环顺序", "用样例手推一遍转移"],
    baseMinutes: 45,
  },
  {
    id: "data_structure_advanced",
    name: "进阶数据结构",
    bucket: "dataStructure",
    priority: 108,
    patterns: [/线段树|树状数组|并查集|树链剖分|离散化|DS_SEGMENT_TREE|DS_FENWICK|DS_DISJOINT_SET|HEAVY_LIGHT/i],
    abilityTags: ["DATA_STRUCTURE_MODELING", "RANGE_OPERATION", "COMPLEXITY_OPTIMIZATION"],
    scoreFocus: ["维护信息", "查询/修改边界", "复杂度优化"],
    preCheck: ["先写维护什么值", "确认单点还是区间操作", "确认是否要离散化"],
    postCheck: ["检查 build/update/query 边界", "检查 lazy 标记下传", "检查合并函数"],
    baseMinutes: 65,
  },
  {
    id: "graph_basic",
    name: "图论基础",
    bucket: "graph",
    priority: 100,
    patterns: [/图论|最短路|拓扑排序|Floyd|Dijkstra|SPFA|Tarjan|网络流|费用流|最大流|GRAPH|SHORTEST_PATH|TOPOLOGICAL/i],
    abilityTags: ["GRAPH_MODELING", "EDGE_DIRECTION", "PATH_OR_ORDER_REASONING"],
    scoreFocus: ["建图方式", "边方向/边权", "算法适用条件"],
    preCheck: ["先画点和边", "确认有向还是无向", "确认边权是否非负"],
    postCheck: ["检查数组初始化", "检查重边/自环", "检查不可达输出"],
    baseMinutes: 60,
  },
  {
    id: "search_dfs_bfs",
    name: "搜索 DFS/BFS",
    bucket: "search",
    priority: 95,
    patterns: [/搜索|DFS|BFS|深度优先|广度优先|剪枝|ALGO_SEARCH|SEARCH_DFS|SEARCH_BFS/i],
    abilityTags: ["STATE_REPRESENTATION", "VISITED_CONTROL", "PRUNING_OR_LAYERING"],
    scoreFocus: ["搜索状态是否完整", "去重是否正确", "剪枝是否安全"],
    preCheck: ["写清楚状态包含哪些变量", "确认终止条件", "判断 DFS 还是 BFS"],
    postCheck: ["检查 vis 标记时机", "检查回溯恢复", "检查最短路场景是否必须 BFS"],
    baseMinutes: 45,
  },
  {
    id: "binary_search",
    name: "二分答案/二分查找",
    bucket: "algorithm",
    priority: 88,
    patterns: [/二分|ALGO_BINARY_SEARCH/i],
    abilityTags: ["MONOTONICITY_PROOF", "CHECK_FUNCTION", "BOUNDARY_CONTROL"],
    scoreFocus: ["单调性", "check 函数", "左右边界"],
    preCheck: ["先证明答案具有单调性", "写 check 输入输出含义", "确定找最大可行还是最小可行"],
    postCheck: ["检查 mid 计算", "检查 l/r 更新", "用极端答案测试"],
    baseMinutes: 40,
  },
  {
    id: "greedy_sorting",
    name: "贪心与排序策略",
    bucket: "algorithm",
    priority: 84,
    patterns: [/贪心|排序|反悔贪心|GREEDY|ALGO_SORTING/i],
    abilityTags: ["GREEDY_CHOICE", "SORTING_KEY", "COUNTEREXAMPLE_CHECK"],
    scoreFocus: ["排序关键字", "局部最优理由", "反例检查"],
    preCheck: ["先写贪心规则", "尝试构造反例", "确认是否需要排序或堆"],
    postCheck: ["检查相等情况", "检查边界样例", "重新解释为什么不会后悔"],
    baseMinutes: 35,
  },
  {
    id: "math_number_theory",
    name: "数学与数论",
    bucket: "math",
    priority: 80,
    patterns: [/数学|gcd|最大公约数|质数|素数|逆元|组合数学|Catalan|进制|高精度|MATH_/i],
    abilityTags: ["FORMULA_DERIVATION", "NUMBER_PROPERTY", "OVERFLOW_CONTROL"],
    scoreFocus: ["公式推导", "整数性质", "溢出和取模"],
    preCheck: ["先写数学关系式", "确认是否需要 long long/高精度", "确认取模规则"],
    postCheck: ["检查除法是否整除", "检查 0/1 特例", "检查乘法溢出"],
    baseMinutes: 40,
  },
  {
    id: "data_structure_basic",
    name: "基础数据结构",
    bucket: "dataStructure",
    priority: 78,
    patterns: [/栈|队列|堆|优先队列|单调栈|单调队列|STL|DS_STACK|DS_QUEUE|DS_HEAP|MONOTONIC/i],
    abilityTags: ["DATA_STRUCTURE_SELECTION", "INVARIANT_MAINTENANCE", "OPERATION_ORDER"],
    scoreFocus: ["结构选择", "入队出队/入栈出栈时机", "维护的不变量"],
    preCheck: ["说明为什么用这个结构", "写清每次操作后维护什么", "确认空结构情况"],
    postCheck: ["检查 push/pop 顺序", "检查队空/栈空", "检查相等元素处理"],
    baseMinutes: 40,
  },
  {
    id: "prefix_difference",
    name: "前缀和/差分",
    bucket: "algorithm",
    priority: 75,
    patterns: [/前缀和|差分|ALGO_PREFIX_SUM|ALGO_DIFFERENCE/i],
    abilityTags: ["RANGE_MODELING", "OFF_BY_ONE_CHECK", "ACCUMULATION"],
    scoreFocus: ["下标边界", "区间转化", "前缀/差分还原"],
    preCheck: ["统一下标从 0 还是 1 开始", "写出区间公式", "确认是否需要二维"],
    postCheck: ["检查 l=1 的情况", "检查 r=n 的情况", "手算一个小区间"],
    baseMinutes: 30,
  },
  {
    id: "string_processing",
    name: "字符串处理",
    bucket: "string",
    priority: 72,
    patterns: [/字符串|KMP|字典树|哈希|TOPIC_STRING/i],
    abilityTags: ["STRING_STATE", "INDEX_CONTROL", "MATCHING_LOGIC"],
    scoreFocus: ["字符下标", "匹配规则", "边界空串/单字符"],
    preCheck: ["确认下标从 0 还是 1", "写清匹配条件", "准备特殊字符串样例"],
    postCheck: ["检查首尾字符", "检查重复字符", "检查大小写/空格处理"],
    baseMinutes: 35,
  },
  {
    id: "implementation_simulation",
    name: "实现与模拟",
    bucket: "implementation",
    priority: 60,
    patterns: [/模拟|枚举|暴力|递归|ALGO_SIMULATION|ALGO_ENUMERATION|ALGO_RECURSION/i],
    abilityTags: ["READING_TRANSLATION", "IMPLEMENTATION_ACCURACY", "EDGE_CASE_CHECK"],
    scoreFocus: ["题意翻译", "分支和循环实现", "边界情况"],
    preCheck: ["复述输入输出", "列出所有分支", "先手算样例"],
    postCheck: ["检查变量初始化", "检查循环边界", "检查极小/极大样例"],
    baseMinutes: 25,
  },
];

const FALLBACK_MODULE: ModuleRule = {
  id: "mixed_foundation",
  name: "综合基础题",
  bucket: "other",
  priority: 0,
  patterns: [],
  abilityTags: ["READING_TRANSLATION", "IMPLEMENTATION_ACCURACY"],
  scoreFocus: ["读题准确", "基础实现", "样例验证"],
  preCheck: ["先复述题意", "确认输入范围", "手算样例"],
  postCheck: ["检查边界", "检查输出格式", "检查数据类型"],
  baseMinutes: 25,
};

function parseCliOptions(argv = process.argv.slice(2)): CliOptions {
  const args: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
    if (key && value) args[key] = value;
  }
  return {
    input: path.resolve(args.input ?? DEFAULT_INPUT),
    output: path.resolve(args.output ?? DEFAULT_OUTPUT),
  };
}

async function main(): Promise<void> {
  const options = parseCliOptions();
  const catalog = await readJson<JsonObject>(options.input);
  const catalogItems = extractCatalogItems(catalog);
  const items = catalogItems.map(toDailyProblem).sort(compareProblemPid);
  const output = {
    generatedAt: new Date().toISOString(),
    schemaVersion: "luogu-daily-training-bank-v1.0",
    sourceCatalog: {
      path: path.relative(process.cwd(), options.input),
      totalItems: catalogItems.length,
      source: isObject(catalog.source) ? catalog.source : {},
      note: "Derived from Luogu public problem metadata. This file is for daily CSP-J/S training selection and does not copy problem statements.",
    },
    classificationStrategy: {
      keepOriginalLuoguTags: true,
      extraTrainingLayers: [
        "targetTrack: CSP_J / CSP_S / MIXED / ADVANCED",
        "stage: FOUNDATION / CSP_J_CORE / CSP_S_CORE / ADVANCED / REVIEW_ONLY",
        "primaryModule and secondaryModules",
        "abilityTags for weakness diagnosis",
        "dailyTraining recommendation with minutes, repeat gap and score focus",
      ],
    },
    dailySelectionPolicy: buildDailySelectionPolicy(),
    dailyTemplates: buildDailyTemplates(),
    indexes: buildIndexes(items),
    items,
  };

  await fs.mkdir(path.dirname(options.output), { recursive: true });
  await fs.writeFile(options.output, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`[luogu] daily training bank written: ${items.length} problems -> ${options.output}`);
}

function extractCatalogItems(catalog: JsonObject): CatalogItem[] {
  const rawItems = Array.isArray(catalog.items) ? catalog.items : [];
  return rawItems.map(normalizeCatalogItem).filter((item): item is CatalogItem => item !== null);
}

function normalizeCatalogItem(raw: unknown): CatalogItem | null {
  if (!isObject(raw)) return null;
  const pid = getString(raw.pid) || getString(raw.problemPid);
  const title = getString(raw.title);
  if (!pid || !title) return null;

  const categories = isObject(raw.categories) ? raw.categories : {};
  const categoryTags = Object.values(categories).flatMap((value) => arrayOfStrings(value));
  const rawDifficulty = raw.difficulty;
  const level = isObject(rawDifficulty) ? getNumber(rawDifficulty.level) : getNumber(raw.difficultyLevel, rawDifficulty);
  const difficulty: DifficultyInfo = {
    level,
    name: isObject(rawDifficulty) ? getString(rawDifficulty.name) || difficultyName(level) : getString(rawDifficulty) || difficultyName(level),
    band: isObject(rawDifficulty) ? toDifficultyBand(getString(rawDifficulty.band), level) : difficultyBand(level),
  };

  return {
    pid,
    title,
    url: getString(raw.url) || getString(raw.problemUrl) || `https://www.luogu.com.cn/problem/${pid}`,
    difficulty,
    rawLuoguTags: uniqueStrings([...arrayOfStrings(raw.rawLuoguTags), ...arrayOfStrings(raw.luoguTags)]),
    luoguTagIds: uniqueNumbers(arrayOfNumbers(raw.luoguTagIds)),
    originalTags: uniqueStrings([...arrayOfStrings(raw.tags), ...categoryTags]),
    stats: normalizeStats(raw.stats),
  };
}

function toDailyProblem(problem: CatalogItem): DailyProblem {
  const text = buildClassificationText(problem);
  const matchedModules = MODULE_RULES.filter((rule) => rule.patterns.some((pattern) => pattern.test(text))).sort(
    (a, b) => b.priority - a.priority,
  );
  const primaryModule = matchedModules[0] ?? FALLBACK_MODULE;
  const secondaryModules = matchedModules.slice(1, 5).map((rule) => rule.id);
  const contestTags = inferContestTags(text);
  const yearTags = inferYearTags(text);
  const cautionTags = inferCautionTags(text, problem);
  const targetTrack = inferTargetTrack(problem.difficulty.level, contestTags, cautionTags);
  const stage = inferStage(problem.difficulty.level, targetTrack, cautionTags);
  const trainingRoles = inferTrainingRoles(primaryModule, problem.difficulty.level, contestTags, cautionTags);
  const recommendedUse = inferRecommendedUse(trainingRoles, stage, contestTags, cautionTags);
  const abilityTags = uniqueStrings([
    ...primaryModule.abilityTags,
    ...matchedModules.slice(1, 3).flatMap((rule) => rule.abilityTags.slice(0, 2)),
    ...inferExtraAbilityTags(text),
  ]);
  const recommendedMinutes = inferRecommendedMinutes(primaryModule, problem.difficulty.level, cautionTags, text);
  const selectionScore = buildSelectionScore({ targetTrack, stage, difficultyLevel: problem.difficulty.level, primaryModule, contestTags, cautionTags });

  return {
    pid: problem.pid,
    title: problem.title,
    url: problem.url,
    difficulty: problem.difficulty,
    rawLuoguTags: problem.rawLuoguTags,
    luoguTagIds: problem.luoguTagIds,
    originalTags: problem.originalTags,
    classification: {
      targetTrack,
      stage,
      primaryModule: {
        id: primaryModule.id,
        name: primaryModule.name,
        bucket: primaryModule.bucket,
      },
      secondaryModules,
      abilityTags,
      contestTags,
      yearTags,
      cautionTags,
    },
    dailyTraining: {
      recommendedUse,
      recommendedMinutes,
      repeatGapDays: inferRepeatGapDays(recommendedUse, problem.difficulty.level),
      trainingRoles,
      scoreFocus: primaryModule.scoreFocus,
      preCheck: primaryModule.preCheck,
      postCheck: primaryModule.postCheck,
      selectionScore,
    },
    stats: problem.stats,
    source: "luogu_problem_list",
    lastUpdatedAt: new Date().toISOString(),
  };
}

function buildClassificationText(problem: CatalogItem): string {
  return uniqueStrings([problem.title, ...problem.rawLuoguTags, ...problem.originalTags]).join(" ");
}

function inferContestTags(text: string): string[] {
  const tags: string[] = [];
  if (/CSP\s*-?\s*J|CSP-J|入门级/i.test(text)) tags.push("CSP_J");
  if (/CSP\s*-?\s*S|CSP-S|提高级/i.test(text)) tags.push("CSP_S");
  if (/NOIP.*普及组|NOIP\s*普及组|普及组/i.test(text)) tags.push("NOIP_POPULAR");
  if (/NOIP.*提高组|NOIP\s*提高组|提高组/i.test(text)) tags.push("NOIP_ADVANCED");
  if (/省选/i.test(text)) tags.push("PROVINCIAL_SELECTION");
  if (/\bNOI\b|CTSC/i.test(text)) tags.push("NOI_PLUS");
  return uniqueStrings(tags);
}

function inferYearTags(text: string): string[] {
  return uniqueStrings([...text.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((match) => `YEAR_${match[1]}`));
}

function inferCautionTags(text: string, problem: CatalogItem): string[] {
  const tags: string[] = [];
  if (/疑似错题/i.test(text)) tags.push("SUSPECTED_BAD_PROBLEM");
  if (/提交答案|OJ_OUTPUT_ONLY/i.test(text)) tags.push("OUTPUT_ONLY");
  if (/Special Judge|OJ_SPECIAL_JUDGE/i.test(text)) tags.push("SPECIAL_JUDGE");
  if (problem.stats.passRate !== null && problem.stats.passRate < 0.08) tags.push("VERY_LOW_PASS_RATE");
  if (tags.length > 0) tags.push("NEED_MANUAL_REVIEW");
  return uniqueStrings(tags);
}

function inferTargetTrack(
  difficultyLevel: number | null,
  contestTags: string[],
  cautionTags: string[],
): DailyProblem["classification"]["targetTrack"] {
  if (cautionTags.includes("NEED_MANUAL_REVIEW")) return "MIXED";
  if (contestTags.includes("NOI_PLUS") || contestTags.includes("PROVINCIAL_SELECTION")) return "ADVANCED";
  if (contestTags.includes("CSP_S") || contestTags.includes("NOIP_ADVANCED")) return "CSP_S";
  if (contestTags.includes("CSP_J") || contestTags.includes("NOIP_POPULAR")) return "CSP_J";
  if (difficultyLevel !== null && difficultyLevel >= 6) return "ADVANCED";
  if (difficultyLevel !== null && difficultyLevel >= 4) return "CSP_S";
  if (difficultyLevel !== null && difficultyLevel <= 3) return "CSP_J";
  return "MIXED";
}

function inferStage(
  difficultyLevel: number | null,
  targetTrack: DailyProblem["classification"]["targetTrack"],
  cautionTags: string[],
): DailyProblem["classification"]["stage"] {
  if (cautionTags.includes("NEED_MANUAL_REVIEW") || cautionTags.includes("OUTPUT_ONLY")) return "REVIEW_ONLY";
  if (difficultyLevel !== null && difficultyLevel <= 1) return "FOUNDATION";
  if (targetTrack === "CSP_J") return "CSP_J_CORE";
  if (targetTrack === "CSP_S") return "CSP_S_CORE";
  if (targetTrack === "ADVANCED") return "ADVANCED";
  return difficultyLevel !== null && difficultyLevel <= 2 ? "FOUNDATION" : "CSP_J_CORE";
}

function inferTrainingRoles(module: ModuleRule, difficultyLevel: number | null, contestTags: string[], cautionTags: string[]): string[] {
  if (cautionTags.includes("OUTPUT_ONLY")) return ["REVIEW_ONLY"];
  const roles = new Set<string>();
  if (difficultyLevel === null || difficultyLevel <= 2) roles.add("WARMUP");
  roles.add("DAILY_DRILL");
  if (["dp", "graph", "dataStructure", "search"].includes(module.bucket)) roles.add("WEAKNESS_REPAIR");
  if (contestTags.length > 0) roles.add("CONTEST_REVIEW");
  if (difficultyLevel !== null && difficultyLevel >= 4) roles.add("MOCK_SECTION");
  if (difficultyLevel !== null && difficultyLevel <= 3 && module.bucket !== "other") roles.add("NEW_LESSON");
  if (cautionTags.includes("NEED_MANUAL_REVIEW")) roles.add("MANUAL_REVIEW_REQUIRED");
  return [...roles].sort();
}

function inferRecommendedUse(
  trainingRoles: string[],
  stage: DailyProblem["classification"]["stage"],
  contestTags: string[],
  cautionTags: string[],
): DailyProblem["dailyTraining"]["recommendedUse"] {
  if (cautionTags.includes("NEED_MANUAL_REVIEW") || stage === "REVIEW_ONLY") return "REVIEW_ONLY";
  if (trainingRoles.includes("WARMUP")) return "WARMUP";
  if (trainingRoles.includes("WEAKNESS_REPAIR")) return "WEAKNESS_REPAIR";
  if (contestTags.length > 0) return "CONTEST_REVIEW";
  if (trainingRoles.includes("MOCK_SECTION")) return "MOCK_SECTION";
  if (trainingRoles.includes("NEW_LESSON")) return "NEW_LESSON";
  return "DAILY_DRILL";
}

function inferExtraAbilityTags(text: string): string[] {
  const tags: string[] = [];
  if (/高精度|Big Integer/i.test(text)) tags.push("BIG_INTEGER_CARE", "OVERFLOW_CONTROL");
  if (/剪枝|PRUNING/i.test(text)) tags.push("PRUNING_SAFETY");
  if (/离散化/i.test(text)) tags.push("COORDINATE_COMPRESSION");
  if (/费用流|网络流|最大流/i.test(text)) tags.push("FLOW_MODELING");
  if (/倍增|LCA/i.test(text)) tags.push("BINARY_LIFTING_MODELING");
  return tags;
}

function inferRecommendedMinutes(module: ModuleRule, difficultyLevel: number | null, cautionTags: string[], text: string): number {
  if (cautionTags.includes("OUTPUT_ONLY")) return 10;
  let minutes = module.baseMinutes;
  if (difficultyLevel !== null) {
    minutes += Math.max(0, difficultyLevel - 2) * 10;
    if (difficultyLevel <= 1) minutes = Math.min(minutes, 20);
  }
  if (/高精度|网络流|费用流|状压|树链剖分/i.test(text)) minutes += 15;
  if (cautionTags.includes("NEED_MANUAL_REVIEW")) minutes += 10;
  return clampToStep(minutes, 10, 120, 5);
}

function inferRepeatGapDays(recommendedUse: DailyProblem["dailyTraining"]["recommendedUse"], difficultyLevel: number | null): number[] {
  if (recommendedUse === "REVIEW_ONLY") return [];
  if (difficultyLevel !== null && difficultyLevel >= 5) return [1, 3, 7, 14];
  if (recommendedUse === "WEAKNESS_REPAIR") return [1, 3, 7];
  return [1, 3];
}

function buildSelectionScore(params: {
  targetTrack: DailyProblem["classification"]["targetTrack"];
  stage: DailyProblem["classification"]["stage"];
  difficultyLevel: number | null;
  primaryModule: ModuleRule;
  contestTags: string[];
  cautionTags: string[];
}): DailyProblem["dailyTraining"]["selectionScore"] {
  const level = params.difficultyLevel ?? 2;
  const cautionPenalty = params.cautionTags.length > 0 ? 35 : 0;
  const contestBonus = params.contestTags.length > 0 ? 12 : 0;
  const coreModuleBonus = ["dp", "graph", "dataStructure", "search"].includes(params.primaryModule.bucket) ? 12 : 5;
  const foundationBonus = params.stage === "FOUNDATION" ? 8 : 0;
  const cspJ = clampScore(
    50 + (params.targetTrack === "CSP_J" ? 20 : 0) + (level <= 3 ? 18 : -level * 5) + coreModuleBonus + contestBonus + foundationBonus - cautionPenalty,
  );
  const cspS = clampScore(
    45 + (params.targetTrack === "CSP_S" ? 22 : 0) + (level >= 4 && level <= 5 ? 18 : level >= 6 ? 2 : -6) + coreModuleBonus + contestBonus - cautionPenalty,
  );
  return {
    cspJ,
    cspS,
    daily: clampScore(Math.round((cspJ + cspS) / 2 + (params.stage === "REVIEW_ONLY" ? -30 : 8))),
  };
}

function buildDailySelectionPolicy(): JsonObject {
  return {
    defaultSessionRules: {
      maxNewConceptProblemsPerDay: 2,
      minReviewProblemsPerDay: 1,
      avoidReviewOnlyInNormalTraining: true,
      avoidSamePrimaryModuleConsecutiveDays: true,
      repeatGaps: {
        firstReview: 1,
        secondReview: 3,
        thirdReview: 7,
        longTermReview: 14,
      },
    },
    problemSlotPriority: [
      "WARMUP: 低难度、实现或基础标签，10-20 分钟",
      "CORE: 当天主知识点，30-70 分钟",
      "WEAKNESS_REPAIR: 学生近期错因对应能力标签",
      "REVIEW: 1/3/7 天复测题，优先同模块不同题",
      "MOCK_SECTION: 比赛题或中高难度题，用于限时训练",
    ],
    scoreTargetMapping: {
      CSP_J_60_TO_80: ["implementation_simulation", "prefix_difference", "search_dfs_bfs", "math_number_theory"],
      CSP_J_80_TO_100: ["dp_foundation", "greedy_sorting", "data_structure_basic", "graph_basic"],
      CSP_S_100_TO_140: ["dp_foundation", "search_dfs_bfs", "greedy_sorting", "binary_search", "graph_basic"],
      CSP_S_140_TO_180: ["dp_knapsack", "dp_interval", "data_structure_advanced", "graph_basic"],
      CSP_S_180_TO_200: ["dp_state_compression", "data_structure_advanced", "graph_basic", "dp_interval"],
    },
  };
}

function buildDailyTemplates(): JsonObject[] {
  return [
    {
      templateId: "CSP_J_45MIN_FOUNDATION",
      name: "CSP-J 基础 45 分钟",
      slots: [
        { slot: "warmup", count: 1, minutes: 10, recommendedUse: ["WARMUP"], difficultyLevels: [1, 2] },
        { slot: "core", count: 1, minutes: 25, modules: ["implementation_simulation", "prefix_difference", "math_number_theory"] },
        { slot: "review", count: 1, minutes: 10, repeatGapDays: [1, 3, 7] },
      ],
    },
    {
      templateId: "CSP_J_75MIN_SCORE_UP",
      name: "CSP-J 提分 75 分钟",
      slots: [
        { slot: "warmup", count: 1, minutes: 10, recommendedUse: ["WARMUP"] },
        { slot: "core", count: 1, minutes: 35, modules: ["dp_foundation", "search_dfs_bfs", "greedy_sorting"] },
        { slot: "weaknessRepair", count: 1, minutes: 20, recommendedUse: ["WEAKNESS_REPAIR"] },
        { slot: "review", count: 1, minutes: 10, repeatGapDays: [1, 3, 7] },
      ],
    },
    {
      templateId: "CSP_S_90MIN_CORE",
      name: "CSP-S 核心能力 90 分钟",
      slots: [
        { slot: "warmup", count: 1, minutes: 10, difficultyLevels: [2, 3] },
        { slot: "core", count: 1, minutes: 50, modules: ["dp_foundation", "binary_search", "graph_basic", "data_structure_basic"] },
        { slot: "weaknessRepair", count: 1, minutes: 20, recommendedUse: ["WEAKNESS_REPAIR"] },
        { slot: "review", count: 1, minutes: 10, repeatGapDays: [1, 3, 7] },
      ],
    },
    {
      templateId: "CSP_S_120MIN_TARGET_200",
      name: "CSP-S 目标 200 分 120 分钟",
      slots: [
        { slot: "warmup", count: 1, minutes: 10, difficultyLevels: [3, 4] },
        { slot: "hardCore", count: 1, minutes: 70, modules: ["dp_interval", "dp_state_compression", "data_structure_advanced", "graph_basic"] },
        { slot: "mockSection", count: 1, minutes: 30, recommendedUse: ["MOCK_SECTION", "CONTEST_REVIEW"] },
        { slot: "review", count: 1, minutes: 10, repeatGapDays: [1, 3, 7] },
      ],
    },
  ];
}

function buildIndexes(items: DailyProblem[]): JsonObject {
  return {
    byTargetTrack: groupBy(items, (item) => item.classification.targetTrack),
    byStage: groupBy(items, (item) => item.classification.stage),
    byPrimaryModule: groupBy(items, (item) => item.classification.primaryModule.id),
    byModuleBucket: groupBy(items, (item) => item.classification.primaryModule.bucket),
    byRecommendedUse: groupBy(items, (item) => item.dailyTraining.recommendedUse),
    byDifficultyBand: groupBy(items, (item) => item.difficulty.band),
    byAbilityTag: groupMany(items, (item) => item.classification.abilityTags),
    byContestTag: groupMany(items, (item) => item.classification.contestTags),
    cautionProblems: items.filter((item) => item.classification.cautionTags.length > 0).map((item) => item.pid),
    topDailyCandidates: {
      cspJ: topCandidates(items, "cspJ", "CSP_J", 300),
      cspS: topCandidates(items, "cspS", "CSP_S", 500),
    },
  };
}

function topCandidates(items: DailyProblem[], scoreKey: "cspJ" | "cspS", targetTrack: "CSP_J" | "CSP_S", limit: number): string[] {
  return items
    .filter((item) => item.classification.targetTrack === targetTrack)
    .sort((a, b) => b.dailyTraining.selectionScore[scoreKey] - a.dailyTraining.selectionScore[scoreKey])
    .slice(0, limit)
    .map((item) => item.pid);
}

function groupBy(items: DailyProblem[], selector: (item: DailyProblem) => string): Record<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const item of items) {
    const key = selector(item) || "UNKNOWN";
    groups.set(key, [...(groups.get(key) ?? []), item.pid]);
  }
  return Object.fromEntries([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function groupMany(items: DailyProblem[], selector: (item: DailyProblem) => string[]): Record<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const item of items) {
    for (const key of selector(item)) groups.set(key, [...(groups.get(key) ?? []), item.pid]);
  }
  return Object.fromEntries([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function normalizeStats(value: unknown): CatalogItem["stats"] {
  if (!isObject(value)) return { totalSubmit: null, accepted: null, passRate: null };
  return {
    totalSubmit: getNumber(value.totalSubmit, value.submitCount),
    accepted: getNumber(value.accepted, value.acceptedCount),
    passRate: getNumber(value.passRate),
  };
}

function difficultyName(level: number | null): string {
  if (level === null) return "未知";
  return DIFFICULTY_NAME[level] ?? `未知难度 ${level}`;
}

function difficultyBand(level: number | null): DifficultyInfo["band"] {
  if (level === null) return "UNKNOWN";
  if (level <= 1) return "BEGINNER";
  if (level <= 3) return "CSP_J";
  if (level <= 5) return "CSP_S";
  if (level === 6) return "PROVINCIAL_SELECTION";
  return "NOI_PLUS";
}

function toDifficultyBand(value: string, fallbackLevel: number | null): DifficultyInfo["band"] {
  const allowed: DifficultyInfo["band"][] = ["UNKNOWN", "BEGINNER", "CSP_J", "CSP_S", "PROVINCIAL_SELECTION", "NOI_PLUS"];
  return allowed.includes(value as DifficultyInfo["band"]) ? (value as DifficultyInfo["band"]) : difficultyBand(fallbackLevel);
}

function compareProblemPid(a: DailyProblem, b: DailyProblem): number {
  const pa = splitPid(a.pid);
  const pb = splitPid(b.pid);
  if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
  if (pa.number !== pb.number) return pa.number - pb.number;
  return a.pid.localeCompare(b.pid);
}

function splitPid(pid: string): { prefix: string; number: number } {
  const match = pid.match(/^([A-Z]+)(\d+)/i);
  return { prefix: match?.[1] ?? pid, number: Number(match?.[2] ?? Number.MAX_SAFE_INTEGER) };
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return uniqueStrings(value.filter((item): item is string => typeof item === "string"));
}

function arrayOfNumbers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampToStep(value: number, min: number, max: number, step: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(clamped / step) * step;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
