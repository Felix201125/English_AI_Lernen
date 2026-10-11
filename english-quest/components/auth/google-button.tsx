"use client";

import { useEffect, useRef, useState } from "react";
import { fetchGoogleClientId } from "@/lib/auth/client";
import type { UserRole } from "@/lib/auth/types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            parent: HTMLElement,
            config: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

type Props = {
  role: UserRole;
  onCredential: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
  label?: string;
};

export function GoogleButton({ role, onCredential, onError, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let didReady = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled && !didReady) {
        setMissing(true);
        setHint(
          "Google antwortet nicht. Bitte mit E-Mail anmelden oder google_client_id / Origins prüfen (devlearn.klarland.net)."
        );
      }
    }, 8000);

    const boot = async () => {
      const clientId = await fetchGoogleClientId();
      if (cancelled) return;
      if (!clientId) {
        setMissing(true);
        setHint(
          "Google-Login ist noch nicht eingerichtet. Nutze E-Mail/Passwort oder trage google_client_id in api/config.php ein und erlaube den Origin https://devlearn.klarland.net in der Google Cloud Console."
        );
        return;
      }

      const ensureScript = () =>
        new Promise<void>((resolve, reject) => {
          if (window.google?.accounts?.id) {
            resolve();
            return;
          }
          const existing = document.querySelector<HTMLScriptElement>(
            'script[data-google-gis="1"]'
          );
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener(
              "error",
              () => reject(new Error("Google-Skript fehlgeschlagen")),
              { once: true }
            );
            return;
          }
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.dataset.googleGis = "1";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Google-Skript fehlgeschlagen"));
          document.head.appendChild(script);
        });

      try {
        await ensureScript();
        if (cancelled || !hostRef.current || !window.google?.accounts?.id) {
          setMissing(true);
          setHint("Google konnte nicht geladen werden. Bitte E-Mail nutzen.");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              onErrorRef.current("Google hat kein Token geliefert.");
              return;
            }
            try {
              await onCredentialRef.current(response.credential);
            } catch (e) {
              onErrorRef.current(
                e instanceof Error
                  ? e.message
                  : "Google-Anmeldung fehlgeschlagen."
              );
            }
          },
          ux_mode: "popup",
          context: "signin",
          use_fedcm_for_prompt: false,
        });

        hostRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hostRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320,
          locale: "de",
        });
        if (!cancelled) {
          didReady = true;
          setReady(true);
          setMissing(false);
          setHint(null);
        }
      } catch (e) {
        setMissing(true);
        setHint(
          e instanceof Error
            ? e.message
            : "Google konnte nicht geladen werden. Bitte mit E-Mail fortfahren."
        );
        onErrorRef.current(
          "Google-Login nicht verfügbar — bitte E-Mail nutzen."
        );
      }
    };

    void boot();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  void role;

  return (
    <div className="space-y-2">
      {label && <p className="text-center text-xs text-slate-500">{label}</p>}
      <div ref={hostRef} className="flex min-h-[44px] justify-center" />
      {!ready && !missing && (
        <p className="text-center text-xs text-slate-500">Google wird geladen…</p>
      )}
      {missing && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-slate-400">
          {hint ||
            "Google-Login nicht verfügbar. Bitte mit E-Mail und Passwort fortfahren."}
        </p>
      )}
    </div>
  );
}
