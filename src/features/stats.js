import { storage, SUPA_URL, supaHeaders } from '../lib/storage.js';
import { lineChartSvg, SVG_ACCENT } from '../lib/svg-helpers.js';
import { barsChart, ganttChart, fcLineChart, scatterChart, bandLineChart, hbarChart, nutriChart } from '../lib/charts.js';
import { PROGRAM, METAS as METAS_PLANO } from '../data/program.js';

/* ============ ESTATÍSTICAS / ANÁLISES (A1–A7) ============
   Fontes: garmin_activities (resumos importados do CSV do Garmin),
   logs do app (musculação com timestamp por série, corridas, mobilidade)
   e meals. Triadas pelo Bruno a partir do dashboard de 01/09. */

/* mapas id→exercício construídos sob demanda — o PROGRAM pode ter sido
   substituído pelo plano do usuário logado depois do import deste módulo */
function mapasExercicios() {
  const NOME_EXERCICIO = {}, EX_DEF = {};
  for (const key of Object.keys(PROGRAM)) {
    (PROGRAM[key].exercicios || []).forEach(ex => { NOME_EXERCICIO[ex.id] = ex.nome; EX_DEF[ex.id] = ex; });
  }
  return { NOME_EXERCICIO, EX_DEF };
}

/* ---- loaders ---- */
async function buscarGarminActivities() {
  const res = await fetch(`${SUPA_URL}/rest/v1/garmin_activities?select=activity_type,activity_date,distance_km,duration_seconds,calories,avg_hr,max_hr,aerobic_te&order=activity_date`, { headers: supaHeaders() });
  if (!res.ok) throw new Error('Falha ao buscar atividades do Garmin: ' + res.status);
  return res.json();
}
async function listarValores(prefixo) {
  const keysResult = await storage.list(prefixo);
  if (!keysResult || !keysResult.keys) return [];
  const out = [];
  for (const key of keysResult.keys) {
    try {
      const r = await storage.get(key);
      if (r && r.value) { const v = JSON.parse(r.value); v._key = key; out.push(v); }
    } catch (e) {}
  }
  return out;
}
const buscarLogs = async () => (await listarValores('log:')).filter(e => e.type !== 'analise');
const buscarMeals = () => listarValores('meal:');

function tipoGarmin(activityType) {
  const t = (activityType || '').toLowerCase();
  if (t.includes('strength')) return 'musculacao';
  if (t.includes('run')) return 'corrida';
  if (t.includes('tennis')) return 'tenis';
  if (t.includes('walk')) return 'caminhada';
  return 'outros';
}
const MES_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* ============ A1 — SESSÕES POR MÊS (todos os treinos) ============ */
function renderSessoesMes(garmin, logs) {
  const area = document.getElementById('an-sessoes-mes');
  // conjunto (date -> tipos) do garmin pra dedupe com os logs do app
  const garminPorDia = {};
  const meses = {};
  const conta = (dateStr) => {
    const k = dateStr.slice(0, 7);
    meses[k] = (meses[k] || 0) + 1;
  };
  garmin.forEach(a => {
    if (!a.activity_date) return;
    const d = a.activity_date.slice(0, 10);
    const t = tipoGarmin(a.activity_type);
    garminPorDia[d + ':' + t] = true;
    conta(d);
  });
  logs.forEach(e => {
    if (e.type === 'descanso') return;
    // se o Garmin já registrou atividade equivalente no dia, não conta duas vezes
    if (garminPorDia[e.date + ':' + e.type]) return;
    conta(e.date);
  });
  // últimos 6 meses corridos, incluindo vazios
  const agora = new Date();
  const items = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const k = d.toISOString().slice(0, 7);
    items.push({ label: MES_LABEL[d.getMonth()], value: meses[k] || 0, highlight: i === 0 });
  }
  const total = items.reduce((s, m) => s + m.value, 0);
  if (!total) { area.innerHTML = '<div class="empty">Sem sessões nos últimos 6 meses.</div>'; return; }
  area.innerHTML = barsChart(items, { title: 'SESSÕES DE TREINO / MÊS (TODOS OS TIPOS)' });
}

