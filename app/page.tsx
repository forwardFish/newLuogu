import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>AI OI Coach MVP</h1>
      <p>AI 信奥训练教练，优先完成数据分析、代码分析和 CSP-S 一等奖训练闭环。</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/training">查看训练闭环结果</Link>
        <Link href="/analyze">打开最小分析入口</Link>
      </div>
    </main>
  );
}
