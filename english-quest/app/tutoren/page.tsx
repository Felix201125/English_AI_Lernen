"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Marktplatz-Flag aus (Default): Redirect auf /lehrkraefte/.
 * Flag NEXT_PUBLIC_FEATURE_TUTOR_MARKETPLACE=1 → echte Profile (später).
 */
export default function TutorenPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/lehrkraefte/");
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-slate-300">
      <p>
        Weiterleitung zu{" "}
        <a className="text-indigo-300 underline" href="/lehrkraefte/">
          Lehrkräfte
        </a>
        …
      </p>
    </main>
  );
}
