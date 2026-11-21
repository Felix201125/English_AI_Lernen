import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";

export const metadata = buildPageMetadata({
  title: `Für Schulen | ${BRAND.name}`,
  description: `Pilotschule werden: Klassen, Klassencode, Datenschutz bei ${BRAND.name}.`,
  path: "/schulen/",
});

export default function SchulenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
