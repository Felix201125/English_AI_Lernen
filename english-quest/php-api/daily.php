<?php
/**
 * Daily.co room API for Qestra.
 * Creates rooms and stores the active meeting so students can join from another device.
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'config.php fehlt. Kopiere config.example.php und trage daily_api_key ein.',
    ]);
    exit;
}

$config = require $configFile;

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = $config['allowed_origins'] ?? '*';
if ($allowed === '*' || stripos((string)$allowed, (string)$origin) !== false) {
    header('Access-Control-Allow-Origin: ' . ($allowed === '*' ? '*' : $origin));
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = __DIR__ . '/data';
$stateFile = $dataDir . '/current-meeting.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
    $state = eq_read_state($stateFile);
    if (
        $state &&
        (!empty($state['url'])) &&
        ($studentId === '' || ($state['studentId'] ?? '') === $studentId)
    ) {
        echo json_encode(['ok' => true, 'room' => $state], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['ok' => true, 'room' => null]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'GET or POST required']);
    exit;
}

$key = (string)($config['daily_api_key'] ?? '');
$input = json_decode(file_get_contents('php://input') ?: '{}', true);
if (!is_array($input)) {
    $input = [];
}

$action = $input['action'] ?? 'create';
$studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['studentId'] ?? 'student'));
$prefix = preg_replace('/[^a-z0-9\-]/i', '', (string)($config['daily_room_prefix'] ?? 'eq'));

try {
    if ($action === 'end') {
        if (is_file($stateFile)) {
            @unlink($stateFile);
        }
        echo json_encode(['ok' => true, 'room' => null]);
        exit;
    }

    if ($action === 'status') {
        $state = eq_read_state($stateFile);
        echo json_encode(['ok' => true, 'room' => $state], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'create') {
        if ($key === '' || str_contains($key, 'HIER_DEINEN')) {
            throw new RuntimeException('Daily API-Key fehlt in api/config.php (daily_api_key).');
        }

        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }

        $name = strtolower($prefix . '-' . $studentId . '-' . substr((string)time(), -6));
        $payload = [
            'name' => $name,
            'privacy' => 'public',
            'properties' => [
                'enable_chat' => true,
                'enable_screenshare' => true,
                'start_video_off' => false,
                'start_audio_off' => false,
                'exp' => time() + 60 * 60 * 4,
            ],
        ];

        $room = daily_request('https://api.daily.co/v1/rooms', $key, $payload);
        $state = [
            'id' => $room['id'] ?? null,
            'name' => $room['name'] ?? $name,
            'url' => $room['url'] ?? null,
            'studentId' => $studentId,
            'updatedAt' => date('c'),
        ];

        if (empty($state['url'])) {
            throw new RuntimeException('Daily hat keine Room-URL zurückgegeben.');
        }

        file_put_contents(
            $stateFile,
            json_encode($state, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
        );

        echo json_encode(['ok' => true, 'room' => $state], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown action']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

function eq_read_state(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }
    $decoded = json_decode((string)file_get_contents($file), true);
    return is_array($decoded) ? $decoded : null;
}

function daily_request(string $url, string $key, array $payload): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 45,
    ]);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        throw new RuntimeException('Daily Netzwerkfehler (cURL ' . $errno . ')');
    }
    $decoded = json_decode($body ?: '{}', true);
    if ($status >= 400 || !is_array($decoded)) {
        $msg = is_array($decoded) ? json_encode($decoded) : (string)$body;
        throw new RuntimeException('Daily API Fehler HTTP ' . $status . ': ' . $msg);
    }
    return $decoded;
}
