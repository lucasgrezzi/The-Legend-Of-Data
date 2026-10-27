import type { Mission } from "@/types";
import { EXPEDICOES, HEROIS } from "@/data/catacumbas";

// Dificuldade 4/5 — LEFT JOIN + IS NULL (quem não tem par na outra tabela). Revisão: JOIN (fase 30), ORDER BY.
// Ordem de jogo: depois da 30, antes do chefe 12.
const mission31: Mission = {
  id: 31,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo X",
  missionTitle: "A Sombra dos Esquecidos",
  concept: "SQL: LEFT JOIN (incluir quem não tem par)",
  narrative: `O Guerreiro Espectral descansa em paz, finalmente. Mas o corredor ficou mais escuro. Uma sombra se descola da parede.

"Você leu o Livro das Expedições e só falou de quem viajou", sussurra a Sombra dos Esquecidos. "E os heróis que NUNCA desceram até aqui? Ninguém lembra deles. O seu JOIN nem sabe que eles existem."

Ela tem razão, e é um pouco assustador. O JOIN só junta quem tem par nas duas tabelas. Herói sem expedição simplesmente some do resultado. Para achar os esquecidos, você vai precisar de um JOIN que não deixa ninguém para trás.`,
  realWorld: `LEFT JOIN mantém todas as linhas da primeira tabela, mesmo as que não têm par na segunda. É assim que uma loja descobre "clientes que nunca compraram nada" ou uma escola acha "alunos que não entregaram nenhum trabalho": junta tudo e procura quem ficou com o lado de lá vazio.`,
  theory: `O JOIN comum só mantém as linhas que têm par nas DUAS tabelas. Um mago que nunca lançou feitiço some do resultado.

O LEFT JOIN mantém TODAS as linhas da tabela da esquerda (a do FROM). Quem não tem par aparece com as colunas da outra tabela vazias. No SQL, vazio se chama NULL:

  SELECT m.nome, f.poder
  FROM magos m
  LEFT JOIN feiticos f ON f.mago_id = m.id;

  nome   poder
  Ilda   90
  Bram   40
  Nina   NULL   ← a Nina nunca lançou feitiço

Para ficar SÓ com quem não tem par, filtre as linhas vazias com IS NULL:

  SELECT m.nome
  FROM magos m
  LEFT JOIN feiticos f ON f.mago_id = m.id
  WHERE f.id IS NULL;

Atenção:
• A ordem importa: a tabela que você quer inteira vem no FROM, e a outra vem no LEFT JOIN.
• Para conferir se está vazio, use IS NULL. Com = NULL não funciona, porque vazio não é igual a nada, nem a outro vazio.`,
  instructions: `Use as tabelas herois e expedicoes (veja as duas na aba Dados) para encontrar os heróis que NUNCA fizeram uma expedição.

Mostre o nome e a raca de cada um, em ordem alfabética pelo nome. Devem aparecer 3 heróis.`,
  hints: [
    "Agora o FROM é herois (a tabela que você quer inteira), com LEFT JOIN expedicoes ON e.heroi_id = h.id. Quem nunca viajou fica com as colunas de expedicoes vazias (NULL).",
    "SELECT h.nome, h.raca FROM herois h LEFT JOIN expedicoes e ON e.heroi_id = h.id WHERE e.id IS NULL ORDER BY h.nome;",
  ],
  solution: `SELECT h.nome, h.raca
FROM herois h
LEFT JOIN expedicoes e ON e.heroi_id = h.id
WHERE e.id IS NULL
ORDER BY h.nome;`,
  codeTemplate: `-- A Sombra dos Esquecidos
-- Colunas: nome e raca
-- Mantenha TODOS os heróis e procure quem ficou sem expedição
-- Ordem: alfabética pelo nome
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "raca"],
    rowCount: 3,
    rows: [
      ["Fennick", "goblin"],
      ["Lyra", "elfo"],
      ["Mirela", "anao"],
    ],
    tooMany: "Vieram heróis demais. O LEFT JOIN traz todo mundo: quem viajou e quem não viajou. Para ficar só com os esquecidos, filtre quem ficou sem expedição: WHERE e.id IS NULL.",
    tooFew: "Não veio nenhum esquecido (ou vieram de menos). Confira:\n• o FROM precisa ser herois, com LEFT JOIN expedicoes (com JOIN simples, os esquecidos somem antes do filtro)\n• para achar o vazio, use IS NULL. Com = NULL o SQL não acha nada",
  }),
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "\\bleft\\s+(outer\\s+)?join\\b", flags: "i", hint: "Use LEFT JOIN: só ele mantém os heróis que não têm nenhuma expedição." },
    { pattern: "\\bis\\s+null\\b", flags: "i", hint: "Filtre quem ficou sem expedição com IS NULL (ex.: WHERE e.id IS NULL)." },
    { pattern: "\\bORDER\\s+BY\\b", flags: "i", hint: "Deixe em ordem alfabética com ORDER BY nome." },
  ],
  dataFile: HEROIS,
  extraDataFiles: [EXPEDICOES],
  unlockCondition: { requiredMissionIds: [30] },
};

export default mission31;
