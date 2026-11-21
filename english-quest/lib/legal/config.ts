/**
 * Öffentliche Betreiber-/Legal-/Site-Config aus Env.
 * Keine erfundenen Firmendaten — fehlende Pflichtfelder = Build/Smoke in Prod rot.
 */

export type LegalConfig = {
  operatorName: string;
  street: string;
  zipCity: string;
  country: string;
  email: string;
  phone: string;
  responsiblePerson: string;
  registerCourt: string;
  registerNumber: string;
  vatId: string;
};

export type SiteConfig = {
  siteUrl: string;
  isProduction: boolean;
  isDevHost: boolean;
  pricingMode: "free_launch" | "priced" | "hidden";
  priceLessonHint: string;
  priceCreditsHint: string;
};

function env(key: string): string {
  const v = process.env[key];
  return typeof v === "string" ? v.trim() : "";
}

export function getLegalConfig(): LegalConfig {
  return {
    operatorName: env("NEXT_PUBLIC_LEGAL_OPERATOR_NAME"),
    street: env("NEXT_PUBLIC_LEGAL_STREET"),
    zipCity: env("NEXT_PUBLIC_LEGAL_ZIP_CITY"),
    country: env("NEXT_PUBLIC_LEGAL_COUNTRY") || "Deutschland",
    email: env("NEXT_PUBLIC_LEGAL_EMAIL"),
    phone: env("NEXT_PUBLIC_LEGAL_PHONE"),
    responsiblePerson: env("NEXT_PUBLIC_LEGAL_RESPONSIBLE"),
    registerCourt: env("NEXT_PUBLIC_LEGAL_REGISTER_COURT"),
    registerNumber: env("NEXT_PUBLIC_LEGAL_REGISTER_NUMBER"),
    vatId: env("NEXT_PUBLIC_LEGAL_VAT_ID"),
  };
}

/** Pflichtfelder für öffentliches Impressum (§ 5 DDG) */
export const LEGAL_REQUIRED_KEYS = [
  "NEXT_PUBLIC_LEGAL_OPERATOR_NAME",
  "NEXT_PUBLIC_LEGAL_STREET",
  "NEXT_PUBLIC_LEGAL_ZIP_CITY",
  "NEXT_PUBLIC_LEGAL_EMAIL",
  "NEXT_PUBLIC_LEGAL_RESPONSIBLE",
] as const;

export function legalIsComplete(legal: LegalConfig = getLegalConfig()): boolean {
  return Boolean(
    legal.operatorName &&
      legal.street &&
      legal.zipCity &&
      legal.email &&
      legal.responsiblePerson
  );
}

export function missingLegalKeys(): string[] {
  return LEGAL_REQUIRED_KEYS.filter((k) => !env(k));
}

export function getSiteConfig(): SiteConfig {
  const siteUrl = env("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  const host =
    typeof window !== "undefined"
      ? window.location.hostname
      : env("VERCEL_URL") || "";
  const isDevHost =
    host.includes("devlearn.klarland.net") ||
    host.includes("localhost") ||
    env("NEXT_PUBLIC_FORCE_NOINDEX") === "1";

  const modeRaw = env("NEXT_PUBLIC_PRICING_MODE") || "free_launch";
  const pricingMode =
    modeRaw === "priced" || modeRaw === "hidden" || modeRaw === "free_launch"
      ? modeRaw
      : "free_launch";

  return {
    siteUrl,
    isProduction: Boolean(siteUrl) && !isDevHost,
    isDevHost,
    pricingMode,
    priceLessonHint: env("NEXT_PUBLIC_PRICE_LESSON_HINT"),
    priceCreditsHint: env("NEXT_PUBLIC_PRICE_CREDITS_HINT"),
  };
}

export function shouldNoIndex(): boolean {
  return getSiteConfig().isDevHost || !getSiteConfig().siteUrl;
}
