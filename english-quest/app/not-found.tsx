import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl font-bold text-indigo-300/80">404</p>
      <h1 className="mt-4 font-display text-2xl text-white">
        Seite nicht gefunden
      </h1>
      <p className="mt-2 max-w-md text-slate-400">
        Diese Adresse gibt es bei {BRAND.name} nicht.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white"
      >
        Zur Startseite
      </Link>
    </main>
  );
}
