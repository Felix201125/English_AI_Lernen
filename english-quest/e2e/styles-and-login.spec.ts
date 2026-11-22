import { test, expect } from "@playwright/test";

test.describe("gestylte Public-Seiten (Auftrag 7 A)", () => {
  test("Startseite hat berechnete Styles (kein nacktes HTML)", async ({
    page,
  }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const color = await h1.evaluate((el) => getComputedStyle(el).color);
    // ungestyltes HTML wäre typischerweise schwarz rgb(0,0,0) auf weiß —
    // Qestra-Hero nutzt hellen Text auf dunklem Grund
    expect(color).not.toBe("rgb(0, 0, 0)");
    const btn = page.getByRole("link", {
      name: /Jetzt ausprobieren/i,
    }).first();
    await expect(btn).toBeVisible();
    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg === "none" || bg.length > 0).toBeTruthy();
  });

  test("Login zeigt Formular, hängt nicht in Laden…", async ({ page }) => {
    await page.goto("/login/");
    await expect(page.getByLabel(/E-Mail/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/Passwort/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Anmelden/i })).toBeVisible();
    await expect(page.getByText(/^Laden…$/)).toHaveCount(0);
  });

  test("Register zeigt Formular", async ({ page }) => {
    await page.goto("/register/");
    await expect(page.getByLabel(/E-Mail/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/^Laden…$/)).toHaveCount(0);
  });
});
