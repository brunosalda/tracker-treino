/* ============ DADOS DO PROGRAMA ============ */
export const PROGRAM = {
  A: { label: "Musculação A — Perna + empurrar", exercicios: [
    { id: "agachamento", nome: "Agachamento livre", sets: 4, repMin: 8, repMax: 10, rest: 150, inc: 5, cue: "musc-agachamento", principal: true },
    { id: "supino", nome: "Supino reto", sets: 3, repMin: 8, repMax: 12, rest: 120, inc: 2.5, cue: "musc-supino", principal: true },
    { id: "cadeiraflexora", nome: "Cadeira flexora (alongada)", sets: 3, repMin: 10, repMax: 15, rest: 90, inc: 2.5, cue: "musc-cadeiraflexora" },
    { id: "desenvolvimento", nome: "Desenvolvimento c/ halteres", sets: 3, repMin: 10, repMax: 12, rest: 90, inc: 2.5, cue: "musc-desenvolvimento" },
    { id: "panturrilha1", nome: "Panturrilha em pé", sets: 3, repMin: 12, repMax: 15, rest: 60, inc: 2.5, cue: "musc-panturrilha" },
    { id: "prancha", nome: "Prancha", sets: 3, isTime: true, rest: 60, cue: "musc-core" }
  ]},
  B: { label: "Musculação B — Posterior + puxar", exercicios: [
    { id: "rdl", nome: "Levantamento terra romeno (RDL)", sets: 4, repMin: 8, repMax: 10, rest: 150, inc: 5, cue: "musc-rdl", principal: true },
    { id: "puxada", nome: "Puxada frente / remada curvada", sets: 4, repMin: 8, repMax: 12, rest: 120, inc: 2.5, cue: "musc-puxada", principal: true },
    { id: "afundo", nome: "Afundo / passada", sets: 3, repMin: 10, repMax: 12, rest: 90, inc: 2.5, cue: "musc-afundo" },
    { id: "remadabaixa", nome: "Remada baixa", sets: 3, repMin: 10, repMax: 12, rest: 90, inc: 2.5, cue: "musc-remada" },
    { id: "elevacaolateral", nome: "Elevação lateral", sets: 3, repMin: 12, repMax: 15, rest: 60, inc: 1, cue: "musc-elevacaolateral" },
    { id: "pallof", nome: "Pallof press (core rotacional)", sets: 3, repMin: 12, repMax: 12, rest: 60, inc: 0, cue: "musc-core" }
  ]},
  C: { label: "Musculação C — Full body complementar", exercicios: [
    { id: "legpress", nome: "Leg press / hack squat", sets: 4, repMin: 10, repMax: 12, rest: 120, inc: 10, cue: "musc-legpress", principal: true },
    { id: "supinoinclinado", nome: "Supino inclinado", sets: 3, repMin: 8, repMax: 12, rest: 120, inc: 2.5, cue: "musc-supino", principal: true },
    { id: "hipthrust", nome: "Hip thrust / stiff unilateral", sets: 3, repMin: 10, repMax: 12, rest: 120, inc: 5, cue: "musc-hipthrust" },
    { id: "puxadasupinada", nome: "Puxada supinada", sets: 3, repMin: 10, repMax: 12, rest: 90, inc: 2.5, cue: "musc-puxada" },
    { id: "panturrilha2", nome: "Panturrilha sentado", sets: 3, repMin: 15, repMax: 15, rest: 60, inc: 2.5, cue: "musc-panturrilha" },
    { id: "abdominal", nome: "Abdominal livre", sets: 3, repMin: 15, repMax: 15, rest: 60, inc: 0, cue: "musc-core" }
  ]},
  mobilidade: { label: "Circuito de estabilidade e core", exercicios: [
    { id: "prancha2", nome: "Prancha", sets: 3, isTime: true, rest: 45, cue: "musc-core" },
    { id: "pallof2", nome: "Pallof press", sets: 3, repMin: 12, repMax: 12, rest: 45, inc: 0, cue: "musc-core" },
    { id: "abducaoquadril", nome: "Abdução de quadril (banda ou máquina)", sets: 3, repMin: 15, repMax: 20, rest: 45, inc: 2.5, cue: null },
    { id: "hipthrustunilateral", nome: "Hip thrust unilateral", sets: 3, repMin: 10, repMax: 12, rest: 60, inc: 2.5, cue: "musc-hipthrust" },
    { id: "panturrilhaextra", nome: "Panturrilha em pé", sets: 2, repMin: 15, repMax: 15, rest: 45, inc: 2.5, cue: "musc-panturrilha" }
  ]}
};

export const DAY_TO_TYPE = { 0: "corrida", 1: "A", 2: "corrida", 3: "B", 4: "mobilidade", 5: "C", 6: "corrida" };
export const DAY_NAMES = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];


export const RUNNING_PLAN = {
  1: { facil: "20 min Z1 (pode intercalar caminhada se precisar)", variacao: "20 min Z1", longo: "25 min Z1" },
  2: { facil: "25 min Z1", variacao: "25 min Z1", longo: "30 min Z1" },
  3: { facil: "25 min Z1", variacao: "20 min Z1 + 4×2min em Z3 (tempo) com 2min de trote entre", longo: "35 min Z1–Z2" },
  4: { facil: "25 min Z1", variacao: "25 min Z1 + 5×2min em Z3 (tempo) com 2min de trote entre", longo: "40 min Z1–Z2" }
};

/* ============ METAS NUTRICIONAIS (padrão; sobrescritas pelo plano do usuário) ============ */
export const METAS = { kcal: 3050, proteina: 170, carboidrato: 490, gordura: 85 };

