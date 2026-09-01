/* ============ GRÁFICOS DAS ANÁLISES (Placar de Ferro) ============
   SVGs gerados por string, sem dependências. Paleta fixa do app:
   amarelo = destaque/atual, palha = histórico, aço = vazio/neutro. */

export const C = {
  accent: '#f2c230', hist: '#5b5236', steel: '#3a3f44', border: '#34383e',
  text: '#edede7', dim: '#9ba1a8', faint: '#6b7178', danger: '#d4552f',
  ok: '#4c8a54', ink: '#201802', bg: '#0e1013'
};

const OPEN = (w, h) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;background:${C.bg};border:1px solid ${C.border};border-radius:10px;font-family:-apple-system,sans-serif;">`;

/* Barras verticais simples: items = [{label, value, highlight?, sub?}] */
export function barsChart(items, opts) {
  opts = opts || {};
  const W = 640, H = opts.height || 230, px = 40, pb = opts.subLabels ? 50 : 36;
  const n = items.length;
  const bw = Math.min(56, (W - 2 * px) / n * 0.62);
  const gap = (W - 2 * px - n * bw) / Math.max(1, n - 1);
  const max = Math.max(1, ...items.map(d => d.value));
  let s = OPEN(W, H);
  items.forEach((d, i) => {
    const x = px + i * (bw + gap);
    const h = d.value ? (d.value / max) * (H - pb - 48) : 3;
    const y = H - pb - h;
    const fill = d.value === 0 ? C.border : (d.highlight ? C.accent : C.hist);
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="${fill}"/>`;
    s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" fill="${d.value === 0 ? C.faint : C.text}" font-size="15" font-weight="700" font-family="Oswald">${d.topLabel != null ? d.topLabel : (d.value || '—')}</text>`;
    s += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - (opts.subLabels ? 28 : 14)}" text-anchor="middle" fill="${C.dim}" font-size="12">${d.label}</text>`;
    if (d.sub) s += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 12}" text-anchor="middle" fill="${C.faint}" font-size="10.5">${d.sub}</text>`;
  });
  if (opts.title) s += `<text x="${px}" y="18" fill="${C.faint}" font-size="11" letter-spacing="1">${opts.title}</text>`;
  return s + `</svg>`;
}

/* Gantt de sessão: blocos = [{nome, iniMin, spanMin, dead?, fc?}], totalMin */
export function ganttChart(blocos, totalMin, opts) {
  opts = opts || {};
  const W = 640, rowH = 28, pad = 6, lx = 190;
  const H = blocos.length * (rowH + pad) + 56;
  const scale = (W - lx - 60) / totalMin;
  let s = OPEN(W, H);
  const ticks = totalMin > 80 ? [0, 30, 60, 90] : totalMin > 40 ? [0, 20, 40, 60] : [0, 10, 20, 30];
  ticks.filter(t => t <= totalMin).forEach(t => {
    const x = lx + t * scale;
    s += `<line x1="${x.toFixed(1)}" y1="26" x2="${x.toFixed(1)}" y2="${H - 24}" stroke="${C.border}" stroke-dasharray="3 4"/>`;
    s += `<text x="${x.toFixed(1)}" y="${H - 8}" text-anchor="middle" fill="${C.faint}" font-size="11">${t}min</text>`;
  });
  blocos.forEach((b, i) => {
    const y = 30 + i * (rowH + pad);
    const fill = b.dead ? '#8b3820' : C.accent;
    s += `<text x="${lx - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" fill="${b.dead ? C.dim : C.text}" font-size="12"${b.dead ? '' : ' font-weight="600"'}>${b.nome}</text>`;
    s += `<rect x="${(lx + b.iniMin * scale).toFixed(1)}" y="${y}" width="${Math.max(b.spanMin * scale, 3).toFixed(1)}" height="${rowH}" rx="5" fill="${fill}"${b.dead ? ' opacity="0.85"' : ''}/>`;
    const parts = [];
    if (b.spanMin * scale > 46) parts.push(b.spanMin.toFixed(0) + 'min');
    if (b.fc && b.spanMin * scale > 78) parts.push('FC ' + b.fc);
    if (parts.length) s += `<text x="${(lx + b.iniMin * scale + b.spanMin * scale / 2).toFixed(1)}" y="${y + rowH / 2 + 4}" text-anchor="middle" fill="${b.dead ? C.text : C.ink}" font-size="11" font-weight="700">${parts.join(' · ')}</text>`;
  });
  if (opts.title) s += `<text x="${lx}" y="16" fill="${C.faint}" font-size="11" letter-spacing="1">${opts.title}</text>`;
  return s + `</svg>`;
}

