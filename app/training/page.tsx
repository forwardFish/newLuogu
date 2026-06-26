import { promises as fs } from "fs";
import path from "path";
import type { CSSProperties, ReactNode } from "react";

export const dynamic = "force-dynamic";

type ScorePart = {
  targetScore: number;
  currentEstimate: number;
  gap: number;
  role: string;
  trainingPriority?: string;
};

type GoalScorePlan = {
  targetScore: number;
  weeklyHours: number;
  scoreBreakdown: Record<string, ScorePart>;
  calibration?: {
    source: string;
    method: string;
    baselineYear: number;
    baselineExamName: string;
    baselineTotalScore: number;
    rawEstimateTotal: number;
    calibratedTotal: number;
    confidence: string;
    note: string;
  } | null;
};

type DailyTask = {
  order: number;
  type: string;
  problemPid?: string;
  problemId?: string;
  contentId?: string;
  durationMinutes: number;
  goal: string;
  passSignal?: string;
};

type DailyTrainingPlan = {
  date: string;
  targetScore: number;
  todayGoal: string;
  whyToday: string[];
  tasks: DailyTask[];
  passCriteria: string[];
};

type TrainingSettlement = {
  date: string;
  targetScore: number;
  today: {
    completedTasks: number;
    xpGained: number;
    riskReduced: number;
    scoreProxyBefore: number;
    scoreProxyAfter: number;
    distanceBefore: number;
    distanceAfter: number;
    distanceDelta: number;
  };
  level: {
    before: number;
    after: number;
    title: string;
    upgraded: boolean;
    xpBefore: number;
    xpAfter: number;
    nextLevelXp: number;
  };
  abilityChanges: Array<{
    unitId: string;
    title: string;
    beforeStatus: string;
    afterStatus: string;
    todayScoreAverage: number;
    todayProblems: string[];
    riskReduced: number;
    message: string;
  }>;
  evidence: string[];
  nextAdjustment: {
    action: string;
    reason: string;
    nextUnitId: string;
    nextUnitTitle: string;
  };
};

type MasteryReport = {
  items: Array<{
    unitId: string;
    title: string;
    status: string;
    estimatedLoss: number;
    completedTasks: number;
    averageScore: number;
    nextAction: string;
  }>;
};

type PastProblemRecord = {
  result?: string;
  score?: number;
  submissionCount?: number;
  isBlindTest?: boolean;
  source?: string;
};

type PastProblem = {
  year: number;
  slot: string;
  luoguPid: string;
  title: string;
  studentRecord?: PastProblemRecord | null;
};

type PastProblemDb = {
  problems?: PastProblem[];
};

type SlotEvidence = {
  slot: string;
  modelEstimate: number;
  targetScore: number;
  records: Array<{
    year: number;
    luoguPid: string;
    title: string;
    result: string;
    score: number | null;
    source: string;
    submissionCount: number | null;
  }>;
  averageScore: number | null;
  sourceNote: string;
};

async function readData<T>(relativePath: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), "data", ...relativePath.split("/"));
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function formatNumber(value: number | undefined, digits = 1) {
  return Number.isFinite(value) ? Number(value).toFixed(digits).replace(/\.0$/, "") : "0";
}

function percent(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    NOT_STARTED: "未开始",
    LEARNING: "学习中",
    PRACTICING: "练习中",
    UNSTABLE: "不稳定",
    PASSED_BASIC: "基础通过",
    PASSED_TRANSFER: "迁移通过",
    CONTEST_READY: "考场可用",
  };
  return labels[status] ?? status;
}

function taskLabel(type: string) {
  const labels: Record<string, string> = {
    CONCEPT_EXPLANATION: "理解模型",
    PRACTICE_BASIC: "基础题",
    PRACTICE_STANDARD: "标准题",
    MUTATION: "变式迁移",
    GENERATE_DIAGNOSTIC: "诊断题",
    CSP_STYLE_PROBLEM: "真题验证",
    REVIEW: "复盘结算",
  };
  return labels[type] ?? type;
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    ADVANCE_OR_TRANSFER: "继续推进 / 进入迁移",
    REDO_AND_REVIEW: "重做复盘",
  };
  return labels[action] ?? action;
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#f4f6fa",
  color: "#142033",
  padding: "24px",
};

