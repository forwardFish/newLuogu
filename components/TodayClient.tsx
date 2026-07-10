"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SyncModal from "@/components/SyncModal";
import { Badge, IconBubble } from "@/components/Ui";
import type { UiTask } from "@/src/server/local-loop/ui-data";
import { CalendarCheck2, ChevronRight, Clock, FileText, Target } from "lucide-react";

type TodayClientProps = {
  initialSyncOpen?: boolean;
  tasks: UiTask[];
  totalDurationMinutes: number;
  mode: string;
  mainGoal?: string;
};

function minutesFromTask(task: UiTask) {
  const parsed = Number.parseInt(task.time, 10);
  return Number.isFinite(parsed) ? parsed : 45;
}

function taskRole(task: UiTask, index: number) {
  if (/T1/i.test(task.tag)) return "保分题";
  if (/T2/i.test(task.tag)) return "主攻题";
  if (/T3/i.test(task.tag)) return index === 2 ? "复盘题" : "提升题";
  return index === 0 ? "热身题" : index === 1 ? "核心题" : "复盘题";
}

export default function TodayClient({ initialSyncOpen = false, tasks, totalDurationMinutes, mode, mainGoal }: TodayClientProps) {
  const [syncOpen, setSyncOpen] = useState(initialSyncOpen);
  const taskCount = tasks.length;
  const todayGoal = mainGoal || tasks[0]?.goal || tasks[0]?.why || "夯实 T2 稳定性，减少低级失分";
  const planSteps = [
    { title: "热身题", desc: "保持手感，进入状态" },
    { title: "核心题", desc: "突破重点，提升得分" },
    { title: "复盘题", desc: "巩固迁移，总结提升" }
  ];

  return (
    <div className="today-page">
      <Image src="/assets/today-reference-hero.png" alt="AI 教练" width={611} height={220} className="today-hero" priority />

      <section className="today-title-hero">
        <h1>
          今天只做最关键的 <span className="text-grad">{taskCount}</span> 题
        </h1>
        <p>专注最重要的练习，稳步缩短与目标分的差距。</p>
      </section>

      <section className="today-stat-row">
        <div className="today-stat-card card">
          <IconBubble icon={FileText} size={58} />
          <b>
            今日 <span className="text-grad">{taskCount}</span> 题
          </b>
        </div>
        <div className="today-stat-card card">
          <IconBubble icon={Clock} size={58} />
          <b>
            预计 <span className="text-grad">{totalDurationMinutes}</span>
            <br />
            分钟
          </b>
        </div>
        <div className="today-stat-card card today-goal-stat">
          <IconBubble icon={Target} size={58} />
          <div>
            <span>训练目标</span>
            <b>{todayGoal}</b>
            <em>{mode}</em>
          </div>
        </div>
      </section>

      <section className="today-plan-card card-large">
        <h2 className="section-title">
          <CalendarCheck2 size={24} color="#5b43ff" />
          今日训练计划
        </h2>

        <div className="today-step-row">
          {planSteps.map((step, index) => (
            <div className="today-step" key={step.title}>
              <span className="today-step-num">{index + 1}</span>
              <div className="today-step-copy">
                <b>{step.title}</b>
                <p>{step.desc}</p>
              </div>
              {index < planSteps.length - 1 ? <span className="today-step-arrow">→</span> : null}
            </div>
          ))}
        </div>

        <div className="today-task-list">
          {tasks.map((task, index) => {
            const minutes = minutesFromTask(task);
            const role = taskRole(task, index);

            return (
              <article className="today-task-row" key={`${task.no}-${task.id}`}>
                <div className="task-num">{index + 1}</div>
                <div className="today-task-title">
                  <h3>
                    {task.id} {task.title}
                  </h3>
                  <Badge>{task.tag}</Badge>
                  <span>{role}</span>
                </div>
                <div className="today-task-meta">
                  <Clock size={17} />
                  预计 {minutes} 分钟
                </div>
                <p className="today-task-reason">{task.why}</p>
                <Link href={`https://www.luogu.com.cn/problem/${task.id}`} target="_blank" className="today-start-btn">
                  开始训练
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="today-review-card card">
        <div>
          <IconBubble icon={FileText} size={52} />
          <div>
            <b>完成全部训练后，将生成 AI 复盘</b>
            <p>同步结果后会沉淀到训练日历与周报，形成下一轮目标分计划。</p>
          </div>
        </div>
        <Link href="/review" className="today-review-link">
          了解 AI 复盘 <ChevronRight size={18} />
        </Link>
      </section>

      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} problemPids={tasks.map((task) => task.id)} />
    </div>
  );
}
