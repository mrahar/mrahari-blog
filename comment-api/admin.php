<?php
require __DIR__ . '/bootstrap.php';
session_start();

/**
 * Private admin panel: log in with the password from config.php, then
 * approve / mark-spam / delete comments. Actions are CSRF-protected.
 */

$hash = (string)($CONFIG['admin']['password_hash'] ?? '');

// --- Logout -----------------------------------------------------------------
if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: admin.php');
    exit;
}

// --- Login ------------------------------------------------------------------
$loginError = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['password'])) {
    if ($hash !== '' && password_verify((string)$_POST['password'], $hash)) {
        session_regenerate_id(true);
        $_SESSION['is_admin']   = true;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
        header('Location: admin.php');
        exit;
    }
    $loginError = 'رمز اشتباهه.';
}

$isAdmin = !empty($_SESSION['is_admin']);

// --- Actions (approve / spam / delete) --------------------------------------
if ($isAdmin && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['action'])) {
    $token = (string)($_POST['csrf'] ?? '');
    if (!hash_equals((string)($_SESSION['csrf_token'] ?? ''), $token)) {
        http_response_code(403);
        exit('CSRF check failed');
    }
    $id     = (int)($_POST['id'] ?? 0);
    $action = (string)$_POST['action'];

    // Bulk-move every comment from one page address to another. Use this after
    // renaming a note's slug so its existing comments follow to the new URL.
    if ($action === 'remap') {
        $from = trim((string)($_POST['from'] ?? ''));
        $to   = trim((string)($_POST['to'] ?? ''));
        if ($from !== '' && $to !== '' && $from !== $to) {
            $stmt = db()->prepare('UPDATE comments SET page_id = ? WHERE page_id = ?');
            $stmt->execute([$to, $from]);
            $_SESSION['flash'] = 'انتقال انجام شد: ' . $stmt->rowCount() . ' دیدگاه از «' . rawurldecode($from) . '» به «' . rawurldecode($to) . '» منتقل شد.';
        } else {
            $_SESSION['flash'] = 'آدرس مبدأ و مقصد باید پر و متفاوت باشند.';
        }
        header('Location: admin.php');
        exit;
    }

    if ($id > 0) {
        if ($action === 'approve') {
            db()->prepare('UPDATE comments SET status = ? WHERE id = ?')->execute(['approved', $id]);
        } elseif ($action === 'spam') {
            db()->prepare('UPDATE comments SET status = ? WHERE id = ?')->execute(['spam', $id]);
        } elseif ($action === 'delete') {
            db()->prepare('DELETE FROM comments WHERE id = ?')->execute([$id]);
        }
    }
    header('Location: admin.php' . (isset($_POST['filter']) ? '?filter=' . urlencode((string)$_POST['filter']) : ''));
    exit;
}

header('Content-Type: text/html; charset=utf-8');