const shell: CSSProperties = {
  maxWidth: 1220,
  margin: "0 auto",
  display: "grid",
  gap: 18,
};

const panel: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9e2ee",
  borderRadius: 8,
  padding: 18,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const card: CSSProperties = {
  border: "1px solid #d9e2ee",
  borderRadius: 8,
  padding: 14,
  background: "#ffffff",
  display: "grid",
  gap: 8,
};

const muted: CSSProperties = {
  color: "#5b687a",
};

const badge: CSSProperties = {
  width: "fit-content",
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid #bfd0e4",
  borderRadius: 999,
  padding: "3px 9px",
  fontSize: 12,
  background: "#eef4fa",
};

function Title({ children }: { children: ReactNode }) {
  return <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>{children}</h2>;
}

function Bar({ value, max, color = "#1d4ed8" }: { value: number; max: number; color?: string }) {
  return (
    <div style={{ height: 9, borderRadius: 999, background: "#e7edf5", overflow: "hidden" }}>
      <div style={{ width: `${percent(value, max)}%`, height: "100%", background: color }} />
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={card}>
      <span style={muted}>{label}</span>
      <strong style={{ fontSize: 28, lineHeight: 1.1 }}>{value}</strong>
      {note ? <span style={muted}>{note}</span> : null}
    </div>
  );
}

function buildSlotEvidence(goal: GoalScorePlan, db: PastProblemDb | null): SlotEvidence[] {
  return ["t1", "t2", "t3", "t4"].map((slotKey) => {
    const slot = slotKey.toUpperCase();
    const part = goal.scoreBreakdown[slotKey];
    const records = (db?.problems ?? [])
      .filter((problem) => problem.slot === slot && problem.studentRecord)
      .map((problem) => ({
        year: problem.year,
        luoguPid: problem.luoguPid,
        title: problem.title,
        result: problem.studentRecord?.result ?? "UNKNOWN",
        score: Number.isFinite(problem.studentRecord?.score) ? Number(problem.studentRecord?.score) : null,
        source: problem.studentRecord?.source ?? (problem.studentRecord?.isBlindTest ? "blind_test" : "manual_or_unknown"),
        submissionCount: Number.isFinite(problem.studentRecord?.submissionCount) ? Number(problem.studentRecord?.submissionCount) : null,
      }))
      .sort((a, b) => a.year - b.year);
    const scored = records.map((item) => item.score).filter((value): value is number => Number.isFinite(value));
    const averageScore = scored.length > 0 ? scored.reduce((sum, value) => sum + value, 0) / scored.length : null;
    const hasBlind = records.some((item) => item.source === "blind_test");
    return {
      slot,
      modelEstimate: part?.currentEstimate ?? 0,
      targetScore: part?.targetScore ?? 0,
      records,
      averageScore,
      sourceNote: records.length === 0
        ? "当前数据集没有该 T 位历史真题证据。"
        : hasBlind
        ? "包含盲测证据。"
        : "只有洛谷历史推断，不是正式考试证据。",
    };
  });
}

