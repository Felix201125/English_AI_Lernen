"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, authInputClass } from "@/components/auth/auth-shell";
import { GoogleAuthSection } from "@/components/auth/google-auth-section";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/auth/types";

type RegisterRole = UserRole | "parent";

function RegisterForm() {
  const { authReady, authUser, register, loginWithGoogle } = useApp();
  const router = useRouter();
  const search = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<RegisterRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = search.get("role");
    if (r === "teacher" || r === "parent" || r === "student") {
      setRole(r === "parent" ? "parent" : r);
    }
    const inv = search.get("invite") || search.get("class");
    if (inv) {
      localStorage.setItem("qestra.inviteCode", inv.trim().toUpperCase());
    }
  }, [search]);

  useEffect(() => {
    if (!authReady || !authUser) return;
    const hint =
      typeof window !== "undefined"
        ? localStorage.getItem("qestra.roleHint")
        : null;
    router.replace(
      authUser.role === "teacher"
        ? "/teacher/"
        : hint === "parent"
          ? "/eltern/"
          : "/student/"
    );
  }, [authReady, authUser, router]);

  const goAfter = (r: RegisterRole) => {
    router.replace(
      r === "teacher" ? "/teacher/" : r === "parent" ? "/eltern/" : "/student/"
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const localName = email.split("@")[0] || "Nutzer";
      const user = await register({
        name: localName,
        email: email.trim(),
        password,
        role: role === "parent" ? "student" : role, // API kennt parent ggf. noch nicht — Flag lokal
      });
      if (role === "parent") {
        localStorage.setItem("qestra.roleHint", "parent");
      }
      goAfter(role);
      void user;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registrierung fehlgeschlagen."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Konto erstellen"
      footer={
        <p className="text-center text-sm text-slate-400">
          Schon registriert?{" "}
          <Link href="/login/" className="text-indigo-300 hover:text-indigo-200">
            Anmelden
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="eq-card space-y-4 p-6">
        <div>
          <p className="mb-2 text-sm text-slate-300">Ich bin</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                ["student", "Schüler:in"],
                ["teacher", "Lehrkraft"],
                ["parent", "Eltern"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`rounded-xl border px-3 py-4 text-sm font-semibold ${
                  role === id
                    ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                    : "border-white/10 text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            autoComplete="email"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-slate-300"
            htmlFor="password"
          >
            Passwort (min. 8 Zeichen)
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? "Verbergen" : "Anzeigen"}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full py-3" size="lg">
          {busy ? "Konto wird erstellt…" : "Kostenlos registrieren"}
        </Button>
        <p className="text-center text-xs text-slate-500">
          Kostenlos · Keine Kreditkarte · In 30 Sekunden fertig
        </p>

        <GoogleAuthSection
          role={role === "parent" ? "student" : role}
          dividerText="oder mit Google"
          onError={setError}
          onCredential={async (idToken) => {
            setBusy(true);
            setError(null);
            try {
              const user = await loginWithGoogle(
                idToken,
                role === "parent" ? "student" : role
              );
              goAfter(role);
              void user;
            } finally {
              setBusy(false);
            }
          }}
        />
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-300">
          Laden…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
