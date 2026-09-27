import type { Mission } from "@/types";
import { EXPEDICOES, HEROIS } from "@/data/catacumbas";

// Dificuldade 5/5 — chefe da trilha SQL: JOIN entre duas tabelas + GROUP BY + ORDER BY.
// Template quase vazio. Ordem de jogo: depois da 11; abre a Forja (Pandas).
const mission12: Mission = {
  id: 12,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo V (Chefe)",
  missionTitle: "O Rei Esquecido",
  concept: "SQL: JOIN entre tabelas",
  narrative: `No coração das Catacumbas, sobre um trono de pedra, está o Rei Esquecido — o primeiro Arquivista-Rei, que se trancou aqui na Grande Corrupção. Seus olhos acendem quando você se aproxima.

"Nenhum herói passa pela minha porta sem que eu saiba quem é digno", ele diz, abrindo dois tomos: a lista dos heróis e o Livro das Expedições. "Mas o Livro só guarda números — o herói de cada expedição é apenas um heroi_id. Junte os dois tomos e me diga quem trouxe mais ouro a este reino. Faça isso, e a passagem para a Forja é sua."`,
  theory: `Muitas vezes a informação está dividida em duas tabelas. Uma coluna da primeira aponta para o id da segunda — é assim que elas se ligam.

  magos:    id, nome
  feiticos: id, mago_id, nome, poder

JOIN junta as duas, e ON diz qual coluna combina com qual:

  SELECT magos.nome, feiticos.nome
  FROM feiticos
  JOIN magos ON feiticos.mago_id = magos.id;

Para escrever menos, dê apelidos às tabelas:

  SELECT m.nome, f.poder
  FROM feiticos f
  JOIN magos m ON f.mago_id = m.id;

Depois do JOIN, é como se fosse uma tabela só — dá para usar WHERE, GROUP BY, HAVING e ORDER BY normalmente:

  SELECT m.nome, MAX(f.poder) AS mais_forte
  FROM feiticos f
  JOIN magos m ON f.mago_id = m.id
  GROUP BY m.nome;

Atenção: o JOIN só mantém as linhas que têm par nas duas tabelas.`,
  instructions: `Use as tabelas herois e expedicoes (veja as duas na aba Dados) para mostrar, para cada herói que já fez expedições:

  nome       → o nome do herói
  viagens    → quantas expedições ele fez
  ouro_total → o ouro somado de todas elas

Do herói que trouxe mais ouro para o que trouxe menos.`,
  hints: [
    "Ligue as tabelas pela coluna que as conecta: expedicoes.heroi_id = herois.id. Com JOIN ... ON, cada expedição ganha o nome do seu herói.",
    "Depois do JOIN, agrupe por nome (GROUP BY h.nome) e use COUNT(*) AS viagens e SUM(e.ouro) AS ouro_total. Termine com ORDER BY ouro_total DESC.",
  ],
  solution: `SELECT h.nome,
       COUNT(*) AS viagens,
       SUM(e.ouro) AS ouro_total
FROM expedicoes e
JOIN herois h ON e.heroi_id = h.id
GROUP BY h.nome
ORDER BY ouro_total DESC;`,
  codeTemplate: `-- O Rei Esquecido
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "viagens", "ouro_total"],
    rowCount: 4,
    firstRow: ["Brenna", "3", "350"],
  }),
  xpReward: 40,
  coinReward: 30,
  requiredCode: [
    { pattern: "\\bjoin\\b", flags: "i", hint: "Junte os dois tomos: use JOIN entre expedicoes e herois." },
    { pattern: "\\bon\\b[\\s\\S]*heroi_id", flags: "i", hint: "Diga como as tabelas se ligam: ON ... heroi_id = ... id." },
    { pattern: "\\bgroup\\s+by\\b", flags: "i", hint: "Some o ouro de cada herói agrupando com GROUP BY." },
  ],
  dataFile: HEROIS,
  extraDataFiles: [EXPEDICOES],
  unlockCondition: { requiredMissionIds: [11] },
};

export default mission12;
