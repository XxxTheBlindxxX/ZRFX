<?php
declare(strict_types=1);

/**
 * One-time setup helper — turns a plain password into the hash you paste
 * into admin/config.php. Doesn't store anything, just displays the hash.
 *
 * DELETE THIS FILE from the server once you've copied your hash out of it.
 * Leaving a password-hashing tool sitting on a live site indefinitely is
 * unnecessary exposure, even though it doesn't store or leak anything.
 */

$hash = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['password'])) {
    $hash = password_hash((string) $_POST['password'], PASSWORD_DEFAULT);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Generate Password Hash — ZILLUR Admin Setup</title>
<link rel="stylesheet" href="../css/admin.css">
</head>
<body class="admin-login-body">
  <form class="admin-login-form" method="post" autocomplete="off">
    <h1>Generate Password Hash</h1>
    <p class="admin-status error">Delete this file from the server once you've copied your hash below into admin/config.php — don't leave a password tool sitting on a live site.</p>
    <div class="field">
      <label>Your new admin password</label>
      <input type="text" name="password" required autofocus>
    </div>
    <button type="submit" class="btn-primary">Generate Hash</button>
    <?php if ($hash !== ''): ?>
      <div class="field" style="margin-top: 20px;">
        <label>Paste this into config.php as "password_hash"</label>
        <textarea rows="3" readonly onclick="this.select()"><?= htmlspecialchars($hash, ENT_QUOTES) ?></textarea>
      </div>
    <?php endif; ?>
  </form>
</body>
</html>
