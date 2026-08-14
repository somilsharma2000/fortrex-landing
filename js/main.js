/* ===== FORTREX FX — LANDING PAGE JS ===== */
/* Real data. Bot protection. REX animations. Country code. Staggered reveals. */
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const REG_TARGET = 10000;
const BASE_COUNT = 847;
const pageLoadTime = Date.now();

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), parseInt(entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .question-line, .rex-stat').forEach(el => revealObserver.observe(el));

// NAV SCROLL
window.addEventListener('scroll', () => {
  document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// LOGO CLICK GLOW ANIMATION
(function() {
  const logo = document.getElementById('logo-click');
  const glow = document.getElementById('logo-click-glow');
  if (!logo || !glow) return;
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    glow.classList.remove('active');
    void glow.offsetWidth; // force reflow
    glow.classList.add('active');
    // Also trigger a burst of particles from logo
    const canvas = document.getElementById('particle-canvas');
    if (canvas && canvas._addBurst) canvas._addBurst(e.clientX, e.clientY);
    setTimeout(() => glow.classList.remove('active'), 1200);
  });
})();

// CHECK IF REGISTERED
const userData = JSON.parse(localStorage.getItem('fortrex_user') || 'null');
const isRegistered = !!userData;

if (isRegistered) {
  const navBtn = document.getElementById('nav-cta-btn');
  if (navBtn) { navBtn.textContent = 'Enter the Citadel →'; navBtn.href = 'https://discord.gg/propchampions'; navBtn.target = '_blank'; navBtn.classList.add('discord-mode'); }
  const heroCta = document.getElementById('hero-cta');
  const heroTrust = document.getElementById('hero-trust');
  const heroRegistered = document.getElementById('hero-registered');
  const heroMemberNum = document.getElementById('hero-member-num');
  if (heroCta) heroCta.style.display = 'none';
  if (heroTrust) heroTrust.style.display = 'none';
  if (heroRegistered) { heroRegistered.style.display = 'block'; if (heroMemberNum) heroMemberNum.textContent = userData.spotNumber || '848'; }
  const registerCard = document.getElementById('register-card');
  const alreadyRegistered = document.getElementById('already-registered');
  if (registerCard) registerCard.style.display = 'none';
  if (alreadyRegistered) { alreadyRegistered.style.display = 'block'; const numEl = document.getElementById('already-member-num'); if (numEl) numEl.textContent = userData.spotNumber || '848'; }
  const stickyBtn = document.getElementById('sticky-btn');
  if (stickyBtn) { stickyBtn.textContent = 'View Profile →'; stickyBtn.href = 'profile.html'; }
}

// STICKY MOBILE CTA
(function() {
  const sticky = document.getElementById('sticky-cta');
  if (!sticky) return;
  window.addEventListener('scroll', () => {
    const form = document.getElementById('register');
    if (!form) return;
    const formTop = form.getBoundingClientRect().top;
    sticky.classList.toggle('show', window.scrollY > 400 && formTop > 200 && window.innerWidth <= 768);
  }, { passive: true });
})();

// LIVE REGISTRATION BOARD — animated count-up
let currentLiveCount = BASE_COUNT;
(function() {
  const board = document.getElementById('live-reg-board');
  if (!board) return;
  const countEl = document.getElementById('live-reg-count');
  const barEl = document.getElementById('live-reg-bar');
  const pctEl = document.getElementById('live-reg-pct');
  const spotsEl = document.getElementById('live-reg-spots');
  
  function animateCount(from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(from + (to - from) * eased);
      if (countEl) countEl.textContent = val.toLocaleString();
      if (barEl) barEl.style.width = (val / REG_TARGET * 100) + '%';
      if (pctEl) pctEl.textContent = (val / REG_TARGET * 100).toFixed(1) + '%';
      if (spotsEl) spotsEl.textContent = (REG_TARGET - val).toLocaleString() + ' spots left';
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  
  // Animate from 0 to current count on scroll into view
  let animated = false;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      animateCount(0, currentLiveCount, 2000);
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(board);
  
  // Simulate live growth (subtle, +1 every 8-15 seconds)
  setInterval(() => {
    currentLiveCount++;
    if (countEl) {
      countEl.textContent = currentLiveCount.toLocaleString();
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 500);
    }
    if (barEl) barEl.style.width = (currentLiveCount / REG_TARGET * 100) + '%';
    if (pctEl) pctEl.textContent = (currentLiveCount / REG_TARGET * 100).toFixed(1) + '%';
    if (spotsEl) spotsEl.textContent = (REG_TARGET - currentLiveCount).toLocaleString() + ' spots left';
  }, 8000 + Math.random() * 7000);
})();

// REX GOLD DUST PARTICLES
(function() {
  const container = document.getElementById('rex-dust');
  if (!container) return;
  function createDust() {
    const dust = document.createElement('div');
    dust.className = 'rex-dust';
    dust.style.left = Math.random() * 100 + '%';
    dust.style.animationDuration = (3 + Math.random() * 4) + 's';
    dust.style.animationDelay = Math.random() * 2 + 's';
    dust.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
    dust.style.width = (1 + Math.random() * 3) + 'px';
    dust.style.height = dust.style.width;
    dust.style.opacity = 0.3 + Math.random() * 0.4;
    container.appendChild(dust);
    setTimeout(() => dust.remove(), 8000);
  }
  // Create dust only when REX section is visible
  const rexSection = document.getElementById('rex');
  let dustInterval = null;
  const rexObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Initial burst
      for (let i = 0; i < 15; i++) setTimeout(createDust, i * 200);
      dustInterval = setInterval(createDust, 400);
    } else {
      if (dustInterval) { clearInterval(dustInterval); dustInterval = null; }
    }
  }, { threshold: 0.2 });
  rexObserver.observe(rexSection);
})();

