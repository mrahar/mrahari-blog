<?php
declare(strict_types=1);

/**
 * Shared bootstrap: loads config, opens a PDO connection, and defines helpers.
 * Every endpoint (post/get/admin/install) requires this file first.
 */

// PHP 8 string helpers, polyfilled so the backend also runs on hosts still on PHP 7.x.
if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
}
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool
    {
        return strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}
if (!function_exists('str_ends_with')) {
    function str_ends_with(string $haystack, string $needle): bool
    {
        return $needle === '' || substr($haystack, -strlen($needle)) === $needle;
    }
}

/**
 * Debug gate: error details are shown only when ?debug=<install_token> is passed.
 * If config itself failed to load (e.g. a parse error in config.php), the token
 * can't be checked, so any ?debug value reveals the (non-sensitive) parse error.
 */
function debug_enabled(): bool
{
    if (!isset($_GET['debug'])) {
        return false;
    }
    $t = $GLOBALS['CONFIG']['install_token'] ?? null;
    if ($t) {
        return hash_equals((string)$t, (string)$_GET['debug']);
    }
    return true; // config not loaded — allow so the load error is visible
}

// Turn uncaught exceptions (e.g. DB connection failures) into clean JSON 500s
// instead of a blank white page. Full detail goes to the host error_log always.
set_exception_handler(function (Throwable $e): void {
    error_log('[comment-api] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    $detail = debug_enabled()
        ? $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine()
        : null;
    echo json_encode(['ok' => false, 'error' => 'Server error', 'detail' => $detail], JSON_UNESCAPED_UNICODE);
});

// Catch fatal/parse errors (which bypass the exception handler) on shutdown.
register_shutdown_function(function (): void {
    $err = error_get_last();
    if (!$err || !in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    error_log('[comment-api fatal] ' . $err['message'] . ' @ ' . $err['file'] . ':' . $err['line']);
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    $detail = debug_enabled()
        ? $err['message'] . ' @ ' . basename($err['file']) . ':' . $err['line']
        : null;
    echo json_encode(['ok' => false, 'error' => 'Server error (fatal)', 'detail' => $detail], JSON_UNESCAPED_UNICODE);
});

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
