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

/**
 * Google Sign-In. Ohne Client-ID: nichts rendern (kein hängendes „wird geladen…“).
 */
export function GoogleButton({ role, onCredential, onError, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState<
    "checking" | "ready" | "unavailable" | "hidden"
  >("checking");

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let didReady = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled && !didReady) {
        // Nach Timeout still ausblenden — keine Env-/Config-Hinweise öffentlich
        setStatus("hidden");
        console.warn("[qestra] Google Sign-In timed out");
      }
    }, 8000);

    const boot = async () => {
      const clientId = await fetchGoogleClientId();
      if (cancelled) return;
      if (!clientId) {
        setStatus("hidden");
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
              () => reject(new Error("gis-load-failed")),
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
          script.onerror = () => reject(new Error("gis-load-failed"));
          document.head.appendChild(script);
        });

      try {
        await ensureScript();
        if (cancelled || !hostRef.current || !window.google?.accounts?.id) {
          setStatus("hidden");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              onErrorRef.current(
                "Anmeldung mit Google ist fehlgeschlagen. Bitte E-Mail nutzen."
              );
              return;
            }
            try {
              await onCredentialRef.current(response.credential);
            } catch (e) {
              console.error("[qestra] Google credential error", e);
              onErrorRef.current(
                "Anmeldung mit Google ist fehlgeschlagen. Bitte E-Mail nutzen."
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
          setStatus("ready");
        }
      } catch (e) {
        console.warn("[qestra] Google Sign-In unavailable", e);
        setStatus("hidden");
      }
    };

    void boot();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  void role;

  if (status === "hidden" || status === "unavailable") {
    return null;
  }

  return (
    <div className="space-y-2" data-testid="google-login">
      {label && status === "ready" && (
        <p className="text-center text-xs text-slate-500">{label}</p>
      )}
      <div ref={hostRef} className="flex min-h-[44px] justify-center" />
      {status === "checking" && (
        <p className="text-center text-xs text-slate-500" aria-live="polite">
          Optionen werden geprüft…
        </p>
      )}
    </div>
  );
}
