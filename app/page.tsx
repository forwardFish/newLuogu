import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AI OI Coach MVP</h1>
      <p>核心功能优先：用 API 创建对象、同步洛谷公开数据、生成 CSP-S 初始分析报告。</p>
      <Link href="/analyze">打开最小分析入口</Link>
    </main>
  );
}
