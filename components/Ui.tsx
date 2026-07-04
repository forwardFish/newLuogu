import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { assetIcons, type AssetIconName } from "@/lib/asset-icons";

type AnyIcon = LucideIcon | string;

function isAssetIcon(icon: AnyIcon): icon is AssetIconName {
  return typeof icon === "string" && icon in assetIcons;
}

export function AssetImg({ name, size = 24, className, priority = false }: { name: AssetIconName; size?: number; className?: string; priority?: boolean }) {
  return <Image src={assetIcons[name]} alt={name} width={size} height={size} className={cn("asset-icon", className)} priority={priority} />;
}

export function IconBubble({ icon, tone = "purple", size = 50 }: { icon: AnyIcon; tone?: "purple" | "green" | "orange" | "red" | "blue"; size?: number }) {
  const Icon = typeof icon === "string" ? null : icon;

  return (
    <span className={cn("icon-bubble", tone === "green" && "green", tone === "orange" && "orange", tone === "red" && "red", tone === "blue" && "blue")} style={{ width: size, height: size }}>
      {isAssetIcon(icon) ? <AssetImg name={icon} size={Math.round(size * 0.72)} /> : Icon ? <Icon size={Math.round(size * 0.52)} strokeWidth={2.4} /> : null}
    </span>
  );
}

export function PrimaryLink({ href, children, className, style }: { href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <Link href={href} className={cn("btn-primary", className)} style={style}>{children}</Link>;
}

export function OutlineLink({ href, children, className, style }: { href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <Link href={href} className={cn("btn-outline", className)} style={style}>{children}</Link>;
}

export function MiniSquare({ icon }: { icon: AnyIcon }) {
  const Icon = typeof icon === "string" ? null : icon;

  return (
    <span className="mini-square">
      {isAssetIcon(icon) ? <AssetImg name={icon} size={26} /> : Icon ? <Icon size={21} /> : null}
    </span>
  );
}

export function Progress({ value = 50, className, tone = "purple" }: { value?: number; className?: string; tone?: "purple" | "blue" }) {
  return <div className={cn("progress-track", className)}><div className={cn("progress-fill", tone === "blue" && "blue")} style={{ width: `${value}%` }} /></div>;
}

export function Badge({ children, tone = "purple" }: { children: React.ReactNode; tone?: "purple" | "green" | "red" | "orange" }) {
  return <span className={cn("badge", tone)}>{children}</span>;
}
