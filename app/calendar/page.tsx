import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge, IconBubble } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { BarChart3, CalendarDays, CheckCircle2, ChevronRight, Clock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const days = [31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,1,2,3,4];
const trained = new Set([4,5,7,8,10,12,14,15,16,19,21,23,24,25,28,30]);
const reviewed = new Set([2,9,13,17,22,29]);

export default async function CalendarPage() {
  const data = await getLocalLoopUiData();
  const completedCount = data.records.length;
  const reviewedCount = data.reviewStatus === "OK" ? data.submissions.length : 0;

  return (
    <AppShell activeHref="/calendar" nav={[{href:"/dashboard",label:"目标总览",icon:BarChart3},{href:"/today",label:"今日训练",icon:CalendarDays},{href:"/calendar",label:"训练日历",icon:CalendarDays},{href:"/report",label:"周报计划",icon:FileText}]}>
      <div className="calendar-page" style={{ position: "relative" }}>
        <Image src="/assets/calendar-owl.png" alt="" width={168} height={155} className="calendar-hero" />
        <h1>训练日历</h1>
        <p style={{ color: "#53608d", fontSize: 17, margin: "10px 0 0" }}>当前列表来自 `today.json` 中的证据题和本地复盘产物。</p>

        <div className="calendar-stats" style={{ width: 850 }}>
          <div className="stat-card card"><IconBubble icon={CalendarDays}/><div><span>本周训练天数</span><br/><b style={{ fontSize: 36 }}>1 <span style={{ fontSize: 17 }}>天</span></b></div></div>
          <div className="stat-card card"><IconBubble icon={BarChart3}/><div><span>证据题数量</span><br/><b style={{ fontSize: 36 }}>{data.evidenceProblems.length} <span style={{ fontSize: 17 }}>题</span></b></div></div>
          <div className="stat-card card"><IconBubble icon={CheckCircle2}/><div><span>AI 复盘</span><br/><b style={{ fontSize: 36 }}>{reviewedCount} <span style={{ fontSize: 17 }}>次</span></b></div></div>
        </div>

        <div className="calendar-layout">
          <div>
            <div className="month-card card">
              <div className="month-head"><h2 className="section-title">训练状态</h2><div style={{ display:'flex', gap:20 }}><span><span className="status-dot"/> 训练</span><span><span className="status-dot green"/> 已复盘</span><span><span className="status-dot" style={{ background:'#fff', border:'2px solid #4934ff' }}/> 今日</span></div></div>
              <div className="week-grid">{["一","二","三","四","五","六","日"].map((day)=><div className="week-day" key={day}>{day}</div>)}{days.map((day,index)=><div key={index} className={`day ${index===0||index>30?'muted':''} ${day===26?'today':''}`}>{day}{trained.has(day) && <span className={`dot ${reviewed.has(day)?'green':''}`}/>}</div>)}</div>
            </div>

            <div className="record-card card">
              <h2 className="section-title">本地证据题记录</h2>
              <table className="record-table">
                <thead><tr><th>题目</th><th>结果</th><th>得分</th><th>类型</th><th>操作</th></tr></thead>
                <tbody>{data.records.map((row)=><tr key={row[0]}><td><b>{row[0]}</b></td><td><Badge tone={row[1]==='AC'?'green':'red'}>{row[1]}</Badge></td><td>{row[2]}</td><td><Badge>{row[3]}</Badge></td><td><Link href={`/review?problemPid=${encodeURIComponent(row[3])}`} className="small-btn primary">查看 AI 复盘</Link></td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <aside className="calendar-side">
            <div className="summary-card card"><h2 className="section-title">选中日期摘要</h2><div className="summary-metrics"><div><IconBubble icon={FileText}/><br/>完成题数<br/><b style={{ fontSize: 34 }}>{completedCount}</b></div><div><IconBubble icon={CheckCircle2} tone="green"/><br/>已复盘<br/><b style={{ fontSize: 34 }}>{reviewedCount}</b></div><div><IconBubble icon={Clock}/><br/>训练时长<br/><b style={{ fontSize: 34 }}>{Math.round(data.totalDurationMinutes / 60 * 10) / 10}<span style={{fontSize:14}}>h</span></b></div></div></div>
            <div className="recent-card card"><h2 className="section-title">最近查看</h2>{data.recentItems.map((item,index)=><div className="recent-row" key={item}><div style={{ display:'flex', gap:12, alignItems:'center' }}><IconBubble icon={FileText} size={36}/><div><b>{item}</b><br/><span className="small-muted">本地证据 · {index===0?'最高优先级':'训练题'}</span></div></div><ChevronRight size={20}/></div>)}</div>
            <div className="card" style={{ padding:22 }}><h2 className="section-title">这一天的训练结论</h2><p style={{ color:'#53608d', lineHeight:1.8 }}>{data.mainGoal}</p></div>
            <Link href="/report" className="plan-banner card"><h2 className="section-title">查看本周计划</h2><p className="small-muted">了解本周重点与目标安排</p><span style={{ position:'absolute', right:28, top:42, width:42, height:42, borderRadius:'50%', background:'#5538ff', color:'#fff', display:'flex',alignItems:'center',justifyContent:'center' }}>→</span></Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
