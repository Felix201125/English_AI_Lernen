# Schülerbereich-Audit — Status (feature/student-area-complete)

Umgebung: https://devlearn.klarland.net

## 1. Kritisch

| # | Punkt | Status | Hinweis |
|---|--------|--------|---------|
| 1 | XP-Gutschrift idempotent | erledigt | `applyActivityCompletion` + Persistenz local/PHP |
| 2 | Learning Log | erledigt | `activityHistory` nach Abschluss + Progress-UI |
| 3 | Hardcoded Fortschritt | erledigt | Continue/Skills aus Lernstand; Leerzustände |
| 4 | Games-Seite leer | erledigt | Shared A2-Katalog (3+ Spiele) für alle |
| 5 | Interessen speichern | erledigt | Persistenz + Toast |
| 6 | Google-Login hängt | erledigt | Timeout, klare Fehler, Origin-Hinweis |
| 7 | Impressum/Datenschutz | erledigt | `/impressum`, `/datenschutz` + Footer |

## 2. Wichtig

| # | Punkt | Status | Hinweis |
|---|--------|--------|---------|
| 8 | Hint ohne Text | erledigt | Gestufte Hinweise |
| 9 | Doppelte Feedbacktexte | erledigt | Eine Meldung |
| 10 | Sprachaufnahme Mock | erledigt | MediaRecorder + Tippen-Fallback + KI-Feedback |
| 11 | Continue-Karten klickbar | erledigt | Link zur Aktivität |
| 12 | Why? Empfehlung | erledigt | Toggle/ARIA |
| 13 | Bald-Fächer | erledigt | disabled + Block in Provider |
| 14 | Credits inkonsistent | erledigt | Eine Quelle + Persistenz nach Spend |
| 15 | Hilfe anfragen | erledigt | Feedback + Status offen |
| 16 | Ask AI Status | erledigt | Liste unter `/student/ai` |
| 17 | Sidebar Live immer | erledigt | Nur bei echtem Room |
| 18 | Daily Video | teilweise | Beitritt/Leave/Hinweise; tiefer Daily-Debug offen |
| 19 | Onboarding | erledigt | Interessen, Level, Tour |
| 20 | Registrierung Schulen | erledigt | Code, Alter, DSGVO, Passwort-Confirm, Forgot-Link |
| 21 | Datumsformat | erledigt | heute/gestern/dd.mm.yyyy |
| 22 | Profil Altersgruppe | erledigt | Kind/Jugendliche:r deutsch |
| 23 | 404 / robots | erledigt | `not-found`, `robots.txt`, Apache 404 |
| 24 | Labels Voice | erledigt | „Sprachnachricht“ einheitlich |

## 3. Nice-to-have

| # | Punkt | Status | Hinweis |
|---|--------|--------|---------|
| 25 | Motivation Level/Abzeichen | teilweise | XP→Level-Balken; Abzeichen/Wochenziel offen |
| 26 | Abschluss-Zusammenfassung | erledigt | Score/XP/Schritte |
| 27 | Übersetzer-Vokabelliste | offen | Verlauf noch nicht als Liste persistiert |
| 28 | WCAG AA | teilweise | Fokus/ARIA bei Why; Kontrast-Audit offen |
| 29 | Mobile Bottom-Nav | vorhanden | Bottom-Nav schon da; 375px Feinschliff offen |
| 30 | Startseite Preview/FAQ | teilweise | Ablauf-Abschnitt; FAQ/Screenshots offen |

## Tests

- Unit: `npm test` (XP idempotent, Credits)
- E2E: manuell auf Dev nach Upload empfohlen (Playwright noch nicht verdrahtet)

## Deploy

`npm run build:hetzner` → `FTP-push/` · `api/student.php` + `google_client_id` Origin `https://devlearn.klarland.net`
