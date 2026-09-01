import { storage, SUPA_URL, supaHeaders } from '../lib/storage.js';
import { escapeHtml } from '../lib/dom-utils.js';
import { PROGRAM } from '../data/program.js';

/* ============ PERFIL ============
   Foto e bio ficam no storage key-value ('profile'); a foto é redimensionada
   pra 240px e salva como dataURL — sem bucket de arquivos, sem upload extra.
   Recordes pessoais são derivados dos próprios logs de treino (maior carga
   registrada por exercício). */

const PROFILE_KEY = 'profile';

function nomesExercicios() {
  const m = {};
  Object.values(PROGRAM).forEach(bloco => {
    (bloco.exercicios || []).forEach(ex => { m[ex.id] = ex.nome; });
  });
  return m;
}

async function lerPerfil() {
  try {
    const r = await storage.get(PROFILE_KEY);
    return r && r.value ? JSON.parse(r.value) : {};
  } catch (e) { return {}; }
}
async function salvarPerfil(patch) {
  const atual = await lerPerfil();
  const novo = { ...atual, ...patch };
  await storage.set(PROFILE_KEY, JSON.stringify(novo));
  return novo;
}

export function aplicarFotoNoHeader(foto) {
  const avatarEl = document.getElementById('avatar');
  if (!avatarEl) return;
  if (foto) {
    avatarEl.style.backgroundImage = `url(${foto})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarEl.textContent = '';
  }
}

export async function initFotoHeader() {
  const p = await lerPerfil();
  if (p.foto) aplicarFotoNoHeader(p.foto);
}

function redimensionarFoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function calcularRecordes() {
  const recordes = {}; // exId -> {peso, reps, date}
  try {
    const keysResult = await storage.list('log:');
    if (!keysResult || !keysResult.keys) return [];
    for (const key of keysResult.keys) {
      try {
        const r = await storage.get(key);
        if (!r || !r.value) continue;
        const e = JSON.parse(r.value);
        if (e.type !== 'musculacao' && e.type !== 'mobilidade') continue;
        Object.entries(e.sets || {}).forEach(([exId, sets]) => {
          sets.forEach(s => {
            const w = parseFloat(s.weight);
            if (!w) return;
            if (!recordes[exId] || w > recordes[exId].peso) {
              recordes[exId] = { peso: w, reps: s.reps, date: e.date };
            }
          });
        });
      } catch (e) {}
    }
  } catch (e) {}
  const nomes = nomesExercicios();
  return Object.entries(recordes)
    .map(([exId, r]) => ({ exId, nome: nomes[exId] || exId, ...r }))
    .sort((a, b) => b.peso - a.peso);
}

async function buscarPesoAtual() {
  try {
    const keysResult = await storage.list('weight:');
    if (!keysResult || !keysResult.keys || !keysResult.keys.length) return null;
    const pesos = [];
    for (const key of keysResult.keys) {
      try {
        const r = await storage.get(key);
        if (r && r.value) pesos.push(JSON.parse(r.value));
      } catch (e) {}
    }
    pesos.sort((a, b) => a.date.localeCompare(b.date));
    return pesos.length ? pesos[pesos.length - 1] : null;
  } catch (e) { return null; }
}

async function buscarUltimaAtividadeGarmin() {
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/garmin_activities?select=activity_date,activity_type&order=activity_date.desc&limit=1`,
      { headers: supaHeaders() });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows.length ? rows[0] : null;
  } catch (e) { return null; }
}

