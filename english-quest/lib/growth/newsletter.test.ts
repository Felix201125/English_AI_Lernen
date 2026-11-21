import { describe, expect, it } from "vitest";
import { confirmSubscriber, isListed } from "./newsletter";

describe("newsletter double opt-in", () => {
  it("unbestätigt nicht in Liste", () => {
    const subs = [
      {
        email: "a@b.de",
        confirmed: false,
        confirmToken: "tok",
        list: "news" as const,
      },
    ];
    expect(isListed(subs, "a@b.de", "news")).toBe(false);
    const next = confirmSubscriber(subs, "tok");
    expect(isListed(next, "a@b.de", "news")).toBe(true);
  });
});
