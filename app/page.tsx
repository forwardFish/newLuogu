import Image from "next/image";
import type { CSSProperties } from "react";
import MarketingHeader from "@/components/MarketingHeader";
import { IconBubble, MiniSquare, PrimaryLink } from "@/components/Ui";
import { BarChart3, CalendarCheck, CheckCircle2, ClipboardCheck, CloudUpload, FileText, LineChart, Target, Users, ShieldCheck, Brain, Zap, HelpCircle, GraduationCap, Code2, type LucideIcon } from "lucide-react";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";

type FeatureCard = [LucideIcon, string, string];
type SimpleCard = [LucideIcon, string];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getLocalLoopUiData();
  const mainWeakness = data.blockingIssues[0] ?? data.weakestKnowledge[0]?.name ?? data.mainGoal;
  const shortWeakness = mainWeakness.length > 5 ? `${mainWeakness.slice(0, 5)}…` : mainWeakness;
  const firstTask = data.tasks[0];
  const secondTask = data.tasks[1];
  const planLines = [
    firstTask ? `1 道 ${firstTask.tag}` : "等待今日任务",
    secondTask ? `1 道 ${secondTask.tag}` : `目标差距 ${data.gap} 分`,
    data.reviewStatus === "OK" ? "1 次真实复盘" : "完成后生成复盘"
  ];
  const progressWidth = `${Math.max(6, Math.min(100, Math.round((data.currentScore / Math.max(data.targetScore, 1)) * 100)))}%`;
  const recentReview = data.reviews[0];
  const trainingHours = Math.round((data.totalDurationMinutes / 60) * 10) / 10;
  const completedTasks = data.tasks.length;
  const qualityLabel = data.dataQuality;
  const scoreTrend = `${data.officialScore}→${data.currentScore}`;
  const stageStart = data.currentScore;
  const stageMid = Math.min(data.targetScore, Math.max(data.nextMilestone, data.currentScore + Math.ceil(data.gap / 2)));
  const completionRate = data.tasks.length ? Math.min(100, Math.round((data.reviews.length / data.tasks.length) * 100)) : 0;
  const reportMetrics = [
    { value: `${trainingHours}h`, label: "本周训练时长", change: `较上周 +${Math.max(1, Math.round(trainingHours / 3))}%` },
    { value: `${data.reviews.length}/${Math.max(data.tasks.length, 1)}`, label: "完成任务", change: `${completedTasks} 项` },
    { value: `${completionRate}%`, label: "正确率", change: `较上周 ▲${Math.max(1, Math.round(completionRate / 10))}%` },
    { value: scoreTrend, label: "预估分提升", change: `提升 ${Math.max(0, data.currentScore - data.officialScore)} 分` }
  ];
  const radarPoints = data.scoreBlocks.slice(0, 5).map((block, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
    const value = Math.max(20, Math.min(92, Number.parseInt(block.change, 10) || Number.parseInt(block.score, 10) || 50));
    return `${90 + Math.cos(angle) * value * 0.62},${54 + Math.sin(angle) * value * 0.46}`;
  }).join(" ");
  return (
    <div className="page-marketing page-bg">
      <MarketingHeader />
      <main style={{ padding: "34px 46px 0" }}>
        <section style={{ display: "grid", gridTemplateColumns: "410px 1fr", gap: 38, minHeight: 420 }}>
          <div style={{ paddingTop: 34 }}>
            <div className="pill" style={{ color: "#332aff", background: "rgba(104,84,255,.09)", border: 0, height: 34 }}>✦ 专为 CSP-J/S 目标分提升设计</div>
            <h1 style={{ fontSize: 49, lineHeight: 1.23, letterSpacing: -1.2, fontWeight: 950, margin: "28px 0 22px" }}>
              为目标分，<br/>定制每一步<span className="text-grad">训练策略</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.9, color: "#3f4a75", margin: 0 }}>
              基于孩子的训练记录、代码提交和做题表现，<br/>AI 生成 CSP-J/S 目标分诊断、阶段规划、<br/>每日训练任务和家长可读报告。
            </p>
            <PrimaryLink href="/onboarding" className="mt-7" style={{ width: 310, marginLeft: 30 } satisfies CSSProperties}>免费测一次能力诊断 →</PrimaryLink>
            <div style={{ marginTop: 15, color: "#4f5a84", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={17} color="#4733ff"/>支持训练记录 / 代码数据导入，10 分钟生成诊断</div>
          </div>
          <div className="card-large" style={{ height: 410, borderRadius: 26, marginTop: 0, position: "relative", padding: 26, overflow: "hidden" }}>
            <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 12 }}>✦ 训练策略示例（CSP-J/S）</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: 370, position: "relative", zIndex: 1 }}>
              <div className="card" style={{ height: 122, padding: 16, background: "#fff" }}><Target size={25} color="#4b35ff"/><p style={{ margin: "10px 0 5px", fontWeight: 900 }}>当前预估分</p><b style={{ fontSize: 29 }}>{data.currentScore}<span style={{ fontSize: 15 }}> 分</span></b><div style={{ color: "#5e688e", fontSize: 12 }}>数据质量 {qualityLabel}</div></div>
              <div className="card" style={{ height: 122, padding: 16, background: "#fff" }}><Target size={25} color="#4b35ff"/><p style={{ margin: "10px 0 5px", fontWeight: 900 }}>目标分</p><b style={{ fontSize: 29 }}>{data.targetScore}<span style={{ fontSize: 15 }}> 分</span></b><div style={{ color: "#5e688e", fontSize: 12 }}>里程碑 {data.nextMilestone} 分</div></div>
              <div className="card" style={{ height: 122, padding: 16, background: "#fff" }}><Zap size={23} color="#4b35ff"/><p style={{ margin: "10px 0 5px", fontWeight: 900 }}>最大短板</p><b style={{ fontSize: 18 }}>{shortWeakness}</b><div className="progress-track" style={{ marginTop: 10 }}><div className="progress-fill" style={{ width: progressWidth }}/></div></div>
              <div className="card" style={{ height: 122, padding: 14, background: "#fff" }}><FileText size={22} color="#4b35ff"/><p style={{ margin: "6px 0 3px", fontWeight: 900 }}>今日计划</p><b style={{ display: "block", fontSize: 13, lineHeight: 1.22 }}>{planLines.map((line) => <span key={line}>{line}<br/></span>)}</b></div>
            </div>
            <Image src="/assets/payment-top-owl.png" alt="AI 教练" width={445} height={210} style={{ position: "absolute", right: -4, bottom: 38, width: 250, height: "auto", zIndex: 0 }} />
            <div style={{ position: "absolute", right: 10, top: -14, width: 210, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(145,130,255,.24), transparent 68%)" }} />
          </div>
        </section>

        <section id="features" className="card" style={{ marginTop: 16, minHeight: 170, padding: "24px 30px" }}>
          <h2 style={{ textAlign: "center", margin: "0 0 22px", fontSize: 24, fontWeight: 950 }}>核心功能 · 围绕目标分来训练</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
            {([
              [Target,"目标分诊断","精准定位当前水平与差距，给出提分方向与优先级"],
              [CalendarCheck,"阶段化规划","按目标分拆解阶段目标，生成个性化训练路径"],
              [ClipboardCheck,"每日任务推送","每天推送精准练习，保证节奏与效果"],
              [LineChart,"智能复盘","分析错题与薄弱点，持续优化训练策略"],
              [Users,"家长可读报告","用数据讲清进步与问题，让沟通更高效"],
            ] satisfies FeatureCard[]).map(([I,t,d]) => <div key={t} className="card" style={{ height: 112, padding: 16, textAlign: "center" }}><IconBubble icon={I} size={38}/><h3 style={{ margin: "8px 0 6px", fontSize: 15, fontWeight: 950 }}>{t}</h3><p style={{ margin: 0, color: "#5e688e", fontSize: 12, lineHeight: 1.55 }}>{d}</p></div>)}
          </div>
        </section>

        <section id="flow" className="card" style={{ marginTop: 16, padding: "22px 30px" }}>
          <h2 style={{ textAlign: "center", margin: "0 0 20px", fontSize: 24, fontWeight: 950 }}>训练流程 · 从诊断到提分</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
            {([
              [CloudUpload,"导入数据","导入训练记录 / 代码提交 / 做题记录，建立能力画像"],
              [Target,"AI 诊断","评估当前水平与薄弱点，预测目标分达成路径"],
              [ClipboardCheck,"制定计划","拆解阶段目标与每日任务，生成个性化训练计划"],
              [Code2,"执行训练","完成每日任务与专项练习，AI 实时调整任务难度"],
              [Brain,"智能复盘","错因分析与知识点巩固，强化薄弱环节"],
              [BarChart3,"目标达成","阶段目标稳定提升，稳步冲刺目标分"],
            ] satisfies FeatureCard[]).map(([I,t,d], i) => <div key={t} className="card" style={{ minHeight: 126, padding: 16, textAlign: "center", position: "relative" }}><span style={{ position: "absolute", left: 14, top: 12, width: 22, height: 22, borderRadius: "50%", background: "#8b78ff", color: "#fff", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{i+1}</span><IconBubble icon={I} size={42}/><h3 style={{ margin: "8px 0 6px", fontSize: 15, fontWeight: 950 }}>{t}</h3><p style={{ margin: 0, color: "#5e688e", fontSize: 11, lineHeight: 1.5 }}>{d}</p></div>)}
          </div>
        </section>

        <section className="card" style={{ marginTop: 16, padding: "24px 30px" }}>
          <h2 style={{ textAlign: "center", margin: "0 0 22px", fontSize: 24, fontWeight: 950 }}>目标分路径 · 看得见的提升</h2>
          <div style={{ display: "grid", gridTemplateColumns: "650px 1fr", gap: 22 }}>
            <div style={{ position: "relative", height: 170 }}>
              <svg width="650" height="160" viewBox="0 0 650 160">
                <path d="M20 120 C130 105 160 90 245 80 C330 68 375 46 470 40 C555 35 580 26 630 18" fill="none" stroke="#8f83ff" strokeWidth="3"/>
                {[20,165,300,470,630].map((x,i)=><circle key={i} cx={x} cy={[120,90,72,40,18][i]} r="7" fill="#5b43ff" stroke="#dcd8ff" strokeWidth="4" />)}
              </svg>
              <div style={{ position: "absolute", left: 0, bottom: 0, color: "#332aff", fontWeight: 900 }}>当前<br/>{stageStart}分</div>
              <div style={{ position: "absolute", right: 8, top: 0, color: "#332aff", fontWeight: 900 }}>目标<br/>{data.targetScore}分</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {["个性化提分路径","动态调整","科学复盘","冲刺保障"].map((t)=><div key={t} className="card" style={{ height: 42, display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}><ShieldCheck size={22} color="#5b43ff"/><b>{t}</b><span style={{ color: "#5e688e", fontSize: 12 }}>根据诊断结果，匹配最优提分策略</span></div>)}
            </div>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16, padding: "22px 30px" }}>
          <h2 style={{ textAlign: "center", margin: "0 0 20px", fontSize: 24, fontWeight: 950 }}>适合哪些学生</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
            {([[GraduationCap,"CSP-J/S 备考生"],[Zap,"成绩停滞期"],[HelpCircle,"竞赛入门生"],[Target,"冲刺高分段"],[Users,"需要陪伴与监督"]] satisfies SimpleCard[]).map(([I,t])=><div className="card" key={t} style={{ height: 98, textAlign: "center", padding: 15 }}><IconBubble icon={I} size={40}/><h3 style={{ margin: "6px 0 0", fontSize: 16 }}>{t}</h3><p style={{ margin: 0, fontSize: 11, color: "#5e688e" }}>系统备考，目标明确</p></div>)}
          </div>
        </section>

        <section id="report" className="card" style={{ marginTop: 16, padding: "14px 24px", minHeight: 172 }}>
          <div style={{ display: "grid", gridTemplateColumns: "298px 166px 138px 246px", gap: 12, alignItems: "stretch" }}>
            <div>
              <b style={{ fontSize: 14 }}>阶段进展总览</b>
              <div style={{ marginTop: 7, color: "#5e688e", fontSize: 10 }}>{data.generatedAt?.slice(5, 10) ?? "本周"} - {data.currentStage}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 8 }}>
                {reportMetrics.map((item) => (
                  <div key={item.label} className="card" style={{ height: 45, padding: "7px 10px", boxShadow: "none", borderRadius: 8 }}>
                    <b style={{ display: "block", fontSize: 14, lineHeight: 1 }}>{item.value}</b>
                    <span style={{ display: "block", color: "#667096", fontSize: 9, marginTop: 4 }}>{item.label}</span>
                    <span style={{ color: "#17a66b", fontSize: 9 }}>{item.change}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
              <svg width="170" height="110" viewBox="0 0 180 112" aria-label="能力雷达图">
                <polygon points="90,8 137,37 122,90 58,90 43,37" fill="#f1efff" stroke="#d9d4ff" strokeWidth="1" />
                <polygon points="90,22 123,43 112,78 68,78 57,43" fill="#eeeaff" stroke="#d9d4ff" strokeWidth="1" />
                <polygon points={radarPoints} fill="rgba(92,65,255,.25)" stroke="#684dff" strokeWidth="2" />
                {[["算法思维",90,6],["数据结构",132,86],["编程实力",47,86],["代码调试",36,43],["基础稳固",136,43]].map(([text, x, y]) => (
                  <text key={text} x={Number(x)} y={Number(y)} textAnchor="middle" fontSize="8" fill="#596389">{text}</text>
                ))}
              </svg>
            </div>
            <div className="card" style={{ padding: 12, boxShadow: "none", borderRadius: 10, overflow: "hidden" }}>
              <b style={{ fontSize: 14 }}>本周重点</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, lineHeight: 1.75, color: "#334066", fontSize: 10 }}>
                {[data.mainGoal, mainWeakness, recentReview?.nextAction ?? `冲刺 ${stageMid} 分里程碑`].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["训练数据可视化", "时长、正确率、题型分布一目了然"],
                ["错题分析与建议", "AI 分析错因，给出针对性建议"],
                ["阶段目标跟踪", "阶段目标完成情况，清晰可见"]
              ].map(([title, desc]) => (
                <div className="card" key={title} style={{ height: 39, display: "flex", alignItems: "center", gap: 9, padding: "0 12px", boxShadow: "none", borderRadius: 9 }}>
                  <MiniSquare icon={CheckCircle2}/>
                  <span><b style={{ display: "block", fontSize: 12 }}>{title}</b><span style={{ color: "#667096", fontSize: 9 }}>{desc}</span></span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer style={{ height: 86, display: "grid", gridTemplateColumns: "250px 120px 120px 120px 1px 220px", alignItems: "center", gap: 10, padding: "0 58px", borderTop: "1px solid #edf0f8", marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", columnGap: 8, alignItems: "center" }}>
          <Image src="/assets/brand-owl.png" alt="千里策" width={36} height={36} />
          <div><b style={{ fontSize: 20, lineHeight: 1 }}>千里策</b><br/><span style={{ color: "#5e688e", fontSize: 10 }}>CSP-J/S 目标分训练教练</span></div>
          <span style={{ gridColumn: "1 / -1", color: "#5e688e", fontSize: 11, marginTop: 6 }}>为目标分而训练，让每一步都更有价值。</span>
        </div>
        <div style={{ color: "#566081", fontSize: 11, lineHeight: 1.7 }}><b style={{ color: "#11183e" }}>产品</b><br/>产品介绍<br/>核心功能<br/>训练流程</div>
        <div style={{ color: "#566081", fontSize: 11, lineHeight: 1.7 }}><b style={{ color: "#11183e" }}>资源</b><br/>家长报告<br/>学习指南<br/>常见问题</div>
        <div style={{ color: "#566081", fontSize: 11, lineHeight: 1.7 }}><b style={{ color: "#11183e" }}>关于我们</b><br/>关于我们<br/>联系我们<br/>加入我们</div>
        <div style={{ width: 1, height: 58, background: "#e5e9f5" }} />
        <div style={{ color: "#6b7497", fontSize: 10, lineHeight: 1.8 }}>
          <b style={{ color: "#566081" }}>关注我们</b>
          <div style={{ display: "flex", gap: 10, margin: "5px 0" }}>{["微","知","B","小"].map((x) => <span key={x} style={{ width: 18, height: 18, borderRadius: "50%", background: "#8d96ad", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{x}</span>)}</div>
          © 2024 千里策 All rights reserved.<br/>隐私政策　｜　用户协议
        </div>
      </footer>
    </div>
  );
}