export default async function TrainingPage() {
  const [goal, daily, settlement, mastery, pastProblemDb] = await Promise.all([
    readData<GoalScorePlan>("training-goal/goal_score_plan.json"),
    readData<DailyTrainingPlan>("training/daily_training_plan.json"),
    readData<TrainingSettlement>("training/training_settlement.json"),
    readData<MasteryReport>("mastery/ability_mastery.json"),
    readData<PastProblemDb>("csp-s-benchmark/past_problems_2019_2025.json"),
  ]);

  if (!goal || !daily) {
    return (
      <main style={page}>
        <div style={shell}>
          <section style={panel}>
            <h1 style={{ marginTop: 0 }}>CSP-S 目标分训练驾驶舱</h1>
            <p style={muted}>还没有训练画面数据。先生成训练系统，然后刷新本页。</p>
            <pre style={{ background: "#101828", color: "#f9fafb", padding: 16, borderRadius: 8, overflow: "auto" }}>
              pnpm train:all -- --targetScore 200 --weeklyHours 20
            </pre>
          </section>
        </div>
      </main>
    );
  }

  const scoreItems = Object.entries(goal.scoreBreakdown);
  const currentScore = scoreItems.reduce((sum, [, item]) => sum + item.currentEstimate, 0);
  const totalGap = Math.max(0, goal.targetScore - currentScore);
  const currentAfterSettlement = settlement?.today.scoreProxyAfter ?? currentScore;
  const slotEvidence = buildSlotEvidence(goal, pastProblemDb);
  const calibration = goal.calibration;
  const xpAfter = settlement?.level.xpAfter ?? 0;
  const nextLevelXp = settlement?.level.nextLevelXp ?? 300;
  const doneCount = settlement?.today.completedTasks ?? 0;
  const topMastery = (mastery?.items ?? [])
    .slice()
    .sort((a, b) => b.estimatedLoss - a.estimatedLoss)
    .slice(0, 6);

  return (
    <main style={page}>
      <div style={shell}>
        <section
          style={{
            ...panel,
            background: "linear-gradient(135deg, #0f3b57 0%, #176b65 58%, #f2f7fb 58%, #ffffff 100%)",
            color: "#ffffff",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 18 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <span style={{ ...badge, background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.34)", color: "#ffffff" }}>
                {daily.date} 今日主线
              </span>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.14 }}>CSP-S 目标分训练驾驶舱</h1>
              <p style={{ margin: 0, maxWidth: 620, color: "#dcecf0", fontSize: 16 }}>
                今天围绕「{daily.todayGoal}」训练。做完题后，系统会把得分、用时、提示、提交次数转换成成长结算，而不是只看 AC。
              </p>
              <div style={{ display: "grid", gap: 8, maxWidth: 620 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>目标进度</strong>
                  <span>
                    {formatNumber(currentAfterSettlement)} / {goal.targetScore}
                  </span>
                </div>
                <Bar value={currentAfterSettlement} max={goal.targetScore} color="#f5c84b" />
                <span style={{ color: "#dcecf0" }}>当前还差 {formatNumber(settlement?.today.distanceAfter ?? totalGap)} 分进入目标分路线。</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12, color: "#142033" }}>
              <div style={{ ...card, background: "#ffffff" }}>
                <span style={muted}>训练等级</span>
                <strong style={{ fontSize: 30 }}>
                  Lv.{settlement?.level.after ?? 1} {settlement?.level.upgraded ? "升级" : ""}
                </strong>
                <span style={badge}>{settlement?.level.title ?? "Training starter"}</span>
                <Bar value={xpAfter} max={nextLevelXp} color="#176b65" />
                <span style={muted}>XP {xpAfter} / {nextLevelXp}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Stat label="今日完成" value={`${doneCount} 题`} note={`计划 ${daily.tasks.filter((item) => item.type !== "CONCEPT_EXPLANATION" && item.type !== "REVIEW").length} 题`} />
                <Stat label="今日缩小" value={`${formatNumber(settlement?.today.distanceDelta ?? 0)} 分`} note="按训练质量折算" />
              </div>
            </div>
          </div>
        </section>

        <section style={grid}>
          <Stat label="目标分" value={`${goal.targetScore}`} note={`每周 ${goal.weeklyHours} 小时`} />
          <Stat
            label="训练代理分"
            value={`${formatNumber(currentAfterSettlement)}`}
            note={calibration ? `已按 ${calibration.baselineExamName} ${calibration.baselineTotalScore} 校准` : "未接入正式考试基线"}
          />
          <Stat label="目标缺口" value={`${formatNumber(settlement?.today.distanceAfter ?? totalGap)} 分`} note="越小越接近目标" />
          <Stat label="预计风险下降" value={`${formatNumber(settlement?.today.riskReduced ?? 0, 2)} 分`} note="做完题后自动更新" />
        </section>

        <section style={panel}>
          <Title>今日闯关路线</Title>
          <div style={{ marginBottom: 14 }}>
            <Title>T1/T2/T3/T4 历年真题证据</Title>
            <p style={{ ...muted, marginTop: 0 }}>
              训练代理分不是正式考试分。下面只展示系统已经找到的 CSP-S 历年真题做题记录，用来判断 T1/T2/T3/T4 的估算是否可信。
            </p>
            {calibration ? (
              <p style={muted}>
                当前总分已从原始模型估计 {calibration.rawEstimateTotal} 校准到正式基线 {calibration.calibratedTotal}。
                因为没有真实 T 位分项，下面的 T1/T2/T3/T4 仍是比例估计，不是正式分项。
              </p>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: 12 }}>
              {slotEvidence.map((item) => (
                <div key={item.slot} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{item.slot}</strong>
                    <span style={badge}>
                      估计 {formatNumber(item.modelEstimate)} / 目标 {formatNumber(item.targetScore)}
                    </span>
                  </div>
                  <span style={muted}>
                    历史均分: {item.averageScore === null ? "暂无数据" : formatNumber(item.averageScore)} | 记录数: {item.records.length}
                  </span>
                  <span style={muted}>{item.sourceNote}</span>
                  <div style={{ display: "grid", gap: 6 }}>
                    {item.records.slice(0, 4).map((record) => (
                      <div key={`${item.slot}-${record.year}-${record.luoguPid}`} style={{ borderTop: "1px solid #edf2f7", paddingTop: 6 }}>
                        <strong>{record.year} {record.luoguPid}</strong>
                        <div style={muted}>{record.title}</div>
                        <div style={muted}>
                          得分 {record.score === null ? "unknown" : record.score} | {record.result} | 提交 {record.submissionCount ?? "?"}
                        </div>
                      </div>
                    ))}
                    {item.records.length === 0 ? <span style={muted}>未找到该 T 位的 CSP-S 历史做题记录。</span> : null}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ ...muted, marginBottom: 0 }}>
              已知问题：只有正式总分基线，没有 T1/T2/T3/T4 分项。下一步需要录入一次完整模拟赛或真题重测分项，才能校准每个 T 位。
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 12 }}>
            {daily.tasks.map((task, index) => {
              const isDone = index < doneCount;
              const ref = task.problemPid ?? task.problemId ?? task.contentId ?? "复盘";
              return (
                <article
                  key={`${task.order}-${task.type}`}
                  style={{
                    ...card,
                    borderColor: isDone ? "#7bc7a4" : "#d9e2ee",
                    background: isDone ? "#f0fbf5" : "#ffffff",
                    minHeight: 158,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={badge}>第 {task.order} 关</span>
                    <span style={{ ...badge, background: isDone ? "#dff7e9" : "#eef4fa" }}>{isDone ? "已结算" : "待完成"}</span>
                  </div>
                  <strong style={{ fontSize: 18 }}>{taskLabel(task.type)}</strong>
                  <span style={muted}>{ref}</span>
                  <span>{task.goal}</span>
                  <span style={muted}>限时 {task.durationMinutes} 分钟</span>
                </article>
              );
            })}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div style={panel}>
            <Title>做完后的结算</Title>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={card}>
                <span style={muted}>经验值</span>
                <strong style={{ fontSize: 28 }}>+{settlement?.today.xpGained ?? 0} XP</strong>
                <Bar value={xpAfter} max={nextLevelXp} color="#176b65" />
              </div>
              <div style={card}>
                <span style={muted}>目标分推进</span>
                <strong style={{ fontSize: 26 }}>
                  {formatNumber(settlement?.today.scoreProxyBefore ?? currentScore)} {"->"} {formatNumber(settlement?.today.scoreProxyAfter ?? currentScore)}
                </strong>
                <span style={muted}>如果题目还没录入，这里会保持不变。</span>
              </div>
              <div style={card}>
                <span style={muted}>下一步纠偏</span>
                <strong>{actionLabel(settlement?.nextAdjustment.action ?? "ADVANCE_OR_TRANSFER")}</strong>
                <span>{settlement?.nextAdjustment.nextUnitTitle ?? daily.todayGoal}</span>
              </div>
            </div>
          </div>

          <div style={panel}>
            <Title>能力变化证据</Title>
            {settlement && settlement.abilityChanges.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {settlement.abilityChanges.map((item) => (
                  <article key={item.unitId} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <strong>{item.title}</strong>
                      <span style={badge}>{statusLabel(item.beforeStatus)} {"->"} {statusLabel(item.afterStatus)}</span>
                    </div>
                    <span>均分 {formatNumber(item.todayScoreAverage)}，风险下降 {formatNumber(item.riskReduced, 2)} 分</span>
                    <span style={muted}>题目：{item.todayProblems.join(", ")}</span>
                    <span>{item.message}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div style={{ ...card, background: "#fffaf0" }}>
                <strong>还没有今日做题证据</strong>
                <span>你做完题并录入后，这里会显示能力是否升级、哪道题证明了升级、还有哪些问题没有解决。</span>
                <span style={muted}>目前不会假装你已经进步，必须等真实做题结果进来。</span>
              </div>
            )}
          </div>
        </section>

        <section style={panel}>
          <Title>目标分拆解</Title>
          <div style={grid}>
            {scoreItems.map(([slot, item]) => (
              <article key={slot} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <strong style={{ fontSize: 18 }}>{slot.toUpperCase()}</strong>
                  <span style={badge}>{item.trainingPriority ?? "P?"}</span>
                </div>
                <strong style={{ fontSize: 28 }}>{item.currentEstimate} / {item.targetScore}</strong>
                <Bar value={item.currentEstimate} max={item.targetScore} color={item.gap <= 5 ? "#176b65" : "#b45309"} />
                <span style={muted}>缺口 {item.gap} 分</span>
                <span>{item.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div style={panel}>
            <Title>高风险能力条</Title>
            <div style={{ display: "grid", gap: 12 }}>
              {topMastery.map((item) => (
                <article key={item.unitId} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <strong>{item.title}</strong>
                    <span style={badge}>{statusLabel(item.status)}</span>
                  </div>
                  <Bar value={item.estimatedLoss} max={15} color={item.estimatedLoss >= 8 ? "#b42318" : "#b45309"} />
                  <span style={muted}>预计失分风险 {formatNumber(item.estimatedLoss, 2)} 分，已完成 {item.completedTasks} 题</span>
                  <span>{item.nextAction}</span>
                </article>
              ))}
            </div>
          </div>

          <div style={panel}>
            <Title>通过标准</Title>
            <div style={{ display: "grid", gap: 10 }}>
              {daily.passCriteria.map((item, index) => (
                <div key={item} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 10, alignItems: "start" }}>
                  <span style={{ ...badge, justifyContent: "center", width: 26, height: 26, padding: 0 }}>{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={panel}>
          <Title>做完题后页面会怎么变</Title>
          <div style={grid}>
            <div style={card}>
              <strong>1. 任务变成已结算</strong>
              <span>今日闯关路线里的题目会从“待完成”变成“已结算”。</span>
            </div>
            <div style={card}>
              <strong>2. XP 和等级增长</strong>
              <span>独立 AC、低提交、低提示会涨得更多；看题解 AC 不会被当成完全掌握。</span>
            </div>
            <div style={card}>
              <strong>3. 目标差距缩小</strong>
              <span>系统会显示离 {goal.targetScore} 分还差多少，今天缩小了多少。</span>
            </div>
            <div style={card}>
              <strong>4. 明天自动纠偏</strong>
              <span>如果失败或提示过高，明天会优先重做复盘；如果稳定，就进入变式或真题验证。</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
