<?php
/**
 * Qestra Marketplace — Lehrkräfte, Verfügbarkeit, Buchungen, Chat, iCal
 * Speicherung: data/marketplace/*.json
 * Seed nur wenn Dateien fehlen (DEV-SEED gekennzeichnet).
 *
 * PAYMENT HOOK: priceCreditsPerHour / Credits — Zahlungsanbieter später anbinden.
 * Hier keine echte Abrechnung.
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

$dir = __DIR__ . '/data/marketplace';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$files = [
    'teachers' => $dir . '/teachers.json',
    'slots' => $dir . '/availability.json',
    'exceptions' => $dir . '/exceptions.json',
    'bookings' => $dir . '/bookings.json',
    'messages' => $dir . '/messages.json',
    'reviews' => $dir . '/reviews.json',
];

function mp_read(string $file, $default) {
    if (!is_file($file)) {
        return $default;
    }
    $raw = file_get_contents($file);
    $data = json_decode($raw ?: 'null', true);
    return $data === null ? $default : $data;
}

function mp_write(string $file, $data): void {
    file_put_contents(
        $file,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

function mp_id(string $prefix): string {
    return $prefix . '-' . bin2hex(random_bytes(6));
}

function mp_seed_if_empty(array $files): void {
    if (is_file($files['teachers'])) {
        return;
    }
    $teachers = [
        [
            'id' => 'seed-teacher-lena',
            'firstName' => 'Lena',
            'lastInitial' => 'M',
            'photoUrl' => null,
            'bioShort' => 'Englisch und Mathe — ruhig, spielerisch, ohne Druck.',
            'bioLong' => 'Ich unterrichte seit mehreren Jahren Nachhilfe und arbeite gerne mit Spielen und kurzen Quests. Kontakt nur über Qestra.',
            'videoUrl' => null,
            'subjects' => ['english', 'math'],
            'gradeLevels' => [5, 6, 7, 8, 9, 10],
            'languagesSpoken' => ['de', 'en'],
            'focusTags' => ['exam', 'gaps', 'speaking'],
            'style' => 'Spielerisch, kurze Erklärungen, viel Übung',
            'verified' => true,
            'ratingAvg' => 4.8,
            'ratingCount' => 24,
            'lessonsTaught' => 180,
            'priceCreditsPerHour' => 40,
            'currencyNote' => 'credits-placeholder',
            'trialMinutes' => 25,
            'nextFreeSlotIso' => null,
            'approved' => true,
            '_seed' => true,
        ],
        [
            'id' => 'seed-teacher-jonas',
            'firstName' => 'Jonas',
            'lastInitial' => 'K',
            'photoUrl' => null,
            'bioShort' => 'Mathe und Physik für Mittelstufe — klar und geduldig.',
            'bioLong' => 'Schwerpunkt Rechenwege und Verständnis.',
            'videoUrl' => null,
            'subjects' => ['math', 'physics', 'exam-prep'],
            'gradeLevels' => [7, 8, 9, 10, 11, 12],
            'languagesSpoken' => ['de'],
            'focusTags' => ['exam', 'homework', 'gaps'],
            'style' => 'Schritt-für-Schritt, Visualisierungen',
            'verified' => true,
            'ratingAvg' => 4.6,
            'ratingCount' => 18,
            'lessonsTaught' => 120,
            'priceCreditsPerHour' => 45,
            'currencyNote' => 'credits-placeholder',
            'trialMinutes' => 25,
            'nextFreeSlotIso' => null,
            'approved' => true,
            '_seed' => true,
        ],
        [
            'id' => 'seed-teacher-sara',
            'firstName' => 'Sara',
            'lastInitial' => 'H',
            'photoUrl' => null,
            'bioShort' => 'Deutsch, DaZ und Lerntechniken — freundlich und strukturiert.',
            'bioLong' => 'Ich helfe beim Lesen, Schreiben und Organisieren von Lernstoff.',
            'videoUrl' => null,
            'subjects' => ['german', 'daz', 'study-skills', 'literacy-support'],
            'gradeLevels' => [3, 4, 5, 6, 7, 8],
            'languagesSpoken' => ['de', 'en', 'tr'],
            'focusTags' => ['homework', 'gaps', 'fun'],
            'style' => 'Lob und klare kleine Ziele',
            'verified' => true,
            'ratingAvg' => 4.9,
            'ratingCount' => 31,
            'lessonsTaught' => 210,
            'priceCreditsPerHour' => null,
            'currencyNote' => 'credits-placeholder',
            'trialMinutes' => 25,
            'nextFreeSlotIso' => null,
            'approved' => true,
            '_seed' => true,
        ],
    ];
    $slots = [
        ['id' => 'seed-slot-lena-tue', 'teacherId' => 'seed-teacher-lena', 'weekday' => 'tue', 'startMinutes' => 900, 'endMinutes' => 1080, 'timezone' => 'Europe/Berlin', '_seed' => true],
        ['id' => 'seed-slot-lena-thu', 'teacherId' => 'seed-teacher-lena', 'weekday' => 'thu', 'startMinutes' => 960, 'endMinutes' => 1140, 'timezone' => 'Europe/Berlin', '_seed' => true],
        ['id' => 'seed-slot-jonas-wed', 'teacherId' => 'seed-teacher-jonas', 'weekday' => 'wed', 'startMinutes' => 840, 'endMinutes' => 1020, 'timezone' => 'Europe/Berlin', '_seed' => true],
        ['id' => 'seed-slot-jonas-fri', 'teacherId' => 'seed-teacher-jonas', 'weekday' => 'fri', 'startMinutes' => 900, 'endMinutes' => 1080, 'timezone' => 'Europe/Berlin', '_seed' => true],
        ['id' => 'seed-slot-sara-mon', 'teacherId' => 'seed-teacher-sara', 'weekday' => 'mon', 'startMinutes' => 900, 'endMinutes' => 1080, 'timezone' => 'Europe/Berlin', '_seed' => true],
        ['id' => 'seed-slot-sara-sat', 'teacherId' => 'seed-teacher-sara', 'weekday' => 'sat', 'startMinutes' => 600, 'endMinutes' => 780, 'timezone' => 'Europe/Berlin', '_seed' => true],
    ];
    mp_write($files['teachers'], ['version' => 1, 'seed' => true, 'items' => $teachers]);
    mp_write($files['slots'], ['version' => 1, 'seed' => true, 'items' => $slots]);
    mp_write($files['exceptions'], ['version' => 1, 'items' => []]);
    mp_write($files['bookings'], ['version' => 1, 'items' => []]);
    mp_write($files['messages'], ['version' => 1, 'items' => []]);
    mp_write($files['reviews'], ['version' => 1, 'items' => []]);
}

mp_seed_if_empty($files);

function mp_weekday_utc(DateTimeImmutable $d, string $tz): string {
    $local = $d->setTimezone(new DateTimeZone($tz));
    $map = ['Sun' => 'sun', 'Mon' => 'mon', 'Tue' => 'tue', 'Wed' => 'wed', 'Thu' => 'thu', 'Fri' => 'fri', 'Sat' => 'sat'];
    return $map[$local->format('D')] ?? 'mon';
}

function mp_date_key(DateTimeImmutable $d, string $tz): string {
    return $d->setTimezone(new DateTimeZone($tz))->format('Y-m-d');
}

function mp_overlap(DateTimeImmutable $a0, DateTimeImmutable $a1, DateTimeImmutable $b0, DateTimeImmutable $b1): bool {
    return $a0 < $b1 && $b0 < $a1;
}

function mp_booking_conflicts(array $bookings, string $teacherId, DateTimeImmutable $start, int $duration, ?string $ignoreId = null): bool {
    $end = $start->modify('+' . $duration . ' minutes');
    foreach ($bookings as $b) {
        if (($b['teacherId'] ?? '') !== $teacherId) continue;
        if (($b['status'] ?? '') === 'cancelled') continue;
        if ($ignoreId && ($b['id'] ?? '') === $ignoreId) continue;
        $bs = new DateTimeImmutable($b['startsAt']);
        $be = $bs->modify('+' . (int)$b['durationMinutes'] . ' minutes');
        if (mp_overlap($start, $end, $bs, $be)) return true;
    }
    return false;
}

function mp_free_slots(array $slots, array $exceptions, array $bookings, string $teacherId, int $duration, int $daysAhead = 21): array {
    $teacherSlots = array_values(array_filter($slots, fn($s) => ($s['teacherId'] ?? '') === $teacherId));
    if (!$teacherSlots) return [];
    $tz = $teacherSlots[0]['timezone'] ?? 'Europe/Berlin';
    $from = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $result = [];
    for ($day = 0; $day < $daysAhead; $day++) {
        $cursor = $from->modify('+' . $day . ' days');
        $key = mp_date_key($cursor, $tz);
        $blocked = false;
        foreach ($exceptions as $ex) {
            if (($ex['teacherId'] ?? '') === $teacherId && ($ex['date'] ?? '') === $key && !empty($ex['blocked'])) {
                $blocked = true;
                break;
            }
        }
        if ($blocked) continue;
        $wd = mp_weekday_utc($cursor, $tz);
        foreach ($teacherSlots as $slot) {
            if (($slot['weekday'] ?? '') !== $wd) continue;
            for ($m = (int)$slot['startMinutes']; $m + $duration <= (int)$slot['endMinutes']; $m += $duration) {
                $hh = intdiv($m, 60);
                $mm = $m % 60;
                $local = new DateTimeImmutable(sprintf('%s %02d:%02d:00', $key, $hh, $mm), new DateTimeZone($tz));
                $startUtc = $local->setTimezone(new DateTimeZone('UTC'));
                if ($startUtc < $from) continue;
                if (mp_booking_conflicts($bookings, $teacherId, $startUtc, $duration)) continue;
                $endUtc = $startUtc->modify('+' . $duration . ' minutes');
                $result[] = [
                    'teacherId' => $teacherId,
                    'startsAt' => $startUtc->format(DateTimeInterface::ATOM),
                    'endsAt' => $endUtc->format(DateTimeInterface::ATOM),
                ];
            }
        }
    }
    return array_slice($result, 0, 40);
}

try {
    $teachersWrap = mp_read($files['teachers'], ['items' => []]);
    $slotsWrap = mp_read($files['slots'], ['items' => []]);
    $exWrap = mp_read($files['exceptions'], ['items' => []]);
    $bookWrap = mp_read($files['bookings'], ['items' => []]);
    $msgWrap = mp_read($files['messages'], ['items' => []]);
    $revWrap = mp_read($files['reviews'], ['items' => []]);

    $teachers = $teachersWrap['items'] ?? [];
    $slots = $slotsWrap['items'] ?? [];
    $exceptions = $exWrap['items'] ?? [];
    $bookings = $bookWrap['items'] ?? [];
    $messages = $msgWrap['items'] ?? [];
    $reviews = $revWrap['items'] ?? [];

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $action = (string)($_GET['action'] ?? 'teachers');

        if ($action === 'teachers') {
            $subject = (string)($_GET['subject'] ?? '');
            $list = array_values(array_filter($teachers, fn($t) => !empty($t['approved'])));
            if ($subject !== '') {
                $list = array_values(array_filter($list, fn($t) => in_array($subject, $t['subjects'] ?? [], true)));
            }
            $grade = isset($_GET['grade']) ? (int)$_GET['grade'] : 0;
            if ($grade > 0) {
                $list = array_values(array_filter($list, fn($t) => in_array($grade, $t['gradeLevels'] ?? [], true)));
            }
            $lang = (string)($_GET['lang'] ?? '');
            if ($lang !== '') {
                $list = array_values(array_filter($list, fn($t) => in_array($lang, $t['languagesSpoken'] ?? [], true)));
            }
            $minRating = isset($_GET['minRating']) ? (float)$_GET['minRating'] : 0;
            if ($minRating > 0) {
                $list = array_values(array_filter($list, fn($t) => ((float)($t['ratingAvg'] ?? 0)) >= $minRating));
            }
            $duration = isset($_GET['duration']) ? (int)$_GET['duration'] : 45;
            foreach ($list as &$t) {
                $free = mp_free_slots($slots, $exceptions, $bookings, $t['id'], $duration);
                $t['nextFreeSlotIso'] = $free[0]['startsAt'] ?? null;
            }
            unset($t);
            echo json_encode(['ok' => true, 'teachers' => $list, 'seed' => !empty($teachersWrap['seed'])], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($action === 'teacher') {
            $id = (string)($_GET['id'] ?? '');
            $t = null;
            foreach ($teachers as $row) {
                if (($row['id'] ?? '') === $id) { $t = $row; break; }
            }
            if (!$t) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Lehrkraft nicht gefunden']);
                exit;
            }
            $duration = isset($_GET['duration']) ? (int)$_GET['duration'] : 45;
            $free = mp_free_slots($slots, $exceptions, $bookings, $id, $duration);
            $t['nextFreeSlotIso'] = $free[0]['startsAt'] ?? null;
            $tReviews = array_values(array_filter($reviews, fn($r) => ($r['teacherId'] ?? '') === $id));
            echo json_encode([
                'ok' => true,
                'teacher' => $t,
                'slots' => $free,
                'availability' => array_values(array_filter($slots, fn($s) => ($s['teacherId'] ?? '') === $id)),
                'reviews' => $tReviews,
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($action === 'lessons') {
            $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
            $teacherId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['teacherId'] ?? ''));
            $list = $bookings;
            if ($studentId !== '') {
                $list = array_values(array_filter($list, fn($b) => ($b['studentId'] ?? '') === $studentId));
            }
            if ($teacherId !== '') {
                $list = array_values(array_filter($list, fn($b) => ($b['teacherId'] ?? '') === $teacherId));
            }
            usort($list, fn($a, $b) => strcmp($a['startsAt'] ?? '', $b['startsAt'] ?? ''));
            echo json_encode(['ok' => true, 'lessons' => $list], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($action === 'messages') {
            $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
            $teacherId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['teacherId'] ?? ''));
            $list = array_values(array_filter($messages, function ($m) use ($studentId, $teacherId) {
                if ($studentId !== '' && ($m['studentId'] ?? '') !== $studentId) return false;
                if ($teacherId !== '' && ($m['teacherId'] ?? '') !== $teacherId) return false;
                return true;
            }));
            usort($list, fn($a, $b) => strcmp($a['createdAt'] ?? '', $b['createdAt'] ?? ''));
            echo json_encode(['ok' => true, 'messages' => $list], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($action === 'ical') {
            $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
            $token = (string)($_GET['token'] ?? '');
            // Einfacher Export-Token: studentId-Hash (kein Geheimnis-Ersatz für Prod)
            $expect = substr(hash('sha256', 'qestra-ical-' . $studentId), 0, 16);
            if ($studentId === '' || !hash_equals($expect, $token)) {
                http_response_code(403);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Forbidden';
                exit;
            }
            $list = array_values(array_filter($bookings, function ($b) use ($studentId) {
                return ($b['studentId'] ?? '') === $studentId && ($b['status'] ?? '') !== 'cancelled';
            }));
            header('Content-Type: text/calendar; charset=utf-8');
            header('Content-Disposition: attachment; filename="qestra-stunden.ics"');
            echo "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Qestra//Lessons//DE\r\n";
            foreach ($list as $b) {
                $start = new DateTimeImmutable($b['startsAt']);
                $end = $start->modify('+' . (int)$b['durationMinutes'] . ' minutes');
                $uid = ($b['id'] ?? mp_id('lesson')) . '@qestra';
                $summary = 'Qestra: ' . ($b['subjectId'] ?? 'Stunde');
                if (!empty($b['topic'])) $summary .= ' — ' . preg_replace('/[\r\n]+/', ' ', $b['topic']);
                echo "BEGIN:VEVENT\r\n";
                echo 'UID:' . $uid . "\r\n";
                echo 'DTSTAMP:' . gmdate('Ymd\THis\Z') . "\r\n";
                echo 'DTSTART:' . $start->setTimezone(new DateTimeZone('UTC'))->format('Ymd\THis\Z') . "\r\n";
                echo 'DTEND:' . $end->setTimezone(new DateTimeZone('UTC'))->format('Ymd\THis\Z') . "\r\n";
                echo 'SUMMARY:' . $summary . "\r\n";
                echo "END:VEVENT\r\n";
            }
            echo "END:VCALENDAR\r\n";
            exit;
        }

        if ($action === 'icalToken') {
            $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($_GET['studentId'] ?? ''));
            $token = substr(hash('sha256', 'qestra-ical-' . $studentId), 0, 16);
            echo json_encode(['ok' => true, 'token' => $token, 'studentId' => $studentId]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Unbekannte action']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'GET or POST']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($input)) $input = [];
    $action = (string)($input['action'] ?? '');

    if ($action === 'book') {
        $studentId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['studentId'] ?? ''));
        $teacherId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['teacherId'] ?? ''));
        $subjectId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['subjectId'] ?? 'english'));
        $topic = mb_substr(trim((string)($input['topic'] ?? '')), 0, 500);
        $duration = (int)($input['durationMinutes'] ?? 45);
        if (!in_array($duration, [25, 45, 60], true)) $duration = 45;
        $isTrial = !empty($input['isTrial']);
        if ($isTrial) $duration = 25;
        $startsAt = (string)($input['startsAt'] ?? '');
        $autoConfirm = !empty($input['autoConfirm']);
        if ($studentId === '' || $teacherId === '' || $startsAt === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Pflichtfelder fehlen']);
            exit;
        }
        try {
            $start = new DateTimeImmutable($startsAt);
        } catch (Throwable $e) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Ungültige Startzeit']);
            exit;
        }
        if (mp_booking_conflicts($bookings, $teacherId, $start, $duration)) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'error' => 'Termin nicht mehr verfügbar (Doppelbuchung)']);
            exit;
        }
        // Auch Schüler-Konflikt
        $studentBooks = array_values(array_filter($bookings, fn($b) => ($b['studentId'] ?? '') === $studentId));
        if (mp_booking_conflicts($studentBooks, $teacherId, $start, $duration) || mp_booking_conflicts(
            array_map(function ($b) {
                $b['teacherId'] = $b['teacherId'] ?? 'x';
                return $b;
            }, $studentBooks),
            $teacherId,
            $start,
            $duration
        )) {
            // Schüler-eigene Konflikte separat
            $end = $start->modify('+' . $duration . ' minutes');
            foreach ($studentBooks as $b) {
                if (($b['status'] ?? '') === 'cancelled') continue;
                $bs = new DateTimeImmutable($b['startsAt']);
                $be = $bs->modify('+' . (int)$b['durationMinutes'] . ' minutes');
                if (mp_overlap($start, $end, $bs, $be)) {
                    http_response_code(409);
                    echo json_encode(['ok' => false, 'error' => 'Du hast bereits eine Stunde zu dieser Zeit']);
                    exit;
                }
            }
        }

        $now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
        $lesson = [
            'id' => mp_id('lesson'),
            'studentId' => $studentId,
            'teacherId' => $teacherId,
            'subjectId' => $subjectId,
            'topic' => $topic,
            'startsAt' => $start->setTimezone(new DateTimeZone('UTC'))->format(DateTimeInterface::ATOM),
            'durationMinutes' => $duration,
            'status' => $autoConfirm ? 'confirmed' : 'pending',
            'isTrial' => $isTrial,
            'recurringRule' => $input['recurringRule'] ?? null,
            'dailyRoomUrl' => null,
            'dailyRoomName' => null,
            'summary' => null,
            'homework' => null,
            'unlockedGameIds' => [],
            'createdAt' => $now,
            'updatedAt' => $now,
            'cancelReason' => null,
        ];
        $bookings[] = $lesson;
        mp_write($files['bookings'], ['version' => 1, 'items' => $bookings]);
        echo json_encode(['ok' => true, 'lesson' => $lesson], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'confirm' || $action === 'decline' || $action === 'cancel') {
        $lessonId = (string)($input['lessonId'] ?? '');
        $found = null;
        foreach ($bookings as &$b) {
            if (($b['id'] ?? '') === $lessonId) {
                if ($action === 'confirm') $b['status'] = 'confirmed';
                if ($action === 'decline' || $action === 'cancel') {
                    $b['status'] = 'cancelled';
                    $b['cancelReason'] = mb_substr((string)($input['reason'] ?? ''), 0, 300);
                }
                $b['updatedAt'] = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
                $found = $b;
                break;
            }
        }
        unset($b);
        if (!$found) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Stunde nicht gefunden']);
            exit;
        }
        mp_write($files['bookings'], ['version' => 1, 'items' => $bookings]);
        echo json_encode(['ok' => true, 'lesson' => $found], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'reschedule') {
        $lessonId = (string)($input['lessonId'] ?? '');
        $startsAt = (string)($input['startsAt'] ?? '');
        $found = null;
        try {
            $start = new DateTimeImmutable($startsAt);
        } catch (Throwable $e) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Ungültige Startzeit']);
            exit;
        }
        foreach ($bookings as &$b) {
            if (($b['id'] ?? '') !== $lessonId) continue;
            $duration = (int)$b['durationMinutes'];
            if (mp_booking_conflicts($bookings, $b['teacherId'], $start, $duration, $lessonId)) {
                http_response_code(409);
                echo json_encode(['ok' => false, 'error' => 'Neuer Termin kollidiert']);
                exit;
            }
            $b['startsAt'] = $start->setTimezone(new DateTimeZone('UTC'))->format(DateTimeInterface::ATOM);
            $b['status'] = 'confirmed';
            $b['updatedAt'] = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
            $found = $b;
            break;
        }
        unset($b);
        if (!$found) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Stunde nicht gefunden']);
            exit;
        }
        mp_write($files['bookings'], ['version' => 1, 'items' => $bookings]);
        echo json_encode(['ok' => true, 'lesson' => $found], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'complete') {
        $lessonId = (string)($input['lessonId'] ?? '');
        $found = null;
        foreach ($bookings as &$b) {
            if (($b['id'] ?? '') !== $lessonId) continue;
            $b['status'] = 'completed';
            $b['summary'] = mb_substr((string)($input['summary'] ?? ''), 0, 2000);
            $b['homework'] = mb_substr((string)($input['homework'] ?? ''), 0, 2000);
            $b['unlockedGameIds'] = is_array($input['unlockedGameIds'] ?? null) ? $input['unlockedGameIds'] : [];
            $b['updatedAt'] = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
            $found = $b;
            break;
        }
        unset($b);
        if (!$found) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Stunde nicht gefunden']);
            exit;
        }
        mp_write($files['bookings'], ['version' => 1, 'items' => $bookings]);
        echo json_encode(['ok' => true, 'lesson' => $found], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'attachRoom') {
        $lessonId = (string)($input['lessonId'] ?? '');
        $found = null;
        foreach ($bookings as &$b) {
            if (($b['id'] ?? '') !== $lessonId) continue;
            $b['dailyRoomUrl'] = (string)($input['dailyRoomUrl'] ?? '');
            $b['dailyRoomName'] = (string)($input['dailyRoomName'] ?? '');
            $b['updatedAt'] = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
            $found = $b;
            break;
        }
        unset($b);
        if (!$found) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Stunde nicht gefunden']);
            exit;
        }
        mp_write($files['bookings'], ['version' => 1, 'items' => $bookings]);
        echo json_encode(['ok' => true, 'lesson' => $found], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'message') {
        $msg = [
            'id' => mp_id('msg'),
            'lessonId' => $input['lessonId'] ?? null,
            'teacherId' => preg_replace('/[^a-z0-9\-]/i', '', (string)($input['teacherId'] ?? '')),
            'studentId' => preg_replace('/[^a-z0-9\-]/i', '', (string)($input['studentId'] ?? '')),
            'fromRole' => (($input['fromRole'] ?? 'student') === 'teacher') ? 'teacher' : 'student',
            'text' => mb_substr(trim((string)($input['text'] ?? '')), 0, 2000),
            'createdAt' => (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
            'reported' => false,
        ];
        if ($msg['teacherId'] === '' || $msg['studentId'] === '' || $msg['text'] === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Nachricht unvollständig']);
            exit;
        }
        $messages[] = $msg;
        mp_write($files['messages'], ['version' => 1, 'items' => $messages]);
        echo json_encode(['ok' => true, 'message' => $msg], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'reportMessage') {
        $id = (string)($input['messageId'] ?? '');
        $found = null;
        foreach ($messages as &$m) {
            if (($m['id'] ?? '') === $id) {
                $m['reported'] = true;
                $found = $m;
                break;
            }
        }
        unset($m);
        mp_write($files['messages'], ['version' => 1, 'items' => $messages]);
        echo json_encode(['ok' => true, 'message' => $found], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'review') {
        $review = [
            'id' => mp_id('rev'),
            'teacherId' => preg_replace('/[^a-z0-9\-]/i', '', (string)($input['teacherId'] ?? '')),
            'studentId' => preg_replace('/[^a-z0-9\-]/i', '', (string)($input['studentId'] ?? '')),
            'lessonId' => (string)($input['lessonId'] ?? ''),
            'stars' => max(1, min(5, (int)($input['stars'] ?? 5))),
            'text' => mb_substr(trim((string)($input['text'] ?? '')), 0, 500),
            'createdAt' => (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
        ];
        $reviews[] = $review;
        // Rating aktualisieren
        foreach ($teachers as &$t) {
            if (($t['id'] ?? '') !== $review['teacherId']) continue;
            $count = (int)($t['ratingCount'] ?? 0);
            $avg = (float)($t['ratingAvg'] ?? 0);
            $t['ratingAvg'] = round((($avg * $count) + $review['stars']) / ($count + 1), 2);
            $t['ratingCount'] = $count + 1;
            break;
        }
        unset($t);
        mp_write($files['reviews'], ['version' => 1, 'items' => $reviews]);
        mp_write($files['teachers'], ['version' => 1, 'seed' => !empty($teachersWrap['seed']), 'items' => $teachers]);
        echo json_encode(['ok' => true, 'review' => $review], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'saveTeacherProfile') {
        $id = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['teacherId'] ?? ''));
        $patch = $input['profile'] ?? [];
        if (!is_array($patch) || $id === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Profil fehlt']);
            exit;
        }
        $found = null;
        $exists = false;
        foreach ($teachers as &$t) {
            if (($t['id'] ?? '') !== $id) continue;
            $exists = true;
            // approved bleibt Admin-Sache — neue Profile starten unapproved außer Seed
            foreach (['firstName','lastInitial','bioShort','bioLong','videoUrl','style','photoUrl'] as $k) {
                if (array_key_exists($k, $patch)) $t[$k] = $patch[$k];
            }
            foreach (['subjects','gradeLevels','languagesSpoken','focusTags'] as $k) {
                if (isset($patch[$k]) && is_array($patch[$k])) $t[$k] = $patch[$k];
            }
            if (array_key_exists('priceCreditsPerHour', $patch)) {
                // PAYMENT HOOK
                $t['priceCreditsPerHour'] = $patch['priceCreditsPerHour'];
                $t['currencyNote'] = 'credits-placeholder';
            }
            if (isset($patch['trialMinutes'])) $t['trialMinutes'] = (int)$patch['trialMinutes'];
            $found = $t;
            break;
        }
        unset($t);
        if (!$exists) {
            $found = array_merge([
                'id' => $id,
                'firstName' => 'Lehrkraft',
                'lastInitial' => 'Q',
                'photoUrl' => null,
                'bioShort' => '',
                'bioLong' => '',
                'videoUrl' => null,
                'subjects' => ['english'],
                'gradeLevels' => [5, 6, 7, 8, 9, 10],
                'languagesSpoken' => ['de'],
                'focusTags' => [],
                'style' => '',
                'verified' => false,
                'ratingAvg' => 0,
                'ratingCount' => 0,
                'lessonsTaught' => 0,
                'priceCreditsPerHour' => null,
                'currencyNote' => 'credits-placeholder',
                'trialMinutes' => 25,
                'nextFreeSlotIso' => null,
                'approved' => false,
            ], $patch, ['id' => $id, 'approved' => false]);
            $teachers[] = $found;
        }
        mp_write($files['teachers'], ['version' => 1, 'seed' => !empty($teachersWrap['seed']), 'items' => $teachers]);
        echo json_encode(['ok' => true, 'teacher' => $found, 'note' => $exists ? 'updated' : 'pending-admin-approval'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'saveAvailability') {
        $teacherId = preg_replace('/[^a-z0-9\-]/i', '', (string)($input['teacherId'] ?? ''));
        $newSlots = $input['slots'] ?? [];
        if ($teacherId === '' || !is_array($newSlots)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'slots fehlen']);
            exit;
        }
        $slots = array_values(array_filter($slots, fn($s) => ($s['teacherId'] ?? '') !== $teacherId));
        foreach ($newSlots as $s) {
            $slots[] = [
                'id' => $s['id'] ?? mp_id('slot'),
                'teacherId' => $teacherId,
                'weekday' => $s['weekday'] ?? 'mon',
                'startMinutes' => (int)($s['startMinutes'] ?? 900),
                'endMinutes' => (int)($s['endMinutes'] ?? 1080),
                'timezone' => $s['timezone'] ?? 'Europe/Berlin',
            ];
        }
        mp_write($files['slots'], ['version' => 1, 'seed' => !empty($slotsWrap['seed']), 'items' => $slots]);
        echo json_encode(['ok' => true, 'slots' => array_values(array_filter($slots, fn($s) => ($s['teacherId'] ?? '') === $teacherId))], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'adminApproveTeacher') {
        $id = (string)($input['teacherId'] ?? '');
        $approved = !empty($input['approved']);
        $found = null;
        foreach ($teachers as &$t) {
            if (($t['id'] ?? '') !== $id) continue;
            $t['approved'] = $approved;
            $t['verified'] = $approved ? true : ($t['verified'] ?? false);
            $found = $t;
            break;
        }
        unset($t);
        mp_write($files['teachers'], ['version' => 1, 'seed' => !empty($teachersWrap['seed']), 'items' => $teachers]);
        echo json_encode(['ok' => true, 'teacher' => $found], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unbekannte action: ' . $action]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