/* ============ A2 — RAIO-X DA SESSÃO ============ */
function sessoesComTimestamps(logs) {
  return logs
    .filter(e => (e.type === 'musculacao' || e.type === 'mobilidade') && e.sets &&
      Object.values(e.sets).some(arr => arr.some(s => s.ts)))
    .sort((a, b) => b.date.localeCompare(a.date));
}
function popularSelectSessoes(logs) {
  const sel = document.getElementById('an-sessao-select');
  const sessoes = sessoesComTimestamps(logs);
  if (!sessoes.length) { sel.innerHTML = '<option value="">Nenhuma sessão com horários ainda</option>'; return sessoes; }
  sel.innerHTML = sessoes.map(s =>
    `<option value="${s._key}">${s.date.split('-').reverse().slice(0, 2).join('/')} · ${s.type === 'musculacao' ? 'Musculação ' + (s.treino || '') : 'Mobilidade'}</option>`).join('');
  return sessoes;
}
function renderRaioX(logs, key) {
  const area = document.getElementById('an-raiox');
  const sessao = logs.find(e => e._key === key);
  if (!sessao) { area.innerHTML = '<div class="empty">Registre um treino guiado pra ver o raio-X (os horários de cada série são gravados automaticamente).</div>'; return; }

  // blocos por exercício, na ordem do primeiro set
  const blocosEx = Object.entries(sessao.sets)
    .map(([exId, sets]) => {
      const tss = sets.filter(s => s.ts).map(s => new Date(s.ts).getTime());
      if (!tss.length) return null;
      return { exId, nome: mapasExercicios().NOME_EXERCICIO[exId] || exId, ini: Math.min(...tss), fim: Math.max(...tss) + 45000, nSets: sets.length };
    })
    .filter(Boolean)
    .sort((a, b) => a.ini - b.ini);
  if (!blocosEx.length) { area.innerHTML = '<div class="empty">Essa sessão não tem horários por série.</div>'; return; }

  const t0 = sessao.horaInicio ? new Date(sessao.horaInicio).getTime() : blocosEx[0].ini - 120000;
  const tFim = sessao.horaFim ? new Date(sessao.horaFim).getTime() : blocosEx[blocosEx.length - 1].fim + 120000;
  const totalMin = (tFim - t0) / 60000;

  // FC por bloco (se a sessão tiver série temporal anexada do Garmin)
  const samples = sessao.hrSamples || [];
  const fcDoBloco = (ini, fim) => {
    const dentro = samples.filter(sm => { const t = new Date(sm.t).getTime(); return sm.hr != null && t >= ini && t <= fim; });
    return dentro.length ? Math.round(dentro.reduce((s, x) => s + x.hr, 0) / dentro.length) : null;
  };

  // monta linhas: setup inicial, exercícios e transições longas (>4min)
  const blocos = [];
  const setupMin = (blocosEx[0].ini - t0) / 60000;
  if (setupMin > 3) blocos.push({ nome: 'Setup + aquecimento', iniMin: 0, spanMin: setupMin, dead: true });
  blocosEx.forEach((b, i) => {
    blocos.push({
      nome: `${b.nome.slice(0, 22)} (${b.nSets}×)`,
      iniMin: (b.ini - t0) / 60000, spanMin: (b.fim - b.ini) / 60000,
      fc: fcDoBloco(b.ini, b.fim)
    });
    const prox = blocosEx[i + 1];
    if (prox) {
      const gapMin = (prox.ini - b.fim) / 60000;
      if (gapMin > 4) blocos.push({ nome: '— transição —', iniMin: (b.fim - t0) / 60000, spanMin: gapMin, dead: true });
    }
  });
  const fimUltimo = blocosEx[blocosEx.length - 1].fim;
  const sobraMin = (tFim - fimUltimo) / 60000;
  if (sobraMin > 4) blocos.push({ nome: 'Alongamento + fim', iniMin: (fimUltimo - t0) / 60000, spanMin: sobraMin, dead: true });

  const ativo = blocos.filter(b => !b.dead).reduce((s, b) => s + b.spanMin, 0);
  let html = ganttChart(blocos, totalMin, { title: 'LINHA DO TEMPO DA SESSÃO' });
  if (samples.length >= 5) html += '<div style="height:8px"></div>' + fcLineChart(samples, t0, totalMin);
  html += `<div class="suggestion" style="margin-top:8px;">Sessão de ${totalMin.toFixed(0)} min · ~${ativo.toFixed(0)} min em exercício (${Math.round(ativo / totalMin * 100)}%)${samples.length ? '' : ' · <b>sem FC</b>: importe o .TCX dessa atividade na aba Garmin e toque em "Anexar FC" pra ver a frequência cardíaca de cada exercício aqui'}</div>`;
  area.innerHTML = html;
}

