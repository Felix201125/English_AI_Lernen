import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";

export const metadata = buildPageMetadata({
  title: `Jetzt ausprobieren | ${BRAND.name}`,
  description:
    "Probiere Qestra ohne Anmeldung: Interessen wählen, Mini-Quest spielen, KI fragen — Fortschritt später speichern.",
  path: "/ausprobieren/",
});

export default function AusprobierenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