/* Linha de FC da sessão inteira (sob o gantt) */
export function fcLineChart(samples, t0Ms, totalMin, opts) {
  opts = opts || {};
  const W = 640, H = 150, px = 190, pr = 60, pt = 26, pb = 26;
  const pts = samples
    .map(sm => ({ min: (new Date(sm.t).getTime() - t0Ms) / 60000, hr: sm.hr }))
    .filter(p => p.hr != null && p.min >= 0 && p.min <= totalMin);
  if (pts.length < 5) return '';
  const hrMin = Math.min(...pts.map(p => p.hr)) - 5;
  const hrMax = Math.max(...pts.map(p => p.hr)) + 5;
  const X = m => px + (m / totalMin) * (W - px - pr);
  const Y = h => pt + (1 - (h - hrMin) / (hrMax - hrMin)) * (H - pt - pb);
  let path = '';
  pts.forEach((p, i) => { path += (i ? 'L' : 'M') + X(p.min).toFixed(1) + ',' + Y(p.hr).toFixed(1); });
  let s = OPEN(W, H);
  [Math.round(hrMin + 5), Math.round(hrMax - 5)].forEach(h => {
    s += `<line x1="${px}" y1="${Y(h).toFixed(1)}" x2="${W - pr}" y2="${Y(h).toFixed(1)}" stroke="${C.border}" stroke-dasharray="3 4"/>`;
    s += `<text x="${px - 8}" y="${(Y(h) + 4).toFixed(1)}" text-anchor="end" fill="${C.faint}" font-size="11">${h}</text>`;
  });
  s += `<path d="${path}" fill="none" stroke="#d4552f" stroke-width="1.8" stroke-linejoin="round" opacity="0.95"/>`;
  s += `<text x="${px}" y="16" fill="${C.faint}" font-size="11" letter-spacing="1">FREQUÊNCIA CARDÍACA AO LONGO DA SESSÃO (bpm)</text>`;
  return s + `</svg>`;
}

/* Scatter: pts = [{x(min), y(bpm), r(0..1), highlight?, tip}] */
export function scatterChart(pts, opts) {
  opts = opts || {};
  const W = 640, H = 280, px = 56, pb = 40, pt = 26;
  if (!pts.length) return '';
  const xmax = Math.max(60, ...pts.map(p => p.x)) * 1.08;
  const xmin = Math.min(...pts.map(p => p.x)) * 0.8;
  const ymax = Math.max(...pts.map(p => p.y)) + 8;
  const ymin = Math.min(...pts.map(p => p.y)) - 8;
  const X = v => px + (v - xmin) / (xmax - xmin) * (W - px - 24);
  const Y = v => pt + (1 - (v - ymin) / (ymax - ymin)) * (H - pt - pb);
  let s = OPEN(W, H);
  const xt = niceTicks(xmin, xmax, 5), yt = niceTicks(ymin, ymax, 4);
  xt.forEach(v => { s += `<text x="${X(v).toFixed(1)}" y="${H - 12}" text-anchor="middle" fill="${C.faint}" font-size="11">${v}min</text>`; });
  yt.forEach(v => { s += `<line x1="${px}" y1="${Y(v).toFixed(1)}" x2="${W - 24}" y2="${Y(v).toFixed(1)}" stroke="${C.border}" stroke-dasharray="3 4"/><text x="${px - 8}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" fill="${C.faint}" font-size="11">${v}</text>`; });
  pts.forEach(p => {
    const r = 4 + (p.r || 0) * 10;
    s += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${r.toFixed(1)}" fill="${p.highlight ? C.accent : C.hist}" opacity="${p.highlight ? 1 : 0.75}"${p.highlight ? ' stroke="#fff" stroke-width="1.5"' : ''}><title>${p.tip || ''}</title></circle>`;
  });
  if (opts.title) s += `<text x="${px}" y="16" fill="${C.faint}" font-size="11" letter-spacing="1">${opts.title}</text>`;
  return s + `</svg>`;
}

function niceTicks(min, max, n) {
  const span = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(span / n)));
  const err = span / n / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const st = mult * step;
  const out = [];
  for (let v = Math.ceil(min / st) * st; v <= max; v += st) out.push(Math.round(v));
  return out;
}

