import type { Mission } from "@/types";
import { EXPEDICOES, HEROIS } from "@/data/catacumbas";

// Dificuldade 3/5 — JOIN entre duas tabelas (sem GROUP BY: isso fica para o chefe). Template com comentários.
// Ordem de jogo: depois da 11, antes da 31.
const mission30: Mission = {
  id: 30,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo IX",
  missionTitle: "A Marcha dos Espectros",
  concept: "SQL: JOIN (juntar duas tabelas)",
  narrative: `Depois das criptas vem um corredor comprido, cheio de armaduras vazias. Uma delas se mexe. É o Guerreiro Espectral: o fantasma de um soldado que marchou em todas as expedições às Catacumbas.

"Eu estive em todas", diz ele, com a voz ecoando dentro do elmo. "Mas não lembro com QUEM." Ele te entrega o Livro das Expedições, e você entende o problema: o livro não guarda nomes, só um número, o heroi_id. Os nomes estão em outro livro, a lista dos heróis da Guilda.

Junte os dois livros e conte ao Guerreiro quem foi a cada lugar. Ele está esperando há duzentos anos. Mais cinco minutos não vão matar ninguém. Até porque ele já morreu.`,
  realWorld: `JOIN junta duas tabelas por uma coluna em comum. Uma loja guarda os clientes numa tabela e os pedidos em outra, e o pedido só tem o número do cliente. Para mostrar "quem comprou o quê", você junta as duas pelo número. É um dos comandos mais usados no SQL do dia a dia.`,
  theory: `Muitas vezes a informação está dividida em duas tabelas. Uma coluna da primeira aponta para o id da segunda, e é assim que elas se ligam:

  magos:    id, nome
  feiticos: id, mago_id, nome, poder

JOIN junta as duas, e ON diz qual coluna combina com qual:

  SELECT magos.nome, feiticos.poder
  FROM feiticos
  JOIN magos ON feiticos.mago_id = magos.id;

Cada feitiço ganha o nome do mago que o lançou:
  nome   poder
  Ilda   90
  Bram   40

Para escrever menos, dê apelidos às tabelas, logo depois do nome delas:

  SELECT m.nome, f.poder
  FROM feiticos f
  JOIN magos m ON f.mago_id = m.id;

Depois do JOIN, é como se fosse uma tabela só: dá para usar WHERE e ORDER BY normalmente.`,
  instructions: `Use as tabelas expedicoes e herois (veja as duas na aba Dados). Para cada expedição, mostre:

  nome    → o nome do herói que foi
  destino → para onde ele foi
  ouro    → o ouro que ele trouxe

Da expedição que trouxe mais ouro para a que trouxe menos. Devem aparecer as 9 expedições.`,
  hints: [
    "Comece por FROM expedicoes e junte com JOIN herois. O ON liga o heroi_id da expedição ao id do herói: ON expedicoes.heroi_id = herois.id.",
    "SELECT h.nome, e.destino, e.ouro FROM expedicoes e JOIN herois h ON e.heroi_id = h.id ORDER BY e.ouro DESC;",
  ],
  solution: `SELECT h.nome, e.destino, e.ouro
FROM expedicoes e
JOIN herois h ON e.heroi_id = h.id
ORDER BY e.ouro DESC;`,
  codeTemplate: `-- A Marcha dos Espectros
-- Colunas: nome (de herois), destino e ouro (de expedicoes)
-- Junte as tabelas: o heroi_id da expedição aponta para o id do herói
-- Ordem: do maior ouro para o menor
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "destino", "ouro"],
    rowCount: 9,
    rows: [
      ["Kael", "Poço Sombrio", "200"],
      ["Grom", "Poço Sombrio", "180"],
      ["Grom", "Cripta Norte", "150"],
      ["Brenna", "Cripta Sul", "140"],
      ["Brenna", "Cripta Norte", "120"],
      ["Kael", "Cripta Sul", "110"],
      ["Brenna", "Salão dos Ossos", "90"],
      ["Zix", "Salão dos Ossos", "70"],
      ["Zix", "Túnel Estreito", "60"],
    ],
    tooMany: "Vieram linhas demais. Confira o ON: ele precisa ligar o heroi_id da expedição ao id do herói (ON e.heroi_id = h.id). Sem o ON certo, cada expedição se junta com vários heróis. E aqui é JOIN simples: o LEFT JOIN traz também os heróis que nunca viajaram.",
    tooFew: "Vieram linhas de menos. Cada expedição deve aparecer uma vez: confira se não sobrou um WHERE e se o ON compara heroi_id com o id do herói.",
    wrongRow: "As linhas não batem. Confira se o ON liga e.heroi_id = h.id (e não o id da expedição) e se a ordem é ORDER BY ouro DESC.",
  }),
  xpReward: 30,
  coinReward: 25,
  requiredCode: [
    { pattern: "\\bjoin\\b", flags: "i", hint: "Junte os dois livros: FROM expedicoes JOIN herois." },
    { pattern: "\\bon\\b[\\s\\S]*heroi_id", flags: "i", hint: "Diga como as tabelas se ligam: ON ... heroi_id = ... id." },
    { pattern: "\\bORDER\\s+BY\\b", flags: "i", hint: "Ordene do maior ouro para o menor com ORDER BY." },
  ],
  dataFile: EXPEDICOES,
  extraDataFiles: [HEROIS],
  unlockCondition: { requiredMissionIds: [11] },
};

export default mission30;
