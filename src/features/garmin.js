import { storage } from '../lib/storage.js';
import { hojeStr, dataDoTimestamp } from '../lib/date-utils.js';

/* ============ IMPORTAR GARMIN ============ */
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleGarminFile(e.target.files[0]);
});

let ultimoGarminParsed = null; // guarda o resultado completo (incl. hrSamples/startTime) até o clique em "Salvar corrida"

function handleGarminFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    let parsed;
    if (text.includes('TrainingCenterDatabase') || file.name.toLowerCase().endsWith('.tcx')) {
      parsed = parseTCX(text);
    } else {
      parsed = parseGPX(text);
    }
    mostrarPreviewGarmin(parsed);
  };
  reader.onerror = () => {
    document.getElementById('garmin-preview').innerHTML = '<div class="empty">Não consegui ler o arquivo. Confira se é .TCX ou .GPX.</div>';
  };
  reader.readAsText(file);
}

// Reduz a série de FC a no máximo maxPoints amostras, mantendo o espaçamento
// no tempo — evita registros gigantes em atividades muito longas, sem perder
// a granularidade necessária pra cruzar com o horário de cada série/exercício.
function downsampleSamples(samples, maxPoints) {
  maxPoints = maxPoints || 1500;
  const valid = samples.filter(s => s.t);
  if (valid.length <= maxPoints) return valid;
  const step = Math.ceil(valid.length / maxPoints);
  const out = [];
  for (let i = 0; i < valid.length; i += step) out.push(valid[i]);
  return out;
}

function parseTCX(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
  const laps = xml.getElementsByTagName('Lap');
  let totalDistance = 0, totalTime = 0;
  for (const lap of laps) {
    const d = lap.getElementsByTagName('DistanceMeters')[0];
    const t = lap.getElementsByTagName('TotalTimeSeconds')[0];
    if (d) totalDistance += parseFloat(d.textContent);
    if (t) totalTime += parseFloat(t.textContent);
  }

  // Série de FC por Trackpoint (com horário) — não só a média. É isso que permite
  // cruzar a frequência cardíaca com o horário exato de cada série/exercício
  // registrado no app depois (em vez de só um número médio da atividade inteira).
  const trackpoints = xml.getElementsByTagName('Trackpoint');
  const samples = [];
  for (const tp of trackpoints) {
    const timeNode = tp.getElementsByTagName('Time')[0];
    if (!timeNode) continue;
    const hrNode = tp.getElementsByTagName('HeartRateBpm')[0];
    const hrVal = hrNode ? hrNode.getElementsByTagName('Value')[0] : null;
    samples.push({ t: timeNode.textContent, hr: hrVal ? parseFloat(hrVal.textContent) : null });
  }
  const comHr = samples.filter(s => s.hr != null);
  const avgHr = comHr.length ? Math.round(comHr.reduce((s, x) => s + x.hr, 0) / comHr.length) : null;

  return {
    distanceKm: totalDistance ? (totalDistance / 1000) : null,
    timeMin: totalTime ? (totalTime / 60) : null,
    avgHr,
    startTime: samples.length ? samples[0].t : null,
    endTime: samples.length ? samples[samples.length - 1].t : null,
    hrSamples: downsampleSamples(samples)
  };
}

