import { PROGRAM, DAY_TO_TYPE, RUNNING_PLAN } from '../data/program.js';
import { LIBRARY } from '../data/library.js';
import { DIAGRAMS } from '../data/diagrams.js';
import { acaoImagemVideo } from '../lib/svg-helpers.js';
import { storage } from '../lib/storage.js';
import { hojeStr } from '../lib/date-utils.js';

/* ============ ESTADO ============ */
let sessionSets = {}; // { exerciseId: [ {weight, reps, rir/time} ] }
let currentDayType = null;
let restInterval = null;

// Sessão de treino guiada (wizard de clique único) + autosave por série
let wizard = null;           // { exercicios, exIdx, setIdx, tipoSessao }
let currentLogKey = null;    // chave 'log:AAAA-MM-DD:timestamp' da sessão em andamento
let currentLogEntry = null;  // objeto salvo a cada série registrada (autosave)
let wizardTimer = null;      // interval do descanso (contagem regressiva)
let wizardStopwatch = null;  // interval do cronômetro de série por tempo (contagem crescente)

export async function getCorridaSemana() {
  try {
    const r = await storage.get('corridaSemana');
    return r && r.value ? parseInt(r.value) : 1;
  } catch (e) { return 1; }
}
async function setCorridaSemana(n) {
  n = Math.max(1, Math.min(4, n));
  await storage.set('corridaSemana', String(n));
  renderWorkoutArea('corrida');
}

/* ============ INICIALIZAÇÃO DO DIA ============ */
export function initDaySelect() {
  const sel = document.getElementById('day-select');
  const today = new Date().getDay();
  const opts = [
    { v: "A", l: "Musculação A" }, { v: "B", l: "Musculação B" }, { v: "C", l: "Musculação C" },
    { v: "corrida", l: "Corrida" }, { v: "mobilidade", l: "Mobilidade" }, { v: "descanso", l: "Descanso" }
  ];
  sel.innerHTML = opts.map(o => `<option value="${o.v}">${o.l}</option>`).join('');
  sel.value = DAY_TO_TYPE[today];
  sel.addEventListener('change', () => renderWorkoutArea(sel.value));
  renderWorkoutArea(sel.value);
}

