import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";

export const metadata = buildPageMetadata({
  title: `Anmelden | ${BRAND.name}`,
  description: `Melde dich bei ${BRAND.name} an — E-Mail oder Google.`,
  path: "/login/",
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
