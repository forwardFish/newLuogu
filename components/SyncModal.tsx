"use client";

import Image from "next/image";
import { CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function useSyncModal() {
  return useState(false);
}

type SyncModalProps = {
  open: boolean;
  onClose: () => void;
  problemPids?: string[];
};

export default function SyncModal({ open, onClose, problemPids = [] }: SyncModalProps) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("正在读取你的洛谷提交记录...");
  const problemText = useMemo(() => {
    const items = problemPids.filter(Boolean).slice(0, 3);
    return items.length ? items[0] : "今日训练题";
  }, [problemPids]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus("loading");
    setMessage("正在读取你的洛谷提交记录...");
    fetch("/api/training/today")
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        const ok = response.ok && payload.status === "OK";
        setStatus(ok ? "ok" : "error");
        setMessage(ok ? "获取最近提交记录" : "提交记录读取失败");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("提交记录读取失败");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, problemPids.length]);

  if (!open) return null;

  return (
    <div className="sync-modal-backdrop">
      <div className="sync-modal">
        <div className="sync-modal-head">
          <h2 style={{ fontSize: 24, fontWeight: 950, margin: 0 }}>同步提交记录</h2>
          <button onClick={onClose} aria-label="close"><X size={24} /></button>
        </div>

        <div style={{ paddingTop: 28 }}>
          <div className="sync-modal-stepper">
            <span className="stepper-num" style={{ background: "linear-gradient(135deg,#6b55ff,#302ef4)", color: "white", border: 0 }}>1</span><span style={{ color: "#332aff" }}>读取提交记录</span>
            <span className="sync-line" />
            <span className="stepper-num">2</span><span>匹配题目</span>
            <span className="sync-line" />
            <span className="stepper-num">3</span><span>分析结果</span>
          </div>
        </div>

        <div className="sync-modal-body">
          <div>
            <h3 style={{ fontSize: 21, fontWeight: 950, margin: 0 }}>正在读取你的洛谷提交记录...</h3>
            <div className="modal-status">
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                {status === "loading" ? <span className="spinner" /> : <CheckCircle2 color={status === "ok" ? "#1ab56e" : "#d13f3f"} size={22} />}
                {message}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}><span className="spinner" />匹配题号 {problemText}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 15, color: "#9ca4bf" }}><span style={{ width: 20, height: 20, border: "2px solid #cfd5e8", borderRadius: "50%" }} />分析提交结果</div>
            </div>
          </div>
          <Image src="/assets/sync-modal-owl.png" alt="同步" width={355} height={300} style={{ width: 355, height: "auto" }} />
        </div>

        <div style={{ textAlign: "center", color: "#596389", fontSize: 16, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
          <Info size={18} />同步过程通常需要 5-10 秒，请耐心等待...
        </div>
        <div className="modal-foot"><button className="modal-cancel" onClick={onClose}>取消</button></div>
      </div>
    </div>
  );
}
