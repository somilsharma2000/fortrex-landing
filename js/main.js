/* ===== FORTREX FX — LANDING PAGE JS ===== */
/* Every function = conversion. Counter, countdown, toasts, viral share, form. */

// ===== CONFIG =====
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const REG_TARGET = 10000;
const BASE_COUNT = 847;
const LAUNCH_DAYS = 20; // Days until gates close

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .question-line').forEach(el => revealObserver.observe(el));

// ===== NAV SCROLL =====
window.addEventListener('scroll', () => {
  document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ===== STICKY MOBILE CTA =====
(function() {
  const sticky = document.getElementById('sticky-cta');
  if (!sticky) return;
  window.addEventListener('scroll', () => {
    const form = document.getElementById('register');
    if (!form) return;
    const formTop = form.getBoundingClientRect().top;
    const show = window.scrollY > 400 && formTop > 200;
    sticky.classList.toggle('show', show && window.innerWidth <= 768);
  }, { passive: true });
})();

// ===== HERO FOMO COUNTER — animates on load =====
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
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?action=count');
      if (res.ok) { const data = await res.json(); if (data && data.count) targetCount = data.count; }
    } catch (e) {}
  }

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
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
    const duration = 2200, startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutQuart(progress);
      currentLiveCount = Math.round(targetCount * eased);
      updateUI(currentLiveCount);
      if (progress < 1) requestAnimationFrame(tick);
      else { el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 500); startTrickle(); }
    }
    requestAnimationFrame(tick);
  }

  function startTrickle() {
    setInterval(() => {
      if (Math.random() > 0.5 && currentLiveCount < REG_TARGET) {
        currentLiveCount += Math.floor(Math.random() * 3) + 1;
        updateUI(currentLiveCount);
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 500);
      }
    }, 5000 + Math.random() * 10000);
  }

  fetchRealCount().then(() => setTimeout(animate, 500));
})();

// ===== COUNTDOWN TIMER =====
(function() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  const stickyTimer = document.getElementById('sticky-timer');
  if (!daysEl) return;

  // Set target: LAUNCH_DAYS from now
  const target = new Date();
  target.setDate(target.getDate() + LAUNCH_DAYS);
  target.setHours(23, 59, 59, 0);

  function update() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) { daysEl.textContent = '00'; hoursEl.textContent = '00'; minsEl.textContent = '00'; secsEl.textContent = '00'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
    if (stickyTimer) stickyTimer.textContent = `${d}d ${h}h ${m}m left`;
  }
  update();
  setInterval(update, 1000);
})();

