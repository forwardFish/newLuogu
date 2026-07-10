import AppShell from "@/components/AppShell";
import TodayClient from "@/components/TodayClient";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";
import { BarChart3, CalendarDays, Clock, Home } from "lucide-react";

export const dynamic = "force-dynamic";

const trainingNav = [
  { href: "/dashboard", label: "目标总览", icon: Home },
  { href: "/today", label: "今日训练", icon: Clock },
  { href: "/calendar", label: "训练日历", icon: CalendarDays },
  { href: "/report", label: "周报计划", icon: BarChart3 }
];

export default async function SyncPage() {
  const data = await getLocalLoopUiData();
  const keyTasks = data.tasks.slice(0, 3);
  const keyTaskDurationMinutes = keyTasks.reduce((sum, task) => sum + Number.parseInt(task.time, 10), 0);

  return (
    <AppShell activeHref="/today" nav={trainingNav}>
      <TodayClient
        initialSyncOpen
        tasks={keyTasks}
        totalDurationMinutes={keyTaskDurationMinutes}
        mode={data.dataQuality}
        mainGoal={data.mainGoal}
      />
    </AppShell>
  );
}
