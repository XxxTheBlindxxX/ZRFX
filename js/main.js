document.getElementById('year').textContent = new Date().getFullYear();

// ---- Loader ----
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  setTimeout(() => loader.classList.add('hidden'), 400);
});

// ---- Lenis smooth scroll ----
let lenis;
if (window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ---- Anchor links (Lenis intercepts scroll, so hash links need manual wiring) ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (id.length < 2) return;
    e.preventDefault();
    const target = document.querySelector(id);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ---- GSAP setup ----
const gsapReady = window.gsap && window.ScrollTrigger;
if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger);

  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Hero entrance (hero markup is static, so this can run immediately) —
  // only on pages that actually have a hero (not the service subpages).
  if (document.querySelector('.hero')) {
    gsap.timeline({ delay: 0.6 })
      .to('.hero-kicker', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.reveal-word', { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.hero .btn-primary', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
  }
}

// ---- Custom cursor (event delegation so it also covers dynamically rendered content) ----
const cursor = document.querySelector('.cursor-dot');
if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button')) cursor.classList.add('grow');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button')) cursor.classList.remove('grow');
  });
}

// ---- Mobile menu ----
const burger = document.querySelector('.nav-burger');
const mobileMenu = document.querySelector('.mobile-menu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    burger.classList.toggle('active');
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => mobileMenu.classList.remove('open'))
  );
}

// ---- Before/after comparison sliders (service pages) ----
// Static markup present at parse time, so this runs immediately rather than
// waiting on content:ready (which service pages never fire anyway).
function initBeforeAfterSliders() {
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    let dragging = false;

    function setFromClientX(clientX) {
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      slider.style.setProperty('--pos', pct + '%');
    }

    slider.addEventListener('pointerdown', (e) => {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
    });
    slider.addEventListener('pointermove', (e) => {
      if (dragging) setFromClientX(e.clientX);
    });
    ['pointerup', 'pointercancel'].forEach((evt) =>
      slider.addEventListener(evt, () => { dragging = false; })
    );

    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      const current = parseFloat(getComputedStyle(slider).getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft') {
        slider.style.setProperty('--pos', Math.max(0, current - 5) + '%');
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        slider.style.setProperty('--pos', Math.min(100, current + 5) + '%');
        e.preventDefault();
      }
    });
  });
}
initBeforeAfterSliders();

// ---- Hero background video ----
// Plays immediately (always in view on load). Falls back silently to the
// existing gradient background if no file has been added at that path yet.
function initHeroVideo() {
  const video = document.getElementById('heroBgVideo');
  if (!video) return;
  video.addEventListener('playing', () => video.classList.add('is-ready'));
  video.addEventListener('error', () => video.remove(), true);
  // Wait for canplay before calling play() — calling play() right after load()
  // can silently abort (and never fire 'playing', leaving it invisible forever)
  // if the browser hasn't finished resetting from the load() call yet.
  video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });
  video.load();
}

// ---- Service card background media (Services section) ----
// Optional image/video sits behind each card's text. Videos lazy-load and
// autoplay only while their card is in view; any media that 404s (or has
// no path set) removes itself, leaving the plain card look untouched.
function initServiceCardMedia() {
  const mediaEls = document.querySelectorAll('.service-bg-media');
  if (!mediaEls.length) return;

  mediaEls.forEach((el) => {
    el.addEventListener(
      'error',
      () => {
        const card = el.closest('.service-card');
        card?.classList.remove('has-media');
        card?.querySelector('.service-bg-overlay')?.remove();
        el.remove();
      },
      true
    );
  });

  const videos = Array.from(document.querySelectorAll('video.service-bg-media'));
  if (!videos.length) return;
  videos.forEach((v) => v.addEventListener('playing', () => v.classList.add('is-ready')));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (!v.dataset.loaded) {
            v.dataset.loaded = 'true';
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.25 }
  );
  videos.forEach((v) => obs.observe(v));
}

