import { FOODS, MEALS } from '../data/nutrition-data.js';
import { storage } from '../lib/storage.js';
import { hojeStr } from '../lib/date-utils.js';
import { escapeHtml } from '../lib/dom-utils.js';
import { SVG_ACCENT, SVG_DIM } from '../lib/svg-helpers.js';

export function populateFoodSelect(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = FOODS.map((f, i) => `<option value="${i}">${f.nome}</option>`).join('');
}

export function calcularPorProteina() {
  const idx = document.getElementById('calc-food-select').value;
  const alvoProteina = parseFloat(document.getElementById('calc-prot-alvo').value);
  const resultado = document.getElementById('calc-resultado');
  if (isNaN(alvoProteina) || alvoProteina <= 0) {
    resultado.innerHTML = '<p style="color:var(--danger);font-size:13px;">Digite uma meta de proteína válida.</p>';
    return;
  }
  const food = FOODS[idx];
  if (food.prot === 0) {
    resultado.innerHTML = '<p style="color:var(--danger);font-size:13px;">Esse alimento não tem proteína — escolha outro pra essa conta.</p>';
    return;
  }
  const quantidade = (alvoProteina / food.prot) * food.base;
  const fator = quantidade / food.base;
  const kcal = food.kcal * fator;
  const carb = food.carb * fator;
  const gord = food.gord * fator;
  const qtdUnidade = (food.unidade === 'g' || food.unidade === 'ml')
    ? `${quantidade.toFixed(0)}${food.unidade}`
    : `${quantidade.toFixed(1)} ${food.unidade}${quantidade >= 2 ? 's' : ''}`;
  resultado.innerHTML = `
    <div class="suggestion" style="margin-top:10px;">
      <strong>${qtdUnidade}</strong> de ${food.nome} fornece aproximadamente: <strong>${alvoProteina.toFixed(0)}g proteína</strong> · ${kcal.toFixed(0)}kcal · ${carb.toFixed(1)}g carb · ${gord.toFixed(1)}g gordura
    </div>`;
}

export function calcularPorQuantidade() {
  const idx = document.getElementById('calc-food-select-2').value;
  const qtd = parseFloat(document.getElementById('calc-qtd').value);
  const resultado = document.getElementById('calc-resultado-2');
  if (isNaN(qtd) || qtd <= 0) {
    resultado.innerHTML = '<p style="color:var(--danger);font-size:13px;">Digite uma quantidade válida.</p>';
    return;
  }
  const food = FOODS[idx];
  const fator = qtd / food.base;
  resultado.innerHTML = `
    <div class="suggestion" style="margin-top:10px;">
      <strong>${qtd}${food.unidade === 'g' || food.unidade === 'ml' ? food.unidade : ' ' + food.unidade + (qtd >= 2 ? 's' : '')}</strong> de ${food.nome}<br>
      fornece: <strong>${(food.kcal * fator).toFixed(0)}kcal</strong> · ${(food.prot * fator).toFixed(1)}g proteína · ${(food.carb * fator).toFixed(1)}g carb · ${(food.gord * fator).toFixed(1)}g gordura
    </div>`;
}

/* ============ PESO CORPORAL ============ */
export async function salvarPeso() {
  const status = document.getElementById('peso-status');
  const data = document.getElementById('peso-data').value || hojeStr();
  const valor = parseFloat(document.getElementById('peso-valor').value);
  if (!valor || valor <= 0) {
    status.textContent = 'Digite um peso válido.';
    status.style.color = 'var(--danger)';
    return;
  }
  try {
    await storage.set('weight:' + data, JSON.stringify({ date: data, peso: valor }));
    status.textContent = '✓ Peso registrado.';
    status.style.color = 'var(--accent)';
    document.getElementById('peso-valor').value = '';
    renderPesoChart();
  } catch (e) {
    status.textContent = 'Erro: ' + e.message;
    status.style.color = 'var(--danger)';
  }
}

