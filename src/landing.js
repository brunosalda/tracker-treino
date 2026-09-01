import { SUPA_URL, SUPA_ANON_KEY } from './lib/storage.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-reveal: feature rows and the access card animate in once, the first
// time they cross into view, instead of firing on page load off-screen.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.access-grid, .showcase, .photo-band');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.access-grid, .showcase, .photo-band').forEach((el) => el.classList.add('is-visible'));
}

/* Parallax: cada seção fotográfica move sua camada de fundo devagar e o
   painel de vidro na direção oposta — o fundo e o cartão andam em
   velocidades diferentes, dando o descolamento físico entre os planos. */
if (!reduceMotion) {
  const layers = [];
  document.querySelectorAll('.photo-band, .access, .showcase').forEach((sec) => {
    const bg = sec.querySelector('.pband-bg');
    if (!bg) return;
    const card = sec.querySelector('.band-card, .access-inner');
    layers.push({ sec, bg, card });
  });
  if (layers.length) {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const vh = window.innerHeight;
      for (const { sec, bg, card } of layers) {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) continue;
        // -1 (seção entrando por baixo) .. +1 (saindo por cima)
        const prog = ((r.top + r.height / 2) - vh / 2) / ((vh + r.height) / 2);
        bg.style.transform = `translateY(${(-prog * 7).toFixed(2)}%)`;
        if (card) card.style.transform = `translateY(${(prog * 30).toFixed(1)}px)`;
      }
    };
    const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
}

// Hero phone: subtle cursor-driven tilt, the one signature motion moment.
const heroPhone = document.querySelector('.hero .phone-photo');
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

/* Convite: quando a landing é aberta com ?convite=1, os botões "Entrar"
   levam o parâmetro adiante — o convidado vê a página do produto primeiro e,
   ao entrar, cai direto na tela de criar a senha em vez do login. */
const conviteParam = new URLSearchParams(window.location.search).get('convite');
if (conviteParam) {
  document.querySelectorAll('a[href="/app"]').forEach((a) => {
    a.setAttribute('href', '/app?convite=' + encodeURIComponent(conviteParam));
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
