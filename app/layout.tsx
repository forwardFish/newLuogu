import "./globals.css";

export const metadata = {
  title: "千里策｜CSP-J/S 目标分训练教练",
  description: "AI 信奥训练教练 · CSP-J/S 目标分训练系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
