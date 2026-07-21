<?php
require __DIR__ . '/bootstrap.php';
apply_cors();

// Returns approved comments for one page, nested as a reply tree.
$page = trim((string)($_GET['page_id'] ?? ''));
if ($page === '' || mb_strlen($page) > 255) {
    json_out(['ok' => false, 'error' => 'page_id required'], 400);
}

$stmt = db()->prepare(
    'SELECT id, parent_id, author_name, body, created_at
     FROM comments WHERE page_id = ? AND status = ? ORDER BY created_at ASC'
);
$stmt->execute([$page, 'approved']);
$rows = $stmt->fetchAll();

// Escape on output (XSS defense) and index by id.
$byId     = [];
$children = []; // parent_id (0 = root) => [child id, ...]
foreach ($rows as $r) {
    $r['author_name'] = htmlspecialchars($r['author_name'], ENT_QUOTES, 'UTF-8');
    $r['body']        = nl2br(htmlspecialchars($r['body'], ENT_QUOTES, 'UTF-8'));
    $byId[$r['id']]   = $r;
}
foreach ($byId as $r) {
    $pid = $r['parent_id'];
    if ($pid === null || !isset($byId[$pid])) {
        $pid = 0; // orphans and top-level float to root
    }
    $children[$pid][] = $r['id'];
}

/** Recursively build the nested tree. */
function build_tree(int $pid, array $byId, array $children): array
{
    $out = [];
    foreach ($children[$pid] ?? [] as $id) {
        $node = $byId[$id];
        unset($node['parent_id']);
        $node['replies'] = build_tree($id, $byId, $children);
        $out[] = $node;
    }
    return $out;
}

$tree = build_tree(0, $byId, $children);
json_out(['ok' => true, 'count' => count($rows), 'comments' => $tree]);
