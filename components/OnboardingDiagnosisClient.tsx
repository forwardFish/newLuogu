"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Code2, MoreHorizontal, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

type RunState = {
  status: "idle" | "running" | "success" | "error";
  step: string;
  message: string;
};

type JsonRecord = Record<string, unknown>;

type Props = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  description?: string;
};

export default function OnboardingDiagnosisClient({
  backHref = "/onboarding/step-3",
  backLabel = "上一步",
  title = "最后，选择用于诊断的数据来源",
  description = "默认支持洛谷，也可补充其他训练平台或上传记录，让诊断更完整。"
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<RunState>({ status: "idle", step: "", message: "" });
  const [sourceType, setSourceType] = useState<"SELF_CHILD" | "OTHER">("SELF_CHILD");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const luoguUid = String(form.get("luoguUid") ?? "").trim();
    if (sourceType === "OTHER") {
      setState({ status: "error", step: "平台", message: "其他平台数据源将在后续版本接入，请先选择 Luogu 公开记录完成本次诊断。" });
      return;
    }
    if (!/^\d+$/.test(luoguUid)) {
      setState({ status: "error", step: "UID", message: "请输入数字形式的公开 Luogu UID。" });
      return;
    }

    try {
      setState({ status: "running", step: "创建分析对象", message: `正在为 UID ${luoguUid} 创建分析对象...` });
      const subject = await postJson("/api/subjects", {
        luoguUid,
        subjectType: "SELF_CHILD",
        target: "CSP-S_FIRST_PRIZE"
      });

      setState({ status: "running", step: "同步公开数据", message: "正在同步 Luogu 公开提交记录和题目信息..." });
      const sync = await postJson("/api/sync/start", {
        subjectId: subject.subjectId,
        maxRecordPages: 20,
        syncType: "baseline"
      });

      setState({ status: "running", step: "生成差距分析", message: "正在生成 CSP-S 一等奖差距分析报告..." });
      const baseline = await postJson("/api/analysis/baseline", {
        subjectId: subject.subjectId,
        syncJobId: sync.syncJobId,
        target: "CSP-S_FIRST_PRIZE"
      });

      setState({ status: "running", step: "生成教练报告", message: "正在补齐学生分析 V2 和教练式报告..." });
      await fetch(
        `/api/student-analysis-v2?subjectId=${encodeURIComponent(String(subject.subjectId))}&syncJobId=${encodeURIComponent(String(sync.syncJobId))}`
      );

      setState({ status: "success", step: "完成", message: "诊断完成，正在打开分析报告..." });
      router.push(`/baseline/${encodeURIComponent(String(baseline.analysisReportId))}`);
    } catch (error) {
      setState({
        status: "error",
        step: "诊断失败",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return (
    <>
      <Image className="onboard-source-owl" src="/assets/login-owl.png" alt="" width={320} height={320} priority />
      <form className="onboard-source-card card-large" onSubmit={submit}>
        <h1>{title}</h1>
        <p className="lead">{description}</p>

        <div className="source-section">
          <h2>1. 选择平台</h2>
          <div className="source-two-grid">
            <label className={cn("source-choice-card", sourceType === "SELF_CHILD" && "active")}>
              <input name="subjectType" value="SELF_CHILD" type="radio" checked={sourceType === "SELF_CHILD"} onChange={() => { setSourceType("SELF_CHILD"); setState({ status: "idle", step: "", message: "" }); }} />
              <span className="mini-square"><Code2 size={24} /></span>
              <b>洛谷 Luogu（默认推荐）</b>
              <small>适合已有公开训练记录的学生，不需要账号密码</small>
            </label>
            <button className={cn("source-choice-card", sourceType === "OTHER" && "active")} type="button" aria-pressed={sourceType === "OTHER"} onClick={() => { setSourceType("OTHER"); setState({ status: "idle", step: "", message: "" }); }}>
              <span className="icon-bubble"><MoreHorizontal size={24} /></span>
              <b>其他平台 / 暂无</b>
              <small>可以后续补充</small>
            </button>
          </div>
        </div>

        <div className="source-section source-uid-section">
          <h2>2. 填写公开记录信息</h2>
          <label>
            <span>洛谷 UID</span>
            <input className="source-uid-input" name="luoguUid" inputMode="numeric" placeholder="请输入孩子的 Luogu UID" />
          </label>
          <p>系统仅用于读取公开训练记录，不需要账号密码。</p>
        </div>

        {state.message ? (
          <div className={state.status === "error" ? "form-error" : "form-success"}>
            <b>{state.step}</b>：{state.message}
          </div>
        ) : null}

        <div className="source-actions">
          <Link href={backHref} className="btn-outline">{backLabel}</Link>
          <button className="btn-primary" type="submit" disabled={state.status === "running"}>
            {state.status === "running" ? "正在诊断..." : "开始诊断"}
          </button>
        </div>
        <div className="source-safe-note"><ShieldCheck size={18} />仅读取公开数据，安全可靠</div>
      </form>
    </>
  );
}

async function postJson(url: string, body: JsonRecord) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatApiError(payload) || `${url} failed with HTTP ${response.status}`);
  }
  return payload as JsonRecord;
}

function formatApiError(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;
  if (typeof record.error === "string") return record.error;
  if (record.error) return JSON.stringify(record.error);
  return typeof record.message === "string" ? record.message : "";
}
