import { promises as fs } from "fs";
import path from "path";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

type Scores = {
  t1Stability: number;
  t2Modeling: number;
  t3PartialScore: number;
  t4Strategy: number;
  overall: number;
};

type TrainingProfile = {
  currentScores: Scores;
  currentDiagnosis: {
    summary: string;
    weaknesses: string[];
  };
  highValueReviewProblems: Array<{
    problemPid: string;
    attemptCount: number;
    bestScore: number | null;
    finalResult: string;
    reviewReason: string;
  }>;
};

type TrainingPriority = {
  priorityWeights: Record<string, number>;
  oldProblemReviewWeight: number;
  newProblemWeight: number;
  moduleWeights: Record<string, number>;
};

type TrainingTask = {
  id: string;
  module: string;
  difficulty: string;
  selectionRule: string;
  trainingGoal: string;
  timeLimitMinutes: number;
};

type TrainingPlan = {
  daysPlan: Array<{
    day: number;
    theme: string;
    targetAbility: string;
    why: string;
    tasks: TrainingTask[];
  }>;
};

type Readiness = {
  overallReadiness: string;
  criteria: Record<string, { target: unknown; actual: unknown; passed: boolean }>;
  explanation: string;
};

async function readJson<T>(fileName: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "training", fileName);
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function percent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function scoreLevel(score: number) {
  if (score >= 85) return "强";
  if (score >= 75) return "可用";
  if (score >= 70) return "需补强";
  return "短板";
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "暂无";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#f6f7f9",
  color: "#172033",
  padding: "24px",
};

const shell: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gap: 18,
};

const section: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8dee8",
  borderRadius: 8,
  padding: 18,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const metricCard: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8dee8",
  borderRadius: 8,
  padding: 14,
  display: "grid",
  gap: 8,
};

const badge: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid #c8d2e1",
  borderRadius: 999,
  padding: "3px 8px",
  fontSize: 12,
  background: "#eef3f8",
};

