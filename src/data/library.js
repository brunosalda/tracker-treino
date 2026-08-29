export const LIBRARY = {
  mobilidade: {
    label: "Mobilidade e Alongamento (MMII)",
    items: [
      { id: "mob-protocolo", nome: "Protocolo geral de alongamento", grade: "moderada",
        exec: [
          "Holds estáticos de 30–60 segundos por região, 2–3 séries.",
          "Sessão dedicada: 20–25 min, foco em quadril, isquiotibiais, adutores e tornozelo.",
          "Sessões curtas (5–10 min) de mobilidade dinâmica antes de treino/corrida — nunca estático longo antes de força/potência."
        ],
        erros: ["Fazer alongamento estático >60s antes de agachar ou correr forte (reduz força aguda).", "Forçar até dor aguda — o alvo é desconforto leve a moderado, não dor."],
        evidencia: "Warneke et al. (2024, Sports Medicine – Open): efeitos maiores com >1,5h de volume semanal e holds de 15–60s. Warneke et al. (2024, JSHS): holds ≥60s antes de esforço reduzem força (ES −0,84); holds <60s têm efeito trivial." },
      { id: "mob-quadril", nome: "Flexor de quadril", grade: "moderada",
        exec: [
          "Posição de afundo baixo (joelho de trás no chão), quadril empurrado à frente até sentir alongamento na frente do quadril da perna de trás.",
          "Mantenha tronco ereto, não deixe a lombar arquear excessivamente.",
          "30–60s por lado, 2–3 séries."
        ],
        erros: ["Compensar com arqueamento lombar em vez de projetar o quadril."],
        evidencia: "Relevante para corredores e para amplitude do agachamento — Seção 3 e 11 do relatório." },
      { id: "mob-isquio", nome: "Isquiotibiais", grade: "moderada",
        exec: [
          "Sentado ou em pé, perna estendida à frente, dobre o tronco a partir do quadril (não da lombar) até sentir alongamento atrás da coxa.",
          "Mantenha leve flexão de joelho se sentir tensão excessiva atrás do joelho.",
          "30–60s por lado, 2–3 séries."
        ],
        erros: ["Arredondar a lombar em vez de dobrar pelo quadril."],
        evidencia: "Contribui para amplitude do RDL e economia de corrida — Seção 3." },
      { id: "mob-adutor", nome: "Adutores", grade: "moderada",
        exec: [
          "Posição de agachamento sumô ou borboleta sentado, joelhos abertos.",
          "Incline levemente o tronco à frente mantendo coluna neutra até sentir alongamento na virilha.",
          "30–60s, 2–3 séries."
        ],
        erros: [], evidencia: "Complementa amplitude de quadril para agachamento e mudança de direção." },
      { id: "mob-tornozelo", nome: "Panturrilha / dorsiflexão de tornozelo", grade: "moderada",
        exec: [
          "Em pé, mãos na parede, um pé atrás, calcanhar no chão, empurre o joelho da frente em direção à parede.",
          "Repita com o joelho de trás levemente flexionado para atingir o sóleo.",
          "30–60s por lado e por variação, 2–3 séries."
        ],
        erros: ["Levantar o calcanhar do chão, que anula o alongamento."],
        evidencia: "Dorsiflexão de tornozelo é limitante comum em agachamento profundo e cadência de corrida — Seção 11." },
      { id: "mob-aquecimento-articular", nome: "Aquecimento articular (círculos)", grade: "moderada",
        exec: [
          "Quadril: pés afastados na largura dos ombros, mãos na cintura, faça círculos amplos levando o quadril para frente-lado-trás-lado. 10 círculos por direção.",
          "Joelho: pés juntos, leve flexão de quadril, mãos apoiadas nos joelhos, círculos suaves. 10 círculos por direção.",
          "Tornozelo: apoie-se numa perna só (ou sente-se), eleve a outra do chão e gire o pé pelo tornozelo, desenhando o maior círculo possível. 10 círculos por direção, por lado."
        ],
        erros: ["Fazer os círculos rápido demais — o objetivo é amplitude, não velocidade.", "Mover o joelho/quadril junto no exercício de tornozelo, quando só o pé deveria girar."],
        evidencia: "Aquecimento dinâmico antes de esforço ou alongamento estático, elevando temperatura e amplitude articular sem o efeito negativo do alongamento estático longo pré-esforço — Seção 11." },
      { id: "mob-cars-quadril", nome: "CARs de quadril (mobilidade ativa)", grade: "fraca",
        exec: [
          "Em pé, apoie a mão numa parede ou cadeira para equilíbrio.",
          "Eleve o joelho à frente até a altura do quadril, mantendo o tronco parado (sem compensar com a lombar).",
          "Sem perder essa postura, abra o joelho para o lado (rotação externa do quadril).",
          "Continue o movimento circular levando o joelho para trás e depois de volta à posição inicial — um círculo completo e controlado.",
          "5 repetições por direção (sentido horário e anti-horário), por lado."
        ],
        erros: ["Compensar com rotação do tronco ou da lombar em vez de mover isoladamente a articulação do quadril.", "Fazer rápido — o valor está no controle lento em cada ponto da amplitude."],
        evidencia: "Mobilidade ativa em amplitude final tem racional plausível (controle ativo da amplitude, diferente do alongamento passivo), mas evidência ainda emergente — Seção 11." },
      { id: "mob-cars-tornozelo", nome: "CARs de tornozelo (mobilidade ativa)", grade: "fraca",
        exec: [
          "Sentado ou em pé com apoio, eleve o pé do chão, perna parada.",
          "Gire o tornozelo desenhando o maior círculo possível com os dedos do pé, mantendo a perna/joelho imóveis.",
          "Metade das repetições em cada direção, movimento lento e controlado.",
          "8–10 repetições por direção, por lado."
        ],
        erros: ["Mover o joelho ou a perna toda em vez de isolar o tornozelo."],
        evidencia: "Mesmo racional dos CARs de quadril — controle ativo em amplitude final, evidência emergente (Seção 11)." },
      { id: "mob-foam-roller", nome: "Foam roller (panturrilha, quadríceps, posterior)", grade: "moderada",
        exec: [
          "Posicione o rolo sob o músculo-alvo (panturrilha, quadríceps ou posterior de coxa) e apoie o peso do corpo sobre ele.",
          "Role lentamente (cerca de 2–3 cm por segundo) ao longo de todo o músculo, da origem até a inserção.",
          "Ao encontrar um ponto mais sensível ou tenso, pause ali por 20–30s até a tensão reduzir, sem forçar além do desconforto tolerável.",
          "Evite rolar diretamente sobre articulações ou ossos (joelho, tíbia).",
          "1–2 minutos por região."
        ],
        erros: ["Rolar rápido demais — o tecido precisa de tempo para responder.", "Aplicar pressão a ponto de sentir dor aguda, não apenas desconforto."],
        evidencia: "Ganhos agudos de ROM sem perda de força associada; evidência crônica ainda limitada (Seção 5 e 11)." }
    ]
  },
  corrida: {
    label: "Corrida",
    items: [
      { id: "corrida-postura", nome: "Postura e cadência", grade: "forte",
        exec: [
          "Tronco ligeiramente inclinado à frente a partir do tornozelo (não da cintura), olhar no horizonte.",
          "Se notar 'passada longa' (pé aterrissando muito à frente do corpo), aumente a cadência em 5–10%.",
          "Braços relaxados, cotovelo ~90°, movimento para frente/trás, não cruzando o corpo."
        ],
        erros: ["Overstriding (passada longa à frente do centro de massa) — aumenta carga em joelho e quadril."],
        evidencia: "Heiderscheit et al. (2011, MSSE) e Lenhart et al. (2014, MSSE): cadência a 110% da preferida reduziu força patelofemoral de pico em 14%. FORTE." },
      { id: "corrida-zonas", nome: "Zonas de treino (Z1–Z5)", grade: "forte",
        exec: [
          "Z1 (base): ritmo em que dá pra conversar frases inteiras sem ofegar — é a maior parte do seu volume agora.",
          "Z2: conversa com esforço, frases curtas.",
          "Z3 (tempo/limiar): desconfortável mas sustentável, poucas palavras por vez.",
          "Z4–Z5: intervalos curtos e intensos — só depois de ter base aeróbia construída."
        ],
        erros: ["Correr toda sessão fácil em ritmo Z3 'porque sim' — isso atrapalha a recuperação sem ganho extra."],
        evidencia: "Seção 3: distribuição polarizada é levemente superior para VO2max em treinados/intervenções curtas (Rosenblat et al., 2022), mas para sua fase o mais importante é construir base Z1." },
      { id: "corrida-respiracao", nome: "Respiração", grade: "fraca",
        exec: [
          "Respiração nasal/bucal combinada em ritmos fáceis; puramente bucal em intensidades mais altas.",
          "Padrão 3:3 (3 passos inspirando, 3 expirando) em Z1–Z2 ajuda muitos iniciantes a manter ritmo constante — ajuste conforme conforto."
        ],
        erros: [], evidencia: "Evidência sobre padrões específicos de respiração é fraca; use como ferramenta prática, não regra rígida." },
      { id: "corrida-progressao", nome: "Progressão de volume segura", grade: "forte",
        exec: [
          "Aumente o tempo/distância total semanal gradualmente — evite saltos abruptos.",
          "Priorize semanas consecutivas de base Z1 antes de introduzir intervalos de tempo/limiar.",
          "Se sentir dor articular (não apenas cansaço muscular), reduza o volume antes de aumentar."
        ],
        erros: ["Aumentar volume e intensidade ao mesmo tempo."],
        evidencia: "Impellizzeri et al. (2020): índices como ACWR têm falhas conceituais; a evidência favorece progressão gradual e julgamento, não uma fórmula rígida." }
    ]
  },
  musculacao: {
    label: "Musculação",
    items: [
      { id: "musc-agachamento", nome: "Agachamento livre", grade: "forte",
        exec: [
          "Pés na largura dos ombros, levemente rotacionados para fora.",
          "Desça controlando o quadril para trás e para baixo, mantendo o peso distribuído no pé todo (não só na ponta).",
          "Desça até a profundidade que sua mobilidade de quadril/tornozelo permitir com a lombar neutra — quanto mais fundo (sem perder a postura), melhor o estímulo em posição alongada.",
          "Suba empurrando o chão, joelhos alinhados com os pés (não colapsando para dentro)."
        ],
        erros: ["Joelhos colapsando para dentro (valgo).", "Perder a lordose lombar no fundo do movimento — sinal de mobilidade insuficiente, prefira parar um pouco acima."],
        evidencia: "Treinar em amplitude longa (posição alongada) favorece hipertrofia (Seção 1 e 11). FORTE para o mecanismo de tensão mecânica." },
      { id: "musc-rdl", nome: "Levantamento terra romeno (RDL)", grade: "forte",
        exec: [
          "Barra próxima ao corpo, joelhos com flexão leve e fixa durante todo o movimento.",
          "Desça a barra deslizando pela coxa, dobrando pelo quadril (quadril vai para trás), até sentir alongamento forte no posterior de coxa.",
          "Mantenha a coluna neutra o tempo todo — não arredonde a lombar.",
          "Suba estendendo o quadril, sem hiperextender no topo."
        ],
        erros: ["Dobrar os joelhos em vez do quadril (vira um agachamento).", "Arredondar a lombar para 'chegar mais embaixo'."],
        evidencia: "Exercício-chave para treino em posição alongada do posterior de coxa — Seção 1 (curvas de resistência) e Seção 11." },
      { id: "musc-hipthrust", nome: "Hip thrust", grade: "moderada",
        exec: [
          "Costas apoiadas no banco na altura da escápula, barra sobre o quadril (com almofada).",
          "Pés próximos ao quadril, empurre o quadril para cima até o corpo formar linha reta do ombro ao joelho.",
          "Aperte o glúteo no topo por 1s, desça controlado."
        ],
        erros: ["Hiperestender a lombar no topo em vez de terminar o movimento com o glúteo."],
        evidencia: "Complementa o RDL trabalhando extensão de quadril em amplitude diferente." },
      { id: "musc-cadeiraflexora", nome: "Cadeira flexora (ênfase alongada)", grade: "moderada",
        exec: [
          "Ajuste o banco para que o joelho fique alinhado ao eixo do aparelho.",
          "Estenda bem o quadril/joelho no início do movimento para começar em posição alongada do isquiotibial.",
          "Flexione controlado, sem impulso, apertando no fim do curso."
        ],
        erros: ["Usar impulso do quadril para 'ajudar' a subida do peso."],
        evidencia: "Wolf et al. (2025, PeerJ): treino em maior comprimento muscular favorece hipertrofia (ES 0,283)." },
      { id: "musc-supino", nome: "Supino (reto/inclinado)", grade: "forte",
        exec: [
          "Escápulas retraídas e depressas contra o banco, leve arco natural na lombar.",
          "Desça a barra/halteres até tocar levemente o peito (reto) ou linha do peitoral superior (inclinado) — amplitude completa.",
          "Empurre para cima em linha levemente diagonal, sem travar os cotovelos com força excessiva."
        ],
        erros: ["Cortar a amplitude no fundo do movimento por medo — isso reduz o estímulo em posição alongada."],
        evidencia: "ROM completo maximiza tensão mecânica em posição alongada — Seção 1." },
      { id: "musc-puxada", nome: "Puxada frente / remada curvada", grade: "moderada",
        exec: [
          "Puxada: leve inclinação de tronco para trás, puxe a barra até a altura do peito, cotovelos para baixo e para trás.",
          "Remada: tronco fixo (não balançar), puxe até o abdômen, apertando as escápulas no final.",
          "Controle a fase excêntrica (voltar) em vez de deixar o peso cair."
        ],
        erros: ["Usar embalo do corpo para puxar mais peso do que a musculatura das costas sustenta."],
        evidencia: "Volume adequado de puxada é essencial para equilíbrio postural com o trabalho de empurrar — Seção 2." },
      { id: "musc-remada", nome: "Remada baixa (cabo)", grade: "moderada",
        exec: [
          "Tronco ereto, leve inclinação à frente no início do movimento (alongamento das costas).",
          "Puxe o cabo até o abdômen, cotovelos próximos ao corpo, aperte as escápulas.",
          "Retorne controlado, permitindo alongamento completo antes da próxima repetição."
        ], erros: [], evidencia: "" },
      { id: "musc-afundo", nome: "Afundo / passada", grade: "moderada",
        exec: [
          "Passo à frente (ou atrás, no reverso), desça até os dois joelhos formarem ~90°.",
          "Mantenha o tronco ereto e o joelho da frente alinhado com o pé.",
          "Empurre de volta à posição inicial usando principalmente a perna da frente."
        ],
        erros: ["Deixar o joelho da frente ultrapassar muito a ponta do pé de forma descontrolada (não é proibido, mas exige controle)."],
        evidencia: "" },
      { id: "musc-elevacaolateral", nome: "Elevação lateral", grade: "moderada",
        exec: [
          "Halteres ao lado do corpo, leve flexão de cotovelo fixa.",
          "Eleve até a linha dos ombros, liderando com o cotovelo (não com a mão).",
          "Desça controlado — a fase excêntrica é onde mais se ganha estímulo."
        ], erros: ["Usar embalo do tronco para jogar o peso para cima."], evidencia: "" },
      { id: "musc-legpress", nome: "Leg press / hack squat", grade: "moderada",
        exec: [
          "Pés na largura dos ombros na plataforma, levemente mais altos para enfatizar posterior/glúteo, mais baixos para quadríceps.",
          "Desça até o joelho formar ~90° ou até onde a lombar permanecer apoiada no banco.",
          "Não trave os joelhos com força total no topo."
        ], erros: ["Descer além do ponto em que o quadril começa a 'arredondar' contra o banco."], evidencia: "" },
      { id: "musc-desenvolvimento", nome: "Desenvolvimento com halteres", grade: "moderada",
        exec: [
          "Sentado ou em pé, halteres na altura dos ombros, cotovelos levemente à frente do corpo.",
          "Empurre para cima até quase estender o cotovelo, sem travar com força.",
          "Desça controlado até a altura inicial."
        ], erros: ["Arquear excessivamente a lombar para 'ajudar' a subida."], evidencia: "" },
      { id: "musc-panturrilha", nome: "Panturrilha (em pé / sentado)", grade: "moderada",
        exec: [
          "Amplitude completa: desça até sentir alongamento forte no calcanhar, suba até a ponta do pé máxima.",
          "Pausa breve no topo (contração de pico).",
          "Em pé enfatiza gastrocnêmio; sentado (joelho flexionado) enfatiza sóleo — inclua ambos ao longo da semana."
        ], erros: ["Cortar a amplitude, fazendo reps parciais rápidas."], evidencia: "" },
      { id: "musc-core", nome: "Core (prancha / pallof / abdominal)", grade: "moderada",
        exec: [
          "Prancha: cotovelos sob os ombros, corpo em linha reta da cabeça ao calcanhar, sem deixar o quadril cair ou subir.",
          "Pallof press: em pé, cabo/elástico na altura do peito, empurre à frente resistindo à rotação do tronco.",
          "Abdominal: movimento controlado, sem puxar o pescoço com as mãos."
        ], erros: ["Prender a respiração durante toda a série."], evidencia: "" }
    ]
  }
};

