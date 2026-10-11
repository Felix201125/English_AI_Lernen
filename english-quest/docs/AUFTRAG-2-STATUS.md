# Auftrag 2 — Status

Branch: `feature/subjects-teachers-schedule`

## Erledigt

| Punkt | Status | Hinweis |
| --- | --- | --- |
| Fächer-Modell + Katalog (Kategorien, Status, bookable) | erledigt | `lib/subjects/catalog.ts` |
| Durchsuchbare Fachauswahl | erledigt | `SubjectPicker` / `SubjectSwitcher` |
| Filter Home/Games/Learn/Progress/KI nach Fach | erledigt | Preparing → Hinweis + Buchungs-CTA |
| Fortschritt pro Fach + Gesamt | erledigt | `progressBySubject` im Persist-Bundle |
| Start-Ansicht (6 Schritte, skip, Profil-Daten) | erledigt | `components/student/onboarding.tsx` |
| Lehrkräfte-Suche / Filter / Sortierung | erledigt | `/student/teachers` |
| Lehrkraft-Profil + Kennenlernen + Nachricht | erledigt | `/student/teachers/[id]` |
| Lehrer-Gegenstück (Profil, Zeiten, Anfragen) | erledigt | `/teacher/marketplace` |
| Meine Stunden (Liste/Kalender, Absage, Review) | erledigt | `/student/lessons` |
| iCal-Export | erledigt | `marketplace.php?action=ical` |
| Doppelbuchungs-Schutz + Zeitzonen-Slots | erledigt | PHP + `lib/marketplace/availability.ts` |
| Seed getrennt / gekennzeichnet | erledigt | `_seed` / `seed: true` in JSON |
| DSGVO: keine Tel./Private Kontakte in UI | erledigt | Vorname + Initial, Chat in Plattform |
| PAYMENT HOOK Credits | erledigt | `priceCreditsPerHour` + Kommentar |
| Unit-Tests Verfügbarkeit/Konflikte/TZ | erledigt | `availability.test.ts` |
| i18n Deutsch zentral | erledigt | `lib/i18n/de.ts` |
| DB-Migration mit Rückweg | erledigt* | Datei-JSON unter `data/marketplace/`; Rollback = Dateien löschen / Version zurück |

## Offen / teilweise

| Punkt | Status | Begründung |
| --- | --- | --- |
| Echte Bezahlung / Stundenpakete | offen | Bewusst nicht im Auftrag; Hook vorbereitet |
| E-Mail-/Push-Benachrichtigungen | teilweise | Status-Texte in UI; kein Mailer auf Hetzner angebunden |
| Eltern-Einsicht Chat | teilweise | Datenmodell `reported` + Hinweis; keine eigene Eltern-UI |
| Wiederkehrende Stunden (RRULE) | teilweise | Feld `recurringRule` speicherbar, UI noch manuell |
| Admin-Freigabe UI | teilweise | API `adminApproveTeacher`; keine Admin-Seite |
| E2E-Tests (Playwright) | offen | Vitest Unit vorhanden; E2E-Runner nicht im Repo |
| Screenshots im PR | offen | Nach Deploy manuell ergänzen |
| Live-Klassenstunde auto in Meine Stunden | teilweise | Marketplace-Buchungen ja; Klassen-Live weiter über `/student/live` |
| WCAG AA Audit vollständig | teilweise | Labels/aria an Pickern; kein separates Audit |

## Seed (Dev)

Beim ersten API-Aufruf legt `php-api/marketplace.php` Seed-Lehrkräfte an, falls `data/marketplace/teachers.json` fehlt.
