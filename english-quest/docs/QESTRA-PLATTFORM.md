# Qestra — Plattform-Spezifikation (AI-Prompt)

> Nutze dieses Dokument als System-/Produkt-Prompt. Markenname: **Qestra** (fest).
> Text zwischen `**…**` in Plan-Notizen = zweitrangig; explizite User-Anweisungen haben Vorrang.

---

## 1. Vision & Zielsetzung

Qestra ist eine **fachübergreifende, spielerische Lernumgebung**. Lernen soll sich wie ein persönliches Game anfühlen — unabhängig vom Fach.

**Zentrale Werte (nicht verhandelbar):**
- Freiwilligkeit statt Zwang
- Motivation statt Druck (Quests, Fortschritt, Belohnung — kein Notendruck als Primärantrieb)
- Individualisierung pro Fach (Learning State)
- Lehrerkontrolle bei offiziellen Lessons bleibt erhalten
- Kein Lernzwang, keine Bestrafung für Inaktivität, kein Fortschrittsverlust

Englisch ist Phase-1-Referenzfach. Architektur von Anfang an fachneutral.

---

## 2. Fachstruktur

| Fach | Status | Exactness |
|------|--------|-----------|
| Englisch | active (Phase 1) | tolerant |
| Mathematik | planned | strict |
| Naturwissenschaften | planned | strict |
| Geschichte | planned | strict |
| Weitere Sprachen | planned | tolerant |

Neues Fach = neue Inhalts-Taxonomie + Prompt-Bibliothek, **nicht** neue Kernarchitektur.

---

## 3. Nutzerrollen

**Schüler:** Account, Fortschritt pro Fach, freie Quests außerhalb Lessons, tägliches Credit-Kontingent (~200).

**Lehrer:** Lessons, Zuweisung, Einsicht Fortschritt, unlimitierte KI, Teacher-AI Autonomie vs. Freigabe konfigurierbar.

**Admin/Betreiber:** Fächer, Templates, Kontingente, Multi-Tenant (Schulen) — geplant.

---

## 4. KI-Architektur — **eine KI** (entschieden)

Produktentscheidung: Es gibt **nur eine sichtbare/nutzbare KI** („Qestra KI“, Provider z. B. Mistral).

Frühere Plan-Rollen (Main / AI1 / AI2 / AI3 / Game-Builder / Teacher) sind **keine separaten AIs**, sondern höchstens interne Prompt-Modi derselben einen KI:
- `chat` — Konversation
- `recommend` — nächste Aktivität
- `content` — auszuliefernder Lerninhalt (strengere Anweisungen bei Mathe/NaWi)
- `game_fill` — fachneutrales Template + Fachinhalt
- `teacher` — Lehrer-Kontext; Freigabe-Policy gilt

Lehrer-Einstellung: KI darf außerhalb Live antworten **oder** immer Freigabe brauchen.

**Grundregel:** Eine API, ein Assistent in der UI. Keine Multi-AI-Pipeline im Produkt.

---

## 5. Learning State (pro Schüler, pro Fach)

Pro Fach: Fortschritt, Fehler/Muster, Stärken/Schwächen, Lernhistorie, Skill-Achsen des Fachs.

Main AI darf Fächer vergleichen („stetig in Englisch, schubweise in Mathe“).

Datenschutz: minderjährige Nutzer, DSGVO, Zugriff nur Schüler / zuständige Lehrer / ggf. Erziehungsberechtigte.

---

## 6. Monetarisierung & Technik

- Start: günstige/kostenlose API-Tiers (aktuell Mistral; Konzept nennt auch Gemini Flash)
- Schüler: ~200 Credits/Tag, kein Carry-over
- Lehrer: unlimitiert
- Dev: lokal; Prod: Hetzner (PHP-API + Static Export); Video: Daily.co (`qestra.daily.co`)

---

## 7. Branding (entschieden)

- Produktname: **Qestra**
- „Quest“ = generischer Begriff für Lerneinheiten aller Fächer
- Daily Room-Prefix: `qestra`
- Nicht mehr „English Quest“ als Marke

---

## 8. Implementierungsreihenfolge (für Agenten)

1. Rebrand UI/Docs/Config → Qestra
2. Subject-Registry + Default Englisch
3. Learning State um `subjectId` + fachspezifische Skills erweitern
4. Orchestrator: Main-Router, Pipeline-Rollen, Game-Builder, Teacher-AI-Policy
5. Credits-Modell (Schüler) in State/UI
6. Weitere Fächer als Inhalte/Prompts, nicht als Fork

---

## 9. Explizit außerhalb dieses Produkts

Andere Projekte (z. B. Party-/Multi-Screen-Games im Jackbox-Stil) sind **nicht** Teil von Qestra und gehören nicht in diese Codebase.
