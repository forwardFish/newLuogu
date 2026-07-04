import AppShell from "@/components/AppShell";
import { Badge, IconBubble, Progress } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { BarChart3, Map, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AbilityMapPage() {
  const data = await getLocalLoopUiData();

  return (
    <AppShell activeHref="/ability-map">
      <div className="content-page">
        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 950 }}>能力地图</h1>
        <p style={{ color: "#53608d", fontSize: 17, marginTop: 10 }}>基于本地学生分析、今日选题和校准报告生成。</p>

        <div className="metric-grid" style={{ marginTop: 24 }}>
          {data.scoreBlocks.map((block) => (
            <div className="metric-card card" key={block.title}>
              <IconBubble icon={Target} tone={block.color === "orange" ? "orange" : undefined} />
              <div className="label">{block.title}</div>
              <div className="value"><span className="num-grad">{block.score}</span></div>
              <Progress value={Number.parseInt(block.change, 10) || 0} />
              <p className="small-muted" style={{ marginTop: 10 }}>{block.risk}</p>
            </div>
          ))}
        </div>

        <div className="detail-grid" style={{ gridTemplateColumns: "1fr 360px", marginTop: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title"><Map size={22} color="#4b35ff" /> 当前短板</h2>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {data.weakestKnowledge.map((item) => (
                <div className="short-item" key={item.name} style={{ gridTemplateColumns: "52px 1fr 120px" }}>
                  <IconBubble icon={BarChart3} size={42} />
                  <div>
                    <b>{item.name}</b><br />
                    <span className="small-muted">{item.evidence}</span>
                  </div>
                  <Badge tone={item.score < 60 ? "orange" : "green"}>{item.level} {item.score}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">数据状态</h2>
            <p style={{ lineHeight: 2, color: "#36426d" }}>
              数据质量：<Badge tone={data.dataQuality === "HIGH" ? "green" : "orange"}>{data.dataQuality}</Badge><br />
              当前阶段：{data.currentStage}<br />
              当前估分：{data.currentScore}<br />
              目标分：{data.targetScore}<br />
              周报：{data.weeklyReportExists ? "已生成" : "未生成"}<br />
              单题复盘：{data.reviewStatus}
            </p>
            <div className="action-list">
              <a className="action-link" href="/today">今日训练 <span>→</span></a>
              <a className="action-link" href="/report">家长周报 <span>→</span></a>
              <a className="action-link" href="/settings">校准设置 <span>→</span></a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
