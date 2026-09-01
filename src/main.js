import './style.css';
import { initDaySelect } from './features/workout.js';
import { carregarHistorico } from './features/history.js';
import { renderBiblioteca } from './features/library-view.js';
import { renderAlimentacao, populateFoodSelect, renderPesoChart } from './features/nutrition.js';
import { carregarEstatisticas } from './features/stats.js';
import { initAuthGate } from './features/auth.js';
import { renderPerfil, initFotoHeader } from './features/profile.js';
import { carregarPlanoDoUsuario, METAS, SEMANA } from './data/program.js';
import { storage } from './lib/storage.js';
import './features/glossary.js';
import './features/garmin.js';
import './features/backup.js';

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

/* ============ TABS ============
   A tab bar inferior tem 5 itens; os painéis "garmin" e "plano" não têm
   botão próprio — são subpáginas do "Mais" (o item Mais fica acentuado). */
const BAR_FOR_PANEL = { garmin: 'mais', plano: 'mais', perfil: 'mais' };

function ativarTab(tabName) {
  const panel = document.getElementById(tabName);
  if (!panel || !panel.classList.contains('panel')) return;
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  panel.classList.add('active');
  const barName = BAR_FOR_PANEL[tabName] || tabName;
  document.querySelectorAll('.tabbar-item').forEach(x =>
    x.classList.toggle('active', x.dataset.tab === barName));
  // "Mais" saiu da tab bar — quando ele (ou uma subpágina dele) está aberto,
  // a engrenagem do header acende no lugar
  const gear = document.querySelector('.header-gear');
  if (gear) gear.classList.toggle('active', barName === 'mais');
  window.scrollTo(0, 0);
  if (tabName === 'historico') carregarHistorico();
  if (tabName === 'biblioteca') renderBiblioteca();
  if (tabName === 'estatisticas') carregarEstatisticas();
  if (tabName === 'perfil') renderPerfil();
}
window.ativarTabGlobal = (name) => {
  ativarTab(name);
  salvarAbaAtiva(name, document.querySelector('.subtab.active')?.dataset.subtab);
};
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

/* ============ INIT (só depois de autenticado) ============ */
/* Blocos de metas e a tabela semanal são renderizados do plano ativo —
   cada usuário pode ter o próprio (chave 'plan' no storage). */
function renderPlanoUI() {
  const grid = (kcalLabel) => `
    <div class="stat"><div class="n">~${METAS.kcal}</div><div class="l">${kcalLabel}</div></div>
    <div class="stat"><div class="n">${METAS.proteina}g</div><div class="l">Proteína</div></div>
    <div class="stat"><div class="n">${METAS.carboidrato}g</div><div class="l">Carboidrato</div></div>
    <div class="stat"><div class="n">${METAS.gordura}g</div><div class="l">Gordura</div></div>`;
  const hoje = document.getElementById('metas-hoje-grid');
  if (hoje) hoje.innerHTML = grid('kcal');
  const plano = document.getElementById('metas-plano-grid');
  if (plano) plano.innerHTML = grid('kcal/dia');
  const tabela = document.getElementById('plano-week-table');
  if (tabela) {
    tabela.innerHTML = '<tr><th>Dia</th><th>Sessão</th><th>Foco</th></tr>' +
      SEMANA.map(([dia, sessao, foco]) => `<tr><td>${dia}</td><td>${sessao}</td><td>${foco}</td></tr>`).join('');
  }
}

async function initApp() {
  // plano do usuário ANTES de qualquer render que dependa dele
  await carregarPlanoDoUsuario(storage);
  renderPlanoUI();

  document.querySelectorAll('.tabbar-item').forEach(t => {
    t.addEventListener('click', () => {
      ativarTab(t.dataset.tab);
      salvarAbaAtiva(t.dataset.tab, document.querySelector('.subtab.active')?.dataset.subtab);
    });
  });

  document.querySelectorAll('.subtab').forEach(t => {
    t.addEventListener('click', () => {
      ativarSubtab(t.dataset.subtab);
      salvarAbaAtiva(document.querySelector('.tabbar-item.active')?.dataset.tab, t.dataset.subtab);
    });
  });

  const abaSalva = lerAbaAtiva();
  if (abaSalva && abaSalva.tab && abaSalva.tab !== 'hoje') ativarTab(abaSalva.tab);
  if (abaSalva && abaSalva.subtab && abaSalva.subtab !== 'hoje-treino') ativarSubtab(abaSalva.subtab);

  document.getElementById('peso-data').valueAsDate = new Date();
  initDaySelect();

  /* ---- header pessoal: saudação, data e avatar com inicial ---- */
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    const formatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  const greetEl = document.getElementById('header-greet');
  if (greetEl) {
    const h = new Date().getHours();
    greetEl.textContent = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }
  const avatarEl = document.getElementById('avatar');
  const email = document.getElementById('account-email')?.textContent || '';
  if (avatarEl && email) avatarEl.textContent = email.charAt(0).toUpperCase();
  initFotoHeader();
}

initAuthGate(initApp);

const splash = document.getElementById('splash');
if (splash) {
  requestAnimationFrame(() => {
    setTimeout(() => splash.classList.add('hidden'), 4000);
  });
}
