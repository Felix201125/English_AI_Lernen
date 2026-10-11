# FTP-Push

## Aktueller Stand — Auftrag 2 (Fächer / Lehrkräfte / Stunden)

Hochladen ins Document Root (`public_html/`):

- `_next/` — neue Bundles
- `student/` — inkl. `teachers/`, `lessons/`, aktualisierte Fachauswahl/Onboarding
- `teacher/` — inkl. `marketplace/`
- `api/marketplace.php` — Lehrkräfte, Buchungen, Chat, iCal (+ Seed beim ersten Aufruf)
- `api/.htaccess`, `api/data/.htaccess`, `api/config.example.php`

Nicht hochladen: `api/config.php` mit Keys (bleibt auf dem Server).

Nach Upload prüfen:

1. Schüler → Start-Ansicht (neues Konto) / Fachauswahl
2. `/student/teachers/` — Seed-Lehrkräfte
3. Buchung → `/student/lessons/`
4. Lehrer → `/teacher/marketplace/`
5. Status: `docs/AUFTRAG-2-STATUS.md`