/* ============ GLOSSÁRIO ============ */
export const GLOSSARY = {
  rir: { titulo: "RIR — Repetições em Reserva", texto: "Quantas repetições você ainda conseguiria fazer antes de falhar. Se você para uma série com RIR 2, significa que ainda tinha 2 repetições 'de gás no tanque'. RIR 0 = falha total (não consegue fazer mais nenhuma). É uma forma de estimar a intensidade da série sem precisar ir até a falha toda vez." },
  rpe: { titulo: "RPE — Percepção de Esforço", texto: "Parecido com o RIR, mas numa escala geral de esforço (1 a 10, sendo 10 o máximo possível). Costuma ser usado para a sessão inteira (ex: 'essa corrida foi um RPE 7'), não série por série." },
  um_rm: { titulo: "1RM — Uma Repetição Máxima", texto: "A carga máxima que você consegue levantar em UMA repetição só, com técnica correta. Não é necessário testar isso na prática (é arriscado); dá pra estimar matematicamente a partir do peso e das repetições que você já faz." },
  deload: { titulo: "Deload", texto: "Uma semana de treino 'mais leve' de propósito — menos peso e/ou menos séries — pra permitir recuperação antes de continuar progredindo. Faz parte do plano, não é pausa por preguiça." },
  mmii: { titulo: "MMII", texto: "Abreviação de 'membros inferiores': pernas, incluindo quadril, coxa, panturrilha e tornozelo. Termo comum em educação física e fisioterapia." },
  rom: { titulo: "ROM — Amplitude de Movimento", texto: "O quanto uma articulação se move do início ao fim do movimento. 'Fazer o agachamento em ROM completo' significa descer e subir usando toda a amplitude que sua mobilidade permite, sem cortar o movimento pela metade." },
  zona: { titulo: "Zonas de treino (Z1–Z5)", texto: "Faixas de intensidade da corrida, da mais fácil (Z1) até esforço máximo (Z5), geralmente medidas pela frequência cardíaca. Z1: dá pra conversar frases inteiras. Z2: conversa com esforço. Z3: desconfortável mas sustentável. Z4–Z5: intervalos curtos e intensos." },
  fc: { titulo: "FC — Frequência Cardíaca", texto: "Batimentos do coração por minuto (bpm). É o dado que o relógio Garmin mede continuamente durante a atividade." },
  gpx: { titulo: "GPX — GPS Exchange Format", texto: "Um tipo de arquivo que guarda o trajeto de GPS de uma atividade: latitude, longitude e horário de cada ponto. É um formato genérico, usado por vários apps de GPS, não só Garmin. Às vezes vem sem frequência cardíaca." },
  tcx: { titulo: "TCX — Training Center XML", texto: "Um formato parecido com o GPX, criado pela própria Garmin. Além do trajeto, também guarda dados de treino como frequência cardíaca, calorias e 'voltas' (laps). Por isso costuma vir mais completo — é o formato recomendado para importar aqui." }
};
