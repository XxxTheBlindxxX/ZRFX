<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/csrf.php';

admin_require_login();
$token = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ZILLUR — Content Dashboard</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="../css/admin.css">
</head>
<body>

<header class="admin-header">
  <h1>ZILLUR<span class="dot">.</span> <span class="admin-label">Content Dashboard</span></h1>
  <div class="admin-actions">
    <button id="btnSave" class="btn btn-primary" disabled>Save</button>
    <a href="logout.php" class="btn btn-ghost">Log Out</a>
  </div>
</header>

<div class="admin-tabs">
  <button class="admin-tab-btn active" data-tab="content">Content</button>
  <button class="admin-tab-btn" data-tab="media">Media</button>
</div>

<p class="admin-status" id="status">Loading content.json&hellip;</p>

<main>
  <div id="panel-content" class="admin-form">
    <div id="formRoot"></div>
  </div>

  <div id="panel-media" class="admin-form admin-panel-hidden">
    <div id="mediaRoot"></div>
  </div>
</main>

<footer class="admin-footer">
  <p>Content changes save straight to <code>content.json</code> on the server — refresh the live site to see them. Media uploads on the <strong>Media</strong> tab go straight into <code>assets/videos/</code> or <code>assets/images/</code>, replacing the existing file if the name matches.</p>
</footer>

<script>window.ADMIN_CSRF = <?= json_encode($token) ?>;</script>
<script src="js/admin-panel.js"></script>
<script src="js/media-panel.js"></script>
<script>
  document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-content').classList.toggle('admin-panel-hidden', btn.dataset.tab !== 'content');
      document.getElementById('panel-media').classList.toggle('admin-panel-hidden', btn.dataset.tab !== 'media');
    });
  });
</script>
</body>
</html>
