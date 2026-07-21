<?php
declare(strict_types=1);

/**
 * Shared bootstrap: loads config, opens a PDO connection, and defines helpers.
 * Every endpoint (post/get/admin/install) requires this file first.
 */

// Load config: prefer real config.php (server); fall back to local test config.
$__cfg = __DIR__ . '/config.php';
if (!file_exists($__cfg)) {
    $__local = __DIR__ . '/.local/config.php';
    if (file_exists($__local)) {
        $__cfg = $__local;
    } else {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Server not configured']);
        exit;
    }
}
$CONFIG = require $__cfg;

/** Lazy singleton PDO connection. */
function db(): PDO
{
    static $pdo = null;
    global $CONFIG;
    if ($pdo !== null) {
        return $pdo;
    }
    $d = $CONFIG['db'];
    $driver = $d['driver'] ?? 'mysql';
    if ($driver === 'sqlite') {
        $pdo = new PDO('sqlite:' . $d['path']);
    } else {
        $dsn = "mysql:host={$d['host']};dbname={$d['name']};charset=" . ($d['charset'] ?? 'utf8mb4');
        $pdo = new PDO($dsn, $d['user'], $d['pass']);
    }
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    return $pdo;
}

/** Send a JSON response and stop. */
function json_out($data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/** Emit CORS headers for our own origin and short-circuit preflight requests. */
function apply_cors(): void
{
    global $CONFIG;
    $allowed = $CONFIG['site']['allowed_origin'] ?? '';
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($allowed && $origin === $allowed) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** Reject POSTs that do not originate from our own site (anti-CSRF for static sites). */
function enforce_origin(): void
{
    global $CONFIG;
    $allowed = $CONFIG['site']['allowed_origin'] ?? '';
    if (!$allowed) {
        return; // not configured (dev) — skip
    }
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $ok = ($origin === $allowed) || ($referer !== '' && str_starts_with($referer, $allowed));
    if (!$ok) {
        json_out(['ok' => false, 'error' => 'Invalid origin'], 403);
    }
}
