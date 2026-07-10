import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ReviewNoteForm from "./ReviewNoteForm";
import { getLocalLoopUiData, type UiData } from "@/src/server/local-loop/ui-data";
import { AlertTriangle, CheckCircle2, CircleHelp, Lightbulb, RefreshCw, Share2, Sparkles, X } from "lucide-react";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams?: Promise<{ problemPid?: string }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const data = await getLocalLoopUiData();
  const review = data.reviews.find((item) => item.problemPid === params?.problemPid) ?? data.reviews[0] ?? null;
  const problemPid = review?.problemPid ?? data.evidenceProblems[0]?.pid ?? "P1000";
  const problemTitle = data.evidenceProblems.find((item) => item.pid === problemPid)?.title ?? "本地训练题目";
  const submissions = data.submissions.slice(0, 4);
  const feedback = review?.studentFeedback ?? "系统根据提交轨迹、代码变化和题目特征，分析本次训练暴露的关键问题。";

  return (
    <AppShell
      activeHref="/calendar"
      className="review-reference-shell"
      logo="a"
      nav={[
        { href: "/dashboard", label: "目标总览", icon: "dashboard" },
        { href: "/today", label: "今日训练", icon: "today" },
        { href: "/calendar", label: "训练日历", icon: "calendar" },
        { href: "/report", label: "周报计划", icon: "report" }
      ]}
    >
      <div className="review-reference-page">
        <div className="review-reference-breadcrumb">
          <Link href="/calendar" className="review-back" aria-label="返回训练日历">←</Link>
          <span>训练日历</span><b>/</b><span>题目详情</span><b>/</b><strong>AI 深度复盘</strong>
        </div>
        <button className="review-share" type="button"><Share2 size={16} /> 分享复盘</button>
        <Image src="/assets/review-top-owl.png" alt="" width={220} height={110} className="review-reference-hero" priority />

        <header className="review-reference-title">
          <h1>这道题的 <span className="text-grad">AI 深度复盘</span></h1>
          <p>系统根据提交记录、代码变化和题目特征，分析这次训练暴露的问题。</p>
        </header>

        <section className="review-sync-card card">
          <h2><CheckCircle2 size={24} /> 基本掌握，但稳定性不足</h2>
          <p>{feedback}</p>
          <div className="review-sync-grid">
            <ReviewFact label="最终结果" value={review?.result ?? "Accepted"} tone="green" icon={<CheckCircle2 size={20} />} />
            <ReviewFact label="提交次数" value={`${review?.submissionCount ?? submissions.length} 次`} icon={<RefreshCw size={20} />} />
            <ReviewFact label="首次通过" value="第 3 次提交" icon={<Lightbulb size={20} />} tone="orange" />
            <ReviewFact label="掌握等级" value="中高" icon={<Sparkles size={20} />} tone="orange" />
          </div>
        </section>

        <section className="review-signals-card card">
          <h2><Sparkles size={21} /> AI 发现的关键信号</h2>
          <div className="review-signal-grid">
            <Signal icon={<RefreshCw />} title="不是一次通过" text="前两次提交未通过，说明第一次建模或实现存在明显偏差。" tone="purple" />
            <Signal icon={<RefreshCw />} title="后续能修正" text="第 3、4 次提交通过，说明你具备修正能力，但初始判断不够稳定。" tone="blue" />
            <Signal icon={<AlertTriangle />} title="风险集中在 T2" text="这类问题会直接影响 T2 得分稳定性，需要重点关注。" tone="orange" />
          </div>
        </section>

        <section className="review-timeline-card card">
          <h2><RefreshCw size={20} /> 提交轨迹</h2>
          <div className="review-timeline">
            {submissions.map((row, index) => {
              const passed = String(row[1]).toLowerCase().includes("ac") || String(row[1]).toLowerCase().includes("accept");
              return <div className="review-timeline-item" key={`${row[0]}-${index}`}>
                <span className={`review-timeline-dot ${passed ? "passed" : "failed"}`}>{passed ? "✓" : <X size={16} />}</span>
                <strong>第 {index + 1} 次提交</strong>
                <em>{passed ? "Accepted" : "Unaccepted"}</em>
                <small>{row[0]}</small>
              </div>;
            })}
          </div>
          <div className="review-ai-note"><Sparkles size={18} /><b>AI 解读：</b><span>从连续失败到最终通过，说明你具备修正能力，但第一次建模质量不够稳定。</span><button type="button">查看完整提交记录⌄</button></div>
        </section>

        <section className="review-analysis-card card">
          <div className="review-analysis-heading"><h2>AI 深度分析</h2><span>基于你的提交记录与题目特征分析</span></div>
          <ReviewAnalysisSection no="1" title="本题掌握情况判断">从最终结果看，你已经通过了本题，说明你能够找到可行解法并完成实现。但从提交过程看，这道题并不是一次稳定通过，而是经历了连续失败后才修正成功，因此不能简单判断为完全掌握。</ReviewAnalysisSection>
          <ReviewAnalysisSection no="2" title="做题过程暴露的问题">本题的提交轨迹显示，你在前两次提交中没有通过，后续通过修改代码才得到 Accepted。这说明你的问题大概率不是完全不会，而是在初始阶段没有准确抓住不变量和边界。</ReviewAnalysisSection>
          <ReviewAnalysisSection no="3" title="这类问题为什么危险">如果把这种不稳定的判断带到正式比赛中，问题会被放大。尤其是在时间压力下，第一次建模不稳定会消耗大量调试时间，影响后续题目的完成。</ReviewAnalysisSection>
          <ReviewAnalysisSection no="4" title="AI 对能力结构的判断"><ul><li><b>基础实现能力：</b>较好。你能够完成代码实现，并在修正后通过题目。</li><li><b>题意转化能力：</b>中等。你需要进一步加强从题面抽取状态和边界条件的能力。</li><li><b>建模稳定性：</b>偏弱。本题的核心风险在于第一次建模不够稳定。</li><li><b>复盘修正能力：</b>较好。连续提交后能够修正问题，说明你不是卡死型选手。</li></ul></ReviewAnalysisSection>
          <ReviewAnalysisSection no="5" title="对目标分的影响">如果你的目标是 CSP-S 200 分，这类题必须稳定拿分。建议先巩固 T1，再通过同类迁移题训练 T2 建模入口，减少因为第一次建模不稳造成的非必要失分。</ReviewAnalysisSection>
        </section>

        <section className="review-note-card card">
          <h2><Lightbulb size={19} /> 补充你的思路 <span>（可选）</span></h2>
          <p>记录这道题的关键想法、踩过的坑、收获的经验，AI 会根据你的补充更新复盘内容。</p>
          <ReviewNoteForm problemPid={problemPid} initialNote={review?.studentSummary} />
        </section>
        <p className="review-reference-footer">复盘内容由 AI 生成，仅供参考，最终结论请以你的训练目标为准。</p>
      </div>
    </AppShell>
  );
}

function ReviewFact({ label, value, icon, tone = "purple" }: { label: string; value: string; icon: React.ReactNode; tone?: string }) {
  return <div className="review-fact"><span className={`review-fact-icon ${tone}`}>{icon}</span><div><small>{label}</small><b>{value}</b></div></div>;
}

function Signal({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: string }) {
  return <div className={`review-signal ${tone}`}><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div>;
}

function ReviewAnalysisSection({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return <div className="review-analysis-section"><span>{no}</span><div><h3>{title}</h3><div>{children}</div></div></div>;
}
