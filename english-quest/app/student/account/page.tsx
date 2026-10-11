"use client";

import Link from "next/link";
import { AccountPanel } from "@/components/auth/account-panel";

export default function StudentAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Konto</h1>
        <p className="mt-1 text-slate-400">
          Profil, Passwort und Konto löschen.{" "}
          <Link href="/student/profile" className="text-indigo-300 hover:text-indigo-200">
            Zum Lernprofil →
          </Link>
        </p>
      </div>
      <AccountPanel />
    </div>
  );
}
