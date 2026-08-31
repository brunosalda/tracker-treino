import { SUPA_URL, SUPA_ANON_KEY } from './lib/storage.js';

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
