"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewNoteForm({ problemPid, initialNote }: { problemPid: string; initialNote?: string }) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemPid, studentSummary: note })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message ?? payload.detail ?? payload.status ?? "复盘笔记保存失败");
      setMessage("思路已保存，AI 复盘已刷新。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "复盘笔记保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <textarea
        className="textarea-box field-control textarea-control"
        value={note}
        maxLength={2000}
        onChange={(event) => setNote(event.target.value)}
        placeholder="记录这道题的关键想法、踩过的坑、收获的经验..."
        style={{ marginTop: 14 }}
      />
      <div className="small-muted" style={{ marginTop: 6 }}>{note.length} / 2000</div>
      {message ? <p className={message.includes("失败") ? "form-error" : "form-success"}>{message}</p> : null}
      <button className="btn-primary" type="submit" disabled={saving} style={{ float: "right", marginTop: -54, height: 44, minHeight: 44, fontSize: 14, borderRadius: 8 }}>
        {saving ? "保存中..." : "保存思路并刷新复盘"}
      </button>
    </form>
  );
}
