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
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$file = __DIR__ . '/data/newsletter.json';
if (!is_dir(__DIR__ . '/data')) mkdir(__DIR__ . '/data', 0755, true);
$input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$action = (string)($input['action'] ?? 'subscribe');

function nl_read($f) {
    if (!is_file($f)) return [];
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d : [];
}

if ($action === 'subscribe') {
    if (!empty($input['website'])) { echo json_encode(['ok'=>true]); exit; }
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $list = (string)($input['list'] ?? 'news');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['ok'=>false,'error'=>'E-Mail ungültig']);
        exit;
    }
    if ($list === 'teacher_pack' && empty($config['teacher_worksheet_pack_path'])) {
        // Paket fehlt — trotzdem News erlauben, Pack ablehnen
        http_response_code(400);
        echo json_encode(['ok'=>false,'error'=>'Arbeitsblatt-Paket ist noch nicht hinterlegt.']);
        exit;
    }
    $token = bin2hex(random_bytes(16));
    $all = nl_read($file);
    $all[] = [
        'email' => $email,
        'list' => $list === 'teacher_pack' ? 'teacher_pack' : 'news',
        'confirmed' => false,
        'confirmToken' => $token,
        'at' => date('c'),
    ];
    file_put_contents($file, json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    $from = (string)($config['mail_from'] ?? '');
    if ($from && function_exists('mail')) {
        $link = ($config['public_origin'] ?? '') . '/newsletter/confirm/?t=' . urlencode($token);
        @mail($email, 'Bitte bestätigen — Qestra', "Bitte bestätigen Sie die Anmeldung:\n{$link}\n\nAbmelden: auf Anfrage.", 'From: ' . $from);
    }
    echo json_encode(['ok'=>true,'message'=>'Falls die Adresse gültig ist, senden wir eine Bestätigung.']);
    exit;
}

if ($action === 'confirm') {
    $token = (string)($input['token'] ?? '');
    $all = nl_read($file);
    $found = false;
    foreach ($all as &$s) {
        if (($s['confirmToken'] ?? '') === $token) {
            $s['confirmed'] = true;
            unset($s['confirmToken']);
            $found = true;
        }
    }
    file_put_contents($file, json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    echo json_encode(['ok'=>true,'confirmed'=>$found]);
    exit;
}

http_response_code(400);
echo json_encode(['ok'=>false,'error'=>'action']);
