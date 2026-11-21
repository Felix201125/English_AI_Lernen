import Link from "next/link";
import { BRAND } from "@/lib/brand";

const LINKS: { href: string; label: string }[] = [
  { href: "/ausprobieren/", label: "Ausprobieren" },
  { href: "/ausprobieren/", label: "Für Schüler" },
  { href: "/eltern/", label: "Für Eltern" },
  { href: "/lehrkraefte/", label: "Für Lehrkräfte" },
  { href: "/schulen/", label: "Für Schulen" },
  { href: "/faecher/", label: "Fächer" },
  { href: "/preise/", label: "Preise" },
  { href: "/faq/", label: "FAQ" },
  { href: "/ratgeber/", label: "Ratgeber" },
  { href: "/kontakt/", label: "Kontakt" },
  { href: "/impressum/", label: "Impressum" },
  { href: "/datenschutz/", label: "Datenschutz" },
];

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 ${className}`}
    >
      <span className="font-medium text-slate-400">{BRAND.name}</span>
      {LINKS.map((l) => (
        <Link key={`${l.href}-${l.label}`} href={l.href} className="hover:text-slate-300">
          {l.label}
        </Link>
      ))}
    </footer>
  );
}
