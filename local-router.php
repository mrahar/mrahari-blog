<?php
// Local-only dev router for `php -S`. Mimics the host's .htaccess:
// serves real files (incl. .php) directly, maps pretty URLs to .html, dirs to index.html.
$root = $_SERVER['DOCUMENT_ROOT'];
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$full = $root . $path;

// Real, non-directory file (static asset or *.php) — let the built-in server handle it.
if ($path !== '/' && file_exists($full) && !is_dir($full)) {
    return false;
}

// Directory (or root) — serve its index.html.
if (is_dir($full)) {
    $idx = rtrim($full, '/') . '/index.html';
    if (is_file($idx)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($idx);
        return true;
    }
}

// Pretty URL — map "/foo" to "foo.html".
if (is_file($full . '.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($full . '.html');
    return true;
}

http_response_code(404);
$notFound = $root . '/404.html';
if (is_file($notFound)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($notFound);
}
return true;
