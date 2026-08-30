/* ============ BIBLIOTECA DE EXECUÇÃO ============ */
/* ============ ESQUEMAS VISUAIS (SVG) ============ */
let diagramCounter = 0;
export function toggleImgDiagram(uid) {
  const el = document.getElementById(uid);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
export function acaoImagemVideo(svgContent, termo) {
  const uid = 'diag-' + (diagramCounter++);
  const q = encodeURIComponent(termo + " execução técnica");
  const qVid = `https://www.youtube.com/results?search_query=${q}`;
  return `
    <div id="${uid}" style="display:none;">${svgContent}</div>
    <div style="display:flex;gap:8px;margin:8px 0;">
      <div style="flex:1;text-align:center;padding:8px;border-radius:8px;border:1px solid var(--card-border);font-size:12px;color:var(--accent);cursor:pointer;" onclick="toggleImgDiagram('${uid}')">🔍 Ver imagens</div>
      <a href="${qVid}" target="_blank" rel="noopener" style="flex:1;text-decoration:none;">
        <div style="text-align:center;padding:8px;border-radius:8px;border:1px solid var(--card-border);font-size:12px;color:var(--accent);">▶️ Ver vídeo</div>
      </a>
    </div>`;
}


export const SVG_ACCENT = "#4fd1c5";
export const SVG_ACCENT_DIM = "#2c7a72";
export const SVG_DIM = "#9aa3b2";

export function limb(x1, y1, x2, y2, color, width) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width || 8}" stroke-linecap="round"/>`;
}
export function jointDots(points, color) {
  return points.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${color}"/>`).join('');
}
export function arrowSvg(x1, y1, x2, y2, color) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ah = 6;
  const ax1 = x2 - ah * Math.cos(ang - Math.PI / 6), ay1 = y2 - ah * Math.sin(ang - Math.PI / 6);
  const ax2 = x2 - ah * Math.cos(ang + Math.PI / 6), ay2 = y2 - ah * Math.sin(ang + Math.PI / 6);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"/>
    <polygon points="${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}" fill="${color}"/>`;
}
export function barbellIcon(cx, cy, color) {
  color = color || SVG_DIM;
  const w = 32;
  return `<line x1="${cx - w}" y1="${cy}" x2="${cx + w}" y2="${cy}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    <rect x="${cx - w - 6}" y="${cy - 11}" width="9" height="22" rx="2" fill="${color}"/>
    <rect x="${cx + w - 3}" y="${cy - 11}" width="9" height="22" rx="2" fill="${color}"/>`;
}
export function dumbbellIcon(cx, cy, color) {
  color = color || SVG_DIM;
  return `<line x1="${cx - 10}" y1="${cy}" x2="${cx + 10}" y2="${cy}" stroke="${color}" stroke-width="3"/>
    <circle cx="${cx - 10}" cy="${cy}" r="6" fill="${color}"/>
    <circle cx="${cx + 10}" cy="${cy}" r="6" fill="${color}"/>`;
}
export function benchRect(x, y, w, color) {
  color = color || SVG_DIM;
  return `<rect x="${x}" y="${y}" width="${w}" height="9" rx="4" fill="${color}" opacity="0.55"/>`;
}
export function wallRect(x, yTop, yBottom, color) {
  color = color || SVG_DIM;
  return `<rect x="${x}" y="${yTop}" width="7" height="${yBottom - yTop}" rx="3" fill="${color}" opacity="0.55"/>`;
}
export function figure(j, color, limbColor) {
  limbColor = limbColor || color;
  let s = '';
  // pernas (atrás do tronco)
  s += limb(j.hip[0], j.hip[1], j.knee[0], j.knee[1], limbColor, 9);
  s += limb(j.knee[0], j.knee[1], j.ankle[0], j.ankle[1], limbColor, 9);
  s += limb(j.ankle[0], j.ankle[1], j.toe[0], j.toe[1], limbColor, 6);
  if (j.knee2) {
    s += limb(j.hip[0], j.hip[1], j.knee2[0], j.knee2[1], limbColor, 9);
    s += limb(j.knee2[0], j.knee2[1], j.ankle2[0], j.ankle2[1], limbColor, 9);
    s += limb(j.ankle2[0], j.ankle2[1], j.toe2[0], j.toe2[1], limbColor, 6);
  }
  // tronco (mais grosso, cor principal)
  s += limb(j.shoulder[0], j.shoulder[1], j.hip[0], j.hip[1], color, 15);
  // braço
  s += limb(j.shoulder[0], j.shoulder[1], j.elbow[0], j.elbow[1], limbColor, 8);
  s += limb(j.elbow[0], j.elbow[1], j.hand[0], j.hand[1], limbColor, 8);
  // cabeça (preenchida, sem contorno fino)
  s += `<circle cx="${j.head[0]}" cy="${j.head[1]}" r="11" fill="${color}"/>`;
  // articulações marcadas (dá o efeito "boneco robusto", não palito)
  s += jointDots([j.shoulder, j.elbow, j.hip, j.knee, j.ankle], color);
  if (j.knee2) s += jointDots([j.knee2, j.ankle2], color);
  // mãos e pés arredondados
  s += `<circle cx="${j.hand[0]}" cy="${j.hand[1]}" r="6" fill="${limbColor}"/>`;
  s += `<circle cx="${j.toe[0]}" cy="${j.toe[1]}" r="5" fill="${limbColor}"/>`;
  if (j.toe2) s += `<circle cx="${j.toe2[0]}" cy="${j.toe2[1]}" r="5" fill="${limbColor}"/>`;
  return s;
}
export function shiftJ(j, dx) {
  const out = {};
  for (const k in j) out[k] = [j[k][0] + dx, j[k][1]];
  return out;
}
export function diagram2(startJ, endJ, label1, label2, extras) {
  return `<svg viewBox="0 0 300 155" style="width:100%;max-width:300px;display:block;margin:10px auto;background:#0d0f14;border-radius:12px;">
    <line x1="10" y1="138" x2="132" y2="138" stroke="${SVG_DIM}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <line x1="168" y1="138" x2="290" y2="138" stroke="${SVG_DIM}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    ${figure(startJ, SVG_ACCENT, SVG_ACCENT_DIM)}
    ${figure(shiftJ(endJ, 160), SVG_ACCENT, SVG_ACCENT_DIM)}
    ${extras || ''}
    <text x="69" y="150" fill="${SVG_DIM}" font-size="10" text-anchor="middle">${label1}</text>
    <text x="229" y="150" fill="${SVG_DIM}" font-size="10" text-anchor="middle">${label2}</text>
  </svg>`;
}
export function diagram1(j, label, extras) {
  return `<svg viewBox="0 0 160 155" style="width:100%;max-width:190px;display:block;margin:10px auto;background:#0d0f14;border-radius:12px;">
    <line x1="10" y1="138" x2="150" y2="138" stroke="${SVG_DIM}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    ${figure(j, SVG_ACCENT, SVG_ACCENT_DIM)}
    ${extras || ''}
    <text x="80" y="150" fill="${SVG_DIM}" font-size="10" text-anchor="middle">${label}</text>
  </svg>`;
}

/* ============ MINI-GRÁFICOS (estatísticas) ============ */
export function lineChartSvg(points, opts) {
  opts = opts || {};
  const width = opts.width || 300, height = opts.height || 110, pad = opts.pad || 12;
  const color = opts.color || SVG_ACCENT, dim = opts.dim || SVG_DIM, unit = opts.unit || '';
  if (!points || points.length < 2) return '';
  const ys = points.map(p => p.y);
  const min = Math.min(...ys), max = Math.max(...ys);
  const range = (max - min) || 1;
  const stepX = (width - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = height - pad - ((p.y - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const pathD = coords.map((c, i) => (i === 0 ? 'M' : 'L') + c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');
  const dots = coords.map((c, i) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="3" fill="${color}"><title>${points[i].x}: ${points[i].y}${unit}</title></circle>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;display:block;margin:0 auto;background:#0d0f14;border-radius:10px;">
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>
    ${dots}
    <text x="${pad}" y="${height - 2}" fill="${dim}" font-size="9">${points[0].x}</text>
    <text x="${width - pad}" y="${height - 2}" fill="${dim}" font-size="9" text-anchor="end">${points[points.length - 1].x}</text>
  </svg>`;
}

