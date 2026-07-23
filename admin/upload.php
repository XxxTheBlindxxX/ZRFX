<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/csrf.php';

admin_require_login();
header('Content-Type: application/json');

function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

if (!csrf_verify($_POST['csrf'] ?? null)) {
    respond(403, ['ok' => false, 'error' => 'Invalid session token — refresh the page and try again.']);
}

$type = (string) ($_POST['type'] ?? '');
$targetName = basename((string) ($_POST['target'] ?? ''));

$allowedExtensions = [
    'video' => ['mp4' => 'video/mp4', 'webm' => 'video/webm'],
    'image' => ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'],
];

if (!isset($allowedExtensions[$type])) {
    respond(400, ['ok' => false, 'error' => 'Invalid type — expected "video" or "image".']);
}

if ($targetName === '' || strpos($targetName, '..') !== false || strpos($targetName, '/') !== false || strpos($targetName, '\\') !== false) {
    respond(400, ['ok' => false, 'error' => 'Invalid target filename.']);
}

$ext = strtolower((string) pathinfo($targetName, PATHINFO_EXTENSION));
if (!isset($allowedExtensions[$type][$ext])) {
    $allowed = implode(', ', array_keys($allowedExtensions[$type]));
    respond(400, ['ok' => false, 'error' => "That filename's extension isn't allowed for $type uploads (allowed: $allowed)."]);
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $code = $_FILES['file']['error'] ?? 'no file received';
    respond(400, ['ok' => false, 'error' => "Upload failed (error code: $code).", ]);
}

$uploadedPath = $_FILES['file']['tmp_name'];

// Verify actual file content, not just the filename extension.
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = $finfo ? finfo_file($finfo, $uploadedPath) : false;
if ($finfo) {
    finfo_close($finfo);
}

$mimeOk = false;
if ($mime) {
    $expected = $allowedExtensions[$type][$ext];
    $mimeOk = ($mime === $expected)
        || ($type === 'image' && strpos($mime, 'image/') === 0)
        || ($type === 'video' && strpos($mime, 'video/') === 0);
}

if (!$mimeOk) {
    respond(400, ['ok' => false, 'error' => "That file doesn't look like a $type (" . ($mime ?: 'unknown type') . ')']);
}

$destDir = __DIR__ . '/../assets/' . ($type === 'video' ? 'videos' : 'images');
if (!is_dir($destDir) && !mkdir($destDir, 0755, true) && !is_dir($destDir)) {
    respond(500, ['ok' => false, 'error' => 'Could not create the destination folder.']);
}

$destPath = $destDir . '/' . $targetName;
if (!move_uploaded_file($uploadedPath, $destPath)) {
    respond(500, ['ok' => false, 'error' => 'Could not save the file — check folder permissions on the server.']);
}

respond(200, [
    'ok' => true,
    'path' => 'assets/' . ($type === 'video' ? 'videos' : 'images') . '/' . $targetName,
]);
