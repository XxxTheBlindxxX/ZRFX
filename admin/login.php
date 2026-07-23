<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/csrf.php';

admin_start_session();

if (admin_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';
$ip = admin_client_ip();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf'] ?? null)) {
        $error = 'Your session expired — please try again.';
    } elseif (admin_too_many_attempts($ip)) {
        $error = 'Too many failed attempts. Try again in a few minutes.';
    } else {
        $config = admin_config();
        $username = (string) ($_POST['username'] ?? '');
        $password = (string) ($_POST['password'] ?? '');
        $usernameOk = hash_equals((string) $config['username'], $username);
        $passwordOk = password_verify($password, (string) $config['password_hash']);
        if ($usernameOk && $passwordOk) {
            session_regenerate_id(true);
            $_SESSION['admin_logged_in'] = true;
            admin_clear_attempts($ip);
            header('Location: index.php');
            exit;
        }
        admin_record_failed_attempt($ip);
        $error = 'Invalid username or password.';
    }
}

$token = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login — ZILLUR</title>
<link rel="stylesheet" href="../css/admin.css">
</head>
<body class="admin-login-body">
  <form class="admin-login-form" method="post" autocomplete="off">
    <h1>ZILLUR Admin</h1>
    <?php if ($error !== ''): ?>
      <p class="admin-status error"><?= htmlspecialchars($error, ENT_QUOTES) ?></p>
    <?php endif; ?>
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES) ?>">
    <div class="field">
      <label>Username</label>
      <input type="text" name="username" required autofocus>
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" required>
    </div>
    <button type="submit" class="btn-primary">Log In</button>
  </form>
</body>
</html>
