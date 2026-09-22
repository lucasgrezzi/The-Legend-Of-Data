import type { Mission } from "@/types";

const VENDAS_CSV = `id,produto,valor,regiao
1,Espada de Dados,300,Norte
2,Escudo SQL,150,Sul
3,Pocao Python,80,Leste
4,Manto Pandas,200,Oeste
5,Anel Viz,180,Norte`;

const mission3: Mission = {
  id: 3,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo I",
  missionTitle: "A Primeira Escavação",
  concept: "SQL: SELECT, WHERE e ORDER BY",
  narrative: `Com o Selo rompido, uma escadaria em espiral se revela e você desce às Catacumbas. Ali estão guardados os registros de todas as transações do Império, organizados em tabelas — cada tabela é uma sala diferente.

Para encontrar as relíquias mais valiosas sem revirar sala por sala, o Arquivista precisa dominar a linguagem de consulta das Catacumbas: o SQL.`,
  theory: `SQL é a língua das Catacumbas: você pede os dados e o banco responde com uma tabela.

SELECT escolhe as colunas e FROM diz de qual tabela:

  SELECT nome, nivel
  FROM herois;

WHERE filtra as linhas por uma condição:

  SELECT nome, nivel
  FROM herois
  WHERE nivel >= 10;

ORDER BY ordena o resultado. DESC = do maior para o menor; ASC = do menor para o maior:

  SELECT nome, nivel
  FROM herois
  WHERE nivel >= 10
  ORDER BY nivel DESC;

As colunas da tabela desta missão estão na aba Dados.`,
  instructions: `A tabela vendas guarda as transações do Império. Encontre só as relíquias valiosas — as que valem mais de 150 — mostrando apenas o nome do produto e o valor, da mais cara para a mais barata.

Consulte a aba Dados para ver as colunas disponíveis.`,
  hints: [
    "Você precisa de duas colunas (produto e valor) e de um filtro com WHERE. Atenção: \"mais de 150\" é > 150, não >=.",
    "Para a mais cara aparecer primeiro, termine a consulta com ORDER BY na coluna valor, em ordem decrescente (DESC).",
  ],
  solution: `SELECT produto, valor
FROM vendas
WHERE valor > 150
ORDER BY valor DESC;`,
  codeTemplate: `-- A Primeira Escavação
SELECT ___, ___
FROM vendas
WHERE ___ > ___
ORDER BY ___ DESC;`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["produto", "valor"],
    rowCount: 3,
    firstRow: ["Espada de Dados", "300"],
  }),
  xpReward: 25,
  coinReward: 20,
  dataFile: {
    filename: "vendas.csv",
    headers: ["id", "produto", "valor", "regiao"],
    rows: [
      ["1", "Espada de Dados", "300", "Norte"],
      ["2", "Escudo SQL", "150", "Sul"],
      ["3", "Pocao Python", "80", "Leste"],
      ["4", "Manto Pandas", "200", "Oeste"],
      ["5", "Anel Viz", "180", "Norte"],
    ],
    rawCsv: VENDAS_CSV,
  },
  unlockCondition: { requiredMissionIds: [8] },
};

export default mission3;