export async function renderPerfil() {
  const root = document.getElementById('perfil-content');
  if (!root) return;
  root.innerHTML = '<div class="empty">Carregando...</div>';

  const [perfil, recordes, peso, garmin] = await Promise.all([
    lerPerfil(), calcularRecordes(), buscarPesoAtual(), buscarUltimaAtividadeGarmin()
  ]);

  const email = document.getElementById('account-email')?.textContent || '';
  const nome = perfil.nome || (email ? email.split('@')[0] : 'Atleta');
  const inicial = (nome.charAt(0) || 'A').toUpperCase();
  const fotoStyle = perfil.foto
    ? `background-image:url(${perfil.foto});background-size:cover;background-position:center;`
    : '';

  const recordesHtml = recordes.length
    ? recordes.slice(0, 8).map(r => `
        <div class="pr-row">
          <span class="pr-nome">${escapeHtml(r.nome)}</span>
          <span class="pr-valor">${r.peso}<small>kg</small></span>
        </div>`).join('')
    : '<div class="empty" style="padding:12px;">Registre treinos pra ver seus recordes aqui.</div>';

  const garminLinha = garmin
    ? `Última atividade importada: ${garmin.activity_date ? garmin.activity_date.slice(0, 10) : '—'}`
    : 'Nenhuma atividade importada ainda.';

  root.innerHTML = `
    <div class="perfil-hero">
      <div class="perfil-avatar" id="perfil-avatar" style="${fotoStyle}" role="button" aria-label="Trocar foto">
        ${perfil.foto ? '' : inicial}
        <span class="perfil-avatar-cam" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
        </span>
      </div>
      <input type="file" id="perfil-foto-input" accept="image/*" style="display:none;">
      <div class="perfil-nome" id="perfil-nome" role="button" title="Toque para editar">${escapeHtml(nome)}</div>
      <div class="perfil-email">${escapeHtml(email)}</div>
    </div>

    <div class="card">
      <h3>Bio</h3>
      <div class="stat-grid">
        <div class="stat perfil-editavel" data-campo="idade" role="button">
          <div class="n">${perfil.idade || '—'}</div><div class="l">Idade</div>
        </div>
        <div class="stat perfil-editavel" data-campo="altura" role="button">
          <div class="n">${perfil.altura ? perfil.altura + '<small style="font-size:12px;">cm</small>' : '—'}</div><div class="l">Altura</div>
        </div>
        <div class="stat">
          <div class="n">${peso ? peso.peso + '<small style="font-size:12px;">kg</small>' : '—'}</div><div class="l">Peso atual</div>
        </div>
      </div>
      <p style="font-size:11.5px;color:var(--text-faint);margin:8px 0 0;">Toque em idade ou altura pra editar. O peso vem do seu último registro na aba Hoje.</p>
    </div>

    <div class="card">
      <h3>Recordes pessoais</h3>
      <p style="font-size:12px;color:var(--text-dim);margin:0 0 10px;">Maior carga registrada por exercício, em todos os seus treinos.</p>
      ${recordesHtml}
    </div>

    <div class="card">
      <h3>Garmin</h3>
      <div class="perfil-device">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 3.5h5M9.5 20.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 9.5V12l2 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div>
          <div style="font-weight:700;font-size:14px;">Garmin Connect</div>
          <div style="font-size:12px;color:var(--text-dim);">${garminLinha}</div>
        </div>
      </div>
      <button class="secondary" style="width:100%;margin-top:12px;" onclick="ativarTabGlobal('garmin')">Importar atividade</button>
    </div>`;

  /* ---- interações ---- */
  const fotoInput = document.getElementById('perfil-foto-input');
  document.getElementById('perfil-avatar').addEventListener('click', () => fotoInput.click());
  fotoInput.addEventListener('change', async () => {
    const file = fotoInput.files && fotoInput.files[0];
    if (!file) return;
    try {
      const dataUrl = await redimensionarFoto(file);
      await salvarPerfil({ foto: dataUrl });
      aplicarFotoNoHeader(dataUrl);
      renderPerfil();
    } catch (e) { alert('Não consegui processar essa imagem.'); }
  });

  document.getElementById('perfil-nome').addEventListener('click', async () => {
    const novo = prompt('Seu nome:', nome);
    if (novo === null) return;
    await salvarPerfil({ nome: novo.trim() });
    renderPerfil();
  });

  root.querySelectorAll('.perfil-editavel').forEach(el => {
    el.addEventListener('click', async () => {
      const campo = el.dataset.campo;
      const rotulo = campo === 'idade' ? 'Sua idade:' : 'Sua altura (cm):';
      const atual = perfil[campo] || '';
      const novo = prompt(rotulo, atual);
      if (novo === null) return;
      const n = parseInt(novo);
      if (!n || n < 1) return;
      await salvarPerfil({ [campo]: n });
      renderPerfil();
    });
  });
}