/** Escape helper for templates. */
function e(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>پنل کامنت‌ها</title>
<style>
  :root { --blue:#2FA8E0; --bg:#f6f8fb; --card:#fff; --border:#dce7f0; --text:#0f2a43; --muted:#52708c; }
  * { box-sizing: border-box; }
  body { font-family: Vazirmatn, system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 24px; line-height: 1.7; }
  .wrap { max-width: 820px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 16px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .meta { color: var(--muted); font-size: 13px; margin-bottom: 8px; }
  .body { white-space: pre-wrap; word-break: break-word; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .badge { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
  .badge.pending { background: #fff4d6; color: #7a5b00; }
  .badge.approved { background: #d9f2e3; color: #0a6b3a; }
  .badge.spam { background: #f6dede; color: #8a1f1f; }
  button, .btn { font-family: inherit; font-size: 13px; border: 1px solid var(--border); background: #fff; color: var(--text); padding: 6px 12px; border-radius: 8px; cursor: pointer; }
  button.approve { background: var(--blue); color: #fff; border-color: var(--blue); }
  button.delete { color: #8a1f1f; }
  input[type=password] { font-family: inherit; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; width: 100%; }
  .tabs { margin-bottom: 16px; display: flex; gap: 8px; }
  .tabs a { text-decoration: none; }
  .tabs a.active { background: var(--blue); color: #fff; border-color: var(--blue); }
  .empty { color: var(--muted); padding: 24px; text-align: center; }
  form.inline { display: inline; margin: 0; }
</style>
</head>
<body>
<div class="wrap">

<?php if (!$isAdmin): ?>
  <h1>ورود به پنل کامنت‌ها</h1>
  <?php if ($loginError): ?><p style="color:#8a1f1f"><?= e($loginError) ?></p><?php endif; ?>
  <form method="post" class="card">
    <label>رمز عبور</label>
    <input type="password" name="password" autofocus required>
    <div style="margin-top:12px"><button type="submit" class="approve">ورود</button></div>
  </form>
<?php else: ?>
  <?php
    $csrf   = (string)($_SESSION['csrf_token'] ?? '');
    $filter = $_GET['filter'] ?? 'pending';
    $valid  = ['pending', 'approved', 'spam', 'all'];
    if (!in_array($filter, $valid, true)) { $filter = 'pending'; }

    if ($filter === 'all') {
        $stmt = db()->query('SELECT * FROM comments ORDER BY created_at DESC');
    } else {
        $stmt = db()->prepare('SELECT * FROM comments WHERE status = ? ORDER BY created_at DESC');
        $stmt->execute([$filter]);
    }
    $comments = $stmt->fetchAll();

    // Count pending for the tab label.
    $pendingCount = (int)db()->query("SELECT COUNT(*) FROM comments WHERE status = 'pending'")->fetchColumn();

    // Distinct page addresses, for the remap tool's source dropdown.
    $pageRows = db()->query('SELECT page_id, COUNT(*) AS n FROM comments GROUP BY page_id ORDER BY page_id')->fetchAll();

    // One-time flash message (e.g. the result of a remap).
    $flash = (string)($_SESSION['flash'] ?? '');
    unset($_SESSION['flash']);
  ?>
  <div class="row" style="justify-content:space-between">
    <h1>پنل کامنت‌ها</h1>
    <a class="btn" href="admin.php?logout=1">خروج</a>
  </div>

  <div class="tabs">
    <?php foreach (['pending' => "در انتظار ($pendingCount)", 'approved' => 'تأییدشده', 'spam' => 'اسپم', 'all' => 'همه'] as $key => $label): ?>
      <a class="btn <?= $filter === $key ? 'active' : '' ?>" href="admin.php?filter=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>

  <?php if ($flash !== ''): ?>
    <div class="card" style="border-color:var(--blue);background:#eaf6fd"><?= e($flash) ?></div>
  <?php endif; ?>

  <details class="card">
    <summary style="cursor:pointer;font-weight:700">🔗 انتقال آدرس صفحه (بعد از تغییر لینک نت)</summary>
    <p class="meta" style="margin-top:12px">اگر اسلاگِ یک نت را عوض کردی، دیدگاه‌های قدیمی به آدرسِ قبلی چسبیده‌اند. اینجا آدرسِ مبدأ را انتخاب کن و آدرسِ جدید را بنویس تا همه‌ی دیدگاه‌هایش منتقل شوند.</p>
    <form method="post" onsubmit="return confirm('همه‌ی دیدگاه‌های این آدرس منتقل بشن؟')">
      <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
      <input type="hidden" name="action" value="remap">
      <div style="margin-bottom:8px">
        <label>از (آدرسِ فعلی):</label><br>
        <select name="from" required style="font-family:inherit;padding:8px 12px;border:1px solid var(--border);border-radius:8px;width:100%;max-width:520px">
          <option value="">— انتخاب کن —</option>
          <?php foreach ($pageRows as $pr): ?>
            <option value="<?= e($pr['page_id']) ?>"><?= e(rawurldecode((string)$pr['page_id'])) ?> (<?= (int)$pr['n'] ?> دیدگاه)</option>
          <?php endforeach; ?>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <label>به (آدرسِ جدید، مثلاً <code>/growth-status</code>):</label><br>
        <input type="text" name="to" required placeholder="/new-slug" dir="ltr" style="font-family:inherit;padding:8px 12px;border:1px solid var(--border);border-radius:8px;width:100%;max-width:520px">
      </div>
      <button type="submit" class="approve">انتقال</button>
    </form>
  </details>

  <?php if (!$comments): ?>
    <div class="empty">چیزی اینجا نیست.</div>
  <?php else: foreach ($comments as $c): ?>
    <div class="card">
      <div class="meta">
        <strong><?= e($c['author_name']) ?></strong>
        <?php if (!empty($c['author_email'])): ?> · <?= e($c['author_email']) ?><?php endif; ?>
        · <?= e($c['created_at']) ?>
        · <span class="badge <?= e($c['status']) ?>"><?= e($c['status']) ?></span>
        <br>صفحه: <code><?= e($c['page_id']) ?></code>
        <?php if (!empty($c['parent_id'])): ?> · پاسخ به #<?= (int)$c['parent_id'] ?><?php endif; ?>
      </div>
      <div class="body"><?= e($c['body']) ?></div>
      <div class="row" style="margin-top:12px">
        <?php if ($c['status'] !== 'approved'): ?>
          <form class="inline" method="post">
            <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
            <input type="hidden" name="filter" value="<?= e($filter) ?>">
            <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
            <button class="approve" name="action" value="approve">تأیید</button>
          </form>
        <?php endif; ?>
        <?php if ($c['status'] !== 'spam'): ?>
          <form class="inline" method="post">
            <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
            <input type="hidden" name="filter" value="<?= e($filter) ?>">
            <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
            <button name="action" value="spam">اسپم</button>
          </form>
        <?php endif; ?>
        <form class="inline" method="post" onsubmit="return confirm('حذف بشه؟')">
          <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
          <input type="hidden" name="filter" value="<?= e($filter) ?>">
          <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
          <button class="delete" name="action" value="delete">حذف</button>
        </form>
      </div>
    </div>
  <?php endforeach; endif; ?>
<?php endif; ?>

</div>
</body>
</html>
