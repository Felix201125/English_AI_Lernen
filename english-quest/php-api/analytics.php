<?php
header('Content-Type: application/json; charset=utf-8');
$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : ['allowed_origins' => '*'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = $config['allowed_origins'] ?? '*';
if ($allowed === '*' || stripos((string)$allowed, (string)$origin) !== false) {
    header('Access-Control-Allow-Origin: ' . ($allowed === '*' ? '*' : $origin));
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$file = __DIR__ . '/data/funnel_events.json';
if (!is_dir(__DIR__ . '/data')) mkdir(__DIR__ . '/data', 0755, true);

$allowedEvents = [
    'landing_view','probe_start','probe_quest_complete',
    'register_start','register_complete','first_lesson_next_day'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
    $event = (string)($input['event'] ?? '');
    if (!in_array($event, $allowedEvents, true)) {
        http_response_code(400);
        echo json_encode(['ok'=>false,'error'=>'Unbekanntes Event']);
        exit;
    }
    $all = is_file($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
    $all[] = [
        'event' => $event,
        'at' => date('c'),
        'day' => date('Y-m-d'),
        'source' => substr((string)($input['source'] ?? ''), 0, 64),
        'utm' => is_array($input['utm'] ?? null) ? $input['utm'] : new stdClass(),
        'abVariant' => in_array(($input['abVariant'] ?? ''), ['A','B'], true) ? $input['abVariant'] : null,
    ];
    // Cap file size roughly
    if (count($all) > 20000) {
        $all = array_slice($all, -15000);
    }
    file_put_contents($file, json_encode($all, JSON_UNESCAPED_UNICODE), LOCK_EX);
    echo json_encode(['ok'=>true]);
    exit;
}

// Admin dashboard aggregate
$adminKey = (string)($config['analytics_admin_key'] ?? '');
$provided = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_GET['key'] ?? '');
if ($adminKey === '' || !hash_equals($adminKey, (string)$provided)) {
    http_response_code(403);
    echo json_encode(['ok'=>false,'error'=>'Forbidden']);
    exit;
}
$all = is_file($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
$byDay = [];
$byEvent = [];
$byAb = ['A'=>0,'B'=>0];
foreach ($all as $row) {
    $d = $row['day'] ?? substr($row['at'] ?? '', 0, 10);
    $e = $row['event'] ?? '';
    $byDay[$d][$e] = ($byDay[$d][$e] ?? 0) + 1;
    $byEvent[$e] = ($byEvent[$e] ?? 0) + 1;
    if (($row['abVariant'] ?? '') === 'A' || ($row['abVariant'] ?? '') === 'B') {
        $byAb[$row['abVariant']]++;
    }
}
echo json_encode(['ok'=>true,'byDay'=>$byDay,'byEvent'=>$byEvent,'ab'=>$byAb], JSON_UNESCAPED_UNICODE);
