<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/csrf.php';

admin_require_login();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
if (!csrf_verify($csrfHeader)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Invalid session token — refresh the page and try again.']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw);
if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit;
}

$path = __DIR__ . '/../content.json';
$pretty = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($pretty === false) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Could not encode content as JSON.']);
    exit;
}

if (file_put_contents($path, $pretty, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not write content.json — check file permissions on the server.']);
    exit;
}

echo json_encode(['ok' => true]);
