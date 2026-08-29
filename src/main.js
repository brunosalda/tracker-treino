import './style.css';
import { initDaySelect } from './features/workout.js';
import { carregarHistorico } from './features/history.js';
import { renderBiblioteca } from './features/library-view.js';
import { renderAlimentacao, populateFoodSelect, renderPesoChart } from './features/nutrition.js';
import './features/glossary.js';
import './features/garmin.js';

/* ============ REABRIR "APP" NA TELA DE INICIO (iOS) ============
   No iOS, o app adicionado a Tela de Inicio (modo standalone) costuma
   ficar suspenso em segundo plano em vez de recarregar — reabrir só
   "acorda" a página antiga, sem buscar dados novos do Supabase. Isso
   força uma recarga sempre que o app volta a ficar visível. */
window.addEventListener('pageshow', function (event) {
  if (event.persisted) location.reload();
});
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') location.reload();
});

/* ============ TABS ============ */
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
    if (t.dataset.tab === 'historico') carregarHistorico();
    if (t.dataset.tab === 'biblioteca') renderBiblioteca();
  });
});

document.querySelectorAll('.subtab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.subtab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.subpanel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.subtab).classList.add('active');
    if (t.dataset.subtab === 'hoje-alimentacao') {
      renderAlimentacao();
      populateFoodSelect('calc-food-select');
      populateFoodSelect('calc-food-select-2');
      renderPesoChart();
    }
  });
});

/* ============ INIT ============ */
document.getElementById('peso-data').valueAsDate = new Date();
initDaySelect();

const splash = document.getElementById('splash');
if (splash) {
  requestAnimationFrame(() => {
    setTimeout(() => splash.classList.add('hidden'), 4000);
  });
}
