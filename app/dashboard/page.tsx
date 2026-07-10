import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import AppShell from "@/components/AppShell";
import { IconBubble } from "@/components/Ui";
import { getLocalLoopUiData, type UiTask } from "@/src/server/local-loop/ui-data";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Clock,
  FileText,
  Grid2X2,
  Home,
  LineChart,
  Target
} from "lucide-react";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "目标总览", icon: Grid2X2 },
  { href: "/today", label: "今日训练", icon: CalendarDays },
  { href: "/review", label: "题目复盘", icon: FileText },
  { href: "/report", label: "周报计划", icon: FileText },
  { href: "/ability-map", label: "学习报告", icon: BookOpen }
];

export default async function DashboardPage() {
  const data = await getLocalLoopUiData();
  const keyTasks = data.tasks.slice(0, 3);
  const keyTaskDurationMinutes = keyTasks.reduce((sum, task) => sum + Number.parseInt(task.time, 10), 0);
  const focusSummary = buildTodayFocusSummary(keyTasks, data.mainGoal);
  const tableRows = buildScoreRows(data.scoreBlocks);
  const weeklyRows = buildWeeklyRows(keyTasks);
  const blocker = data.blockingIssues[0] ?? data.weakestKnowledge[0]?.name ?? "等待更多训练证据";
  const blockerTags = data.blockingIssues.length ? data.blockingIssues.slice(0, 2) : ["T2 / T3", "预计影响：15 - 25 分"];

  return (
    <AppShell activeHref="/dashboard" nav={nav} className="dashboard-shell">
      <div className="dashboard dashboard-ref">
        <section className="dash-hero-block">
          <div className="dash-step-title"><span>1</span>目标与阶段路径</div>
          <h1>距离 CSP-S {data.targetScore} 分，还差 <span className="text-grad">{data.gap}</span> 分</h1>
          <p>系统会把目标差距拆成阶段任务，通过每日训练和做题复盘持续缩短差距。</p>
          <div className="dash-hero-art">
            <Image src="/assets/brand-owl.png" alt="" width={104} height={104} />
            <div className="dash-hero-chip">目标分规划中</div>
          </div>
        </section>

        <section className="dash-metric-row">
          <MetricCard icon={BarChart3} label="当前估计分" value={String(data.currentScore)} />
          <MetricCard icon={Target} label="目标分" value={String(data.targetScore)} />
          <MetricCard icon={Clock} label="目标差距" value={`${data.gap} 分`} />
          <MetricCard icon={LineChart} label="当前阶段" value={data.currentStage} />
          <MetricCard icon={CheckSquare} label="距离下一阶段" value={`${Math.max(0, data.nextMilestone - data.currentScore)} 分`} compact />
        </section>

        <section className="dash-stage-card card">
          <div className="dash-stage-head">阶段路径 <span>共 5 个阶段</span></div>
          <div className="dash-stage-line">
            {[1, 2, 3, 4, 5].map((step) => <span key={step} className={step === 1 ? "active" : ""}>{step}</span>)}
          </div>
          <div className="dash-stage-labels">
            <StageLabel title={data.currentStage} text={data.mainGoal || "稳定基础，减少低级失分"} active />
            <StageLabel title={`${data.nextMilestone} -> 140`} text="突破 T2 建模入口" />
            <StageLabel title="140 -> 160" text="提高中档题稳定性" />
            <StageLabel title="160 -> 180" text="拿到 T3 部分分" />
            <StageLabel title="180 -> 200" text="冲刺综合题和考试策略" />
          </div>
        </section>

        <section className="dash-section-card card">
          <div className="dash-section-heading"><span>2</span>当前状况与问题诊断</div>
          <div className="dash-diagnosis-grid">
            <div className="dash-panel">
              <h2><Grid2X2 size={20} />当前能力结构</h2>
              <table className="dash-score-table">
                <thead><tr><th>题型</th><th>当前得分</th><th>目标得分</th><th>差距</th></tr></thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.slot}>
                      <td>{row.slot}</td>
                      <td><span>{row.current}</span><i style={{ width: `${row.percent}%` }} /></td>
                      <td>{row.target}</td>
                      <td><b>{row.gap}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <small>* 目标得分为建议区间上限</small>
            </div>

            <div className="dash-panel dash-chart-panel">
              <h2><LineChart size={20} />最近进步</h2>
              <svg width="310" height="160" viewBox="0 0 310 160" aria-hidden="true">
                <line x1="28" y1="18" x2="28" y2="128" stroke="#dfe4f2" />
                <line x1="28" y1="128" x2="288" y2="128" stroke="#dfe4f2" />
                <polyline points="28,96 105,88 182,76 260,64" fill="none" stroke="#5638ff" strokeWidth="4" />
                <polyline points="28,112 105,108 182,106 260,116" fill="none" stroke="#aeb6cd" strokeWidth="3" />
                {[28, 105, 182, 260].map((x, index) => <circle key={x} cx={x} cy={[96, 88, 76, 64][index]} r="6" fill="#5638ff" />)}
                <text x="18" y="150">上周日</text><text x="98" y="150">周二</text><text x="176" y="150">周四</text><text x="252" y="150">今天</text>
              </svg>
              <div className="dash-chart-foot">当前估计分：<b>{data.currentScore}</b><span />目标差距：<b>{data.gap} 分</b></div>
            </div>

            <div className="dash-panel dash-risk-panel">
              <h2><AlertTriangle size={20} />当前最大问题点</h2>
              <div className="dash-risk-alert"><AlertTriangle size={22} /><strong>{blocker}</strong></div>
              <div className="dash-risk-tags">
                {blockerTags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <p>问题表现：遇到需要建模的题目时，思路启动慢，建模方法选择不稳定，导致中档题失分较多。</p>
              <p><b>建议：</b>先稳住 T1，再集中修复 T2 建模入口，不直接冲高难题。</p>
              <Link href="/analysis/result">查看诊断详情 <span>›</span></Link>
            </div>
          </div>
        </section>

        <section className="dash-plan-card card">
          <div className="dash-section-heading"><span>3</span>下一步训练计划 <small>把目标、今日任务与本周执行安排整合在一起，方便直接开始训练。</small></div>
          <div className="dash-plan-strip">
            <PlanFact icon={CalendarDays} label="目标分段" value={`${data.currentScore} -> ${data.nextMilestone}`} />
            <PlanFact icon={Target} label="核心突破点" value={focusSummary} />
            <PlanFact icon={FileText} label="每日训练结构" value={`稳 T1 + 修复 ${keyTasks[1]?.tag || "T2"} + 复盘迁移题`} />
            <PlanFact icon={Clock} label="预计每日时间" value={`${keyTaskDurationMinutes || data.totalDurationMinutes} 分钟`} />
          </div>
          <div className="dash-plan-grid">
            <div className="dash-priority">
              <h3><CalendarDays size={19} />今日优先任务</h3>
              <p><CheckSquare size={17} />今日训练：<b>{keyTasks.length}</b> 题</p>
              <p><Clock size={17} />预计时间：<b>{keyTaskDurationMinutes || data.totalDurationMinutes}</b> 分钟</p>
              <p><FileText size={17} />今日重点：{focusSummary}</p>
              <Link href="/today" className="btn-primary">开始今日训练 →</Link>
              <Link href="/today" className="dash-secondary-btn">查看今日题目预览</Link>
            </div>
            <div className="dash-week">
              <h3><BarChart3 size={19} />本周执行路线</h3>
              {weeklyRows.map((row, index) => (
                <div className={index === 0 ? "active" : ""} key={row.day}>
                  <span>{row.day}</span>
                  <strong>{row.title}</strong>
                  <em>{row.status}</em>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-advice">训练建议　先稳住 T1，再集中修复 T2 建模入口，不直接冲高难题。</div>
        </section>
      </div>
    </AppShell>
  );
}

type BubbleIcon = ComponentProps<typeof IconBubble>["icon"];

function MetricCard({ icon, label, value, compact = false }: { icon: BubbleIcon; label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? "dash-metric-card compact card" : "dash-metric-card card"}>
      <IconBubble icon={icon} size={46} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StageLabel({ title, text, active = false }: { title: string; text: string; active?: boolean }) {
  return (
    <div className={active ? "active" : ""}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function PlanFact({ icon, label, value }: { icon: BubbleIcon; label: string; value: string }) {
  return (
    <div>
      <IconBubble icon={icon} size={40} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildScoreRows(scoreBlocks: Array<{ title: string; score: string }>) {
  const targets = [90, 70, 50, 10];
  return ["T1", "T2", "T3", "T4"].map((slot, index) => {
    const current = Number.parseInt(scoreBlocks[index]?.score ?? "0", 10) || 0;
    const target = targets[index] ?? 10;
    return {
      slot,
      current,
      target,
      gap: Math.max(0, target - current),
      percent: Math.max(4, Math.min(100, Math.round((current / target) * 100)))
    };
  });
}

function buildTodayFocusSummary(tasks: UiTask[], fallback: string) {
  if (!tasks.length) return fallback;
  const slots = [...new Set(tasks.map((task) => task.tag).filter(Boolean))];
  const hasT1 = slots.includes("T1");
  const nonT1 = slots.find((slot) => slot !== "T1");
  const parts = [
    hasT1 ? "稳住 T1" : null,
    nonT1 ? `修复 ${nonT1} 建模入口` : null,
    tasks.length > 1 ? "复盘迁移题" : null
  ].filter(Boolean);
  return parts.join(" + ") || tasks[0]?.goal || fallback;
}

function buildWeeklyRows(tasks: UiTask[]) {
  const focus = tasks[1]?.tag || "T2";
  return [
    { day: "周一（今天）", title: `稳 T1 + 修复 ${focus} 建模入口`, status: "进行中" },
    { day: "周二", title: `${focus} 专项训练 + 复盘`, status: "待开始" },
    { day: "周三", title: `${focus} 迁移题训练`, status: "待开始" },
    { day: "周四", title: "综合提升（T2 + T3）", status: "待开始" },
    { day: "周五", title: "明湖 + 重点总结", status: "待开始" }
  ];
}
