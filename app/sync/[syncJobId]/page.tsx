import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/Ui";
import { formatErrorDetail } from "@/src/lib/json";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";
import { readLocalJson } from "@/src/server/local-loop/local-loop-files";
import { SyncJobService } from "@/src/server/sync/sync-job-service";

export const dynamic = "force-dynamic";

type SyncPageProps = {
  params: Promise<{ syncJobId: string }>;
};

export default async function SyncJobPage({ params }: SyncPageProps) {
  const { syncJobId } = await params;
  const result = await readSyncJob(syncJobId);

  return (
    <AppShell activeHref="/sync">
      <div className="content-page">
        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 950 }}>Luogu 同步状态</h1>
        <p style={{ color: "#53608d", fontSize: 17, marginTop: 10 }}>同步任务 #{syncJobId} 的公开数据采集进度。</p>
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          {result.local ? (
            <>
              <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 0 }}>
                <StatusLine label="任务状态" value={<Badge tone="green">LOCAL_READY</Badge>} />
                <StatusLine label="Luogu UID" value={result.local.uid} />
                <StatusLine label="公开提交记录" value={String(result.local.submissionCount)} />
                <StatusLine label="唯一题目数" value={String(result.local.problemCount)} />
                <StatusLine label="代码文件数" value={String(result.local.codeFileCount)} />
                <StatusLine label="数据质量" value={result.local.dataQuality} />
                <StatusLine label="今日训练" value={result.local.todayStatus} />
                <StatusLine label="校准状态" value={result.local.calibrationStatus} />
              </div>
              <h2 className="section-title" style={{ marginTop: 28 }}>本地同步产物</h2>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {result.local.steps.map((step) => (
                  <div className="action-link" key={step.name}>
                    <span>{step.name}</span>
                    <Badge tone={step.status === "OK" || step.status === "APPLIED" ? "green" : "orange"}>{step.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="report-actions" style={{ marginTop: 24 }}>
                <Link className="btn-outline" href={`/data-quality/${result.local.uid}`}>查看数据质量</Link>
                <Link className="btn-primary" href="/analyze">回到 UID 分析入口</Link>
              </div>
            </>
          ) : !result.ok ? (
            <StateMessage title="无法读取同步任务" message={result.error} />
          ) : !result.job ? (
            <StateMessage title="未找到同步任务" message="请先从 onboarding 或 /analyze 创建一次 UID 分析。" />
          ) : (
            <>
              <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 0 }}>
                <StatusLine label="任务状态" value={<Badge tone={result.job.status === "DONE" ? "green" : result.job.status === "FAILED" ? "red" : "orange"}>{result.job.status}</Badge>} />
                <StatusLine label="Subject ID" value={String(result.job.subjectId)} />
                <StatusLine label="抓取记录页" value={String(result.job.recordPagesFetched)} />
                <StatusLine label="解析提交数" value={String(result.job.rawRecordsParsed)} />
                <StatusLine label="写入提交数" value={String(result.job.submissionsUpserted)} />
                <StatusLine label="唯一题目数" value={String(result.job.uniqueProblemsFound)} />
                <StatusLine label="题目信息成功" value={String(result.job.problemsFetched)} />
                <StatusLine label="题目信息失败" value={String(result.job.problemFetchFailed)} />
              </div>
              <h2 className="section-title" style={{ marginTop: 28 }}>执行步骤</h2>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {result.job.steps.map((step) => (
                  <div className="action-link" key={`${step.stepName}-${step.id}`}>
                    <span>{step.stepName}</span>
                    <Badge tone={step.status === "DONE" ? "green" : step.status === "FAILED" ? "red" : "orange"}>{step.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="report-actions" style={{ marginTop: 24 }}>
                <Link className="btn-outline" href={`/data-quality/${result.job.subjectId}`}>查看数据质量</Link>
                <Link className="btn-primary" href="/analyze">回到 UID 分析入口</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

async function readSyncJob(syncJobId: string) {
  try {
    if (!/^\d+$/.test(syncJobId)) return { ok: true as const, job: null };
    const job = await new SyncJobService().get(BigInt(syncJobId));
    return { ok: true as const, job };
  } catch (error) {
    const detail = formatErrorDetail(error);
    if (detail.includes("DATABASE_URL")) {
      const [profile, today, calibration, tuning] = await Promise.all([
        getLocalLoopProfile(),
        readLocalJson<Record<string, unknown>>("data/local-loop/today.json", {}),
        readLocalJson<Record<string, unknown>>("data/local-loop/calibrated_student_analysis_report.json", {}),
        readLocalJson<Record<string, unknown>>("data/local-loop/tuning_report.json", {})
      ]);
      return {
        ok: true as const,
        job: null,
        local: {
          uid: profile.uid,
          submissionCount: profile.submissionCount,
          problemCount: profile.problemCount,
          codeFileCount: profile.codeFileCount,
          dataQuality: profile.dataQuality,
          todayStatus: Object.keys(today).length ? "OK" : "MISSING",
          calibrationStatus: pathStatusOf(calibration, "calibration.status"),
          steps: [
            { name: "student_analysis_report", status: profile.generatedAt ? "OK" : "MISSING" },
            { name: "today_selection", status: Object.keys(today).length ? "OK" : "MISSING" },
            { name: "mock_calibration", status: pathStatusOf(calibration, "calibration.status") },
            { name: "quality_tuning", status: String(tuning.status ?? "UNKNOWN") }
          ]
        }
      };
    }
    return { ok: false as const, error: detail };
  }
}

function StatusLine({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="card" style={{ padding: 18 }}><div className="small-muted">{label}</div><b style={{ fontSize: 22 }}>{value}</b></div>;
}

function StateMessage({ title, message }: { title: string; message: string }) {
  return <div><h2 className="section-title">{title}</h2><p className="small-muted">{message}</p></div>;
}

function pathStatusOf(value: unknown, key: string) {
  const found = key.split(".").reduce<unknown>((current, part) => {
    return current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined;
  }, value);
  return typeof found === "string" ? found : "UNKNOWN";
}
