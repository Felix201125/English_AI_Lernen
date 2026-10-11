"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { StudentOnboarding } from "@/components/student/onboarding";

/** Dedizierte Route — Overlay auch über Layout; hier Reset möglich */
export default function StudentOnboardingPage() {
  const { onboardingDone, authUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (authUser?.role === "student" && onboardingDone) {
      router.replace("/student/");
    }
  }, [onboardingDone, authUser, router]);

  return (
    <div className="min-h-[50vh]">
      <StudentOnboarding />
      {onboardingDone && (
        <p className="text-center text-sm text-slate-400">
          Willkommen — du wirst weitergeleitet…
        </p>
      )}
    </div>
  );
}
