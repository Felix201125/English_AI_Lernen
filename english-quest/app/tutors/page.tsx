"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Marktplatz-Flag aus → /lehrkraefte/ */
export default function TutorsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/lehrkraefte/");
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center text-slate-300">
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
