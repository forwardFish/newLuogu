"use client";

import { useState } from "react";

export default function AnalyzePage() {
  const [uid, setUid] = useState("");
  const [subjectType, setSubjectType] = useState<"PUBLIC_UID" | "SELF_CHILD">("PUBLIC_UID");
  const [log, setLog] = useState("");

  async function run() {
    setLog("creating subject...");
    const subjectResponse = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ luoguUid: uid, subjectType, target: "CSP-S_FIRST_PRIZE" })
    });
    const subject = await subjectResponse.json();
    if (!subjectResponse.ok) {
      setLog(JSON.stringify(subject, null, 2));
      return;
    }
    setLog(`subject ${subject.subjectId}, syncing...`);
    const syncResponse = await fetch("/api/sync/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: subject.subjectId, maxRecordPages: 20, syncType: "baseline" })
    });
    const sync = await syncResponse.json();
    setLog((current) => `${current}\n${JSON.stringify(sync, null, 2)}\ngenerating baseline...`);
    const baselineResponse = await fetch("/api/analysis/baseline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: subject.subjectId,
        syncJobId: sync.syncJobId,
        target: "CSP-S_FIRST_PRIZE"
      })
    });
    const baseline = await baselineResponse.json();
    setLog((current) => `${current}\n${JSON.stringify(baseline, null, 2)}`);
  }

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <h1>AI OI Coach MVP</h1>
      <p>功能优先的最小调试入口。页面不做美化。</p>
      <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <input
          value={uid}
          onChange={(event) => setUid(event.target.value)}
          placeholder="Luogu UID"
          style={{ padding: 8 }}
        />
        <select value={subjectType} onChange={(event) => setSubjectType(event.target.value as typeof subjectType)}>
          <option value="PUBLIC_UID">PUBLIC_UID</option>
          <option value="SELF_CHILD">SELF_CHILD</option>
        </select>
        <button onClick={run} disabled={!uid} style={{ padding: 8 }}>
          Run full analysis
        </button>
      </div>
      <pre style={{ marginTop: 24, padding: 16, background: "#111827", color: "#f9fafb", overflow: "auto" }}>
        {log}
      </pre>
    </main>
  );
}
