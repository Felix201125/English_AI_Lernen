"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileText,
  Gamepad2,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Radio,
  Settings,
  Shield,
  Sparkles,
  Users,
  Languages,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useApp } from "@/components/providers/app-provider";

const links = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/students", label: "Schüler", icon: Users },
  { href: "/teacher/lessons", label: "Stunden", icon: BookOpen },
  { href: "/teacher/marketplace", label: "Marktplatz", icon: Users },
  { href: "/teacher/worksheets", label: "Arbeitsblätter", icon: FileText },
  { href: "/teacher/games", label: "Spiele", icon: Gamepad2 },
  { href: "/teacher/ai/teacher", label: "KI-Assistent", icon: Sparkles },
  { href: "/teacher/live", label: "Live-Stunden", icon: Radio },
  { href: "/teacher/inbox", label: "Anfragen", icon: Inbox },
  { href: "/teacher/permissions", label: "Freigaben", icon: Shield },
  { href: "/teacher/translator", label: "Übersetzer", icon: Languages },
  { href: "/teacher/activity-log", label: "Protokoll", icon: Activity },
  { href: "/teacher/settings", label: "Einstellungen", icon: Settings },
  { href: "/teacher/account", label: "Konto", icon: KeyRound },
];

export function TeacherNav() {
  const pathname = usePathname();
  const { notifications, messages, isLive, logout, authUser } = useApp();
  const pending =
    notifications.filter((n) => !n.read).length +
    messages.filter((m) => m.status === "pending").length;

  return (
    <>
    <aside className="hidden md:flex w-64 flex-col gap-2 border-r border-white/10 bg-[#0d1526]/85 p-4 backdrop-blur">
      <div className="mb-4">
        <p className="font-display text-lg font-bold text-white">{BRAND.name}</p>
        <p className="text-xs text-slate-400">
          {authUser?.name ?? "Lehrer"} {isLive ? "· LIVE" : "· Solo-Hinweise"}
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/teacher"
              ? pathname === "/teacher" || pathname === "/teacher/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-violet-500/20 text-white"
                  : "text-slate-300 hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {label === "Anfragen" && pending > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 text-[10px] text-black">
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => void logout().then(() => {
          window.location.href = "/login/";
        })}
        className="text-left text-xs text-slate-500 hover:text-slate-300"
      >
        Abmelden
      </button>
    </aside>
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around gap-1 overflow-x-auto border-t border-white/10 bg-[#0d1526]/95 p-2 backdrop-blur md:hidden">
      {links.slice(0, 6).map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex min-w-[4.5rem] flex-col items-center gap-1 px-1 py-1 text-[10px] text-slate-300"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
    </>
  );
}
