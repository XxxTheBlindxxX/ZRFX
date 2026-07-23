<?php
declare(strict_types=1);

/**
 * Loads admin/config.php (gitignored — never committed). Dies with a clear
 * message if it hasn't been created yet, rather than exposing a raw PHP
 * error about a missing file.
 */
function admin_config(): array
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/../config.php';
        if (!file_exists($path)) {
            http_response_code(500);
            die('Admin is not configured yet. Copy admin/config.example.php to admin/config.php and edit it (see the comments inside for how to generate a password hash).');
        }
        $config = require $path;
    }
    return $config;
}

function admin_start_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function admin_is_logged_in(): bool
{
    admin_start_session();
    return !empty($_SESSION['admin_logged_in']);
}

/** Call at the top of any protected page/endpoint. */
function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function admin_client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function admin_attempts_path(): string
{
    return __DIR__ . '/../data/login_attempts.json';
}

function admin_read_attempts(): array
{
    $path = admin_attempts_path();
    if (!file_exists($path)) {
        return [];
    }
    $json = file_get_contents($path);
    $data = json_decode((string) $json, true);
    return is_array($data) ? $data : [];
}

function admin_write_attempts(array $data): void
{
    $dir = dirname(admin_attempts_path());
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents(admin_attempts_path(), json_encode($data), LOCK_EX);
}

/** Locks out an IP for 5 minutes after 5 failed attempts. */
function admin_too_many_attempts(string $ip): bool
{
    $data = admin_read_attempts();
    if (!isset($data[$ip])) {
        return false;
    }
    $entry = $data[$ip];
    return $entry['count'] >= 5 && (time() - $entry['last']) < 300;
}

function admin_record_failed_attempt(string $ip): void
{
    $data = admin_read_attempts();
    $now = time();
    if (!isset($data[$ip]) || ($now - $data[$ip]['last']) > 300) {
        $data[$ip] = ['count' => 1, 'last' => $now];
    } else {
        $data[$ip]['count'] += 1;
        $data[$ip]['last'] = $now;
    }
    admin_write_attempts($data);
}

function admin_clear_attempts(string $ip): void
{
    $data = admin_read_attempts();
    if (isset($data[$ip])) {
        unset($data[$ip]);
        admin_write_attempts($data);
    }
}
