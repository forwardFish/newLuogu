import Image from "next/image";
import { Check, CheckCircle2, Clock } from "lucide-react";
import AppTopHeader, { LuoguPill } from "@/components/AppTopHeader";
import AutoRedirect from "@/components/AutoRedirect";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";

export const dynamic = "force-dynamic";

export default async function AnalysisLoadingPage() {
  const profile = await getLocalLoopProfile();

  return (
    <div className="page-1448 page-bg">
      <AutoRedirect to="/analysis/result" delay={1800} />
      <AppTopHeader />
      <main className="analysis-loading">
        <h1>正在为你生成<span className="text-grad">专属分析</span>...</h1>
        <p style={{ color: "#58628b", fontSize: 16, margin: "0 0 20px" }}>基于 Luogu 公开提交记录和本地训练闭环产物，生成当前差距与训练路径。</p>
        <LuoguPill />
        <div className="loading-card card-large">
          <div className="loading-left">
            <div className="loading-progress-row"><span style={{ fontWeight: 900 }}>整体进度</span><div className="progress-track"><div className="progress-fill" style={{ width: "70%" }}/></div><span className="loading-percent">70%</span></div>
            <p style={{ color: "#58628b", fontSize: 14, marginTop: 26 }}>分析完成后将自动跳转到分析结果</p>
            <div className="loading-steps">
              <div className="loading-step"><span className="step-circle"><Check size={22}/></span><div><b>正在读取 Luogu 公开提交记录</b><br/><span className="small-muted">已读取 {profile.submissionCount} 条提交记录，覆盖 {profile.problemCount} 道题</span></div><div style={{ color: "#5d668c", display: "flex", gap: 10, alignItems: "center" }}>已完成 <CheckCircle2 size={18} color="#1ab56e"/></div></div>
              <div className="loading-step"><span className="step-circle"><Check size={22}/></span><div><b>正在分析代码习惯</b><br/><span className="small-muted">本地代码文件 {profile.codeFileCount} 份，识别实现风险和常见模式</span></div><div style={{ color: "#5d668c", display: "flex", gap: 10, alignItems: "center" }}>已完成 <CheckCircle2 size={18} color="#1ab56e"/></div></div>
              <div className="loading-step"><span className="step-circle current"/><div><b>正在识别薄弱知识点</b><br/><span className="small-muted">对比知识点掌握情况、正确率和多次提交证据</span></div><div style={{ color: "#332aff", display: "flex", gap: 10, alignItems: "center" }}>进行中 <span className="spinner"/></div></div>
              <div className="loading-step"><span className="step-circle pending"/><div><b>正在估算 CSP-S 当前分数</b><br/><span className="small-muted">当前估分 {profile.currentScore}，数据质量 {profile.dataQuality}</span></div><div style={{ color: "#5d668c" }}>等待中　<span className="status-dot gray" /></div></div>
              <div className="loading-step"><span className="step-circle pending"/><div><b>正在生成 {profile.targetScore} 分训练路径</b><br/><span className="small-muted">规划今日任务、复盘入口和家长周报证据</span></div><div style={{ color: "#5d668c" }}>等待中　<span className="status-dot gray" /></div></div>
            </div>
          </div>
          <Image src="/assets/analysis-owl.png" alt="分析中" width={555} height={470} className="loading-owl" priority />
        </div>
        <div className="loading-note"><Clock size={20} style={{ verticalAlign: "middle", marginRight: 8 }}/>这是可视化加载页；真实分析产物来自 data/local-loop，最近提交：{profile.latestSubmitDate ?? "暂无记录"}。</div>
      </main>
    </div>
  );
}
