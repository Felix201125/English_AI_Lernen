"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, authInputClass } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/auth/types";

export default function RegisterPage() {
  const { authReady, authUser, register, loginWithGoogle } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [age, setAge] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authReady || !authUser) return;
    router.replace(authUser.role === "teacher" ? "/teacher" : "/student");
  }, [authReady, authUser, router]);

  const goAfter = (r: UserRole) => {
    router.replace(r === "teacher" ? "/teacher" : "/student");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (!acceptPrivacy) {
      setError("Bitte der Datenschutzerklärung zustimmen.");
      return;
    }
    const ageNum = Number(age);
    if (!ageNum || ageNum < 8 || ageNum > 99) {
      setError("Bitte ein gültiges Alter angeben.");
      return;
    }
    if (ageNum < 16 && !parentalConsent) {
      setError(
        "Unter 16 Jahren ist die Einwilligung der Eltern oder Schule nötig (DSGVO Art. 8)."
      );
      return;
    }
    setBusy(true);
    try {
      // inviteCode wird lokal mitgespeichert (Lehrer-Zuordnung folgt serverseitig)
      if (inviteCode.trim()) {
        localStorage.setItem(
          "qestra.inviteCode",
          inviteCode.trim().toUpperCase()
        );
      }
      localStorage.setItem("qestra.register.age", String(ageNum));
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      goAfter(user.role);
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
          <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
            Anmelden
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="eq-card space-y-4 p-6">
        <div>
          <p className="mb-2 text-sm text-slate-300">Ich bin</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`rounded-xl border px-3 py-3 text-sm ${
                role === "student"
                  ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                  : "border-white/10 text-slate-300"
              }`}
            >
              Schüler
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`rounded-xl border px-3 py-3 text-sm ${
                role === "teacher"
                  ? "border-emerald-400/50 bg-emerald-500/20 text-white"
                  : "border-white/10 text-slate-300"
              }`}
            >
              Lehrer
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authInputClass}
            placeholder="Vorname"
            autoComplete="name"
          />
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
            placeholder="name@schule.de"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="invite">
            Klassen-/Einladungscode (optional)
          </label>
          <input
            id="invite"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className={authInputClass}
            placeholder="z. B. KLASSE7A"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="age">
            Alter
          </label>
          <input
            id="age"
            type="number"
            required
            min={8}
            max={99}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={authInputClass}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-slate-300"
            htmlFor="password"
          >
            Passwort (min. 8 Zeichen)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm text-slate-300"
            htmlFor="password2"
          >
            Passwort bestätigen
          </label>
          <input
            id="password2"
            type="password"
            required
            minLength={8}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className={authInputClass}
            autoComplete="new-password"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
            className="mt-1"
          />
          <span>
            Ich stimme der{" "}
            <Link href="/datenschutz" className="text-indigo-300 underline">
              Datenschutzerklärung
            </Link>{" "}
            zu.
          </span>
        </label>
        {Number(age) > 0 && Number(age) < 16 && (
          <label className="flex items-start gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={parentalConsent}
              onChange={(e) => setParentalConsent(e.target.checked)}
              className="mt-1"
            />
            <span>
              Einwilligung der Eltern oder Schule liegt vor (unter 16, DSGVO
              Art. 8).
            </span>
          </label>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full py-3" size="lg">
          {busy ? "Konto wird erstellt…" : "Registrieren"}
        </Button>

        <div className="relative py-2 text-center text-xs text-slate-500">
          <span>oder mit Google</span>
        </div>

        <GoogleButton
          role={role}
          label={
            role === "teacher"
              ? "Google-Konto als Lehrer verknüpfen"
              : "Google-Konto als Schüler verknüpfen"
          }
          onError={setError}
          onCredential={async (idToken) => {
            setBusy(true);
            setError(null);
            try {
              const user = await loginWithGoogle(idToken, role);
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
