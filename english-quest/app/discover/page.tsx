"use client";

import { useEffect } from "react";
import Link from "next/link";
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
        <Link className="text-indigo-300 underline" href="/#so-funktionierts">
          Startseite
        </Link>
        …
      </p>
    </main>
  );
}
