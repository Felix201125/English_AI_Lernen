"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { TeacherNav } from "@/components/layout/teacher-nav";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth role="teacher">
      <div className="flex min-h-screen">
        <TeacherNav />
        <div className="flex-1 overflow-x-hidden pb-24 md:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
