"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Internal only — not shown in teacher navigation. */
export default function HiddenMainAIPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/teacher/ai/teacher/");
  }, [router]);
  return (
    <p className="p-8 text-slate-400">Weiterleitung zum KI-Assistenten…</p>
  );
}
