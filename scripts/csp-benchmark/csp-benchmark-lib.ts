import { promises as fs } from "fs";
import path from "path";

type JsonObject = Record<string, unknown>;
type Slot = "T1" | "T2" | "T3" | "T4";
type MasteryLevel = "NO_EVIDENCE" | "EXPOSED" | "UNSTABLE" | "BASIC" | "TRANSFERABLE" | "CONTEST_STABLE";

export type CspBenchmarkOptions = {
  benchmarkDir: string;
  analysisDir: string;
  diagnosisDir: string;
  problemBankDir: string;
  coachDir: string;
  docsDir: string;
  targetYear: number;
  targetProvince: string;
  targetScore: number | null;
  weeklyHours: number;
  safetyMargin: number;
};

type Ability = {
  abilityId: string;
  name: string;
  observableBehaviors: string[];
  errorTypes: string[];
  trainingMethods: string[];
  verifyMethods: string[];
};

type KnowledgeModule = {
  moduleId: string;
  name: string;
  cspRelevance: {
    slots: Slot[];
    role: string[];
  };
  abilities: Ability[];
};

type KnowledgeDomain = {
  domainId: string;
  name: string;
  modules: KnowledgeModule[];
};

type KnowledgeTree = {
  version: string;
  generatedAt: string;
  source: Array<{ name: string; type: string; url: string }>;
  domains: KnowledgeDomain[];
  nonKnowledgeSkills: Ability[];
};

type PastProblem = {
  year: number;
  slot: Slot;
  problemId: string;
  luoguPid: string;
  title: string;
  isNationalOfficial: boolean;
  sourceUrls: {
    noi: string;
    luogu: string;
    analysis: string;
  };
  fullScore: number;
  slotRole: {
    position: Slot;
    role: string;
    firstPrizeTargetScore: {
      conservative: number;
      normal: number;
      strong: number;
    };
  };
  knowledgeMapping: {
    primary: string[];
    secondary: string[];
    thirdLevelAbilities: string[];
    nonKnowledgeSkills: string[];
  };
  modelType: string[];
  requiredTransformations: string[];
  implementationRisks: string[];
  partialScoreStructure: Array<{ score: number; condition: string; expectedMethod: string }>;
  commonFailureModes: string[];
  classification: {
    status: "CONFIRMED" | "NEEDS_REVIEW" | "NEEDS_MANUAL_CONFIRMATION";
    confidence: number;
    reviewedBy: string | null;
    reviewNote: string;
  };
  studentRecord: StudentPastProblemRecord | null;
};

type StudentPastProblemRecord = {
  year: number;
  slot: Slot;
  luoguPid: string;
  hasDone: boolean;
  doneDate: string;
  isBlindTest: boolean;
  hasSeenSolution: boolean;
  result: string;
  score: number | null;
  timeMinutes: number | null;
  submissionCount: number | null;
  errorTypes: string[];
  reviewNote: string;
  source: "manual" | "history_inference";
};

type Weakness = {
  weaknessId: string;
  title: string;
  severity: number;
  relatedModules: string[];
  relatedErrorTypes: string[];
  evidenceProblems: string[];
  problemCount: number;
};

type FeatureVector = {
  problemPid: string;
  problemTitle: string | null;
  attemptCount: number;
  solved: boolean;
  bestScore: number | null;
  finalResult: string;
  scoreTrajectory: number[];
  scorePattern: string;
  resultPattern: string;
  isRecent: boolean;
  primaryModule: string;
  codeModules: string[];
  riskFlags: string[];
  candidateErrorTypes: string[];
  cspAbilityRoles: string[];
  difficultyBand: string;
};

type SkillEvidence = {
  abilityId: string;
  sourceType: "HISTORICAL_LUOGU" | "WEAKNESS_CLUSTER" | "CSP_PAST_PROBLEM" | "RULE_INFERENCE";
  problemPid: string | null;
  weaknessId: string | null;
  weight: number;
  performanceScore: number;
  errorTypes: string[];
  note: string;
};

type SkillMastery = {
  abilityId: string;
  abilityName: string;
  domainId: string;
  moduleId: string;
  evidenceCount: number;
  positiveEvidenceCount: number;
  negativeEvidenceCount: number;
  weaknessEvidenceCount: number;
  historicalProblemCount: number;
  cspPastProblemCount: number;
  blindTestCount: number;
  masteryScore: number;
  masteryLevel: MasteryLevel;
  evidenceLevel: "NO_EVIDENCE" | "WEAK" | "MEDIUM" | "STRONG";
  confidence: number;
  topEvidence: SkillEvidence[];
};

type ExpectedLoss = {
  abilityId: string;
  name: string;
  status: "CONFIRMED_WEAKNESS" | "NEEDS_BLIND_VALIDATION" | "WATCH" | "INSUFFICIENT_EVIDENCE";
  historicalEvidenceCount: number;
  pastProblemEvidenceCount: number;
  blindTestCount: number;
  masteryLevel: MasteryLevel;
  expectedLoss: {
    value: number;
    confidenceInterval: [number, number];
    confidence: number;
  };
  firstPrizeImpact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendedAction: string;
  relatedPastProblems: Array<{ year: number; slot: Slot; luoguPid: string; title: string }>;
  formulaFactors: JsonObject;
};

export function parseCspBenchmarkCliOptions(argv = process.argv.slice(2)): CspBenchmarkOptions {
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
    benchmarkDir: path.resolve(args.output ?? path.join(process.cwd(), "data", "csp-s-benchmark")),
    analysisDir: path.resolve(args.analysis ?? path.join(process.cwd(), "data", "analysis")),
    diagnosisDir: path.resolve(args.diagnosis ?? path.join(process.cwd(), "data", "diagnosis")),
    problemBankDir: path.resolve(args.problemBank ?? path.join(process.cwd(), "data", "problem-bank")),
    coachDir: path.resolve(args.coach ?? path.join(process.cwd(), "data", "coach")),
    docsDir: path.resolve(args.docs ?? path.join(process.cwd(), "docs")),
    targetYear: positiveInteger(args.targetYear, 2026),
    targetProvince: args.targetProvince ?? "UNKNOWN",
    targetScore: optionalPositiveInteger(args.targetScore),
    weeklyHours: positiveInteger(args.weeklyHours, 20),
    safetyMargin: positiveInteger(args.safetyMargin, 35),
  };
}

export async function buildSourceRegistry(options: CspBenchmarkOptions): Promise<void> {
  await ensureBenchmarkDir(options);
  const registry = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    priorityRule: ["manual_csv", "noi_official", "luogu_problem_list", "llm_review", "rule_inference"],
    sources: [
      {
        id: "noi_syllabus_2025",
        name: "NOI syllabus 2025 revision",
        type: "official",
        url: "https://www.noi.cn/xw/2025-04-18/841584.shtml",
        usage: "Upper-level knowledge reference. The system converts it into trainable CSP-S skills.",
      },
      {
        id: "luogu_csp_s_list",
        name: "Luogu CSP-S problem list",
        type: "problem_index",
        url: "https://www.luogu.com.cn/problem/list?tag=342",
        usage: "Problem ids, titles, public tags, and candidate historical problem references.",
      },
      {
        id: "manual_past_problem_index",
        name: "Manual CSP-S past problem index",
        type: "manual_csv",
        url: path.join(options.benchmarkDir, "manual_past_problem_index.csv"),
        usage: "Highest-priority truth source for year, slot, title and official/national status.",
      },
      {
        id: "manual_knowledge_review",
        name: "Manual or LLM-reviewed knowledge mapping",
        type: "manual_csv",
        url: path.join(options.benchmarkDir, "manual_knowledge_review.csv"),
        usage: "Highest-priority truth source for ability mapping and partial-score structure.",
      },
    ],
  };
  await writeJson(path.join(options.benchmarkDir, "source_registry.json"), registry);
  await ensureCsvTemplates(options);
}

export async function importNoiSyllabus(options: CspBenchmarkOptions): Promise<void> {
  await ensureBenchmarkDir(options);
  await writeJson(path.join(options.benchmarkDir, "noi_syllabus_import.json"), {
    generatedAt: new Date().toISOString(),
    status: "SOURCE_REGISTERED_NOT_FULL_TEXT_PARSED",
    sourceUrl: "https://www.noi.cn/xw/2025-04-18/841584.shtml",
    note: "This system does not mechanically copy the official syllabus. It stores the official source and builds a trainable CSP-S ability tree from it.",
    output: "knowledge_ability_tree.json",
  });
}

export async function buildKnowledgeTree(options: CspBenchmarkOptions): Promise<KnowledgeTree> {
  await ensureBenchmarkDir(options);
  const tree: KnowledgeTree = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    source: [
      {
        name: "NOI syllabus 2025 revision",
        type: "official",
        url: "https://www.noi.cn/xw/2025-04-18/841584.shtml",
      },
    ],
    domains: buildDefaultDomains(),
    nonKnowledgeSkills: buildNonKnowledgeSkills(),
  };
  await writeJson(path.join(options.benchmarkDir, "knowledge_ability_tree.json"), tree);
  await fs.writeFile(path.join(options.benchmarkDir, "knowledge_ability_tree.md"), `\uFEFF${renderKnowledgeTree(tree)}`, "utf8");
  return tree;
}

export async function importPastProblemIndex(options: CspBenchmarkOptions): Promise<void> {
  await ensureBenchmarkDir(options);
  await ensureCsvTemplates(options);
  const manualRows = await readCsvIfExists(path.join(options.benchmarkDir, "manual_past_problem_index.csv"));
  const seedRows = getSeedPastProblems().map((item) => ({
    year: String(item.year),
    slot: item.slot,
    title: item.title,
    luoguPid: item.luoguPid,
    problemUrl: `https://www.luogu.com.cn/problem/${item.luoguPid}`,
    officialUrl: "",
    isNationalOfficial: String(item.isNationalOfficial),
    notes: item.notes,
  }));
  await writeJson(path.join(options.benchmarkDir, "past_problem_index_import.json"), {
    generatedAt: new Date().toISOString(),
    manualRows: manualRows.length,
    seedRows: seedRows.length,
    effectiveRows: manualRows.length > 0 ? manualRows : seedRows,
    note: manualRows.length > 0
      ? "Manual CSV is present and will override built-in seeds."
      : "Manual CSV has no rows yet. Built-in Luogu-based seed rows are used and marked for manual confirmation where needed.",
  });
}

