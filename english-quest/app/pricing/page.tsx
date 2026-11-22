"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Alias → /preise/ */
export default function PricingRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/preise/");
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center text-slate-300">
      <p>
        Weiterleitung zu{" "}
        <a className="text-indigo-300 underline" href="/preise/">
          Preise
        </a>
        …
      </p>
    </main>
  );
}
