"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Code2, FileSpreadsheet, Link as LinkIcon, ShieldCheck, Upload } from "lucide-react";

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
  const [subjectType, setSubjectType] = useState("SELF_CHILD");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const luoguUid = String(form.get("luoguUid") ?? "").trim();
    const selectedSubjectType = String(form.get("subjectType") ?? subjectType);
    if (!/^\d+$/.test(luoguUid)) {
      setState({ status: "error", step: "UID", message: "请输入数字形式的公开 Luogu UID。" });
      return;
    }

    try {
      setState({ status: "running", step: "创建分析对象", message: `正在为 UID ${luoguUid} 创建分析对象...` });
      const subject = await postJson("/api/subjects", {
        luoguUid,
        subjectType: selectedSubjectType,
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

  function note(step: string, message: string) {
    setState({ status: "success", step, message });
  }

  return (
    <form className="onboard-card card-large" style={{ width: 960, minHeight: 830, paddingTop: 48 }} onSubmit={submit}>
      <h1>{title}</h1>
      <p className="lead">{description}</p>

      <div className="form-section">
        <div className="form-title">1. 选择平台</div>
        <div className="source-grid">
          <label className={subjectType === "SELF_CHILD" ? "source-card active" : "source-card"} onClick={() => setSubjectType("SELF_CHILD")}>
            <input
              name="subjectType"
              value="SELF_CHILD"
              type="radio"
              checked={subjectType === "SELF_CHILD"}
              onChange={() => setSubjectType("SELF_CHILD")}
              style={{ position: "absolute", opacity: 0 }}
            />
            <span className="mini-square">
              <Code2 size={24} />
            </span>
            <b>洛谷 Luogu（默认推荐）</b>
            <span style={{ color: "#5e688e", fontSize: 14 }}>适合已有公开训练记录的学生 · 不需要账号密码</span>
          </label>
          <button className="source-card" type="button" onClick={() => note("已记录", "VJudge 将在后续版本接入，本次先使用 Luogu 公开记录完成诊断。")}>
            <span className="mini-square" style={{ fontSize: 32, fontWeight: 900 }}>
              V
            </span>
            <b>VJudge</b>
            <span style={{ color: "#5e688e", fontSize: 14 }}>适合多平台刷题用户</span>
          </button>
          <button className="source-card" type="button" onClick={() => note("已记录", "其他平台入口已记为后续补充，不影响本次诊断。")}>
            <span className="icon-bubble" style={{ width: 52, height: 52 }}>
              …
            </span>
            <b>其他平台 / 暂无</b>
            <span style={{ color: "#5e688e", fontSize: 14 }}>可以后续补充</span>
          </button>
        </div>
      </div>

      <div className="form-section">
        <div className="form-title">2. 填写公开记录信息</div>
        <label>
          <div style={{ color: "#4f5a84", marginBottom: 8 }}>洛谷 UID</div>
          <input className="input-box" name="luoguUid" inputMode="numeric" placeholder="请输入孩子的 Luogu UID" />
        </label>
        <div style={{ marginTop: 8, color: "#5e688e", fontSize: 14 }}>系统仅用于读取公开训练记录，不需要账号密码。</div>
      </div>

      <div className="form-section">
        <div className="form-title">
          3. 还可以补充这些资料 <span style={{ color: "#687295", fontWeight: 700 }}>（可选）</span>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <div className="upload-row">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Upload color="#5b43ff" />
              <div>
                <b>上传训练记录</b>
                <br />
                <span style={{ color: "#5e688e", fontSize: 14 }}>支持 Excel / CSV，用于补充做题数据</span>
              </div>
            </div>
            <button className="small-btn primary" type="button" onClick={() => note("已记录", "上传入口将在后续版本接入，本次先使用公开 Luogu 记录。")}>
              上传
            </button>
          </div>
          <div className="upload-row">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <FileSpreadsheet color="#5b43ff" />
              <div>
                <b>上传代码与题目记录</b>
                <br />
                <span style={{ color: "#5e688e", fontSize: 14 }}>支持 ZIP，用于更深入分析代码习惯</span>
              </div>
            </div>
            <button className="small-btn primary" type="button" onClick={() => note("已记录", "代码记录入口已记为后续补充，不影响本次诊断。")}>
              上传
            </button>
          </div>
          <div className="upload-row">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <LinkIcon color="#5b43ff" />
              <div>
                <b>补充其他平台链接</b>
                <br />
                <span style={{ color: "#5e688e", fontSize: 14 }}>例如 VJudge 主页链接</span>
              </div>
            </div>
            <button className="small-btn primary" type="button" onClick={() => note("已记录", "其他平台链接暂不必填写，本次继续使用 Luogu 公开数据。")}>
              添加
            </button>
          </div>
        </div>
      </div>

      <div className="safe-strip">
        <ShieldCheck size={20} />
        我们只用于训练诊断，不公开共享数据。
      </div>
      {state.message ? (
        <div className={state.status === "error" ? "form-error" : "form-success"} style={{ marginTop: 14 }}>
          <b>{state.step}</b>：{state.message}
        </div>
      ) : null}
      <div className="onboard-actions" style={{ marginTop: 24 }}>
        <Link href={backHref} className="btn-outline">
          {backLabel}
        </Link>
        <button className="btn-primary" type="submit" disabled={state.status === "running"}>
          {state.status === "running" ? "正在诊断..." : "开始免费诊断"}
        </button>
      </div>
      <div className="onboard-foot">提交后将开始生成初步诊断结果。</div>
    </form>
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
