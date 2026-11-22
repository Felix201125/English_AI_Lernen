"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Marktplatz-Flag aus (Default): Redirect auf /lehrkraefte/.
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
        <Link className="text-indigo-300 underline" href="/lehrkraefte/">
          Lehrkräfte
        </Link>
        …
      </p>
    </main>
  );
}
