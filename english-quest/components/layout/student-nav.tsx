"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarDays,
  Gamepad2,
  Heart,
  Home,
  KeyRound,
  Radio,
  GraduationCap,
  TrendingUp,
  User,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useApp } from "@/components/providers/app-provider";
import { t } from "@/lib/i18n";

export function StudentNav() {
  const pathname = usePathname();
  const { activeStudent, isLive, isChildMode, logout, live } = useApp();
  const i18n = t();
  const reallyLive = isLive && Boolean(live.dailyRoomUrl);

  const links = [
    { href: "/student", label: i18n.nav.home, icon: Home },
    { href: "/student/games", label: i18n.nav.games, icon: Gamepad2 },
    { href: "/student/learn", label: i18n.nav.learn, icon: BookOpen },
    { href: "/student/progress", label: i18n.nav.progress, icon: TrendingUp },
    { href: "/student/teachers", label: i18n.nav.teachers, icon: GraduationCap },
    { href: "/student/lessons", label: i18n.nav.lessons, icon: CalendarDays },
    { href: "/student/interests", label: i18n.nav.interests, icon: Heart },
    { href: "/student/ai", label: i18n.nav.ai, icon: Bot },
    { href: "/student/profile", label: i18n.nav.profile, icon: User },
    { href: "/student/account", label: i18n.nav.account, icon: KeyRound },
    { href: "/student/live", label: i18n.nav.live, icon: Radio },
  ];

  const mobileLinks = [
    links[0],
    links[1],
    links[4],
    links[5],
    links[7],
  ];

  return (
    <>
      <aside className="hidden md:flex w-64 flex-col gap-2 border-r border-white/10 bg-[#0d1526]/80 p-4 backdrop-blur">
        <div className="mb-4">
          <p className="font-display text-lg font-bold text-white">{BRAND.name}</p>
          <p className="text-xs text-slate-400">
            Hi {activeStudent.name}
            {reallyLive ? " · Live-Stunde" : ""}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/student"
                ? pathname === "/student"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isChildMode && "py-3 text-base",
                  active
                    ? "bg-indigo-500/20 text-white eq-glow"
                    : "text-slate-300 hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-white/10 bg-[#0d1526]/95 p-2 backdrop-blur md:hidden">
        {mobileLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] text-slate-300"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
