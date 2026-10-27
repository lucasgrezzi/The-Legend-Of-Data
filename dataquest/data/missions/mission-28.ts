import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 3/5 — CASE WHEN (um conceito só; WHERE e ORDER BY já foram vistos). Template com comentários.
// Ordem de jogo: depois da 18, antes da 10.
const mission28: Mission = {
  id: 28,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo V",
  missionTitle: "Os Selos do Lich",
  concept: "SQL: CASE WHEN (criar uma coluna com regras)",
  narrative: `O Guardião finalmente lembrou das relíquias. Agora ele quer carimbar um selo em cada uma que pode sair daqui: ouro, prata ou bronze, conforme o valor.

O problema é quem faz os carimbos: um Lich. Lich é um mago que virou morto-vivo de propósito, para ter mais tempo de estudar. Ele teve trezentos anos. Estudou tudo, menos matemática. O Escudo do Rei, a peça mais valiosa do salão, saiu com selo de bronze.

"Uma relíquia de 260 moedas com selo de BRONZE?", geme o Guardião. "Arquivista, por favor: faça o SQL decidir o selo. Ele pelo menos sabe contar."`,
  realWorld: `CASE WHEN cria uma coluna nova a partir de regras, como um "se… então…" dentro da consulta. É o que um banco faz para classificar clientes em "ouro", "prata" e "bronze", ou o que uma escola faz para transformar a nota em "aprovado" e "reprovado". A regra fica na consulta, e a tabela original não muda.`,
  theory: `CASE WHEN cria uma coluna nova escolhendo um valor para cada linha. Ele funciona como o if/elif/else do Python:

  SELECT nome, poder,
         CASE
           WHEN poder >= 80 THEN 'temido'
           WHEN poder >= 40 THEN 'respeitado'
           ELSE 'aprendiz'
         END AS fama
  FROM magos;

Leia assim: QUANDO o poder for 80 ou mais, ENTÃO 'temido'; QUANDO for 40 ou mais, ENTÃO 'respeitado'; SENÃO, 'aprendiz'.

Um mago com poder 90 sai assim:
  nome   poder  fama
  Ilda   90     temido

Três detalhes importantes:
• O SQL testa os WHEN de cima para baixo e para no PRIMEIRO que for verdade. Por isso a regra mais exigente vem primeiro: se o WHEN poder >= 40 viesse antes, o mago de 90 seria só "respeitado".
• Todo CASE termina com END. Depois do END, o AS dá o nome da coluna nova.
• O texto do resultado vai entre aspas simples: 'temido'.`,
  instructions: `Na tabela reliquias, pegue só as relíquias que NÃO são amaldiçoadas e mostre três colunas:

  nome  → o nome da relíquia
  valor → o valor
  selo  → 'ouro' (200 ou mais), 'prata' (100 ou mais) ou 'bronze'

Da mais valiosa para a menos valiosa. Devem aparecer 8 relíquias, e a primeira é o Escudo do Rei, com selo de ouro.`,
  hints: [
    "Comece pelo SELECT nome, valor e acrescente uma coluna CASE ... END AS selo. O filtro é WHERE amaldicoada = 'nao'.",
    "CASE WHEN valor >= 200 THEN 'ouro' WHEN valor >= 100 THEN 'prata' ELSE 'bronze' END AS selo — e termine com ORDER BY valor DESC.",
  ],
  solution: `SELECT nome, valor,
       CASE
         WHEN valor >= 200 THEN 'ouro'
         WHEN valor >= 100 THEN 'prata'
         ELSE 'bronze'
       END AS selo
FROM reliquias
WHERE amaldicoada = 'nao'
ORDER BY valor DESC;`,
  codeTemplate: `-- Os Selos do Lich
-- Colunas: nome, valor e selo (com CASE WHEN ... END AS selo)
-- Filtro: só as que não são amaldiçoadas
-- Ordem: da mais valiosa para a menos valiosa
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "valor", "selo"],
    rowCount: 8,
    rows: [
      ["Escudo do Rei", "260", "ouro"],
      ["Anel do Eclipse", "210", "ouro"],
      ["Lança do Vigia", "170", "prata"],
      ["Espada de Ossos", "120", "prata"],
      ["Amuleto da Lua", "90", "bronze"],
      ["Adaga Silenciosa", "80", "bronze"],
      ["Pergaminho do Eco", "60", "bronze"],
      ["Mapa das Criptas", "40", "bronze"],
    ],
    tooMany: "Vieram relíquias demais. Só as que NÃO são amaldiçoadas podem sair: WHERE amaldicoada = 'nao'.",
    tooFew: "Vieram relíquias de menos. O CASE WHEN não remove linhas, ele só escolhe o selo. Confira o WHERE: o certo é amaldicoada = 'nao'.",
    wrongRow: "Confira a ordem dos WHEN: o SQL para no PRIMEIRO que for verdade. A regra do ouro (>= 200) precisa vir antes da regra da prata (>= 100).",
  }),
  xpReward: 25,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\bCASE\\b[\\s\\S]*\\bWHEN\\b[\\s\\S]*\\bEND\\b", flags: "i", hint: "Crie o selo com CASE WHEN ... THEN ... ELSE ... END AS selo." },
    { pattern: "\\bORDER\\s+BY\\b", flags: "i", hint: "Deixe da mais valiosa para a menos valiosa com ORDER BY valor DESC." },
  ],
  dataFile: RELIQUIAS,
  unlockCondition: { requiredMissionIds: [18] },
};

export default mission28;
