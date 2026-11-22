"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Veraltet → Startseite #so-funktionierts */
export default function DiscoverRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#so-funktionierts");
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center text-slate-300">
      <p>
        Weiterleitung zur{" "}
        <a className="text-indigo-300 underline" href="/#so-funktionierts">
          Startseite
        </a>
        …
      </p>
    </main>
  );
}
