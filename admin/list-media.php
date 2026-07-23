<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';

admin_require_login();
header('Content-Type: application/json');

function list_files(string $dir, array $extensions): array
{
    $out = [];
    if (!is_dir($dir)) {
        return $out;
    }
    foreach (scandir($dir) as $name) {
        if ($name === '.' || $name === '..') {
            continue;
        }
        $path = $dir . '/' . $name;
        if (!is_file($path)) {
            continue;
        }
        $ext = strtolower((string) pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, $extensions, true)) {
            continue;
        }
        $out[] = ['name' => $name, 'size' => filesize($path)];
    }
    usort($out, function ($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    return $out;
}

echo json_encode([
    'ok' => true,
    'videos' => list_files(__DIR__ . '/../assets/videos', ['mp4', 'webm']),
    'images' => list_files(__DIR__ . '/../assets/images', ['jpg', 'jpeg', 'png', 'webp']),
]);