async function renderWorkoutArea(type) {
  currentDayType = type;
  sessionSets = {};
  currentLogKey = null;
  currentLogEntry = null;
  wizard = null;
  clearInterval(wizardTimer);
  clearInterval(wizardStopwatch);
  const area = document.getElementById('workout-area');
  const finalizar = document.getElementById('finalizar-card');
  const today = new Date().getDay();

  if (type === 'A' || type === 'B' || type === 'C') {
    const prog = PROGRAM[type];
    area.innerHTML = `
      <div class="card">
        <h3>Aquecimento (antes de começar) — ~10-12 min</h3>
        <ol style="font-size:13px;color:var(--text-dim);line-height:1.6;padding-left:18px;margin:4px 0;">
          <li><strong>Geral (5 min):</strong> esteira, bike ou polichinelos em ritmo leve, só pra subir a temperatura e ativar o corpo.</li>
          <li><strong>Mobilidade dinâmica (3-5 min):</strong> balanços de perna, agachamento com rotação de tronco, círculos de quadril e ombro — nada de alongamento estático longo aqui.</li>
          <li><strong>Séries de aproximação:</strong> nos exercícios marcados com 🔥 abaixo, faça 2-3 séries subindo a carga gradualmente até chegar no peso de trabalho — o app já calcula isso pra você com base na sua última sessão.</li>
        </ol>
        <p style="font-size:12px;color:var(--danger);margin:4px 0 0;">Nunca comece um exercício composto pesado direto na carga de trabalho, mesmo já aquecido de forma geral.</p>
      </div>
      <div class="card">
        <h3>${prog.label} — ~35-40 min</h3>
        <h4>Diretrizes de hoje</h4>
        <ul style="font-size:13px;color:var(--text-dim);line-height:1.6;padding-left:18px;margin:4px 0;">
          <li>Faça todas as séries entre <strong>RIR 0–3</strong><span class="qmark" onclick="abrirGlossario('rir')">?</span> (perto da falha, sem chegar sempre até zero).</li>
          <li>Descanso conforme indicado em cada exercício — compostos pesados (agachamento, RDL, leg press) precisam de mais tempo que isolados.</li>
          <li><strong>Progressão:</strong> suba a carga quando completar o topo da faixa de reps com técnica limpa em <em>todas</em> as séries do exercício.</li>
          <li><strong>Deload:</strong><span class="qmark" onclick="abrirGlossario('deload')">?</span> a cada 4 semanas, considere 1 semana com ~40–50% do volume (menos séries) se sentir fadiga acumulada, dor persistente ou queda de desempenho.</li>
          <li>Amplitude completa (ROM<span class="qmark" onclick="abrirGlossario('rom')">?</span> total) em todos os exercícios — é parte do estímulo de hipertrofia e também trabalha sua mobilidade.</li>
        </ul>
      </div>
      <div id="wizard-area"></div>
      <div class="card">
        <h3>Finalização — alongamento MMII (~10 min)</h3>
        <p style="font-size:13px;color:var(--text-dim);">Independente do treino do dia, feche a sessão com este bloco curto — trabalha diretamente sua prioridade de mobilidade e ajuda a completar a hora de treino.</p>
        ${LIBRARY.mobilidade.items.filter(i => ['mob-quadril', 'mob-isquio', 'mob-adutor', 'mob-tornozelo'].includes(i.id)).map(i => renderMobilidadeItem(i, 40, "1-2 séries de 30-45s", "final")).join('')}
      </div>`;
    finalizar.style.display = 'block';
    iniciarSessaoTreino(prog.exercicios, 'musculacao');

  } else if (type === 'corrida') {
    const semana = await getCorridaSemana();
    const plano = RUNNING_PLAN[semana];
    let subtipo = 'facil', subtipoLabel = 'Corrida fácil (Z1)';
    if (today === 6) { subtipo = 'variacao'; subtipoLabel = 'Corrida com variação (tempo/fartlek)'; }
    if (today === 0) { subtipo = 'longo'; subtipoLabel = 'Corrida longa'; }

    area.innerHTML = `
      <div class="card">
        <h3>Corrida de hoje — ${subtipoLabel}</h3>
        <div class="row" style="align-items:center;margin-bottom:6px;">
          <div><label style="margin:0;">Semana do plano</label></div>
          <div style="flex:0 0 auto;display:flex;gap:6px;">
            <button class="secondary" style="padding:6px 12px;" onclick="setCorridaSemana(${semana - 1})">−</button>
            <div style="padding:6px 14px;background:#0d0f14;border-radius:8px;">${semana}/4</div>
            <button class="secondary" style="padding:6px 12px;" onclick="setCorridaSemana(${semana + 1})">+</button>
          </div>
        </div>
        <div class="suggestion">Meta de hoje: ${plano[subtipo]}</div>
        <h4>Aquecimento antes de correr</h4>
        <ul style="font-size:13px;color:var(--text-dim);line-height:1.6;padding-left:18px;margin:4px 0;">
          <li>5 min de caminhada rápida ou trote bem leve.</li>
          <li>Skipping baixo, elevação de joelho e chute no glúteo, 20-30s cada, leve.</li>
          <li>2-3 balanços dinâmicos de perna (frente/trás e lateral) por lado — nada de alongamento estático longo aqui.</li>
          <li>Comece a corrida principal em ritmo ainda mais leve que o alvo por 3-5 min antes de assumir o ritmo da zona.</li>
        </ul>
        <h4>Diretrizes</h4>
        <ul style="font-size:13px;color:var(--text-dim);line-height:1.6;padding-left:18px;margin:4px 0;">
          <li>Zona 1<span class="qmark" onclick="abrirGlossario('zona')">?</span> = ritmo em que você consegue conversar frases inteiras sem ofegar.</li>
          <li>Se notar "passada longa" (pé aterrissando muito à frente do corpo), aumente a cadência em 5–10%.</li>
          <li>Avance de semana só quando a atual estiver confortável — sem dor articular, sem fadiga excessiva no dia seguinte.</li>
          <li>Após a semana 4, repita o padrão da semana 4 aumentando ~10%/semana enquanto estiver confortável.</li>
        </ul>
        ${acaoImagemVideo(DIAGRAMS['corrida-postura'], 'postura de corrida cadência')}
        <p style="font-size:13px;color:var(--text-dim);">Registre rápido aqui, ou use a aba <strong>Importar Garmin</strong> depois do treino para preencher automaticamente.</p>
        <label>Distância (km)</label><input type="number" step="0.01" id="q-dist">
        <label>Tempo (min)</label><input type="number" step="0.1" id="q-tempo">
        <label>Zona predominante<span class="qmark" onclick="abrirGlossario('zona')">?</span></label>
        <select id="q-zona"><option>Z1</option><option>Z2</option><option>Z3</option><option>Z4</option><option>Z5</option></select>
      </div>
      <div class="card">
        <h3>Depois de correr (~25-30 min)</h3>
        <p style="font-size:13px;color:var(--text-dim);">Não é pra correr mais tempo pra "completar a hora" — isso aumentaria o risco de lesão fora da progressão segura. Em vez disso, complete a sessão com isto:</p>
        <h4>Mobilidade complementar (15-20 min)</h4>
        ${LIBRARY.mobilidade.items.filter(i => ['mob-quadril', 'mob-isquio', 'mob-adutor', 'mob-tornozelo'].includes(i.id)).map(i => renderMobilidadeItem(i, 45, "2-3 séries de 30-60s", "corrida")).join('')}
        <h4 style="margin-top:14px;">Ativação leve para corredores (5-10 min)</h4>
        <ul style="font-size:13px;color:var(--text-dim);line-height:1.6;padding-left:18px;margin:4px 0;">
          <li>Panturrilha isométrica (parede) — 3x20-30s.</li>
          <li>Ponte de glúteo (glute bridge) — 2x12-15.</li>
          <li>Prancha — 2x30-40s.</li>
        </ul>
        <p style="font-size:12px;color:var(--text-dim);">Trabalho leve, não-fatigante — melhora economia de corrida sem interferir na recuperação (Denadai et al., 2017; Eihara et al., 2022; Seção 3).</p>
      </div>`;
    finalizar.style.display = 'block';

  } else if (type === 'mobilidade') {
    const itens = LIBRARY.mobilidade.items.filter(i => i.id !== 'mob-protocolo');
    const alongamentos = itens.filter(i => ['mob-quadril', 'mob-isquio', 'mob-adutor', 'mob-tornozelo'].includes(i.id));
    const circuito = PROGRAM.mobilidade;

    area.innerHTML = `
      <div class="card">
        <h3>Mobilidade dedicada (MMII<span class="qmark" onclick="abrirGlossario('mmii')">?</span>) — ~55-60 min</h3>
        <p style="font-size:13px;color:var(--text-dim);">Desconforto leve a moderado nos alongamentos — nunca dor aguda. CARs e foam roller ficam na Biblioteca como opcionais, fora do fluxo padrão.</p>
      </div>

      <div class="card">
        <h4 style="margin:0 0 4px;color:var(--accent);">Fase 1 — Aquecimento leve (5 min)</h4>
        <p style="font-size:12px;color:var(--text-dim);">Caminhada ou bike bem leve, só pra subir a temperatura antes de alongar.</p>
      </div>

      <div class="card">
        <h4 style="margin:0 0 4px;color:var(--accent);">Fase 2 — Alongamento estático completo (25-30 min)</h4>
        <p style="font-size:12px;color:var(--text-dim);">3 séries de 45-60s por lado, cada região.</p>
      </div>
      ${alongamentos.map(i => renderMobilidadeItem(i, 50, "3 séries de 45-60s", "dedicada")).join('')}

      <div class="card">
        <h4 style="margin:0 0 4px;color:var(--accent);">Fase 3 — Circuito de estabilidade e core (15-20 min)</h4>
        <p style="font-size:12px;color:var(--text-dim);">Carga leve, foco em controle. Glúteo médio e core são pontos-chave de prevenção de lesão em corredores (Seção 3 e 9) — justifica o treino ser aqui na academia, não só alongamento.</p>
      </div>
      <div id="wizard-area"></div>

      <div class="card">
        <label>Duração total (min)</label><input type="number" id="q-dur">
        <label>Áreas trabalhadas</label><input type="text" id="q-areas" placeholder="Ex: quadril, isquio, tornozelo, core">
      </div>`;
    finalizar.style.display = 'block';
    iniciarSessaoTreino(circuito.exercicios, 'mobilidade');
  } else {
    area.innerHTML = `
      <div class="card">
        <h3>Dia de descanso</h3>
        <p style="font-size:13px;color:var(--text-dim);line-height:1.6;">
          Sono é a intervenção de maior custo-benefício: priorize 7–9h esta noite. Privação de sono reduz força máxima,
          potência explosiva e aumenta a percepção de esforço no treino seguinte. Aproveite para manter a proteína em dia
          mesmo sem treino — a síntese muscular continua acontecendo nas 24–48h após a última sessão.
        </p>
      </div>`;
    finalizar.style.display = 'block';
  }
}

