# FTP-Push

## Aktueller Stand — Schülerbereich-Audit

Full Deploy inkl.:

- Persistenz `api/student.php` (XP, Log, Interests, Credits)
- `/impressum`, `/datenschutz`, `robots.txt`, echte `404.html`
- Onboarding, Games-Katalog, Activity-Fixes
- Google-Login Timeout/Hinweise

Nach Upload:

1. `api/config.php` Keys (Mistral, Daily, **google_client_id**)
2. Google Cloud Origins: `https://devlearn.klarland.net`
3. Statusliste: `docs/STUDENT-AREA-AUDIT-STATUS.md`
