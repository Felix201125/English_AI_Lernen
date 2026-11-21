import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AppProvider } from "@/components/providers/app-provider";
import { BRAND } from "@/lib/brand";
import { shouldNoIndex, getSiteConfig } from "@/lib/legal/config";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const site = getSiteConfig();
const noIndex = shouldNoIndex();

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  metadataBase: site.siteUrl ? new URL(site.siteUrl) : undefined,
  robots: noIndex
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
  openGraph: {
    siteName: BRAND.name,
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${plusJakarta.variable} ${spaceGrotesk.variable} antialiased text-foreground`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