/* ============ A3 — INTENSIDADE DAS SESSÕES ============ */
function renderIntensidade(garmin, logs, filtro) {
  const area = document.getElementById('an-intensidade');
  const kcalMax = Math.max(1, ...garmin.map(a => a.calories || 0));
  let pts = garmin
    .filter(a => a.avg_hr && a.duration_seconds)
    .filter(a => filtro === 'todos' || tipoGarmin(a.activity_type) === filtro)
    .map(a => {
      const d = a.activity_date.slice(0, 10);
      return {
        x: Math.round(a.duration_seconds / 60), y: a.avg_hr,
        r: (a.calories || 0) / kcalMax,
        highlight: d >= ultimos30(),
        tip: `${d.split('-').reverse().join('/')} · ${a.activity_type} · ${Math.round(a.duration_seconds / 60)}min · FC ${a.avg_hr}${a.calories ? ' · ' + a.calories + ' kcal' : ''}`
      };
    });
  if (filtro === 'todos' || filtro === 'corrida') {
    logs.filter(e => e.type === 'corrida' && e.fc && e.tempo).forEach(e => {
      pts.push({ x: Math.round(parseFloat(e.tempo)), y: parseFloat(e.fc), r: 0.2, highlight: e.date >= ultimos30(), tip: `${e.date.split('-').reverse().join('/')} · Corrida (app) · FC ${e.fc}` });
    });
  }
  if (pts.length < 2) { area.innerHTML = '<div class="empty">Poucas sessões com FC nesse filtro.</div>'; return; }
  area.innerHTML = scatterChart(pts, { title: 'FC MÉDIA (bpm) × DURAÇÃO · bolha = kcal · amarelo = últimos 30 dias' });
}
function ultimos30() {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

/* ============ A4 — TRAINING EFFECT ============ */
function renderTE(garmin) {
  const area = document.getElementById('an-te');
  const pts = garmin
    .filter(a => a.aerobic_te != null && tipoGarmin(a.activity_type) === 'musculacao')
    .map(a => ({ v: parseFloat(a.aerobic_te), tip: `${a.activity_date.slice(0, 10).split('-').reverse().join('/')}: TE ${a.aerobic_te}` }));
  if (pts.length < 2) { area.innerHTML = '<div class="empty">Poucas sessões com Training Effect.</div>'; return; }
  const bands = [[0, 2, 'LEVE', '#1a1c20'], [2, 3, 'MANTENDO', '#20231f'], [3, 4.2, 'MELHORANDO', '#2a2717']];
  area.innerHTML = bandLineChart(pts, bands, { title: 'TRAINING EFFECT AERÓBICO — SESSÕES DE FORÇA', vmax: 4.2 });
}

/* ============ A5 — RITMO DAS CORRIDAS ============ */
function renderCorridas(garmin, logs) {
  const area = document.getElementById('an-corridas');
  const porData = {};
  logs.filter(e => e.type === 'corrida' && e.distancia && e.tempo).forEach(e => {
    const dist = parseFloat(e.distancia), tempo = parseFloat(e.tempo);
    if (dist > 0 && tempo > 0) porData[e.date] = { pace: tempo / dist, km: dist };
  });
  garmin.filter(a => tipoGarmin(a.activity_type) === 'corrida' && a.distance_km > 0 && a.duration_seconds > 0)
    .forEach(a => {
      const d = a.activity_date.slice(0, 10);
      porData[d] = { pace: (a.duration_seconds / 60) / a.distance_km, km: parseFloat(a.distance_km) };
    });
  const corridas = Object.entries(porData).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
  if (corridas.length < 2) { area.innerHTML = '<div class="empty">Ainda não há corridas suficientes (mínimo 2).</div>'; return; }
  const best = Math.min(...corridas.map(([, v]) => v.pace));
  const items = corridas.map(([d, v]) => ({
    label: d.split('-').reverse().slice(0, 2).join('/'),
    value: Math.round(v.pace * 10) / 10,
    topLabel: paceFmt(v.pace),
    sub: v.km.toFixed(1) + 'km',
    highlight: v.pace === best
  }));
  area.innerHTML = barsChart(items, { title: 'RITMO POR CORRIDA (min/km — menor é melhor · amarelo = recorde)', subLabels: true })
    + `<div class="suggestion" style="margin-top:8px;">Melhor ritmo: <b>${paceFmt(best)}/km</b> · último: ${paceFmt(corridas[corridas.length - 1][1].pace)}/km</div>`;
}
function paceFmt(p) {
  const m = Math.floor(p), s = Math.round((p - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ============ A6 — NUTRIÇÃO × METAS ============ */
function renderNutricao(meals) {
  const METAS = { kcal: METAS_PLANO.kcal, p: METAS_PLANO.proteina };
  const area = document.getElementById('an-nutricao');
  const dias = {};
  meals.forEach(m => {
    if (!m.date) return;
    if (!dias[m.date]) dias[m.date] = { p: 0, c: 0, g: 0 };
    dias[m.date].p += parseFloat(m.proteina) || 0;
    dias[m.date].c += parseFloat(m.carboidrato) || 0;
    dias[m.date].g += parseFloat(m.gordura) || 0;
  });
  const lista = Object.entries(dias).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7).reverse()
    .map(([d, v]) => ({ label: d.split('-').reverse().slice(0, 2).join('/'), kcal: Math.round(4 * (v.p + v.c) + 9 * v.g), p: v.p }));
  if (!lista.length) { area.innerHTML = '<div class="empty">Registre refeições na aba Hoje pra ver a análise.</div>'; return; }
  area.innerHTML = nutriChart(lista, METAS)
    + `<div class="suggestion" style="margin-top:8px;">Linha amarela = meta de kcal · barra vermelha = dia estourado (>7%) · cinza = muito abaixo (<85%)</div>`;
}

/* ============ A7 — CARGAS + PRONTO PRA SUBIR ============ */
function renderCargas(logs) {
  const area = document.getElementById('an-cargas');
  const recordes = {}; // exId -> {peso, ultimo: {date, sets}}
  logs.filter(e => (e.type === 'musculacao' || e.type === 'mobilidade') && e.sets).forEach(e => {
    Object.entries(e.sets).forEach(([exId, sets]) => {
      sets.forEach(s => {
        const w = parseFloat(s.weight);
        if (!w) return;
        if (!recordes[exId] || w > recordes[exId].peso) recordes[exId] = { peso: w };
      });
      if (sets.some(s => parseFloat(s.weight))) {
        if (!recordes[exId]) recordes[exId] = { peso: 0 };
        if (!recordes[exId].ultimoDate || e.date >= recordes[exId].ultimoDate) {
          recordes[exId].ultimoDate = e.date;
          recordes[exId].ultimoSets = sets;
        }
      }
    });
  });
  const { NOME_EXERCICIO, EX_DEF } = mapasExercicios();
  const items = Object.entries(recordes)
    .filter(([, r]) => r.peso > 0)
    .map(([exId, r]) => {
      const def = EX_DEF[exId];
      let badge = null;
      if (def && def.repMax && def.inc > 0 && r.ultimoSets) {
        const prontas = r.ultimoSets.filter(s => parseFloat(s.weight)).every(s => s.reps >= def.repMax && (s.rir == null || s.rir <= 2));
        if (prontas) badge = `SUBIR +${def.inc}kg`;
      }
      return { nome: (NOME_EXERCICIO[exId] || exId).slice(0, 20), valor: r.peso, label: r.peso + 'kg', badge };
    })
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);
  if (!items.length) { area.innerHTML = '<div class="empty">Registre treinos com carga pra ver seus recordes.</div>'; return; }
  area.innerHTML = hbarChart(items, { title: 'MAIOR CARGA REGISTRADA · selo verde = bateu o topo de reps com RIR ≤2' });
}

/* ============ PROGRESSÃO DE CARGA (card existente, mantido) ============ */
function listaExerciciosComCarga() {
  const out = [];
  for (const key of ['A', 'B', 'C', 'mobilidade']) {
    (PROGRAM[key].exercicios || []).forEach(ex => { if (!ex.isTime) out.push({ id: ex.id, nome: ex.nome }); });
  }
  const vistos = new Set();
  return out.filter(ex => (vistos.has(ex.id) ? false : (vistos.add(ex.id), true)));
}
async function renderProgressaoCarga(logs, exId) {
  const area = document.getElementById('stats-progressao-carga');
  const pontos = logs
    .filter(e => e.type === 'musculacao' && e.sets && e.sets[exId] && e.sets[exId].length)
    .map(e => {
      const pesos = e.sets[exId].map(s => parseFloat(s.weight)).filter(w => !isNaN(w));
      if (!pesos.length) return null;
      return { x: e.date.slice(5), y: Math.max(...pesos) };
    })
    .filter(Boolean)
    .sort((a, b) => a.x.localeCompare(b.x));
  if (pontos.length < 2) {
    area.innerHTML = `<div class="empty">Ainda não há dados suficientes desse exercício (mínimo 2 sessões registradas).</div>`;
    return;
  }
  const chart = lineChartSvg(pontos, { color: SVG_ACCENT, unit: 'kg' });
  const evolucao = pontos[pontos.length - 1].y - pontos[0].y;
  area.innerHTML = `${chart}<div class="suggestion" style="margin-top:6px;">Carga máxima: ${pontos[0].y}kg → ${pontos[pontos.length - 1].y}kg (${evolucao > 0 ? '+' : ''}${evolucao.toFixed(1)}kg desde o primeiro registro)</div>`;
}

/* ============ INIT ============ */
let dados = null;

export async function carregarEstatisticas() {
  ['an-sessoes-mes', 'an-raiox', 'an-intensidade', 'an-te', 'an-corridas', 'an-nutricao', 'an-cargas', 'stats-progressao-carga']
    .forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Carregando...</div>'; });
  try {
    const [logs, garmin, meals] = await Promise.all([buscarLogs(), buscarGarminActivities(), buscarMeals()]);
    dados = { logs, garmin, meals };

    renderSessoesMes(garmin, logs);
    const sessoes = popularSelectSessoes(logs);
    renderRaioX(logs, sessoes.length ? document.getElementById('an-sessao-select').value : null);
    renderIntensidade(garmin, logs, document.getElementById('an-tipo-select').value);
    renderTE(garmin);
    renderCorridas(garmin, logs);
    renderNutricao(meals);
    renderCargas(logs);

    const select = document.getElementById('stats-exercicio-select');
    if (select && !select.dataset.populated) {
      select.innerHTML = listaExerciciosComCarga().map(ex => `<option value="${ex.id}">${ex.nome}</option>`).join('');
      select.dataset.populated = '1';
    }
    if (select && select.value) await renderProgressaoCarga(logs, select.value);
  } catch (err) {
    const el = document.getElementById('an-sessoes-mes');
    if (el) el.innerHTML = `<div class="empty">Erro: ${err.message}</div>`;
  }
}

export function mudarSessaoRaioX() {
  if (!dados) return;
  renderRaioX(dados.logs, document.getElementById('an-sessao-select').value);
}
export function mudarTipoIntensidade() {
  if (!dados) return;
  renderIntensidade(dados.garmin, dados.logs, document.getElementById('an-tipo-select').value);
}
export async function mudarExercicioEstatisticas() {
  const select = document.getElementById('stats-exercicio-select');
  if (!dados || !select) return;
  await renderProgressaoCarga(dados.logs, select.value);
}

window.carregarEstatisticas = carregarEstatisticas;
window.mudarSessaoRaioX = mudarSessaoRaioX;
window.mudarTipoIntensidade = mudarTipoIntensidade;
window.mudarExercicioEstatisticas = mudarExercicioEstatisticas;
