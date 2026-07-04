import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/Ui";
import { formatErrorDetail } from "@/src/lib/json";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";
import { DataQualityService } from "@/src/server/quality/data-quality-service";

export const dynamic = "force-dynamic";

type DataQualityPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function DataQualityPage({ params }: DataQualityPageProps) {
  const { subjectId } = await params;
  const result = await readDataQuality(subjectId);

  return (
    <AppShell activeHref="/dashboard">
      <div className="content-page">
        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 950 }}>数据质量报告</h1>
        <p style={{ color: "#53608d", fontSize: 17, marginTop: 10 }}>Subject #{subjectId} 的公开数据可信度。</p>
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          {result.local ? (
            <>
              <div className="metric-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 0 }}>
                <Metric title="总分" value={result.local.overallScore} tone={result.local.confidenceLevel === "HIGH" ? "green" : "orange"} />
                <Metric title="可信度" value={result.local.confidenceLevel} tone={result.local.confidenceLevel === "HIGH" ? "green" : "orange"} />
                <Metric title="可分析代码" value={result.local.codeFileCount} tone="purple" />
              </div>
              <div className="detail-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 18 }}>
                <Score label="公开提交" value={result.local.submissionCount} />
                <Score label="题目覆盖" value={result.local.problemCount} />
                <Score label="当前估分" value={result.local.currentScore} />
                <Score label="目标分" value={result.local.targetScore} />
              </div>
              <h2 className="section-title" style={{ marginTop: 28 }}>真实数据来源</h2>
              <p className="small-muted" style={{ lineHeight: 2 }}>
                当前没有配置 PostgreSQL，页面已回退读取 `data/local-loop` 真实分析产物：
                UID {result.local.uid}，最近提交 {result.local.latestSubmitDate ?? "无公开最近提交日期"}。
              </p>
              <div className="report-actions" style={{ marginTop: 24 }}>
                <Link className="btn-outline" href="/analyze">重新分析 UID</Link>
                <Link className="btn-primary" href="/dashboard">进入目标总览</Link>
              </div>
            </>
          ) : !result.ok ? (
            <StateMessage title="无法读取数据质量" message={result.error} />
          ) : !result.report ? (
            <StateMessage title="暂无数据质量报告" message="请先完成一次 Luogu 同步。" />
          ) : (
            <>
              <div className="metric-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 0 }}>
                <Metric title="总分" value={result.report.overallScore} tone={result.report.confidenceLevel === "HIGH" ? "green" : "orange"} />
                <Metric title="可信度" value={result.report.confidenceLevel} tone={result.report.confidenceLevel === "HIGH" ? "green" : "orange"} />
                <Metric title="手动复盘补充" value={result.report.manualReviewScore} tone="purple" />
              </div>
              <div className="detail-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 18 }}>
                <Score label="记录深度" value={result.report.recordDepthScore} />
                <Score label="题目信息" value={result.report.problemDetailScore} />
                <Score label="标签覆盖" value={result.report.tagCoverageScore} />
                <Score label="新鲜度" value={result.report.freshnessScore} />
              </div>
              <h2 className="section-title" style={{ marginTop: 28 }}>缺失与风险</h2>
              <ul style={{ lineHeight: 2, color: "#36426d" }}>
                {toArray(result.report.issueJson).length ? toArray(result.report.issueJson).map((item, index) => <li key={index}>{String(item)}</li>) : <li>当前暂无阻塞性数据质量问题。</li>}
              </ul>
              <div className="report-actions" style={{ marginTop: 24 }}>
                <Link className="btn-outline" href="/analyze">重新分析 UID</Link>
                <Link className="btn-primary" href="/dashboard">进入目标总览</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

async function readDataQuality(subjectId: string) {
  try {
    if (!/^\d+$/.test(subjectId)) return { ok: true as const, report: null };
    const report = await new DataQualityService().latest(BigInt(subjectId));
    return { ok: true as const, report };
  } catch (error) {
    const detail = formatErrorDetail(error);
    if (detail.includes("DATABASE_URL")) {
      const profile = await getLocalLoopProfile();
      return {
        ok: true as const,
        report: null,
        local: {
          uid: profile.uid,
          overallScore: profile.dataQuality === "HIGH" ? 81 : 60,
          confidenceLevel: profile.dataQuality,
          submissionCount: profile.submissionCount,
          problemCount: profile.problemCount,
          codeFileCount: profile.codeFileCount,
          currentScore: profile.currentScore,
          targetScore: profile.targetScore,
          latestSubmitDate: profile.latestSubmitDate
        }
      };
    }
    return { ok: false as const, error: formatErrorDetail(error) };
  }
}

function Metric({ title, value, tone }: { title: string; value: React.ReactNode; tone: "green" | "orange" | "purple" }) {
  return <div className="metric-card card"><div className="label">{title}</div><div className="value">{value}</div><Badge tone={tone}>data_quality</Badge></div>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div className="card" style={{ padding: 18 }}><div className="small-muted">{label}</div><b style={{ fontSize: 26 }}>{value}</b></div>;
}

function StateMessage({ title, message }: { title: string; message: string }) {
  return <div><h2 className="section-title">{title}</h2><p className="small-muted">{message}</p></div>;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
