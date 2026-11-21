"use client";

import { useEffect, useState } from "react";
import { fetchGoogleClientId } from "@/lib/auth/client";
import { GoogleButton } from "@/components/auth/google-button";
import type { UserRole } from "@/lib/auth/types";

/** Zeigt Google-Login nur, wenn eine Client-ID konfiguriert ist. */
export function GoogleAuthSection({
  role,
  onCredential,
  onError,
  label,
  dividerText = "oder",
}: {
  role: UserRole;
  onCredential: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
  label?: string;
  dividerText?: string;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchGoogleClientId().then((id) => {
      if (!cancelled) setEnabled(Boolean(id));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled === false) return null;
  if (enabled === null) {
    // Kurz prüfen — kein dauerhaftes „Google wird geladen…“
    return null;
  }

  return (
    <>
      <div className="relative py-2 text-center text-xs text-slate-500">
        <span>{dividerText}</span>
      </div>
      <GoogleButton
        role={role}
        label={label}
        onError={onError}
        onCredential={onCredential}
      />
    </>
  );
}
