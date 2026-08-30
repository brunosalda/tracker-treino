import { storage, SUPA_URL, supaHeaders } from '../lib/storage.js';
import { escapeHtml } from '../lib/dom-utils.js';
import { hojeStr } from '../lib/date-utils.js';

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

    const systemPrompt = `Você é um treinador de elite e nutricionista esportivo baseado em evidências científicas (2015-2026), atendendo um homem de 41 anos, 85kg, 176cm, ativo em musculação, incorporando corrida, com prioridades nesta ordem: cardio, mobilidade/alongamento de MMII, força, manutenção/aumento de massa muscular. Metas nutricionais: ~3050 kcal, 170g proteína, 490g carboidrato, 85g gordura (leve superávit para ganho de massa). Analise os registros recentes de treino, alimentação e peso corporal abaixo e responda em português, de forma direta e prática, em no máximo 220 palavras, com: (1) padrões que você percebeu (dor recorrente, quedas de desempenho, sono baixo, refeições puladas, proteína baixa, tendência de peso muito rápida/lenta/parada, etc), (2) 2-3 sugestões concretas de ajuste (carga, volume, deload, corrida, alimentação ou calorias), (3) um alerta se algo parecer preocupante (dor persistente ou ganho/perda de peso muito rápido, por exemplo) recomendando avaliação profissional presencial. Não invente dados que não estão nos registros.`;

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

export async function carregarHistorico() {
  const lista = document.getElementById('lista');
  const stats = document.getElementById('stats');
  lista.innerHTML = '<div class="empty">Carregando...</div>';

  try {
    const keysResult = await storage.list('log:');
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

    lista.innerHTML = entries.slice(0, 30).map(e => {
      const typeClass = { musculacao: 'type-musc', corrida: 'type-corrida', mobilidade: 'type-mob', descanso: 'type-desc', analise: 'type-mob' }[e.type] || '';
      const typeLabel = { musculacao: 'Musculação', corrida: 'Corrida', mobilidade: 'Mobilidade', descanso: 'Descanso', analise: '🧠 Análise' }[e.type] || e.type;
      let detail = '';
      if (e.type === 'musculacao') {
        const setsSummary = Object.entries(e.sets || {}).map(([exId, sets]) => {
          const label = sets.map(s => s.time !== undefined ? `${s.time}s` : `${s.weight}x${s.reps}`).join(', ');
          return `${exId}: ${label}`;
        }).join(' · ');
        detail = `Treino ${e.treino || '-'}<br>${escapeHtml(setsSummary)}`;
      } else if (e.type === 'corrida') {
        detail = `${e.distancia ? e.distancia + ' km' : ''}${e.tempo ? ' · ' + e.tempo + ' min' : ''}${e.fc ? ' · FC ' + e.fc : ''}${e.zona ? ' · ' + e.zona : ''}`;
      } else if (e.type === 'mobilidade') {
        let setsSummary = '';
        if (e.sets && Object.keys(e.sets).length) {
          setsSummary = '<br>' + Object.entries(e.sets).map(([exId, sets]) => {
            const label = sets.map(s => s.time !== undefined ? `${s.time}s` : `${s.weight}x${s.reps}`).join(', ');
            return `${exId}: ${escapeHtml(label)}`;
          }).join(' · ');
        }
        detail = `${e.duracao ? e.duracao + ' min' : ''}${e.areas ? ' · ' + escapeHtml(e.areas) : ''}${setsSummary}`;
      }
      const sono = e.sono ? ` · Sono: ${e.sono}h` : '';
      const obs = e.obs ? `<br><em>${escapeHtml(e.obs)}</em>` : '';
      return `<div class="entry">
        <span class="del" onclick="apagar('${e._key}')">✕</span>
        <span class="date">${e.date}</span><span class="type ${typeClass}">${typeLabel}</span>
        <div style="margin-top:6px;">${detail}${sono}${obs}</div>
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
