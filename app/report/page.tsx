import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { IconBubble } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { AlertTriangle, BarChart3, Brain, CalendarDays, CheckCircle2, Clock, Download, FileText, Target, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const data = await getLocalLoopUiData();
  const nextTarget = Math.min(data.targetScore, data.nextMilestone || data.currentScore + 10);
  const issues = data.tuningIssues.length ? data.tuningIssues : [
    { priority: "OK", code: "READY", message: "当前暂无阻塞调优项", evidence: "tuning_report.json" }
  ];

  return (
    <AppShell activeHref="/report" nav={[{href:"/dashboard",label:"总览",icon:BarChart3},{href:"/today",label:"今日训练",icon:CalendarDays},{href:"/review",label:"题目复盘",icon:FileText},{href:"/report",label:"家长周报",icon:FileText}]}>
      <div className="report-page" style={{ position: "relative" }}>
        <Image src="/assets/report-top-owl.png" alt="" width={370} height={165} className="report-hero" />
        <h1>本周从 <span className="text-grad">{data.officialScore}</span> 提升到 <span className="text-grad">{data.currentScore}</span>，下周冲 <span className="text-grad">{nextTarget}</span></h1>
        <p style={{ color:'#53608d', fontSize:17, margin:'12px 0 0' }}>这一周离目标更近了 {Math.max(0, data.currentScore - data.officialScore)} 分。系统已根据训练表现，生成下周训练重点与节奏安排。</p>

        <div className="stat-row">
          <div className="stat-card card"><IconBubble icon={Clock}/><div>估计分<br/><b style={{ fontSize:30 }}>{data.currentScore}</b></div></div>
          <div className="stat-card card"><IconBubble icon={Target}/><div>目标差距<br/><b style={{ fontSize:30 }}>{data.gap}</b></div></div>
          <div className="stat-card card"><IconBubble icon={CheckCircle2}/><div>今日任务<br/><b style={{ fontSize:30 }}>{data.tasks.length} <span style={{ fontSize:14 }}>题</span></b></div></div>
          <div className="stat-card card"><IconBubble icon={Brain}/><div>AI 复盘<br/><b style={{ fontSize:30 }}>{data.reviewStatus === "OK" ? data.submissions.length : 0} <span style={{ fontSize:14 }}>次</span></b></div></div>
        </div>

        <div className="report-section">
          <h2 className="section-title">本周结论</h2>
          <div className="conclusion-card card"><IconBubble icon={TrendingUp} tone="green" size={70}/><div><b style={{ fontSize:24 }}>{data.mainGoal}</b><br/><span style={{ color:'#53608d', fontSize:16 }}>当前阶段：{data.currentStage}，数据质量：{data.dataQuality}</span></div></div>
          <div className="conclusion-card card"><IconBubble icon={AlertTriangle} tone="red" size={70}/><div><b style={{ fontSize:24 }}>{data.blockingIssues[0] ?? data.weakestKnowledge[0]?.name ?? "等待更多证据"}</b><br/><span style={{ color:'#53608d', fontSize:16 }}>{data.blockingIssues.slice(1, 3).join(" / ") || data.weakestKnowledge[0]?.evidence || "继续完成训练后更新"}</span></div></div>
        </div>

        <div className="report-section">
          <h2 className="section-title">下周计划</h2>
          <div className="plan-table">
            <div className="plan-row"><b>下周目标</b><span className="text-grad" style={{ fontSize:21, fontWeight:900 }}>{data.currentScore} → {nextTarget}</span></div>
            <div className="plan-row"><b>训练重点</b><span>{data.weakestKnowledge[0]?.name ?? data.mainGoal}</span></div>
            <div className="plan-row"><b>每日结构</b><span>{data.tasks.map((task) => task.tag).join(" + ") || "等待今日训练生成"}</span></div>
            <div className="plan-row"><b>预计时间</b><span>每天约 {data.totalDurationMinutes} 分钟</span></div>
            <div className="plan-row" style={{ background:'#f3f0ff' }}><b>状态</b><span>{data.weeklyReportExists ? "家长周报已生成" : "家长周报待生成，先展示 tuning report"}</span></div>
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-title">为什么这样安排</h2>
          <div className="card" style={{ minHeight:88, padding:'16px 22px', position:'relative' }}>
            <ul style={{ margin:0, paddingLeft:20, color:'#36426d', lineHeight:1.7 }}>
              {issues.slice(0, 3).map((issue) => <li key={issue.code}>{issue.priority} / {issue.message}（{issue.evidence}）</li>)}
            </ul>
            <div style={{ position:'absolute', right:60, top:10, width:150, height:100, borderRadius:'50%', background:'radial-gradient(circle,rgba(90,70,255,.12),transparent 70%)' }} />
          </div>
        </div>

        <div className="report-actions"><Link href="/today" className="btn-primary"><CheckCircle2/>确认下周计划</Link><Link href="/api/report/weekly" className="btn-outline"><Download/>导出家长版 PDF</Link></div>
      </div>
    </AppShell>
  );
}
