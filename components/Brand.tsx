import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandProps = {
  variant?: "robot" | "owl" | "a";
  size?: "small" | "normal" | "marketing";
  name?: string;
  sub?: string;
};

export function Brand({
  variant = "robot",
  size = "normal",
  name = "AI 信奥训练教练",
  sub = "CSP-S Target Coach",
}: BrandProps) {
  const src = variant === "owl" ? "/assets/brand-owl.png" : "/assets/brand-robot.png";

  return (
    <div className={cn("brand", size === "small" && "small", size === "marketing" && "marketing")}>
      {variant === "a" ? <div className="logo-a" aria-hidden="true" /> : <Image src={src} alt="logo" width={64} height={64} priority />}
      <div>
        <div className="name">{name}</div>
        <div className="sub">{sub}</div>
      </div>
    </div>
  );
}
