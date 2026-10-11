<?php
/**
 * Qestra — Lehrer-Persistenz (Stunden-Entwürfe, Freigaben)
 * data/teachers/{teacherId}.json
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

$dir = __DIR__ . '/data/teachers';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

function t_id(string $raw): string {
    return preg_replace('/[^a-z0-9\-]/i', '', $raw) ?: '';
}

function t_read(string $file): array {
    if (!is_file($file)) {
        return ['lessons' => [], 'permissions' => [], 'updatedAt' => null];
    }
    $data = json_decode((string)file_get_contents($file), true);
    return is_array($data) ? $data : ['lessons' => [], 'permissions' => []];
}

function t_write(string $file, array $data): void {
    $data['updatedAt'] = date('c');
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $teacherId = t_id((string)($_GET['teacherId'] ?? ''));
        if ($teacherId === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'teacherId fehlt']);
            exit;
        }
        $bundle = t_read($dir . '/' . $teacherId . '.json');
        echo json_encode(['ok' => true, 'bundle' => $bundle], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'GET or POST']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($input)) $input = [];
    $action = (string)($input['action'] ?? 'saveLesson');
    $teacherId = t_id((string)($input['teacherId'] ?? ''));
    if ($teacherId === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'teacherId fehlt']);
        exit;
    }
    $file = $dir . '/' . $teacherId . '.json';
    $bundle = t_read($file);
    $lessons = is_array($bundle['lessons'] ?? null) ? $bundle['lessons'] : [];

    if ($action === 'saveLesson') {
        $lesson = $input['lesson'] ?? null;
        if (!is_array($lesson) || empty($lesson['id'])) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'lesson fehlt']);
            exit;
        }
        $lesson['updatedAt'] = date('c');
        if (empty($lesson['createdAt'])) $lesson['createdAt'] = $lesson['updatedAt'];
        $found = false;
        foreach ($lessons as &$l) {
            if (($l['id'] ?? '') === $lesson['id']) {
                $l = $lesson;
                $found = true;
                break;
            }
        }
        unset($l);
        if (!$found) $lessons[] = $lesson;
        $bundle['lessons'] = $lessons;
        t_write($file, $bundle);
        echo json_encode(['ok' => true, 'lesson' => $lesson], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'deleteLesson') {
        $id = (string)($input['lessonId'] ?? '');
        $bundle['lessons'] = array_values(array_filter($lessons, fn($l) => ($l['id'] ?? '') !== $id));
        t_write($file, $bundle);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'savePermissions') {
        $studentId = t_id((string)($input['studentId'] ?? ''));
        $perms = $input['permissions'] ?? null;
        if ($studentId === '' || !is_array($perms)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'permissions fehlen']);
            exit;
        }
        if (!isset($bundle['permissions']) || !is_array($bundle['permissions'])) {
            $bundle['permissions'] = [];
        }
        $bundle['permissions'][$studentId] = $perms;
        t_write($file, $bundle);
        echo json_encode(['ok' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unbekannte action']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Speichern gerade nicht möglich.']);
    error_log('[Qestra teacher.php] ' . $e->getMessage());
}
