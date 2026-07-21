<?php
require __DIR__ . '/bootstrap.php';
apply_cors();

// --- Method + origin gate ---------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}
enforce_origin();

// --- Read input (accept JSON body or form-encoded) --------------------------
$raw = file_get_contents('php://input');
if ($raw !== '' && str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_out(['ok' => false, 'error' => 'Bad request'], 400);
    }
} else {
    $data = $_POST;
}

// --- 1) Honeypot: hidden field must stay empty ------------------------------
if (!empty($data['website'])) {
    json_out(['ok' => true, 'message' => 'ثبت شد.']); // pretend success, silently drop bots
}

// --- 2) Time-trap: form must not be submitted too fast ----------------------
$elapsedMs = (int)($data['elapsed_ms'] ?? 0);
$minSec    = (int)($CONFIG['antispam']['min_seconds'] ?? 3);
if ($elapsedMs < $minSec * 1000) {
    json_out(['ok' => false, 'error' => 'یه کم آروم‌تر، دوباره امتحان کن.'], 429);
}

// --- 3) Validation ----------------------------------------------------------
$maxName = (int)($CONFIG['antispam']['max_name_len'] ?? 100);
$maxBody = (int)($CONFIG['antispam']['max_body_len'] ?? 5000);

$name  = trim((string)($data['author_name'] ?? ''));
$email = trim((string)($data['author_email'] ?? ''));
$body  = trim((string)($data['body'] ?? ''));
$page  = trim((string)($data['page_id'] ?? ''));
$parent = (isset($data['parent_id']) && $data['parent_id'] !== '' && $data['parent_id'] !== null)
    ? (int)$data['parent_id'] : null;

if ($name === '' || mb_strlen($name) > $maxName) {
    json_out(['ok' => false, 'error' => 'اسم لازمه (حداکثر ' . $maxName . ' حرف).'], 422);
}
if ($body === '' || mb_strlen($body) > $maxBody) {
    json_out(['ok' => false, 'error' => 'متن کامنت لازمه (حداکثر ' . $maxBody . ' حرف).'], 422);
}
if ($page === '' || mb_strlen($page) > 255) {
    json_out(['ok' => false, 'error' => 'صفحه نامعتبره.'], 422);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_out(['ok' => false, 'error' => 'ایمیل نامعتبره (خالی هم می‌تونی بذاری).'], 422);
}

// --- 4) Rate-limit per IP ---------------------------------------------------
$ip     = client_ip();
$window = (int)($CONFIG['antispam']['rate_limit_window'] ?? 600);
$max    = (int)($CONFIG['antispam']['rate_limit_count'] ?? 5);
$since  = date('Y-m-d H:i:s', time() - $window);

$stmt = db()->prepare('SELECT COUNT(*) FROM comments WHERE ip_address = ? AND created_at >= ?');
$stmt->execute([$ip, $since]);
if ((int)$stmt->fetchColumn() >= $max) {
    json_out(['ok' => false, 'error' => 'تعداد کامنت‌هات زیاد شد، یه کم بعد دوباره بیا.'], 429);
}

// --- 5) Validate parent (must exist, be approved, same page) ----------------
if ($parent !== null) {
    $stmt = db()->prepare('SELECT page_id, status FROM comments WHERE id = ?');
    $stmt->execute([$parent]);
    $row = $stmt->fetch();
    if (!$row || $row['page_id'] !== $page || $row['status'] !== 'approved') {
        $parent = null; // ignore invalid parent → treat as top-level
    }
}

// --- 6) Insert (prepared statement → no SQL injection) ----------------------
$stmt = db()->prepare(
    'INSERT INTO comments (page_id, parent_id, author_name, author_email, body, status, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$page, $parent, $name, ($email !== '' ? $email : null), $body, 'pending', $ip, date('Y-m-d H:i:s')]);

// --- 7) Notify admin by email ----------------------------------------------
if (!empty($CONFIG['notify']['enabled']) && function_exists('mail')) {
    $to      = (string)($CONFIG['notify']['to'] ?? '');
    $subject = '=?UTF-8?B?' . base64_encode('کامنت جدید در بلاگ') . '?=';
    $lines   = "نام: $name\nصفحه: $page\n\n$body\n\nتأیید/حذف: " . ($CONFIG['site']['admin_url'] ?? '');
    $headers = 'From: ' . ($CONFIG['notify']['from'] ?? 'comments@localhost') . "\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n";
    if ($to !== '') {
        @mail($to, $subject, $lines, $headers);
    }
}

json_out(['ok' => true, 'message' => 'کامنتت ثبت شد و بعد از تأیید نمایش داده می‌شه.']);
