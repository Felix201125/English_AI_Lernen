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
