"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { StudentNav } from "@/components/layout/student-nav";
import { StudentOnboarding } from "@/components/student/onboarding";
import { SiteFooter } from "@/components/legal/site-footer";
import { useApp } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChildMode, live, isLive } = useApp();

  return (
    <RequireAuth role="student">
      <div className={cn("flex min-h-screen", isChildMode && "child-mode")}>
        <StudentNav />
        <div className="relative flex-1 pb-24 md:pb-8">
          <StudentOnboarding />
          {isLive && live.studentScreenLocked && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b1220]/90 p-8 backdrop-blur">
              <div className="eq-card max-w-md p-8 text-center">
                <p className="text-4xl">🔒</p>
                <h2 className="mt-3 font-display text-2xl text-white">
                  Kurz warten
                </h2>
                <p className="mt-2 text-slate-300">
                  Dein Lehrer hat den Bildschirm pausiert. Frag nach, wenn du
                  Hilfe brauchst.
                </p>
              </div>
            </div>
          )}
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
            {children}
            <SiteFooter className="mt-10 border-t border-white/5 pt-4" />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
