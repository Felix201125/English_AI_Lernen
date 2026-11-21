"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, authInputClass } from "@/components/auth/auth-shell";
import { GoogleAuthSection } from "@/components/auth/google-auth-section";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const { authReady, authUser, login, loginWithGoogle } = useApp();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authReady || !authUser) return;
    const dest =
      next || (authUser.role === "teacher" ? "/teacher" : "/student");
    router.replace(dest);
  }, [authReady, authUser, next, router]);

  const goAfter = (role: string) => {
    router.replace(next || (role === "teacher" ? "/teacher" : "/student"));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      goAfter(user.role);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Anmeldung fehlgeschlagen."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Anmelden"
      footer={
        <p className="text-center text-sm text-slate-400">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-indigo-300 hover:text-indigo-200">
            Registrieren
          </Link>
          {" · "}
          <Link href="/" className="hover:text-slate-300">
            Startseite
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="eq-card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder="name@schule.de"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-slate-300"
            htmlFor="password"
          >
            Passwort
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

          <Button type="submit" disabled={busy} className="w-full py-3" size="lg">
            {busy ? "Anmelden…" : "Anmelden"}
          </Button>

          <p className="text-center text-xs text-slate-500">
            <a
              href="mailto:support@klarland.net?subject=Qestra%20Passwort%20vergessen"
              className="text-indigo-300 hover:text-indigo-200"
            >
              Passwort vergessen?
            </a>
          </p>

        <GoogleAuthSection
          role="student"
          onError={setError}
          onCredential={async (idToken) => {
            setBusy(true);
            setError(null);
            try {
              const user = await loginWithGoogle(idToken, "student");
              goAfter(user.role);
            } finally {
              setBusy(false);
            }
          }}
        />
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-300">
          Laden…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
