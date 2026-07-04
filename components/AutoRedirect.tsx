"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function AutoRedirect({ to, delay = 1400 }: { to: string; delay?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push(to), delay);
    return () => clearTimeout(t);
  }, [to, delay, router]);
  return null;
}
