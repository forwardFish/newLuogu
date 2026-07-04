import { Brand } from "@/components/Brand";
import { cn } from "@/lib/cn";

const steps = ["基础目标", "学习经历", "训练时间", "数据来源"];

export default function OnboardingShell({ active, children }: { active: number; children: React.ReactNode }) {
  return (
    <div className="page-1448 onboarding-page page-bg">
      <header className="onboard-header">
        <Brand variant="robot" />
        <div className="stepper">
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div className={cn("stepper-item", active === i + 1 && "active")}>
                <span className="stepper-num">{i + 1}</span>
                <span>{s}</span>
              </div>
              {i < steps.length - 1 && <span className="stepper-line" />}
            </div>
          ))}
        </div>
      </header>
      {children}
    </div>
  );
}
