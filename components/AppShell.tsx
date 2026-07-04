import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BarChart3, CalendarDays, FileText } from "lucide-react";
import { Brand } from "@/components/Brand";
import { AssetImg } from "@/components/Ui";
import { cn } from "@/lib/cn";
import { assetIcons, type AssetIconName } from "@/lib/asset-icons";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";

type NavIconValue = string | LucideIcon;
type NavItem = { href: string; label: string; icon: NavIconValue };

const defaultNav: NavItem[] = [
  { href: "/dashboard", label: "目标总览", icon: BarChart3 },
  { href: "/today", label: "今日训练", icon: CalendarDays },
  { href: "/calendar", label: "训练日历", icon: CalendarDays },
  { href: "/report", label: "周报计划", icon: FileText }
];

function NavIcon({ icon, active }: { icon: NavIconValue; active?: boolean }) {
  if (typeof icon === "string") {
    if (icon in assetIcons) {
      return <AssetImg name={icon as AssetIconName} size={25} className={active ? "nav-img active" : "nav-img"} />;
    }
    return null;
  }
  const Icon = icon;
  return <Icon />;
}

export default async function AppShell({
  children,
  logo = "a",
  nav = defaultNav,
  activeHref
}: {
  children: React.ReactNode;
  logo?: "a" | "robot";
  nav?: NavItem[];
  activeHref?: string;
}) {
  const profile = await getLocalLoopProfile();

  return (
    <div className="page-1448 page-bg">
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-wrap">
            <Brand variant={logo === "a" ? "a" : "robot"} size="small" />
          </div>
          <nav className="nav">
            {nav.map((item) => {
              const active = activeHref === item.href;
              return (
                <Link href={item.href} key={item.href} className={cn(active && "active")}>
                  <NavIcon icon={item.icon} active={active} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="student-card">
            <AssetImg name="userAvatar" size={54} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{profile.displayName}</div>
              <div style={{ marginTop: 5, color: "#4f5a84", fontSize: 13 }}>{profile.targetLabel}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#10183f" }}>⌄</span>
          </div>
          <Link href="/settings" className="setting-link"><AssetImg name="settings" size={26} />设置</Link>
        </aside>
        <main className="app-content"><div className="app-inner">{children}</div></main>
      </div>
    </div>
  );
}
