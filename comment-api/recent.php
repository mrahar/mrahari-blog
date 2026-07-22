<?php
require __DIR__ . '/bootstrap.php';
apply_cors();

// Returns the newest approved comments across the whole site (for the sidebar widget).
$limit = (int)($_GET['limit'] ?? 5);
if ($limit < 1)  $limit = 5;
if ($limit > 20) $limit = 20;

$stmt = db()->prepare(
    'SELECT page_id, author_name, body, created_at
     FROM comments WHERE status = ? ORDER BY created_at DESC LIMIT ' . $limit
);
$stmt->execute(['approved']);
$rows = $stmt->fetchAll();

// Escape on output (XSS defense) and add a short plain-text excerpt of the body.
$out = [];
foreach ($rows as $r) {
    $body = trim(preg_replace('/\s+/u', ' ', (string)$r['body']));
    $excerpt = mb_substr($body, 0, 80);
    if (mb_strlen($body) > 80) {
        $excerpt .= '…';
    }
    $out[] = [
        'page_id'     => htmlspecialchars($r['page_id'], ENT_QUOTES, 'UTF-8'),
        'author_name' => htmlspecialchars($r['author_name'], ENT_QUOTES, 'UTF-8'),
        'excerpt'     => htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8'),
        'created_at'  => $r['created_at'],
    ];
}

json_out(['ok' => true, 'count' => count($out), 'comments' => $out]);
