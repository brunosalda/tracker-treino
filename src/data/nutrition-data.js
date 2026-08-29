/* ============ ALIMENTAÇÃO POR REFEIÇÃO ============ */
/* ============ CALCULADORA DE PORÇÕES ============ */
// valores de referência aproximados (podem variar por marca/preparo) — kcal, proteína, carboidrato, gordura
export const FOODS = [
  { nome: "Peito de frango cozido/grelhado", base: 100, unidade: "g", kcal: 165, prot: 31, carb: 0, gord: 3.6 },
  { nome: "Carne bovina magra (patinho)", base: 100, unidade: "g", kcal: 143, prot: 26, carb: 0, gord: 4 },
  { nome: "Tilápia", base: 100, unidade: "g", kcal: 96, prot: 20, carb: 0, gord: 1.7 },
  { nome: "Salmão", base: 100, unidade: "g", kcal: 208, prot: 20, carb: 0, gord: 13 },
  { nome: "Ovo inteiro (unidade ~50g)", base: 1, unidade: "unidade", kcal: 78, prot: 6.3, carb: 0.6, gord: 5.3 },
  { nome: "Clara de ovo", base: 100, unidade: "g", kcal: 52, prot: 11, carb: 0.7, gord: 0.2 },
  { nome: "Whey protein (1 scoop ~30g)", base: 1, unidade: "scoop", kcal: 120, prot: 24, carb: 3, gord: 1.5 },
  { nome: "Iogurte grego natural", base: 100, unidade: "g", kcal: 59, prot: 10, carb: 3.6, gord: 0.4 },
  { nome: "Queijo cottage", base: 100, unidade: "g", kcal: 98, prot: 11, carb: 3.4, gord: 4.3 },
  { nome: "Tofu firme", base: 100, unidade: "g", kcal: 144, prot: 15.5, carb: 2.8, gord: 8.7 },
  { nome: "Arroz branco cozido", base: 100, unidade: "g", kcal: 130, prot: 2.7, carb: 28, gord: 0.3 },
  { nome: "Arroz integral cozido", base: 100, unidade: "g", kcal: 123, prot: 2.6, carb: 25.6, gord: 1 },
  { nome: "Batata doce cozida", base: 100, unidade: "g", kcal: 86, prot: 1.6, carb: 20, gord: 0.1 },
  { nome: "Batata inglesa cozida", base: 100, unidade: "g", kcal: 87, prot: 1.9, carb: 20, gord: 0.1 },
  { nome: "Aveia em flocos (crua)", base: 100, unidade: "g", kcal: 389, prot: 16.9, carb: 66, gord: 6.9 },
  { nome: "Pão francês (unidade ~50g)", base: 1, unidade: "unidade", kcal: 150, prot: 4, carb: 28, gord: 1.5 },
  { nome: "Pão integral (fatia ~25g)", base: 1, unidade: "fatia", kcal: 65, prot: 3, carb: 12, gord: 1 },
  { nome: "Macarrão cozido", base: 100, unidade: "g", kcal: 131, prot: 5, carb: 25, gord: 1.1 },
  { nome: "Feijão cozido", base: 100, unidade: "g", kcal: 76, prot: 4.8, carb: 13.6, gord: 0.5 },
  { nome: "Lentilha cozida", base: 100, unidade: "g", kcal: 116, prot: 9, carb: 20, gord: 0.4 },
  { nome: "Grão de bico cozido", base: 100, unidade: "g", kcal: 164, prot: 8.9, carb: 27.4, gord: 2.6 },
  { nome: "Azeite de oliva (1 colher sopa)", base: 1, unidade: "colher", kcal: 119, prot: 0, carb: 0, gord: 13.5 },
  { nome: "Pasta de amendoim", base: 100, unidade: "g", kcal: 588, prot: 25, carb: 20, gord: 50 },
  { nome: "Abacate", base: 100, unidade: "g", kcal: 160, prot: 2, carb: 8.5, gord: 14.7 },
  { nome: "Banana", base: 100, unidade: "g", kcal: 89, prot: 1.1, carb: 22.8, gord: 0.3 },
  { nome: "Leite integral", base: 100, unidade: "ml", kcal: 61, prot: 3.2, carb: 4.8, gord: 3.3 },
  { nome: "Leite desnatado", base: 100, unidade: "ml", kcal: 35, prot: 3.4, carb: 5, gord: 0.1 },
  { nome: "Whey Black Skull (seu produto, rótulo real)", base: 30, unidade: "g", kcal: 114, prot: 12, carb: 14, gord: 0.7 }
];

export const MEALS = [
  { id: "cafe", nome: "Café da manhã", metaProteina: 35 },
  { id: "almoco", nome: "Almoço", metaProteina: 40 },
  { id: "lanche", nome: "Lanche da tarde", metaProteina: 25 },
  { id: "jantar", nome: "Jantar", metaProteina: 40 },
  { id: "ceia", nome: "Ceia (opcional)", metaProteina: 30, opcional: true,
    dica: "~40g de proteína de digestão lenta (caseína, iogurte grego, queijo cottage) antes de dormir eleva a síntese proteica muscular overnight (Res et al., 2012)." }
];
