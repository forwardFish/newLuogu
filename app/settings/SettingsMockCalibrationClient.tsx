"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SubmitState = {
  status: "idle" | "saving" | "success" | "error";
  message: string;
};

export default function SettingsMockCalibrationClient() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: "saving", message: "正在应用模拟赛校准..." });
    const response = await fetch("/api/calibration/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examName: form.get("examName"),
        date: form.get("date"),
        timeLimitMinutes: form.get("timeLimitMinutes"),
        isTimed: true,
        isIndependent: form.get("isIndependent") === "on",
        hasSeenSolutionsBeforeExam: form.get("hasSeenSolutionsBeforeExam") === "on",
        slots: {
          T1: slot(form, "T1"),
          T2: slot(form, "T2"),
          T3: slot(form, "T3"),
          T4: slot(form, "T4")
        }
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok && response.status !== 207) {
      setState({ status: "error", message: payload.issues?.join("；") || payload.status || "模拟赛校准失败" });
      return;
    }
    setState({ status: payload.status === "OK" ? "success" : "error", message: payload.status === "OK" ? "模拟赛校准已应用，今日训练已刷新。" : "校准部分完成，请检查 tuning 报告。" });
    router.refresh();
    if (payload.status === "OK") {
      window.setTimeout(() => window.location.reload(), 250);
    }
  }

  return (
    <form className="card" style={{ padding: 24 }} onSubmit={submit}>
      <h2 className="section-title">模拟赛校准</h2>
      <p className="small-muted">填写一次限时四题模拟赛结果，用真实考试结构校准当前估分。</p>
      <div className="training-log-grid">
        <label>模拟赛名称<input name="examName" defaultValue="CSP-S 四题结构模拟" /></label>
        <label>日期<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
        <label>限时分钟<input name="timeLimitMinutes" type="number" min="1" max="480" defaultValue="240" /></label>
      </div>
      <label className="training-log-check"><input name="isIndependent" type="checkbox" defaultChecked /> 独立完成</label>
      <label className="training-log-check"><input name="hasSeenSolutionsBeforeExam" type="checkbox" /> 考前看过题解</label>
      <div className="training-log-grid">
        {["T1", "T2", "T3", "T4"].map((slotName) => (
          <label key={slotName}>{slotName} 得分<input name={`${slotName}Score`} type="number" min="0" max="100" defaultValue={slotName === "T1" ? "80" : slotName === "T2" ? "50" : slotName === "T3" ? "20" : "0"} /></label>
        ))}
      </div>
      <div className="training-log-grid">
        {["T1", "T2", "T3", "T4"].map((slotName) => (
          <label key={slotName}>{slotName} 题号<input name={`${slotName}Pid`} placeholder={`${slotName}-UNKNOWN`} /></label>
        ))}
      </div>
      {state.message ? <p className={state.status === "error" ? "form-error" : "form-success"}>{state.message}</p> : null}
      <button className="btn-primary" type="submit" disabled={state.status === "saving"} style={{ width: "100%", marginTop: 18 }}>
        {state.status === "saving" ? "校准中..." : "应用模拟赛校准"}
      </button>
    </form>
  );
}

function slot(form: FormData, key: string) {
  return {
    problemPid: form.get(`${key}Pid`) || `${key}-UNKNOWN`,
    title: `${key} mock problem`,
    score: form.get(`${key}Score`),
    maxScore: 100
  };
}
