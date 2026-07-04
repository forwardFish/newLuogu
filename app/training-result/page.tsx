import Image from "next/image";
import AppShell from "@/components/AppShell";
import { IconBubble } from "@/components/Ui";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { BarChart3, CalendarDays, FileText, Lightbulb } from "lucide-react";
import TrainingResultClient from "./TrainingResultClient";

export const dynamic = "force-dynamic";

type TrainingResultPageProps = {
  searchParams?: Promise<{ problemPid?: string }>;
};

export default async function TrainingResultPage({ searchParams }: TrainingResultPageProps) {
  const params = await searchParams;
  const data = await getLocalLoopUiData();
  const selected =
    data.tasks.find((task) => task.id === params?.problemPid) ??
    data.tasks.find((task) => /^P\d+$/i.test(task.id)) ??
    data.tasks[0];

  return (
    <AppShell activeHref="/today" nav={[
      { href: "/dashboard", label: "目标总览", icon: BarChart3 },
      { href: "/today", label: "今日训练", icon: CalendarDays },
      { href: "/calendar", label: "训练日历", icon: CalendarDays },
      { href: "/report", label: "周报计划", icon: FileText }
    ]}>
      <div className="review-page training-result-page" style={{ position: "relative" }}>
        <Image src="/assets/review-top-owl.png" alt="" width={340} height={155} className="review-top-owl" />
        <div style={{ color: "#342aff", fontWeight: 800, marginBottom: 20 }}>今日训练 / 训练完成</div>
        <h1>这题做完了，补充一下你的思路</h1>
        <p style={{ color: "#53608d", fontSize: 17, margin: "12px 0 0" }}>
          结果、得分、用时和提交记录会写入本地训练日志，并生成单题 AI 复盘。
        </p>

        <div className="review-grid">
          <div>
            <TrainingResultClient task={selected ?? null} />
          </div>

          <div>
            <div className="sink-card card">
              <h2 className="section-title">本题将沉淀到</h2>
              <div className="sink-row"><IconBubble icon={CalendarDays}/> <div><b>训练日历</b><br/><span className="small-muted">记录训练轨迹与结果</span></div></div>
              <div className="sink-row"><IconBubble icon={FileText}/> <div><b>周报计划</b><br/><span className="small-muted">作为周报分析的数据来源</span></div></div>
              <div className="sink-row"><IconBubble icon={BarChart3}/> <div><b>目标总览</b><br/><span className="small-muted">同步更新你的目标进度</span></div></div>
            </div>
            <div className="explain-side card">
              <IconBubble icon={Lightbulb}/>
              <h2 className="section-title">为什么这样设计</h2>
              客观训练结果会进入 `data/training/training_log.json`。AI 复盘只在做题后生成，不提前泄露题解或代码。
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
