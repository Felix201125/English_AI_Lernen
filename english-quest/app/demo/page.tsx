"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Alias → /ausprobieren/ */
export default function DemoRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ausprobieren/");
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-slate-300">
      <p>
        Weiterleitung zur Probe…{" "}
        <a className="text-indigo-300 underline" href="/ausprobieren/">
          Jetzt ausprobieren
        </a>
      </p>
    </main>
  );
}
