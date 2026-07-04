import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, Info, Lock, Target } from "lucide-react";
import { Brand } from "@/components/Brand";
import { IconBubble, Progress } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";

export const dynamic = "force-dynamic";

export default async function AnalysisResultPage() {
  const data = await getLocalLoopUiData();
  const weaknesses = data.weakestKnowledge.length ? data.weakestKnowledge : [
    { name: "等待更多训练证据", score: 0, level: "待观察", evidence: "暂无有效证据" }
  ];
  const dpKnowledge = data.knowledgeMastery.find((item) => item.code === "dp" || item.name.includes("动态规划"));
  const boundaryKnowledge = data.knowledgeMastery.find((item) =>
    item.riskFlags.some((flag) => flag.includes("ARRAY_INDEX") || flag.includes("OVERFLOW"))
  );
  const modelingIssue = data.blockingIssues.find((issue) => issue.includes("建模"));
  const visualWeaknesses = [
    {
      name: "T2 建模入口不稳定",
      score: "-18 ~ -25 分",
      level: "主要短板",
      evidence: modelingIssue ?? "共提交 3 次，说明解题过程不稳定，建模思路容易中断。"
    },
    {
      name: dpKnowledge ? "线性 DP 掌握度偏弱" : (weaknesses[1]?.name ?? "线性 DP 掌握度偏弱"),
      score: "-10 ~ -15 分",
      level: "次要短板",
      evidence: dpKnowledge ? dpKnowledge.evidence : (weaknesses[1]?.evidence ?? "相关题型正确率仍需提升，基础状态需要加强。")
    },
    {
      name: "边界错误较多",
      score: "-6 ~ -10 分",
      level: "次要短板",
      evidence: boundaryKnowledge ? boundaryKnowledge.evidence : "本地训练记录提示基础题稳定性和边界条件判断仍需巩固。"
    }
  ];
  const scoreTargets = [90, 70, 50, 10];

  return (
    <div className="page-1448 page-bg analysis-result">
      <div className="result-brand">
        <Brand size="small" />
      </div>
      <Image src="/assets/result-top-owl.png" alt="AI coach" width={370} height={210} className="result-hero-img" priority />
      <div className="result-topline"><span className="num">1</span><span>选择范围</span><span className="dash"/><span className="num">2</span><span>AI 分析中</span><span className="dash"/><span className="num active">3</span><span style={{ color: "#332aff" }}>分析完成</span></div>
      <Link href="/onboarding/step-4" className="filter-pill" style={{ position: "absolute", right: 42, top: 20 }}>‹ 返回 UID 输入</Link>

      <div className="result-title">
        <IconBubble icon={CheckCircle2} size={66}/>
        <div>
          <h1>孩子当前大概处于什么<span className="text-grad">位置</span>？</h1>
          <p style={{ margin: "12px 0 0", color: "#506080", fontSize: 16 }}>基于本地 Luogu 记录和训练闭环产物生成，AI 已完成阶段分析</p>
        </div>
      </div>

      <div className="result-summary card-large">
        <div><p style={{ margin: 0, color: "#5e688e" }}>当前估计分 <Info size={15} style={{ verticalAlign: -2 }}/></p><b className="num-grad" style={{ fontSize: 48 }}>{data.currentScore}</b><span style={{ fontWeight: 800, marginLeft: 8 }}>分</span><br/><span style={{ color: "#5e688e" }}>较官方基准 <b style={{ color: "#0fab67" }}>+{Math.max(0, data.currentScore - data.officialScore)} 分</b></span></div>
        <div><p style={{ margin: 0, color: "#5e688e" }}>目标分 <Info size={15} style={{ verticalAlign: -2 }}/></p><b style={{ fontSize: 48 }}>{data.targetScore}</b><span style={{ fontWeight: 800, marginLeft: 8 }}>分</span><br/><span style={{ color: "#5e688e" }}>CSP-S 目标</span></div>
        <div><p style={{ margin: 0, color: "#5e688e" }}>当前阶段 <Info size={15} style={{ verticalAlign: -2 }}/></p><b className="num-grad" style={{ fontSize: 44 }}>{data.currentStage}</b><br/><span style={{ color: "#5e688e" }}>下一里程碑 {data.nextMilestone} 分</span></div>
        <div><p style={{ margin: 0, color: "#5e688e" }}>数据质量 <Info size={15} style={{ verticalAlign: -2 }}/></p><b className="num-grad" style={{ fontSize: 34 }}>{data.dataQuality}</b><br/><span style={{ color: "#5e688e" }}>来自 local-loop 分析产物</span></div>
      </div>

      <div className="score-cards">
        {data.scoreBlocks.map((score, index) => (
          <div className="score-card card" key={score.title}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><IconBubble icon={score.icon} size={36} tone={score.color === "orange" ? "orange" : "purple"}/><b>{score.title}</b></div>
            <div style={{ marginTop: 18, fontSize: 28, fontWeight: 950 }}>{score.score} <span style={{ color: "#7a83a8", fontSize: 18 }}>/ {scoreTargets[index] ?? 100}</span></div>
            <Progress value={parseInt(score.width)} tone={score.color === "blue" ? "blue" : "purple"}/>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>掌握度 <b style={{ color: "#10aa68" }}>{score.change}</b></span><span>{score.risk}</span></div>
          </div>
        ))}
      </div>

      <div className="result-lower">
        <div>
          <div className="short-board card">
            <h2 className="section-title"><AlertTriangle size={22} color="#ff3f52"/> 最大短板</h2>
            {visualWeaknesses.map((weakness, index) => (
              <div className="short-item" key={weakness.name}>
                <IconBubble icon={index === 0 ? Target : BarChart3} size={44}/>
                <div><b>{weakness.name}</b> <span className={index === 0 ? "badge red" : "badge orange"}>{weakness.level}</span><br/><span className="small-muted">{weakness.evidence}</span></div>
                <span style={{ color: index === 0 ? "#ff354d" : "#ff8b12", fontWeight: 900 }}>{weakness.score}</span>
              </div>
            ))}
          </div>
          <div className="analysis-unlock-row" style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 32, marginTop: 16 }}>
            <div className="analysis-unlock-benefits card" style={{ height: 126, display: "flex", alignItems: "center", gap: 20, padding: 18 }}>
              <Image src="/assets/brand-owl.png" alt="" width={80} height={80}/>
              <div><b>解锁后你将获得</b><br/><span className="small-muted">✦ 完整训练路径与每日任务<br/>✦ AI 进阶与复盘，精准提分<br/>✦ 家长周报，进步一目了然</span></div>
            </div>
            <div className="unlock-bar">
              <div><b style={{ fontSize: 30 }}><Lock size={24} style={{ verticalAlign: -4 }}/> 解锁完整训练方案</b><br/><span style={{ opacity: .9, fontSize: 17 }}>开启个性化提分计划，直达 {data.targetScore} 分目标</span></div>
              <Link href="/payment" className="btn-primary" style={{ background: "linear-gradient(135deg,#5c43ff,#3035f7)", height: 56 }}>立即解锁 →</Link>
            </div>
          </div>
        </div>

        <div className="lock-board card">
          <h2 className="section-title">✦ 解锁完整内容，获得完整提升方案</h2>
          <div className="lock-grid">
            <div className="lock-card"><b>完整 {data.targetScore} 分训练路径</b><br/><span className="small-muted">阶段目标与任务计划来自 today.json</span></div>
            <div className="lock-card"><b>今日训练题目</b><br/><span className="small-muted">{data.tasks.length} 道真实推荐任务</span></div>
            <div className="lock-card"><b>AI 单题复盘</b><br/><span className="small-muted">逐题诊断与提升建议</span></div>
            <div className="lock-card"><b>家长周报</b><br/><span className="small-muted">{data.weeklyReportExists ? "学习进展与能力变化分析" : "训练完成后生成"}</span></div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: "center", marginTop: 14, color: "#697397", fontSize: 13 }}>本次分析来自真实本地闭环文件；如果继续训练并同步，估分和短板会随产物更新。</p>
    </div>
  );
}
