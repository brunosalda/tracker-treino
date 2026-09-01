import { storage, SUPA_URL, supaHeaders } from '../lib/storage.js';
import { escapeHtml } from '../lib/dom-utils.js';
import { hojeStr } from '../lib/date-utils.js';
import { METAS, ORIENTACOES } from '../data/program.js';

/* ============ HISTÓRICO ============ */
/* ============ ANÁLISE AUTOMÁTICA (IA) ============ */
function resumirEntradaParaAnalise(e) {
  let linha = `${e.date} | `;
  if (e.type === 'musculacao') {
    const sets = Object.entries(e.sets || {}).map(([exId, sets]) => {
      const label = sets.map(s => s.time !== undefined ? `${s.time}s` : `${s.weight}kg x${s.reps}(RIR${s.rir})`).join(', ');
      return `${exId}: ${label}`;
    }).join(' / ');
    linha += `Musculação ${e.treino} — ${sets}`;
  } else if (e.type === 'corrida') {
    linha += `Corrida — ${e.distancia || '?'}km em ${e.tempo || '?'}min, FC ${e.fc || '?'}, zona ${e.zona || '?'}`;
  } else if (e.type === 'mobilidade') {
    linha += `Mobilidade — ${e.duracao || '?'}min, áreas: ${e.areas || '-'}`;
  } else {
    linha += 'Descanso';
  }
  if (e.sono) linha += ` | Sono: ${e.sono}h`;
  if (e.obs) linha += ` | Obs treino: ${e.obs}`;
  return linha;
}

function resumirRefeicaoParaAnalise(m) {
  const macros = [
    m.proteina ? `${m.proteina}g prot` : null,
    m.carboidrato ? `${m.carboidrato}g carb` : null,
    m.gordura ? `${m.gordura}g gord` : null
  ].filter(Boolean).join(', ');
  return `${m.date} ${m.hora || ''} | ${m.mealId} | ${m.descricao || '-'}${macros ? ` (${macros})` : ''}${m.sensacao ? ` | ${m.sensacao}` : ''}`;
}

