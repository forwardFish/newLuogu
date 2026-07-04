import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function MarketingHeader({ brandName = "千里策" }: { brandName?: string }) {
  return (
    <header className="marketing-header">
      <Brand variant="owl" size="marketing" name={brandName} sub="CSP-J/S 目标分训练教练" />
      <nav className="marketing-nav">
        <a href="#intro">产品介绍</a>
        <a href="#features">核心功能</a>
        <a href="#flow">训练流程</a>
        <a href="#report">家长报告</a>
        <a href="#faq">常见问题</a>
      </nav>
      <div className="marketing-actions">
        <Link href="/login" className="mkt-btn">登录</Link>
        <Link href="/onboarding" className="mkt-btn primary">免费生成能力诊断</Link>
      </div>
    </header>
  );
}
