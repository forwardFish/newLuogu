import OnboardingShell from "@/components/OnboardingShell";
import OnboardingStep1Client from "@/components/OnboardingStep1Client";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";

export const dynamic = "force-dynamic";

export default async function OnboardingStep1() {
  const profile = await getLocalLoopProfile();

  return (
    <OnboardingShell active={1}>
      <OnboardingStep1Client profile={profile} />
    </OnboardingShell>
  );
}
