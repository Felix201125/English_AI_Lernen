import { describe, expect, it } from "vitest";
import { abBucket, persistUtm, recordEvent } from "./funnel";

describe("analytics funnel", () => {
  it("zeichnet Events auf", () => {
    const next = recordEvent([], "landing_view", { source: "direct" });
    expect(next).toHaveLength(1);
    expect(next[0].event).toBe("landing_view");
  });

  it("A/B sticky", () => {
    expect(abBucket("A")).toBe("A");
    expect(abBucket("B")).toBe("B");
  });

  it("UTM Persistenz", () => {
    const utm = persistUtm("?utm_source=share&utm_medium=wa&utm_campaign=probe");
    expect(utm.utm_source).toBe("share");
  });
});
