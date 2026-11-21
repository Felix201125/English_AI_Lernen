import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";

export const metadata = buildPageMetadata({
  title: `Registrieren | ${BRAND.name}`,
  description: `Kostenloses Konto bei ${BRAND.name} — in wenigen Sekunden fertig.`,
  path: "/register/",
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
