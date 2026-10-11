<?php
/**
 * Qestra AI Proxy — nur Mistral.
 * Key nur in config.php.
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'config.php fehlt. Kopiere config.example.php nach config.php und trage deinen Mistral-Key ein.',
    ]);
    exit;
}

$config = require $configFile;
eq_cors($config);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '{}', true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$action = $input['action'] ?? 'teacher_recommend';
$question = trim((string)($input['question'] ?? $input['text'] ?? ''));
$student = $input['student'] ?? [];

$name = $student['name'] ?? 'Student';
$level = $student['level'] ?? 'A2';
$focus = is_array($student['focus'] ?? null) ? implode(', ', $student['focus']) : (string)($student['focus'] ?? '');
$interests = is_array($student['interests'] ?? null) ? implode(', ', $student['interests']) : '';
$weaknesses = is_array($student['weaknesses'] ?? null) ? implode(', ', $student['weaknesses']) : '';

$system = "You are Qestra KI — the single AI assistant for the Qestra multi-subject learning platform (default subject: English). "
    . "Reply concise and actionable in German. Never claim to release activities — the teacher decides. "
    . "Do not invent evidence. Principles: no pressure, no punishment for inactivity, no progress loss. "
    . "There are no other AIs; you handle chat, recommendations, and content hints in one role.";

$userPrompt = "Action: {$action}\n"
    . "Student: {$name}, CEFR {$level}\n"
    . "Focus: {$focus}\n"
    . "Interests: {$interests}\n"
    . "Weaknesses: {$weaknesses}\n"
    . "Teacher question: " . ($question !== '' ? $question : 'Was sollte als Nächstes geübt werden?');

try {
    $text = eq_mistral($config, $system, $userPrompt);
    echo json_encode(['ok' => true, 'text' => $text], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

function eq_cors(array $config): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    $allowed = $config['allowed_origins'] ?? '*';
    if ($allowed === '*' || stripos((string)$allowed, (string)$origin) !== false) {
        header('Access-Control-Allow-Origin: ' . ($allowed === '*' ? '*' : $origin));
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

function eq_mistral(array $config, string $system, string $user): string
{
    $key = (string)($config['mistral_api_key'] ?? '');
    $model = (string)($config['mistral_model'] ?? 'mistral-small-latest');

    if ($key === '' || str_contains($key, 'HIER_DEINEN')) {
        throw new RuntimeException('Mistral API-Key fehlt oder ist noch der Platzhalter in config.php');
    }

    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ],
        'temperature' => 0.4,
    ];

    $res = eq_http_json(
        'https://api.mistral.ai/v1/chat/completions',
        $payload,
        [
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
        ]
    );

    $text = $res['choices'][0]['message']['content'] ?? null;
    if (!$text) {
        throw new RuntimeException('Keine Antwort von Mistral');
    }
    return trim($text);
}

function eq_http_json(string $url, array $payload, array $headers): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 60,
    ]);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        throw new RuntimeException('Netzwerkfehler zur API (cURL ' . $errno . ')');
    }
    $decoded = json_decode($body ?: '{}', true);
    if ($status >= 400) {
        $msg = is_array($decoded) ? json_encode($decoded) : (string)$body;
        throw new RuntimeException('API Fehler HTTP ' . $status . ': ' . $msg);
    }
    if (!is_array($decoded)) {
        throw new RuntimeException('Ungültige API-Antwort');
    }
    return $decoded;
}