export async function buildPastProblemDb(options: CspBenchmarkOptions): Promise<{ version: string; problems: PastProblem[] }> {
  await ensureBenchmarkDir(options);
  const knowledgeTree = await readOrBuildKnowledgeTree(options);
  const abilityIds = new Set(flattenAbilities(knowledgeTree).map((item) => item.abilityId));
  const indexRows = await loadProblemIndexRows(options);
  const reviewByPid = await loadKnowledgeReviewRows(options);
  const manualRecords = await loadStudentPastProblemRecords(options);
  const historyRecords = await inferStudentRecordsFromHistory(options);
  const recordByPid = new Map([...historyRecords, ...manualRecords].map((item) => [item.luoguPid, item]));

  const problems = indexRows.map((row) => {
    const slot = normalizeSlot(row.slot);
    const year = Number(row.year);
    const luoguPid = stringField(row.luoguPid);
    const review = reviewByPid.get(`${year}:${slot}:${luoguPid}`) ?? reviewByPid.get(luoguPid);
    const seed = getSeedPastProblems().find((item) => item.year === year && item.slot === slot && item.luoguPid === luoguPid);
    const inferred = inferProblemMapping(slot, luoguPid, review, seed);
    const thirdLevelAbilities = inferred.thirdLevelAbilities.filter((item) => abilityIds.has(item));
    return {
      year,
      slot,
      problemId: `CSP-S-${year}-${slot}`,
      luoguPid,
      title: stringField(row.title) || seed?.title || luoguPid,
      isNationalOfficial: booleanField(row.isNationalOfficial) || Boolean(seed?.isNationalOfficial),
      sourceUrls: {
        noi: stringField(row.officialUrl),
        luogu: stringField(row.problemUrl) || `https://www.luogu.com.cn/problem/${luoguPid}`,
        analysis: "",
      },
      fullScore: 100,
      slotRole: slotRoleFor(slot),
      knowledgeMapping: {
        primary: inferred.primary,
        secondary: inferred.secondary,
        thirdLevelAbilities,
        nonKnowledgeSkills: inferred.nonKnowledgeSkills,
      },
      modelType: inferred.modelType,
      requiredTransformations: inferred.requiredTransformations,
      implementationRisks: inferred.implementationRisks,
      partialScoreStructure: inferred.partialScoreStructure,
      commonFailureModes: inferred.commonFailureModes,
      classification: {
        status: review ? "CONFIRMED" : seed?.classificationStatus ?? "NEEDS_MANUAL_CONFIRMATION",
        confidence: review ? numberField(review.classificationConfidence, 0.85) : seed?.confidence ?? 0.55,
        reviewedBy: review ? "manual_knowledge_review.csv" : null,
        reviewNote: review ? stringField(review.reviewerNote) : seed?.notes ?? "Seed mapping needs manual confirmation.",
      },
      studentRecord: recordByPid.get(luoguPid) ?? null,
    } satisfies PastProblem;
  });

  const db = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    range: { from: 2019, to: 2025 },
    sourcePriority: ["manual_csv", "luogu_seed", "history_inference", "rule_inference"],
    problems: problems.sort((a, b) => a.year - b.year || slotOrder(a.slot) - slotOrder(b.slot)),
  };
  await writeJson(path.join(options.benchmarkDir, "past_problems_2019_2025.json"), db);
  await fs.writeFile(path.join(options.benchmarkDir, "past_problems_2019_2025.md"), `\uFEFF${renderPastProblems(db.problems)}`, "utf8");
  return db;
}

export async function classifyPastProblems(options: CspBenchmarkOptions): Promise<void> {
  const db = await readOrBuildPastProblemDb(options);
  const matrix = buildPastProblemFrequencyMatrix(db.problems);
  await writeJson(path.join(options.benchmarkDir, "past_problem_classification_matrix.json"), {
    generatedAt: new Date().toISOString(),
    bySlot: matrix.bySlot,
    byAbility: matrix.byAbility,
    byPrimary: matrix.byPrimary,
    needsReview: db.problems
      .filter((item) => item.classification.status !== "CONFIRMED")
      .map((item) => ({
        year: item.year,
        slot: item.slot,
        luoguPid: item.luoguPid,
        title: item.title,
        status: item.classification.status,
        note: item.classification.reviewNote,
      })),
  });
}

export async function validatePastProblemDb(options: CspBenchmarkOptions): Promise<void> {
  const tree = await readOrBuildKnowledgeTree(options);
  const db = await readOrBuildPastProblemDb(options);
  const abilityIds = new Set(flattenAbilities(tree).map((item) => item.abilityId));
  const issues: Array<{ severity: "ERROR" | "WARN"; message: string; problemId?: string }> = [];
  const byYear = groupBy(db.problems, (item) => String(item.year));
  for (let year = 2019; year <= 2025; year += 1) {
    const problems = byYear.get(String(year)) ?? [];
    if (problems.length !== 4) issues.push({ severity: "ERROR", message: `${year} must contain exactly 4 CSP-S problems, found ${problems.length}.` });
    for (const slot of ["T1", "T2", "T3", "T4"] as Slot[]) {
      if (!problems.some((item) => item.slot === slot)) issues.push({ severity: "ERROR", message: `${year} missing ${slot}.` });
    }
  }
  for (const problem of db.problems) {
    const id = problem.problemId;
    if (!problem.luoguPid) issues.push({ severity: "ERROR", problemId: id, message: "Missing luoguPid." });
    if (!problem.title) issues.push({ severity: "ERROR", problemId: id, message: "Missing title." });
    if (!problem.sourceUrls.luogu && !problem.sourceUrls.noi) issues.push({ severity: "ERROR", problemId: id, message: "Missing official/luogu source." });
    if (problem.knowledgeMapping.thirdLevelAbilities.length === 0) issues.push({ severity: "ERROR", problemId: id, message: "Missing third-level ability mapping." });
    for (const abilityId of problem.knowledgeMapping.thirdLevelAbilities) {
      if (!abilityIds.has(abilityId)) issues.push({ severity: "ERROR", problemId: id, message: `Unknown abilityId ${abilityId}.` });
    }
    if (!problem.slotRole.firstPrizeTargetScore) issues.push({ severity: "ERROR", problemId: id, message: "Missing first-prize target score." });
    if (!problem.classification.status) issues.push({ severity: "ERROR", problemId: id, message: "Missing classification.status." });
    if (!problem.isNationalOfficial) issues.push({ severity: "WARN", problemId: id, message: "Problem national official status is not confirmed." });
    if (problem.partialScoreStructure.length === 0) issues.push({ severity: "WARN", problemId: id, message: "Partial score structure is unknown." });
  }
  const result = {
    generatedAt: new Date().toISOString(),
    passed: issues.every((item) => item.severity !== "ERROR"),
    errorCount: issues.filter((item) => item.severity === "ERROR").length,
    warnCount: issues.filter((item) => item.severity === "WARN").length,
    issues,
  };
  await writeJson(path.join(options.benchmarkDir, "past_problem_db_validation.json"), result);
  if (!result.passed) {
    throw new Error(`CSP-S past problem db validation failed with ${result.errorCount} error(s).`);
  }
}

export async function mapStudentEvidenceToSkills(options: CspBenchmarkOptions): Promise<SkillEvidence[]> {
  const tree = await readOrBuildKnowledgeTree(options);
  const db = await readOrBuildPastProblemDb(options);
  const weaknesses = await loadWeaknesses(options);
  const vectors = await loadFeatureVectors(options);
  const evidence: SkillEvidence[] = [];

  for (const vector of vectors) {
    for (const abilityId of mapModuleAndErrorsToAbilities(vector.primaryModule, vector.candidateErrorTypes, vector.codeModules)) {
      evidence.push({
        abilityId,
        sourceType: "HISTORICAL_LUOGU",
        problemPid: vector.problemPid,
        weaknessId: null,
        weight: historicalWeight(vector),
        performanceScore: historicalPerformanceScore(vector),
        errorTypes: vector.candidateErrorTypes,
        note: `${vector.scorePattern}; attempts=${vector.attemptCount}; roles=${vector.cspAbilityRoles.join("/")}`,
      });
    }
  }

  for (const weakness of weaknesses) {
    for (const abilityId of mapModuleAndErrorsToAbilities(weakness.relatedModules[0] ?? "", weakness.relatedErrorTypes, weakness.relatedModules)) {
      evidence.push({
        abilityId,
        sourceType: "WEAKNESS_CLUSTER",
        problemPid: null,
        weaknessId: weakness.weaknessId,
        weight: Math.min(0.85, 0.25 + weakness.problemCount / 80),
        performanceScore: Math.max(0.05, 1 - weakness.severity / 100),
        errorTypes: weakness.relatedErrorTypes,
        note: `severity=${weakness.severity}; evidenceProblems=${weakness.evidenceProblems.slice(0, 8).join(",")}`,
      });
    }
  }

  for (const problem of db.problems) {
    const record = problem.studentRecord;
    for (const abilityId of problem.knowledgeMapping.thirdLevelAbilities) {
      if (!record) {
        evidence.push({
          abilityId,
          sourceType: "RULE_INFERENCE",
          problemPid: problem.luoguPid,
          weaknessId: null,
          weight: 0.1,
          performanceScore: 0.35,
          errorTypes: [],
          note: "CSP-S past problem has no student record yet; use as validation gap.",
        });
        continue;
      }
      evidence.push({
        abilityId,
        sourceType: "CSP_PAST_PROBLEM",
        problemPid: problem.luoguPid,
        weaknessId: null,
        weight: cspRecordWeight(record),
        performanceScore: cspRecordPerformanceScore(record),
        errorTypes: record.errorTypes,
        note: `slot=${problem.slot}; result=${record.result}; score=${record.score ?? "unknown"}; blind=${record.isBlindTest}`,
      });
    }
  }

  const validAbilityIds = new Set(flattenAbilities(tree).map((item) => item.abilityId));
  const filtered = evidence.filter((item) => validAbilityIds.has(item.abilityId));
  await writeJson(path.join(options.benchmarkDir, "student_skill_evidence.json"), {
    generatedAt: new Date().toISOString(),
    totalEvidence: filtered.length,
    items: filtered,
  });
  return filtered;
}

export async function calculateSkillMastery(options: CspBenchmarkOptions): Promise<SkillMastery[]> {
  const tree = await readOrBuildKnowledgeTree(options);
  const evidence = await readOrBuildSkillEvidence(options);
  const abilityCatalog = flattenAbilities(tree);
  const evidenceByAbility = groupBy(evidence, (item) => item.abilityId);
  const mastery = abilityCatalog.map((ability) => {
    const items = evidenceByAbility.get(ability.abilityId) ?? [];
    const totalWeight = sum(items.map((item) => item.weight));
    const weightedScore = totalWeight > 0 ? sum(items.map((item) => item.weight * item.performanceScore)) / totalWeight : 0;
    const weaknessEvidenceCount = items.filter((item) => item.sourceType === "WEAKNESS_CLUSTER").length;
    const cspPastProblemCount = unique(items.filter((item) => item.sourceType === "CSP_PAST_PROBLEM").map((item) => item.problemPid ?? "")).length;
    const blindTestCount = items.filter((item) => item.note.includes("blind=true")).length;
    const confidence = round(Math.min(0.95, Math.log2(items.length + 1) / 4 + cspPastProblemCount * 0.08 + blindTestCount * 0.08));
    const masteryScore = round(Math.max(0, Math.min(1, weightedScore - weaknessEvidenceCount * 0.015)));
    const output: SkillMastery = {
      abilityId: ability.abilityId,
      abilityName: ability.name,
      domainId: ability.domainId,
      moduleId: ability.moduleId,
      evidenceCount: items.length,
      positiveEvidenceCount: items.filter((item) => item.performanceScore >= 0.65).length,
      negativeEvidenceCount: items.filter((item) => item.performanceScore < 0.4).length,
      weaknessEvidenceCount,
      historicalProblemCount: unique(items.filter((item) => item.sourceType === "HISTORICAL_LUOGU").map((item) => item.problemPid ?? "")).length,
      cspPastProblemCount,
      blindTestCount,
      masteryScore,
      masteryLevel: masteryLevelFor(masteryScore, items.length),
      evidenceLevel: evidenceLevelFor(items.length, cspPastProblemCount, blindTestCount),
      confidence,
      topEvidence: items
        .slice()
        .sort((a, b) => a.performanceScore - b.performanceScore || b.weight - a.weight)
        .slice(0, 8),
    };
    return output;
  }).sort((a, b) => a.masteryScore - b.masteryScore || b.evidenceCount - a.evidenceCount);
  await writeJson(path.join(options.benchmarkDir, "skill_mastery.json"), {
    generatedAt: new Date().toISOString(),
    items: mastery,
  });
  return mastery;
}

