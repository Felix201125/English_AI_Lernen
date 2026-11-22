# Auftrag 7 – Bericht (Stabilität, Rechtliches, Feinschliff)

Branch: `fix/auftrag-7-stabilitaet-feinschliff`  
Bezug: Befund 21.11.2026 (mod_pagespeed → 404 auf `/_next/static`)

## Pakete A–H

| Paket | Status | Kurz |
|-------|--------|------|
| A Pagespeed/Deploy | erledigt | `ModPagespeed off` + Disallow `/_next/` in ausgelieferter `.htaccess`; Asset-Smoke; Playwright Styles/Login; HETZNER.md §9 |
| B Legal | erledigt | Kein „Angaben folgen“; Kontakt=Impressum-Quelle; Datenschutz ohne Meta-Kommentar; Text-Check erweitert |
| C Alt-Routen | erledigt | `/pricing/`→`/preise/`, `/tutors|/tutoren/`→`/lehrkraefte/`, `/discover/`→`/#so-funktionierts`; aus Sitemap entfernt |
| D Bald + Links | erledigt | `language`, `naturwissenschaften`, `geschichte` mit Newsletter; `check-links.mjs` |
| E Fach-Config | erledigt | `lib/content/subject-catalog.ts` einzige Landing-/Fächer-Quelle; AV „auf Anfrage“; Eltern-Beispiel-Formulierung |
| F i18n/Nav | erledigt | Deutsche Titel, Lehrkraft, Newsletter „Eintragen“, Footer/Header mit Arbeitsblätter/Ratgeber, `#fuer-schueler` |
| G Content | erledigt | ≥8 Themen je Mathe/Deutsch/Englisch + `review_status`; Galerie/Ratgeber erweitert |
| H E2E | erledigt | `e2e/growth-flows.spec.ts` + Styles/Login; Unit-Tests weiter |

## Pagespeed

- **Wo:** Document-Root-`.htaccess` (geschrieben von `scripts/build-hetzner.sh`), Beispiel `deploy/apache-qestra.conf.example`
- **Direktive:** `ModPagespeed off` und `ModPagespeedDisallow "*/_next/*"`
- **Nach Deploy:** Cache leeren (HETZNER.md) + `BASE_URL=https://devlearn.klarland.net npm run smoke:assets`

## Fach-Config

- Katalog: `lib/content/subject-catalog.ts` (`verfuegbar` \| `bald`)
- Themen/Übungen: `lib/content/subjects.ts` (+ `review_status`)

## Bewusst offen

- Marktplatz-Flag `NEXT_PUBLIC_FEATURE_TUTOR_MARKETPLACE` Default **aus** (Redirect)
- AV-PDF nicht hinterlegt → nur Text „auf Anfrage“, kein Download
- Legal-Pflicht-Env für Prod-Build weiterhin vom Betreiber
- Themen mit `needs_operator_review` in `subjects.ts` fachlich gegenchecken
- Echten OAuth-Abschluss in CI nicht erzwungen (kein Client-ID-Zwang)
- Lighthouse ≥90 auf Staging nach Pagespeed-Fix manuell bestätigen
- Playwright-Browser: auf diesem macOS 13 (darwin 22) schlägt `npx playwright install chromium` mit „does not support chromium on mac13“ fehl — Specs liegen unter `e2e/`; Ausführung auf neuerem macOS/CI oder nach Deploy manuell gegen `out`/Origin

## Env / Betreiber

- `NEXT_PUBLIC_LEGAL_*` (Prod-Build sonst rot mit `REQUIRE_LEGAL=1` / `QESTRA_PRODUCTION_BUILD=1`)
- `NEXT_PUBLIC_SITE_URL`, `BASE_URL` für Asset-Smoke gegen Deploy-Origin
- `NEXT_PUBLIC_FEATURE_TUTOR_MARKETPLACE=1` erst bei echten Profilen
- `NEXT_PUBLIC_LEGAL_AV_CONTRACT_URL` / Pfad wenn PDF liegt
- `NEXT_PUBLIC_SOCIAL_*` optional für Footer
- `google_client_id`, SMTP/`mail_from` wie Auftrag 6

## Prüfen

```bash
cd english-quest
npm test
NEXT_PUBLIC_FORCE_NOINDEX=1 npm run build:hetzner
# gegen Live (nach Upload + Cache-Flush):
BASE_URL=https://devlearn.klarland.net npm run smoke:assets
npx playwright install chromium
npm run test:e2e
```

Wichtig: Asset-Check **gegen die öffentliche Origin** nach jedem Deploy — lokal allein hätte den Befund vom 21.11. nicht erkannt.
