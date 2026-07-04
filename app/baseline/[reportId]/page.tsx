import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/Ui";
import { formatErrorDetail } from "@/src/lib/json";
import { prisma } from "@/src/lib/prisma";
import { readLocalJson } from "@/src/server/local-loop/local-loop-files";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";

export const dynamic = "force-dynamic";

type BaselinePageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function BaselineReportPage({ params }: BaselinePageProps) {
  const { reportId } = await params;
  const result = await readBaselineReport(reportId);

  return (
    <AppShell activeHref="/dashboard">
      <div className="content-page">
        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 950 }}>CSP-S 差距分析报告</h1>
        <p style={{ color: "#53608d", fontSize: 17, marginTop: 10 }}>Baseline report #{reportId}</p>
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          {result.local ? (
            <>
              <div className="metric-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 0 }}>
                <Metric title="当前估分" value={result.local.currentScore} />
                <Metric title="目标分" value={result.local.targetScore} />
                <Metric title="数据质量" value={result.local.dataQuality} />
                <Metric title="校准状态" value={result.local.calibrationStatus} />
              </div>

              <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 24 }}>
                <section className="card" style={{ padding: 22 }}>
                  <h2 className="section-title">能力分</h2>
                  <KeyValueList value={result.local.slotReadiness} />
                </section>
                <section className="card" style={{ padding: 22 }}>
                  <h2 className="section-title">主要短板</h2>
                  <WeaknessList value={result.local.weaknesses} />
                </section>
              </div>

              <section className="card" style={{ padding: 22, marginTop: 24 }}>
                <h2 className="section-title">本地闭环报告</h2>
                <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#36426d", fontFamily: "inherit" }}>
                  {result.local.reportText}
                </pre>
              </section>

              <div className="report-actions" style={{ marginTop: 24 }}>
                <Link className="btn-outline" href={`/data-quality/${result.local.uid}`}>查看数据质量</Link>
                <Link className="btn-primary" href="/dashboard">进入目标总览</Link>
              </div>
            </>
          ) : !result.ok ? (
            <StateMessage title="无法读取分析报告" message={result.error} />
          ) : !result.report ? (
            <StateMessage title="未找到分析报告" message="请先从 onboarding 或 /analyze 完成一次 UID 分析。" />
          ) : (
            <>
              <div className="metric-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 0 }}>
                <Metric title="总分" value={result.report.totalScore} />
                <Metric title="等级" value={result.report.level} />
                <Metric title="分析可信度" value={Number(result.report.analysisConfidence).toFixed(2)} />
                <Metric title="数据质量" value={result.report.dataQualityReport?.confidenceLevel ?? "UNKNOWN"} />
              </div>

              <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 24 }}>
                <section className="card" style={{ padding: 22 }}>
                  <h2 className="section-title">能力分</h2>
                  <KeyValueList value={result.report.abilityJson} />
                </section>
                <section className="card" style={{ padding: 22 }}>
                  <h2 className="section-title">主要短板</h2>
                  <WeaknessList value={result.report.weaknessJson} />
                </section>
              </div>

              <section className="card" style={{ padding: 22, marginTop: 24 }}>
                <h2 className="section-title">教练式报告</h2>
                <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#36426d", fontFamily: "inherit" }}>
                  {result.report.llmReportText || "暂无 LLM 报告文本。"}
                </pre>
              </section>

              <div className="report-actions" style={{ marginTop: 24 }}>
                <Link className="btn-outline" href={`/data-quality/${result.report.subjectId}`}>查看数据质量</Link>
                <Link className="btn-primary" href="/dashboard">进入目标总览</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

async function readBaselineReport(reportId: string) {
  try {
    if (!/^\d+$/.test(reportId)) return { ok: true as const, report: null };
    const report = await prisma.baselineAnalysisReport.findUnique({
      where: { id: BigInt(reportId) },
      include: { dataQualityReport: true, subject: true }
    });
    return { ok: true as const, report };
  } catch (error) {
    const detail = formatErrorDetail(error);
    if (detail.includes("DATABASE_URL")) {
      const [data, student, reportText] = await Promise.all([
        getLocalLoopUiData(),
        readLocalJson<Record<string, unknown>>("data/local-loop/calibrated_student_analysis_report.json", {}),
        readLocalJson<Record<string, unknown>>("data/local-loop/mock_calibration.json", {})
      ]);
      const target = asRecord(student.target);
      const calibration = asRecord(student.calibration);
      return {
        ok: true as const,
        report: null,
        local: {
          uid: String(target.uid ?? "1024038"),
          currentScore: data.currentScore,
          targetScore: data.targetScore,
          dataQuality: data.dataQuality,
          calibrationStatus: String(calibration.status ?? "APPLIED"),
          slotReadiness: student.slotReadiness ?? {},
          weaknesses: data.weakestKnowledge,
          reportText: JSON.stringify({
            currentStage: data.currentStage,
            mainGoal: data.mainGoal,
            blockingIssues: data.blockingIssues,
            mockCalibration: reportText
          }, null, 2)
        }
      };
    }
    return { ok: false as const, error: detail };
  }
}

function Metric({ title, value }: { title: string; value: React.ReactNode }) {
  return <div className="metric-card card"><div className="label">{title}</div><div className="value">{value}</div><Badge>baseline</Badge></div>;
}

function KeyValueList({ value }: { value: unknown }) {
  const record = asRecord(value);
  const entries = Object.entries(record);
  if (!entries.length) return <p className="small-muted">暂无结构化能力分。</p>;
  return <div style={{ display: "grid", gap: 10 }}>{entries.map(([key, item]) => <div className="action-link" key={key}><span>{key}</span><b>{formatValue(item)}</b></div>)}</div>;
}

function WeaknessList({ value }: { value: unknown }) {
  const items = Array.isArray(value) ? value : [];
  if (!items.length) return <p className="small-muted">暂无短板列表。</p>;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.slice(0, 6).map((item, index) => {
        const record = asRecord(item);
        return <div className="card" style={{ padding: 14 }} key={index}><b>{String(record.name ?? record.module ?? `weakness-${index + 1}`)}</b><p className="small-muted" style={{ margin: "6px 0 0" }}>{String(record.trainingDirection ?? record.impact ?? record.severity ?? "")}</p></div>;
      })}
    </div>
  );
}

function StateMessage({ title, message }: { title: string; message: string }) {
  return <div><h2 className="section-title">{title}</h2><p className="small-muted">{message}</p></div>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function formatValue(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (value && typeof value === "object") return JSON.stringify(value);
  return "";
}
