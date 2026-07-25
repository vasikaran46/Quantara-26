/* =============================================
   QUANTARA '26 — Main Script (Polished v2)
   ============================================= */

'use strict';

/* ============================================
   PARTICLE BACKGROUND
   ============================================ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Reduce particles on mobile to save battery / performance
  const isMobile = window.innerWidth < 640;
  const COUNT = isMobile ? 55 : 110;

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();

  const COLORS = ['#00d4ff', '#7c3aed', '#a855f7', '#3b82f6', '#06b6d4'];

  class Dot {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -4 : H + 4);
      this.r  = Math.random() * 1.4 + 0.3;
      this.a  = Math.random() * 0.45 + 0.08;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = (Math.random() - 0.5) * 0.22;
      this.c  = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -4 || this.x > W + 4 || this.y < -4 || this.y > H + 4) this.reset(false);
    }
    draw() {
      ctx.globalAlpha = this.a;
      ctx.fillStyle   = this.c;
      ctx.shadowBlur  = 5;
      ctx.shadowColor = this.c;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const dots = Array.from({ length: COUNT }, () => new Dot());
  const CONN_DIST = isMobile ? 80 : 100;

  let raf;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0;

    // Connections
    for (let i = 0; i < dots.length - 1; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx   = dots[i].x - dots[j].x;
        const dy   = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONN_DIST) {
          ctx.globalAlpha  = (1 - dist / CONN_DIST) * 0.07;
          ctx.strokeStyle  = '#00d4ff';
          ctx.lineWidth    = 0.5;
          ctx.shadowBlur   = 0;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }

    // Dots
    dots.forEach(d => { d.update(); d.draw(); });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }
  draw();

  // Pause when tab is hidden (battery saving)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { draw(); }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });
})();

/* ============================================
   NAVBAR — SCROLL + ACTIVE LINK
   ============================================ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const links    = document.querySelectorAll('.nav-link:not(.register-btn)');
  const sections = document.querySelectorAll('section[id]');
  if (!navbar) return;

  function onScroll() {
    // Frosted glass on scroll
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Active link highlight
    let current = '';
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navH - 60) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on load
})();

/* ============================================
   MOBILE MENU
   ============================================ */
(function initMobileMenu() {
  const btn   = document.getElementById('hamburger');
  const menu  = document.getElementById('navLinks');
  if (!btn || !menu) return;

  function close() {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    // Prevent body scroll when menu open on mobile
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on backdrop tap (outside menu)
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) close();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();

/* ============================================
   SMOOTH ANCHOR SCROLL
   ============================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href   = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================ */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.event-card, .info-card, .why-item, ' +
    '.coordinator-card, .event-coord-card, ' +
    '.reg-link, .about-text, .about-cards, ' +
    '.dedomena-left, .dedomena-right, ' +
    '.section-header'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger within same parent
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains(el.classList[0]));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx * 0.07, 0.42)}s`;
  });

  // Use rAF wrapper to batch DOM reads
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      requestAnimationFrame(() => {
        entry.target.classList.add('visible');
        entry.target.style.transitionDelay = ''; // Clean up after reveal
      });
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================
   LIVE COUNTDOWN IN HERO
   ============================================ */
(function initCountdown() {
  const cdDays    = document.getElementById('cdDays');
  const cdHours   = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');
  const heroCd    = document.getElementById('heroCountdown');
  if (!heroCd || !cdDays) return;

  const EVENT_DATE = new Date('2026-08-28T09:00:00+05:30');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = EVENT_DATE - Date.now();
    if (diff <= 0) {
      heroCd.style.display = 'none';
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);

    cdDays.textContent    = pad(d);
    cdHours.textContent   = pad(h);
    cdMinutes.textContent = pad(m);
    cdSeconds.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ============================================
   CARD TILT EFFECT (desktop only)
   Subtle 3D tilt on mouse move over event cards
   ============================================ */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return; // Skip on touch devices

  document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = ((e.clientX - r.left) / r.width  - 0.5) * 2; // -1 to 1
      const y   = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      card.style.transform = `translateY(-4px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
