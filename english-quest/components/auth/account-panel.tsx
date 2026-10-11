"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { authInputClass } from "@/components/auth/auth-shell";

export function AccountPanel() {
  const {
    authUser,
    updateProfile,
    changePassword,
    setPassword,
    logout,
    logoutAll,
    deleteAccount,
  } = useApp();
  const router = useRouter();

  const [name, setName] = useState(authUser?.name ?? "");
  const [email, setEmail] = useState(authUser?.email ?? "");

  useEffect(() => {
    if (!authUser) return;
    setName(authUser.name);
    setEmail(authUser.email);
  }, [authUser]);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [delEmail, setDelEmail] = useState("");
  const [delConfirm, setDelConfirm] = useState("");
  const [delPassword, setDelPassword] = useState("");
  const [delErr, setDelErr] = useState<string | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  if (!authUser) return null;

  const hasPassword = Boolean(authUser.hasPassword);
  const hasGoogle = Boolean(authUser.hasGoogle);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    setProfileBusy(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileMsg("Profil gespeichert.");
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setProfileBusy(false);
    }
  };

  const onSavePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (newPassword !== newPassword2) {
      setPwErr("Passwörter stimmen nicht überein.");
      return;
    }
    setPwBusy(true);
    try {
      if (hasPassword) {
        await changePassword({ currentPassword, newPassword });
      } else {
        await setPassword(newPassword);
      }
      setPwMsg(hasPassword ? "Passwort geändert." : "Passwort gesetzt.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : "Passwort-Aktion fehlgeschlagen.");
    } finally {
      setPwBusy(false);
    }
  };

  const onDelete = async (e: FormEvent) => {
    e.preventDefault();
    setDelErr(null);
    setDelBusy(true);
    try {
      await deleteAccount({
        email: delEmail.trim(),
        confirm: delConfirm.trim(),
        password: hasPassword ? delPassword : undefined,
      });
      router.replace("/register");
    } catch (err) {
      setDelErr(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
      setDelBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="eq-card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-white">Konto</h2>
            <p className="mt-1 text-sm text-slate-400">
              Rolle: {authUser.role === "teacher" ? "Lehrer" : "Schüler"}
              {hasGoogle ? " · Google verknüpft" : ""}
              {hasPassword ? " · Passwort aktiv" : " · nur Google"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Abmelden
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logoutAll();
                router.replace("/login");
              }}
            >
              Überall abmelden
            </Button>
          </div>
        </div>

        <form onSubmit={onSaveProfile} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-300" htmlFor="acc-name">
              Anzeigename
            </label>
            <input
              id="acc-name"
              className={authInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300" htmlFor="acc-email">
              E-Mail
            </label>
            <input
              id="acc-email"
              type="email"
              className={authInputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {profileErr && (
            <p className="text-sm text-red-300">{profileErr}</p>
          )}
          {profileMsg && (
            <p className="text-sm text-emerald-300">{profileMsg}</p>
          )}
          <Button type="submit" disabled={profileBusy}>
            {profileBusy ? "Speichern…" : "Profil speichern"}
          </Button>
        </form>
      </div>

      <div className="eq-card space-y-4 p-5">
        <h2 className="font-display text-xl text-white">
          {hasPassword ? "Passwort ändern" : "Passwort festlegen"}
        </h2>
        <p className="text-sm text-slate-400">
          {hasPassword
            ? "Aktuelles Passwort bestätigen und ein neues wählen."
            : "Optional: Passwort setzen, um dich auch ohne Google anzumelden."}
        </p>
        <form onSubmit={onSavePassword} className="space-y-3">
          {hasPassword && (
            <div>
              <label
                className="mb-1 block text-sm text-slate-300"
                htmlFor="acc-cur-pw"
              >
                Aktuelles Passwort
              </label>
              <input
                id="acc-cur-pw"
                type="password"
                className={authInputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          )}
          <div>
            <label
              className="mb-1 block text-sm text-slate-300"
              htmlFor="acc-new-pw"
            >
              Neues Passwort (min. 8)
            </label>
            <input
              id="acc-new-pw"
              type="password"
              className={authInputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm text-slate-300"
              htmlFor="acc-new-pw2"
            >
              Neues Passwort wiederholen
            </label>
            <input
              id="acc-new-pw2"
              type="password"
              className={authInputClass}
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {pwErr && <p className="text-sm text-red-300">{pwErr}</p>}
          {pwMsg && <p className="text-sm text-emerald-300">{pwMsg}</p>}
          <Button type="submit" disabled={pwBusy}>
            {pwBusy ? "Speichern…" : hasPassword ? "Passwort ändern" : "Passwort setzen"}
          </Button>
        </form>
      </div>

      <div className="eq-card space-y-4 border border-rose-500/30 p-5">
        <h2 className="font-display text-xl text-rose-200">Konto löschen</h2>
        <p className="text-sm text-slate-400">
          Unwiderruflich: Login, Sitzungen und Kontodaten werden gelöscht.
          Tippe deine E-Mail und zur Bestätigung <strong>LÖSCHEN</strong>.
        </p>
        <form onSubmit={onDelete} className="space-y-3">
          <div>
            <label
              className="mb-1 block text-sm text-slate-300"
              htmlFor="acc-del-email"
            >
              E-Mail zur Bestätigung
            </label>
            <input
              id="acc-del-email"
              type="email"
              className={authInputClass}
              value={delEmail}
              onChange={(e) => setDelEmail(e.target.value)}
              required
              placeholder={authUser.email}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm text-slate-300"
              htmlFor="acc-del-confirm"
            >
              Bestätigungswort
            </label>
            <input
              id="acc-del-confirm"
              className={authInputClass}
              value={delConfirm}
              onChange={(e) => setDelConfirm(e.target.value)}
              required
              placeholder="LÖSCHEN"
            />
          </div>
          {hasPassword && (
            <div>
              <label
                className="mb-1 block text-sm text-slate-300"
                htmlFor="acc-del-pw"
              >
                Passwort
              </label>
              <input
                id="acc-del-pw"
                type="password"
                className={authInputClass}
                value={delPassword}
                onChange={(e) => setDelPassword(e.target.value)}
                required
              />
            </div>
          )}
          {delErr && <p className="text-sm text-red-300">{delErr}</p>}
          <Button type="submit" variant="danger" disabled={delBusy}>
            {delBusy ? "Löschen…" : "Konto endgültig löschen"}
          </Button>
        </form>
      </div>
    </div>
  );
}
