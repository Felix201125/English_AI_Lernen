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
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$dataDir = __DIR__ . '/data';
$file = $dataDir . '/invites.json';
$parentFile = $dataDir . '/parent_invites.json';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$action = (string)($input['action'] ?? '');

function eq_inv_read($f) {
    if (!is_file($f)) return [];
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d : [];
}
function eq_inv_write($f, $d) {
    file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

try {
    if ($action === 'create') {
        $inviter = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['userId'] ?? ''));
        if ($inviter === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'userId']); exit; }
        $code = 'Q-' . strtoupper(bin2hex(random_bytes(3)));
        $all = eq_inv_read($file);
        $all[$code] = ['code'=>$code,'inviterUserId'=>$inviter,'createdAt'=>date('c'),'redeemedBy'=>[]];
        eq_inv_write($file, $all);
        echo json_encode(['ok'=>true,'code'=>$code]);
        exit;
    }
    if ($action === 'redeem') {
        $code = strtoupper(trim((string)($input['code'] ?? '')));
        $userId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['userId'] ?? ''));
        $all = eq_inv_read($file);
        $inv = $all[$code] ?? null;
        if (!$inv) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Code unbekannt']); exit; }
        if ($inv['inviterUserId'] === $userId) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Selbst-Einladung nicht möglich']); exit; }
        if (in_array($userId, $inv['redeemedBy'] ?? [], true)) { echo json_encode(['ok'=>true,'already'=>true]); exit; }
        $inv['redeemedBy'][] = $userId;
        $all[$code] = $inv;
        eq_inv_write($file, $all);
        echo json_encode(['ok'=>true,'rewardBadge'=>'freund-eingeladen','inviterUserId'=>$inv['inviterUserId']]);
        exit;
    }
    if ($action === 'parent_create') {
        $childId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['studentId'] ?? ''));
        if ($childId === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'studentId']); exit; }
        $token = bin2hex(random_bytes(16));
        $all = eq_inv_read($parentFile);
        $all[$token] = ['token'=>$token,'studentId'=>$childId,'createdAt'=>date('c'),'used'=>false];
        eq_inv_write($parentFile, $all);
        echo json_encode(['ok'=>true,'token'=>$token]);
        exit;
    }
    if ($action === 'parent_accept') {
        $token = (string)($input['token'] ?? '');
        $parentUserId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['userId'] ?? ''));
        $all = eq_inv_read($parentFile);
        $row = $all[$token] ?? null;
        if (!$row || !empty($row['used'])) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Link ungültig']); exit; }
        $row['used'] = true;
        $row['parentUserId'] = $parentUserId;
        $all[$token] = $row;
        eq_inv_write($parentFile, $all);
        echo json_encode(['ok'=>true,'studentId'=>$row['studentId'],'consentHint'=>true]);
        exit;
    }
    http_response_code(400);
    echo json_encode(['ok'=>false,'error'=>'action']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'Einladung gerade nicht verfügbar']);
}
