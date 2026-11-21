<?php
header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : ['allowed_origins' => '*'];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = $config['allowed_origins'] ?? '*';
if ($allowed === '*' || stripos((string)$allowed, (string)$origin) !== false) {
    header('Access-Control-Allow-Origin: ' . ($allowed === '*' ? '*' : $origin));
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
$rateFile = $dataDir . '/pilot_rate.json';
$inboxFile = $dataDir . '/pilot_inbox.json';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
if (!empty($input['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name = trim((string)($input['name'] ?? ''));
$school = trim((string)($input['school'] ?? ''));
$email = strtolower(trim((string)($input['email'] ?? '')));
$message = trim((string)($input['message'] ?? ''));

if ($name === '' || $school === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Bitte alle Felder gültig ausfüllen.']);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$day = date('Y-m-d');
$rates = is_file($rateFile) ? (json_decode((string)file_get_contents($rateFile), true) ?: []) : [];
$rkey = $ip . ':' . $day;
if ((int)($rates[$rkey] ?? 0) >= 5) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Zu viele Anfragen heute.']);
    exit;
}
$rates[$rkey] = (int)($rates[$rkey] ?? 0) + 1;
file_put_contents($rateFile, json_encode($rates, JSON_PRETTY_PRINT), LOCK_EX);

$inbox = is_file($inboxFile) ? (json_decode((string)file_get_contents($inboxFile), true) ?: []) : [];
$inbox[] = [
    'name' => $name,
    'school' => $school,
    'email' => $email,
    'message' => mb_substr($message, 0, 2000),
    'at' => date('c'),
];
file_put_contents($inboxFile, json_encode($inbox, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

// Bestätigung / interne Mail nur wenn SMTP konfiguriert — sonst Inbox-Datei
$contact = (string)($config['contact_email'] ?? $config['mail_from'] ?? '');
if ($contact !== '' && function_exists('mail')) {
    @mail(
        $contact,
        'Qestra Pilotschule',
        "Name: {$name}\nSchule: {$school}\nE-Mail: {$email}\n\n{$message}",
        'From: ' . ($config['mail_from'] ?? $contact)
    );
    @mail(
        $email,
        'Ihre Anfrage bei Qestra',
        "Guten Tag {$name},\n\nwir haben Ihre Anfrage als Pilotschule erhalten und melden uns.\n\nQestra",
        'From: ' . ($config['mail_from'] ?? $contact)
    );
}

echo json_encode(['ok' => true]);
