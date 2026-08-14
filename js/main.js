/* ===== FORTREX FX — LANDING PAGE JS ===== */
/* FOMO counter, form handling, scroll reveals, particles, leaderboard */
/* Optimized for maximum conversion — counter animates IMMEDIATELY on load */

// ===== CONFIG =====
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const REG_TARGET = 10000;
const BASE_COUNT = 847;

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

// ===== NAV SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ===== HERO FOMO COUNTER — animates on page load =====
(function() {
  const el = document.getElementById('reg-count');
  const bar = document.getElementById('reg-bar');
  const pctEl = document.getElementById('reg-pct');
  const remainingEl = document.getElementById('reg-remaining');
  const spotsLeftEl = document.getElementById('spots-left');
  if (!el) return;

  let targetCount = BASE_COUNT;
  let currentCount = 0;

  // Try to fetch real count
  async function fetchRealCount() {
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?action=count');
      if (res.ok) {
        const data = await res.json();
        if (data && data.count) targetCount = data.count;
      }
    } catch (e) { /* Use simulated */ }
  }

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animate() {
    const duration = 2200;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      currentCount = Math.round(targetCount * eased);

      el.textContent = currentCount.toLocaleString();
      const pct = (currentCount / REG_TARGET) * 100;
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct.toFixed(1) + '% claimed';
      if (remainingEl) remainingEl.textContent = (REG_TARGET - currentCount).toLocaleString() + ' spots remaining';
      if (spotsLeftEl) spotsLeftEl.textContent = (REG_TARGET - currentCount).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 500);
        startTrickle();
      }
    }
    requestAnimationFrame(tick);
  }

  function startTrickle() {
    let live = targetCount;
    setInterval(() => {
      if (Math.random() > 0.5 && live < REG_TARGET) {
        live += Math.floor(Math.random() * 3) + 1;
        el.textContent = live.toLocaleString();
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 500);
        const p = (live / REG_TARGET) * 100;
        if (bar) bar.style.width = p + '%';
        if (pctEl) pctEl.textContent = p.toFixed(1) + '% claimed';
        if (remainingEl) remainingEl.textContent = (REG_TARGET - live).toLocaleString() + ' spots remaining';
        if (spotsLeftEl) spotsLeftEl.textContent = (REG_TARGET - live).toLocaleString();
      }
    }, 6000 + Math.random() * 10000);
  }

  // Start immediately on load — FOMO from second 1
  fetchRealCount().then(() => {
    setTimeout(animate, 600); // Slight delay for counter card entrance animation
  });
})();

// ===== LEADERBOARD with staggered animation =====
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

  async function fetchLeaderboard() {
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?action=leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length) renderLeaderboard(data);
      }
    } catch (e) { /* Use simulated */ }
  }

  function renderLeaderboard(data) {
    container.innerHTML = data.map((row, i) => {
      const rankClass = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
      const top3Class = i < 3 ? 'top-3 ' + rankClass : '';
      return `
        <div class="leaderboard-row ${top3Class}" style="transition-delay: ${i * 60}ms;">
          <span class="lb-rank ${rankClass}">${i + 1}</span>
          <span class="lb-name">${row.name}</span>
          <span class="lb-invites">${row.invites}</span>
          <span class="lb-reward">${row.rex} REX</span>
        </div>`;
    }).join('');

    // Trigger staggered reveal
    const rows = container.querySelectorAll('.leaderboard-row');
    const lbObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        rows.forEach(r => r.classList.add('visible'));
        lbObserver.disconnect();
      }
    }, { threshold: 0.1 });
    lbObserver.observe(container);
  }

  renderLeaderboard(leaderboard);
  fetchLeaderboard();
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

    if (!name || name.length < 2) {
      errorDiv.textContent = 'Please enter your full name.';
      errorDiv.style.display = 'block'; return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorDiv.textContent = 'Please enter a valid email address.';
      errorDiv.style.display = 'block'; return;
    }
    if (!phone || phone.length < 10) {
      errorDiv.textContent = 'Please enter a valid phone number.';
      errorDiv.style.display = 'block'; return;
    }
    if (!pincode || pincode.length < 5) {
      errorDiv.textContent = 'Please enter a valid pincode.';
      errorDiv.style.display = 'block'; return;
    }

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
    } catch (e) { /* Don't block user */ }

    const registrations = JSON.parse(localStorage.getItem('fortrex_registrations') || '[]');
    registrations.push({ name, email, phone, pincode, refCode, refBy, timestamp: new Date().toISOString() });
    localStorage.setItem('fortrex_registrations', JSON.stringify(registrations));
    localStorage.setItem('fortrex_user_refcode', refCode);

    // Smooth transition to success
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
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      refLink.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
    });
  }
})();

// ===== PARTICLE BACKGROUND =====
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const count = Math.min(40, Math.floor(window.innerWidth / 30));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.3, opacity: Math.random() * 0.4 + 0.1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229, 193, 88, ${p.opacity})`;
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(229, 193, 88, ${(1 - dist / 120) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