export async function calculateExpectedScoreLoss(options: CspBenchmarkOptions): Promise<ExpectedLoss[]> {
  const db = await readOrBuildPastProblemDb(options);
  const mastery = await readOrBuildSkillMastery(options);
  const masteryByAbility = new Map(mastery.map((item) => [item.abilityId, item]));
  const problemsByAbility = new Map<string, PastProblem[]>();
  for (const problem of db.problems) {
    for (const abilityId of problem.knowledgeMapping.thirdLevelAbilities) {
      const items = problemsByAbility.get(abilityId) ?? [];
      items.push(problem);
      problemsByAbility.set(abilityId, items);
    }
  }
  const losses = [...problemsByAbility.entries()].map(([abilityId, problems]) => {
    const skill = masteryByAbility.get(abilityId);
    const frequency = problems.length / Math.max(db.problems.length, 1);
    const slotImpact = avg(problems.map((item) => slotImpactFor(item.slot)));
    const scoreWeight = avg(problems.map((item) => item.slotRole.firstPrizeTargetScore.normal)) / 100;
    const failureProbability = 1 - (skill?.masteryScore ?? 0.2);
    const unrecoveredScoreRatio = unrecoveredRatioFor(abilityId, skill?.negativeEvidenceCount ?? 0);
    const firstPrizeSensitivity = firstPrizeSensitivityFor(problems);
    const confidence = round(Math.max(0.2, Math.min(0.9, (skill?.confidence ?? 0.25) * avg(problems.map((item) => item.classification.confidence)))));
    const value = round(frequency * slotImpact * scoreWeight * failureProbability * unrecoveredScoreRatio * firstPrizeSensitivity * confidence * 100);
    const status = statusForLoss(skill, value);
    const loss: ExpectedLoss = {
      abilityId,
      name: skill?.abilityName ?? abilityId,
      status,
      historicalEvidenceCount: skill?.historicalProblemCount ?? 0,
      pastProblemEvidenceCount: skill?.cspPastProblemCount ?? 0,
      blindTestCount: skill?.blindTestCount ?? 0,
      masteryLevel: skill?.masteryLevel ?? "NO_EVIDENCE",
      expectedLoss: {
        value,
        confidenceInterval: [round(value * 0.55), round(value * 1.55)],
        confidence,
      },
      firstPrizeImpact: impactForLoss(value),
      recommendedAction: recommendationForLoss(abilityId, problems, skill),
      relatedPastProblems: problems.map((item) => ({ year: item.year, slot: item.slot, luoguPid: item.luoguPid, title: item.title })),
      formulaFactors: {
        cspFrequency: round(frequency),
        slotImpact: round(slotImpact),
        scoreWeight: round(scoreWeight),
        failureProbability: round(failureProbability),
        unrecoveredScoreRatio,
        firstPrizeSensitivity,
        confidence,
      },
    };
    return loss;
  }).sort((a, b) => b.expectedLoss.value - a.expectedLoss.value);
  await writeJson(path.join(options.benchmarkDir, "expected_score_loss.json"), {
    generatedAt: new Date().toISOString(),
    formula: "expectedLoss = cspFrequency * slotImpact * scoreWeight * failureProbability * unrecoveredScoreRatio * firstPrizeSensitivity * confidence",
    items: losses,
  });
  return losses;
}

export async function selectDiagnosticPastProblems(options: CspBenchmarkOptions): Promise<void> {
  const db = await readOrBuildPastProblemDb(options);
  const losses = await readOrBuildExpectedLoss(options);
  const selected: JsonObject[] = [];
  const used = new Set<string>();
  for (const loss of losses.slice(0, 12)) {
    const candidates = db.problems
      .filter((problem) => problem.knowledgeMapping.thirdLevelAbilities.includes(loss.abilityId))
      .filter((problem) => !problem.studentRecord || !problem.studentRecord.isBlindTest || (problem.studentRecord.score ?? 0) < 80)
      .sort((a, b) => slotOrder(b.slot) - slotOrder(a.slot) || b.year - a.year);
    const candidate = candidates.find((problem) => !used.has(problem.problemId));
    if (!candidate) continue;
    used.add(candidate.problemId);
    selected.push({
      problemId: candidate.problemId,
      year: candidate.year,
      slot: candidate.slot,
      luoguPid: candidate.luoguPid,
      title: candidate.title,
      targetAbilityId: loss.abilityId,
      expectedLoss: loss.expectedLoss.value,
      timeLimitMinutes: slotOrder(candidate.slot) <= 2 ? 75 : 110,
      expectedOutput: [
        "Before coding: write model, constraints, partial-score routes, and implementation risks.",
        "After attempt: record score, time, submissions, whether it was blind, and exact failure stage.",
      ],
      reason: loss.recommendedAction,
    });
    if (selected.length >= 8) break;
  }
  await writeJson(path.join(options.benchmarkDir, "diagnostic_past_problem_selection.json"), {
    generatedAt: new Date().toISOString(),
    principle: "Use real CSP-S past problems as blind probes before trusting historical Luogu weakness labels.",
    items: selected,
  });
}

export async function generateFirstPrizeGapReport(options: CspBenchmarkOptions): Promise<void> {
  const tree = await readOrBuildKnowledgeTree(options);
  const db = await readOrBuildPastProblemDb(options);
  const mastery = await readOrBuildSkillMastery(options);
  const losses = await readOrBuildExpectedLoss(options);
  const diagnostics = await readJsonIfExists<{ items?: JsonObject[] }>(path.join(options.benchmarkDir, "diagnostic_past_problem_selection.json"), { items: [] });
  const provinceLines = await loadProvinceLines(options);
  const targetLine = calculateTargetLine(options, provinceLines);
  const matrix = buildPastProblemFrequencyMatrix(db.problems);
  const criticalLoss = round(sum(losses.filter((item) => ["CRITICAL", "HIGH"].includes(item.firstPrizeImpact)).map((item) => item.expectedLoss.value)));
  const readiness = round(Math.max(0, Math.min(1, 1 - criticalLoss / Math.max(targetLine.safeTargetScore, 1))));
  const report = {
    generatedAt: new Date().toISOString(),
    target: {
      year: options.targetYear,
      province: options.targetProvince,
      explicitTargetScore: options.targetScore,
      weeklyHours: options.weeklyHours,
      safetyMargin: options.safetyMargin,
      safeTargetScore: targetLine.safeTargetScore,
      lineConfidence: targetLine.confidence,
      lineNote: targetLine.note,
    },
    dataReliability: {
      pastProblemCount: db.problems.length,
      confirmedPastProblems: db.problems.filter((item) => item.classification.status === "CONFIRMED").length,
      needsManualConfirmation: db.problems.filter((item) => item.classification.status !== "CONFIRMED").length,
      cspPastProblemsWithStudentRecord: db.problems.filter((item) => item.studentRecord).length,
      masteryAbilities: mastery.length,
      noEvidenceAbilities: mastery.filter((item) => item.masteryLevel === "NO_EVIDENCE").length,
      warning: "The system can enforce a diagnostic and training loop, but no program can mathematically guarantee a first prize without real contest evidence.",
    },
    cspStructure: matrix,
    topLosses: losses.slice(0, 15),
    confirmedWeaknesses: losses.filter((item) => item.status === "CONFIRMED_WEAKNESS").slice(0, 10),
    pendingWeaknesses: losses.filter((item) => item.status === "NEEDS_BLIND_VALIDATION").slice(0, 10),
    downgradedOrWatch: losses.filter((item) => item.status === "WATCH" || item.status === "INSUFFICIENT_EVIDENCE").slice(0, 10),
    scoreGap: {
      criticalExpectedLoss: criticalLoss,
      targetScore: targetLine.safeTargetScore,
      riskReductionTarget: round(Math.max(0, criticalLoss - Math.max(8, targetLine.safeTargetScore * 0.04))),
      readiness,
      verdict: readiness >= 0.82
        ? "Close to target, but still requires real blind CSP-S past-paper validation."
        : "Not enough verified CSP-S evidence; run the diagnostic past-problem set before claiming first-prize readiness.",
    },
    diagnosticProblems: diagnostics.items ?? [],
  };
  await writeJson(path.join(options.benchmarkDir, "first_prize_gap_report.json"), report);
  const markdown = renderFirstPrizeGapReport(report, db.problems, mastery, losses, flattenAbilities(tree));
  await fs.writeFile(path.join(options.benchmarkDir, "first_prize_gap_report.md"), `\uFEFF${markdown}`, "utf8");
}

export async function buildCspBenchmarkSystem(options: CspBenchmarkOptions): Promise<void> {
  await buildSourceRegistry(options);
  await importNoiSyllabus(options);
  await buildKnowledgeTree(options);
  await importPastProblemIndex(options);
  await buildPastProblemDb(options);
  await classifyPastProblems(options);
  await validatePastProblemDb(options);
  await mapStudentEvidenceToSkills(options);
  await calculateSkillMastery(options);
  await calculateExpectedScoreLoss(options);
  await selectDiagnosticPastProblems(options);
  await generateFirstPrizeGapReport(options);
}

