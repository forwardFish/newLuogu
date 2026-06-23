import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI OI Coach MVP",
  description: "Luogu public data based CSP-S baseline analysis"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
