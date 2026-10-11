"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import type { UserRole } from "@/lib/auth/types";

export function RequireAuth({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { authReady, authUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authReady) return;
    if (!authUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (authUser.role !== role) {
      router.replace(authUser.role === "teacher" ? "/teacher" : "/student");
    }
  }, [authReady, authUser, role, router, pathname]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-300">
        Sitzung wird geprüft…
      </div>
    );
  }

  if (!authUser || authUser.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-300">
        Weiterleitung…
      </div>
    );
  }

  return <>{children}</>;
}