// ===== SOCIAL PROOF TOAST NOTIFICATIONS =====
(function() {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const names = [
    { name: 'Aarav', city: 'Mumbai' }, { name: 'Marcus', city: 'London' },
    { name: 'Priya', city: 'Delhi' }, { name: 'James', city: 'New York' },
    { name: 'Vikram', city: 'Bangalore' }, { name: 'Sarah', city: 'Dubai' },
    { name: 'Daniel', city: 'Singapore' }, { name: 'Kavya', city: 'Hyderabad' },
    { name: 'Liam', city: 'Sydney' }, { name: 'Sofia', city: 'Toronto' },
    { name: 'Arjun', city: 'Pune' }, { name: 'Emma', city: 'Berlin' },
  ];

  let toastIndex = 0;
  let spotNumber = BASE_COUNT + 1;

  function showToast() {
    const person = names[toastIndex % names.length];
    toastIndex++;
    const initials = person.name.substring(0, 2).toUpperCase();
    spotNumber++;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-avatar">${initials}</div>
      <div class="toast-text">
        <strong>${person.name} from ${person.city}</strong> just secured spot #${spotNumber.toLocaleString()}
        <small>${Math.floor(Math.random() * 30) + 1} seconds ago</small>
      </div>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // First toast after 4s, then every 8-15s
  setTimeout(showToast, 4000);
  setInterval(showToast, 8000 + Math.random() * 7000);
})();

// ===== LEADERBOARD =====
(function() {
  const container = document.getElementById('leaderboard-rows');
  if (!container) return;

  const leaderboard = [
    { name: 'Aarav K.', invites: 47, rex: '2,350' },
    { name: 'Marcus T.', invites: 39, rex: '1,950' },
    { name: 'Priya S.', invites: 31, rex: '1,550' },
    { name: 'James W.', invites: 24, rex: '1,200' },
    { name: 'Vikram R.', invites: 19, rex: '950' },
    { name: 'Sarah L.', invites: 14, rex: '700' },
    { name: 'Daniel C.', invites: 11, rex: '550' },
    { name: 'Anonymous', invites: 8, rex: '400' },
    { name: 'Anonymous', invites: 5, rex: '250' },
    { name: 'Anonymous', invites: 3, rex: '150' },
  ];

  function renderLeaderboard(data) {
    container.innerHTML = data.map((row, i) => {
      const rankClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
      return `<div class="leaderboard-row ${rankClass}" style="transition-delay: ${i * 60}ms;">
        <span class="lb-rank ${rankClass}">${i + 1}</span>
        <span class="lb-name">${row.name}</span>
        <span class="lb-invites">${row.invites}</span>
        <span class="lb-reward">${row.rex} REX</span>
      </div>`;
    }).join('');

    const rows = container.querySelectorAll('.leaderboard-row');
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { rows.forEach(r => r.classList.add('visible')); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(container);
  }

  renderLeaderboard(leaderboard);

  // Show "YOUR" row if registered
  const refCode = localStorage.getItem('fortrex_user_refcode');
  if (refCode) {
    const yourRow = document.getElementById('your-row');
    if (yourRow) yourRow.style.display = 'grid';
  }
})();

// ===== REGISTRATION FORM =====
(function() {
  const form = document.getElementById('register-form');
  const formWrapper = document.getElementById('form-wrapper');
  const successDiv = document.getElementById('form-success');
  const errorDiv = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');
  const refLink = document.getElementById('ref-link');
  const copyBtn = document.getElementById('copy-btn');
  const viralBar = document.getElementById('viral-bar');
  const viralCount = document.getElementById('viral-count');
  if (!form) return;

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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorDiv.textContent = 'Please enter a valid email address.'; errorDiv.style.display = 'block'; return; }
    if (!phone || phone.length < 10) { errorDiv.textContent = 'Please enter a valid phone number.'; errorDiv.style.display = 'block'; return; }
    if (!pincode || pincode.length < 5) { errorDiv.textContent = 'Please enter a valid pincode.'; errorDiv.style.display = 'block'; return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Reserving...';

    const refCode = btoa(email).substring(0, 8).replace(/=/g, '');
    const refUrl = window.location.origin + window.location.pathname + '?ref=' + refCode;

    try {
      if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name, email, phone, pincode, refBy, refCode, timestamp: new Date().toISOString() })
        });
      }
    } catch (e) {}

    localStorage.setItem('fortrex_user_refcode', refCode);
    localStorage.setItem('fortrex_user_name', name);

    // Smooth transition
    formWrapper.style.opacity = '0';
    formWrapper.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      formWrapper.style.display = 'none';
      successDiv.style.display = 'block';
      successDiv.style.opacity = '0';
      successDiv.style.transition = 'opacity 0.5s';
      requestAnimationFrame(() => { successDiv.style.opacity = '1'; });
    }, 300);

    if (refLink) refLink.value = refUrl;

    // Setup viral share buttons
    const shareText = encodeURIComponent("I just secured my spot on FORTREX FX — something big is coming for traders. Only 10,000 spots. Reserve yours before it's gone:");
    const shareUrl = encodeURIComponent(refUrl);
    document.getElementById('share-whatsapp')?.setAttribute('href', `https://wa.me/?text=${shareText}%20${shareUrl}`);
    document.getElementById('share-telegram')?.setAttribute('href', `https://t.me/share/url?url=${shareUrl}&text=${shareText}`);
    document.getElementById('share-twitter')?.setAttribute('href', `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`);

    // Update counter
    currentLiveCount++;
    const el = document.getElementById('reg-count');
    if (el) {
      el.textContent = currentLiveCount.toLocaleString();
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 500);
    }
  });

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      refLink.select(); document.execCommand('copy');
      copyBtn.textContent = 'Copied!'; copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
    });
  }
})();

// ===== PARTICLE BACKGROUND =====
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [], w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const count = Math.min(40, Math.floor(window.innerWidth / 30));
  for (let i = 0; i < count; i++) {
    particles.push({ x: Math.random()*w, y: Math.random()*h, vx:(Math.random()-0.5)*0.15, vy:(Math.random()-0.5)*0.15, r: Math.random()*1.5+0.3, opacity: Math.random()*0.4+0.1 });
  }
  function draw() {
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>w) p.vx*=-1; if (p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(229,193,88,${p.opacity})`; ctx.fill();
    });
    for (let i=0; i<particles.length; i++) {
      for (let j=i+1; j<particles.length; j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<120) { ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle=`rgba(229,193,88,${(1-dist/120)*0.08})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
