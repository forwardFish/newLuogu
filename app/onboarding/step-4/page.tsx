import OnboardingShell from "@/components/OnboardingShell";
import OnboardingDiagnosisClient from "@/components/OnboardingDiagnosisClient";

export default function OnboardingStep4() {
  return (
    <OnboardingShell active={4}>
      <OnboardingDiagnosisClient />
    </OnboardingShell>
  );
}
