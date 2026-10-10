import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 4/5 — GROUP BY + HAVING + ORDER BY. Template mínimo.
// Ordem de jogo: depois da 10, antes da 12.
const mission11: Mission = {
  id: 11,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo IV",
  missionTitle: "As Criptas por Tipo",
  concept: "SQL: GROUP BY e HAVING",
  narrative: `A porta de ferro range e abre. Atrás dela: quatro criptas seladas, uma para cada tipo de relíquia — armas, amuletos, pergaminhos e armaduras. Cripta é um quarto-cofre de catacumba, só que com mais teia de aranha.

Cada selo se desfaz quando alguém diz quantas relíquias daquele tipo existem e quanto elas valem juntas. Só que abrir uma cripta acorda o que dorme lá dentro, e ninguém aqui está a fim de acordar nada.

"Só abra as que valem mais de 300 moedas", aconselha o Guardião. "As outras... deixa dormir." Ele boceja. "Eu também queria."`,
  realWorld: `GROUP BY junta as linhas parecidas e faz a conta para cada grupo: vendas POR loja, alunos POR turma, gastos POR categoria no app do banco. O HAVING filtra os grupos depois de calculados — por exemplo, "só as categorias em que gastei mais de R$ 300".`,
  theory: `GROUP BY junta as linhas que têm o mesmo valor numa coluna e calcula um resumo para cada grupo:

  SELECT habitat,
         COUNT(*) AS quantos,
         SUM(forca) AS forca_total
  FROM monstros
  GROUP BY habitat;

Isso devolve uma linha por habitat — caverna, pântano, floresta...

E para filtrar os GRUPOS? O WHERE não serve: ele age antes dos grupos existirem. Para isso existe o HAVING, que vem depois do GROUP BY:

  SELECT habitat, COUNT(*) AS quantos
  FROM monstros
  GROUP BY habitat
  HAVING COUNT(*) >= 3;

Resumindo a ordem: FROM → WHERE (linhas) → GROUP BY → HAVING (grupos) → ORDER BY.`,
  instructions: `Descubra quais criptas valem a pena abrir. Considere todas as relíquias, inclusive as amaldiçoadas.

Para cada tipo, mostre as colunas tipo, quantidade e total (a soma dos valores). Fique só com os tipos cujo total passa de 300, do mais valioso para o menos valioso.`,
  hints: [
    "Agrupe por tipo com GROUP BY tipo. No SELECT: tipo, COUNT(*) AS quantidade e SUM(valor) AS total.",
    "\"Passa de 300\" é um filtro sobre o grupo, então vai no HAVING: HAVING SUM(valor) > 300. Por último, ORDER BY total DESC.",
  ],
  solution: `SELECT tipo,
       COUNT(*) AS quantidade,
       SUM(valor) AS total
FROM reliquias
GROUP BY tipo
HAVING SUM(valor) > 300
ORDER BY total DESC;`,
  codeTemplate: `-- As Criptas por Tipo
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["tipo", "quantidade", "total"],
    rowCount: 3,
    firstRow: ["arma", "4", "570"],
  }),
  xpReward: 30,
  coinReward: 25,
  requiredCode: [
    { pattern: "\\bgroup\\s+by\\b", flags: "i", hint: "Agrupe as relíquias por tipo com GROUP BY." },
    { pattern: "\\bhaving\\b", flags: "i", hint: "O filtro \"total passa de 300\" é sobre os grupos: use HAVING." },
  ],
  dataFile: RELIQUIAS,
  unlockCondition: { requiredMissionIds: [10] },
};

export default mission11;
