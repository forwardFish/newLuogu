import Image from "next/image";
import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import { BarChart3, BrainCircuit, CheckCircle2, ChevronRight, ClipboardList, PenLine, Target, UploadCloud } from "lucide-react";
import { IconBubble } from "@/components/Ui";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";

export const dynamic = "force-dynamic";

export default async function InsufficientPage() {
  const profile = await getLocalLoopProfile();
  const requiredRecentSubmits = 14;
  const missingRecentSubmits = Math.max(0, requiredRecentSubmits - Math.min(profile.submissionCount, requiredRecentSubmits));

  return (
    <div className="page-1448 insufficient-page page-bg">
      <MarketingHeader brandName="AI 信奥训练教练" />
      <main className="ins-card card-large">
        <section className="ins-hero">
          <div className="ins-art">
            <Image src="/assets/insufficient-reference-owl.png" alt="训练数据" width={440} height={520} className="ins-owl" priority />
          </div>

          <div className="ins-copy">
            <h1>还需要一点训练数据，<br />才能生成专属训练计划</h1>
            <p>
              目前系统还不能生成可靠的专属训练计划，你可以先做一组基础训练，
              系统会根据你的完成情况建立初始能力画像。
              如果你已经有洛谷提交记录，也可以先补充数据，让分析更准确。
            </p>

            <div className="ins-status">
              <IconBubble icon={BarChart3} size={58} />
              <div className="ins-status-main">
                <span>当前状态</span>
                <strong>训练记录不足</strong>
                <small>UID {profile.uid} · 数据质量 {profile.dataQuality}</small>
              </div>
              <ul>
                <li>近 {requiredRecentSubmits} 天训练记录 {missingRecentSubmits === 0 ? "待校准" : `还差 ${missingRecentSubmits} 条`}</li>
                <li>题目提交结果</li>
                <li>最近错题或复盘内容</li>
              </ul>
            </div>

            <div className="ins-actions">
              <Link className="btn-primary" href="/today"><PenLine size={20} />开始基础训练</Link>
              <Link className="btn-outline" href="/onboarding/step-4"><UploadCloud size={20} />补充训练数据</Link>
            </div>
          </div>
        </section>

        <section className="ins-flow">
          <h2>接下来会发生什么</h2>
          <div className="ins-flow-row">
            <div className="ins-step">
              <span className="ins-step-no">1</span>
              <IconBubble icon={ClipboardList} size={62} />
              <div>
                <strong>做 3 道基础训练题</strong>
                <p>建立初始能力画像</p>
              </div>
            </div>
            <ChevronRight className="ins-chevron" size={32} />
            <div className="ins-step">
              <span className="ins-step-no">2</span>
              <IconBubble icon={BrainCircuit} size={62} />
              <div>
                <strong>自动生成初步 AI 复盘</strong>
                <p>识别主要问题</p>
              </div>
            </div>
            <ChevronRight className="ins-chevron" size={32} />
            <div className="ins-step">
              <span className="ins-step-no">3</span>
              <IconBubble icon={Target} size={62} />
              <div>
                <strong>解锁专属训练计划</strong>
                <p>生成每日训练安排</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="ins-note">
          <CheckCircle2 size={18} />
          <span>完成基础训练后，系统会自动生成初步 AI 复盘；当训练记录足够后，会升级为目标分训练计划。</span>
        </footer>
      </main>
    </div>
  );
}
