# Qestra auf Hetzner Webhosting (PHP)

Hetzner Webhosting L hat **kein Node.js**. Die App wird als **statische Website** gebaut.
KI läuft über **Mistral** (`api/ai.php`), Video über **Daily.co** (`api/daily.php`).

## 1. Keys besorgen

1. **Mistral:** https://console.mistral.ai/api-keys  
2. **Daily.co:** https://dashboard.daily.co/developers → API key

## 2. Lokal bauen

```bash
cd english-quest
npm install
npm run build:hetzner
```

Ergebnis: Ordner `dist-hetzner/`

## 3. Hochladen (FTP/SFTP)

Für **nur geänderte** Dateien: Ordner `FTP-push/` (wird nach Entwicklung befüllt).  
Erster Upload / Full Deploy: Inhalt von `dist-hetzner/` in das Document Root, z. B. `/public_html/`

```
public_html/
  index.html
  student/
  teacher/
  api/
    ai.php
    daily.php
    config.example.php
    config.php          ← Keys hier
    .htaccess
  .htaccess
```

## 4. config.php ausfüllen

`api/config.example.php` → `api/config.php`:

```php
'mistral_api_key' => 'dein-mistral-key',
'mistral_model'   => 'mistral-small-latest',
'daily_api_key'   => 'dein-daily-key',
```

## 5. Registrierung, Google & Konto

Keine Starter-Konten. Nutzer legen ein Konto an unter `/register` (E-Mail oder Google).

Kontoverwaltung (`/student/account` bzw. `/teacher/account`):

- Profil (Name, E-Mail) ändern
- Passwort setzen/ändern
- Überall abmelden
- Konto löschen (E-Mail + `LÖSCHEN`, bei Passwort-Konten zusätzlich Passwort)

### Google Sign-In einrichten

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth-Client-ID (Typ **Webanwendung**)
2. Autorisierte JavaScript-Ursprünge: `https://deine-domain.de` (und lokal ggf. `http://localhost:3000`)
3. In `api/config.php`:

```php
'google_client_id' => 'XXXX.apps.googleusercontent.com',
```

Optional lokal: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`.

## 6. Meeting auf der Website starten

1. Als **Lehrer** registrieren/anmelden → **Live-Stunden**
2. Schüler wählen
3. **Meeting jetzt starten**
4. Daily.co-Video erscheint eingebettet
5. Schüler meldet sich an → **Live** — sieht dasselbe Meeting

Keine Google-Meet-Links nötig.

## 7. KI testen

Lehrer → **KI-Assistent** → Frage stellen.  
Mit gültigem Mistral-Key kommt eine echte Antwort.

## 8. Legal / Preise / Indexierung (Auftrag 6)

Pflicht für **Produktions-Build** (`QESTRA_PRODUCTION_BUILD=1 npm run build:hetzner`):

```bash
NEXT_PUBLIC_LEGAL_OPERATOR_NAME=
NEXT_PUBLIC_LEGAL_STREET=
NEXT_PUBLIC_LEGAL_ZIP_CITY=
NEXT_PUBLIC_LEGAL_EMAIL=
NEXT_PUBLIC_LEGAL_RESPONSIBLE=
NEXT_PUBLIC_SITE_URL=https://deine-produktions-domain.de
NEXT_PUBLIC_FORCE_NOINDEX=0
NEXT_PUBLIC_PRICING_MODE=free_launch   # oder priced | hidden
# optional bei priced:
# NEXT_PUBLIC_PRICE_LESSON_HINT=
# NEXT_PUBLIC_PRICE_CREDITS_HINT=
```

Staging (`devlearn.klarland.net`): `NEXT_PUBLIC_FORCE_NOINDEX=1` (Default in `build:hetzner`) → `robots.txt` Disallow + Meta noindex.

Ohne Google: `google_client_id` leer lassen — der Button erscheint nicht.

## 9. mod_pagespeed und Next.js (Auftrag 7 — P0)

**Problem (verifiziert 21.11.2026):** Apache `mod_pagespeed` schrieb `/_next/static/…` zu `*.pagespeed.ce.*.js` / `*.pagespeed.cf.*.css` um → **404**. Folge: ungestyltes HTML, Login/Register hängen bei „Laden…“, Probe-Kacheln tot. Header damals: `x-mod-pagespeed: 1.14.36.1-0`.

**Fix (im Repo):** Die ausgelieferte Document-Root-`.htaccess` (geschrieben von `npm run build:hetzner`) enthält:

```apache
<IfModule pagespeed_module>
  ModPagespeed off
  ModPagespeedDisallow "*/_next/*"
</IfModule>
```

Next.js fingerprintiert und optimiert `/_next/static` selbst — Pagespeed darauf ist schädlich. VHost-Beispiel: `deploy/apache-qestra.conf.example`.

**Cache leeren nach Config-Änderung und nach jedem relevanten Deploy** (Hetzner Webhosting, üblich):

```bash
# Per SSH, falls vorhanden — Pfad kann je nach Tarif variieren:
# find /var/cache/mod_pagespeed -type f -delete
# oder im Kundenpanel / Server-Dok: „Pagespeed-Cache leeren“
touch ~/public_html/.htaccess   # erzwingt oft Reload der Directory-Config
```

Nach dem Flush in einer **privaten** Browser-Session prüfen: Im HTML von `/` darf **kein** `pagespeed` in Asset-URLs stehen. Alle `/_next/static/…`-Links müssen **200** sein.

**Post-Deploy-Smoke (gegen die öffentliche Origin, nicht nur lokal):**

```bash
BASE_URL=https://devlearn.klarland.net npm run smoke:assets
```

Der Test ist rot, sobald eine Asset-URL `pagespeed` enthält oder ein `/_next/`-Asset nicht 200 liefert.

## Sicherheit

- Keys nur in `api/config.php`
- Nie im Frontend / nie in Git
- `.htaccess` blockiert Download von `config.php`

## Lokal entwickeln (ohne Upload)

```bash
npm run dev
```

→ http://localhost:3000  

Lokal: Mock-KI. Meeting-Start braucht die PHP-API (nach Upload) bzw. einen lokalen PHP-Server mit `api/`.
