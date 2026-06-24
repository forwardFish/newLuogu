import { strict as assert } from "assert";
import { promises as fs } from "fs";
import path from "path";

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const diagnosisDir = path.join(process.cwd(), "data", "diagnosis");
  const problemBankDir = path.join(process.cwd(), "data", "problem-bank");
  const generatedDir = path.join(process.cwd(), "data", "generated-problems");

  const vectors = await readJson<{ totalProblems: number; items: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "problem_feature_vectors.json"),
  );
  const patterns = await readJson<{ items: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "problem_pattern_tags.json"),
  );
  const clusters = await readJson<{ clusters: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "problem_clusters.json"),
  );
  const representatives = await readJson<{ items: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "cluster_representatives.json"),
  );
  const packs = await readJson<{ items: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "llm_evidence_packs.json"),
  );
  const clusterDiagnosis = await readJson<{ provider: Record<string, unknown>; items: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "cluster_llm_diagnosis.json"),
  );
  const clusterDiagnosisTraces = await readJson<{ provider: Record<string, unknown>; traces: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "cluster_llm_diagnosis_traces.json"),
  );
  const problemDiagnosis = await readJson<{ totalProblems: number; items: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "problem_diagnosis.json"),
  );
  const weakness = await readJson<{ topWeaknesses: Array<Record<string, unknown>> }>(
    path.join(diagnosisDir, "weakness_summary.json"),
  );
  const selected = await readJson<{ items: Array<Record<string, unknown>> }>(
    path.join(problemBankDir, "selected_training_tasks.json"),
  );
  const taskPack = await readJson<{ days: Array<Record<string, unknown>> }>(
    path.join(problemBankDir, "task_pack_7d.json"),
  );

  assert.equal(vectors.items.length, vectors.totalProblems, "feature vector count mismatch");
  assert.ok(vectors.items.length >= 800, "should cover all historical problems");
  assert.equal(patterns.items.length, vectors.items.length, "pattern count should match vectors");
  assert.ok(clusters.clusters.length > 0, "clusters should not be empty");
  assert.equal(representatives.items.length, clusters.clusters.length, "representatives should match clusters");
  assert.equal(packs.items.length, clusters.clusters.length, "evidence packs should match clusters");
  assert.equal(clusterDiagnosis.items.length, clusters.clusters.length, "cluster diagnosis should match clusters");
  assert.equal(clusterDiagnosis.provider.providerId, "deepseek", "cluster diagnosis should include DeepSeek provider metadata");
  assert.equal(clusterDiagnosisTraces.provider.providerId, "deepseek", "cluster diagnosis traces should include DeepSeek provider metadata");
  assert.equal(problemDiagnosis.items.length, vectors.items.length, "diagnosis should cover all problems");
  assert.ok(weakness.topWeaknesses.length > 0, "weakness summary should not be empty");
  assert.ok(selected.items.length > 0, "selected tasks should not be empty");
  assert.ok(taskPack.days.length >= 7, "task pack should cover 7 days");

  const firstGenerated = await fs.readdir(generatedDir);
  assert.ok(firstGenerated.length > 0, "generated problem draft directory should not be empty");
  const metadataExists = await exists(path.join(generatedDir, firstGenerated[0] ?? "", "metadata.json"));
  assert.ok(metadataExists, "generated draft should include metadata.json");

  console.log(
    JSON.stringify(
      {
        problems: vectors.items.length,
        clusters: clusters.clusters.length,
        clusterDiagnosisSource: clusterDiagnosis.items[0]?.source,
        deepSeekKeyPresent: clusterDiagnosis.provider.keyPresent,
        weaknesses: weakness.topWeaknesses.length,
        selectedTaskGroups: selected.items.length,
        taskPackDays: taskPack.days.length,
        generatedDrafts: firstGenerated.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
