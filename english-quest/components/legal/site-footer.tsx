import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getLegalConfig, legalIsComplete } from "@/lib/legal/config";

const LINKS: { href: string; label: string }[] = [
  { href: "/ausprobieren/", label: "Ausprobieren" },
  { href: "/#fuer-schueler", label: "Für Schüler" },
  { href: "/eltern/", label: "Für Eltern" },
  { href: "/lehrkraefte/", label: "Für Lehrkräfte" },
  { href: "/schulen/", label: "Für Schulen" },
  { href: "/faecher/", label: "Fächer" },
  { href: "/arbeitsblaetter/", label: "Arbeitsblätter" },
  { href: "/preise/", label: "Preise" },
  { href: "/faq/", label: "FAQ" },
  { href: "/ratgeber/", label: "Ratgeber" },
  { href: "/kontakt/", label: "Kontakt" },
  { href: "/impressum/", label: "Impressum" },
  { href: "/datenschutz/", label: "Datenschutz" },
];

function socialLinks(): { href: string; label: string }[] {
  const out: { href: string; label: string }[] = [];
  const ig = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM?.trim();
  const yt = process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE?.trim();
  const li = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim();
  if (ig) out.push({ href: ig, label: "Instagram" });
  if (yt) out.push({ href: yt, label: "YouTube" });
  if (li) out.push({ href: li, label: "LinkedIn" });
  return out;
}

export function SiteFooter({ className = "" }: { className?: string }) {
  const legal = getLegalConfig();
  const year = new Date().getFullYear();
  const name = legalIsComplete(legal) ? legal.operatorName : "";
  const social = socialLinks();

  return (
    <footer className={`space-y-2 text-xs text-slate-500 ${className}`}>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="font-medium text-slate-400">{BRAND.name}</span>
        {LINKS.map((l) => (
          <Link
            key={`${l.href}-${l.label}`}
            href={l.href}
            className="hover:text-slate-300"
          >
            {l.label}
          </Link>
        ))}
      </div>
      {social.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {social.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="hover:text-slate-300"
              rel="noopener noreferrer"
              target="_blank"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}
      <p>
        © {year}
        {name ? ` ${name}` : ""}
      </p>
    </footer>
  );
}
