// Loads content.json and renders it into the page. Falls back to this embedded
// copy if the fetch fails (e.g. the file was opened directly as file:// without
// a server, or content.json is temporarily broken) so the site never goes blank.
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
      { title: "AI Services", description: "AI-generated shots, scene builds, and cleanup for AI footage — from prompt to final polish.", slug: "ai-services", media: "" },
      { title: "Video Edit", description: "Cutting raw footage into a paced, structured story — from assembly cut to final export.", slug: "video-edit", media: "" },
      { title: "Short Edit", description: "Fast-turnaround cuts for reels, shorts, and social — tight, punchy, built to stop the scroll.", slug: "short-edit", media: "" },
      { title: "Color Grading", description: "Mood, tone, and consistency — grading that makes footage feel intentional, not just corrected.", slug: "color-grading", media: "" },
      { title: "Screen Replace", description: "Screen inserts, replacements, and clean keying — compositing displays and talent into any shot.", slug: "screen-replace", media: "" },
      { title: "VFX", description: "Compositing, cleanups, and visual effects — removing what shouldn't be there, adding what should.", slug: "vfx", media: "" }
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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

function renderContent(content) {
  const c = content;

  // Hero
  setText('hero-kicker', c.hero.kicker);
  setText('hero-title-serif', c.hero.titleSerif);
  setText('hero-title-accent', c.hero.titleAccent);
  setText('hero-sub', c.hero.sub);
  setText('hero-cta', c.hero.cta);
  const heroVideo = document.getElementById('heroBgVideo');
  if (heroVideo && c.hero.backgroundVideo) {
    heroVideo.querySelector('source').src = c.hero.backgroundVideo;
  }

  // About
  setText('about-kicker', c.about.kicker);
  setText('about-title-serif', c.about.titleSerif);
  setText('about-title-accent', c.about.titleAccent);
  setText('about-bio', c.about.bio);
  setText('about-cta', c.about.cta);
  const statsEl = document.getElementById('about-stats');
  if (statsEl) {
    statsEl.innerHTML = c.about.stats.map((s) => `
      <div class="stat">
        <span class="stat-num">${escapeHtml(s.num)}</span>
        <span class="stat-label">${escapeHtml(s.label)}</span>
      </div>
    `).join('');
  }

  // Work
  setText('work-kicker', c.work.kicker);
  setText('work-title-serif', c.work.titleSerif);
  setText('work-title-accent', c.work.titleAccent);
  setText('work-sub', c.work.sub);
  const tagsEl = document.getElementById('work-tags');
  if (tagsEl && c.work.tags) {
    tagsEl.innerHTML = c.work.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join('<span class="tag-divider">·</span>');
  }
  const gridEl = document.getElementById('workGrid');
  if (gridEl) {
    gridEl.innerHTML = c.work.items.map((item, i) => `
      <div class="work-card reveal" data-index="${i}">
        <div class="work-thumb thumb-${(i % 4) + 1}">
          <video class="work-video" muted loop playsinline preload="none">
            <source src="${escapeHtml(item.video)}" type="video/mp4">
          </video>
          <button class="work-play-btn" aria-label="Play ${escapeHtml(item.title)} fullscreen">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="work-meta">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.category)}</p>
        </div>
      </div>
    `).join('');
  }

  // Services — each card links to its own static page in services/. An
  // optional background image/video sits behind the text (same dimmed-
  // overlay treatment as the hero), auto-detected by file extension, and
  // silently omitted if no media path is set or the file fails to load.
  setText('services-kicker', c.services.kicker);
  setText('services-title-serif', c.services.titleSerif);
  setText('services-title-accent', c.services.titleAccent);
  const servicesEl = document.getElementById('servicesGrid');
  if (servicesEl) {
    servicesEl.innerHTML = c.services.items.map((item, i) => {
      const media = item.media || '';
      const isVideo = /\.(mp4|webm)$/i.test(media);
      const isImage = /\.(jpg|jpeg|png|webp|avif)$/i.test(media);
      let bgMarkup = '';
      if (isVideo) {
        bgMarkup = `
          <video class="service-bg-media" muted loop playsinline preload="none">
            <source src="${escapeHtml(media)}" type="video/mp4">
          </video>
          <div class="service-bg-overlay"></div>
        `;
      } else if (isImage) {
        bgMarkup = `
          <img class="service-bg-media" src="${escapeHtml(media)}" alt="" loading="lazy">
          <div class="service-bg-overlay"></div>
        `;
      }
      return `
      <a href="services/${escapeHtml(item.slug)}.html" class="service-card reveal${bgMarkup ? ' has-media' : ''}">
        ${bgMarkup}
        <div class="service-card-inner">
          <span class="service-num">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="service-title">${escapeHtml(item.title)}</h3>
          <p class="service-desc">${escapeHtml(item.description)}</p>
          <span class="service-arrow" aria-hidden="true">&#8594;</span>
        </div>
      </a>
    `;
    }).join('');
  }

  // FAQ
  setText('faq-kicker', c.faq.kicker);
  setText('faq-title', c.faq.title);
  const faqEl = document.getElementById('faqList');
  if (faqEl) {
    faqEl.innerHTML = c.faq.items.map((item) => `
      <div class="faq-item reveal">
        <button class="faq-q">
          <span>${escapeHtml(item.q)}</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p>${escapeHtml(item.a)}</p></div>
      </div>
    `).join('');
  }

  // Contact
  setText('contact-kicker', c.contact.kicker);
  setText('contact-title', c.contact.title);
  setText('contact-email', c.contact.email);
  const contactIg = document.getElementById('contact-instagram');
  const contactLi = document.getElementById('contact-linkedin');
  const navIg = document.getElementById('nav-instagram');
  const navLi = document.getElementById('nav-linkedin');
  if (contactIg) contactIg.href = c.contact.instagram || '#';
  if (contactLi) contactLi.href = c.contact.linkedin || '#';
  if (navIg) navIg.href = c.contact.instagram || '#';
  if (navLi) navLi.href = c.contact.linkedin || '#';

  document.dispatchEvent(new CustomEvent('content:ready'));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

fetch('content.json', { cache: 'no-store' })
  .then((res) => (res.ok ? res.json() : Promise.reject(new Error('bad status'))))
  .then((data) => renderContent(data))
  .catch(() => renderContent(DEFAULT_CONTENT));
