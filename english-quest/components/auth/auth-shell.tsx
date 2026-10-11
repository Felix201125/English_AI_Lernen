"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/legal/site-footer";

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-display text-3xl font-bold text-white">
            {BRAND.name}
          </Link>
          <p className="mt-2 text-slate-400">{title}</p>
        </div>
        {children}
        {footer}
        <SiteFooter className="justify-center" />
      </div>
    </main>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-indigo-500/40 focus:ring-2";
