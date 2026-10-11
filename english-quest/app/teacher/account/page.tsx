"use client";

import Link from "next/link";
import { AccountPanel } from "@/components/auth/account-panel";

export default function TeacherAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Konto</h1>
        <p className="mt-1 text-slate-400">
          Profil, Passwort, Abmelden überall und Konto löschen.{" "}
          <Link
            href="/teacher/settings"
            className="text-indigo-300 hover:text-indigo-200"
          >
            Unterrichts-Einstellungen →
          </Link>
        </p>
      </div>
      <AccountPanel />
    </div>
  );
}
