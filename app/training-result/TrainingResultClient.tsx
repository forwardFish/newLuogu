"use client";

import Link from "next/link";
import { IconBubble } from "@/components/Ui";
import type { UiTask } from "@/src/server/local-loop/ui-data";
import { FileText, Search, Target, TrendingUp } from "lucide-react";
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
        studentSummary: form.get("studentSummary"),
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
    <form onSubmit={handleSubmit}>
      <div className="sync-result-card card">
        <h2 className="section-title">系统已读取今日任务</h2>
        <div className="sync-result-grid">
          <Info icon={Target} label="平台" value="洛谷" />
          <Info icon={FileText} label="题号" value={task.id} />
          <Info icon={FileText} label="题名" value={task.title} />
          <Info icon={Target} label="训练类型" value={task.tag} />
          <Info icon={TrendingUp} label="预计用时" value={task.time} />
          <Info icon={Target} label="当前状态" value={task.status} />
        </div>
      </div>

      <div className="thought-box card">
        <h2 className="section-title">记录本题结果</h2>
        <div className="training-log-grid">
          <label>结果<select name="result" defaultValue="AC"><option value="AC">AC</option><option value="PC">部分分</option><option value="WA">WA</option><option value="TLE">TLE</option><option value="RE">RE</option><option value="CE">CE</option></select></label>
          <label>得分<input name="score" type="number" min="0" max="100" defaultValue="100" /></label>
          <label>用时<input name="timeMinutes" type="number" min="0" max="600" defaultValue={defaultMinutes} /></label>
          <label>提交次数<input name="submissionCount" type="number" min="1" max="99" defaultValue="1" /></label>
          <label>提示等级<input name="hintLevelUsed" type="number" min="0" max="9" defaultValue="0" /></label>
          <label>卡住阶段<input name="failedStage" defaultValue="NONE" /></label>
        </div>
        <label className="training-log-check"><input name="hasSeenSolution" type="checkbox" /> 做题前/过程中看过题解</label>
        <label className="training-log-text">错误类型<input name="errorTypes" placeholder="例如 COMPLEXITY_ERROR,IMPLEMENTATION_RISK" /></label>
        <label className="training-log-text">我的思路<textarea name="studentSummary" rows={4} placeholder="记录关键想法、卡点、调试过程或收获。" /></label>
        {state.message ? <p className={state.status === "error" ? "form-error" : "form-success"}>{state.message}</p> : null}
      </div>

      <div className="ai-help card">
        <h2 className="section-title">AI 会重点帮你做什么</h2>
        <div className="help-grid">
          <div className="help-card"><IconBubble icon={Target} size={50}/>提炼这题真正考什么</div>
          <div className="help-card"><IconBubble icon={Search} size={50}/>找到这次训练暴露的问题</div>
          <div className="help-card"><IconBubble icon={TrendingUp} size={50}/>给出下一步该练什么</div>
        </div>
      </div>

      <div className="review-actions">
        <Link href={`/review?problemPid=${encodeURIComponent(task.id)}`} className="btn-outline">跳过，查看现有 AI 复盘</Link>
        <button className="btn-primary" type="submit" disabled={state.status === "saving"}>
          {state.status === "saving" ? "生成中..." : "保存结果并生成 AI 复盘"}
        </button>
      </div>
    </form>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div>
      <Icon color="#4b35ff"/>
      <span>{label}<br/><b>{value}</b></span>
    </div>
  );
}
