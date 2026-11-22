import { test, expect } from "@playwright/test";

test.describe("Wachstums-Flows (Auftrag 7 H)", () => {
  test("Probe: Interesse-Kachel öffnet Klassenwahl", async ({ page }) => {
    await page.goto("/ausprobieren/");
    await expect(page.getByRole("heading", { name: /Was interessiert dich/i })).toBeVisible();
    await page.getByRole("button", { name: /Fußball/i }).click();
    await expect(page.getByRole("heading", { name: /Welche Klasse/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Google-Button: ohne Client-ID nicht dauerhaft „wird geladen“", async ({
    page,
  }) => {
    await page.goto("/login/");
    await expect(page.getByLabel(/E-Mail/i)).toBeVisible();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/Google wird geladen/i)).toHaveCount(0);
  });

  test("Lehrkräfte: Vorschau-Formular sichtbar", async ({ page }) => {
    await page.goto("/lehrkraefte/");
    await expect(
      page.getByRole("heading", { name: /Für Lehrkräfte/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Vorschau erzeugen/i })).toBeVisible();
  });

  test("Schulen: Formular Validierung", async ({ page }) => {
    await page.goto("/schulen/");
    await page.getByRole("button", { name: /Anfrage senden/i }).click();
    // HTML5 required verhindert Submit — Seite bleibt, kein Crash
    await expect(page.getByRole("heading", { name: /Für Schulen/i })).toBeVisible();
  });

  test("Newsletter-Button heißt Eintragen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /^Eintragen$/ })).toBeVisible();
  });

  test("Footer Für Schüler → #fuer-schueler", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^Für Schüler$/ }).click();
    await expect(page.locator("#fuer-schueler")).toBeVisible();
  });
});
