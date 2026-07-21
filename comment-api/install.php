<?php
require __DIR__ . '/bootstrap.php';

/**
 * One-time table creator. Open once in the browser with the correct token:
 *   https://blog.mrahari.com/comment-api/install.php?token=YOUR_INSTALL_TOKEN
 * Then DELETE this file from the host.
 */

$token    = (string)($_GET['token'] ?? '');
$expected = (string)($CONFIG['install_token'] ?? '');
if ($expected === '' || $expected === 'CHANGE_ME_to_a_long_random_string' || !hash_equals($expected, $token)) {
    json_out(['ok' => false, 'error' => 'Invalid or missing install token'], 403);
}

$driver = $CONFIG['db']['driver'] ?? 'mysql';

if ($driver === 'sqlite') {
    db()->exec("CREATE TABLE IF NOT EXISTS comments (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id      TEXT NOT NULL,
        parent_id    INTEGER NULL,
        author_name  TEXT NOT NULL,
        author_email TEXT NULL,
        body         TEXT NOT NULL,
        status       TEXT NOT NULL DEFAULT 'pending',
        ip_address   TEXT,
        created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )");
    db()->exec("CREATE INDEX IF NOT EXISTS idx_page_status ON comments(page_id, status)");
    db()->exec("CREATE INDEX IF NOT EXISTS idx_ip_created ON comments(ip_address, created_at)");
} else {
    db()->exec("CREATE TABLE IF NOT EXISTS comments (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        page_id      VARCHAR(255) NOT NULL,
        parent_id    INT NULL,
        author_name  VARCHAR(100) NOT NULL,
        author_email VARCHAR(255) NULL,
        body         TEXT NOT NULL,
        status       ENUM('pending','approved','spam') NOT NULL DEFAULT 'pending',
        ip_address   VARCHAR(45),
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_page_status (page_id, status),
        INDEX idx_ip_created (ip_address, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

json_out(['ok' => true, 'message' => 'جدول comments ساخته شد. حالا فایل install.php را از هاست پاک کن.']);