async function analisarSemana() {
  const resultado = document.getElementById('analise-resultado');
  resultado.innerHTML = '<p style="font-size:13px;color:var(--text-dim);margin-top:10px;">Analisando seus últimos registros...</p>';

  try {
    const keysResult = await storage.list('log:');
    if (!keysResult || !keysResult.keys || keysResult.keys.length === 0) {
      resultado.innerHTML = '<p style="font-size:13px;color:var(--text-dim);">Ainda não há registros suficientes para analisar.</p>';
      return;
    }

    const entries = [];
    for (const key of keysResult.keys) {
      try {
        const r = await storage.get(key);
        if (r && r.value) entries.push(JSON.parse(r.value));
      } catch (e) {}
    }
    entries.sort((a, b) => a.date.localeCompare(b.date));
    const recentes = entries.slice(-14);

    if (recentes.length < 3) {
      resultado.innerHTML = '<p style="font-size:13px;color:var(--text-dim);">Registre pelo menos 3 sessões antes de pedir uma análise — ainda não há dado suficiente pra dizer algo útil.</p>';
      return;
    }

    const linhas = recentes.map(resumirEntradaParaAnalise).join('\n');

    let linhasRefeicoes = '';
    try {
      const mealKeys = await storage.list('meal:');
      if (mealKeys && mealKeys.keys && mealKeys.keys.length) {
        const meals = [];
        for (const key of mealKeys.keys) {
          try {
            const r = await storage.get(key);
            if (r && r.value) meals.push(JSON.parse(r.value));
          } catch (e) {}
        }
        meals.sort((a, b) => (a.date + a.hora).localeCompare(b.date + b.hora));
        linhasRefeicoes = meals.slice(-30).map(resumirRefeicaoParaAnalise).join('\n');
      }
    } catch (e) {}

    let linhasPeso = '';
    try {
      const weightKeys = await storage.list('weight:');
      if (weightKeys && weightKeys.keys && weightKeys.keys.length) {
        const pesos = [];
        for (const key of weightKeys.keys) {
          try {
            const r = await storage.get(key);
            if (r && r.value) pesos.push(JSON.parse(r.value));
          } catch (e) {}
        }
        pesos.sort((a, b) => a.date.localeCompare(b.date));
        linhasPeso = pesos.slice(-14).map(p => `${p.date}: ${p.peso}kg`).join('\n');
      }
    } catch (e) {}

    // persona do usuário logado (perfil + metas do plano ativo — não são fixas)
    let bio = 'praticante ativo de musculação, incorporando corrida';
    try {
      const rp = await storage.get('profile');
      if (rp && rp.value) {
        const p = JSON.parse(rp.value);
        const partes = [];
        if (p.idade) partes.push(p.idade + ' anos');
        if (p.altura) partes.push(p.altura + 'cm');
        if (partes.length) bio = `praticante de ${partes.join(', ')}, ativo em musculação, incorporando corrida`;
      }
    } catch (e) {}
    const systemPrompt = `Você é um treinador de elite e nutricionista esportivo baseado em evidências científicas (2015-2026), atendendo um ${bio}, ${ORIENTACOES.analiseContexto}. Metas nutricionais: ~${METAS.kcal} kcal, ${METAS.proteina}g proteína, ${METAS.carboidrato}g carboidrato, ${METAS.gordura}g gordura. Analise os registros recentes de treino, alimentação e peso corporal abaixo e responda em português, de forma direta e prática, em no máximo 220 palavras, com: (1) padrões que você percebeu (dor recorrente, quedas de desempenho, sono baixo, refeições puladas, proteína baixa, tendência de peso muito rápida/lenta/parada, etc), (2) 2-3 sugestões concretas de ajuste (carga, volume, deload, corrida, alimentação ou calorias), (3) um alerta se algo parecer preocupante (dor persistente ou ganho/perda de peso muito rápido, por exemplo) recomendando avaliação profissional presencial. Não invente dados que não estão nos registros.`;

    const userMessage = `Registros de treino:\n${linhas}\n\nRegistros de alimentação:\n${linhasRefeicoes || '(nenhum registrado ainda)'}\n\nPeso corporal (kg):\n${linhasPeso || '(nenhum registrado ainda)'}`;

    const response = await fetch(`${SUPA_URL}/functions/v1/ai-analysis`, {
      method: 'POST',
      headers: supaHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ systemPrompt, userMessage })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      const semCreditoOuChave = (data.detail || '').includes('credit balance') || (data.error || '').includes('ANTHROPIC_API_KEY');
      if (semCreditoOuChave) {
        resultado.innerHTML = `<p style="font-size:13px;color:var(--text-dim);">Análise por IA ainda não configurada (falta crédito/chave da API na Anthropic) — o resto do app funciona normalmente sem isso.</p>`;
        return;
      }
      throw new Error(data.error || `Falha na análise (status ${response.status})`);
    }
    const texto = data.texto || 'Não foi possível obter uma análise no momento.';

    resultado.innerHTML = `
      <div class="card" style="margin-top:10px;background:#10201d;border-color:var(--accent-dim);">
        <div style="font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(texto)}</div>
      </div>`;

    // salva a análise no histórico para referência futura
    try {
      const date = hojeStr();
      await storage.set('log:' + date + ':analise:' + Date.now(), JSON.stringify({ date, type: 'analise', obs: texto }));
    } catch (e) {}

  } catch (err) {
    resultado.innerHTML = `<p style="font-size:13px;color:var(--danger);">Erro ao analisar: ${err.message}</p>`;
  }
}

function classificarGarminTipo(activityType) {
  const t = (activityType || '').toLowerCase();
  if (t.includes('strength')) return 'musculacao';
  if (t.includes('run')) return 'corrida';
  return null;
}

