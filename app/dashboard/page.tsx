import Link from "next/link";
import AppShell from "@/components/AppShell";
import { IconBubble } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, FileText, Home, Target } from "lucide-react";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "目标总览", icon: Home },
  { href: "/today", label: "今日训练", icon: CalendarDays },
  { href: "/review", label: "题目复盘", icon: Target },
  { href: "/report", label: "周报计划", icon: FileText }
];

export default async function DashboardPage() {
  const data = await getLocalLoopUiData();
  const keyTasks = data.tasks.slice(0, 3);
  const keyTaskDurationMinutes = keyTasks.reduce((sum, task) => sum + Number.parseInt(task.time, 10), 0);
  const focusSummary = buildTodayFocusSummary(keyTasks, data.mainGoal);
  const tableRows = data.scoreBlocks.map((block) => {
    const [slot] = block.title.split(" ");
    const current = Number.parseInt(block.score, 10) || 0;
    const target = slot === "T1" ? 90 : slot === "T2" ? 70 : slot === "T3" ? 30 : 10;
    return [slot, current, target, Math.max(0, target - current)] as const;
  });

  return (
    <AppShell activeHref="/dashboard" nav={nav}>
      <div className="dashboard">
        <h1>距离 CSP-S {data.targetScore} 分，还差 <span className="text-grad">{data.gap}</span> 分</h1>
        <p style={{ color: "#5e688e", fontSize: 16, margin: "10px 0 0" }}>
          系统会把目标差距拆成阶段任务，通过每日训练和复盘持续缩短差距。
        </p>

        <div className="metric-grid">
          {data.metrics.map((metric) => (
            <div className="metric-card card" key={metric.label}>
              <IconBubble icon={metric.icon} size={44} />
              <div className="label">{metric.label}</div>
              <div className="value">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="stage-path card">
          <h2 className="section-title">阶段路径</h2>
          <div className="path-line">
            <span className="path-dot active" style={{ left: 285 }} />
            <span className="path-dot" style={{ left: 530 }} />
            <span className="path-dot" style={{ left: 760 }} />
            <span className="path-dot" style={{ left: 995 }} />
          </div>
          <div className="path-labels">
            <div><b>{data.currentStage}</b><br />{data.mainGoal}</div>
            <div><b>下一里程碑</b><br />{data.nextMilestone} 分</div>
            <div><b>数据质量</b><br />{data.dataQuality}</div>
            <div><b>目标</b><br />CSP-S {data.targetScore} 分</div>
          </div>
        </div>

        <div className="dashboard-panels">
          <div className="card" style={{ padding: 22, height: 340 }}>
            <h2 className="section-title">四题结构差距</h2>
            <table className="simple-table" style={{ marginTop: 20 }}>
              <thead><tr><th>题型</th><th>当前</th><th>目标</th><th>差距</th></tr></thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td style={{ color: "#4d35ff", fontWeight: 900 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: 24, height: 340 }}>
            <h2 className="section-title">今日训练入口</h2>
            <div className="dashboard-training-meta">
              <div><CalendarDays size={20} /> <span>今日训练：<b className="num-grad">{keyTasks.length}</b> 题</span></div>
              <div><Clock size={20} /> <span>预计：<b className="num-grad">{keyTaskDurationMinutes}</b> 分钟</span></div>
              <div><CheckCircle2 size={20} /> <span>目标：{focusSummary}</span></div>
            </div>
            <Link href="/today" className="btn-primary" style={{ width: "100%", marginTop: 12 }}>开始今日训练</Link>
          </div>

          <div className="card" style={{ padding: 24, height: 340 }}>
            <h2 className="section-title">最近进展</h2>
            <p style={{ color: "#5e688e", lineHeight: 2 }}>
              官方基准：<span className="num-grad">{data.officialScore}</span><br />
              当前估计：<span className="num-grad">{data.currentScore}</span><br />
              目标差距：<span className="num-grad">{data.gap} 分</span>
            </p>
            <svg width="350" height="125" viewBox="0 0 350 125">
              <line x1="20" y1="20" x2="20" y2="104" stroke="#dfe4f2" />
              <line x1="20" y1="104" x2="330" y2="104" stroke="#dfe4f2" />
              <polyline points={`20,80 150,60 260,${Math.max(25, 104 - data.currentScore / 2)} 330,32`} fill="none" stroke="#5b43ff" strokeWidth="4" />
              <circle cx="150" cy="60" r="6" fill="#5b43ff" />
              <circle cx="260" cy={Math.max(25, 104 - data.currentScore / 2)} r="6" fill="#5b43ff" />
              <circle cx="330" cy="32" r="6" fill="#5b43ff" />
            </svg>
            <div style={{ height: 48, borderRadius: 10, background: "#f2efff", display: "flex", alignItems: "center", paddingLeft: 18, fontWeight: 900 }}>
              较官方基准提升：<span className="text-grad" style={{ fontSize: 24, marginLeft: 10 }}>{Math.max(0, data.currentScore - data.officialScore)} 分</span>
            </div>
          </div>
        </div>

        <div className="blocker card">
          <IconBubble icon={AlertTriangle} tone="red" size={70} />
          <div>
            <h2 className="section-title">当前最大阻塞点</h2>
            <h3 style={{ fontSize: 24, margin: "10px 0" }}>{data.blockingIssues[0] ?? data.weakestKnowledge[0]?.name ?? "等待更多训练证据"}</h3>
            {data.blockingIssues.slice(0, 3).map((issue) => (
              <span className="badge purple" style={{ marginRight: 10 }} key={issue}>{issue}</span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function buildTodayFocusSummary(tasks: Array<{ tag: string; goal: string }>, fallback: string) {
  if (!tasks.length) return fallback;
  const slots = [...new Set(tasks.map((task) => task.tag).filter(Boolean))];
  const hasT1 = slots.includes("T1");
  const nonT1 = slots.find((slot) => slot !== "T1");
  const parts = [
    hasT1 ? "稳 T1" : null,
    nonT1 ? `修复 ${nonT1}` : null,
    tasks.length > 1 ? "复盘证据题" : null
  ].filter(Boolean);
  return parts.join(" + ") || tasks[0]?.goal || fallback;
}
