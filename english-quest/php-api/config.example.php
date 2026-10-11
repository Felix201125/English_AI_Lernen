<?php
/**
 * Qestra — Konfiguration für Hetzner Webhosting
 *
 * 1. Diese Datei kopieren nach: config.php
 * 2. Keys eintragen (Mistral + Daily.co)
 * 3. config.php NICHT öffentlich teilen / nicht ins Git committen
 */

return [
    // --- KI: nur Mistral ---
    // https://console.mistral.ai/api-keys
    'mistral_api_key' => 'HIER_DEINEN_MISTRAL_KEY_EINTRAGEN',
    'mistral_model' => 'mistral-small-latest',

    // --- Video: Daily.co ---
    // https://dashboard.daily.co/developers
    'daily_api_key' => 'HIER_DEINEN_DAILY_KEY_EINTRAGEN',
    // Optional: Room-Namen-Präfix, z.B. "qestra" → qestra-alex-…
    'daily_room_prefix' => 'qestra',

    // --- Auth: Google Sign-In ---
    // https://console.cloud.google.com/apis/credentials
    // OAuth-Client-Typ: Webanwendung
    // Autorisierte JavaScript-Ursprünge: https://deine-domain.de
    'google_client_id' => 'HIER_DEINE_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

    // Optional: Komma-getrennte erlaubte Domains (CORS)
    'allowed_origins' => '*',
];
