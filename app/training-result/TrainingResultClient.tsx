"use client";

import Link from "next/link";
import { IconBubble } from "@/components/Ui";
import type { UiTask } from "@/src/server/local-loop/ui-data";
import { AlertTriangle, CalendarCheck2, CheckCircle2, ChevronRight, Clock3, FileText, HelpCircle, ShieldCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type TrainingResultClientProps = {
  task: UiTask | null;
};

type SubmitState = {
  status: "idle" | "saving" | "success" | "error";
  message: string;
};

export default function TrainingResultClient({ task }: TrainingResultClientProps) {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });
  const [studentSummary, setStudentSummary] = useState("");
  const defaultMinutes = useMemo(() => {
    const parsed = Number.parseInt(task?.time ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 35;
  }, [task?.time]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) return;
    setState({ status: "saving", message: "正在写入训练日志并生成 AI 复盘..." });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/training/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemPid: task.id,
        taskType: task.tag || "PRACTICE_STANDARD",
        result: form.get("result"),
        score: form.get("score"),
        timeMinutes: form.get("timeMinutes"),
        submissionCount: form.get("submissionCount"),
        hintLevelUsed: form.get("hintLevelUsed"),
        hasSeenSolution: form.get("hasSeenSolution") === "on",
        failedStage: form.get("failedStage"),
        studentSummary: studentSummary || form.get("studentSummary"),
        errorTypes: form.get("errorTypes")
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok && response.status !== 207) {
      setState({ status: "error", message: payload.message || payload.status || "训练日志写入失败" });
      return;
    }
    if (payload.status === "LOGGED_REVIEW_FAILED") {
      setState({ status: "error", message: "训练日志已写入，但单题复盘生成失败。可稍后在复盘页重试。" });
      return;
    }
    setState({ status: "success", message: "已写入训练日志，并生成 AI 复盘。" });
    router.push(`/review?problemPid=${encodeURIComponent(task.id)}`);
    router.refresh();
  }

  if (!task) {
    return (
      <div className="sync-result-card card">
        <h2 className="section-title">暂无今日训练任务</h2>
        <p className="small-muted">请先生成今日训练，再记录做题结果。</p>
        <Link href="/today" className="btn-primary">回到今日训练</Link>
      </div>
    );
  }

  return (
    <form className="training-result-form" onSubmit={handleSubmit}>
      <section className="training-submitted-card card">
        <div className="training-submitted-head">
          <CheckCircle2 size={30} />
          <h2>系统已同步提交结果</h2>
        </div>
        <div className="training-submitted-grid">
          <Info icon={CalendarCheck2} label="题号" value={task.id} />
          <Info icon={FileText} label="题名" value={task.title} wide />
          <Info icon={ShieldCheck} label="结果" value="Accepted" tone="green" />
          <Info icon={Star} label="得分" value="100 / 100" />
          <Info icon={AlertTriangle} label="提交次数" value="4 次" />
          <Info icon={Clock3} label="用时" value={`${defaultMinutes} 分钟`} />
          <Info icon={Clock3} label="首次通过" value="第 3 次提交" wide />
        </div>
        <Link className="sync-detail-link" href={`/review?problemPid=${encodeURIComponent(task.id)}`}>
          查看同步详情 <ChevronRight size={16} />
        </Link>
      </section>

      <section className="training-thought-card card">
        <h2><FileText size={23} />补充我的思路（可选）</h2>
        <p>你可以简单说一下这题是怎么想的，哪里卡住了，后来是怎么改对的。</p>
        <input type="hidden" name="result" value="AC" />
        <input type="hidden" name="score" value="100" />
        <input type="hidden" name="timeMinutes" value={defaultMinutes} />
        <input type="hidden" name="submissionCount" value="4" />
        <input type="hidden" name="hintLevelUsed" value="0" />
        <input type="hidden" name="failedStage" value="NONE" />
        <input type="hidden" name="errorTypes" value="IMPLEMENTATION_RISK" />
        <textarea
          name="studentSummary"
          rows={4}
          maxLength={2000}
          value={studentSummary}
          onChange={(event) => setStudentSummary(event.target.value)}
          placeholder="例如：我一开始把状态想复杂了，后来发现只要先抓住不变量，再考虑相邻操作的影响......"
        />
        <div className="thought-count">{studentSummary.length} / 2000</div>
        <div className="thought-prompts" onClick={(event) => {
          const button = (event.target as HTMLElement).closest("button");
          if (button) setStudentSummary(button.textContent ?? "");
        }}>
          <button type="button"><HelpCircle size={17} />我一开始的思路是什么？</button>
          <button type="button"><HelpCircle size={17} />我主要卡在哪一步？</button>
          <button type="button"><HelpCircle size={17} />最后是怎么修正通过的？</button>
        </div>
        {state.message ? <p className={state.status === "error" ? "form-error" : "form-success"}>{state.message}</p> : null}
      </section>

      <div className="training-result-actions">
        <Link href={`/review?problemPid=${encodeURIComponent(task.id)}`} className="btn-outline">跳过，直接生成 AI 复盘</Link>
        <button className="btn-primary" type="submit" disabled={state.status === "saving"}>
          {state.status === "saving" ? "生成中..." : "保存思路并生成 AI 复盘"}
        </button>
      </div>
      <div className="training-privacy"><ShieldCheck size={15} />你的补充内容仅用于 AI 分析，不会公开分享。</div>
    </form>
  );
}

function Info({ icon: Icon, label, value, wide = false, tone }: { icon: typeof CalendarCheck2; label: string; value: string; wide?: boolean; tone?: "green" }) {
  return (
    <div className={wide ? "wide" : undefined}>
      <IconBubble icon={Icon} size={34} />
      <span>{label}<br /><b className={tone === "green" ? "green-text" : undefined}>{value}</b></span>
    </div>
  );
}
