"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { LocalLoopProfile } from "@/src/server/local-loop/profile";

type Props = {
  profile: LocalLoopProfile;
};

export default function OnboardingStep1Client({ profile }: Props) {
  const router = useRouter();
  const [exam, setExam] = useState<"CSP-J" | "CSP-S">(profile.grade === "CSP-J" ? "CSP-J" : "CSP-S");
  const [cspJScore, setCspJScore] = useState("");
  const [cspSScore, setCspSScore] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [note, setNote] = useState("");

  const activeScore = useMemo(() => (exam === "CSP-J" ? cspJScore : cspSScore), [cspJScore, cspSScore, exam]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(
      "newLuogu:onboarding:step1",
      JSON.stringify({ exam, cspJScore, cspSScore, targetScore, note, activeScore })
    );
    router.push("/onboarding/step-2");
  }

  return (
    <form className="onboard-card card-large" onSubmit={submit}>
      <h1>先确认这次想冲到哪里</h1>
      <p className="lead">先填写考试方向、过往成绩和目标分，系统才能为你生成更准确的训练方案。</p>
      <div className="form-section">
        <div className="form-title">1. 考试方向</div>
        <div className="choice-grid two" style={{ width: 720, margin: "0 auto" }}>
          <button className={cn("choice", exam === "CSP-J" && "selected")} type="button" onClick={() => setExam("CSP-J")}>
            CSP-J
          </button>
          <button className={cn("choice", exam === "CSP-S" && "selected")} type="button" onClick={() => setExam("CSP-S")}>
            CSP-S
          </button>
        </div>
      </div>
      <div className="form-section">
        <div className="form-title">2. 最近一次成绩</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <label>
            <div style={{ marginBottom: 8, color: "#4f5a84" }}>CSP-J</div>
            <input
              className="input-box field-control"
              inputMode="numeric"
              name="cspJScore"
              placeholder="暂无本轮 CSP-J 成绩"
              value={cspJScore}
              onChange={(event) => setCspJScore(event.target.value)}
            />
          </label>
          <label>
            <div style={{ marginBottom: 8, color: "#4f5a84" }}>CSP-S</div>
            <input
              className="input-box field-control"
              inputMode="numeric"
              name="cspSScore"
              placeholder="例如 112"
              value={cspSScore}
              onChange={(event) => setCspSScore(event.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="form-section">
        <div className="form-title">3. 目标分</div>
        <label>
          <div style={{ marginBottom: 8, color: "#4f5a84" }}>本次目标分</div>
          <input
            className="input-box field-control"
            inputMode="numeric"
            name="targetScore"
            placeholder="例如 200"
            value={targetScore}
            onChange={(event) => setTargetScore(event.target.value)}
          />
        </label>
      </div>
      <div className="form-section">
        <div className="form-title">
          4. 补充说明 <span style={{ color: "#687295", fontWeight: 700 }}>（可选）</span>
        </div>
        <textarea
          className="textarea-box field-control textarea-control"
          name="note"
          placeholder="例如：最近 T2 不稳定，想冲 200 分"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <div className="onboard-actions">
        <button className="btn-outline" type="button" onClick={() => router.push("/")}>
          稍后再填
        </button>
        <button className="btn-primary" type="submit">
          下一步
        </button>
      </div>
      <div className="onboard-foot">信息越真实，后续诊断与训练建议越准确。</div>
    </form>
  );
}
