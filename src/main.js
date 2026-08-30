import './style.css';
import { initDaySelect } from './features/workout.js';
import { carregarHistorico } from './features/history.js';
import { renderBiblioteca } from './features/library-view.js';
import { renderAlimentacao, populateFoodSelect, renderPesoChart } from './features/nutrition.js';
import './features/glossary.js';
import './features/garmin.js';

/* ============ MANTER O APP ONDE VOCÊ DEIXOU (iOS standalone) ============
   Minimizar e reabrir o app (adicionado à Tela de Início) NÃO deve parecer
   um recarregamento — é o app continuando de onde parou, como qualquer
   app nativo. Por isso não forçamos reload em pageshow/visibilitychange;
   quando o WebKit realmente descarta o processo em segundo plano (memória
   baixa), o JS reinicia do zero de qualquer forma, e restauramos a aba e
   sub-aba ativas abaixo (o wizard de treino já tem seu próprio resume via
   localStorage, ver wizardResume em workout.js). */
const TAB_STATE_KEY = 'activeTabState';

function salvarAbaAtiva(tab, subtab) {
  try { localStorage.setItem(TAB_STATE_KEY, JSON.stringify({ tab, subtab })); } catch (e) {}
}
function lerAbaAtiva() {
  try { return JSON.parse(localStorage.getItem(TAB_STATE_KEY)) || null; } catch (e) { return null; }
}

/* ============ TABS ============ */
function ativarTab(tabName) {
  const el = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (!el) return;
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tabName).classList.add('active');
  if (tabName === 'historico') carregarHistorico();
  if (tabName === 'biblioteca') renderBiblioteca();
}
function ativarSubtab(subtabName) {
  const el = document.querySelector(`.subtab[data-subtab="${subtabName}"]`);
  if (!el) return;
  document.querySelectorAll('.subtab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.subpanel').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(subtabName).classList.add('active');
  if (subtabName === 'hoje-alimentacao') {
    renderAlimentacao();
    populateFoodSelect('calc-food-select');
    populateFoodSelect('calc-food-select-2');
    renderPesoChart();
  }
}

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    ativarTab(t.dataset.tab);
    salvarAbaAtiva(t.dataset.tab, document.querySelector('.subtab.active')?.dataset.subtab);
  });
});

document.querySelectorAll('.subtab').forEach(t => {
  t.addEventListener('click', () => {
    ativarSubtab(t.dataset.subtab);
    salvarAbaAtiva(document.querySelector('.tab.active')?.dataset.tab, t.dataset.subtab);
  });
});

const abaSalva = lerAbaAtiva();
if (abaSalva && abaSalva.tab && abaSalva.tab !== 'hoje') ativarTab(abaSalva.tab);
if (abaSalva && abaSalva.subtab && abaSalva.subtab !== 'hoje-treino') ativarSubtab(abaSalva.subtab);

/* ============ INIT ============ */
document.getElementById('peso-data').valueAsDate = new Date();
initDaySelect();

const todayDateEl = document.getElementById('today-date');
if (todayDateEl) {
  const formatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  todayDateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const splash = document.getElementById('splash');
if (splash) {
  requestAnimationFrame(() => {
    setTimeout(() => splash.classList.add('hidden'), 4000);
  });
}
