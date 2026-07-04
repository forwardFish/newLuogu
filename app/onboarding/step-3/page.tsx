import OnboardingShell from "@/components/OnboardingShell";
import OnboardingStep3Client from "@/components/OnboardingStep3Client";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";

export const dynamic = "force-dynamic";

export default async function OnboardingStep3() {
  const data = await getLocalLoopUiData();
  const plannedMinutes = data.totalDurationMinutes || data.tasks.length * 45;

  return (
    <OnboardingShell active={3}>
      <OnboardingStep3Client
        plannedMinutes={plannedMinutes}
        taskCount={data.tasks.length}
        currentScore={data.currentScore}
        nextMilestone={data.nextMilestone}
      />
    </OnboardingShell>
  );
}
