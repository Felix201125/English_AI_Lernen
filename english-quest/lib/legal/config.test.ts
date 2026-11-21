import { afterEach, describe, expect, it, vi } from "vitest";

describe("legal config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("legalIsComplete false ohne Pflichtfelder", async () => {
    vi.stubEnv("NEXT_PUBLIC_LEGAL_OPERATOR_NAME", "");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_STREET", "");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_ZIP_CITY", "");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_RESPONSIBLE", "");
    const { legalIsComplete, getLegalConfig } = await import("./config");
    expect(legalIsComplete(getLegalConfig())).toBe(false);
  });

  it("legalIsComplete true mit Pflichtfeldern", async () => {
    vi.stubEnv("NEXT_PUBLIC_LEGAL_OPERATOR_NAME", "Klarland GmbH");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_STREET", "Musterstr. 1");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_ZIP_CITY", "12345 Berlin");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_EMAIL", "legal@example.com");
    vi.stubEnv("NEXT_PUBLIC_LEGAL_RESPONSIBLE", "Max Beispiel");
    const { legalIsComplete, getLegalConfig } = await import("./config");
    expect(legalIsComplete(getLegalConfig())).toBe(true);
  });

  it("shouldNoIndex auf Dev / ohne Site-URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_FORCE_NOINDEX", "1");
    const { shouldNoIndex } = await import("./config");
    expect(shouldNoIndex()).toBe(true);
  });

  it("pricingMode free_launch als Default", async () => {
    vi.stubEnv("NEXT_PUBLIC_PRICING_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    vi.stubEnv("NEXT_PUBLIC_FORCE_NOINDEX", "");
    const { getSiteConfig } = await import("./config");
    expect(getSiteConfig().pricingMode).toBe("free_launch");
  });
});
