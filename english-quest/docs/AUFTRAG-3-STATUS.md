# Auftrag 3 — Status (39 Punkte)

Branch: `feature/teacher-student-polish`

## Betreiber muss eintragen

| Wert | Wo |
| --- | --- |
| `mistral_api_key` | Server `api/config.php` (nicht im Lehrer-UI) |
| `daily_api_key` | Server `api/config.php` |
| `google_client_id` | Server `api/config.php` |
| Impressum / Datenschutz | Gelb markierte 【Vom Betreiber ausfüllen】-Felder |
| Hosting-Hinweis Datenschutz | Datenschutz §4 |

**Seed-Lehrkräfte (Dev):** `lena@qestra.seed` / `jonas@qestra.seed` / `sara@qestra.seed` — Passwort `qestra-seed`

## Tabelle

| # | Punkt | Status | Begründung |
| --- | --- | --- | --- |
| A1.1 | Daily Live ohne Key-Leak | erledigt | Neutrale Meldung, Log in `daily-errors.log`, Tokens Owner/Teilnehmer |
| A1.2 | Stunden persistieren | erledigt | `teacher.php` + localStorage, Entwürfe öffnen/duplizieren/löschen |
| A1.3 | Lesson Generator Inhalt | erledigt | Echtes Ziel/Begründung/aufklappbare Aktivitäten, exakte Minuten |
| A1.4 | Leichter/Schwerer | erledigt | KI-Neuzeugung mit Vorschau Übernehmen/Verwerfen, Undo, Neu-Nummerierung |
| A1.5 | Protokoll Invalid Date | erledigt | ISO-Timestamps, DE-Format, Filter, CSV |
| A1.6 | Marktplatz-Buchungen | erledigt | Seed-Login + Profilwahl; Inbox-Tab Buchungen |
| A1.7 | Interne Dev-Texte weg | erledigt | Settings/Marktplatz/Freigaben bereinigt |
| A2.1 | Freigaben DE + Speichern | erledigt | Labels/Hilfe, Toast, Für alle, Persistenz |
| A2.2 | Posteingang Tabs/Badge | erledigt | Reiter, deutsche Texte, Status ersetzt Buttons |
| A2.3 | Marktplatz-Profil UX | teilweise | Profilwahl/Zeiten/Toast; Foto-Upload & Wochenraster noch vereinfacht |
| A2.4 | Lehrer-Kalender | offen | Route `/teacher/calendar/` noch nicht gebaut |
| A2.5 | Nachbereitung Formular | teilweise | In Marktplatz vorhanden; Klassen-Live-Nachbereitung folgt |
| A2.6 | Arbeitsblätter Inhalt/PDF | offen | Noch nicht in diesem Durchlauf |
| A2.7 | Spiele KI-Vorschau | offen | Noch nicht in diesem Durchlauf |
| A2.8 | Schüler-Liste/Gruppen | offen | Überschrift/Links teilweise; Gruppen/QR offen |
| A2.9 | Schüler-Detail Zeitstrahl | offen | |
| A2.10 | Zustellung Vorschau | offen | |
| A2.11 | Live-Steuerung in Ansicht | teilweise | Daily-Fehler behoben; Mehrschüler folgt |
| A2.12 | Berichte/Export | offen | |
| A2.13 | Einnahmen | offen | Hook nur im Code/Doku, nicht in UI |
| A2.14 | Benachrichtigungs-Center | teilweise | Inbox/Toasts; E-Mail offen |
| A2.15 | Dashboard Plural | erledigt | |
| B1.1 | Score ≤100% | erledigt | Scoring-Modul + Migration Clamp |
| B1.2 | Startseite Skeleton | erledigt | `persistReady` |
| B2.1 | Onboarding-Route | erledigt | `/student/onboarding/` |
| B2.2 | Buchungs-Zusammenfassung | erledigt | Verbindlich anfragen |
| B2.3 | Lehrkraft Anzeigename | erledigt | Lena M. + Link |
| B2.4 | Anfragen-Zähler einheitlich | teilweise | Gleiche `messages`-Quelle; Badge-Feinschliff folgt |
| B2.5 | Sprachreste | erledigt | „Noch nichts da.“ / Feedback ohne Zusatz |
| B2.6 | Legal Struktur | erledigt | Markierte Felder, kein example.com |
| B3.1 | Speaking-Skill | teilweise | Speaking-Typ mappt; Gewichtung Aufnahme folgt |
| B3.2 | Stärken ableiten | erledigt | progress-engine deriveStrengths |
| B3.3 | Weiterlernen Fertig | offen | |
| B3.4 | Freigegebene Zählung | offen | |
| B3.5 | Bewertungen Seed konsistent | teilweise | Seed-Lehrer haben Rating; Profil lädt Reviews-API |
| B3.6 | Alter aus Geburtsjahr | offen | |
| C.1 | Sofort-Sync | teilweise | Polling Daily/Bookings; kein WebSocket |
| C.2 | Rollen serverseitig | teilweise | Getrennte APIs; Auth-Token-Checks ausbaufähig |
| C.3 | Einheitliche Notifications | teilweise | Inbox vereinheitlicht; DB-Tabelle folgt |

## Tests

- Unit: Scoring, Duration, Availability, Ranking, Credits, Progress — `npm test`
- E2E: noch nicht im Repo (Playwright fehlt) — manuell laut Abnahme
