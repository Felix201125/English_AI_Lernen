"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Student AI is not visible in the teacher UI. */
export default function HiddenStudentAIPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/teacher/ai/teacher/");
  }, [router]);
  return (
    <p className="p-8 text-slate-400">Weiterleitung zum KI-Assistenten…</p>
  );
}
