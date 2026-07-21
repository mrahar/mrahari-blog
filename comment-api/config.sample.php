<?php
/**
 * Copy this file to config.php ON THE SERVER and fill in real values.
 * config.php is gitignored and must NEVER be committed (it holds DB credentials).
 *
 * To create the admin password hash, run this locally and paste the output:
 *   php -r "echo password_hash('your-strong-password', PASSWORD_DEFAULT), PHP_EOL;"
 */

return [
    'db' => [
        'driver'  => 'mysql',        // 'mysql' on the host, 'sqlite' for local tests
        'host'    => 'localhost',
        'name'    => 'YOUR_DB_NAME',  // e.g. cpaneluser_comments
        'user'    => 'YOUR_DB_USER',  // e.g. cpaneluser_comuser
        'pass'    => 'YOUR_DB_PASSWORD',
        'charset' => 'utf8mb4',
        // 'path' => __DIR__ . '/.local/comments.sqlite', // only for sqlite driver
    ],

    'admin' => [
        // password_hash() output — see comment at top of this file.
        'password_hash' => 'PASTE_PASSWORD_HASH_HERE',
    ],

    'notify' => [
        'enabled' => true,
        'to'      => 'you@example.com',
        'from'    => 'comments@yourdomain.com',
    ],

    'site' => [
        // Only requests coming from this origin are accepted (anti-CSRF for a static site).
        'allowed_origin' => 'https://blog.yourdomain.com',
        // Full URL to the admin panel, used in notification emails.
        'admin_url'      => 'https://blog.yourdomain.com/comment-api/admin.php',
    ],

    'antispam' => [
        'min_seconds'       => 3,    // time-trap: reject forms submitted faster than this
        'rate_limit_count'  => 5,    // max comments...
        'rate_limit_window' => 600,  // ...per this many seconds, per IP
        'max_body_len'      => 5000,
        'max_name_len'      => 100,
    ],

    // Protects install.php. Set to a long random string, then delete install.php after use.
    'install_token' => 'CHANGE_ME_to_a_long_random_string',
];
