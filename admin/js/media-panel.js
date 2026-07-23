// Media library — lists current video/image assets, lets you replace them
// in place or upload a brand-new file, all through upload.php (behind login).

const mediaRoot = document.getElementById('mediaRoot');

function humanSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function uploadFile(file, type, targetName, statusEl, onDone) {
  statusEl.textContent = 'Uploading…';
  statusEl.className = 'media-row-status';
  const form = new FormData();
  form.append('file', file);
  form.append('type', type);
  form.append('target', targetName);
  form.append('csrf', window.ADMIN_CSRF || '');
  fetch('upload.php', { method: 'POST', body: form })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        statusEl.textContent = 'Uploaded ✓';
        statusEl.className = 'media-row-status success';
        if (onDone) onDone();
      } else {
        statusEl.textContent = 'Failed: ' + (data.error || 'unknown error');
        statusEl.className = 'media-row-status error';
      }
    })
    .catch((err) => {
      statusEl.textContent = 'Failed: ' + err.message;
      statusEl.className = 'media-row-status error';
    });
}

function mediaRow(f, type) {
  const row = document.createElement('div');
  row.className = 'repeat-item media-row';

  const info = document.createElement('div');
  info.className = 'media-row-info';
  const name = document.createElement('strong');
  name.textContent = f.name;
  const size = document.createElement('span');
  size.textContent = humanSize(f.size);
  info.appendChild(name);
  info.appendChild(size);
  row.appendChild(info);

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp';
  input.style.display = 'none';
  row.appendChild(input);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-ghost';
  btn.textContent = 'Replace';
  btn.addEventListener('click', () => input.click());
  row.appendChild(btn);

  const status = document.createElement('span');
  status.className = 'media-row-status';
  row.appendChild(status);

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) uploadFile(file, type, f.name, status);
  });

  return row;
}

function mediaGroup(title, files, type) {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = title;
  sec.appendChild(h2);
  if (!files.length) {
    const p = document.createElement('p');
    p.className = 'admin-note';
    p.textContent = 'No files yet.';
    sec.appendChild(p);
  }
  files.forEach((f) => sec.appendChild(mediaRow(f, type)));
  return sec;
}

function uploadNewSection() {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Add a New File';
  sec.appendChild(h2);

  const note = document.createElement('p');
  note.className = 'admin-note';
  note.textContent = 'Pick a type, type the exact filename it should be saved as (e.g. project-7.mp4), then choose the file.';
  sec.appendChild(note);

  const row = document.createElement('div');
  row.className = 'repeat-row';

  const typeSelect = document.createElement('select');
  typeSelect.innerHTML = '<option value="video">Video</option><option value="image">Image</option>';
  row.appendChild(typeSelect);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'e.g. project-7.mp4';
  row.appendChild(nameInput);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  row.appendChild(fileInput);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-ghost';
  btn.textContent = 'Upload';
  row.appendChild(btn);

  sec.appendChild(row);
  const status = document.createElement('p');
  status.className = 'media-row-status';
  sec.appendChild(status);

  btn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file || !nameInput.value.trim()) {
      status.textContent = 'Pick a file and enter a filename first.';
      status.className = 'media-row-status error';
      return;
    }
    uploadFile(file, typeSelect.value, nameInput.value.trim(), status, loadMediaList);
  });

  return sec;
}

async function loadMediaList() {
  mediaRoot.innerHTML = '<p class="admin-note">Loading…</p>';
  try {
    const res = await fetch('list-media.php', { cache: 'no-store' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'unknown error');
    mediaRoot.innerHTML = '';
    mediaRoot.appendChild(mediaGroup('Videos (assets/videos/)', data.videos, 'video'));
    mediaRoot.appendChild(mediaGroup('Images (assets/images/)', data.images, 'image'));
    mediaRoot.appendChild(uploadNewSection());
  } catch (err) {
    mediaRoot.innerHTML = '<p class="admin-note">Could not load media list: ' + err.message + '</p>';
  }
}

loadMediaList();
