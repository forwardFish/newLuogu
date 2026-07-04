import Image from "next/image";
import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import { BookOpen, CheckCircle2, Code2, FileText, Gift, HelpCircle, PenLine, Star, TrendingUp } from "lucide-react";
import { Badge, IconBubble } from "@/components/Ui";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";

export const dynamic = "force-dynamic";

export default async function InsufficientPage() {
  const profile = await getLocalLoopProfile();
  const isEnough = profile.dataQuality === "HIGH" || profile.submissionCount >= 200 || profile.problemCount >= 50;

  return (
    <div className="page-1448 insufficient-page page-bg">
      <MarketingHeader brandName="AI 信奥训练教练" />
      <div className="ins-card card-large">
        <div className="ins-main">
          <Image src="/assets/analysis-owl.png" alt="数据质量" width={310} height={270} className="ins-owl" />
          <div className="ins-content">
            <h1>{isEnough ? "当前数据足以生成训练计划" : "当前数据还不足以生成可靠训练计划"}</h1>
            <p style={{ fontSize: 17, color: "#3f4a75", lineHeight: 1.8, margin: "12px 0 0" }}>
              本页读取 `data/local-loop` 的真实质量指标。当前 UID 为 {profile.uid}，
              数据质量为 {profile.dataQuality}，提交记录 {profile.submissionCount} 条，覆盖题目 {profile.problemCount} 道。
            </p>
            <div className="quality-box">
              <IconBubble icon={TrendingUp} />
              <div><b style={{ fontSize: 18 }}>当前数据质量</b><br /><span className="small-muted">来自 student analysis / today report</span></div>
              <Badge tone={isEnough ? "green" : "orange"}>{profile.dataQuality}</Badge>
              <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24, color: "#3f4a75", lineHeight: 1.5 }}>
                {isEnough ? "可以直接进入分析结果和今日训练" : "建议继续补充近期训练数据"}
              </div>
            </div>
            <div className="reason-row">
              <h2 className="section-title">当前证据概览 <HelpCircle size={17} color="#687295" /></h2>
              <div className="reason-boxes">
                <div className="reason-box"><IconBubble icon={FileText} size={42} /><div><b>提交记录</b><br /><span className="small-muted">{profile.submissionCount} 条公开提交记录。</span></div></div>
                <div className="reason-box"><IconBubble icon={Code2} size={42} /><div><b>可分析代码</b><br /><span className="small-muted">{profile.codeFileCount} 份本地代码文件参与分析。</span></div></div>
                <div className="reason-box"><IconBubble icon={BookOpen} size={42} /><div><b>题目覆盖</b><br /><span className="small-muted">{profile.problemCount} 道题，最近提交 {profile.latestSubmitDate ?? "暂无记录"}。</span></div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="todo-panel">
          <h2 className="section-title">{isEnough ? "下一步可以这样做" : "你可以这样补充数据"}</h2>
          <div className="todo-cards">
            <div className="todo-card green"><CheckCircle2 color="#29b56f" /><div><b style={{ color: "#1aa465" }}>查看分析结果</b><br /><span className="small-muted">进入当前阶段、短板和目标分差距页，确认训练方向。</span></div></div>
            <div className="todo-card blue"><PenLine color="#2f7cff" /><div><b style={{ color: "#2f7cff" }}>开始今日训练</b><br /><span className="small-muted">使用 today.json 中真实选题，完成后记录训练结果。</span></div></div>
            <div className="todo-card orange"><Star color="#ff9f1c" /><div><b style={{ color: "#f38b13" }}>继续积累近期证据</b><br /><span className="small-muted">近期练习越充分，估分和复盘越能反映当前状态。</span></div></div>
          </div>
        </div>
        <div className="ins-buttons">
          <Link className="btn-primary" href={isEnough ? "/analysis/result" : "/onboarding/step-4"} style={{ width: 300 }}><Gift size={22} />{isEnough ? "查看分析结果" : "补充 Luogu UID"}</Link>
          <Link className="btn-outline" href="/today" style={{ width: 300 }}><BookOpen size={22} />进入今日训练</Link>
        </div>
        <div className="explain-box">
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <IconBubble icon={HelpCircle} size={72} />
            <div>
              <h2 className="section-title">为什么要看数据质量？</h2>
              <p className="small-muted">AI 教练需要足够的公开提交记录、题目覆盖和本地代码证据，才能识别知识掌握情况、解题习惯和思维模式。数据越充分，训练计划越有针对性。</p>
            </div>
          </div>
          <div style={{ lineHeight: 2, color: "#53608d" }}>
            <div>▣ 提交记录：{profile.submissionCount}</div>
            <div>▣ 题目覆盖：{profile.problemCount}</div>
            <div>▣ 代码文件：{profile.codeFileCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
