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
  chapterTitle: "As Catacumbas de Dados — Capitulo I",
  missionTitle: "A Primeira Escavacao",
  narrative: `As Catacumbas guardam registros de todas as transacoes do Imperio. Cada tabela e uma sala diferente. Para encontrar as reliquias mais valiosas, o Arquivista precisa dominar a linguagem de consulta das Catacumbas: o SQL.`,
  theory: `SELECT escolhe quais colunas ver.
WHERE filtra as linhas:

  SELECT produto, valor
  FROM vendas
  WHERE valor > 100
  ORDER BY valor DESC;

A tabela vendas contem as colunas:
  id | produto | valor | regiao`,
  instructions: `Consulte a tabela vendas e retorne apenas
as colunas produto e valor para os registros
onde valor seja maior que 150.

Ordene por valor em ordem decrescente.`,
  codeTemplate: `-- Missao 3: A Primeira Escavacao
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
  unlockCondition: { requiredMissionIds: [1, 2] },
};

export default mission3;
