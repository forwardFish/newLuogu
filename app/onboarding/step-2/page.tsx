import OnboardingShell from "@/components/OnboardingShell";
import OnboardingStep2Client from "@/components/OnboardingStep2Client";
import { getLocalLoopUiData } from "@/src/server/local-loop/ui-data";

export const dynamic = "force-dynamic";

export default async function OnboardingStep2() {
  const data = await getLocalLoopUiData();
  const weakness = data.blockingIssues[0] ?? data.weakestKnowledge[0]?.name ?? data.mainGoal;

  return (
    <OnboardingShell active={2}>
      <OnboardingStep2Client weakness={weakness} taskCount={data.tasks.length} dataQuality={data.dataQuality} />
    </OnboardingShell>
  );
}
