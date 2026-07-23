// Same field/form-building logic as the local dashboard (js/admin.js), but
// content.json is loaded via fetch and saved back through save-content.php
// (server-side, behind login) instead of the File System Access API.

let state = null;

const root = document.getElementById('formRoot');
const statusEl = document.getElementById('status');
const btnSave = document.getElementById('btnSave');

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = 'admin-status' + (type ? ' ' + type : '');
}

function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setByPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  o[keys[keys.length - 1]] = value;
}

function field(label, path, isTextarea) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  const input = document.createElement(isTextarea ? 'textarea' : 'input');
  if (!isTextarea) input.type = 'text';
  else input.rows = 3;
  input.value = getByPath(state, path) ?? '';
  input.addEventListener('input', () => {
    setByPath(state, path, input.value);
    btnSave.disabled = false;
  });
  wrap.appendChild(lbl);
  wrap.appendChild(input);
  return wrap;
}

function section(title, children) {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = title;
  sec.appendChild(h2);
  children.forEach((c) => sec.appendChild(c));
  return sec;
}

function addButton(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-ghost admin-add-btn';
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function removeButton(onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-danger';
  btn.textContent = 'Remove';
  btn.addEventListener('click', onClick);
  return btn;
}

function tagsField(label, path) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const lbl = document.createElement('label');
  lbl.textContent = label + ' (comma-separated)';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = (getByPath(state, path) || []).join(', ');
  input.addEventListener('input', () => {
    setByPath(state, path, input.value.split(',').map((s) => s.trim()).filter(Boolean));
    btnSave.disabled = false;
  });
  wrap.appendChild(lbl);
  wrap.appendChild(input);
  return wrap;
}

function buildStatsSection() {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = 'About — Stats';
  sec.appendChild(h2);

  state.about.stats.forEach((stat, i) => {
    const item = document.createElement('div');
    item.className = 'repeat-item';
    const idx = document.createElement('span');
    idx.className = 'repeat-index';
    idx.textContent = `Stat ${i + 1}`;
    item.appendChild(idx);
    item.appendChild(removeButton(() => {
      state.about.stats.splice(i, 1);
      btnSave.disabled = false;
      renderForm();
    }));
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.appendChild(field('Number', `about.stats.${i}.num`));
    row.appendChild(field('Label', `about.stats.${i}.label`));
    item.appendChild(row);
    sec.appendChild(item);
  });

  sec.appendChild(addButton('+ Add stat', () => {
    state.about.stats.push({ num: '[X]+', label: 'New Stat' });
    btnSave.disabled = false;
    renderForm();
  }));
  return sec;
}

function buildWorkSection() {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Work Section';
  sec.appendChild(h2);
  sec.appendChild(field('Kicker', 'work.kicker'));
  sec.appendChild(field('Title — serif line', 'work.titleSerif'));
  sec.appendChild(field('Title — accent word', 'work.titleAccent'));
  sec.appendChild(field('Subtext', 'work.sub', true));
  sec.appendChild(tagsField('Service tags', 'work.tags'));

  state.work.items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'repeat-item';
    const idx = document.createElement('span');
    idx.className = 'repeat-index';
    idx.textContent = `Project ${i + 1}`;
    row.appendChild(idx);
    row.appendChild(removeButton(() => {
      state.work.items.splice(i, 1);
      btnSave.disabled = false;
      renderForm();
    }));
    row.appendChild(field('Title', `work.items.${i}.title`));
    row.appendChild(field('Category / Year', `work.items.${i}.category`));
    row.appendChild(field('Video path (use the Media tab to upload it)', `work.items.${i}.video`));
    sec.appendChild(row);
  });

  sec.appendChild(addButton('+ Add project', () => {
    const n = state.work.items.length + 1;
    state.work.items.push({
      title: `[ Project ${n} ]`,
      category: '[ Category / Year ]',
      video: `assets/videos/project-${n}.mp4`
    });
    btnSave.disabled = false;
    renderForm();
  }));
  return sec;
}

