<?php
/**
 * Daily.co room API for Qestra.
 * Räume pro Stunde/Schüler; technische Fehler nur ins Server-Log,
 * Client erhält neutrale Meldung.
 */

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    error_log('[Qestra Daily] config.php fehlt');
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'error' => 'Video gerade nicht verfügbar, bitte später erneut versuchen.',
        'code' => 'config_missing',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configFile;

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

$dataDir = __DIR__ . '/data';
$meetingsDir = $dataDir . '/meetings';
$stateFile = $dataDir . '/current-meeting.json';
$logFile = $dataDir . '/daily-errors.log';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
if (!is_dir($meetingsDir)) {
    mkdir($meetingsDir, 0755, true);
}

function daily_user_error(): string
{
    return 'Video gerade nicht verfügbar, bitte später erneut versuchen.';
}

function daily_log(string $msg): void
{
    global $logFile;
    $line = '[' . date('c') . '] ' . $msg . "\n";
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
    error_log('[Qestra Daily] ' . $msg);
}

function eq_read_state(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }
    $decoded = json_decode((string)file_get_contents($file), true);
    return is_array($decoded) ? $decoded : null;
}

function daily_request(string $url, string $key, ?array $payload = null, string $method = 'POST'): array
{
    $ch = curl_init($url);
    $headers = [
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json',
    ];
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_CUSTOMREQUEST => $method,
    ];
    if ($payload !== null) {
        $opts[CURLOPT_POSTFIELDS] = json_encode($payload);
    }
    curl_setopt_array($ch, $opts);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        throw new RuntimeException('cURL ' . $errno);
    }
    $decoded = json_decode($body ?: '{}', true);
    if ($status >= 400 || !is_array($decoded)) {
        throw new RuntimeException('HTTP ' . $status . ': ' . substr((string)$body, 0, 400));
    }
    return $decoded;
}

function daily_meeting_token(string $key, string $roomName, string $userName, bool $isOwner): ?string
{
    try {
        $payload = [
            'properties' => [
                'room_name' => $roomName,
                'is_owner' => $isOwner,
                'user_name' => $userName,
                'enable_screenshare' => $isOwner,
                'start_video_off' => false,
                'start_audio_off' => false,
                'exp' => time() + 60 * 60 * 4,
            ],
        ];
        $tok = daily_request('https://api.daily.co/v1/meeting-tokens', $key, $payload);
        return $tok['token'] ?? null;
    } catch (Throwable $e) {
        daily_log('meeting-token: ' . $e->getMessage());
        return null;
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
        $lessonId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['lessonId'] ?? ''));
        $state = null;
        if ($lessonId !== '' && is_file($meetingsDir . '/' . $lessonId . '.json')) {
            $state = eq_read_state($meetingsDir . '/' . $lessonId . '.json');
        } else {
            $state = eq_read_state($stateFile);
            if (
                $state &&
                $studentId !== '' &&
                ($state['studentId'] ?? '') !== $studentId
            ) {
                $state = null;
            }
        }
        echo json_encode(['ok' => true, 'room' => $state], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => daily_user_error()]);
        exit;
    }

    $key = (string)($config['daily_api_key'] ?? '');
    $input = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($input)) {
        $input = [];
    }

    $action = $input['action'] ?? 'create';
    $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['studentId'] ?? 'student'));
    $lessonId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['lessonId'] ?? ''));
    $role = (($input['role'] ?? 'student') === 'teacher') ? 'teacher' : 'student';
    $displayName = mb_substr(trim((string)($input['displayName'] ?? ($role === 'teacher' ? 'Lehrkraft' : 'Schüler'))), 0, 80);
    $prefix = preg_replace('/[^a-z0-9\-]/i', '', (string)($config['daily_room_prefix'] ?? 'eq'));
    $durationMinutes = max(25, min(180, (int)($input['durationMinutes'] ?? 60)));

    if ($action === 'end') {
        if ($lessonId !== '' && is_file($meetingsDir . '/' . $lessonId . '.json')) {
            @unlink($meetingsDir . '/' . $lessonId . '.json');
        }
        if (is_file($stateFile)) {
            @unlink($stateFile);
        }
        echo json_encode(['ok' => true, 'room' => null]);
        exit;
    }

    if ($action === 'status') {
        $state = $lessonId !== ''
            ? eq_read_state($meetingsDir . '/' . $lessonId . '.json')
            : eq_read_state($stateFile);
        echo json_encode(['ok' => true, 'room' => $state], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'token') {
        if ($key === '' || str_contains($key, 'HIER_DEINEN')) {
            daily_log('token: daily_api_key fehlt oder Platzhalter');
            http_response_code(503);
            echo json_encode(['ok' => false, 'error' => daily_user_error(), 'code' => 'key_missing']);
            exit;
        }
        $roomName = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['roomName'] ?? ''));
        if ($roomName === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => daily_user_error()]);
            exit;
        }
        $token = daily_meeting_token($key, $roomName, $displayName, $role === 'teacher');
        echo json_encode(['ok' => true, 'token' => $token], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'create') {
        if ($key === '' || str_contains($key, 'HIER_DEINEN')) {
            daily_log('create: daily_api_key fehlt oder Platzhalter');
            http_response_code(503);
            echo json_encode([
                'ok' => false,
                'error' => daily_user_error(),
                'code' => 'key_missing',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $name = strtolower(
            $prefix . '-' .
            ($lessonId !== '' ? $lessonId : $studentId) . '-' .
            substr((string)time(), -6)
        );
        $exp = time() + max(3600, $durationMinutes * 60 + 1800);
        $payload = [
            'name' => $name,
            'privacy' => 'private',
            'properties' => [
                'enable_chat' => true,
                'enable_screenshare' => true,
                'start_video_off' => false,
                'start_audio_off' => false,
                'exp' => $exp,
                'eject_at_room_exp' => true,
            ],
        ];

        $room = daily_request('https://api.daily.co/v1/rooms', $key, $payload);
        $roomName = $room['name'] ?? $name;
        $url = $room['url'] ?? null;
        if (empty($url)) {
            throw new RuntimeException('keine Room-URL');
        }

        $ownerToken = daily_meeting_token($key, $roomName, $displayName ?: 'Lehrkraft', true);
        $studentToken = daily_meeting_token($key, $roomName, 'Schüler', false);

        $state = [
            'id' => $room['id'] ?? null,
            'name' => $roomName,
            'url' => $url,
            'studentId' => $studentId,
            'lessonId' => $lessonId !== '' ? $lessonId : null,
            'ownerToken' => $ownerToken,
            'participantToken' => $studentToken,
            'expiresAt' => date('c', $exp),
            'updatedAt' => date('c'),
        ];

        file_put_contents(
            $stateFile,
            json_encode($state, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            LOCK_EX
        );
        if ($lessonId !== '') {
            file_put_contents(
                $meetingsDir . '/' . $lessonId . '.json',
                json_encode($state, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                LOCK_EX
            );
        }

        echo json_encode(['ok' => true, 'room' => $state], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => daily_user_error()]);
} catch (Throwable $e) {
    daily_log($e->getMessage());
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'error' => daily_user_error(),
        'code' => 'daily_error',
    ], JSON_UNESCAPED_UNICODE);
}
