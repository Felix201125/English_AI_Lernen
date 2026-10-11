<?php
/**
 * Qestra — Schüler-Lernstand (XP, Log, Interests, Credits)
 * Datei pro Schüler: data/students/{studentId}.json
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : ['allowed_origins' => '*'];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = $config['allowed_origins'] ?? '*';
if ($allowed === '*' || stripos((string)$allowed, (string)$origin) !== false) {
    header('Access-Control-Allow-Origin: ' . ($allowed === '*' ? '*' : $origin));
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = __DIR__ . '/data/students';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
        if ($studentId === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'studentId fehlt']);
            exit;
        }
        $file = $dataDir . '/' . $studentId . '.json';
        if (!is_file($file)) {
            echo json_encode(['ok' => true, 'bundle' => null]);
            exit;
        }
        $raw = file_get_contents($file);
        $bundle = json_decode($raw ?: 'null', true);
        echo json_encode(['ok' => true, 'bundle' => $bundle], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'GET or POST']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($input)) {
        $input = [];
    }
    $action = (string)($input['action'] ?? 'save');
    if ($action !== 'save') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Unbekannte action']);
        exit;
    }

    $bundle = $input['bundle'] ?? null;
    if (!is_array($bundle)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'bundle fehlt']);
        exit;
    }
    $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($bundle['studentId'] ?? ''));
    if ($studentId === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'studentId ungültig']);
        exit;
    }

    $file = $dataDir . '/' . $studentId . '.json';
    file_put_contents(
        $file,
        json_encode($bundle, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
