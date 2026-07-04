import OnboardingDiagnosisClient from "@/components/OnboardingDiagnosisClient";
import OnboardingShell from "@/components/OnboardingShell";

export default function AnalyzePage() {
  return (
    <OnboardingShell active={4}>
      <OnboardingDiagnosisClient
        backHref="/"
        backLabel="返回首页"
        title="输入公开 Luogu UID，生成分析闭环"
        description="这是正式的 MVP 分析入口：创建分析对象、同步公开记录、生成数据质量报告与基线分析。"
      />
    </OnboardingShell>
  );
}
