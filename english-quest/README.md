# Qestra

Fachübergreifende Lernplattform (Start: Englisch).  
Registrierung · Google-Login · Mistral KI · Daily.co · Hetzner PHP.

Produkt-Spezifikation: [docs/QESTRA-PLATTFORM.md](./docs/QESTRA-PLATTFORM.md)  
Deploy: [HETZNER.md](./HETZNER.md)

## Local

```bash
npm install
npm run dev
```

http://localhost:3000 → **Registrieren** oder **Anmelden**  
(E-Mail lokal ohne PHP; Google braucht `google_client_id` + Upload/PHP.)

## Hetzner

```bash
npm run build:hetzner
```

`FTP-push/` hochladen. In `api/config.php`:

- `mistral_api_key`
- `daily_api_key`
- `google_client_id` (Google Cloud → OAuth Web-Client)
