"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  plannedMinutes: number;
  taskCount: number;
  currentScore: number;
  nextMilestone: number;
};

export default function OnboardingStep3Client({ plannedMinutes, taskCount, currentScore, nextMilestone }: Props) {
  const router = useRouter();
  const [days, setDays] = useState("3 天");
  const [minutes, setMinutes] = useState("60 分钟");
  const [weekend, setWeekend] = useState("可以");
  const [pace, setPace] = useState("稳步提升");
  const [note, setNote] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("newLuogu:onboarding:step3", JSON.stringify({ days, minutes, weekend, pace, note }));
    router.push("/onboarding/step-4");
  }

  return (
    <form className="onboard-card compact card-large" style={{ width: 1000 }} onSubmit={submit}>
      <h1>再安排一下平时能投入多少时间</h1>
      <p className="lead">系统会根据你的可投入时间，生成更现实的训练节奏。</p>
      <ChoiceGroup title="1. 每周大概能训练几天" options={["1-2 天", "3 天", "4 天", "5 天及以上"]} value={days} onChange={setDays} columns="four" />
      <ChoiceGroup title="2. 每次大概能训练多久" options={["30 分钟", "45 分钟", "60 分钟", "90 分钟", "120 分钟"]} value={minutes} onChange={setMinutes} columns="five" />
      <ChoiceGroup title="3. 周末是否方便加练" options={["可以", "暂时不方便"]} value={weekend} onChange={setWeekend} columns="two" />
      <ChoiceGroup title="4. 希望训练节奏更偏向" options={["稳步提升", "冲刺提升", "先诊断后决定"]} value={pace} onChange={setPace} columns="three" />
      <div className="form-section">
        <div className="form-title">
          5. 备注 <span style={{ color: "#687295", fontWeight: 700 }}>（可选）</span>
        </div>
        <textarea className="textarea-box field-control textarea-control" name="note" placeholder="例如：周末可以安排更长时间" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <div className="info-strip">
        <Clock size={22} color="#4b35ff" />
        系统将优先把训练量控制在：<b style={{ color: "#332aff" }}>今日 {plannedMinutes} 分钟 · {taskCount} 个任务</b>
      </div>
      <div className="onboard-actions" style={{ marginTop: 24 }}>
        <button className="btn-outline" type="button" onClick={() => router.push("/onboarding/step-2")}>
          上一步
        </button>
        <button className="btn-primary" type="submit">
          下一步
        </button>
      </div>
      <div className="onboard-foot">后续仍可在系统内调整训练安排。</div>
    </form>
  );
}

function ChoiceGroup({
  title,
  options,
  value,
  onChange,
  columns
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  columns: string;
}) {
  return (
    <div className="form-section">
      <div className="form-title">{title}</div>
      <div className={`choice-grid ${columns}`}>
        {options.map((option) => (
          <button className={cn("choice", value === option && "selected")} key={option} type="button" onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