/* Tabela "Estrutura semanal" do painel Plano (linhas dia/sessão/foco) */
export const SEMANA = [
  ["Segunda", "Musculação A", "Perna (quadríceps) + empurrar"],
  ["Terça", "Corrida Z1 + mobilidade curta", "Base aeróbia"],
  ["Quarta", "Musculação B", "Posterior de cadeia + puxar"],
  ["Quinta", "Mobilidade dedicada MMII", "Alongamento + descanso ativo"],
  ["Sexta", "Musculação C", "Full body complementar"],
  ["Sábado", "Corrida (variação)", "Tempo / fartlek"],
  ["Domingo", "Corrida longa + mobilidade leve", "Longão Z1–Z2"]
];

/* ============ ORIENTAÇÕES (por plano — defaults do plano padrão) ============
   Aquecimento, diretrizes, finalização, regras de nutrição e o contexto da
   análise por IA são parte do PLANO, não do app: cada usuário vê as
   orientações do próprio programa. PROGRAM[chave].aquecimento (lista) pode
   sobrescrever o aquecimento por treino. */
export const ORIENTACOES = {
  aquecimentoItens: [
    "<strong>Geral (5 min):</strong> esteira, bike ou polichinelos em ritmo leve, só pra subir a temperatura e ativar o corpo.",
    "<strong>Mobilidade dinâmica (3-5 min):</strong> balanços de perna, agachamento com rotação de tronco, círculos de quadril e ombro — nada de alongamento estático longo aqui.",
    "<strong>Séries de aproximação:</strong> nos exercícios marcados com 🔥 abaixo, faça 2-3 séries subindo a carga gradualmente até chegar no peso de trabalho — o app já calcula isso pra você com base na sua última sessão."
  ],
  aquecimentoAviso: "Nunca comece um exercício composto pesado direto na carga de trabalho, mesmo já aquecido de forma geral.",
  diretrizes: [
    'Faça todas as séries entre <strong>RIR 0–3</strong><span class="qmark" onclick="abrirGlossario(\'rir\')">?</span> (perto da falha, sem chegar sempre até zero).',
    "Descanso conforme indicado em cada exercício — compostos pesados (agachamento, RDL, leg press) precisam de mais tempo que isolados.",
    "<strong>Progressão:</strong> suba a carga quando completar o topo da faixa de reps com técnica limpa em <em>todas</em> as séries do exercício.",
    '<strong>Deload:</strong><span class="qmark" onclick="abrirGlossario(\'deload\')">?</span> a cada 4 semanas, considere 1 semana com ~40–50% do volume (menos séries) se sentir fadiga acumulada, dor persistente ou queda de desempenho.',
    'Amplitude completa (ROM<span class="qmark" onclick="abrirGlossario(\'rom\')">?</span> total) em todos os exercícios — é parte do estímulo de hipertrofia e também trabalha sua mobilidade.'
  ],
  finalizacao: { titulo: "Finalização — alongamento MMII (~10 min)", texto: "Independente do treino do dia, feche a sessão com este bloco curto — trabalha diretamente sua prioridade de mobilidade e ajuda a completar a hora de treino.", alongamentosPadrao: true },
  regrasNutricao: [
    "Não existe \"janela anabólica\" rígida — o total do dia importa muito mais que o horário exato.",
    "Creatina: 3–5g todo dia (inclusive em dias de descanso).",
    "Cafeína: 3–6mg/kg, 30–60min antes do treino/corrida, se tolerar.",
    "Hidratação: perder mais de 2% do peso em água prejudica desempenho — beba antes de sentir sede."
  ],
  analiseContexto: "com prioridades nesta ordem: cardio, mobilidade/alongamento de MMII, força, manutenção/aumento de massa muscular"
};

/* Plano alimentar detalhado (refeições com opções) — null no plano padrão;
   planos de convidados podem definir e a aba Alimentação exibe. */
export let PLANO_ALIMENTAR = null;

/* ============ PLANO POR USUÁRIO ============
   Tudo acima é o plano PADRÃO (o do Bruno). Se o usuário logado tiver um
   plano próprio salvo no storage (chave 'plan'), os objetos exportados são
   MUTADOS in-place aqui — todos os módulos que importaram PROGRAM/METAS/etc
   passam a enxergar o plano dele automaticamente (live bindings de ESM).
   Formato do JSON salvo: { PROGRAM?, DAY_TO_TYPE?, RUNNING_PLAN?, METAS?, SEMANA? } */
function substituir(alvo, novo) {
  for (const k of Object.keys(alvo)) delete alvo[k];
  Object.assign(alvo, novo);
}
export async function carregarPlanoDoUsuario(storage, chave) {
  try {
    const r = await storage.get(chave || 'plan');
    if (!r || !r.value) return false;
    const p = JSON.parse(r.value);
    if (p.PROGRAM) substituir(PROGRAM, p.PROGRAM);
    if (p.DAY_TO_TYPE) substituir(DAY_TO_TYPE, p.DAY_TO_TYPE);
    if (p.RUNNING_PLAN) substituir(RUNNING_PLAN, p.RUNNING_PLAN);
    if (p.METAS) Object.assign(METAS, p.METAS);
    if (p.SEMANA) { SEMANA.length = 0; SEMANA.push(...p.SEMANA); }
    if (p.ORIENTACOES) substituir(ORIENTACOES, p.ORIENTACOES);
    if (p.PLANO_ALIMENTAR) PLANO_ALIMENTAR = p.PLANO_ALIMENTAR;
    if (p.MEALS) {
      const { MEALS } = await import('./nutrition-data.js');
      MEALS.length = 0; MEALS.push(...p.MEALS);
    }
    return true;
  } catch (e) { return false; }
}
