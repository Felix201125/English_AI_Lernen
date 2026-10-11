<?php
/**
 * Qestra Auth — Register / Login / Google / Session
 * Users & sessions in data/ (geschützt per .htaccess).
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

$dataDir = __DIR__ . '/data';
$usersFile = $dataDir . '/users.json';
$sessionsFile = $dataDir . '/sessions.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
if (!is_file($usersFile)) {
    eq_write_json($usersFile, []);
}
eq_ensure_seed_teachers($usersFile);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $token = eq_bearer_token();
        if (!$token) {
            // Öffentliche Config für Google-Button
            $clientId = (string)($config['google_client_id'] ?? '');
            if (str_contains($clientId, 'HIER_')) {
                $clientId = '';
            }
            echo json_encode([
                'ok' => true,
                'googleClientId' => $clientId,
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $user = eq_user_from_token($token, $sessionsFile, $usersFile);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Nicht angemeldet.']);
            exit;
        }
        echo json_encode(['ok' => true, 'user' => eq_public_user($user)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'GET or POST required']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($input)) {
        $input = [];
    }
    $action = (string)($input['action'] ?? 'login');

    if ($action === 'logout') {
        $token = eq_bearer_token() ?: (string)($input['token'] ?? '');
        if ($token !== '') {
            $sessions = eq_read_json($sessionsFile) ?: [];
            unset($sessions[$token]);
            eq_write_json($sessionsFile, $sessions);
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'register') {
        $name = trim((string)($input['name'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        $role = eq_normalize_role((string)($input['role'] ?? 'student'));

        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Name, E-Mail und Passwort erforderlich.']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Ungültige E-Mail-Adresse.']);
            exit;
        }
        if (strlen($password) < 8) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Passwort mindestens 8 Zeichen.']);
            exit;
        }

        $users = eq_read_json($usersFile) ?: [];
        foreach ($users as $u) {
            if (strtolower((string)($u['email'] ?? '')) === $email) {
                http_response_code(409);
                echo json_encode(['ok' => false, 'error' => 'Diese E-Mail ist bereits registriert.']);
                exit;
            }
        }

        $id = 'u-' . bin2hex(random_bytes(8));
        $studentId = $role === 'student' ? eq_student_id($name, $id) : null;
        $user = [
            'id' => $id,
            'email' => $email,
            'name' => $name,
            'role' => $role,
            'studentId' => $studentId,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
            'googleSub' => null,
            'createdAt' => date('c'),
        ];
        $users[] = $user;
        eq_write_json($usersFile, $users);

        $session = eq_create_session($sessionsFile, $user['id']);
        echo json_encode([
            'ok' => true,
            'token' => $session,
            'user' => eq_public_user($user),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'login') {
        $email = strtolower(trim((string)($input['email'] ?? $input['username'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'E-Mail und Passwort erforderlich.']);
            exit;
        }

        $users = eq_read_json($usersFile) ?: [];
        $found = null;
        foreach ($users as $u) {
            if (strtolower((string)($u['email'] ?? '')) === $email) {
                $found = $u;
                break;
            }
        }

        $hash = (string)($found['passwordHash'] ?? '');
        if (!$found || $hash === '' || !password_verify($password, $hash)) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'E-Mail oder Passwort falsch.']);
            exit;
        }

        $token = eq_create_session($sessionsFile, $found['id']);
        echo json_encode([
            'ok' => true,
            'token' => $token,
            'user' => eq_public_user($found),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'google') {
        $idToken = (string)($input['idToken'] ?? $input['credential'] ?? '');
        $roleHint = eq_normalize_role((string)($input['role'] ?? 'student'));
        if ($idToken === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Google-Token fehlt.']);
            exit;
        }

        $clientId = (string)($config['google_client_id'] ?? '');
        if ($clientId === '' || str_contains($clientId, 'HIER_')) {
            http_response_code(500);
            echo json_encode([
                'ok' => false,
                'error' => 'google_client_id fehlt in api/config.php.',
            ]);
            exit;
        }

        $payload = eq_verify_google_id_token($idToken, $clientId);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Google-Anmeldung ungültig.']);
            exit;
        }

        $email = strtolower((string)($payload['email'] ?? ''));
        $sub = (string)($payload['sub'] ?? '');
        $name = trim((string)($payload['name'] ?? ''));
        if ($email === '' || $sub === '') {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Google-Konto ohne E-Mail.']);
            exit;
        }
        if ($name === '') {
            $name = explode('@', $email)[0];
        }

        $users = eq_read_json($usersFile) ?: [];
        $found = null;
        $idx = null;
        foreach ($users as $i => $u) {
            if (($u['googleSub'] ?? '') === $sub || strtolower((string)($u['email'] ?? '')) === $email) {
                $found = $u;
                $idx = $i;
                break;
            }
        }

        if (!$found) {
            $id = 'u-' . bin2hex(random_bytes(8));
            $found = [
                'id' => $id,
                'email' => $email,
                'name' => $name,
                'role' => $roleHint,
                'studentId' => $roleHint === 'student' ? eq_student_id($name, $id) : null,
                'passwordHash' => null,
                'googleSub' => $sub,
                'createdAt' => date('c'),
            ];
            $users[] = $found;
        } else {
            $found['googleSub'] = $sub;
            if (empty($found['name'])) {
                $found['name'] = $name;
            }
            $users[$idx] = $found;
        }
        eq_write_json($usersFile, $users);

        $token = eq_create_session($sessionsFile, $found['id']);
        echo json_encode([
            'ok' => true,
            'token' => $token,
            'user' => eq_public_user($found),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // --- Kontoverwaltung (Session nötig) ---
    $token = eq_bearer_token() ?: (string)($input['token'] ?? '');
    $current = $token !== ''
        ? eq_user_from_token($token, $sessionsFile, $usersFile)
        : null;

    if (in_array($action, ['update_profile', 'change_password', 'set_password', 'delete_account', 'logout_all'], true)) {
        if (!$current) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Nicht angemeldet.']);
            exit;
        }
    }

    if ($action === 'update_profile') {
        $name = trim((string)($input['name'] ?? $current['name'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? $current['email'] ?? '')));
        if ($name === '' || $email === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Name und E-Mail erforderlich.']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Ungültige E-Mail-Adresse.']);
            exit;
        }

        $users = eq_read_json($usersFile) ?: [];
        foreach ($users as $u) {
            if (($u['id'] ?? '') !== ($current['id'] ?? '')
                && strtolower((string)($u['email'] ?? '')) === $email) {
                http_response_code(409);
                echo json_encode(['ok' => false, 'error' => 'Diese E-Mail ist bereits vergeben.']);
                exit;
            }
        }

        $updated = null;
        foreach ($users as $i => $u) {
            if (($u['id'] ?? '') === ($current['id'] ?? '')) {
                $users[$i]['name'] = $name;
                $users[$i]['email'] = $email;
                $updated = $users[$i];
                break;
            }
        }
        if (!$updated) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Konto nicht gefunden.']);
            exit;
        }
        eq_write_json($usersFile, $users);
        echo json_encode(['ok' => true, 'user' => eq_public_user($updated)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'change_password') {
        $currentPassword = (string)($input['currentPassword'] ?? '');
        $newPassword = (string)($input['newPassword'] ?? '');
        if (strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Neues Passwort mindestens 8 Zeichen.']);
            exit;
        }
        $hash = (string)($current['passwordHash'] ?? '');
        if ($hash === '' || !password_verify($currentPassword, $hash)) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Aktuelles Passwort ist falsch.']);
            exit;
        }

        $users = eq_read_json($usersFile) ?: [];
        $updated = null;
        foreach ($users as $i => $u) {
            if (($u['id'] ?? '') === ($current['id'] ?? '')) {
                $users[$i]['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
                $updated = $users[$i];
                break;
            }
        }
        eq_write_json($usersFile, $users);
        echo json_encode(['ok' => true, 'user' => eq_public_user($updated ?? $current)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'set_password') {
        // Für Google-Konten ohne Passwort
        $newPassword = (string)($input['newPassword'] ?? '');
        if (strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Passwort mindestens 8 Zeichen.']);
            exit;
        }
        if (!empty($current['passwordHash'])) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Passwort bereits gesetzt — bitte ändern.']);
            exit;
        }

        $users = eq_read_json($usersFile) ?: [];
        $updated = null;
        foreach ($users as $i => $u) {
            if (($u['id'] ?? '') === ($current['id'] ?? '')) {
                $users[$i]['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
                $updated = $users[$i];
                break;
            }
        }
        eq_write_json($usersFile, $users);
        echo json_encode(['ok' => true, 'user' => eq_public_user($updated ?? $current)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'logout_all') {
        $sessions = eq_read_json($sessionsFile) ?: [];
        $uid = (string)($current['id'] ?? '');
        foreach ($sessions as $t => $s) {
            if (($s['userId'] ?? '') === $uid) {
                unset($sessions[$t]);
            }
        }
        eq_write_json($sessionsFile, $sessions);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($action === 'delete_account') {
        $confirm = trim((string)($input['confirm'] ?? ''));
        $password = (string)($input['password'] ?? '');
        $emailConfirm = strtolower(trim((string)($input['email'] ?? '')));

        if ($confirm !== 'LÖSCHEN' && $confirm !== 'LOESCHEN') {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'error' => 'Bitte zur Bestätigung LÖSCHEN eintippen.',
            ]);
            exit;
        }
        if ($emailConfirm !== strtolower((string)($current['email'] ?? ''))) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'E-Mail stimmt nicht überein.']);
            exit;
        }

        $hash = (string)($current['passwordHash'] ?? '');
        if ($hash !== '') {
            if ($password === '' || !password_verify($password, $hash)) {
                http_response_code(401);
                echo json_encode(['ok' => false, 'error' => 'Passwort zur Löschung erforderlich.']);
                exit;
            }
        }

        $uid = (string)($current['id'] ?? '');
        $users = eq_read_json($usersFile) ?: [];
        $users = array_values(array_filter(
            $users,
            static fn($u) => ($u['id'] ?? '') !== $uid
        ));
        eq_write_json($usersFile, $users);

        $sessions = eq_read_json($sessionsFile) ?: [];
        foreach ($sessions as $t => $s) {
            if (($s['userId'] ?? '') === $uid) {
                unset($sessions[$t]);
            }
        }
        eq_write_json($sessionsFile, $sessions);

        echo json_encode(['ok' => true, 'deleted' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unbekannte action.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

function eq_normalize_role(string $role): string
{
    return $role === 'teacher' ? 'teacher' : 'student';
}

function eq_student_id(string $name, string $userId): string
{
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name) ?? '', '-'));
    $slug = substr($slug, 0, 20);
    if ($slug === '') {
        $slug = 'student';
    }
    return $slug . '-' . substr(preg_replace('/^u-/', '', $userId), 0, 8);
}

function eq_public_user(array $u): array
{
    $role = $u['role'] ?? 'student';
    $marketplaceTeacherId = $u['marketplaceTeacherId'] ?? null;
    if ($role === 'teacher' && !$marketplaceTeacherId) {
        $marketplaceTeacherId = 'teacher-' . preg_replace('/[^a-z0-9\-]/i', '', (string)($u['id'] ?? ''));
    }
    return [
        'id' => $u['id'] ?? '',
        'email' => $u['email'] ?? '',
        'name' => $u['name'] ?? '',
        'role' => $role,
        'studentId' => $u['studentId'] ?? null,
        'marketplaceTeacherId' => $marketplaceTeacherId,
        'hasPassword' => !empty($u['passwordHash']),
        'hasGoogle' => !empty($u['googleSub']),
        'createdAt' => $u['createdAt'] ?? null,
    ];
}

function eq_bearer_token(): ?string
{
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $h, $m)) {
        return $m[1];
    }
    return null;
}

function eq_create_session(string $sessionsFile, string $userId): string
{
    $token = bin2hex(random_bytes(32));
    $sessions = eq_read_json($sessionsFile) ?: [];
    foreach ($sessions as $t => $s) {
        if (($s['expiresAt'] ?? 0) < time()) {
            unset($sessions[$t]);
        }
    }
    $sessions[$token] = [
        'userId' => $userId,
        'expiresAt' => time() + 60 * 60 * 24 * 14,
    ];
    eq_write_json($sessionsFile, $sessions);
    return $token;
}

function eq_user_from_token(string $token, string $sessionsFile, string $usersFile): ?array
{
    $sessions = eq_read_json($sessionsFile) ?: [];
    $sess = $sessions[$token] ?? null;
    if (!$sess || ($sess['expiresAt'] ?? 0) < time()) {
        return null;
    }
    $users = eq_read_json($usersFile) ?: [];
    foreach ($users as $u) {
        if (($u['id'] ?? '') === ($sess['userId'] ?? '')) {
            return $u;
        }
    }
    return null;
}

function eq_verify_google_id_token(string $idToken, string $clientId): ?array
{
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
    $raw = eq_http_get($url);
    if ($raw === null) {
        return null;
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return null;
    }
    $aud = (string)($data['aud'] ?? '');
    $emailVerified = ($data['email_verified'] ?? 'false');
    if ($aud !== $clientId) {
        return null;
    }
    if ($emailVerified !== true && $emailVerified !== 'true') {
        return null;
    }
    return $data;
}

function eq_http_get(string $url): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body === false || $code >= 400) {
            return null;
        }
        return (string)$body;
    }
    $ctx = stream_context_create(['http' => ['timeout' => 12]]);
    $body = @file_get_contents($url, false, $ctx);
    return $body === false ? null : $body;
}

function eq_read_json(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }
    $raw = file_get_contents($file);
    $data = json_decode($raw ?: 'null', true);
    return is_array($data) ? $data : null;
}

function eq_write_json(string $file, array $data): void
{
    file_put_contents(
        $file,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

/** DEV-SEED Lehrkräfte zum Testen von Buchungen (klar gekennzeichnet) */
function eq_ensure_seed_teachers(string $usersFile): void
{
    $users = eq_read_json($usersFile) ?: [];
    $seeds = [
        [
            'email' => 'lena@qestra.seed',
            'name' => 'Lena M.',
            'marketplaceTeacherId' => 'seed-teacher-lena',
        ],
        [
            'email' => 'jonas@qestra.seed',
            'name' => 'Jonas K.',
            'marketplaceTeacherId' => 'seed-teacher-jonas',
        ],
        [
            'email' => 'sara@qestra.seed',
            'name' => 'Sara H.',
            'marketplaceTeacherId' => 'seed-teacher-sara',
        ],
    ];
    $changed = false;
    foreach ($seeds as $seed) {
        $exists = false;
        foreach ($users as $u) {
            if (($u['email'] ?? '') === $seed['email']) {
                $exists = true;
                break;
            }
        }
        if ($exists) continue;
        $users[] = [
            'id' => $seed['marketplaceTeacherId'],
            'name' => $seed['name'],
            'email' => $seed['email'],
            'role' => 'teacher',
            'passwordHash' => password_hash('qestra-seed', PASSWORD_DEFAULT),
            'marketplaceTeacherId' => $seed['marketplaceTeacherId'],
            '_seed' => true,
            'createdAt' => date('c'),
        ];
        $changed = true;
    }
    if ($changed) {
        eq_write_json($usersFile, $users);
    }
}
