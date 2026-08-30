import { storage, SUPA_URL, supaHeaders } from '../lib/storage.js';
import { lineChartSvg, stackedBarChartSvg, SVG_ACCENT, SVG_DIM } from '../lib/svg-helpers.js';
import { PROGRAM } from '../data/program.js';

const COR_MUSC = '#f2c230';
const COR_CORRIDA = '#4fd1c5';
const COR_OUTROS = '#6b7280';

function inicioDaSemana(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
function labelSemana(mondayStr) {
  const [, m, dd] = mondayStr.split('-');
  return `${dd}/${m}`;
}

async function buscarGarminActivities() {
  const res = await fetch(`${SUPA_URL}/rest/v1/garmin_activities?select=activity_type,activity_date,distance_km,duration_seconds`, { headers: supaHeaders() });
  if (!res.ok) throw new Error('Falha ao buscar atividades do Garmin: ' + res.status);
  return res.json();
}

async function buscarLogs() {
  const keysResult = await storage.list('log:');
  if (!keysResult || !keysResult.keys) return [];
  const entries = [];
  for (const key of keysResult.keys) {
    try {
      const r = await storage.get(key);
      if (r && r.value) entries.push(JSON.parse(r.value));
    } catch (e) {}
  }
  return entries.filter(e => e.type !== 'analise');
}

/* ============ VOLUME SEMANAL ============ */
function classificarGarmin(activityType) {
  if (!activityType) return 'outros';
  const t = activityType.toLowerCase();
  if (t.includes('strength')) return 'musc';
  if (t.includes('run')) return 'corrida';
  return 'outros';
}

async function renderVolumeSemanal(garminAtividades) {
  const area = document.getElementById('stats-volume-semanal');
  if (!garminAtividades.length) {
    area.innerHTML = '<div class="empty">Sem atividades do Garmin importadas ainda.</div>';
    return;
  }
  const semanas = {};
  garminAtividades.forEach(a => {
    if (!a.activity_date) return;
    const dateStr = a.activity_date.slice(0, 10);
    const semana = inicioDaSemana(dateStr);
    const tipo = classificarGarmin(a.activity_type);
    if (!semanas[semana]) semanas[semana] = { musc: 0, corrida: 0, outros: 0 };
    semanas[semana][tipo]++;
  });
  const chaves = Object.keys(semanas).sort();
  const ultimas = chaves.slice(-12);
  const weeks = ultimas.map(k => ({ label: labelSemana(k), counts: semanas[k] }));

  const chart = stackedBarChartSvg(weeks, ['musc', 'corrida', 'outros'], { musc: COR_MUSC, corrida: COR_CORRIDA, outros: COR_OUTROS });
  area.innerHTML = `
    ${chart}
    <div class="set-log" style="margin-top:8px;">
      <span class="chip" style="border-color:${COR_MUSC};color:${COR_MUSC};">■ Musculação</span>
      <span class="chip" style="border-color:${COR_CORRIDA};color:${COR_CORRIDA};">■ Corrida</span>
      <span class="chip" style="border-color:${COR_OUTROS};color:${COR_OUTROS};">■ Outros</span>
    </div>`;
}

/* ============ PROGRESSÃO DE CARGA ============ */
function listaExerciciosComCarga() {
  const out = [];
  for (const key of ['A', 'B', 'C', 'mobilidade']) {
    (PROGRAM[key].exercicios || []).forEach(ex => {
      if (!ex.isTime) out.push({ id: ex.id, nome: ex.nome });
    });
  }
  // remove duplicados de id (alguns exercícios se repetem entre dias)
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
  const sinal = evolucao > 0 ? '+' : '';
  area.innerHTML = `${chart}<div class="suggestion" style="margin-top:6px;">Carga máxima: ${pontos[0].y}kg → ${pontos[pontos.length - 1].y}kg (${sinal}${evolucao.toFixed(1)}kg desde o primeiro registro)</div>`;
}

/* ============ RITMO DE CORRIDA ============ */
async function renderRitmoCorrida(logs, garminAtividades) {
  const area = document.getElementById('stats-ritmo-corrida');
  const pontosPorData = {};

  logs.filter(e => e.type === 'corrida' && e.distancia && e.tempo).forEach(e => {
    const dist = parseFloat(e.distancia), tempo = parseFloat(e.tempo);
    if (dist > 0 && tempo > 0) pontosPorData[e.date] = tempo / dist;
  });

  garminAtividades
    .filter(a => classificarGarmin(a.activity_type) === 'corrida' && a.distance_km > 0 && a.duration_seconds > 0)
    .forEach(a => {
      const dateStr = a.activity_date.slice(0, 10);
      pontosPorData[dateStr] = (a.duration_seconds / 60) / a.distance_km;
    });

  const pontos = Object.entries(pontosPorData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, pace]) => ({ x: date.slice(5), y: Math.round(pace * 100) / 100 }));

  if (pontos.length < 2) {
    area.innerHTML = '<div class="empty">Ainda não há corridas suficientes registradas (mínimo 2).</div>';
    return;
  }
  const chart = lineChartSvg(pontos, { color: COR_CORRIDA, unit: 'min/km' });
  area.innerHTML = `${chart}<div class="suggestion" style="margin-top:6px;">Ritmo mais recente: ${pontos[pontos.length - 1].y} min/km</div>`;
}

/* ============ INIT ============ */
let dadosCarregados = null;

export async function carregarEstatisticas() {
  const volumeArea = document.getElementById('stats-volume-semanal');
  const cargaArea = document.getElementById('stats-progressao-carga');
  const ritmoArea = document.getElementById('stats-ritmo-corrida');
  volumeArea.innerHTML = '<div class="empty">Carregando...</div>';
  cargaArea.innerHTML = '<div class="empty">Carregando...</div>';
  ritmoArea.innerHTML = '<div class="empty">Carregando...</div>';

  try {
    const [logs, garminAtividades] = await Promise.all([buscarLogs(), buscarGarminActivities()]);
    dadosCarregados = { logs, garminAtividades };

    await renderVolumeSemanal(garminAtividades);
    await renderRitmoCorrida(logs, garminAtividades);

    const select = document.getElementById('stats-exercicio-select');
    if (select && !select.dataset.populated) {
      select.innerHTML = listaExerciciosComCarga().map(ex => `<option value="${ex.id}">${ex.nome}</option>`).join('');
      select.dataset.populated = '1';
    }
    if (select && select.value) await renderProgressaoCarga(logs, select.value);
  } catch (err) {
    volumeArea.innerHTML = `<div class="empty">Erro: ${err.message}</div>`;
  }
}

export async function mudarExercicioEstatisticas() {
  const select = document.getElementById('stats-exercicio-select');
  if (!dadosCarregados || !select) return;
  await renderProgressaoCarga(dadosCarregados.logs, select.value);
}

window.carregarEstatisticas = carregarEstatisticas;
window.mudarExercicioEstatisticas = mudarExercicioEstatisticas;
