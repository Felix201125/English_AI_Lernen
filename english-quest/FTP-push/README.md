# FTP-Push Staging

Inhalt = Full-Deploy aus `dist-hetzner/` (**Auftrag 7** Stabilität / Rechtliches / Feinschliff).

## Aktueller Stand

- `.htaccess`: **`ModPagespeed off`** + `ModPagespeedDisallow "*/_next/*"` + Redirects `/pricing/`→`/preise/`, `/tutors|/tutoren/`→`/lehrkraefte/`, `/discover/`→`/#so-funktionierts`
- Landing/Fächer aus `subject-catalog` (kein „Englisch zuerst…“, keine „(folgt)“ für verfügbare Fächer)
- Bald-Seiten: `/faecher/language|naturwissenschaften|geschichte/`
- ≥8 Themen je Mathe/Deutsch/Englisch, Galerie/Ratgeber erweitert
- Legal-Seiten ohne „Angaben folgen“ (Werte aus Env; Staging oft mit `FORCE_NOINDEX`)
- **Nicht** `api/config.php` mit Secrets hochladen/überschreiben — Keys nur auf dem Server

## Upload (wichtig)

1. Inhalt von `FTP-push/` → Document Root (gleiche relative Pfade). Bestehende `api/config.php` **behalten**.
2. **Pagespeed-Cache leeren** (siehe `HETZNER.md` §9) — sonst bleiben alte `*.pagespeed.*`-URLs im HTML.
3. Gegen Live prüfen:
   ```bash
   BASE_URL=https://devlearn.klarland.net npm run smoke:assets
   ```
   Erwartung: kein `pagespeed` in Asset-URLs, alle `/_next/static/` → 200.
