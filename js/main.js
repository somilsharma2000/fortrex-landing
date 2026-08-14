/* ===== FORTREX FX — LANDING PAGE JS ===== */
/* Real data only. No fake notifications. */
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const REG_TARGET = 10000;
const BASE_COUNT = 847;

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), parseInt(entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .question-line').forEach(el => revealObserver.observe(el));

// NAV SCROLL
window.addEventListener('scroll', () => {
  document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// CHECK IF ALREADY REGISTERED
const userData = JSON.parse(localStorage.getItem('fortrex_user') || 'null');
const isRegistered = !!userData;

if (isRegistered) {
  // Nav → Discord mode
  const navBtn = document.getElementById('nav-cta-btn');
  if (navBtn) {
    navBtn.textContent = 'Enter the Citadel →';
    navBtn.href = 'https://discord.gg/propchampions';
    navBtn.target = '_blank';
    navBtn.classList.add('discord-mode');
  }
  // Hero → registered state
  const heroCta = document.getElementById('hero-cta');
  const heroTrust = document.getElementById('hero-trust');
  const heroRegistered = document.getElementById('hero-registered');
  const heroMemberNum = document.getElementById('hero-member-num');
  if (heroCta) heroCta.style.display = 'none';
  if (heroTrust) heroTrust.style.display = 'none';
  if (heroRegistered) {
    heroRegistered.style.display = 'block';
    if (heroMemberNum) heroMemberNum.textContent = userData.spotNumber || '848';
  }
  // Register section → already registered
  const registerCard = document.getElementById('register-card');
  const alreadyRegistered = document.getElementById('already-registered');
  if (registerCard) registerCard.style.display = 'none';
  if (alreadyRegistered) {
    alreadyRegistered.style.display = 'block';
    const numEl = document.getElementById('already-member-num');
    if (numEl) numEl.textContent = userData.spotNumber || '848';
  }
  // Sticky CTA → profile
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

// HERO COUNTER
let currentLiveCount = BASE_COUNT;
(function() {
  const el = document.getElementById('reg-count');
  const bar = document.getElementById('reg-bar');
  const pctEl = document.getElementById('reg-pct');
  const remainingEl = document.getElementById('reg-remaining');
  const spotsLeftEl = document.getElementById('spots-left');
  const stickySpots = document.getElementById('sticky-spots');
  if (!el) return;
  let targetCount = BASE_COUNT;
  async function fetchRealCount() {
    try { const res = await fetch(APPS_SCRIPT_URL + '?action=count'); if (res.ok) { const data = await res.json(); if (data && data.count) targetCount = data.count; } } catch (e) {}
  }
  function updateUI(count) {
    el.textContent = count.toLocaleString();
    const pct = (count / REG_TARGET) * 100;
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct.toFixed(1) + '% claimed';
    if (remainingEl) remainingEl.textContent = (REG_TARGET - count).toLocaleString() + ' spots remaining';
    if (spotsLeftEl) spotsLeftEl.textContent = (REG_TARGET - count).toLocaleString();
    if (stickySpots) stickySpots.textContent = (REG_TARGET - count).toLocaleString();
  }
  function animate() {
    const duration = 2000, startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      currentLiveCount = Math.round(targetCount * (1 - Math.pow(1 - progress, 4)));
      updateUI(currentLiveCount);
      if (progress < 1) requestAnimationFrame(tick);
      else { el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 500); }
    }
    requestAnimationFrame(tick);
  }
  fetchRealCount().then(() => setTimeout(animate, 500));
})();

// LEADERBOARD with click ripple + expand
(function() {
  const container = document.getElementById('leaderboard-rows');
  if (!container) return;
  const leaderboard = [
    { name: 'Aarav K.', invites: 47, rex: '2,350', detail: 'Joined Day 1 · 47 active traders brought' },
    { name: 'Marcus T.', invites: 39, rex: '1,950', detail: 'Joined Day 1 · 39 active traders brought' },
    { name: 'Priya S.', invites: 31, rex: '1,550', detail: 'Joined Day 2 · 31 active traders brought' },
    { name: 'James W.', invites: 24, rex: '1,200', detail: 'Joined Day 2 · 24 active traders brought' },
    { name: 'Vikram R.', invites: 19, rex: '950', detail: 'Joined Day 3 · 19 active traders brought' },
    { name: 'Sarah L.', invites: 14, rex: '700', detail: 'Joined Day 3 · 14 active traders brought' },
    { name: 'Daniel C.', invites: 11, rex: '550', detail: 'Joined Day 4 · 11 active traders brought' },
    { name: 'Anonymous', invites: 8, rex: '400', detail: 'Joined Day 4 · 8 active traders brought' },
    { name: 'Anonymous', invites: 5, rex: '250', detail: 'Joined Day 5 · 5 active traders brought' },
    { name: 'Anonymous', invites: 3, rex: '150', detail: 'Joined Day 5 · 3 active traders brought' },
  ];
  function render(data) {
    container.innerHTML = data.map((row, i) => {
      const rankClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
      return `<div class="leaderboard-row ${rankClass}" data-index="${i}" style="transition-delay: ${i * 60}ms;">
        <span class="lb-rank ${rankClass}">${i + 1}</span>
        <span class="lb-name">${row.name}</span>
        <span class="lb-invites">${row.invites}</span>
        <span class="lb-reward">${row.rex} REX</span>
        <div class="lb-detail"><div class="lb-detail-text"><span>${row.detail}</span><strong>+${row.rex} REX at launch</strong></div></div>
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
    const phone = document.getElementById('phone').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    if (!name || name.length < 2) { errorDiv.textContent = 'Please enter your full name.'; errorDiv.style.display = 'block'; return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorDiv.textContent = 'Please enter a valid email.'; errorDiv.style.display = 'block'; return; }
    if (!phone || phone.length < 10) { errorDiv.textContent = 'Please enter a valid phone number.'; errorDiv.style.display = 'block'; return; }
    if (!pincode || pincode.length < 5) { errorDiv.textContent = 'Please enter a valid pincode.'; errorDiv.style.display = 'block'; return; }
    submitBtn.disabled = true; submitBtn.textContent = 'Reserving...';
    const refCode = btoa(email).substring(0, 8).replace(/=/g, '');
    const spotNumber = currentLiveCount + 1;
    try {
      if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ name, email, phone, pincode, refBy, refCode, spotNumber, timestamp: new Date().toISOString() }) });
      }
    } catch (e) {}
    localStorage.setItem('fortrex_user', JSON.stringify({ name, email, phone, pincode, refCode, refBy, spotNumber, registeredAt: new Date().toISOString() }));
    registerCard.style.opacity = '0'; registerCard.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      registerCard.style.display = 'none';
      successCard.style.display = 'block'; successCard.style.opacity = '0'; successCard.style.transition = 'opacity 0.5s';
      requestAnimationFrame(() => { successCard.style.opacity = '1'; });
    }, 300);
    currentLiveCount++;
    const el = document.getElementById('reg-count');
    if (el) { el.textContent = currentLiveCount.toLocaleString(); el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 500); }
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
  function draw() {
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>w) p.vx*=-1; if (p.y<0||p.y>h) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle = `rgba(229,193,88,${p.opacity})`; ctx.fill(); });
    for (let i=0; i<particles.length; i++) { for (let j=i+1; j<particles.length; j++) { const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, dist=Math.sqrt(dx*dx+dy*dy); if (dist<110) { ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.strokeStyle=`rgba(229,193,88,${(1-dist/110)*0.07})`; ctx.lineWidth=0.5; ctx.stroke(); } } }
    requestAnimationFrame(draw);
  }
  draw();
})();
