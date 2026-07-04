"use client";

import Image from "next/image";
import Link from "next/link";
import SyncModal from "@/components/SyncModal";
import { Badge, IconBubble, Progress } from "@/components/Ui";
import type { UiTask } from "@/src/server/local-loop/ui-data";
import { BarChart3, CheckSquare, Clock, Eye, FileText, ListChecks, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";

type TodayClientProps = {
  initialSyncOpen?: boolean;
  tasks: UiTask[];
  totalDurationMinutes: number;
  mode: string;
};

export default function TodayClient({
  initialSyncOpen = false,
  tasks,
  totalDurationMinutes,
  mode
}: TodayClientProps) {
  const [open, setOpen] = useState(initialSyncOpen);
  const taskCount = tasks.length;

  return (
    <div className="today-page" style={{ position: "relative" }}>
      <Image src="/assets/today-top-owl.png" alt="AI 教练" width={350} height={180} className="today-hero" />
      <h1>今天只做最关键的 <span className="text-grad">{taskCount}</span> 题</h1>
      <p style={{ color: "#5e688e", margin: "10px 0 0", fontSize: 17 }}>专注最重要的练习，稳步缩短与目标分的差距。</p>

      <div className="stat-row" style={{ width: 858 }}>
        <div className="stat-card card"><IconBubble icon={FileText}/><b style={{ fontSize: 18 }}>今日 <span className="text-grad">{taskCount}</span> 题</b></div>
        <div className="stat-card card"><IconBubble icon={Clock}/><b style={{ fontSize: 18 }}>预计 <span className="text-grad">{totalDurationMinutes}</span> 分钟</b></div>
        <div className="stat-card card"><IconBubble icon={BarChart3}/><b style={{ fontSize: 18 }}>训练模式 <span className="text-grad">{mode}</span></b></div>
      </div>

      <div className="today-layout">
        <div className="today-main">
          <div className="rule-card card">
            <h2 className="section-title"><ShieldCheck size={24} color="#5b43ff"/> 无剧透训练规则</h2>
            <div className="rule-row">
              <div><IconBubble icon={Clock} size={44}/><div><b>不提示算法</b><br/><span className="small-muted">自主思考，独立解决</span></div></div>
              <div><IconBubble icon={ListChecks} size={44}/><div><b>不先看题解</b><br/><span className="small-muted">先做题，再对照参考</span></div></div>
              <div><IconBubble icon={RefreshCw} size={44}/><div><b>先独立思考，再记录结果</b><br/><span className="small-muted">真实反映自己的水平</span></div></div>
            </div>
          </div>

          {tasks.map((task) => (
            <div className="task-card card" key={`${task.no}-${task.id}`}>
              <div className="task-num">{task.no}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>{task.id} {task.title} <Badge>{task.tag}</Badge></h2>
                <p style={{ margin: "18px 0 0", color: "#4f5a84" }}><Clock size={16} style={{ verticalAlign: -3 }}/> 预计 {task.time}</p>
                <p style={{ margin: "10px 0 0", color: "#283462", lineHeight: 1.6 }}><b>为什么练：</b>{task.why}</p>
              </div>
              <div>
                <div style={{ textAlign: "right", color: "#332aff", fontWeight: 900, fontSize: 19, marginBottom: 20 }}>{task.status}</div>
                <div className="task-actions">
                  <a href={`https://www.luogu.com.cn/problem/${task.id}`} target="_blank" rel="noreferrer" className="small-btn primary"><CheckSquare size={16}/>前往练习</a>
                  <button onClick={() => setOpen(true)} className="small-btn"><RefreshCw size={15}/>同步结果</button>
                  <Link href={`/training-result?problemPid=${encodeURIComponent(task.id)}`} className="small-btn"><FileText size={15}/>生成 AI 复盘</Link>
                  <Link href={`/review?problemPid=${encodeURIComponent(task.id)}`} className="small-btn"><Eye size={15}/>查看 AI 复盘</Link>
                </div>
              </div>
            </div>
          ))}

          <div style={{ color: "#566081", fontSize: 14 }}><span className="text-grad">※</span> 题目和训练理由来自 `data/local-loop/today.json`，做完后再同步和复盘。</div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="side-card card">
            <h2 className="section-title">今日结构</h2>
            <div className="timeline">
              {tasks.map((task) => (
                <div className="timeline-row" key={`side-${task.no}`}>
                  <div className="task-num" style={{ width: 28, height: 28 }}>{task.no}</div>
                  <div><b>{task.tag}</b><br/><span className="small-muted">{task.goal || task.why}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-card card">
            <h2 className="section-title">今日进度</h2>
            <div className="text-grad" style={{ fontSize: 50, fontWeight: 950, marginTop: 20 }}>0<span style={{ color: "#1b244f", fontSize: 26 }}> / {taskCount}</span></div>
            <span className="small-muted">已完成题目数</span>
            <Progress value={0} className="mt-4"/>
          </div>

          <div className="side-ad">
            <h2 className="section-title">完成全部训练后，<br/>将生成 AI 复盘</h2>
            <p className="small-muted">全面分析表现，给出提升建议，并沉淀到训练日历与周报。</p>
            <Image src="/assets/today-side-owl.png" alt="" width={270} height={290}/>
          </div>
        </aside>
      </div>

      <SyncModal open={open} onClose={() => setOpen(false)} problemPids={tasks.map((task) => task.id)} />
    </div>
  );
}
