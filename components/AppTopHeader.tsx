import { Bell, ChevronDown, Copy } from "lucide-react";
import { Brand } from "@/components/Brand";
import { getLocalLoopProfile } from "@/src/server/local-loop/profile";

export default async function AppTopHeader() {
  const profile = await getLocalLoopProfile();

  return (
    <header className="top-app-header">
      <Brand variant="robot" />
      <nav className="top-app-nav">
        <a>总览</a><a>今日训练</a><a>单题复盘</a><a>家长周报</a><a>能力地图</a><a>设置</a>
      </nav>
      <div className="top-app-right">
        <Bell size={18} />
        <span>{profile.generatedAt ? "数据已更新" : "等待本地分析数据"}</span>
        <div className="user-mini">
          <div className="avatar" style={{ width: 42, height: 42 }}><span className="face" /></div>
          <div style={{ lineHeight: 1.35 }}><b>{profile.displayName}</b><br/><span style={{ fontSize: 12, color: "#5b668d" }}>{profile.grade} · {profile.dataQuality}</span></div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

export async function LuoguPill() {
  const profile = await getLocalLoopProfile();
  return <span className="pill">Luogu UID <b style={{ color: "#111a46", marginLeft: 10 }}>{profile.uid}</b><Copy size={15} /></span>;
}