export async function renderPesoChart() {
  const area = document.getElementById('peso-chart-area');
  try {
    const keysResult = await storage.list('weight:');
    if (!keysResult || !keysResult.keys || keysResult.keys.length === 0) {
      area.innerHTML = '<div class="empty" style="padding:10px;">Nenhuma pesagem registrada ainda.</div>';
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

    // tendência: média dos últimos 7 vs média dos 7 anteriores
    let tendenciaHtml = '';
    if (entries.length >= 4) {
      const ultimos7 = entries.slice(-7);
      const anteriores7 = entries.slice(-14, -7);
      const media = arr => arr.reduce((s, e) => s + e.peso, 0) / arr.length;
      const mediaUltimos = media(ultimos7);
      if (anteriores7.length >= 2) {
        const mediaAnteriores = media(anteriores7);
        const delta = mediaUltimos - mediaAnteriores;
        const sinal = delta > 0 ? '+' : '';
        const cor = delta > 0 ? '#7fe8a0' : (delta < 0 ? '#f08b8b' : SVG_DIM);
        tendenciaHtml = `<div class="suggestion" style="color:${cor};border-color:${cor};">Tendência: ${sinal}${delta.toFixed(2)}kg (média últimos ${ultimos7.length} vs ${anteriores7.length} anteriores)</div>`;
      } else {
        tendenciaHtml = `<div class="suggestion">Média recente: ${mediaUltimos.toFixed(1)}kg. Registre mais algumas semanas pra ver a tendência.</div>`;
      }
    }

    // mini gráfico SVG
    let chartHtml = '';
    if (recentes.length >= 2) {
      const pesos = recentes.map(e => e.peso);
      const min = Math.min(...pesos), max = Math.max(...pesos);
      const range = (max - min) || 1;
      const w = 300, h = 100, pad = 10;
      const stepX = (w - pad * 2) / (recentes.length - 1);
      const points = recentes.map((e, i) => {
        const x = pad + i * stepX;
        const y = h - pad - ((e.peso - min) / range) * (h - pad * 2);
        return [x, y];
      });
      const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
      const dots = points.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${SVG_ACCENT}"/>`).join('');
      chartHtml = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto;background:#0d0f14;border-radius:10px;">
        <path d="${pathD}" fill="none" stroke="${SVG_ACCENT}" stroke-width="2"/>
        ${dots}
        <text x="${pad}" y="${h - 2}" fill="${SVG_DIM}" font-size="9">${recentes[0].date.slice(5)}</text>
        <text x="${w - pad - 30}" y="${h - 2}" fill="${SVG_DIM}" font-size="9">${recentes[recentes.length - 1].date.slice(5)}</text>
      </svg>`;
    }

    const listaHtml = recentes.slice().reverse().map((e, idx, arr) => {
      const anterior = arr[idx + 1];
      let delta = '';
      if (anterior) {
        const d = e.peso - anterior.peso;
        delta = d === 0 ? ' (=)' : (d > 0 ? ` (+${d.toFixed(1)})` : ` (${d.toFixed(1)})`);
      }
      return `<span class="chip">${e.date.slice(5)}: ${e.peso}kg${delta}</span>`;
    }).join('');

    area.innerHTML = chartHtml + tendenciaHtml + `<div class="set-log" style="margin-top:8px;">${listaHtml}</div>`;
  } catch (e) {
    area.innerHTML = `<div class="empty">Erro ao carregar peso: ${e.message}</div>`;
  }
}

export async function renderAlimentacao() {
  const date = hojeStr();
  const area = document.getElementById('refeicoes-area');
  area.innerHTML = '<div class="empty">Carregando refeições...</div>';

  const META_KCAL = 3050, META_PROT = 170, META_CARB = 490, META_GORD = 85;

  const registros = {};
  for (const meal of MEALS) {
    try {
      const r = await storage.get('meal:' + date + ':' + meal.id);
      if (r && r.value) registros[meal.id] = JSON.parse(r.value);
    } catch (e) {}
  }

  let totalProteina = 0, totalCarb = 0, totalGordura = 0, feitas = 0;
  Object.values(registros).forEach(r => {
    totalProteina += parseFloat(r.proteina) || 0;
    totalCarb += parseFloat(r.carboidrato) || 0;
    totalGordura += parseFloat(r.gordura) || 0;
    feitas++;
  });
  const kcalEstimado = totalProteina * 4 + totalCarb * 4 + totalGordura * 9;

  document.getElementById('alimentacao-progresso').innerHTML = `
    <div class="stat"><div class="n">${feitas}/${MEALS.length}</div><div class="l">Refeições</div></div>
    <div class="stat"><div class="n">${totalProteina.toFixed(0)}g</div><div class="l">Proteína</div></div>
    <div class="stat"><div class="n">${totalCarb.toFixed(0)}g</div><div class="l">Carboidrato</div></div>
    <div class="stat"><div class="n">${totalGordura.toFixed(0)}g</div><div class="l">Gordura</div></div>
    <div class="stat"><div class="n">~${kcalEstimado.toFixed(0)}</div><div class="l">kcal estimado</div></div>
  `;

  const faltaKcal = Math.max(0, META_KCAL - kcalEstimado);
  const faltaProt = Math.max(0, META_PROT - totalProteina);
  const faltaCarb = Math.max(0, META_CARB - totalCarb);
  const faltaGord = Math.max(0, META_GORD - totalGordura);

  document.getElementById('alimentacao-faltando').innerHTML = `
    <div class="stat"><div class="n">${faltaKcal.toFixed(0)}</div><div class="l">kcal</div></div>
    <div class="stat"><div class="n">${faltaProt.toFixed(0)}g</div><div class="l">Proteína</div></div>
    <div class="stat"><div class="n">${faltaCarb.toFixed(0)}g</div><div class="l">Carboidrato</div></div>
    <div class="stat"><div class="n">${faltaGord.toFixed(0)}g</div><div class="l">Gordura</div></div>
  `;

  area.innerHTML = MEALS.map(meal => renderRefeicaoCard(meal, registros[meal.id])).join('');
}

export function renderRefeicaoCard(meal, registro) {
  const dica = meal.dica ? `<p style="font-size:12px;color:var(--text-dim);margin-top:6px;">${meal.dica}</p>` : '';
  if (registro) {
    return `
      <div class="card exercise-card done" id="meal-card-${meal.id}">
        <div class="ex-title">
          <div>
            <div class="name">✓ ${meal.nome}</div>
            <div class="meta">Meta: ~${meal.metaProteina}g proteína · registrado às ${registro.hora || '-'}</div>
          </div>
        </div>
        <div class="set-log" style="margin-top:6px;">
          <span class="chip">${registro.proteina ? registro.proteina + 'g proteína' : 'sem estimativa'}</span>
          ${registro.carboidrato ? `<span class="chip">${registro.carboidrato}g carbo</span>` : ''}
          ${registro.gordura ? `<span class="chip">${registro.gordura}g gordura</span>` : ''}
          ${registro.sensacao ? `<span class="chip">${registro.sensacao}</span>` : ''}
        </div>
        <div style="font-size:13px;color:var(--text-dim);margin-top:6px;">${escapeHtml(registro.descricao || '')}</div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="secondary" style="flex:1;" onclick="abrirInputRefeicao('${meal.id}', true)">Editar</button>
          <button class="secondary" style="flex:1;color:var(--danger);" onclick="apagarRefeicao('${meal.id}')">Apagar</button>
        </div>
      </div>`;
  }
  return `
    <div class="card exercise-card" id="meal-card-${meal.id}">
      <div class="ex-title">
        <div>
          <div class="name">${meal.nome}${meal.opcional ? ' (opcional)' : ''}</div>
          <div class="meta">Meta: ~${meal.metaProteina}g proteína</div>
        </div>
      </div>
      ${dica}
      <div id="meal-input-${meal.id}"></div>
      <button class="secondary" style="margin-top:10px;width:100%;" onclick="abrirInputRefeicao('${meal.id}')">+ Registrar refeição</button>
    </div>`;
}

export async function abrirInputRefeicao(mealId, editando) {
  const container = document.getElementById(`meal-input-${mealId}`) || document.getElementById(`meal-card-${mealId}`);
  let existente = {};
  if (editando) {
    try {
      const r = await storage.get('meal:' + hojeStr() + ':' + mealId);
      if (r && r.value) existente = JSON.parse(r.value);
    } catch (e) {}
  }
  const formHtml = `
    <div style="margin-top:10px;">
      <label>O que você comeu?</label>
      <textarea id="input-desc-${mealId}" placeholder="Ex: 200g frango, arroz, salada">${existente.descricao || ''}</textarea>
      <div class="row">
        <div>
          <label>Proteína (g)</label>
          <input type="number" id="input-prot-${mealId}" value="${existente.proteina || ''}">
        </div>
        <div>
          <label>Carboidrato (g)</label>
          <input type="number" id="input-carb-${mealId}" value="${existente.carboidrato || ''}">
        </div>
        <div>
          <label>Gordura (g)</label>
          <input type="number" id="input-gord-${mealId}" value="${existente.gordura || ''}">
        </div>
      </div>
      <label>Como ficou depois</label>
      <select id="input-sens-${mealId}">
        <option value="">-- opcional --</option>
        <option ${existente.sensacao === 'Satisfeito' ? 'selected' : ''}>Satisfeito</option>
        <option ${existente.sensacao === 'Ainda com fome' ? 'selected' : ''}>Ainda com fome</option>
        <option ${existente.sensacao === 'Empanturrado' ? 'selected' : ''}>Empanturrado</option>
      </select>
      <button class="big" onclick="salvarRefeicao('${mealId}')">Salvar refeição</button>
    </div>`;
  if (editando) {
    document.getElementById(`meal-card-${mealId}`).insertAdjacentHTML('beforeend', formHtml);
  } else {
    container.innerHTML = formHtml;
  }
}

export async function salvarRefeicao(mealId) {
  const descricao = document.getElementById(`input-desc-${mealId}`).value || '';
  const proteina = document.getElementById(`input-prot-${mealId}`).value || null;
  const carboidrato = document.getElementById(`input-carb-${mealId}`).value || null;
  const gordura = document.getElementById(`input-gord-${mealId}`).value || null;
  const sensacao = document.getElementById(`input-sens-${mealId}`).value || '';
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const ts = new Date().toISOString(); // timestamp exato — dá pra cruzar com FC/atividade do Garmin depois
  const date = hojeStr();

  try {
    await storage.set('meal:' + date + ':' + mealId, JSON.stringify({ descricao, proteina, carboidrato, gordura, sensacao, hora, ts, date, mealId }));
    renderAlimentacao();
  } catch (e) {
    alert('Erro ao salvar refeição: ' + e.message);
  }
}

export async function apagarRefeicao(mealId) {
  try {
    await storage.delete('meal:' + hojeStr() + ':' + mealId);
    renderAlimentacao();
  } catch (e) {}
}

export async function aplicarImportacaoRapida() {
  const status = document.getElementById('quick-import-status');
  const raw = document.getElementById('quick-import-input').value.trim();
  if (!raw) { status.textContent = 'Cole o código primeiro.'; status.style.color = 'var(--danger)'; return; }

  const partes = raw.split('|').map(p => p.trim());
  const [mealId, descricao, proteina, carboidrato, gordura, sensacao] = partes;

  const mealValido = MEALS.find(m => m.id === mealId);
  if (!mealValido) {
    status.textContent = `Refeição "${mealId}" não reconhecida. Use: ${MEALS.map(m => m.id).join(', ')}.`;
    status.style.color = 'var(--danger)';
    return;
  }
  if (!descricao) {
    status.textContent = 'Formato inválido. Use: refeicao|descrição|proteína|carboidrato|gordura|sensação(opcional)';
    status.style.color = 'var(--danger)';
    return;
  }

  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const ts = new Date().toISOString();
  const date = hojeStr();

  try {
    await storage.set('meal:' + date + ':' + mealId, JSON.stringify({
      descricao, proteina: proteina || null, carboidrato: carboidrato || null, gordura: gordura || null,
      sensacao: sensacao || '', hora, ts, date, mealId
    }));
    status.textContent = `✓ "${mealValido.nome}" preenchida automaticamente.`;
    status.style.color = 'var(--accent)';
    document.getElementById('quick-import-input').value = '';
    renderAlimentacao();
  } catch (e) {
    status.textContent = 'Erro ao aplicar: ' + e.message;
    status.style.color = 'var(--danger)';
  }
}

window.salvarPeso = salvarPeso;
window.aplicarImportacaoRapida = aplicarImportacaoRapida;
window.calcularPorProteina = calcularPorProteina;
window.calcularPorQuantidade = calcularPorQuantidade;
window.abrirInputRefeicao = abrirInputRefeicao;
window.apagarRefeicao = apagarRefeicao;
window.salvarRefeicao = salvarRefeicao;
