const DEFAULT_CONTENT = {
  hero: {
    kicker: "Video Editor · Motion & VFX Artist",
    titleSerif: "Frames into",
    titleAccent: "MOTION",
    sub: "I'm Zillur — I edit, animate, and composite visuals that make stories move. From color grading to full VFX pipelines, for commercials, music videos, and short films.",
    cta: "View Work",
    backgroundVideo: "assets/videos/hero-bg.mp4"
  },
  about: {
    kicker: "About Me",
    titleSerif: "Editing is where the story",
    titleAccent: "COMES TOGETHER",
    bio: "[ Add 2-3 sentences about your background — how you got into editing/motion/VFX, the tools you use (Premiere, After Effects, DaVinci Resolve, Blender...), and the kind of projects you love working on. ]",
    cta: "Let's Talk",
    stats: [
      { num: "[X]+", label: "Years Experience" },
      { num: "[X]+", label: "Projects Edited" },
      { num: "[X]+", label: "Happy Clients" }
    ]
  },
  work: {
    kicker: "Our Work",
    titleSerif: "Zillur",
    titleAccent: "PROJECTS",
    sub: "Every project starts with a story. Whether it's a brand film, a music video, or a short — the edit is where it either comes alive or falls flat.",
    tags: ["Commercials", "Music Videos", "Short Films", "Social Content"],
    items: [
      { title: "[ Project One ]", category: "[ Commercial / Year ]", video: "assets/videos/project-1.mp4" },
      { title: "[ Project Two ]", category: "[ Music Video / Year ]", video: "assets/videos/project-2.mp4" },
      { title: "[ Project Three ]", category: "[ Short Film / Year ]", video: "assets/videos/project-3.mp4" },
      { title: "[ Project Four ]", category: "[ VFX Breakdown / Year ]", video: "assets/videos/project-4.mp4" },
      { title: "[ Project Five ]", category: "[ Commercial / Year ]", video: "assets/videos/project-5.mp4" },
      { title: "[ Project Six ]", category: "[ Music Video / Year ]", video: "assets/videos/project-6.mp4" }
    ]
  },
  services: {
    kicker: "Services",
    titleSerif: "What I",
    titleAccent: "OFFER",
    items: [
      { title: "AI Video Generation", description: "Full AI-generated shots and scenes built from prompts, references, and storyboards.", slug: "ai-video-generation" },
      { title: "AI Video Fixes", description: "Cleaning up warping, flicker, and artifacts from AI-generated footage so it holds up.", slug: "ai-video-fixes" },
      { title: "Video Editing", description: "Cutting raw footage into a paced, structured story — from rough cut to final grade.", slug: "video-editing" },
      { title: "Screen Comp", description: "Compositing screen inserts and replacements into live-action footage.", slug: "screen-comp" },
      { title: "Keying", description: "Clean green/blue-screen keying for compositing talent into any background.", slug: "keying" },
      { title: "Cleanups", description: "Removing rigs, wires, blemishes, and unwanted objects from a shot.", slug: "cleanups" }
    ]
  },
  faq: {
    kicker: "FAQ",
    title: "Questions people usually ask.",
    items: [
      { q: "What services do you offer?", a: "Video editing, motion graphics, VFX compositing, and color grading — for commercials, music videos, short films, and social content." },
      { q: "What's your typical process and turnaround?", a: "[ Placeholder — describe your workflow (rough cut, review rounds, VFX/grade, delivery) and typical turnaround time. ]" },
      { q: "What tools and software do you use?", a: "[ Placeholder — list your NLE and VFX stack, e.g. Premiere Pro, After Effects, DaVinci Resolve, Blender. ]" },
      { q: "How do I send footage or get in touch?", a: "Reach out through the contact form below, or email me directly at zillur.zrr@gmail.com." }
    ]
  },
  contact: {
    kicker: "Contact",
    title: "Let's cut something great.",
    email: "zillur.zrr@gmail.com",
    instagram: "#",
    linkedin: "#"
  }
};

let state = null;
let fileHandle = null;

const root = document.getElementById('formRoot');
const statusEl = document.getElementById('status');
const btnSave = document.getElementById('btnSave');
const btnOpen = document.getElementById('btnOpen');
const btnReset = document.getElementById('btnReset');
const fileInput = document.getElementById('fileInput');

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
    row.appendChild(field('Video path (place the file in assets/videos/)', `work.items.${i}.video`));
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
    sec.appendChild(row);
  });

  sec.appendChild(addButton('+ Add service', () => {
    state.services.items.push({
      title: '[ Service Name ]',
      description: '[ One-line description of the service. ]',
      slug: 'new-service'
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
    field('Background video path (place the file in assets/videos/)', 'hero.backgroundVideo'),
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

function loadState(data, sourceLabel) {
  state = data;
  renderForm();
  btnSave.disabled = false;
  setStatus(`Loaded ${sourceLabel}. Edit the fields below, then click Save.`, 'success');
}

btnOpen.addEventListener('click', async () => {
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
      });
      fileHandle = handle;
      const file = await handle.getFile();
      const text = await file.text();
      loadState(JSON.parse(text), file.name);
    } catch (err) {
      if (err.name !== 'AbortError') setStatus('Could not open file: ' + err.message, 'error');
    }
  } else {
    fileInput.click();
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  fileHandle = null;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      loadState(JSON.parse(reader.result), file.name);
    } catch (err) {
      setStatus('That file is not valid JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
});

btnReset.addEventListener('click', () => {
  fileHandle = null;
  loadState(JSON.parse(JSON.stringify(DEFAULT_CONTENT)), 'built-in defaults');
});

btnSave.addEventListener('click', async () => {
  const json = JSON.stringify(state, null, 2);
  if (fileHandle) {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      setStatus(`Saved to ${fileHandle.name}. Refresh the site to see your changes.`, 'success');
      btnSave.disabled = true;
      return;
    } catch (err) {
      setStatus('Could not save directly (' + err.message + ') — downloading instead.', 'error');
    }
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus('Downloaded content.json — replace the file in your zillur-site folder with this one.', 'success');
  btnSave.disabled = true;
});
