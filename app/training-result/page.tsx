import Image from "next/image";
import AppShell from "@/components/AppShell";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { ArrowLeft, BarChart3, CalendarDays, FileText } from "lucide-react";
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
    <AppShell
      activeHref="/today"
      className="training-result-reference-shell"
      nav={[
        { href: "/dashboard", label: "目标总览", icon: BarChart3 },
        { href: "/today", label: "今日训练", icon: CalendarDays },
        { href: "/calendar", label: "训练日历", icon: CalendarDays },
        { href: "/report", label: "周报计划", icon: FileText }
      ]}
    >
      <div className="review-page training-result-page" style={{ position: "relative" }}>
        <Image src="/assets/training-result-reference-owl.png" alt="" width={358} height={225} className="review-top-owl" />
        <div className="training-result-crumb">
          <span className="crumb-back"><ArrowLeft size={17} /></span>
          <span>今日训练</span>
          <span>/</span>
          <span>题目详情</span>
          <span>/</span>
          <b>训练完成</b>
        </div>
        <h1>这题做完了，生成 AI 复盘前<br />可以补充你的思路</h1>
        <p style={{ color: "#53608d", fontSize: 17, margin: "12px 0 0" }}>
          系统已同步你的提交结果。补充做题思路后，AI 会更准确地分析你卡在哪里。
        </p>

        <TrainingResultClient task={selected ?? null} />
      </div>
    </AppShell>
  );
}
