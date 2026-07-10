import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { IconBubble } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crosshair,
  Download,
  FileText,
  Target,
  TrendingUp
} from "lucide-react";

export const dynamic = "force-dynamic";

const reportNav = [
  { href: "/dashboard", label: "总览", icon: BarChart3 },
  { href: "/today", label: "今日训练", icon: CalendarDays },
  { href: "/review", label: "题目复盘", icon: FileText },
  { href: "/report", label: "家长周报", icon: FileText }
];

export default async function ReportPage() {
  const data = await getLocalLoopUiData();
  const nextTarget = Math.min(data.targetScore, data.nextMilestone || data.currentScore + 10);
  const modelingIssue = data.blockingIssues.find((item) => item.includes("建模入口")) ?? "建模入口不稳定";
  const lowLevelIssue = data.blockingIssues.find((item) => item.includes("低级错误") || item.includes("稳定性不足"));
  const hasWeeklyReport = data.weeklyReportExists;

  const nextPlan = {
    focus: "修复 T2 建模入口",
    structure: "1 道 T1 + 1 道 T2 + 1 道复盘题",
    time: "每天 70–90 分钟",
    status: hasWeeklyReport ? "家长周报已生成" : "家长周报待生成，先展示 tuning report"
  };

  const reasonItems = [
    "本周已出现稳定提分趋势，适合继续巩固。",
    "T2 是当前最主要的失分来源。",
    "复盘题用于沉淀方法，避免重复犯错。"
  ];

  return (
    <AppShell activeHref="/report" nav={reportNav}>
      <div className="report-page" style={{ position: "relative" }}>
        <Image src="/assets/report-top-owl.png" alt="" width={370} height={165} className="report-hero" />
        <h1>本周从 <span className="text-grad">{data.officialScore}</span> 提升到 <span className="text-grad">{data.currentScore}</span>，下周冲 <span className="text-grad">{nextTarget}</span></h1>
        <p style={{ color: "#53608d", fontSize: 17, margin: "12px 0 0" }}>
          这一周离目标更近了 {Math.max(0, data.currentScore - data.officialScore)} 分。系统已根据训练表现，生成下周训练重点与节奏安排。
        </p>

        <div className="stat-row">
          <div className="stat-card card"><IconBubble icon={Clock} /><div>估计分<br /><b style={{ fontSize: 30 }}>{data.currentScore}</b></div></div>
          <div className="stat-card card"><IconBubble icon={Target} /><div>目标差距<br /><b style={{ fontSize: 30 }}>{data.gap}</b></div></div>
          <div className="stat-card card"><IconBubble icon={CheckCircle2} /><div>今日任务<br /><b style={{ fontSize: 30 }}>{data.tasks.length} <span style={{ fontSize: 14 }}>题</span></b></div></div>
          <div className="stat-card card"><IconBubble icon={Brain} /><div>AI 复盘<br /><b style={{ fontSize: 30 }}>{data.reviewStatus === "OK" ? data.submissions.length : 0} <span style={{ fontSize: 14 }}>次</span></b></div></div>
        </div>

        <div className="report-section">
          <h2 className="section-title">本周结论</h2>
          <div className="conclusion-card card report-conclusion">
            <IconBubble icon={TrendingUp} tone="green" size={70} />
            <div>
              <span className="report-eyebrow">本周有效进步</span>
              <b>T1 保分能力提升</b>
              <span className="report-note">基础题正确率更稳定，低级失分减少。</span>
            </div>
          </div>
          <div className="conclusion-card card report-conclusion">
            <IconBubble icon={AlertTriangle} tone="red" size={70} />
            <div>
              <span className="report-eyebrow">当前主要阻塞</span>
              <b>{lowLevelIssue ? "T2 建模入口不稳定" : "T2 建模入口不稳定"}</b>
              <span className="report-note">中档题仍然容易卡在第一步建模，影响继续提分。</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-title">下周计划</h2>
          <div className="plan-table report-plan-table">
            <PlanRow icon={Target} label="下周目标" value={`${data.currentScore} → ${nextTarget}`} strong />
            <PlanRow icon={Crosshair} label="训练重点" value={nextPlan.focus} />
            <PlanRow icon={ClipboardList} label="每日结构" value={nextPlan.structure} />
            <PlanRow icon={Clock} label="预计时间" value={nextPlan.time} />
            <PlanRow icon={CheckCircle2} label="状态" value={nextPlan.status} muted />
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-title">为什么这样安排</h2>
          <div className="card report-reason-card">
            <ul className="report-reason-list">
              {reasonItems.map((item) => (
                <li key={item}><CheckCircle2 size={16} /><span>{item}</span></li>
              ))}
            </ul>
            <Target className="report-reason-watermark" size={104} />
          </div>
        </div>

        <div className="report-actions">
          <Link href="/today" className="btn-primary"><CheckCircle2 />确认下周计划</Link>
          <Link href="/api/report/weekly" className="btn-outline"><Download />导出家长版 PDF</Link>
        </div>
      </div>
    </AppShell>
  );
}

function PlanRow({
  icon: Icon,
  label,
  value,
  strong = false,
  muted = false
}: {
  icon: typeof Target;
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`plan-row ${muted ? "muted" : ""}`}>
      <Icon className="plan-row-icon" size={20} />
      <b>{label}</b>
      <span className={strong ? "text-grad plan-row-strong" : ""}>{value}</span>
    </div>
  );
}
