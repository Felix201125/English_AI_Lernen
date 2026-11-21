# FTP-Push Staging

Inhalt = aktueller Full-Deploy aus `dist-hetzner/` (Auftrag 6 Wachstum A–H).

## Aktueller Stand

- Full Static Export inkl. `/ausprobieren/`, Marketing, Fächer, Galerie, Ratgeber, `/start/beispiel-mathe-fussball/`
- PHP: `guest.php`, `guest_worksheet.php`, `pilot_school.php`, `invites.php`, `newsletter.php`, `analytics.php` (+ auth/ai/daily/student)
- `robots.txt` noindex (Staging); Legal-Env für Prod separat setzen
- **Nicht** `api/config.php` mit Secrets überschreiben — Keys nur auf dem Server

## Upload

Inhalt von `FTP-push/` → Document Root (gleiche relative Pfade). Bestehende `api/config.php` behalten.
