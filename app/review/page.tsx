import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge, IconBubble } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { BarChart3, CalendarDays, CheckCircle2, Clock, Code2, Cpu, FileText, Home, List, RefreshCw, Target, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams?: Promise<{ problemPid?: string }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const data = await getLocalLoopUiData();
  const review = data.reviews.find((item) => item.problemPid === params?.problemPid) ?? data.reviews[0] ?? null;
  const task = data.tasks.find((item) => item.id === params?.problemPid) ?? data.tasks[0] ?? null;
  const evidenceProblem = data.evidenceProblems.find((item) => item.pid === params?.problemPid) ?? data.evidenceProblems[0] ?? null;
  const problemPid = review?.problemPid ?? task?.id ?? evidenceProblem?.pid ?? "暂无";
  const problemTitle = task?.title ?? evidenceProblem?.title ?? "暂无单题复盘";
  const evidence = review?.evidence.length
    ? review.evidence
    : [
        evidenceProblem?.reason,
        data.tuningIssues.find((issue) => issue.code === "ATTEMPT_ANALYSIS_MISSING")?.message,
        "完成训练结果记录后，本页会读取 data/local-loop/attempt-analysis 中的真实复盘。"
      ].filter(Boolean) as string[];

  return (
    <AppShell activeHref="/calendar" logo="a" nav={[
      { href: "/dashboard", label: "目标总览", icon: BarChart3 },
      { href: "/today", label: "今日训练", icon: CalendarDays },
      { href: "/calendar", label: "训练日历", icon: CalendarDays },
      { href: "/report", label: "周报计划", icon: FileText }
    ]}>
      <div className="detail-page" style={{ position: "relative" }}>
        <Image src="/assets/review-top-owl.png" alt="" width={340} height={155} className="detail-hero" />
        <div style={{ color: "#332aff", fontWeight: 800, marginBottom: 12 }}>训练日历 / <span style={{ color: "#5c668d" }}>题目详情</span></div>
        <h1><span className="text-grad">AI</span> 训练复盘：{problemPid} {problemTitle}</h1>
        <p style={{ color: "#53608d", fontSize: 17, margin: "10px 0 0" }}>
          {review ? "本页正在展示已生成的单题 AI 复盘。" : "当前还没有真实单题复盘，先记录训练结果即可生成。"}
        </p>

        <div className="system-card card">
          <h2 className="section-title">系统同步结果</h2>
          <div className="system-grid">
            {[
              ["平台：洛谷", Home],
              [`题号：${problemPid}`, FileText],
              [`题名：${problemTitle}`, FileText],
              [`最新结果：${review?.result ?? evidenceProblem?.result ?? "待记录"}`, CheckCircle2],
              [`得分：${review?.score ?? evidenceProblem?.score ?? "暂无"}`, Trophy],
              [`提交次数：${review?.submissionCount ?? evidenceProblem?.attempts ?? "暂无"}`, RefreshCw],
              [`用时：${review?.timeMinutes ?? task?.time ?? "暂无"}`, Clock],
              [`数据源：${review ? review.file : data.reviewStatus}`, Cpu],
              ["语言：待同步", Code2],
              [`最近生成：${review?.generatedAt?.slice(0, 19) ?? data.generatedAt?.slice(0, 19) ?? "暂无"}`, CalendarDays]
            ].map(([text, Icon]) => <div key={text as string} style={{ display:'flex', alignItems:'center', gap:10, color:'#283462', fontSize:16 }}><Icon color="#4b35ff" size={22}/><span>{text as string}</span></div>)}
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <div className="submissions card">
              <h2 className="section-title">提交轨迹</h2>
              <table className="sub-table">
                <thead><tr><th>题号</th><th>状态</th><th>得分</th><th>用时</th><th>来源</th></tr></thead>
                <tbody>{data.submissions.map((row,index)=><tr key={`${row[0]}-${index}`}><td>{row[0]}</td><td><span className={`status-dot ${row[1] === "AC" ? "green" : "red"}`}/> <Badge tone={row[1] === "AC" ? "green" : "red"}>{row[1]}</Badge></td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td></tr>)}</tbody>
              </table>
            </div>

            <div className="evidence card">
              <h2 className="section-title">关键证据</h2>
              {evidence.map((item)=><div className="evidence-row" key={item}><List color="#4b35ff" size={20}/><span>{item}</span></div>)}
            </div>

            <div className="card" style={{ marginTop: 14, padding: 22 }}>
              <h2 className="section-title">补充我的思路 <span style={{ color: "#6b7498", fontWeight: 700 }}>（可选）</span></h2>
              <textarea
                className="textarea-box field-control textarea-control"
                defaultValue="记录这道题的关键想法、跳过的坑、收获的经验..."
                style={{ marginTop: 14 }}
              />
              <Link href={`/training-result?problemPid=${encodeURIComponent(problemPid)}`} className="btn-primary" style={{ float: "right", marginTop: -54, height: 44, minHeight: 44, fontSize: 14, borderRadius: 8 }}>记录训练结果</Link>
            </div>
          </div>

          <div>
            <div className="insight-card card">
              <h2 className="section-title">训练结论</h2>
              <div className="conclusion-icons">
                <div className="conclusion-icon"><IconBubble icon={CheckCircle2} tone="green"/><b>{review?.result ?? "待记录"}<br/>当前结果</b></div>
                <div className="conclusion-icon"><IconBubble icon={Clock} tone="orange"/><b>{review?.submissionCount ?? "暂无"}<br/>提交记录</b></div>
                <div className="conclusion-icon"><IconBubble icon={Target}/><b>{review?.score ?? "暂无"}<br/>最好得分</b></div>
              </div>
            </div>
            <div className="insight-card card" style={{ marginTop: 12 }}>
              <h2 className="section-title">AI 掌握判断</h2>
              <p style={{ lineHeight: 2, color: '#36426d' }}>
                主要问题：{review?.primaryError ?? "暂无复盘"}<br/>
                掌握判断：<Badge tone={review && !review.needRedo ? "green" : "orange"}>{review?.masteryJudgement ?? data.reviewStatus}</Badge><br/>
                是否需要重做：<Badge tone={review?.needRedo ? "orange" : "green"}>{review ? (review.needRedo ? "需要" : "暂不需要") : "待判断"}</Badge>
              </p>
            </div>
            <div className="insight-card card" style={{ marginTop: 12 }}>
              <h2 className="section-title">AI 复盘解释</h2>
              <p style={{ color: '#283462', lineHeight: 1.78, margin: 0 }}>{review?.studentFeedback ?? review?.parentSummary ?? "当前还没有 attempt-analysis 产物。"}</p>
            </div>
            <div className="insight-card card" style={{ marginTop: 12 }}>
              <h2 className="section-title">下一步动作</h2>
              <div className="action-list">
                <Link href="/today" className="action-link">安排今日训练 <span>→</span></Link>
                <Link href="/report" className="action-link">生成家长周报 <span>→</span></Link>
                <Link href="/dashboard" className="action-link">回到目标总览 <span>→</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
