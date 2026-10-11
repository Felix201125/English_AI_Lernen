import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 ${className}`}
    >
      <span>{BRAND.name}</span>
      <Link href="/impressum" className="hover:text-slate-300">
        Impressum
      </Link>
      <Link href="/datenschutz" className="hover:text-slate-300">
        Datenschutz
      </Link>
    </footer>
  );
}