function parseGPX(text) {
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const pts = xml.getElementsByTagName('trkpt');
  let dist = 0, prevLat = null, prevLon = null;
  let firstTime = null, lastTime = null;
  const toRad = (v) => v * Math.PI / 180;
  const serializer = new XMLSerializer();
  const samples = [];
  for (const pt of pts) {
    const lat = parseFloat(pt.getAttribute('lat'));
    const lon = parseFloat(pt.getAttribute('lon'));
    const timeNode = pt.getElementsByTagName('time')[0];
    let tIso = null;
    if (timeNode) {
      const t = new Date(timeNode.textContent);
      if (!firstTime) firstTime = t;
      lastTime = t;
      tIso = timeNode.textContent;
    }
    // FC desse ponto específico (extensão Garmin, ex. gpxtpx:hr) — regex tolera
    // qualquer prefixo de namespace, só olhando dentro deste <trkpt> por vez.
    const hrMatch = /<[^>]*:?hr>(\d+)<\/[^>]*:?hr>/i.exec(serializer.serializeToString(pt));
    if (tIso) samples.push({ t: tIso, hr: hrMatch ? parseFloat(hrMatch[1]) : null });
    if (prevLat !== null) {
      const R = 6371000;
      const dLat = toRad(lat - prevLat);
      const dLon = toRad(lon - prevLon);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(prevLat)) * Math.cos(toRad(lat)) * Math.sin(dLon/2)**2;
      dist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    prevLat = lat; prevLon = lon;
  }
  const comHr = samples.filter(s => s.hr != null);
  const avgHr = comHr.length ? Math.round(comHr.reduce((s, x) => s + x.hr, 0) / comHr.length) : null;
  const timeMin = (firstTime && lastTime) ? (lastTime - firstTime) / 60000 : null;
  return {
    distanceKm: dist ? dist / 1000 : null,
    timeMin,
    avgHr,
    startTime: firstTime ? firstTime.toISOString() : null,
    endTime: lastTime ? lastTime.toISOString() : null,
    hrSamples: downsampleSamples(samples)
  };
}

function mostrarPreviewGarmin(parsed) {
  ultimoGarminParsed = parsed;
  const el = document.getElementById('garmin-preview');
  if (!parsed.distanceKm && !parsed.timeMin) {
    el.innerHTML = '<div class="empty">Não encontrei dados de distância/tempo nesse arquivo. Confira se exportou a atividade certa.</div>';
    return;
  }
  const nAmostras = parsed.hrSamples ? parsed.hrSamples.length : 0;
  el.innerHTML = `
    <div class="card">
      <h4>Dados encontrados — confira e ajuste se precisar</h4>
      <label>Distância (km)</label>
      <input type="number" step="0.01" id="g-dist" value="${parsed.distanceKm ? parsed.distanceKm.toFixed(2) : ''}">
      <label>Tempo (min)</label>
      <input type="number" step="0.1" id="g-tempo" value="${parsed.timeMin ? parsed.timeMin.toFixed(1) : ''}">
      <label>FC média<span class="qmark" onclick="abrirGlossario('fc')">?</span></label>
      <input type="number" id="g-fc" value="${parsed.avgHr || ''}">
      <label>Zona predominante<span class="qmark" onclick="abrirGlossario('zona')">?</span></label>
      <select id="g-zona"><option>Z1</option><option>Z2</option><option>Z3</option><option>Z4</option><option>Z5</option></select>
      ${nAmostras ? `<p style="font-size:12px;color:var(--text-dim);margin-top:6px;">${nAmostras} pontos de FC ao longo do tempo também serão salvos (não só a média) — permite cruzar com o horário exato de treinos e refeições depois.</p>` : ''}
      <button class="big" onclick="salvarCorridaGarmin()">Salvar corrida</button>
      <div id="garmin-status" style="font-size:12px;margin-top:8px;color:var(--text-dim);"></div>
    </div>`;
}

async function salvarCorridaGarmin() {
  const status = document.getElementById('garmin-status');
  const startTime = ultimoGarminParsed && ultimoGarminParsed.startTime;
  const endTime = ultimoGarminParsed && ultimoGarminParsed.endTime;
  // data real da atividade (pelo horário de início registrado no próprio arquivo)
  // — não a data em que você importou o arquivo
  const date = startTime ? dataDoTimestamp(startTime) : hojeStr();
  const entry = {
    date, type: 'corrida',
    distancia: document.getElementById('g-dist').value || null,
    tempo: document.getElementById('g-tempo').value || null,
    fc: document.getElementById('g-fc').value || null,
    zona: document.getElementById('g-zona').value,
    obs: 'Importado do Garmin',
    horaInicio: startTime || new Date().toISOString(),
    horaFim: endTime || new Date().toISOString(),
    hrSamples: (ultimoGarminParsed && ultimoGarminParsed.hrSamples) || []
  };
  try {
    const key = 'log:' + date + ':' + Date.now();
    const result = await storage.set(key, JSON.stringify(entry));
    status.textContent = result ? '✓ Corrida salva no histórico.' : 'Falha ao salvar.';
  } catch (e) {
    status.textContent = 'Erro: ' + e.message;
  }
}

window.salvarCorridaGarmin = salvarCorridaGarmin;
