<?php
/**
 * Copy this file to config.php and edit it (config.php is gitignored —
 * it never gets committed, so your real credentials never end up in the
 * public GitHub repo).
 *
 * To generate a password hash, run this once (via SSH, or temporarily
 * paste it into any .php file on the server and load it in a browser,
 * then delete that file immediately after copying the output):
 *
 *   <?php echo password_hash('your-real-password', PASSWORD_DEFAULT);
 *
 * Never store the plain password here — only the hash it prints out.
 */

return [
    'username' => 'admin',
    'password_hash' => '$2y$10$REPLACE_WITH_YOUR_OWN_HASH_FROM_password_hash()',

    // Random long string, unique per site — used to sign session/CSRF data.
    // Generate one with: php -r "echo bin2hex(random_bytes(32));"
    'secret' => 'REPLACE_WITH_A_RANDOM_64_CHAR_HEX_STRING',
];