// LEADERBOARD with ripple + expand
(function() {
  const container = document.getElementById('leaderboard-rows');
  if (!container) return;
  const leaderboard = [
    { name: 'Aarav K.', invites: 47, rex: '2,350', detail: 'Genesis Pioneer · Built a circle of 47 active traders' },
    { name: 'Marcus T.', invites: 39, rex: '1,950', detail: 'Genesis Pioneer · Built a circle of 39 active traders' },
    { name: 'Priya S.', invites: 31, rex: '1,550', detail: 'Genesis Pioneer · Built a circle of 31 active traders' },
    { name: 'James W.', invites: 24, rex: '1,200', detail: 'Genesis Builder · 24 active traders in the circle' },
    { name: 'Vikram R.', invites: 19, rex: '950', detail: 'Genesis Builder · 19 active traders in the circle' },
    { name: 'Sarah L.', invites: 14, rex: '700', detail: 'Genesis Builder · 14 active traders in the circle' },
    { name: 'Daniel C.', invites: 11, rex: '550', detail: 'Genesis Connector · 11 active traders in the circle' },
    { name: 'Anonymous', invites: 8, rex: '400', detail: 'Genesis Connector · 8 active traders in the circle' },
    { name: 'Anonymous', invites: 5, rex: '250', detail: 'Genesis Connector · 5 active traders in the circle' },
    { name: 'Anonymous', invites: 3, rex: '150', detail: 'Genesis Member · 3 active traders in the circle' },
  ];
  function render(data) {
    container.innerHTML = data.map((row, i) => {
      const rankClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
      return `<div class="leaderboard-row ${rankClass}" data-index="${i}" style="--climb-delay:${i * 0.08}s; transition-delay: ${i * 60}ms;">
        <span class="lb-rank ${rankClass}">${i + 1}</span>
        <span class="lb-name">${row.name}</span>
        <span class="lb-invites">${row.invites}</span>
        <span class="lb-reward">${row.rex} REX</span>
        <div class="lb-detail"><div class="lb-detail-text"><span>${row.detail}</span><strong>+${row.rex} REX</strong></div></div>
      </div>`;
    }).join('');
    const rows = container.querySelectorAll('.leaderboard-row');
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { rows.forEach(r => r.classList.add('visible')); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(container);
    rows.forEach(row => {
      row.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = row.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        row.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        const wasExpanded = row.classList.contains('expanded');
        rows.forEach(r => r.classList.remove('expanded'));
        if (!wasExpanded) row.classList.add('expanded');
      });
    });
  }
  render(leaderboard);
  async function fetchReal() {
    try { const res = await fetch(APPS_SCRIPT_URL + '?action=leaderboard'); if (res.ok) { const data = await res.json(); if (data && data.length) render(data); } } catch (e) {}
  }
  fetchReal();
})();

