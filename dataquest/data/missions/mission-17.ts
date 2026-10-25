import type { Mission } from "@/types";
import { BAUS } from "@/data/catacumbas";

// Dificuldade 1/5 — LIMIT (um conceito só; ORDER BY já foi visto na 3). Template com comentários.
// Ordem de jogo: depois da 3, antes da 9.
const mission17: Mission = {
  id: 17,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo II",
  missionTitle: "A Sala dos Baús",
  concept: "SQL: LIMIT (só as primeiras linhas)",
  narrative: `Logo depois da primeira escavação, uma porta range sozinha (portas de catacumba adoram um suspense). Lá dentro: baús. Oito baús. Cada um com uma etiqueta dizendo quanto ouro guarda — os Arquivistas antigos eram organizados assim.

Só que a sua mochila é pequena. Cabem três baús, nem um a mais. Sim, eu sei, mochila de herói devia ser infinita. Reclame com o ferreiro.

A ideia é simples: pegar os três baús com MAIS ouro. Ordenar você já sabe. Falta só dizer ao SQL "chega, só quero os primeiros".`,
  realWorld: `LIMIT corta o resultado e deixa só as primeiras linhas. Junto com ORDER BY, ele responde perguntas de "top": os 10 produtos mais vendidos, os 3 clientes que mais compraram, as 5 notícias mais lidas. É como pedir "me mostra só o pódio" em vez da lista inteira.`,
  theory: `Você já sabe ordenar com ORDER BY. Às vezes, porém, não queremos a lista inteira — só as primeiras linhas.

Para isso existe o LIMIT, que vai no FIM da consulta, com o número de linhas que você quer:

  SELECT nome, pontos
  FROM jogadores
  ORDER BY pontos DESC
  LIMIT 2;

Leia assim: pegue nome e pontos dos jogadores, do maior para o menor, e pare depois de 2 linhas. O resultado seria o 1º e o 2º colocados — o pódio.

A ordem importa: primeiro o SQL ordena (ORDER BY), DEPOIS corta (LIMIT). Sem o ORDER BY, o LIMIT pega as primeiras linhas na ordem em que estão guardadas — que pode não ser a que você quer.`,
  instructions: `Na tabela baus, descubra os 3 baús com mais ouro. Mostre o nome e o ouro de cada um, do mais rico para o menos rico.

Devem aparecer só 3 baús.`,
  hints: [
    "Primeiro ordene do maior para o menor: ORDER BY ouro DESC. Depois corte a lista com LIMIT.",
    "SELECT nome, ouro FROM baus ORDER BY ouro DESC LIMIT 3;",
  ],
  solution: `SELECT nome, ouro
FROM baus
ORDER BY ouro DESC
LIMIT 3;`,
  codeTemplate: `-- A Sala dos Baús
-- Colunas: nome e ouro
-- Ordem: do mais rico para o menos rico
-- No fim: só os 3 primeiros
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "ouro"],
    rowCount: 3,
    firstRow: ["Baú Real", "340"],
    tooMany: "Vieram baús demais — a mochila só aguenta 3!\n\nColoque LIMIT 3 no fim da consulta, depois do ORDER BY.",
  }),
  xpReward: 25,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\bORDER\\s+BY\\b", flags: "i", hint: "Ordene do mais rico para o menos rico com ORDER BY ouro DESC — sem isso, o LIMIT pega os baús na ordem em que estão guardados." },
    { pattern: "\\bLIMIT\\s+3\\b", flags: "i", hint: "Use LIMIT 3 no fim da consulta para ficar só com os 3 primeiros." },
  ],
  dataFile: BAUS,
  unlockCondition: { requiredMissionIds: [3] },
};

export default mission17;
