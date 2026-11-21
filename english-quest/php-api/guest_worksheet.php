<?php
/**
 * Gast-Arbeitsblatt-Vorschau — Limit pro IP/Tag, PDF erst nach Auth (separater Download).
 */
header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : ['allowed_origins' => '*'];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = $config['allowed_origins'] ?? '*';
if ($allowed === '*' || stripos((string)$allowed, (string)$origin) !== false) {
    header('Access-Control-Allow-Origin: ' . ($allowed === '*' ? '*' : $origin));
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

$dataDir = __DIR__ . '/data';
$rateFile = $dataDir . '/worksheet_guest_rate.json';
$previewFile = $dataDir . '/worksheet_previews.json';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$salt = (string)($config['guest_ip_salt'] ?? 'qestra-ws');
$input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$action = (string)($input['action'] ?? 'preview');

try {
    if ($action === 'preview') {
        $ipHash = hash('sha256', $salt . '|' . eq_ws_ip());
        $day = date('Y-m-d');
        $rates = eq_ws_read($rateFile);
        $key = $ipHash . ':' . $day;
        $count = (int)($rates[$key] ?? 0);
        $max = (int)($config['guest_worksheet_per_day'] ?? 2);
        if ($count >= $max) {
            http_response_code(429);
            echo json_encode([
                'ok' => false,
                'error' => 'Tageslimit für Gast-Vorschauen erreicht. Bitte registrieren oder morgen erneut.',
            ]);
            exit;
        }

        $subject = trim((string)($input['subject'] ?? 'Mathematik'));
        $grade = trim((string)($input['grade'] ?? '6'));
        $topic = trim((string)($input['topic'] ?? 'Üben'));
        if ($topic === '' || mb_strlen($topic) > 120) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Thema ungültig.']);
            exit;
        }

        $html = eq_ws_build_html($config, $subject, $grade, $topic);
        $token = bin2hex(random_bytes(16));
        $previews = eq_ws_read($previewFile);
        $previews[$token] = [
            'html' => $html,
            'subject' => $subject,
            'grade' => $grade,
            'topic' => $topic,
            'created_at' => date('c'),
            'ip_hash' => $ipHash,
        ];
        eq_ws_write($previewFile, $previews);
        $rates[$key] = $count + 1;
        eq_ws_write($rateFile, $rates);

        echo json_encode([
            'ok' => true,
            'html' => $html,
            'token' => $token,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'download') {
        // PDF nur mit Auth — hier absichtlich ablehnen ohne Session
        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/Bearer\s+(\S+)/i', $auth, $m)) {
            http_response_code(401);
            echo json_encode([
                'ok' => false,
                'error' => 'PDF-Download nur nach Anmeldung.',
            ]);
            exit;
        }
        $token = (string)($input['token'] ?? '');
        $previews = eq_ws_read($previewFile);
        if ($token === '' || empty($previews[$token])) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Vorschau nicht gefunden.']);
            exit;
        }
        // Einfache HTML-Antwort als Download-Inhalt (PDF-Pipeline optional später)
        echo json_encode([
            'ok' => true,
            'html' => $previews[$token]['html'],
            'filename' => 'qestra-arbeitsblatt.html',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unbekannte action']);
} catch (Throwable $e) {
    error_log('worksheet guest: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Vorschau gerade nicht verfügbar.']);
}

function eq_ws_ip(): string
{
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
    return trim(explode(',', (string)$ip)[0]);
}

function eq_ws_read(string $file): array
{
    if (!is_file($file)) {
        return [];
    }
    $d = json_decode((string)file_get_contents($file), true);
    return is_array($d) ? $d : [];
}

function eq_ws_write(string $file, array $data): void
{
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function eq_ws_build_html(array $config, string $subject, string $grade, string $topic): string
{
    $key = (string)($config['mistral_api_key'] ?? '');
    $body = '';
    if ($key !== '' && !str_contains($key, 'HIER_DEINEN')) {
        try {
            $body = eq_ws_mistral($config, $subject, $grade, $topic);
        } catch (Throwable $e) {
            $body = '';
        }
    }
    if ($body === '') {
        $body = "<ol><li>Erkläre kurz: {$topic}.</li><li>Löse zwei Aufgaben zum Thema.</li><li>Formuliere eine eigene Beispielaufgabe.</li></ol>";
    }
    return "<h1>" . htmlspecialchars($topic) . " — Klasse " . htmlspecialchars($grade) . "</h1>"
        . "<p>Fach: " . htmlspecialchars($subject) . "</p>"
        . $body
        . "<p><em>Erstellt mit Qestra</em></p>";
}

function eq_ws_mistral(array $config, string $subject, string $grade, string $topic): string
{
    $model = (string)($config['mistral_model'] ?? 'mistral-small-latest');
    $system = 'Du erstellst kurze Arbeitsblatt-Inhalte auf Deutsch als HTML (nur ol/li/p). Keine personenbezogenen Daten.';
    $user = "Fach {$subject}, Klasse {$grade}, Thema {$topic}. 4 kurze Aufgaben.";
    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ],
        'temperature' => 0.3,
        'max_tokens' => 400,
    ];
    $ch = curl_init('https://api.mistral.ai/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $config['mistral_api_key'],
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 25,
    ]);
    $raw = curl_exec($ch);
    curl_close($ch);
    $data = json_decode((string)$raw, true);
    $text = trim((string)($data['choices'][0]['message']['content'] ?? ''));
    if ($text === '') {
        throw new RuntimeException('empty');
    }
    return $text;
}