export function stackedBarChartSvg(weeks, seriesKeys, seriesColors, opts) {
  opts = opts || {};
  const width = opts.width || 320, height = opts.height || 130, pad = opts.pad || 14, gap = opts.gap || 4;
  if (!weeks || !weeks.length) return '';
  const totals = weeks.map(w => seriesKeys.reduce((s, k) => s + (w.counts[k] || 0), 0));
  const maxTotal = Math.max(1, ...totals);
  const chartH = height - pad * 2;
  const slotW = (width - pad * 2) / weeks.length;
  const barW = Math.max(2, slotW - gap);
  let bars = '';
  weeks.forEach((w, i) => {
    let yCursor = height - pad;
    const x = pad + i * slotW + gap / 2;
    seriesKeys.forEach(k => {
      const v = w.counts[k] || 0;
      if (!v) return;
      const h = (v / maxTotal) * chartH;
      yCursor -= h;
      bars += `<rect x="${x.toFixed(1)}" y="${yCursor.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${seriesColors[k]}"><title>${w.label} — ${k}: ${v}</title></rect>`;
    });
  });
  const labelEvery = Math.max(1, Math.ceil(weeks.length / 6));
  const labels = weeks.map((w, i) => {
    if (i % labelEvery !== 0) return '';
    const x = pad + i * slotW + barW / 2;
    return `<text x="${x.toFixed(1)}" y="${height - 2}" fill="${SVG_DIM}" font-size="8" text-anchor="middle">${w.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;display:block;margin:0 auto;background:#0d0f14;border-radius:10px;">${bars}${labels}</svg>`;
}

window.toggleImgDiagram = toggleImgDiagram;
