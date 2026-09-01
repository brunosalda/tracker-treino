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
    return true;
  } catch (e) { return false; }
}