async function buscarGarminPorData() {
  const mapa = {};
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/garmin_activities?select=activity_type,activity_date,avg_hr,max_hr,calories,duration_text,aerobic_te`, { headers: supaHeaders() });
    if (!res.ok) return mapa;
    const rows = await res.json();
    rows.forEach(a => {
      const tipo = classificarGarminTipo(a.activity_type);
      if (!tipo || !a.activity_date) return;
      const dateStr = a.activity_date.slice(0, 10);
      mapa[dateStr + ':' + tipo] = a;
    });
  } catch (e) {}
  return mapa;
}

/* ---- Cards de atividade (bloco gradiente estilo Garmin) ---- */
const ACT_ICONS = {
  musculacao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  corrida: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="15.5" cy="4.5" r="2" fill="currentColor"/><path d="M14 8.5l-3.5 3 3 2.5-2 5M14 8.5l3 2 2.5-1M14 8.5l-1-.5-3.5 1L8 12M11.5 16.5l-3 3.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mobilidade: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2" fill="currentColor"/><path d="M12 7.5v6M12 9l-5-2.5M12 9l5-2.5M12 13.5l-3.5 6M12 13.5l3.5 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function formatarDataCurta(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d)) return dateStr;
  const s = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function calcularRitmo(tempoMin, km) {
  const t = parseFloat(tempoMin), d = parseFloat(km);
  if (!t || !d) return null;
  const paceMin = t / d;
  const m = Math.floor(paceMin);
  const s = Math.round((paceMin - m) * 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

function colHtml(valor, rotulo) {
  return `<div class="act-col"><div class="v">${valor}</div><div class="k">${rotulo}</div></div>`;
}

export async function carregarHistorico() {
  const lista = document.getElementById('lista');
  const stats = document.getElementById('stats');
  lista.innerHTML = '<div class="empty">Carregando...</div>';

  try {
    const [keysResult, garminPorData] = await Promise.all([storage.list('log:'), buscarGarminPorData()]);
    if (!keysResult || !keysResult.keys || keysResult.keys.length === 0) {
      lista.innerHTML = '<div class="empty">Nenhum registro ainda. Comece na aba "Hoje".</div>';
      stats.innerHTML = '';
      return;
    }

    const entries = [];
    for (const key of keysResult.keys) {
      try {
        const r = await storage.get(key);
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          parsed._key = key;
          entries.push(parsed);
        }
      } catch (e) {}
    }

    entries.sort((a, b) => (b.date + b._key).localeCompare(a.date + a._key));

    const countMusc = entries.filter(e => e.type === 'musculacao').length;
    const countCorrida = entries.filter(e => e.type === 'corrida').length;
    const countMob = entries.filter(e => e.type === 'mobilidade').length;
    const totalKm = entries.filter(e => e.type === 'corrida' && e.distancia)
      .reduce((s, e) => s + parseFloat(e.distancia), 0);

    stats.innerHTML = `
      <div class="stat"><div class="n">${countMusc}</div><div class="l">Musculação</div></div>
      <div class="stat"><div class="n">${countCorrida}</div><div class="l">Corridas</div></div>
      <div class="stat"><div class="n">${totalKm.toFixed(1)}</div><div class="l">km total</div></div>
      <div class="stat"><div class="n">${countMob}</div><div class="l">Mobilidade</div></div>
    `;

    let ultimaData = null;
    lista.innerHTML = entries.slice(0, 30).map(e => {
      const garmin = garminPorData[e.date + ':' + e.type];
      const dataLabel = e.date !== ultimaData
        ? `<div class="act-date-label">${formatarDataCurta(e.date)}</div>` : '';
      ultimaData = e.date;

      /* descanso e análise não viram bloco gradiente — são notas, não atividades */
      if (e.type === 'descanso' || e.type === 'analise') {
        const label = e.type === 'analise' ? 'Análise' : 'Descanso';
        const obs = e.obs ? `<div style="margin-top:4px;"><em>${escapeHtml(e.obs)}</em></div>` : '';
        return `${dataLabel}<div class="entry">
          <span class="del" onclick="apagar('${e._key}')">✕</span>
          <span class="date">${label}</span>${e.sono ? ` · Sono: ${e.sono}h` : ''}
          ${obs}
        </div>`;
      }

      let titulo = '', big = '', unidade = '', cols = [], corpo = [];

      if (e.type === 'musculacao') {
        titulo = `Musculação ${e.treino || ''}`.trim();
        const totalSets = Object.values(e.sets || {}).reduce((s, arr) => s + arr.length, 0);
        const exCount = Object.keys(e.sets || {}).length;
        if (garmin && garmin.duration_text) {
          big = garmin.duration_text; unidade = 'Duração';
          cols.push(colHtml(totalSets, 'Séries'));
          if (garmin.calories) cols.push(colHtml(garmin.calories, 'kcal'));
          if (garmin.avg_hr) cols.push(colHtml(garmin.avg_hr, 'FC méd'));
        } else {
          big = String(totalSets); unidade = 'Séries';
          cols.push(colHtml(exCount, 'Exercícios'));
        }
        const setsSummary = Object.entries(e.sets || {}).map(([exId, sets]) => {
          const label = sets.map(s => s.time !== undefined ? `${s.time}s` : `${s.weight}x${s.reps}`).join(', ');
          return `${exId}: ${label}`;
        }).join(' · ');
        if (setsSummary) corpo.push(escapeHtml(setsSummary));

      } else if (e.type === 'corrida') {
        titulo = `Corrida${e.zona ? ' · ' + escapeHtml(e.zona) : ''}`;
        big = e.distancia ? String(e.distancia) : '—'; unidade = 'km';
        if (e.tempo) cols.push(colHtml(`${e.tempo} min`, 'Tempo'));
        else if (garmin && garmin.duration_text) cols.push(colHtml(garmin.duration_text, 'Tempo'));
        const ritmo = calcularRitmo(e.tempo, e.distancia);
        if (ritmo) cols.push(colHtml(ritmo, 'Ritmo'));
        const fc = e.fc || (garmin && garmin.avg_hr);
        if (fc) cols.push(colHtml(fc, 'FC méd'));
        if (garmin && garmin.calories && cols.length < 3) cols.push(colHtml(garmin.calories, 'kcal'));

      } else if (e.type === 'mobilidade') {
        titulo = 'Mobilidade';
        big = e.duracao ? String(e.duracao) : '—'; unidade = 'min';
        if (e.areas) corpo.push(escapeHtml(e.areas));
        if (e.sets && Object.keys(e.sets).length) {
          corpo.push(Object.entries(e.sets).map(([exId, sets]) => {
            const label = sets.map(s => s.time !== undefined ? `${s.time}s` : `${s.weight}x${s.reps}`).join(', ');
            return `${exId}: ${escapeHtml(label)}`;
          }).join(' · '));
        }
      }

      if (garmin && garmin.aerobic_te) corpo.push(`Training Effect ${garmin.aerobic_te}`);
      if (e.sono) corpo.push(`Sono: ${e.sono}h`);
      if (e.obs) corpo.push(`<em>${escapeHtml(e.obs)}</em>`);

      return `${dataLabel}<div class="act-card">
        <div class="act-block">
          <div class="act-head">
            ${ACT_ICONS[e.type] || ''}
            <span>${titulo}</span>
            <span class="act-del" onclick="apagar('${e._key}')" role="button" aria-label="Apagar registro">✕</span>
          </div>
          <div class="act-metrics">
            <div class="act-big"><div class="n">${big}</div><div class="u">${unidade}</div></div>
            ${cols.join('')}
          </div>
        </div>
        ${corpo.length ? `<div class="act-body">${corpo.join('<br>')}</div>` : ''}
      </div>`;
    }).join('');

  } catch (err) {
    lista.innerHTML = '<div class="empty">Erro ao carregar histórico: ' + err.message + '</div>';
  }
}

async function apagar(key) {
  try { await storage.delete(key); carregarHistorico(); } catch (e) {}
}

window.analisarSemana = analisarSemana;
window.apagar = apagar;