function buildServicesSection() {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Services Section';
  sec.appendChild(h2);
  sec.appendChild(field('Kicker', 'services.kicker'));
  sec.appendChild(field('Title — serif line', 'services.titleSerif'));
  sec.appendChild(field('Title — accent word', 'services.titleAccent'));

  const note = document.createElement('p');
  note.className = 'admin-note';
  note.textContent = 'Each service links to services/<slug>.html — those pages are static HTML, edit them directly in the services/ folder.';
  sec.appendChild(note);

  state.services.items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'repeat-item';
    const idx = document.createElement('span');
    idx.className = 'repeat-index';
    idx.textContent = `Service ${i + 1}`;
    row.appendChild(idx);
    row.appendChild(removeButton(() => {
      state.services.items.splice(i, 1);
      btnSave.disabled = false;
      renderForm();
    }));
    row.appendChild(field('Title', `services.items.${i}.title`));
    row.appendChild(field('Description', `services.items.${i}.description`, true));
    row.appendChild(field('Slug (page filename, no .html)', `services.items.${i}.slug`));
    row.appendChild(field('Background image/video path (use the Media tab to upload it)', `services.items.${i}.media`));
    sec.appendChild(row);
  });

  sec.appendChild(addButton('+ Add service', () => {
    state.services.items.push({
      title: '[ Service Name ]',
      description: '[ One-line description of the service. ]',
      slug: 'new-service',
      media: ''
    });
    btnSave.disabled = false;
    renderForm();
  }));
  return sec;
}

function buildFaqSection() {
  const sec = document.createElement('section');
  sec.className = 'admin-section';
  const h2 = document.createElement('h2');
  h2.textContent = 'FAQ Section';
  sec.appendChild(h2);
  sec.appendChild(field('Kicker', 'faq.kicker'));
  sec.appendChild(field('Title', 'faq.title'));

  state.faq.items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'repeat-item';
    const idx = document.createElement('span');
    idx.className = 'repeat-index';
    idx.textContent = `Question ${i + 1}`;
    row.appendChild(idx);
    row.appendChild(removeButton(() => {
      state.faq.items.splice(i, 1);
      btnSave.disabled = false;
      renderForm();
    }));
    row.appendChild(field('Question', `faq.items.${i}.q`));
    row.appendChild(field('Answer', `faq.items.${i}.a`, true));
    sec.appendChild(row);
  });

  sec.appendChild(addButton('+ Add question', () => {
    state.faq.items.push({ q: 'New question?', a: 'New answer.' });
    btnSave.disabled = false;
    renderForm();
  }));
  return sec;
}

function renderForm() {
  root.innerHTML = '';
  if (!state) return;

  root.appendChild(section('Hero', [
    field('Kicker (role line)', 'hero.kicker'),
    field('Title — serif line', 'hero.titleSerif'),
    field('Title — accent word', 'hero.titleAccent'),
    field('Subtext', 'hero.sub', true),
    field('CTA button text', 'hero.cta'),
    field('Background video path (use the Media tab to upload it)', 'hero.backgroundVideo'),
  ]));

  root.appendChild(section('About', [
    field('Kicker', 'about.kicker'),
    field('Title — serif line', 'about.titleSerif'),
    field('Title — accent line', 'about.titleAccent'),
    field('Bio', 'about.bio', true),
    field('CTA button text', 'about.cta'),
  ]));

  root.appendChild(buildStatsSection());
  root.appendChild(buildWorkSection());
  root.appendChild(buildServicesSection());
  root.appendChild(buildFaqSection());

  root.appendChild(section('Contact', [
    field('Kicker', 'contact.kicker'),
    field('Title', 'contact.title'),
    field('Email', 'contact.email'),
    field('Instagram URL', 'contact.instagram'),
    field('LinkedIn URL', 'contact.linkedin'),
  ]));
}

async function loadContent() {
  try {
    const res = await fetch('../content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state = await res.json();
    renderForm();
    setStatus('Loaded content.json. Edit the fields below, then click Save.', 'success');
  } catch (err) {
    setStatus('Could not load content.json: ' + err.message, 'error');
  }
}

btnSave.addEventListener('click', async () => {
  btnSave.disabled = true;
  setStatus('Saving…', '');
  try {
    const res = await fetch('save-content.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.ADMIN_CSRF || '' },
      body: JSON.stringify(state),
    });
    const data = await res.json();
    if (data.ok) {
      setStatus('Saved! Refresh the live site to see your changes.', 'success');
    } else {
      setStatus('Save failed: ' + (data.error || 'unknown error'), 'error');
      btnSave.disabled = false;
    }
  } catch (err) {
    setStatus('Save failed: ' + err.message, 'error');
    btnSave.disabled = false;
  }
});

loadContent();
