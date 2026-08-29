import { SVG_ACCENT, SVG_DIM, diagram1, diagram2, wallRect, arrowSvg, barbellIcon, dumbbellIcon, benchRect, figure, shiftJ } from '../lib/svg-helpers.js';

export const STAND = { head: [65, 20], shoulder: [65, 38], elbow: [52, 58], hand: [45, 80], hip: [65, 75], knee: [65, 105], ankle: [65, 130], toe: [80, 130] };

export const DIAGRAMS = {
  // ---- MOBILIDADE (prioridade) ----
  "mob-protocolo": `<svg viewBox="0 0 100 100" style="width:90px;display:block;margin:10px auto;">
      <circle cx="50" cy="55" r="35" fill="none" stroke="${SVG_ACCENT}" stroke-width="4"/>
      <line x1="50" y1="55" x2="50" y2="30" stroke="${SVG_ACCENT}" stroke-width="3"/>
      <line x1="50" y1="55" x2="68" y2="60" stroke="${SVG_ACCENT}" stroke-width="3"/>
      <line x1="35" y1="10" x2="65" y2="10" stroke="${SVG_ACCENT}" stroke-width="4"/>
      <line x1="50" y1="10" x2="50" y2="20" stroke="${SVG_ACCENT}" stroke-width="4"/>
      <text x="50" y="98" fill="${SVG_DIM}" font-size="11" text-anchor="middle">30–60 segundos</text>
    </svg>`,
  "mob-quadril": "",
  "mob-isquio": diagram1({
    head: [50, 82], shoulder: [58, 95], elbow: [92, 100], hand: [125, 106],
    hip: [40, 122], knee: [90, 124], ankle: [133, 126], toe: [144, 120]
  }, "Dobrar pelo quadril, joelho quase reto", arrowSvg(65, 108, 70, 120, SVG_ACCENT)),
  "mob-adutor": diagram1({
    head: [58, 76], shoulder: [64, 90], elbow: [84, 100], hand: [98, 108],
    hip: [60, 120], knee: [98, 108], ankle: [78, 124], toe: [66, 128]
  }, "Joelho caindo para o lado, coluna neutra", arrowSvg(98, 103, 98, 118, SVG_ACCENT)),
  "mob-tornozelo": diagram1({
    head: [70, 40], shoulder: [75, 55], elbow: [102, 50], hand: [132, 45],
    hip: [70, 85], knee: [98, 106], ankle: [108, 130], toe: [122, 130],
    knee2: [40, 120], ankle2: [30, 132], toe2: [15, 132]
  }, "Calcanhar de trás sempre no chão", wallRect(138, 15, 138) + arrowSvg(40, 108, 34, 122, SVG_ACCENT)),

  // ---- CORRIDA ----
  "corrida-postura": `<svg viewBox="0 0 300 150" style="width:100%;max-width:300px;display:block;margin:10px auto;">
      <line x1="4" y1="130" x2="146" y2="130" stroke="${SVG_DIM}" stroke-width="1"/>
      <line x1="154" y1="130" x2="296" y2="130" stroke="${SVG_DIM}" stroke-width="1"/>
      ${figure({ head: [35, 18], shoulder: [35, 32], elbow: [28, 45], hand: [22, 55], hip: [35, 58], knee: [72, 72], ankle: [105, 92], toe: [118, 88], knee2: [15, 72], ankle2: [5, 92], toe2: [-5, 88] }, "#e57373")}
      ${figure(shiftJ({ head: [35, 15], shoulder: [33, 28], elbow: [42, 40], hand: [52, 50], hip: [35, 55], knee: [50, 75], ankle: [53, 92], toe: [64, 88], knee2: [20, 78], ankle2: [10, 95], toe2: [0, 92] }, 160), "#7fe8a0")}
      <text x="75" y="142" fill="#e57373" font-size="10" text-anchor="middle">Errado: pé longe à frente</text>
      <text x="235" y="142" fill="#7fe8a0" font-size="10" text-anchor="middle">Certo: pé sob o quadril</text>
    </svg>`,

  // ---- MUSCULAÇÃO ----
  "musc-agachamento": "",
  "musc-rdl": "",
  "musc-hipthrust": diagram2(
    { head: [22, 85], shoulder: [35, 100], elbow: [35, 110], hand: [45, 115], hip: [68, 118], knee: [105, 108], ankle: [105, 133], toe: [120, 133] },
    { head: [22, 85], shoulder: [35, 100], elbow: [35, 110], hand: [45, 115], hip: [75, 92], knee: [105, 100], ankle: [105, 133], toe: [120, 133] },
    "Quadril baixo", "Quadril estendido (linha reta)",
    benchRect(15, 100, 30, SVG_DIM) + barbellIcon(68, 112, SVG_DIM) + benchRect(175, 100, 30, SVG_DIM) + barbellIcon(235, 86, SVG_DIM)),
  "musc-cadeiraflexora": diagram2(
    { head: [30, 30], shoulder: [30, 48], elbow: [20, 60], hand: [15, 75], hip: [30, 80], knee: [68, 80], ankle: [108, 80], toe: [120, 70] },
    { head: [30, 30], shoulder: [30, 48], elbow: [20, 60], hand: [15, 75], hip: [30, 80], knee: [68, 80], ankle: [80, 112], toe: [68, 122] },
    "Início: perna estendida (alongada)", "Final: joelho flexionado"),
  "musc-supino": diagram2(
    { head: [15, 90], shoulder: [35, 90], elbow: [45, 68], hand: [50, 50], hip: [70, 90], knee: [95, 80], ankle: [95, 100], toe: [110, 100] },
    { head: [15, 90], shoulder: [35, 90], elbow: [35, 58], hand: [35, 32], hip: [70, 90], knee: [95, 80], ankle: [95, 100], toe: [110, 100] },
    "Barra na altura do peito", "Braços estendidos (sem travar)",
    benchRect(8, 95, 100, SVG_DIM) + barbellIcon(50, 50, SVG_DIM) + benchRect(168, 95, 100, SVG_DIM) + barbellIcon(195, 32, SVG_DIM)),
  "musc-puxada": diagram2(
    { head: [100, 30], shoulder: [95, 48], elbow: [70, 50], hand: [42, 52], hip: [95, 85], knee: [95, 110], ankle: [95, 132], toe: [110, 132] },
    { head: [100, 30], shoulder: [95, 48], elbow: [82, 55], hand: [96, 62], hip: [95, 85], knee: [95, 110], ankle: [95, 132], toe: [110, 132] },
    "Braços estendidos (alongado)", "Puxado até o tronco"),
  "musc-remada": diagram2(
    { head: [105, 35], shoulder: [98, 52], elbow: [72, 55], hand: [45, 58], hip: [92, 88], knee: [92, 112], ankle: [92, 132], toe: [107, 132] },
    { head: [105, 35], shoulder: [98, 52], elbow: [85, 58], hand: [100, 64], hip: [92, 88], knee: [92, 112], ankle: [92, 132], toe: [107, 132] },
    "Tronco fixo, leve inclinação à frente", "Cotovelos atrás, aperta escápulas"),
  "musc-afundo": diagram2(STAND,
    { head: [58, 45], shoulder: [58, 60], elbow: [48, 75], hand: [42, 90], hip: [58, 80], knee: [85, 105], ankle: [95, 130], toe: [110, 130], knee2: [38, 115], ankle2: [24, 135], toe2: [12, 140] },
    "Em pé", "Joelho da frente a 90°, o de trás baixo"),
  "musc-elevacaolateral": diagram2(STAND,
    { head: [65, 20], shoulder: [65, 38], elbow: [92, 38], hand: [115, 36], hip: [65, 75], knee: [65, 105], ankle: [65, 130], toe: [80, 130] },
    "Braços ao lado do corpo", "Elevado até a linha dos ombros",
    dumbbellIcon(45, 80, SVG_DIM) + dumbbellIcon(275, 36, SVG_DIM)),
  "musc-legpress": diagram2(
    { head: [20, 55], shoulder: [30, 66], elbow: [25, 82], hand: [20, 94], hip: [45, 82], knee: [72, 66], ankle: [98, 48], toe: [108, 42] },
    { head: [20, 55], shoulder: [30, 66], elbow: [25, 82], hand: [20, 94], hip: [45, 82], knee: [88, 78], ankle: [128, 72], toe: [138, 66] },
    "Joelhos flexionados (~90°)", "Pernas quase estendidas (sem travar)"),
  "musc-desenvolvimento": diagram2(
    { head: [65, 25], shoulder: [65, 42], elbow: [88, 45], hand: [104, 56], hip: [65, 78], knee: [65, 108], ankle: [65, 130], toe: [80, 130] },
    { head: [65, 25], shoulder: [65, 42], elbow: [76, 18], hand: [86, 4], hip: [65, 78], knee: [65, 108], ankle: [65, 130], toe: [80, 130] },
    "Halteres na altura dos ombros", "Braços estendidos acima da cabeça",
    dumbbellIcon(104, 56, SVG_DIM) + dumbbellIcon(246, 4, SVG_DIM)),
  "musc-panturrilha": diagram2(
    { head: [65, 20], shoulder: [65, 38], elbow: [60, 55], hand: [58, 75], hip: [65, 75], knee: [65, 105], ankle: [65, 128], toe: [80, 128] },
    { head: [65, 10], shoulder: [65, 28], elbow: [60, 46], hand: [58, 66], hip: [65, 66], knee: [65, 96], ankle: [70, 116], toe: [80, 128] },
    "Calcanhar no chão", "Ponta do pé (contração de pico)"),
  "musc-core": diagram1(
    { head: [15, 60], shoulder: [32, 62], elbow: [32, 82], hand: [32, 97], hip: [70, 65], knee: [108, 68], ankle: [135, 70], toe: [146, 68] },
    "Linha reta da cabeça ao calcanhar")
};
