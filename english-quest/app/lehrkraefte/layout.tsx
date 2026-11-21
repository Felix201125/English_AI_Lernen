import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";

export const metadata = buildPageMetadata({
  title: `Arbeitsblätter mit KI erstellen – kostenlos | ${BRAND.name} für Lehrkräfte`,
  description: `Arbeitsblatt-Vorschau ohne Login. PDF nach Registrierung. ${BRAND.name} für Lehrkräfte.`,
  path: "/lehrkraefte/",
});

export default function LehrkraefteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