function buildDefaultDomains(): KnowledgeDomain[] {
  return [
    domain("PROGRAMMING_BASICS", "Programming basics", [
      moduleItem("PROGRAMMING_BASICS.READING", "Reading and constraints", ["T1", "T2"], ["STABLE_SCORE"], [
        ability("PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION", "Extract objective, constraints and hidden cases", ["State n, value range, answer type and corner cases before coding."], ["READING_ERROR"], ["Read-and-rewrite drills"], ["Pre-code checklist has no missing constraint."]),
      ]),
      moduleItem("PROGRAMMING_BASICS.IMPLEMENTATION", "Implementation stability", ["T1", "T2", "T3"], ["STABLE_SCORE"], buildImplementationAbilities()),
    ]),
    domain("BASIC_ALGORITHM", "Basic algorithms", [
      moduleItem("BASIC_ALGORITHM.SIMULATION_ENUMERATION", "Simulation and enumeration", ["T1", "T2"], ["STABLE_SCORE"], [
        ability("BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT", "Correct case split and enumeration", ["Can enumerate all legal states without duplicates or omissions."], ["BOUNDARY_ERROR", "READING_ERROR"], ["T1 timed drills"], ["T1 blind score >= 90."]),
      ]),
      moduleItem("BASIC_ALGORITHM.BINARY_SEARCH", "Binary search", ["T2", "T3"], ["MODELING"], [
        ability("BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY", "Prove check monotonicity and boundary", ["Can explain why answer is monotonic and choose interval endpoints."], ["MODEL_ERROR", "BOUNDARY_ERROR"], ["Binary answer drills with proof"], ["AC in <= 2 submissions and proof written before code."]),
      ]),
    ]),
    domain("DATA_STRUCTURE", "Data structures", [
      moduleItem("DATA_STRUCTURE.DSU", "Disjoint set union", ["T2", "T3"], ["MODELING"], [
        ability("DATA_STRUCTURE.DSU.SET_MEANING", "Define set meaning and merge condition", ["Can state what each set represents after every merge."], ["MODEL_ERROR", "INIT_ERROR", "INDEX_ERROR"], ["DSU with discretization variants"], ["No initialization/discretization error in blind task."]),
      ]),
      moduleItem("DATA_STRUCTURE.RANGE_QUERY", "Segment tree and Fenwick tree", ["T2", "T3", "T4"], ["IMPLEMENTATION", "OPTIMIZATION"], [
        ability("DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY", "Range data-structure template and boundary", ["Can choose inclusive/exclusive ranges and maintain lazy tags correctly."], ["INDEX_ERROR", "TEMPLATE_UNFAMILIAR", "BOUNDARY_ERROR"], ["Template rebuild and mutation"], ["Pass random stress tests against brute force."]),
      ]),
    ]),
    domain("GRAPH", "Graph", [
      moduleItem("GRAPH.MODELING", "Graph modeling", ["T2", "T3", "T4"], ["MODELING", "PARTIAL_SCORE"], [
        ability("GRAPH.MODELING.GRAPH_ABSTRACTION", "Turn problem relation into graph states and edges", ["Can define node, edge, weight and reachability meaning."], ["MODEL_ERROR", "COMPLEXITY_ERROR"], ["Graph model rewrite drills"], ["Can justify graph construction and complexity."]),
      ]),
      moduleItem("GRAPH.SHORTEST_PATH", "Shortest path", ["T2", "T3"], ["MODELING"], [
        ability("GRAPH.SHORTEST_PATH.STATE_AND_INIT", "Shortest-path state and initialization", ["Can define distance state, unreachable value and start/end handling."], ["INIT_ERROR", "BOUNDARY_ERROR", "MODEL_ERROR"], ["Shortest-path variants"], ["No INF/start/end mistake in blind task."]),
      ]),
    ]),
    domain("DP", "Dynamic programming", [
      moduleItem("DP.GENERAL", "General DP", ["T2", "T3", "T4"], ["MODELING", "PARTIAL_SCORE"], [
        ability("DP.GENERAL.STATE_TRANSITION", "State, transition, init and order", ["Can write state meaning, transition source, init and iteration order before coding."], ["STATE_ERROR", "TRANSITION_ERROR", "INIT_ERROR"], ["DP state table drills"], ["State definition is accepted by review before code."]),
      ]),
      moduleItem("DP.INTERVAL", "Interval DP", ["T2", "T3", "T4"], ["MODELING", "PARTIAL_SCORE"], [
        ability("DP.INTERVAL.RECOGNIZE_STRUCTURE", "Recognize interval substructure", ["Can decide whether dp[l][r] is valid and what the split means."], ["MODEL_ERROR", "STATE_ERROR"], ["Interval-DP identification drills"], ["Can reject false interval-DP labels."]),
        ability("DP.INTERVAL.INIT_AND_ORDER", "Initialization and length-order enumeration", ["Can write len=1/empty interval initialization and enumerate by length."], ["INIT_ERROR", "BOUNDARY_ERROR", "ENUMERATION_ORDER_ERROR"], ["Classic interval-DP rebuild"], ["AC in <= 2 submissions on blind variant."]),
      ]),
      moduleItem("DP.STATE_COMPRESSION", "State compression DP", ["T3", "T4"], ["MODELING", "PARTIAL_SCORE"], [
        ability("DP.STATE_COMPRESSION.MASK_DESIGN", "Mask meaning, transition and pruning", ["Can define bit meaning, legal masks and transition complexity."], ["STATE_ERROR", "COMPLEXITY_ERROR"], ["Small-n brute to mask DP"], ["Can pass brute-force stress tests."]),
      ]),
    ]),
    domain("MATH", "Mathematics", [
      ...[
        "NUMBER_THEORY",
        "MODULAR",
        "GCD_FACTOR",
        "COMBINATORICS",
        "COUNTING",
        "RECURRENCE",
        "FORMULA_DERIVATION",
        "INVARIANT",
        "CONSTRUCTION",
        "PERIODICITY",
        "OVERFLOW_RANGE",
        "MODEL_TO_DP",
      ].map((name) => moduleItem(`MATH.${name}`, mathModuleName(name), ["T1", "T2", "T3", "T4"], ["MODELING"], [
        ability(`MATH.${name}.CORE`, `${mathModuleName(name)} core ability`, ["Can derive formula/model and verify it on small cases."], mathErrorTypes(name), ["Formula derivation plus brute-force check"], ["Derivation matches brute force on random small cases."]),
      ])),
    ]),
    domain("STRING", "String", [
      moduleItem("STRING.PATTERN", "String pattern and boundary", ["T1", "T2", "T3"], ["STABLE_SCORE", "MODELING"], [
        ability("STRING.PATTERN.BOUNDARY", "String boundary and pattern model", ["Can handle empty/single/extreme strings and define pattern state."], ["BOUNDARY_ERROR", "INDEX_ERROR", "MODEL_ERROR"], ["String corner-case drills"], ["Corner-case checklist passed before submission."]),
      ]),
    ]),
    domain("SEARCH", "Search", [
      moduleItem("SEARCH.DFS_BFS", "DFS/BFS and pruning", ["T2", "T3", "T4"], ["PARTIAL_SCORE"], [
        ability("SEARCH.DFS_BFS.PRUNING_AND_STATE", "Search state and pruning", ["Can define search state, visited rule and pruning correctness."], ["COMPLEXITY_ERROR", "RECURSION_STACK_RISK"], ["Brute force first, then prune"], ["Brute and optimized results match on small tests."]),
      ]),
    ]),
    domain("GREEDY", "Greedy", [
      moduleItem("GREEDY.PROOF", "Greedy proof and counterexample check", ["T2", "T3", "T4"], ["MODELING"], [
        ability("GREEDY.PROOF.EXCHANGE_ARGUMENT", "Exchange argument and counterexample search", ["Can explain why local choice is safe or find counterexample."], ["MODEL_ERROR", "STRATEGY_ERROR"], ["Proof-before-code greedy drills"], ["Can give proof or reject greedy within 20 minutes."]),
      ]),
    ]),
    domain("COMPREHENSIVE", "Comprehensive contest strategy", [
      moduleItem("COMPREHENSIVE.EXAM_STRATEGY", "Contest strategy", ["T1", "T2", "T3", "T4"], ["FIRST_PRIZE"], [
        ability("COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION", "Time allocation and stop-loss", ["Can decide when to switch tasks and preserve safe score."], ["STRATEGY_ERROR", "DEBUG_TIMEOUT"], ["Four-problem mock exams"], ["Mock review shows no over-investment in one task."]),
      ]),
    ]),
    domain("NON_KNOWLEDGE_SKILL", "Non-knowledge skills", [
      moduleItem("NON_KNOWLEDGE_SKILL.PARTIAL_SCORE", "Partial-score strategy", ["T3", "T4"], ["PARTIAL_SCORE"], [
        ability("PARTIAL_SCORE.SUBTASK_ANALYSIS", "Subtask and partial-score decomposition", ["Can write executable 30/50/70/100 point routes in 20 minutes."], ["PARTIAL_SCORE_MISSED", "STRATEGY_ERROR"], ["Hard problem partial-score drills"], ["At least 5 blind T3/T4 tasks show predicted route and actual score match."]),
      ]),
      moduleItem("NON_KNOWLEDGE_SKILL.STRESS_TEST", "Stress testing", ["T2", "T3", "T4"], ["VALIDATION"], [
        ability("IMPLEMENTATION.STRESS_TEST", "Brute-force stress testing", ["Can build brute/generator for uncertain algorithms."], ["DEBUG_TIMEOUT", "IMPLEMENTATION_RISK"], ["Random generator and brute comparator"], ["Bug found locally before submission."]),
      ]),
    ]),
  ];
}

function buildImplementationAbilities(): Ability[] {
  return [
    ability("IMPLEMENTATION.INDEX_BOUNDARY", "Index and boundary safety", ["Can list array ranges and loop endpoints."], ["INDEX_ERROR", "BOUNDARY_ERROR"], ["Boundary checklist drills"], ["No out-of-range issue in blind task."]),
    ability("IMPLEMENTATION.INITIALIZATION", "Initialization and reset", ["Can initialize DP/graph/multitest states completely."], ["INIT_ERROR"], ["Initialization rewrite"], ["Pass multi-test stress."]),
    ability("IMPLEMENTATION.INTEGER_OVERFLOW", "Integer overflow and range estimate", ["Can compute max value and choose numeric type."], ["OVERFLOW_ERROR"], ["Range estimation before code"], ["No overflow on max tests."]),
    ability("IMPLEMENTATION.MULTITEST_CLEAR", "Multi-test clearing", ["Can reset all touched structures between cases."], ["INIT_ERROR"], ["Multi-test conversion drills"], ["Pass repeated random tests."]),
    ability("IMPLEMENTATION.RECURSION_STACK", "Recursion depth and stack safety", ["Can estimate recursion depth and switch to iterative when needed."], ["RECURSION_STACK_RISK"], ["DFS iterative rewrite"], ["No stack risk on max chain/tree."]),
    ability("IMPLEMENTATION.IO_FORMAT", "Input/output format stability", ["Can parse all formats and print exact expected output."], ["IO_FORMAT_ERROR"], ["Format mutation drills"], ["No PE/format failures."]),
    ability("IMPLEMENTATION.TEMPLATE_CORRECTNESS", "Template correctness", ["Can rebuild template without hidden stale assumptions."], ["TEMPLATE_UNFAMILIAR"], ["Template from-scratch drills"], ["Template passes standard tests."]),
    ability("IMPLEMENTATION.DEBUG_TIMEOUT", "Debugging time control", ["Can isolate bug with small cases within 20 minutes."], ["DEBUG_TIMEOUT"], ["Debugging protocol drills"], ["Debug log identifies first failing invariant."]),
  ];
}

function buildNonKnowledgeSkills(): Ability[] {
  return [
    ability("PARTIAL_SCORE.SUBTASK_ANALYSIS", "Subtask and partial-score decomposition", ["Write 30/50/70/100 routes before coding.", "Implement a reliable brute-force route first."], ["PARTIAL_SCORE_MISSED", "STRATEGY_ERROR"], ["T3/T4 partial-score drills"], ["Blind T3/T4 partial scores match predicted route."]),
    ability("COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION", "Contest time allocation and stop-loss", ["Protect T1/T2, cap debug time, switch to partial score route."], ["STRATEGY_ERROR", "DEBUG_TIMEOUT"], ["Four-problem mock exams"], ["Mock review shows time allocation target achieved."]),
  ];
}