// ---- Showreel videos (Work section) ----
// Looping clips only start loading once their card is on screen, and fall back
// silently to the CSS gradient if no video file has been added yet at that path.
// Concurrent decodes are capped — several full-HD clips playing at once is a real
// CPU/GPU cost on modest hardware, so only a couple play simultaneously; the rest
// wait their turn (in view order) instead of all firing at once.
function initWorkVideos() {
  const workVideos = document.querySelectorAll('.work-video');
  if (!workVideos.length) return;

  const MAX_CONCURRENT = 2;
  const playing = new Set();
  const waiting = [];

  function tryPlayNext() {
    while (playing.size < MAX_CONCURRENT && waiting.length) {
      const video = waiting.shift();
      playing.add(video);
      video.play().catch(() => playing.delete(video));
    }
  }

  function releaseSlot(video) {
    if (playing.delete(video)) tryPlayNext();
  }

  workVideos.forEach((video) => {
    video.addEventListener('playing', () => video.classList.add('is-ready'));
    video.addEventListener('error', () => video.closest('.work-thumb')?.classList.add('video-missing'), true);
  });

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (video.classList.contains('video-modal-active')) return;
        if (entry.isIntersecting) {
          if (!video.dataset.loaded) {
            video.dataset.loaded = 'true';
            video.load();
          }
          if (!waiting.includes(video)) waiting.push(video);
          tryPlayNext();
        } else {
          video.pause();
          releaseSlot(video);
          const idx = waiting.indexOf(video);
          if (idx !== -1) waiting.splice(idx, 1);
        }
      });
    },
    { threshold: 0.25 }
  );
  workVideos.forEach((video) => videoObserver.observe(video));
}

// ---- Fullscreen video modal ----
// Clicking a Work thumbnail (or its play button) opens that clip in a
// near-fullscreen modal with sound and a custom close (X) button.
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const closeBtn = document.getElementById('videoModalClose');
  if (!modal || !modalVideo) return;
  const backdrop = modal.querySelector('.video-modal-backdrop');
  let activeThumbVideo = null;

  function openModal(thumb) {
    const video = thumb.querySelector('.work-video');
    const src = video && (video.currentSrc || video.querySelector('source')?.src);
    if (!src) return;
    activeThumbVideo = video;
    video.classList.add('video-modal-active');
    video.pause();
    modalVideo.src = src;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    if (activeThumbVideo) {
      activeThumbVideo.classList.remove('video-modal-active');
      activeThumbVideo = null;
    }
  }

  document.querySelectorAll('.work-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => openModal(thumb));
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

// ---- FAQ accordion ----
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ---- Scroll reveals for dynamically-rendered content below the hero ----
function initScrollReveals() {
  if (!gsapReady) {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }
  document.querySelectorAll('section:not(.hero) .reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });
}

// ---- Scroll-spy: highlight the nav link for whichever section is in view ----
// Matches each nav link's #fragment against a section id on this page, so it
// no-ops harmlessly on the service subpages (whose nav links point back to
// index.html#section rather than a local anchor).
function initScrollSpy() {
  const links = document.querySelectorAll('.nav-links a, .mobile-links a');
  const sections = [];
  links.forEach((a) => {
    const id = (a.getAttribute('href') || '').split('#')[1];
    const section = id && document.getElementById(id);
    if (section) sections.push(section);
  });
  if (!sections.length) return;

  function setActive(id) {
    links.forEach((a) => {
      const linkId = (a.getAttribute('href') || '').split('#')[1];
      a.classList.toggle('active', linkId === id);
    });
  }

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((section) => spy.observe(section));
}

// On index.html, Work/Services/FAQ markup is rendered by content.js, so
// everything that targets it waits for content:ready. Service subpages don't
// load content.js at all — their .work-thumb/.ba-slider markup is static from
// parse time — so run the same initializers immediately there instead of
// waiting for an event that will never fire.
function initDynamicSections() {
  initHeroVideo();
  initWorkVideos();
  initServiceCardMedia();
  initVideoModal();
  initFaqAccordion();
  initScrollReveals();
  initScrollSpy();
}
if (document.querySelector('script[src*="content.js"]')) {
  document.addEventListener('content:ready', initDynamicSections);
} else {
  initDynamicSections();
}