function renderExerciseCard(ex) {
  const rangeLabel = ex.isTime ? "tempo" : `${ex.repMin}–${ex.repMax} reps`;
  const cueItem = LIBRARY.musculacao.items.find(i => i.id === ex.cue);
  const execHtml = cueItem ? `
    <details>
      <summary>Como executar</summary>
      ${acaoImagemVideo(DIAGRAMS[cueItem.id] || '', ex.nome)}
      <h4>Execução</h4>
      <ul>${cueItem.exec.map(e => `<li>${e}</li>`).join('')}</ul>
      ${cueItem.erros && cueItem.erros.length ? `<h4>Erros comuns</h4><ul>${cueItem.erros.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      ${cueItem.evidencia ? `<h4>Por quê</h4><p>${cueItem.evidencia}</p>` : ''}
    </details>` : '';
  return `
    <div class="card exercise-card" id="card-${ex.id}">
      <div class="ex-title">
        <div>
          <div class="name">${ex.principal ? '🔥 ' : ''}${ex.nome}</div>
          <div class="meta">${ex.sets} séries · ${rangeLabel} · descanso ${ex.rest}s</div>
        </div>
      </div>
      ${execHtml}
      <div class="suggestion" id="sugestao-${ex.id}">Carregando sugestão...</div>
      <div id="log-${ex.id}" class="set-log"></div>
      <div id="input-${ex.id}"></div>
      <button class="secondary" style="margin-top:10px;width:100%;" onclick="abrirInputSerie('${ex.id}')">+ Registrar série</button>
    </div>`;
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

async function preencherSugestao(ex) {
  const el = document.getElementById(`sugestao-${ex.id}`);
  try {
    const r = await storage.get('lastset:' + ex.id);
    if (!r || !r.value) {
      el.textContent = ex.principal
        ? "Primeira vez neste exercício — comece leve, suba aos poucos até achar uma carga de trabalho confortável (sem chegar perto da falha hoje)."
        : "Primeira vez registrando este exercício — comece com uma carga confortável.";
      return;
    }
    const last = JSON.parse(r.value);
    if (ex.isTime) {
      el.textContent = `Última vez: ${last.time}s. Tente igualar ou passar um pouco.`;
      return;
    }
    let targetWeight = parseFloat(last.weight);
    let texto = `Última vez: ${last.weight}kg x${last.reps} (RIR ${last.rir})`;
    if (last.reps >= ex.repMax && last.rir <= 1 && ex.inc > 0) {
      targetWeight = parseFloat(last.weight) + ex.inc;
      texto += ` → sugestão: subir para ${targetWeight.toFixed(1)}kg`;
    } else if (ex.inc > 0) {
      texto += ` → sugestão: manter ${last.weight}kg, buscar +1 rep ou RIR menor`;
    }

    if (ex.principal && targetWeight > 0) {
      const step = ex.inc >= 5 ? 5 : 2.5;
      const w40 = roundToStep(targetWeight * 0.4, step);
      const w60 = roundToStep(targetWeight * 0.6, step);
      const w80 = roundToStep(targetWeight * 0.8, step);
      texto += `<br>🔥 <strong>Aquecimento específico</strong> (antes da carga de trabalho):<br>` +
        `${w40}kg x8-10 → ${w60}kg x5-6 → ${w80}kg x2-3 → aí sim ${targetWeight.toFixed(1)}kg de trabalho`;
    }

    el.innerHTML = texto;
  } catch (e) {
    el.textContent = "Primeira vez registrando este exercício.";
  }
}

function abrirInputSerie(exId) {
  const prog = PROGRAM[currentDayType];
  const ex = prog.exercicios.find(e => e.id === exId);
  const container = document.getElementById(`input-${exId}`);
  if (ex.isTime) {
    container.innerHTML = `
      <label>Tempo (segundos)</label>
      <div class="stepper">
        <button onclick="ajustarValor('${exId}','time',-5)">−</button>
        <div class="val" id="val-${exId}-time">30</div>
        <button onclick="ajustarValor('${exId}','time',5)">+</button>
      </div>
      <button class="big" onclick="registrarSerie('${exId}')">Concluir série</button>`;
  } else {
    container.innerHTML = `
      <label>Peso (kg)</label>
      <div class="stepper">
        <button onclick="ajustarValor('${exId}','weight',-2.5)">−</button>
        <div class="val" id="val-${exId}-weight">20</div>
        <button onclick="ajustarValor('${exId}','weight',2.5)">+</button>
      </div>
      <label>Repetições</label>
      <div class="stepper">
        <button onclick="ajustarValor('${exId}','reps',-1)">−</button>
        <div class="val" id="val-${exId}-reps">${ex.repMin}</div>
        <button onclick="ajustarValor('${exId}','reps',1)">+</button>
      </div>
      <label>RIR<span class="qmark" onclick="abrirGlossario('rir')">?</span></label>
      <div class="stepper">
        <button onclick="ajustarValor('${exId}','rir',-1)">−</button>
        <div class="val" id="val-${exId}-rir">2</div>
        <button onclick="ajustarValor('${exId}','rir',1)">+</button>
      </div>
      <button class="big" onclick="registrarSerie('${exId}')">Concluir série</button>`;
  }
}

function ajustarValor(exId, campo, delta) {
  const el = document.getElementById(`val-${exId}-${campo}`);
  let v = parseFloat(el.textContent) + delta;
  if (campo === 'rir') v = Math.max(0, Math.min(5, v));
  if (campo === 'reps') v = Math.max(1, v);
  if (campo === 'weight') v = Math.max(0, v);
  if (campo === 'time') v = Math.max(5, v);
  el.textContent = v;
}

async function registrarSerie(exId) {
  const prog = PROGRAM[currentDayType];
  const ex = prog.exercicios.find(e => e.id === exId);
  let setData;
  if (ex.isTime) {
    setData = { time: parseFloat(document.getElementById(`val-${exId}-time`).textContent) };
  } else {
    setData = {
      weight: parseFloat(document.getElementById(`val-${exId}-weight`).textContent),
      reps: parseFloat(document.getElementById(`val-${exId}-reps`).textContent),
      rir: parseFloat(document.getElementById(`val-${exId}-rir`).textContent)
    };
  }
  if (!sessionSets[exId]) sessionSets[exId] = [];
  sessionSets[exId].push(setData);

  // salvar como "última série" para sugestão futura
  try { await storage.set('lastset:' + exId, JSON.stringify(setData)); } catch (e) {}

  renderSetLog(exId);
  document.getElementById(`input-${exId}`).innerHTML = '';

  if (sessionSets[exId].length >= ex.sets) {
    document.getElementById(`card-${exId}`).classList.add('done');
  }

  iniciarTimer(ex.rest, 'Descanso');
}

function renderSetLog(exId) {
  const el = document.getElementById(`log-${exId}`);
  const sets = sessionSets[exId] || [];
  el.innerHTML = sets.map((s, i) => {
    const label = s.time !== undefined ? `${s.time}s` : `${s.weight}kg x${s.reps} (RIR${s.rir})`;
    return `<span class="chip">Série ${i+1}: ${label}</span>`;
  }).join('');
}

function abrirCue(cueId) {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  document.querySelector('.tab[data-tab="biblioteca"]').classList.add('active');
  document.getElementById('biblioteca').classList.add('active');
  renderBiblioteca(cueId);
}

/* ============ TREINO GUIADO (clique único, autosave por série) ============
   Cada série registrada é salva no Supabase na hora (upsert na mesma chave
   'log:AAAA-MM-DD:timestamp' da sessão) — não existe mais um botão de
   "salvar treino" no final. O fluxo mostra sempre UMA tela por vez:
   - exercícios por repetição: já entra direto no registro da série; ao
     concluir, o descanso começa sozinho e, quando termina, a tela seguinte
     (próxima série ou próximo exercício) já aparece pronta pra preencher.
   - exercícios por tempo (isTime): aparece um botão "Iniciar série", que
     dispara um cronômetro contando; ao concluir, o descanso começa sozinho
     e, no final, aparece o botão pra iniciar a próxima série.
   O botão "Encerrar treino" (ver encerrarTreino) só registra sono/observação
   final — as séries já estão salvas antes disso. */
function novoLogEntryBase(tipoSessao) {
  const date = hojeStr();
  const entry = { date, sono: null, obs: '', horaInicio: new Date().toISOString() };
  if (tipoSessao === 'musculacao') {
    entry.type = 'musculacao';
    entry.treino = currentDayType;
    entry.sets = {};
  } else if (tipoSessao === 'mobilidade') {
    entry.type = 'mobilidade';
    entry.duracao = null;
    entry.areas = '';
    entry.sets = {};
  }
  return entry;
}

// Retomada de sessão (o app minimizado/em segundo plano pode ser descarregado
// da memória pelo navegador/celular — ao reabrir, o JS reinicia do zero. Sem
// isso, o progresso do wizard "zerava" mesmo com as séries já salvas no Supabase.)
const WIZARD_RESUME_KEY = 'wizardResume';

function salvarWizardResume() {
  if (!wizard || !currentLogKey) return;
  try {
    localStorage.setItem(WIZARD_RESUME_KEY, JSON.stringify({
      date: hojeStr(),
      dayType: currentDayType,
      tipoSessao: wizard.tipoSessao,
      exIdx: wizard.exIdx,
      setIdx: wizard.setIdx,
      currentLogKey,
      currentLogEntry,
      sessionSets
    }));
  } catch (e) {}
}

function limparWizardResume() {
  try { localStorage.removeItem(WIZARD_RESUME_KEY); } catch (e) {}
}

function lerWizardResume() {
  try {
    const raw = localStorage.getItem(WIZARD_RESUME_KEY);
    if (!raw) return null;
    const st = JSON.parse(raw);
    if (st.date !== hojeStr()) { limparWizardResume(); return null; }
    return st;
  } catch (e) { return null; }
}

function iniciarSessaoTreino(exercicios, tipoSessao) {
  const resume = lerWizardResume();
  if (resume && resume.dayType === currentDayType && resume.tipoSessao === tipoSessao && resume.currentLogKey) {
    sessionSets = resume.sessionSets || {};
    currentLogKey = resume.currentLogKey;
    currentLogEntry = resume.currentLogEntry;
    wizard = { exercicios, exIdx: resume.exIdx, setIdx: resume.setIdx, tipoSessao };
    avancarOuMostrarEtapaWizard();
    return;
  }
  sessionSets = {};
  currentLogKey = 'log:' + hojeStr() + ':' + Date.now();
  currentLogEntry = novoLogEntryBase(tipoSessao);
  wizard = { exercicios, exIdx: 0, setIdx: 0, tipoSessao };
  renderWizardIntro();
}

function renderWizardIntro() {
  const el = document.getElementById('wizard-area');
  if (!el || !wizard) return;
  el.innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>Pronto pra começar?</h3>
      <p style="font-size:13px;color:var(--text-dim);">${wizard.exercicios.length} exercícios nesta sessão. A tela vai te guiar um passo de cada vez — cada série já é salva sozinha assim que você registra.</p>
      <button class="big" style="margin-top:6px;" onclick="iniciarProximaEtapaWizard()">▶ Iniciar treino</button>
    </div>`;
}

function exercicioAtualWizard() {
  return wizard.exercicios[wizard.exIdx];
}

function wizardExecHtml(ex) {
  const cueItem = LIBRARY.musculacao.items.find(i => i.id === ex.cue);
  if (!cueItem) return '';
  return `
    <details style="margin-top:8px;">
      <summary>Como executar</summary>
      ${acaoImagemVideo(DIAGRAMS[cueItem.id] || '', ex.nome)}
      <h4>Execução</h4>
      <ul>${cueItem.exec.map(e => `<li>${e}</li>`).join('')}</ul>
      ${cueItem.erros && cueItem.erros.length ? `<h4>Erros comuns</h4><ul>${cueItem.erros.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      ${cueItem.evidencia ? `<h4>Por quê</h4><p>${cueItem.evidencia}</p>` : ''}
    </details>`;
}

function iniciarProximaEtapaWizard() {
  if (!wizard) return;
  const ex = exercicioAtualWizard();
  const el = document.getElementById('wizard-area');
  if (!el) return;
  const progresso = `<div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">Exercício ${wizard.exIdx + 1}/${wizard.exercicios.length} · Série ${wizard.setIdx + 1}/${ex.sets}</div>`;

  if (ex.isTime) {
    el.innerHTML = `
      <div class="card exercise-card">
        ${progresso}
        <div class="name" style="font-size:17px;">${ex.principal ? '🔥 ' : ''}${ex.nome}</div>
        <div class="meta">${ex.sets} séries por tempo · descanso ${ex.rest}s</div>
        ${wizardExecHtml(ex)}
        <div class="suggestion" id="wizard-sugestao" style="margin-top:10px;">Carregando sugestão...</div>
        <button class="big" style="margin-top:14px;width:100%;" onclick="iniciarCronometroSerieWizard()">▶ Iniciar série ${wizard.setIdx + 1}</button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="card exercise-card">
        ${progresso}
        <div class="name" style="font-size:17px;">${ex.principal ? '🔥 ' : ''}${ex.nome}</div>
        <div class="meta">${ex.repMin}–${ex.repMax} reps · descanso ${ex.rest}s</div>
        ${wizardExecHtml(ex)}
        <div class="suggestion" id="wizard-sugestao" style="margin-top:10px;">Carregando sugestão...</div>
        <label>Peso (kg)</label>
        <div class="stepper">
          <button onclick="ajustarValorWizard('weight',-2.5)">−</button>
          <div class="val" id="wizard-val-weight">20</div>
          <button onclick="ajustarValorWizard('weight',2.5)">+</button>
        </div>
        <label>Repetições</label>
        <div class="stepper">
          <button onclick="ajustarValorWizard('reps',-1)">−</button>
          <div class="val" id="wizard-val-reps">${ex.repMin}</div>
          <button onclick="ajustarValorWizard('reps',1)">+</button>
        </div>
        <label>RIR<span class="qmark" onclick="abrirGlossario('rir')">?</span></label>
        <div class="stepper">
          <button onclick="ajustarValorWizard('rir',-1)">−</button>
          <div class="val" id="wizard-val-rir">2</div>
          <button onclick="ajustarValorWizard('rir',1)">+</button>
        </div>
        <button class="big" style="margin-top:10px;width:100%;" onclick="registrarSerieWizard()">Concluir série ${wizard.setIdx + 1}</button>
      </div>`;
  }
  preencherSugestaoWizard(ex);
}

async function preencherSugestaoWizard(ex) {
  const el = document.getElementById('wizard-sugestao');
  if (!el) return;
  try {
    const r = await storage.get('lastset:' + ex.id);
    if (!r || !r.value) {
      el.textContent = ex.principal
        ? "Primeira vez neste exercício — comece leve, suba aos poucos até achar uma carga de trabalho confortável (sem chegar perto da falha hoje)."
        : "Primeira vez registrando este exercício — comece com uma carga confortável.";
      return;
    }
    const last = JSON.parse(r.value);
    if (ex.isTime) {
      el.textContent = `Última vez: ${last.time}s. Tente igualar ou passar um pouco.`;
      return;
    }
    let targetWeight = parseFloat(last.weight);
    let texto = `Última vez: ${last.weight}kg x${last.reps} (RIR ${last.rir})`;
    if (last.reps >= ex.repMax && last.rir <= 1 && ex.inc > 0) {
      targetWeight = parseFloat(last.weight) + ex.inc;
      texto += ` → sugestão: subir para ${targetWeight.toFixed(1)}kg`;
    } else if (ex.inc > 0) {
      texto += ` → sugestão: manter ${last.weight}kg, buscar +1 rep ou RIR menor`;
    }
    el.innerHTML = texto;
    const wEl = document.getElementById('wizard-val-weight');
    if (wEl && targetWeight > 0) wEl.textContent = targetWeight;
  } catch (e) {
    el.textContent = "Primeira vez registrando este exercício.";
  }
}

function ajustarValorWizard(campo, delta) {
  const el = document.getElementById(`wizard-val-${campo}`);
  let v = parseFloat(el.textContent) + delta;
  if (campo === 'rir') v = Math.max(0, Math.min(5, v));
  if (campo === 'reps') v = Math.max(1, v);
  if (campo === 'weight') v = Math.max(0, v);
  el.textContent = v;
}

function iniciarCronometroSerieWizard() {
  const ex = exercicioAtualWizard();
  const el = document.getElementById('wizard-area');
  let decorrido = 0;
  el.innerHTML = `
    <div class="card exercise-card" style="text-align:center;">
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">Exercício ${wizard.exIdx + 1}/${wizard.exercicios.length} · Série ${wizard.setIdx + 1}/${ex.sets}</div>
      <div class="name" style="font-size:17px;">${ex.nome}</div>
      <div style="font-size:48px;font-weight:700;color:var(--accent);margin:20px 0;" id="wizard-cronometro">0s</div>
      <button class="big" style="width:100%;" onclick="concluirCronometroSerieWizard()">✓ Concluir série ${wizard.setIdx + 1}</button>
    </div>`;
  clearInterval(wizardStopwatch);
  wizardStopwatch = setInterval(() => {
    decorrido++;
    const c = document.getElementById('wizard-cronometro');
    if (c) c.textContent = decorrido + 's'; else clearInterval(wizardStopwatch);
  }, 1000);
}

async function concluirCronometroSerieWizard() {
  clearInterval(wizardStopwatch);
  const c = document.getElementById('wizard-cronometro');
  const segundos = c ? parseInt(c.textContent) : 0;
  await registrarSerieDadosWizard({ time: segundos });
}

async function registrarSerieWizard() {
  const weight = parseFloat(document.getElementById('wizard-val-weight').textContent);
  const reps = parseFloat(document.getElementById('wizard-val-reps').textContent);
  const rir = parseFloat(document.getElementById('wizard-val-rir').textContent);
  await registrarSerieDadosWizard({ weight, reps, rir });
}

async function registrarSerieDadosWizard(setData) {
  const ex = exercicioAtualWizard();
  // timestamp exato de cada série — é o que permite cruzar com a FC do Garmin depois
  setData.ts = new Date().toISOString();
  if (!sessionSets[ex.id]) sessionSets[ex.id] = [];
  sessionSets[ex.id].push(setData);
  currentLogEntry.sets = sessionSets;

  // autosave imediato: essa série já vai pro Supabase agora, sem esperar o fim do treino
  try { await storage.set(currentLogKey, JSON.stringify(currentLogEntry)); } catch (e) {}
  try { await storage.set('lastset:' + ex.id, JSON.stringify(setData)); } catch (e) {}

  wizard.setIdx++;
  salvarWizardResume();
  iniciarDescansoWizard(ex.rest, ex);
}

function iniciarDescansoWizard(segundos, exConcluido) {
  const el = document.getElementById('wizard-area');
  let restante = segundos;
  el.innerHTML = `
    <div class="card exercise-card" style="text-align:center;">
      <div style="font-size:12px;color:var(--text-dim);">Exercício ${wizard.exIdx + 1}/${wizard.exercicios.length} · Série ${wizard.setIdx}/${exConcluido.sets} concluída ✓</div>
      <div style="font-size:14px;color:var(--text-dim);margin-top:6px;">Descanso</div>
      <div style="font-size:48px;font-weight:700;color:var(--accent);margin:14px 0;" id="wizard-descanso-n">${restante}s</div>
      <button class="secondary" onclick="pularDescansoWizard()">Pular descanso</button>
    </div>`;
  clearInterval(wizardTimer);
  wizardTimer = setInterval(() => {
    restante--;
    const n = document.getElementById('wizard-descanso-n');
    if (n) n.textContent = restante + 's';
    if (restante <= 0) {
      clearInterval(wizardTimer);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      avancarEtapaWizard();
    }
  }, 1000);
}

function pularDescansoWizard() {
  clearInterval(wizardTimer);
  avancarEtapaWizard();
}

function avancarEtapaWizard() {
  avancarOuMostrarEtapaWizard();
}

// Compartilhada entre "descanso acabou normalmente" e "retomando sessão depois
// de reabrir o app": decide se rola pro próximo exercício ou mostra a etapa atual.
function avancarOuMostrarEtapaWizard() {
  if (!wizard) return;
  const ex = exercicioAtualWizard();
  if (wizard.setIdx >= ex.sets) {
    wizard.exIdx++;
    wizard.setIdx = 0;
  }
  if (wizard.exIdx >= wizard.exercicios.length) {
    renderWizardConcluido();
    return;
  }
  salvarWizardResume();
  iniciarProximaEtapaWizard();
}

function renderWizardConcluido() {
  limparWizardResume();
  const el = document.getElementById('wizard-area');
  if (!el) return;
  el.innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>🎉 Treino de força concluído</h3>
      <p style="font-size:13px;color:var(--text-dim);">Todas as séries já foram salvas automaticamente. Feche com o alongamento abaixo e registre sono/observações no fim da página pra encerrar.</p>
    </div>`;
}

/* ============ CRONÔMETRO (descanso entre séries E alongamentos) ============ */
function iniciarTimer(segundos, label) {
  clearInterval(restInterval);
  let restante = segundos;
  const timer = document.getElementById('rest-timer');
  const n = document.getElementById('rest-n');
  const lbl = document.getElementById('rest-label');
  lbl.textContent = label || 'Descanso';
  n.textContent = restante;
  timer.classList.add('active');
  restInterval = setInterval(() => {
    restante--;
    n.textContent = restante;
    if (restante <= 0) {
      clearInterval(restInterval);
      timer.classList.remove('active');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  }, 1000);
}
function pularDescanso() {
  clearInterval(restInterval);
  document.getElementById('rest-timer').classList.remove('active');
}

/* ============ CONTADOR DE ALONGAMENTOS (mobilidade) ============ */
let mobilitySessionCount = {};
function iniciarAlongamento(uid, itemId, segundos, ladoLabel) {
  const key = uid + ':' + itemId;
  if (!mobilitySessionCount[key]) mobilitySessionCount[key] = 0;
  mobilitySessionCount[key]++;
  const el = document.getElementById(`mob-log-${uid}-${itemId}`);
  if (el) {
    const n = mobilitySessionCount[key];
    el.innerHTML = Array.from({ length: n }, (_, i) => `<span class="chip">Série ${i + 1} ✓</span>`).join('');
  }
  iniciarTimer(segundos, 'Alongamento' + (ladoLabel ? ' — ' + ladoLabel : ''));
}
function renderMobilidadeItem(item, holdSeconds, setsLabel, uid) {
  return `
    <details>
      <summary>${item.nome}${setsLabel ? ' (' + setsLabel + ')' : ''}</summary>
      ${acaoImagemVideo(DIAGRAMS[item.id] || '', item.nome)}
      <ul>${item.exec.map(e => `<li>${e}</li>`).join('')}</ul>
      ${item.erros && item.erros.length ? `<h4>Erros comuns</h4><ul>${item.erros.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      <div id="mob-log-${uid}-${item.id}" class="set-log" style="margin-top:6px;"></div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="secondary" style="flex:1;" onclick="iniciarAlongamento('${uid}','${item.id}',${holdSeconds},'esquerda')">▶️ Lado esquerdo (${holdSeconds}s)</button>
        <button class="secondary" style="flex:1;" onclick="iniciarAlongamento('${uid}','${item.id}',${holdSeconds},'direita')">▶️ Lado direito (${holdSeconds}s)</button>
      </div>
    </details>`;
}

function renderMobilidadeAtivaItem(item) {
  if (!item) return '';
  return `
    <details open>
      <summary>${item.nome}</summary>
      ${acaoImagemVideo(DIAGRAMS[item.id] || '', item.nome)}
      <ul>${item.exec.map(e => `<li>${e}</li>`).join('')}</ul>
      ${item.erros && item.erros.length ? `<h4>Erros comuns</h4><ul>${item.erros.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      ${item.evidencia ? `<h4>Por quê</h4><p style="font-size:12px;color:var(--text-dim);">${item.evidencia}</p>` : ''}
    </details>`;
}


/* ============ ENCERRAR TREINO ============
   As séries (musculação e circuito de mobilidade) já foram salvas uma a uma
   pelo wizard, conforme registradas — este botão NÃO é o mecanismo de
   salvamento. Ele só grava sono/observações finais (e, pra corrida/mobilidade
   geral/descanso, os campos que não passam pelo wizard) na mesma entrada. */
async function encerrarTreino() {
  const status = document.getElementById('status');
  const sono = document.getElementById('f-sono').value || null;
  const obs = document.getElementById('f-obs').value || '';

  if (!currentLogEntry) {
    currentLogKey = 'log:' + hojeStr() + ':' + Date.now();
    if (currentDayType === 'A' || currentDayType === 'B' || currentDayType === 'C') {
      currentLogEntry = novoLogEntryBase('musculacao');
    } else if (currentDayType === 'mobilidade') {
      currentLogEntry = novoLogEntryBase('mobilidade');
    } else if (currentDayType === 'corrida') {
      currentLogEntry = { date: hojeStr(), type: 'corrida', sono: null, obs: '', horaInicio: new Date().toISOString() };
    } else {
      currentLogEntry = { date: hojeStr(), type: 'descanso', sono: null, obs: '', horaInicio: new Date().toISOString() };
    }
  }

  currentLogEntry.sono = sono;
  currentLogEntry.obs = obs;
  // marca o fim da sessão — junto com horaInicio, delimita a janela de tempo
  // pra cruzar com a FC do Garmin depois (série por série já tem seu próprio ts)
  currentLogEntry.horaFim = new Date().toISOString();

  if (currentDayType === 'corrida') {
    currentLogEntry.distancia = document.getElementById('q-dist').value || null;
    currentLogEntry.tempo = document.getElementById('q-tempo').value || null;
    currentLogEntry.zona = document.getElementById('q-zona').value;
  } else if (currentDayType === 'mobilidade') {
    currentLogEntry.duracao = document.getElementById('q-dur').value || null;
    currentLogEntry.areas = document.getElementById('q-areas').value || '';
  }

  try {
    const result = await storage.set(currentLogKey, JSON.stringify(currentLogEntry));
    if (result) {
      limparWizardResume();
      status.textContent = '✓ Treino encerrado. (As séries já estavam salvas conforme você foi registrando.)';
      status.style.color = 'var(--accent)';
      document.getElementById('f-obs').value = '';
    } else {
      status.textContent = 'Falha ao salvar sono/observações. As séries já registradas continuam salvas.';
      status.style.color = 'var(--danger)';
    }
  } catch (err) {
    status.textContent = 'Erro: ' + err.message + ' — as séries já registradas continuam salvas.';
    status.style.color = 'var(--danger)';
  }
}

window.setCorridaSemana = setCorridaSemana;
window.abrirInputSerie = abrirInputSerie;
window.ajustarValor = ajustarValor;
window.registrarSerie = registrarSerie;
window.iniciarProximaEtapaWizard = iniciarProximaEtapaWizard;
window.ajustarValorWizard = ajustarValorWizard;
window.registrarSerieWizard = registrarSerieWizard;
window.concluirCronometroSerieWizard = concluirCronometroSerieWizard;
window.iniciarCronometroSerieWizard = iniciarCronometroSerieWizard;
window.pularDescansoWizard = pularDescansoWizard;
window.pularDescanso = pularDescanso;
window.iniciarAlongamento = iniciarAlongamento;
window.encerrarTreino = encerrarTreino;
