import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteHeader({ sticky = true }: { sticky?: boolean }) {
  return (
    <header
      className={`${
        sticky ? "sticky top-0 z-50" : ""
      } border-b border-white/10 bg-[#0b1220]/85 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0">
          <p className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            {BRAND.name}
          </p>
          <p className="truncate text-xs text-slate-400">{BRAND.tagline}</p>
        </Link>
        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Link
            href="/arbeitsblaetter/"
            className="hidden text-sm text-slate-300 hover:text-white md:inline"
          >
            Arbeitsblätter
          </Link>
          <Link
            href="/ratgeber/"
            className="hidden text-sm text-slate-300 hover:text-white md:inline"
          >
            Ratgeber
          </Link>
          <Link
            href="/login/"
            className="hidden rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200 hover:border-white/30 sm:inline-block"
          >
            Anmelden
          </Link>
          <Link
            href="/register/"
            className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Registrieren
          </Link>
          <Link
            href="/ausprobieren/"
            className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 sm:px-4"
          >
            Jetzt ausprobieren
          </Link>
        </nav>
      </div>
    </header>
  );
}