export default async function TrainingPage() {
  const [profile, priority, plan, readiness] = await Promise.all([
    readJson<TrainingProfile>("training_profile.json"),
    readJson<TrainingPriority>("training_priority.json"),
    readJson<TrainingPlan>("training_task_plan_7d.json"),
    readJson<Readiness>("readiness_checklist.json"),
  ]);

  if (!profile || !priority || !plan || !readiness) {
    return (
      <main style={page}>
        <div style={shell}>
          <section style={section}>
            <h1>训练闭环结果</h1>
            <p>还没有找到完整的训练结果文件。</p>
            <pre style={{ background: "#101828", color: "#f9fafb", padding: 16, overflow: "auto" }}>
              pnpm train:all
            </pre>
          </section>
        </div>
      </main>
    );
  }

  const scores = [
    ["T1 稳定拿分", profile.currentScores.t1Stability, "基础题和中等偏简单题的稳定 AC 能力"],
    ["T2 建模转化", profile.currentScores.t2Modeling, "中档题建模、算法选择和转化能力"],
    ["T3 部分分策略", profile.currentScores.t3PartialScore, "难题中拆子任务、拿 30/50/70 分的能力"],
    ["T4 综合策略", profile.currentScores.t4Strategy, "模拟赛时间分配、止损和取舍能力"],
  ] as const;

  const moduleWeights = Object.entries(priority.moduleWeights).slice(0, 10);

  return (
    <main style={page}>
      <div style={shell}>
        <header style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 30 }}>CSP-S 一等奖训练闭环</h1>
              <p style={{ margin: "8px 0 0", color: "#526071" }}>{profile.currentDiagnosis.summary}</p>
            </div>
            <div style={{ ...metricCard, minWidth: 190 }}>
              <span style={{ color: "#526071", fontSize: 13 }}>Readiness</span>
              <strong style={{ fontSize: 24 }}>{readiness.overallReadiness}</strong>
              <span style={{ color: "#526071", fontSize: 13 }}>综合分 {profile.currentScores.overall}</span>
            </div>
          </div>
        </header>

        <section style={grid}>
          {scores.map(([name, value, note]) => (
            <div key={name} style={metricCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#526071" }}>{name}</span>
                <span style={badge}>{scoreLevel(value)}</span>
              </div>
              <strong style={{ fontSize: 32 }}>{value}</strong>
              <div style={{ height: 8, background: "#e6ebf2", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, value))}%`,
                    height: "100%",
                    background: value >= 80 ? "#0f766e" : value >= 70 ? "#b7791f" : "#b42318",
                  }}
                />
              </div>
              <span style={{ color: "#526071", fontSize: 13 }}>{note}</span>
            </div>
          ))}
        </section>

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>当前短板</h2>
          <div style={grid}>
            {profile.currentDiagnosis.weaknesses.map((item) => (
              <div key={item} style={{ ...metricCard, background: "#fffdf7" }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>训练比例</h2>
          <div style={grid}>
            <div style={metricCard}>
              <span>T1 稳定性</span>
              <strong>{percent(priority.priorityWeights.t1Stability)}</strong>
            </div>
            <div style={metricCard}>
              <span>T2 建模转化</span>
              <strong>{percent(priority.priorityWeights.t2Modeling)}</strong>
            </div>
            <div style={metricCard}>
              <span>T3 部分分</span>
              <strong>{percent(priority.priorityWeights.t3PartialScore)}</strong>
            </div>
            <div style={metricCard}>
              <span>T4 模拟赛</span>
              <strong>{percent(priority.priorityWeights.t4Strategy)}</strong>
            </div>
            <div style={metricCard}>
              <span>旧题复盘</span>
              <strong>{percent(priority.oldProblemReviewWeight)}</strong>
            </div>
            <div style={metricCard}>
              <span>新题训练</span>
              <strong>{percent(priority.newProblemWeight)}</strong>
            </div>
          </div>
        </section>

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>优先模块</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {moduleWeights.map(([name, weight]) => (
              <span key={name} style={badge}>
                {name} · {weight}
              </span>
            ))}
          </div>
        </section>

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>下一步 7 天计划</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {plan.daysPlan.map((day) => (
              <article key={day.day} style={metricCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      Day {day.day}：{day.theme}
                    </h3>
                    <p style={{ color: "#526071", marginBottom: 0 }}>{day.why}</p>
                  </div>
                  <span style={badge}>{day.targetAbility}</span>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {day.tasks.map((task) => (
                    <div key={task.id} style={{ borderTop: "1px solid #edf1f5", paddingTop: 10 }}>
                      <strong>
                        {task.id} · {task.module} · {task.difficulty}
                      </strong>
                      <div style={{ color: "#526071", marginTop: 4 }}>选题标准：{task.selectionRule}</div>
                      <div style={{ color: "#526071", marginTop: 4 }}>训练目标：{task.trainingGoal}</div>
                      <div style={{ color: "#526071", marginTop: 4 }}>限时：{task.timeLimitMinutes} 分钟</div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>优先复盘旧题</h2>
          <div style={grid}>
            {profile.highValueReviewProblems.slice(0, 8).map((problem) => (
              <div key={problem.problemPid} style={metricCard}>
                <strong>{problem.problemPid}</strong>
                <span style={{ color: "#526071" }}>
                  提交 {problem.attemptCount} 次 · {problem.finalResult} · 最高分 {problem.bestScore ?? "未知"}
                </span>
                <span>{problem.reviewReason}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>达标验证</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {Object.entries(readiness.criteria).map(([name, item]) => (
              <div
                key={name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 1fr) minmax(160px, 1fr) minmax(160px, 1fr) 80px",
                  gap: 8,
                  alignItems: "center",
                  borderBottom: "1px solid #edf1f5",
                  padding: "8px 0",
                }}
              >
                <strong>{name}</strong>
                <span>目标：{formatValue(item.target)}</span>
                <span>实际：{formatValue(item.actual)}</span>
                <span style={{ ...badge, justifySelf: "start", background: item.passed ? "#e7f6ee" : "#fff7ed" }}>
                  {item.passed ? "通过" : "未达"}
                </span>
              </div>
            ))}
          </div>
          <p style={{ color: "#526071" }}>{readiness.explanation}</p>
        </section>
      </div>
    </main>
  );
}
