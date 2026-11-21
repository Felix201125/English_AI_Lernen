# Auftrag 6 – Bericht (Wachstum, Probe, Conversion)

Branch: `feat/auftrag-6-wachstum`  
Stand: 2026-11-21

## Pakete A–H

| Paket | Status | Kurz |
|-------|--------|------|
| A Rechtliches / Vertrauen | erledigt | Impressum/Datenschutz aus Env, Preise ohne Demo, Tutoren ohne Seed, Google ausblenden ohne Client-ID, noindex Dev, Legal-Build-Guard, Smoke+Text-Check |
| B Gast-Probe | erledigt | `/ausprobieren/`, Redirects `/demo/` `/probe/`, `guest.php`, Merge idempotent, KI max. 3 |
| C Startseite | erledigt | H1/Unterzeile verbindlich, Probe-CTA sticky, Zielgruppen, FAQ, Footer |
| D Marketing | erledigt | `/lehrkraefte/` Vorschau+Limit, `/eltern/` Beispielkind, `/schulen/` Pilotformular |
| E SEO | erledigt | Metadata-Helper, Sitemap/robots, Fächer/Themen, Galerie, Ratgeber, OG-Fallback |
| F Growth | erledigt | Einladen-Seite, Invite-API, Klassencode-Eingabe, Share-Card, Challenge-Leaderboard-Logik |
| G Auth kurz | erledigt | Register nur E-Mail+Passwort+Rolle, Magic Link, Newsletter Double-Opt-in |
| H Analytics | erledigt | Funnel-Events, Admin-Dashboard Key-geschützt, A/B-Cookie, Kampagne `/start/beispiel-mathe-fussball/` |

## Wichtige Erweiterungen (bestehende Dateien)

- `lib/legal/config.ts`, `lib/seo/site-meta.ts`, `components/auth/google-button.tsx`, `app/impressum|datenschutz`, `php-api/auth.php`
- `components/providers/app-provider.tsx` — Gast-Merge in Schüler-Persistenz
- `app/page.tsx`, `components/landing/*`, `scripts/build-hetzner.sh`, `scripts/smoke-public.mjs`

## Neu (Auswahl)

- `php-api/guest.php`, `guest_worksheet.php`, `pilot_school.php`, `invites.php`, `newsletter.php`, `analytics.php`
- `app/ausprobieren/`, `app/eltern|lehrkraefte|schulen/`, `app/faecher/**`, `app/arbeitsblaetter/**`, `app/ratgeber/**`, `app/start/[slug]/`, `app/admin/analytics/`
- `lib/guest/*`, `lib/growth/*`, `lib/analytics/*`, `content/campaigns/*`

## Bewusst offen / Betreiber

- Echte Legal-Pflichtfelder (`NEXT_PUBLIC_LEGAL_*`) — Prod-Build mit `QESTRA_PRODUCTION_BUILD=1` / `REQUIRE_LEGAL=1` ist sonst rot
- `NEXT_PUBLIC_SITE_URL` (Produktions-Origin); Staging: `NEXT_PUBLIC_FORCE_NOINDEX=1`
- `NEXT_PUBLIC_PRICING_MODE` + optionale Preis-Hints; Testimonials fehlen → Abschnitt nicht gerendert
- `google_client_id` in `api/config.php` + erlaubte Origins
- SMTP/`mail_from`/`public_origin` für Magic Link, Newsletter, Pilotschule
- `analytics_admin_key`, optional `ANALYTICS_DOMAIN` / Plausible (ohne Env kein Dritt-Skript)
- `LEGAL_AV_CONTRACT_PATH` / `NEXT_PUBLIC_LEGAL_AV_CONTRACT_URL`, Teacher-Worksheet-Pack-Pfad
- `NEXT_PUBLIC_LEGAL_HOSTING_DE=1` nur wenn Hosting DE wirklich zutrifft
- Screenshots/Loops: UI-Captures als CSS-Platzhalter, keine Stock-Fotos; echte Captures nachliefern
- Noch keine echten Lehrkräfte in `/tutoren/`
- Eltern-Rolle API-seitig noch als Schüler-Konto + lokalem Hint (vollständige Parent-Rolle ausbauen)
- Lighthouse-Lauf ≥90 dokumentieren auf Staging nach Deploy
- Playwright-E2E: Runner noch nicht im Repo — Unit/Smoke vorhanden; E2E nachrüsten empfohlen

## Lokal / Hetzner prüfen

```bash
cd english-quest
npm test
NEXT_PUBLIC_FORCE_NOINDEX=1 npm run build
node scripts/smoke-public.mjs out
# Prod-Legal-Check:
REQUIRE_LEGAL=1 node scripts/check-legal.mjs
npm run build:hetzner   # schreibt dist-hetzner + Smoke
```

Wichtige URLs: `/`, `/ausprobieren/`, `/eltern/`, `/lehrkraefte/`, `/schulen/`, `/faecher/mathe/`, `/arbeitsblaetter/`, `/ratgeber/`, `/start/beispiel-mathe-fussball/`, `/impressum/`, `/datenschutz/`.

Gast-Merge: Client liest `qestra.guest.session` / Cookie, merged in `ensureStudentProfile` → `student.php` Bundle (`badgeIds`, `mergedGuestTokens`).

Pagespeed/Apache: neue Routen als Ordner/`index.html`; `.htaccess` enthält 301 für `/demo/` und `/probe/`.