function domain(domainId: string, name: string, modules: KnowledgeModule[]): KnowledgeDomain {
  return { domainId, name, modules };
}

function moduleItem(moduleId: string, name: string, slots: Slot[], role: string[], abilities: Ability[]): KnowledgeModule {
  return { moduleId, name, cspRelevance: { slots, role }, abilities };
}

function ability(abilityId: string, name: string, observableBehaviors: string[], errorTypes: string[], trainingMethods: string[], verifyMethods: string[]): Ability {
  return { abilityId, name, observableBehaviors, errorTypes, trainingMethods, verifyMethods };
}

function getSeedPastProblems(): Array<{
  year: number;
  slot: Slot;
  luoguPid: string;
  title: string;
  isNationalOfficial: boolean;
  notes: string;
  classificationStatus: PastProblem["classification"]["status"];
  confidence: number;
  mapping: Partial<PastProblem["knowledgeMapping"]> & {
    modelType?: string[];
    transformations?: string[];
    risks?: string[];
    failures?: string[];
  };
}> {
  return [
    seed(2019, "T1", "P5657", "格雷码", ["MATH.RECURRENCE.CORE", "IMPLEMENTATION.INTEGER_OVERFLOW"], "2019 had more public CSP-S tasks; keep manual confirmation for the exact four-task benchmark."),
    seed(2019, "T2", "P5658", "括号树", ["DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY", "STRING.PATTERN.BOUNDARY"], "2019 exact slot policy needs manual confirmation."),
    seed(2019, "T3", "P5659", "树上的数", ["GRAPH.MODELING.GRAPH_ABSTRACTION", "GREEDY.PROOF.EXCHANGE_ARGUMENT", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "2019 exact slot policy needs manual confirmation."),
    seed(2019, "T4", "P5664", "Emiya 家今天的饭", ["DP.GENERAL.STATE_TRANSITION", "MATH.COMBINATORICS.CORE", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "2019 exact slot policy needs manual confirmation."),
    seed(2020, "T1", "P7075", "儒略日", ["BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY", "MATH.PERIODICITY.CORE", "IMPLEMENTATION.INDEX_BOUNDARY"], "Luogu CSP-S 2020 public list seed."),
    seed(2020, "T2", "P7076", "动物园", ["MATH.OVERFLOW_RANGE.CORE", "GREEDY.PROOF.EXCHANGE_ARGUMENT", "IMPLEMENTATION.INTEGER_OVERFLOW"], "Luogu CSP-S 2020 public list seed."),
    seed(2020, "T3", "P7077", "函数调用", ["DP.GENERAL.STATE_TRANSITION", "GRAPH.MODELING.GRAPH_ABSTRACTION", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2020 public list seed."),
    seed(2020, "T4", "P7078", "贪吃蛇", ["GREEDY.PROOF.EXCHANGE_ARGUMENT", "DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2020 public list seed."),
    seed(2021, "T1", "P7913", "廊桥分配", ["GREEDY.PROOF.EXCHANGE_ARGUMENT", "BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT"], "Luogu CSP-S 2021 public list seed."),
    seed(2021, "T2", "P7914", "括号序列", ["DP.INTERVAL.RECOGNIZE_STRUCTURE", "DP.INTERVAL.INIT_AND_ORDER", "STRING.PATTERN.BOUNDARY"], "Luogu CSP-S 2021 public list seed."),
    seed(2021, "T3", "P7915", "回文", ["STRING.PATTERN.BOUNDARY", "GREEDY.PROOF.EXCHANGE_ARGUMENT", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2021 public list seed."),
    seed(2021, "T4", "P7916", "交通规划", ["GRAPH.MODELING.GRAPH_ABSTRACTION", "DP.INTERVAL.RECOGNIZE_STRUCTURE", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2021 public list seed."),
    seed(2022, "T1", "P8817", "假期计划", ["GRAPH.MODELING.GRAPH_ABSTRACTION", "SEARCH.DFS_BFS.PRUNING_AND_STATE"], "Luogu CSP-S 2022 public list seed."),
    seed(2022, "T2", "P8818", "策略游戏", ["GREEDY.PROOF.EXCHANGE_ARGUMENT", "DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY"], "Luogu CSP-S 2022 public list seed."),
    seed(2022, "T3", "P8819", "星战", ["GRAPH.MODELING.GRAPH_ABSTRACTION", "MATH.INVARIANT.CORE", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2022 public list seed."),
    seed(2022, "T4", "P8820", "数据传输", ["DP.GENERAL.STATE_TRANSITION", "DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2022 public list seed."),
    seed(2023, "T1", "P9752", "密码锁", ["BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT", "IMPLEMENTATION.INDEX_BOUNDARY"], "Luogu CSP-S 2023 public list seed."),
    seed(2023, "T2", "P9753", "消消乐", ["DP.GENERAL.STATE_TRANSITION", "STRING.PATTERN.BOUNDARY"], "Luogu CSP-S 2023 public list seed."),
    seed(2023, "T3", "P9754", "结构体", ["PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION", "IMPLEMENTATION.INDEX_BOUNDARY", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2023 public list seed."),
    seed(2023, "T4", "P9755", "种树", ["GREEDY.PROOF.EXCHANGE_ARGUMENT", "BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2023 public list seed."),
    seed(2024, "T1", "P11231", "决斗", ["GREEDY.PROOF.EXCHANGE_ARGUMENT", "MATH.INVARIANT.CORE"], "Luogu CSP-S 2024 public list seed."),
    seed(2024, "T2", "P11232", "超速检测", ["BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY", "MATH.FORMULA_DERIVATION.CORE", "IMPLEMENTATION.INDEX_BOUNDARY"], "Luogu CSP-S 2024 public list seed."),
    seed(2024, "T3", "P11233", "染色", ["DP.GENERAL.STATE_TRANSITION", "DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2024 public list seed."),
    seed(2024, "T4", "P11234", "擂台游戏", ["DP.GENERAL.STATE_TRANSITION", "GREEDY.PROOF.EXCHANGE_ARGUMENT", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2024 public list seed."),
    seed(2025, "T1", "P14361", "社团招新", ["GREEDY.PROOF.EXCHANGE_ARGUMENT", "BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT"], "Luogu CSP-S 2025 public list seed; please confirm official order."),
    seed(2025, "T2", "P14362", "道路修复", ["GRAPH.MODELING.GRAPH_ABSTRACTION", "GREEDY.PROOF.EXCHANGE_ARGUMENT", "DATA_STRUCTURE.DSU.SET_MEANING"], "Luogu CSP-S 2025 public list seed; please confirm official order."),
    seed(2025, "T3", "P14363", "谐音替换", ["STRING.PATTERN.BOUNDARY", "DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2025 public list seed; please confirm problem id/order."),
    seed(2025, "T4", "P14364", "员工招聘", ["DP.GENERAL.STATE_TRANSITION", "MATH.COMBINATORICS.CORE", "PARTIAL_SCORE.SUBTASK_ANALYSIS"], "Luogu CSP-S 2025 public list seed; please confirm problem id/order."),
  ];
}

function seed(year: number, slot: Slot, luoguPid: string, title: string, abilities: string[], notes: string) {
  return {
    year,
    slot,
    luoguPid,
    title,
    isNationalOfficial: true,
    notes,
    classificationStatus: notes.includes("confirm") || notes.includes("确认") || year === 2019 || year === 2025 ? "NEEDS_MANUAL_CONFIRMATION" as const : "NEEDS_REVIEW" as const,
    confidence: year === 2019 || year === 2025 ? 0.45 : 0.62,
    mapping: {
      primary: unique(abilities.map((item) => item.split(".")[0])),
      secondary: unique(abilities.map((item) => item.split(".").slice(0, 2).join("."))),
      thirdLevelAbilities: abilities,
      nonKnowledgeSkills: abilities.filter((item) => item.startsWith("PARTIAL_SCORE") || item.startsWith("COMPREHENSIVE")),
    },
  };
}

function inferProblemMapping(slot: Slot, luoguPid: string, review: JsonObject | undefined, seedProblem: ReturnType<typeof getSeedPastProblems>[number] | undefined) {
  const seedMapping = seedProblem?.mapping;
  const primary = splitList(review?.primary);
  const secondary = splitList(review?.secondary);
  const thirdLevelAbilities = splitList(review?.thirdLevelAbilities);
  const nonKnowledgeSkills = splitList(review?.nonKnowledgeSkills);
  const abilities = thirdLevelAbilities.length > 0 ? thirdLevelAbilities : seedMapping?.thirdLevelAbilities ?? fallbackAbilitiesForSlot(slot);
  return {
    primary: primary.length > 0 ? primary : seedMapping?.primary ?? unique(abilities.map((item) => item.split(".")[0])),
    secondary: secondary.length > 0 ? secondary : seedMapping?.secondary ?? unique(abilities.map((item) => item.split(".").slice(0, 2).join("."))),
    thirdLevelAbilities: abilities,
    nonKnowledgeSkills: nonKnowledgeSkills.length > 0 ? nonKnowledgeSkills : seedMapping?.nonKnowledgeSkills ?? abilities.filter((item) => item.startsWith("PARTIAL_SCORE")),
    modelType: seedMapping?.modelType ?? modelTypeForAbilities(abilities),
    requiredTransformations: seedMapping?.transformations ?? transformationsForAbilities(abilities),
    implementationRisks: seedMapping?.risks ?? implementationRisksForAbilities(abilities),
    partialScoreStructure: partialScoreFor(slot, stringField(review?.partialScoreNotes)),
    commonFailureModes: seedMapping?.failures ?? commonFailuresForAbilities(abilities),
    luoguPid,
  };
}

function fallbackAbilitiesForSlot(slot: Slot): string[] {
  if (slot === "T1") return ["PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION", "IMPLEMENTATION.INDEX_BOUNDARY"];
  if (slot === "T2") return ["BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY", "DP.GENERAL.STATE_TRANSITION"];
  if (slot === "T3") return ["DP.GENERAL.STATE_TRANSITION", "PARTIAL_SCORE.SUBTASK_ANALYSIS"];
  return ["COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION", "PARTIAL_SCORE.SUBTASK_ANALYSIS"];
}

function mapModuleAndErrorsToAbilities(moduleName: string, errorTypes: string[], modules: string[] = []): string[] {
  const moduleSet = new Set([moduleName, ...modules].map((item) => item.toLowerCase()));
  const errorSet = new Set(errorTypes);
  const output = new Set<string>();
  if (moduleSet.has("partial_score") || errorSet.has("PARTIAL_SCORE_MISSED")) output.add("PARTIAL_SCORE.SUBTASK_ANALYSIS");
  if (moduleSet.has("math")) {
    output.add(errorSet.has("OVERFLOW_ERROR") ? "MATH.OVERFLOW_RANGE.CORE" : "MATH.FORMULA_DERIVATION.CORE");
    if (errorSet.has("MODEL_ERROR")) output.add("MATH.MODEL_TO_DP.CORE");
  }
  if (moduleSet.has("interval_dp")) {
    output.add("DP.INTERVAL.RECOGNIZE_STRUCTURE");
    output.add("DP.INTERVAL.INIT_AND_ORDER");
  }
  if (moduleSet.has("dp") || moduleSet.has("knapsack_dp") || moduleSet.has("tree_dp")) output.add("DP.GENERAL.STATE_TRANSITION");
  if (moduleSet.has("state_compression_dp")) output.add("DP.STATE_COMPRESSION.MASK_DESIGN");
  if (moduleSet.has("graph")) output.add("GRAPH.MODELING.GRAPH_ABSTRACTION");
  if (moduleSet.has("shortest_path")) output.add("GRAPH.SHORTEST_PATH.STATE_AND_INIT");
  if (moduleSet.has("dsu")) output.add("DATA_STRUCTURE.DSU.SET_MEANING");
  if (moduleSet.has("segment_tree") || moduleSet.has("fenwick_tree")) output.add("DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY");
  if (moduleSet.has("binary_search")) output.add("BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY");
  if (moduleSet.has("string")) output.add("STRING.PATTERN.BOUNDARY");
  if (moduleSet.has("search") || moduleSet.has("dfs_bfs")) output.add("SEARCH.DFS_BFS.PRUNING_AND_STATE");
  if (moduleSet.has("greedy")) output.add("GREEDY.PROOF.EXCHANGE_ARGUMENT");
  if (moduleSet.has("implementation") || errorSet.has("IMPLEMENTATION_RISK")) output.add("IMPLEMENTATION.INDEX_BOUNDARY");
  if (errorSet.has("INIT_ERROR")) output.add("IMPLEMENTATION.INITIALIZATION");
  if (errorSet.has("BOUNDARY_ERROR") || errorSet.has("INDEX_ERROR")) output.add("IMPLEMENTATION.INDEX_BOUNDARY");
  if (errorSet.has("OVERFLOW_ERROR")) output.add("IMPLEMENTATION.INTEGER_OVERFLOW");
  if (errorSet.has("RECURSION_STACK_RISK")) output.add("IMPLEMENTATION.RECURSION_STACK");
  if (errorSet.has("DEBUG_TIMEOUT")) output.add("IMPLEMENTATION.DEBUG_TIMEOUT");
  if (output.size === 0) output.add("PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION");
  return [...output];
}

function historicalWeight(vector: FeatureVector): number {
  if (vector.solved && vector.attemptCount <= 1) return 0.65;
  if (vector.solved && vector.attemptCount <= 3) return 0.5;
  if (vector.solved) return 0.35;
  if (vector.bestScore && vector.bestScore > 0) return 0.3;
  return 0.25;
}

function historicalPerformanceScore(vector: FeatureVector): number {
  if (vector.scorePattern === "ONE_SHOT_AC") return 0.78;
  if (vector.scorePattern === "QUICK_FIX_AC") return 0.65;
  if (vector.scorePattern === "MULTI_FAIL_THEN_AC") return 0.48;
  if (vector.scorePattern === "PARTIAL_TO_AC") return 0.45;
  if (vector.scorePattern === "PARTIAL_STUCK") return 0.22;
  if (vector.scorePattern === "ZERO_STUCK") return 0.08;
  if (vector.solved) return 0.55;
  return 0.18;
}

function cspRecordWeight(record: StudentPastProblemRecord): number {
  if (record.isBlindTest && !record.hasSeenSolution) return 1;
  if (record.hasSeenSolution) return 0.15;
  if (record.hasDone) return 0.65;
  return 0.1;
}

function cspRecordPerformanceScore(record: StudentPastProblemRecord): number {
  if (!record.hasDone) return 0.25;
  if (typeof record.score === "number") return Math.max(0, Math.min(1, record.score / 100));
  if (record.result === "AC") return 0.85;
  if (record.result === "PC") return 0.45;
  return 0.2;
}

function slotRoleFor(slot: Slot): PastProblem["slotRole"] {
  const map: Record<Slot, PastProblem["slotRole"]> = {
    T1: { position: "T1", role: "STABLE_SCORE", firstPrizeTargetScore: { conservative: 85, normal: 95, strong: 100 } },
    T2: { position: "T2", role: "MODELING_TRANSFER", firstPrizeTargetScore: { conservative: 65, normal: 80, strong: 95 } },
    T3: { position: "T3", role: "PARTIAL_SCORE_AND_CORE_ALGORITHM", firstPrizeTargetScore: { conservative: 35, normal: 55, strong: 80 } },
    T4: { position: "T4", role: "STRATEGY_AND_ADVANCED_PARTIAL_SCORE", firstPrizeTargetScore: { conservative: 15, normal: 35, strong: 60 } },
  };
  return map[slot];
}

function partialScoreFor(slot: Slot, manualNote: string): PastProblem["partialScoreStructure"] {
  if (manualNote && manualNote !== "UNKNOWN") return [{ score: 100, condition: manualNote, expectedMethod: "Manual review note" }];
  if (slot === "T1") return [{ score: 100, condition: "full data", expectedMethod: "stable implementation" }];
  if (slot === "T2") return [
    { score: 30, condition: "small or special data", expectedMethod: "brute force / simulation" },
    { score: 70, condition: "main model without hardest optimization", expectedMethod: "core model" },
    { score: 100, condition: "full data", expectedMethod: "complete solution" },
  ];
  return [
    { score: 20, condition: "small data", expectedMethod: "brute force" },
    { score: 50, condition: "special property", expectedMethod: "simplified model" },
    { score: 70, condition: "main subtask", expectedMethod: "near-correct algorithm with limited optimization" },
    { score: 100, condition: "full data", expectedMethod: "complete solution" },
  ];
}

function buildPastProblemFrequencyMatrix(problems: PastProblem[]) {
  return {
    bySlot: Object.fromEntries((["T1", "T2", "T3", "T4"] as Slot[]).map((slot) => [slot, problems.filter((item) => item.slot === slot).length])),
    byPrimary: countBy(problems.flatMap((item) => item.knowledgeMapping.primary)),
    byAbility: countBy(problems.flatMap((item) => item.knowledgeMapping.thirdLevelAbilities)),
  };
}

function renderKnowledgeTree(tree: KnowledgeTree): string {
  return [
    "# CSP-S knowledge ability tree",
    "",
    `Generated at: ${tree.generatedAt}`,
    "",
    ...tree.domains.flatMap((domainItem) => [
      `## ${domainItem.domainId} ${domainItem.name}`,
      "",
      ...domainItem.modules.flatMap((moduleEntry) => [
        `### ${moduleEntry.moduleId} ${moduleEntry.name}`,
        "",
        `Slots: ${moduleEntry.cspRelevance.slots.join(", ")}`,
        "",
        ...moduleEntry.abilities.map((item) => `- ${item.abilityId}: ${item.name}; verify: ${item.verifyMethods.join(" / ")}`),
        "",
      ]),
    ]),
  ].join("\n");
}

function renderPastProblems(problems: PastProblem[]): string {
  return [
    "# CSP-S 2019-2025 past problem benchmark",
    "",
    "| Year | Slot | PID | Title | Status | Abilities |",
    "|---:|---|---|---|---|---|",
    ...problems.map((item) => `| ${item.year} | ${item.slot} | ${item.luoguPid} | ${item.title} | ${item.classification.status} | ${item.knowledgeMapping.thirdLevelAbilities.join("<br>")} |`),
    "",
    "Note: rows with NEEDS_MANUAL_CONFIRMATION must be replaced or confirmed by the manual CSV before the report is used as final evidence.",
  ].join("\n");
}

function renderFirstPrizeGapReport(report: JsonObject, problems: PastProblem[], mastery: SkillMastery[], losses: ExpectedLoss[], abilities: Array<Ability & { domainId: string; moduleId: string }>): string {
  const reliability = report.dataReliability as JsonObject;
  const target = report.target as JsonObject;
  const scoreGap = report.scoreGap as JsonObject;
  const topLosses = losses.slice(0, 12);
  const weakMastery = mastery.filter((item) => ["EXPOSED", "UNSTABLE", "NO_EVIDENCE"].includes(item.masteryLevel)).slice(0, 15);
  return [
    "# CSP-S first-prize target gap report",
    "",
    "## 1. Target definition",
    "",
    `- Target year: ${target.year}`,
    `- Target province: ${target.province}`,
    `- Explicit target score: ${target.explicitTargetScore ?? "not set"}`,
    `- Weekly training hours: ${target.weeklyHours}`,
    `- Safe target score: ${target.safeTargetScore}`,
    `- Target-line confidence: ${target.lineConfidence}`,
    `- Note: ${target.lineNote}`,
    "",
    "Important boundary: this program cannot mathematically guarantee a first prize. It guarantees a closed loop: benchmark -> diagnosis -> blind validation -> training -> re-evaluation. A first-prize claim is allowed only after real blind CSP-S evidence reaches the target line.",
    "",
    "Problem recognition pipeline: Luogu pid is the primary key; every historical submission is grouped by problem id, then merged with code modules, score trajectory, static risks, weakness clusters, CSP-S past-paper mapping, and manual CSV review. If a pid or knowledge tag is uncertain, the conclusion must stay in NEEDS_BLIND_VALIDATION or NEEDS_MANUAL_CONFIRMATION.",
    "",
    "## 2. Data reliability",
    "",
    `- Past benchmark problems: ${reliability.pastProblemCount}`,
    `- Confirmed by manual review: ${reliability.confirmedPastProblems}`,
    `- Need manual confirmation: ${reliability.needsManualConfirmation}`,
    `- CSP-S past problems with your record: ${reliability.cspPastProblemsWithStudentRecord}`,
    `- No-evidence abilities: ${reliability.noEvidenceAbilities}`,
    "",
    "## 3. CSP-S 2019-2025 structure",
    "",
    "| Year | T1 | T2 | T3 | T4 |",
    "|---:|---|---|---|---|",
    ...[2019, 2020, 2021, 2022, 2023, 2024, 2025].map((year) => {
      const row = (["T1", "T2", "T3", "T4"] as Slot[]).map((slot) => problems.find((item) => item.year === year && item.slot === slot));
      return `| ${year} | ${row.map((item) => item ? `${item.luoguPid} ${item.title}` : "-").join(" | ")} |`;
    }),
    "",
    "## 4. Knowledge frequency matrix",
    "",
    ...Object.entries(countBy(problems.flatMap((item) => item.knowledgeMapping.thirdLevelAbilities)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([abilityId, count]) => `- ${abilityId}: ${count}`),
    "",
    "## 5. Your historical evidence coverage",
    "",
    ...weakMastery.map((item) => `- ${item.abilityId}: ${item.masteryLevel}, score=${item.masteryScore}, evidence=${item.evidenceCount}, CSP-past=${item.cspPastProblemCount}, blind=${item.blindTestCount}`),
    "",
    "## 6. CSP-S past-problem completion",
    "",
    ...problems.filter((item) => item.studentRecord).map((item) => `- ${item.year} ${item.slot} ${item.luoguPid}: ${item.studentRecord?.result}, score=${item.studentRecord?.score ?? "unknown"}, blind=${item.studentRecord?.isBlindTest}`),
    problems.some((item) => item.studentRecord) ? "" : "- No manually confirmed CSP-S past-problem records yet.",
    "",
    "## 7. T1/T2/T3/T4 ability judgment",
    "",
    ...(["T1", "T2", "T3", "T4"] as Slot[]).map((slot) => {
      const slotProblems = problems.filter((item) => item.slot === slot);
      const slotAbilities = unique(slotProblems.flatMap((item) => item.knowledgeMapping.thirdLevelAbilities));
      const slotLoss = sum(losses.filter((item) => slotProblems.some((problem) => problem.knowledgeMapping.thirdLevelAbilities.includes(item.abilityId))).map((item) => item.expectedLoss.value));
      return `- ${slot}: abilities=${slotAbilities.length}, expected related loss=${round(slotLoss)}, role=${slotRoleFor(slot).role}`;
    }),
    "",
    "## 8. Confirmed weaknesses",
    "",
    ...topLosses.filter((item) => item.status === "CONFIRMED_WEAKNESS").map(renderLossLine),
    topLosses.some((item) => item.status === "CONFIRMED_WEAKNESS") ? "" : "- None yet. Current evidence still needs CSP-S blind validation.",
    "",
    "## 9. Weaknesses needing validation",
    "",
    ...topLosses.filter((item) => item.status === "NEEDS_BLIND_VALIDATION").map(renderLossLine),
    "",
    "## 10. Watch or downgraded assumptions",
    "",
    ...losses.filter((item) => item.status === "WATCH" || item.status === "INSUFFICIENT_EVIDENCE").slice(0, 8).map(renderLossLine),
    "",
    "## 11. Expected score loss ranking",
    "",
    "| Rank | Ability | Level | Loss | Confidence | Impact |",
    "|---:|---|---|---:|---:|---|",
    ...topLosses.map((item, index) => `| ${index + 1} | ${item.abilityId} | ${item.masteryLevel} | ${item.expectedLoss.value} | ${item.expectedLoss.confidence} | ${item.firstPrizeImpact} |`),
    "",
    "## 12. Gap to first-prize safety line",
    "",
    `- Critical/high expected loss: ${scoreGap.criticalExpectedLoss}`,
    `- Risk reduction target before claiming target-score readiness: ${scoreGap.riskReductionTarget}`,
    `- Readiness proxy: ${scoreGap.readiness}`,
    `- Verdict: ${scoreGap.verdict}`,
    "",
    "## 13. Next diagnostic past problems",
    "",
    ...arrayOfObjects(report.diagnosticProblems).map((item) => `- ${getString(item, "year")} ${getString(item, "slot")} ${getString(item, "luoguPid")} ${getString(item, "title")}: validate ${getString(item, "targetAbilityId")}; time ${getString(item, "timeLimitMinutes")} min.`),
    "",
    "## 14. Next-stage training plan",
    "",
    ...topLosses.slice(0, 6).map((item, index) => `${index + 1}. ${item.recommendedAction}`),
    "",
    "## Appendix. Ability catalog used",
    "",
    ...abilities.slice(0, 60).map((item) => `- ${item.abilityId}: ${item.name}`),
  ].join("\n");
}

function renderLossLine(item: ExpectedLoss): string {
  return `- ${item.abilityId}: ${item.masteryLevel}, expected loss ${item.expectedLoss.value}, evidence ${item.historicalEvidenceCount}/${item.pastProblemEvidenceCount}/${item.blindTestCount}, action: ${item.recommendedAction}`;
}

async function ensureCsvTemplates(options: CspBenchmarkOptions): Promise<void> {
  await ensureBenchmarkDir(options);
  await writeIfMissing(path.join(options.benchmarkDir, "manual_past_problem_index.csv"), [
    "year,slot,title,luoguPid,problemUrl,officialUrl,isNationalOfficial,notes",
  ].join("\n") + "\n");
  await writeIfMissing(path.join(options.benchmarkDir, "manual_knowledge_review.csv"), [
    "year,slot,luoguPid,primary,secondary,thirdLevelAbilities,nonKnowledgeSkills,partialScoreNotes,classificationConfidence,reviewerNote",
  ].join("\n") + "\n");
  await writeIfMissing(path.join(options.benchmarkDir, "student_past_problem_records.csv"), [
    "year,slot,luoguPid,hasDone,doneDate,isBlindTest,hasSeenSolution,result,score,timeMinutes,submissionCount,errorTypes,reviewNote",
  ].join("\n") + "\n");
  await writeIfMissing(path.join(options.benchmarkDir, "province_first_prize_lines.csv"), [
    "year,province,nationalBaseline,provinceLine,sourceUrl,notes",
    "2024,UNKNOWN,165,,,Official national baseline from published CSP-S rating rule; replace provinceLine when known.",
    "2025,UNKNOWN,131,,,Official national baseline from published CSP-S rating rule; replace provinceLine when known.",
  ].join("\n") + "\n");
}

async function loadProblemIndexRows(options: CspBenchmarkOptions): Promise<JsonObject[]> {
  const manualRows = await readCsvIfExists(path.join(options.benchmarkDir, "manual_past_problem_index.csv"));
  if (manualRows.length > 0) return manualRows;
  return getSeedPastProblems().map((item) => ({
    year: item.year,
    slot: item.slot,
    title: item.title,
    luoguPid: item.luoguPid,
    problemUrl: `https://www.luogu.com.cn/problem/${item.luoguPid}`,
    officialUrl: "",
    isNationalOfficial: item.isNationalOfficial,
    notes: item.notes,
  }));
}

async function loadKnowledgeReviewRows(options: CspBenchmarkOptions): Promise<Map<string, JsonObject>> {
  const rows = await readCsvIfExists(path.join(options.benchmarkDir, "manual_knowledge_review.csv"));
  const output = new Map<string, JsonObject>();
  for (const row of rows) {
    const year = stringField(row.year);
    const slot = stringField(row.slot);
    const pid = stringField(row.luoguPid);
    output.set(`${year}:${slot}:${pid}`, row);
    output.set(pid, row);
  }
  return output;
}

async function loadStudentPastProblemRecords(options: CspBenchmarkOptions): Promise<StudentPastProblemRecord[]> {
  const rows = await readCsvIfExists(path.join(options.benchmarkDir, "student_past_problem_records.csv"));
  return rows.map((row) => ({
    year: numberField(row.year, 0),
    slot: normalizeSlot(row.slot),
    luoguPid: stringField(row.luoguPid),
    hasDone: booleanField(row.hasDone),
    doneDate: stringField(row.doneDate),
    isBlindTest: booleanField(row.isBlindTest),
    hasSeenSolution: booleanField(row.hasSeenSolution),
    result: stringField(row.result),
    score: nullableNumber(row.score),
    timeMinutes: nullableNumber(row.timeMinutes),
    submissionCount: nullableNumber(row.submissionCount),
    errorTypes: splitList(row.errorTypes),
    reviewNote: stringField(row.reviewNote),
    source: "manual" as const,
  })).filter((item) => item.luoguPid);
}

async function inferStudentRecordsFromHistory(options: CspBenchmarkOptions): Promise<StudentPastProblemRecord[]> {
  const vectors = await loadFeatureVectors(options);
  const seedPids = new Set(getSeedPastProblems().map((item) => item.luoguPid));
  return vectors.filter((item) => seedPids.has(item.problemPid)).map((vector) => {
    const seedProblem = getSeedPastProblems().find((item) => item.luoguPid === vector.problemPid);
    return {
      year: seedProblem?.year ?? 0,
      slot: seedProblem?.slot ?? "T1",
      luoguPid: vector.problemPid,
      hasDone: true,
      doneDate: "",
      isBlindTest: false,
      hasSeenSolution: false,
      result: vector.finalResult,
      score: vector.bestScore,
      timeMinutes: null,
      submissionCount: vector.attemptCount,
      errorTypes: vector.candidateErrorTypes,
      reviewNote: "Inferred from Luogu historical submissions. This is not blind CSP-S proof.",
      source: "history_inference" as const,
    };
  });
}

async function loadWeaknesses(options: CspBenchmarkOptions): Promise<Weakness[]> {
  const value = await readJsonIfExists<{ topWeaknesses?: Weakness[] }>(path.join(options.diagnosisDir, "weakness_summary.json"), { topWeaknesses: [] });
  return (value.topWeaknesses ?? []).map((item) => ({
    weaknessId: String(item.weaknessId ?? ""),
    title: String(item.title ?? ""),
    severity: Number(item.severity ?? 0),
    relatedModules: arrayOfStrings(item.relatedModules),
    relatedErrorTypes: arrayOfStrings(item.relatedErrorTypes),
    evidenceProblems: arrayOfStrings(item.evidenceProblems),
    problemCount: Number(item.problemCount ?? 0),
  }));
}

async function loadFeatureVectors(options: CspBenchmarkOptions): Promise<FeatureVector[]> {
  const value = await readJsonIfExists<{ items?: FeatureVector[] }>(path.join(options.diagnosisDir, "problem_feature_vectors.json"), { items: [] });
  return (value.items ?? []).map((item) => ({
    problemPid: String(item.problemPid ?? ""),
    problemTitle: item.problemTitle ?? null,
    attemptCount: Number(item.attemptCount ?? 0),
    solved: Boolean(item.solved),
    bestScore: typeof item.bestScore === "number" ? item.bestScore : null,
    finalResult: String(item.finalResult ?? ""),
    scoreTrajectory: Array.isArray(item.scoreTrajectory) ? item.scoreTrajectory.map(Number).filter(Number.isFinite) : [],
    scorePattern: String(item.scorePattern ?? ""),
    resultPattern: String(item.resultPattern ?? ""),
    isRecent: Boolean(item.isRecent),
    primaryModule: String(item.primaryModule ?? ""),
    codeModules: arrayOfStrings(item.codeModules),
    riskFlags: arrayOfStrings(item.riskFlags),
    candidateErrorTypes: arrayOfStrings(item.candidateErrorTypes),
    cspAbilityRoles: arrayOfStrings(item.cspAbilityRoles),
    difficultyBand: String(item.difficultyBand ?? ""),
  })).filter((item) => item.problemPid);
}

async function loadProvinceLines(options: CspBenchmarkOptions): Promise<JsonObject[]> {
  return readCsvIfExists(path.join(options.benchmarkDir, "province_first_prize_lines.csv"));
}

function calculateTargetLine(options: CspBenchmarkOptions, rows: JsonObject[]) {
  if (options.targetScore) {
    return {
      safeTargetScore: Math.min(400, options.targetScore),
      confidence: 0.95,
      note: "Explicit target score from --targetScore. Use this when the goal is a concrete score rather than a province-line estimate.",
    };
  }
  const provinceRows = rows.filter((row) => stringField(row.province) === options.targetProvince && nullableNumber(row.provinceLine) !== null);
  const nationalRows = rows.filter((row) => nullableNumber(row.nationalBaseline) !== null);
  const values = (provinceRows.length > 0 ? provinceRows.map((row) => nullableNumber(row.provinceLine) ?? 0) : nationalRows.map((row) => nullableNumber(row.nationalBaseline) ?? 0)).filter((value) => value > 0);
  if (values.length === 0) {
    return { safeTargetScore: 240 + options.safetyMargin, confidence: 0.2, note: "No first-prize line data found. Use conservative placeholder." };
  }
  const maxLine = Math.max(...values);
  return {
    safeTargetScore: Math.min(400, maxLine + options.safetyMargin),
    confidence: provinceRows.length > 0 ? 0.75 : 0.45,
    note: provinceRows.length > 0 ? "Based on target-province line CSV." : "Based on national baseline CSV plus safety margin; replace with province lines when available.",
  };
}

async function readOrBuildKnowledgeTree(options: CspBenchmarkOptions): Promise<KnowledgeTree> {
  const filePath = path.join(options.benchmarkDir, "knowledge_ability_tree.json");
  if (await exists(filePath)) return readJson<KnowledgeTree>(filePath);
  return buildKnowledgeTree(options);
}

async function readOrBuildPastProblemDb(options: CspBenchmarkOptions): Promise<{ problems: PastProblem[] }> {
  const filePath = path.join(options.benchmarkDir, "past_problems_2019_2025.json");
  if (await exists(filePath)) return readJson<{ problems: PastProblem[] }>(filePath);
  return buildPastProblemDb(options);
}

async function readOrBuildSkillEvidence(options: CspBenchmarkOptions): Promise<SkillEvidence[]> {
  const filePath = path.join(options.benchmarkDir, "student_skill_evidence.json");
  if (await exists(filePath)) return (await readJson<{ items: SkillEvidence[] }>(filePath)).items;
  return mapStudentEvidenceToSkills(options);
}

async function readOrBuildSkillMastery(options: CspBenchmarkOptions): Promise<SkillMastery[]> {
  const filePath = path.join(options.benchmarkDir, "skill_mastery.json");
  if (await exists(filePath)) return (await readJson<{ items: SkillMastery[] }>(filePath)).items;
  return calculateSkillMastery(options);
}

async function readOrBuildExpectedLoss(options: CspBenchmarkOptions): Promise<ExpectedLoss[]> {
  const filePath = path.join(options.benchmarkDir, "expected_score_loss.json");
  if (await exists(filePath)) return (await readJson<{ items: ExpectedLoss[] }>(filePath)).items;
  return calculateExpectedScoreLoss(options);
}

function flattenAbilities(tree: KnowledgeTree): Array<Ability & { domainId: string; moduleId: string }> {
  const entries = [
    ...tree.domains.flatMap((domainItem) => domainItem.modules.flatMap((moduleEntry) => moduleEntry.abilities.map((abilityEntry) => ({
      ...abilityEntry,
      domainId: domainItem.domainId,
      moduleId: moduleEntry.moduleId,
    })))),
    ...tree.nonKnowledgeSkills.map((abilityEntry) => ({ ...abilityEntry, domainId: "NON_KNOWLEDGE_SKILL", moduleId: "NON_KNOWLEDGE_SKILL.EXTRA" })),
  ];
  return [...new Map(entries.map((item) => [item.abilityId, item])).values()];
}

function masteryLevelFor(score: number, evidenceCount: number): MasteryLevel {
  if (evidenceCount === 0) return "NO_EVIDENCE";
  if (score < 0.2) return "EXPOSED";
  if (score < 0.4) return "UNSTABLE";
  if (score < 0.6) return "BASIC";
  if (score < 0.78) return "TRANSFERABLE";
  return "CONTEST_STABLE";
}

function evidenceLevelFor(evidenceCount: number, cspCount: number, blindCount: number): SkillMastery["evidenceLevel"] {
  if (evidenceCount === 0) return "NO_EVIDENCE";
  if (blindCount >= 3 || cspCount >= 4) return "STRONG";
  if (evidenceCount >= 8 || cspCount >= 1) return "MEDIUM";
  return "WEAK";
}

function statusForLoss(skill: SkillMastery | undefined, value: number): ExpectedLoss["status"] {
  if (!skill || skill.evidenceCount === 0) return "INSUFFICIENT_EVIDENCE";
  if (skill.blindTestCount === 0 && value >= 4) return "NEEDS_BLIND_VALIDATION";
  if (skill.negativeEvidenceCount >= 5 && value >= 5) return "CONFIRMED_WEAKNESS";
  return "WATCH";
}

function impactForLoss(value: number): ExpectedLoss["firstPrizeImpact"] {
  if (value >= 12) return "CRITICAL";
  if (value >= 6) return "HIGH";
  if (value >= 2.5) return "MEDIUM";
  return "LOW";
}

function recommendationForLoss(abilityId: string, problems: PastProblem[], skill: SkillMastery | undefined): string {
  const slots = unique(problems.map((item) => item.slot)).join("/");
  const firstProblems = problems.slice(0, 3).map((item) => `${item.year}${item.slot}${item.luoguPid}`).join(", ");
  if (!skill || skill.blindTestCount === 0) return `先用 ${slots} 真题盲测验证 ${abilityId}，候选：${firstProblems}。未盲测前不要把它当成已确认短板。`;
  if (abilityId.includes("PARTIAL_SCORE")) return `安排 3 道 T3/T4 真题做 30/50/70/100 部分分路线训练，并记录实际得分是否命中预测。`;
  if (abilityId.includes("IMPLEMENTATION")) return `做提交前实现风险清单训练：边界、初始化、溢出、多测清空、对拍。`;
  return `用 ${firstProblems} 做同能力迁移训练：先写模型与复杂度，再编码，目标提交次数 <= 2。`;
}

function slotImpactFor(slot: Slot): number {
  return { T1: 0.9, T2: 1.05, T3: 1.25, T4: 1.35 }[slot];
}

function firstPrizeSensitivityFor(problems: PastProblem[]): number {
  if (problems.some((item) => item.slot === "T1")) return 1.2;
  if (problems.some((item) => item.slot === "T2")) return 1.15;
  if (problems.some((item) => item.slot === "T3")) return 1.1;
  return 1.0;
}

function unrecoveredRatioFor(abilityId: string, negativeCount: number): number {
  const base = abilityId.includes("PARTIAL_SCORE") ? 0.85 : abilityId.includes("IMPLEMENTATION") ? 0.55 : 0.7;
  return round(Math.min(0.95, base + negativeCount * 0.01));
}

function modelTypeForAbilities(abilities: string[]): string[] {
  return unique(abilities.map((item) => {
    if (item.startsWith("DP")) return "dynamic_programming";
    if (item.startsWith("GRAPH")) return "graph_model";
    if (item.startsWith("MATH")) return "math_model";
    if (item.startsWith("GREEDY")) return "greedy";
    if (item.startsWith("STRING")) return "string_model";
    return "implementation_or_strategy";
  }));
}

function transformationsForAbilities(abilities: string[]): string[] {
  const output: string[] = [];
  if (abilities.some((item) => item.startsWith("DP"))) output.push("problem statement -> state definition -> transition order");
  if (abilities.some((item) => item.startsWith("GRAPH"))) output.push("entities/relations -> nodes/edges/weights");
  if (abilities.some((item) => item.startsWith("MATH"))) output.push("small cases -> formula/invariant -> algorithm");
  if (abilities.some((item) => item.includes("PARTIAL_SCORE"))) output.push("constraints -> 30/50/70/100 routes");
  return output.length > 0 ? output : ["statement -> algorithm -> implementation"];
}

function implementationRisksForAbilities(abilities: string[]): string[] {
  const risks = new Set<string>(["IMPLEMENTATION.INDEX_BOUNDARY", "IMPLEMENTATION.INTEGER_OVERFLOW"]);
  if (abilities.some((item) => item.startsWith("DP"))) risks.add("IMPLEMENTATION.INITIALIZATION");
  if (abilities.some((item) => item.startsWith("GRAPH"))) risks.add("IMPLEMENTATION.RECURSION_STACK");
  return [...risks];
}

function commonFailuresForAbilities(abilities: string[]): string[] {
  return unique(abilities.flatMap((item) => {
    if (item.startsWith("DP")) return ["STATE_ERROR", "INIT_ERROR", "ENUMERATION_ORDER_ERROR"];
    if (item.startsWith("GRAPH")) return ["MODEL_ERROR", "COMPLEXITY_ERROR"];
    if (item.startsWith("MATH")) return ["FORMULA_ERROR", "OVERFLOW_ERROR"];
    if (item.includes("PARTIAL_SCORE")) return ["PARTIAL_SCORE_MISSED", "STRATEGY_ERROR"];
    return ["BOUNDARY_ERROR"];
  }));
}

function mathModuleName(name: string): string {
  const map: Record<string, string> = {
    NUMBER_THEORY: "Number theory",
    MODULAR: "Modular arithmetic",
    GCD_FACTOR: "GCD and factorization",
    COMBINATORICS: "Combinatorics",
    COUNTING: "Counting",
    RECURRENCE: "Recurrence",
    FORMULA_DERIVATION: "Formula derivation",
    INVARIANT: "Invariant",
    CONSTRUCTION: "Construction",
    PERIODICITY: "Periodicity",
    OVERFLOW_RANGE: "Overflow and range",
    MODEL_TO_DP: "Math model to DP",
  };
  return map[name] ?? name;
}

function mathErrorTypes(name: string): string[] {
  if (name === "OVERFLOW_RANGE") return ["OVERFLOW_ERROR", "BOUNDARY_ERROR"];
  if (name === "MODEL_TO_DP") return ["MODEL_ERROR", "STATE_ERROR"];
  return ["MODEL_ERROR", "FORMULA_ERROR"];
}

function slotOrder(slot: Slot): number {
  return { T1: 1, T2: 2, T3: 3, T4: 4 }[slot];
}

function normalizeSlot(value: unknown): Slot {
  const text = String(value ?? "").toUpperCase();
  if (text === "T2" || text === "T3" || text === "T4") return text;
  return "T1";
}

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "")
    .split(/[;|,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readCsvIfExists(filePath: string): Promise<JsonObject[]> {
  if (!(await exists(filePath))) return [];
  const text = await fs.readFile(filePath, "utf8");
  return parseCsv(text);
}

function parseCsv(text: string): JsonObject[] {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (rows.length <= 1) return [];
  const headers = rows[0]?.map((item) => item.trim()) ?? [];
  return rows.slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

async function ensureBenchmarkDir(options: CspBenchmarkOptions): Promise<void> {
  await ensureDir(options.benchmarkDir);
}

async function writeIfMissing(filePath: string, content: string): Promise<void> {
  if (await exists(filePath)) return;
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `\uFEFF${content}`, "utf8");
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

async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  if (!(await exists(filePath))) return fallback;
  return readJson<T>(filePath);
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function stringField(value: unknown): string {
  return String(value ?? "").trim();
}

function numberField(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanField(value: unknown): boolean {
  const text = String(value ?? "").trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(text);
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function arrayOfObjects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(source: unknown, key: string): string {
  if (!isObject(source)) return "";
  const value = source[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const output = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = output.get(key) ?? [];
    group.push(item);
    output.set(key, group);
  }
  return output;
}

function countBy(items: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items.filter(Boolean)) counts[item] = (counts[item] ?? 0) + 1;
  return counts;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function sum(values: number[]): number {
  return values.filter(Number.isFinite).reduce((total, value) => total + value, 0);
}

function avg(values: number[]): number {
  const filtered = values.filter(Number.isFinite);
  return filtered.length > 0 ? sum(filtered) / filtered.length : 0;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function optionalPositiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}