/* Linha com faixas de fundo: pts = [{v}], bands = [[de, até, label, cor]] */
export function bandLineChart(pts, bands, opts) {
  opts = opts || {};
  const W = 640, H = 240, px = 46, pb = 30, pt = 22;
  if (pts.length < 2) return '';
  const vmax = opts.vmax || Math.max(...pts.map(p => p.v)) * 1.1;
  const X = i => px + i / (pts.length - 1) * (W - px - 24);
  const Y = v => pt + (1 - v / vmax) * (H - pt - pb);
  let s = OPEN(W, H);
  (bands || []).forEach(([a, b, l, cor]) => {
    s += `<rect x="${px}" y="${Y(Math.min(b, vmax)).toFixed(1)}" width="${W - px - 24}" height="${(Y(a) - Y(Math.min(b, vmax))).toFixed(1)}" fill="${cor}"/>`;
    s += `<text x="${W - 30}" y="${(Y(Math.min(b, vmax)) + 14).toFixed(1)}" text-anchor="end" fill="${C.faint}" font-size="10" letter-spacing="0.6">${l}</text>`;
  });
  let path = '';
  pts.forEach((p, i) => { path += (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(p.v).toFixed(1); });
  s += `<path d="${path}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linejoin="round" opacity="0.9"/>`;
  pts.forEach((p, i) => {
    const last = i === pts.length - 1;
    s += `<circle cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${last ? 5 : 2.5}" fill="${C.accent}"${last ? ' stroke="#fff" stroke-width="1.5"' : ''}><title>${p.tip || ''}</title></circle>`;
  });
  if (opts.title) s += `<text x="${px}" y="14" fill="${C.faint}" font-size="11" letter-spacing="1">${opts.title}</text>`;
  return s + `</svg>`;
}

/* Barras horizontais: items = [{nome, valor, label, badge?}] */
export function hbarChart(items, opts) {
  opts = opts || {};
  const W = 640, rowH = 26, pad = 8, lx = 158;
  const H = items.length * (rowH + pad) + 34;
  const max = Math.max(1, ...items.map(c => c.valor));
  const scale = (W - lx - 150) / max;
  let s = OPEN(W, H);
  items.forEach((c, i) => {
    const y = 24 + i * (rowH + pad);
    s += `<text x="${lx - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" fill="${C.text}" font-size="12">${c.nome}</text>`;
    s += `<rect x="${lx}" y="${y}" width="${(c.valor * scale).toFixed(1)}" height="${rowH}" rx="5" fill="${i < (opts.topN || 3) ? C.accent : C.hist}"/>`;
    let tx = lx + c.valor * scale + 8;
    s += `<text x="${tx.toFixed(1)}" y="${y + rowH / 2 + 4}" fill="${C.accent}" font-size="13" font-weight="700" font-family="Oswald">${c.label}</text>`;
    if (c.badge) {
      tx += 52;
      s += `<rect x="${tx.toFixed(1)}" y="${y + 3}" width="86" height="${rowH - 6}" rx="4" fill="${C.ok}"/>`;
      s += `<text x="${(tx + 43).toFixed(1)}" y="${y + rowH / 2 + 4}" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="700">${c.badge}</text>`;
    }
  });
  if (opts.title) s += `<text x="${lx}" y="14" fill="${C.faint}" font-size="11" letter-spacing="1">${opts.title}</text>`;
  return s + `</svg>`;
}

/* Nutrição diária: dias = [{label, kcal, p}] + metas {kcal, p} */
export function nutriChart(dias, metas) {
  const W = 640, H = 84 + dias.length * 42;
  let s = OPEN(W, H);
  s += `<text x="24" y="20" fill="${C.faint}" font-size="11" letter-spacing="1">KCAL DO DIA × META ${metas.kcal} · PROTEÍNA × META ${metas.p}g</text>`;
  const bx = 150, bw = 250, gx = 470, gw = 120;
  const kmax = Math.max(metas.kcal * 1.25, ...dias.map(d => d.kcal));
  dias.forEach((d, i) => {
    const y = 40 + i * 42;
    s += `<text x="${bx - 10}" y="${y + 13}" text-anchor="end" fill="${C.text}" font-size="12">${d.label}</text>`;
    // kcal
    const frac = d.kcal / kmax;
    const over = d.kcal > metas.kcal * 1.07, under = d.kcal < metas.kcal * 0.85;
    s += `<rect x="${bx}" y="${y}" width="${bw}" height="18" rx="9" fill="${C.border}"/>`;
    s += `<rect x="${bx}" y="${y}" width="${(bw * frac).toFixed(1)}" height="18" rx="9" fill="${over ? C.danger : (under ? C.steel : C.ok)}"/>`;
    const metaX = bx + bw * (metas.kcal / kmax);
    s += `<line x1="${metaX.toFixed(1)}" y1="${y - 3}" x2="${metaX.toFixed(1)}" y2="${y + 21}" stroke="${C.accent}" stroke-width="2"/>`;
    s += `<text x="${bx + 6}" y="${y + 13}" fill="#fff" font-size="10.5" font-weight="700">${d.kcal} kcal</text>`;
    // proteína
    const pf = Math.min(d.p / metas.p, 1);
    s += `<rect x="${gx}" y="${y + 2}" width="${gw}" height="14" rx="7" fill="${C.border}"/>`;
    s += `<rect x="${gx}" y="${y + 2}" width="${(gw * pf).toFixed(1)}" height="14" rx="7" fill="${C.accent}"/>`;
    s += `<text x="${gx + gw + 8}" y="${y + 14}" fill="${C.text}" font-size="12" font-weight="700" font-family="Oswald">${Math.round(d.p)}g</text>`;
  });
  return s + `</svg>`;
}
