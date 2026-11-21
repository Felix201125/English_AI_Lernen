import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { getSiteConfig, shouldNoIndex } from "@/lib/legal/config";

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const site = getSiteConfig();
  const canonical =
    site.siteUrl && input.path
      ? `${site.siteUrl}${input.path.startsWith("/") ? input.path : `/${input.path}`}`
      : undefined;
  const noIndex = shouldNoIndex();

  return {
    title: input.title,
    description: input.description,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: BRAND.name,
      locale: "de_DE",
      type: "website",
      images: site.siteUrl
        ? [{ url: `${site.siteUrl}/og-default.png`, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}
