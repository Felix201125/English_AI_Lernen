import { afterEach, describe, expect, it, vi } from "vitest";

describe("buildPageMetadata", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("setzt noindex auf Dev", async () => {
    vi.stubEnv("NEXT_PUBLIC_FORCE_NOINDEX", "1");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://devlearn.klarland.net");
    const { buildPageMetadata } = await import("./site-meta");
    const m = buildPageMetadata({
      title: "Test",
      description: "Desc",
      path: "/faq/",
    });
    expect(m.robots).toMatchObject({ index: false, follow: false });
  });

  it("setzt Canonical bei Site-URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_FORCE_NOINDEX", "0");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    const { buildPageMetadata } = await import("./site-meta");
    const m = buildPageMetadata({
      title: "Test",
      description: "Desc",
      path: "/faq/",
    });
    expect(m.alternates?.canonical).toBe("https://example.com/faq/");
  });
});
