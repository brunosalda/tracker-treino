import { SUPA_URL, SUPA_ANON_KEY } from './lib/storage.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-reveal: feature rows and the access card animate in once, the first
// time they cross into view, instead of firing on page load off-screen.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.feature-row, .access-grid');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.feature-row, .access-grid').forEach((el) => el.classList.add('is-visible'));
}

// Hero phone: subtle cursor-driven tilt, the one signature motion moment.
const heroPhone = document.querySelector('.hero .phone-mock');
if (heroPhone && !reduceMotion) {
  heroPhone.addEventListener('animationend', () => { heroPhone.style.animation = 'none'; }, { once: true });
  const wrap = heroPhone.parentElement;
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    heroPhone.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
  });
  wrap.addEventListener('mouseleave', () => {
    heroPhone.style.transform = '';
  });
}

// Nav gains a solid backing once content starts scrolling under it.
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const form = document.getElementById('access-form');
const status = document.getElementById('access-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('access-email').value.trim();
  if (!email) return;

  status.textContent = 'Enviando...';
  status.className = 'access-status';

  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/access_requests`, {
      method: 'POST',
      headers: {
        apikey: SUPA_ANON_KEY,
        Authorization: 'Bearer ' + SUPA_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Falha ao enviar (status ' + res.status + ')');
    status.textContent = 'Pedido enviado — avisamos por email quando liberar.';
    status.className = 'access-status ok';
    form.reset();
  } catch (err) {
    status.textContent = 'Não consegui enviar. Tenta de novo em alguns minutos.';
    status.className = 'access-status err';
  }
});
