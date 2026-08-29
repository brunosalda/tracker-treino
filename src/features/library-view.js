import { LIBRARY } from '../data/library.js';
import { DIAGRAMS } from '../data/diagrams.js';
import { acaoImagemVideo } from '../lib/svg-helpers.js';

/* ============ BIBLIOTECA ============ */
export function renderBiblioteca(scrollToId) {
  const container = document.getElementById('biblioteca-content');
  const order = ['mobilidade', 'corrida', 'musculacao'];
  container.innerHTML = order.map(catKey => {
    const cat = LIBRARY[catKey];
    if (catKey === 'mobilidade') {
      return `<div class="cat-header">${cat.label}</div>` + cat.items.map(item => {
        if (item.id === 'mob-protocolo') {
          return `<details id="cue-${item.id}">
            <summary>${item.nome} <span class="grade grade-${item.grade}">${item.grade.toUpperCase()}</span></summary>
            ${acaoImagemVideo(DIAGRAMS[item.id] || '', item.nome)}
            <h4>Execução</h4>
            <ul>${item.exec.map(e => `<li>${e}</li>`).join('')}</ul>
            ${item.evidencia ? `<h4>Evidência</h4><p>${item.evidencia}</p>` : ''}
          </details>`;
        }
        return `<details id="cue-${item.id}">
          <summary>${item.nome} <span class="grade grade-${item.grade}">${item.grade.toUpperCase()}</span></summary>
          ${acaoImagemVideo(DIAGRAMS[item.id] || '', item.nome)}
          <h4>Execução</h4>
          <ul>${item.exec.map(e => `<li>${e}</li>`).join('')}</ul>
          ${item.erros && item.erros.length ? `<h4>Erros comuns</h4><ul>${item.erros.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
          ${item.evidencia ? `<h4>Evidência</h4><p>${item.evidencia}</p>` : ''}
          <div id="mob-log-biblioteca-${item.id}" class="set-log" style="margin-top:6px;"></div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <button class="secondary" style="flex:1;" onclick="iniciarAlongamento('biblioteca','${item.id}',45,'esquerda')">▶️ Lado esquerdo (45s)</button>
            <button class="secondary" style="flex:1;" onclick="iniciarAlongamento('biblioteca','${item.id}',45,'direita')">▶️ Lado direito (45s)</button>
          </div>
        </details>`;
      }).join('');
    }
    return `<div class="cat-header">${cat.label}</div>` + cat.items.map(item => `
      <details id="cue-${item.id}">
        <summary>${item.nome} <span class="grade grade-${item.grade}">${item.grade.toUpperCase()}</span></summary>
        ${acaoImagemVideo(DIAGRAMS[item.id] || '', item.nome)}
        <h4>Execução</h4>
        <ul>${item.exec.map(e => `<li>${e}</li>`).join('')}</ul>
        ${item.erros && item.erros.length ? `<h4>Erros comuns</h4><ul>${item.erros.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
        ${item.evidencia ? `<h4>Evidência</h4><p>${item.evidencia}</p>` : ''}
      </details>
    `).join('');
  }).join('');

  if (scrollToId) {
    setTimeout(() => {
      const target = document.getElementById(`cue-${scrollToId}`);
      if (target) { target.setAttribute('open', true); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, 50);
  }
}