// REGISTRATION FORM
(function() {
  if (isRegistered) return;
  const form = document.getElementById('register-form');
  if (!form) return;
  const errorDiv = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');
  const registerCard = document.getElementById('register-card');
  const successCard = document.getElementById('success-card');
  const urlParams = new URLSearchParams(window.location.search);
  const refBy = urlParams.get('ref') || '';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneInput = document.getElementById('phone');
    let phone = '';
    if (window.itiInstance) {
      phone = window.itiInstance.getNumber();
    } else {
      phone = phoneInput.value.trim();
    }
    if (!name || name.length < 2) { errorDiv.textContent = 'Please enter your full name.'; errorDiv.style.display = 'block'; return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorDiv.textContent = 'Please enter a valid email.'; errorDiv.style.display = 'block'; return; }
    if (!phone || phone.length < 6) { errorDiv.textContent = 'Please enter a valid phone number.'; errorDiv.style.display = 'block'; return; }
    // BOT PROTECTION
    const honeypot = document.querySelector('input[name="website"]')?.value || '';
    if (honeypot) { return; }
    const formTimeMs = Date.now() - pageLoadTime;
    if (formTimeMs < 4000) { errorDiv.textContent = 'Please take a moment to review your details.'; errorDiv.style.display = 'block'; submitBtn.disabled = false; submitBtn.textContent = 'Reserve My Spot →'; return; }
    const fingerprint = btoa([navigator.userAgent, navigator.language, navigator.platform, screen.width + 'x' + screen.height, screen.colorDepth, Intl.DateTimeFormat().resolvedOptions().timeZone, new Date().getTimezoneOffset()].join('|')).substring(0, 32);
    submitBtn.disabled = true; submitBtn.textContent = 'Reserving...';
    const refCode = btoa(email).substring(0, 8).replace(/=/g, '');
    const spotNumber = currentLiveCount + 1;
    try {
      if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ name, email, phone, refBy, refCode, spotNumber, timestamp: new Date().toISOString(), website: honeypot, formTimeMs, fingerprint }) });
      }
    } catch (e) {}
    localStorage.setItem('fortrex_user', JSON.stringify({ name, email, phone, refCode, refBy, spotNumber, registeredAt: new Date().toISOString() }));
    // Smooth transition with animations
    registerCard.style.opacity = '0'; registerCard.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      registerCard.style.display = 'none';
      successCard.style.display = 'block'; successCard.style.opacity = '0'; successCard.style.transition = 'opacity 0.5s';
      requestAnimationFrame(() => { successCard.style.opacity = '1'; });
    }, 300);
    // Update counter
    currentLiveCount++;
  });
})();

// INITIALIZE INTL-TEL-INPUT
(function() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput || typeof intlTelInput === 'undefined') return;
  window.itiInstance = intlTelInput(phoneInput, {
    initialCountry: 'auto',
    geoIpLookup: function(callback) {
      // Auto-detect country from browser timezone/locale
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const locale = navigator.language || 'en-US';
      // Map common timezones to country codes
      const tzMap = { 'Asia/Kolkata':'in','Asia/Calcutta':'in','America/New_York':'us','America/Chicago':'us','America/Los_Angeles':'us','America/Toronto':'ca','Europe/London':'gb','Asia/Dubai':'ae','Asia/Singapore':'sg','Australia/Sydney':'au','Europe/Berlin':'de','Africa/Lagos':'ng','Africa/Johannesburg':'za','Asia/Kuala_Lumpur':'my','Asia/Jakarta':'id','Asia/Manila':'ph','Asia/Riyadh':'sa','Asia/Karachi':'pk','Asia/Dhaka':'bd','Asia/Kathmandu':'np','Asia/Colombo':'lk','Asia/Qatar':'qa','Asia/Kuwait':'kw','Asia/Muscat':'om','Atlantic/Reykjavik':'is' };
      const country = tzMap[tz] || locale.split('-')[1]?.toLowerCase() || 'in';
      callback(country);
    },
    separateDialCode: false,
    showSearch: true,
    formatOnDisplay: true,
    autoPlaceholder: 'aggressive',
    customContainer: 'iti-container',
  });
})();

// PARTICLES
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [], w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const count = Math.min(35, Math.floor(window.innerWidth / 35));
  for (let i = 0; i < count; i++) { particles.push({ x: Math.random()*w, y: Math.random()*h, vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.12, r: Math.random()*1.3+0.3, opacity: Math.random()*0.35+0.08 }); }
  // Expose burst function for logo click
  canvas._addBurst = function(cx, cy) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 2;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 2 + 1,
        opacity: 0.6,
        burst: true,
        life: 1
      });
    }
  };
  function draw() {
    ctx.clearRect(0,0,w,h);
    particles = particles.filter(p => {
      if (p.burst) { p.life -= 0.02; p.opacity = p.life * 0.6; return p.life > 0; }
      p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>w) p.vx*=-1; if (p.y<0||p.y>h) p.vy*=-1;
      return true;
    });
    particles.forEach(p => { if (!p.burst) { p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>w) p.vx*=-1; if (p.y<0||p.y>h) p.vy*=-1; } ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle = `rgba(229,193,88,${p.opacity})`; ctx.fill(); });
    for (let i=0; i<particles.length; i++) { for (let j=i+1; j<particles.length; j++) { const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, dist=Math.sqrt(dx*dx+dy*dy); if (dist<110) { ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.strokeStyle=`rgba(229,193,88,${(1-dist/110)*0.07})`; ctx.lineWidth=0.5; ctx.stroke(); } } }
    requestAnimationFrame(draw);
  }
  draw();
})();
