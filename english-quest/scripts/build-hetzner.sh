#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Staging/Dev-Builds: immer noindex, sofern nicht explizit Produktion
export NEXT_PUBLIC_FORCE_NOINDEX="${NEXT_PUBLIC_FORCE_NOINDEX:-1}"
if [[ "${QESTRA_PRODUCTION_BUILD:-}" == "1" ]]; then
  export NEXT_PUBLIC_FORCE_NOINDEX=0
  export REQUIRE_LEGAL=1
fi

echo "→ robots.txt + Legal-Check…"
node "$ROOT/scripts/write-robots.mjs"
node "$ROOT/scripts/check-legal.mjs"

echo "→ Building static export…"
rm -rf "$ROOT/.next" "$ROOT/out"
npm run build

echo "→ Smoke + Text-Check…"
node "$ROOT/scripts/smoke-public.mjs" "$ROOT/out"

DIST="$ROOT/dist-hetzner"
rm -rf "$DIST"
mkdir -p "$DIST"

echo "→ Copying static site…"
cp -R "$ROOT/out/." "$DIST/"

echo "→ Copying PHP API (Auth + Mistral + Daily.co)…"
mkdir -p "$DIST/api/data"
cp "$ROOT/php-api/ai.php" "$DIST/api/"
cp "$ROOT/php-api/daily.php" "$DIST/api/"
cp "$ROOT/php-api/auth.php" "$DIST/api/"
cp "$ROOT/php-api/student.php" "$DIST/api/"
cp "$ROOT/php-api/guest.php" "$DIST/api/"
cp "$ROOT/php-api/guest_worksheet.php" "$DIST/api/"
cp "$ROOT/php-api/pilot_school.php" "$DIST/api/"
cp "$ROOT/php-api/invites.php" "$DIST/api/"
cp "$ROOT/php-api/newsletter.php" "$DIST/api/"
cp "$ROOT/php-api/analytics.php" "$DIST/api/"
cp "$ROOT/php-api/config.example.php" "$DIST/api/"
cp "$ROOT/php-api/.htaccess" "$DIST/api/"
cp "$ROOT/php-api/data/.htaccess" "$DIST/api/data/"
cp "$ROOT/php-api/data/.gitignore" "$DIST/api/data/" 2>/dev/null || true
mkdir -p "$DIST/api/data/students"
printf '%s\n' 'Require all denied' > "$DIST/api/data/students/.htaccess"

if [[ ! -f "$DIST/api/config.php" ]]; then
  cp "$ROOT/php-api/config.example.php" "$DIST/api/config.php"
fi
# data/ must be writable by PHP for meeting state + users/sessions
chmod 755 "$DIST/api/data" || true

# Static export: echte 404 statt Soft-SPA auf Startseite
# WICHTIG: mod_pagespeed darf /_next/static nicht umschreiben (404 *.pagespeed.ce.*)
cat > "$DIST/.htaccess" <<'EOF'
Options -MultiViews
RewriteEngine On
ErrorDocument 404 /404.html

# Next.js liefert fingerprintierte Assets unter /_next/ — Pagespeed darauf = 404
<IfModule pagespeed_module>
  ModPagespeed off
  # Fallback, falls Off in der VHost-Policy überschrieben wird:
  ModPagespeedDisallow "*/_next/*"
</IfModule>

# Keep PHP API reachable
RewriteRule ^api/ - [L]

# Gast-Probe-Aliase
RewriteRule ^demo/?$ /ausprobieren/ [R=301,L]
RewriteRule ^probe/?$ /ausprobieren/ [R=301,L]

# Alte Public-Routen (Auftrag 7)
RewriteRule ^pricing/?$ /preise/ [R=301,L]
RewriteRule ^tutors/?$ /lehrkraefte/ [R=301,L]
RewriteRule ^tutoren/?$ /lehrkraefte/ [R=301,L]
RewriteRule ^discover/?$ /#so-funktionierts [R=301,NE,L]

# Serve existing files/directories
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Next static export with trailingSlash often has folder/index.html
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.*)$ $1/index.html [L]

RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Unbekannte Pfade → echte 404
RewriteRule ^ - [R=404,L]
EOF

echo "→ Asset-Smoke (lokal dist)…"
node "$ROOT/scripts/smoke-assets.mjs" "$DIST"
echo "→ Link-Checker…"
node "$ROOT/scripts/check-links.mjs" "$DIST"

echo ""
echo "✅ Fertig: $DIST"
echo "1) Ordner-Inhalt per FTP/SFTP auf Hetzner Webhosting hochladen (Document Root)"
echo "2) api/config.php → mistral_api_key + daily_api_key eintragen (nicht überschreiben)"
echo "3) Nach Deploy: Pagespeed-Cache leeren (siehe HETZNER.md) + BASE_URL=… npm run smoke:assets"
echo "4) google_client_id nur wenn Google-Login gewünscht"
