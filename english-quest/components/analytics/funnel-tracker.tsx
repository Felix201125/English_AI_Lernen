"use client";

import { useEffect } from "react";
import { loadUtm, persistUtm, type FunnelEvent } from "@/lib/analytics/funnel";

export function trackFunnel(event: FunnelEvent, source?: string) {
  if (typeof window === "undefined") return;
  const utm = loadUtm();
  const ab =
    document.cookie.match(/(?:^|; )qestra_ab=([AB])/)?.[1] ||
    (() => {
      const v = Math.random() < 0.5 ? "A" : "B";
      document.cookie = `qestra_ab=${v};path=/;max-age=31536000;SameSite=Lax`;
      return v;
    })();
  const base =
    process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "") ||
    `${window.location.origin}/api`;
  void fetch(`${base}/analytics.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, source, utm, abVariant: ab }),
  }).catch(() => {
    /* offline: local fallback */
    try {
      const key = "qestra.funnel";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push({ event, at: new Date().toISOString(), source, utm, abVariant: ab });
      localStorage.setItem(key, JSON.stringify(prev.slice(-200)));
    } catch {
      /* ignore */
    }
  });
}

export function LandingFunnel() {
  useEffect(() => {
    persistUtm(window.location.search);
    trackFunnel("landing_view", "landing");
  }, []);
  return null;
}
