import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { IconBubble } from "@/components/Ui";
import { BarChart3, CalendarDays, CheckCircle2, FileText, ShieldCheck, Target, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "目标总览", icon: BarChart3 },
  { href: "/today", label: "今日训练", icon: CalendarDays },
  { href: "/calendar", label: "训练日历", icon: CalendarDays },
  { href: "/report", label: "周报计划", icon: FileText }
];

export default async function PaymentPage() {
  return (
    <AppShell activeHref="/dashboard" nav={nav}>
      <div className="payment-page" style={{ position: "relative" }}>
        <Image src="/assets/payment-top-owl.png" alt="" width={445} height={210} className="payment-hero-img" />
        <h1>解锁<span className="text-grad">真正有效的目标分训练</span></h1>
        <p style={{ fontSize: 20, color: "#3f4a75", margin: "12px 0 0" }}>这里不是题库，而是 AI 指导的 CSP-S 目标分训练系统。</p>
        <div className="pricing-grid">
          <div className="price-card card">
            <h2 style={{ fontSize: 28, margin: 0 }}>7 天体验训练</h2>
            <p style={{ color: "#53608d", fontSize: 18 }}>深度体验 AI 目标分训练</p>
            <div className="price">¥29</div>
            <div style={{ height: 26 }} />
            {[
              ["每日训练", "7 天"],
              ["AI 训练复盘", ""],
              ["训练日历记录", ""],
              ["家长小结", "1 次"]
            ].map(([a, b]) => <div className="feature-line" key={a}><CheckCircle2 color="#5b43ff"/><b>{a}</b><span>{b}</span></div>)}
            <Link href="/onboarding/step-4" className="btn-outline" style={{ width: "100%", marginTop: 24 }}>解锁 7 天体验 →</Link>
          </div>
          <div className="price-card recommend card">
            <div className="recommend-bar">👍 推荐</div>
            <h2 style={{ fontSize: 28, margin: "20px 0 0" }}>30 天目标分训练</h2>
            <p style={{ color: "#53608d", fontSize: 18 }}>系统训练，稳步提升目标分</p>
            <div className="price">¥99</div>
            <div style={{ height: 26 }} />
            {[
              ["每日训练", "30 天"],
              ["AI 训练复盘不限次", ""],
              ["周报计划", "4 次"],
              ["下周训练调整", "3 次"]
            ].map(([a, b]) => <div className="feature-line" key={a}><CheckCircle2 color="#5b43ff"/><b>{a}</b><span>{b}</span></div>)}
            <Link href="/today" className="btn-primary" style={{ width: "100%", marginTop: 24 }}>解锁 30 天训练 →</Link>
          </div>
        </div>
        <h2 style={{ textAlign: "center", margin: "34px 0 14px", fontSize: 24, fontWeight: 950 }}>选择目标分训练的三大价值</h2>
        <div className="value-strip card"><div><IconBubble icon={ShieldCheck} size={70}/><span><b style={{ fontSize: 21 }}>不是买题库</b><br/><span className="small-muted">每天只练真实生成的关键题</span></span></div><div><IconBubble icon={Target} size={70}/><span><b style={{ fontSize: 21 }}>每天知道练什么</b><br/><span className="small-muted">训练围绕目标差距安排</span></span></div><div><IconBubble icon={Users} tone="orange" size={70}/><span><b style={{ fontSize: 21 }}>家长看得懂提升</b><br/><span className="small-muted">周报说明进步、问题和下周计划</span></span></div></div>
      </div>
    </AppShell>
  );
}
