import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 3/5 — subconsulta (um SELECT dentro do WHERE). Revisão: AVG (fase 10), WHERE e ORDER BY.
// Ordem de jogo: depois da 10, antes da 11.
const mission29: Mission = {
  id: 29,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo VII",
  missionTitle: "O Vampiro da Média",
  concept: "SQL: subconsulta (um SELECT dentro do outro)",
  narrative: `O relatório do Guardião ficou lindo. Ele até mandou emoldurar. Mas a porta de ferro continua fechada, porque quem tem a chave é o Vampiro da Média.

Ele é chato com comida. Só aceita relíquias que valem MAIS do que a média de todas as relíquias do salão, as amaldiçoadas inclusive. "As abaixo da média têm gosto de papelão", explica, com nojo.

Você poderia calcular a média na mão e escrever o número na consulta. Só que o Guardião vive mudando os valores do livro. Se a média mudar amanhã, a consulta fica errada. Peça ao SQL para calcular a média sozinho, DENTRO da consulta.`,
  realWorld: `Uma subconsulta é uma pergunta dentro de outra. "Quais produtos custam mais que a média?" depende de outra pergunta antes: "qual é a média?". Em vez de anotar a média num papel e digitar depois, o SQL responde as duas de uma vez, e a resposta continua certa mesmo quando os dados mudam.`,
  theory: `Lembra do AVG? Ele devolve um número só:

  SELECT AVG(poder) FROM magos;
  → 50

Esse SELECT pode ir DENTRO de outro, no lugar de um número. Basta colocar entre parênteses:

  SELECT nome, poder
  FROM magos
  WHERE poder > (SELECT AVG(poder) FROM magos);

O SQL resolve primeiro o de dentro (a média dá 50) e depois o de fora, como se você tivesse escrito WHERE poder > 50.

Por que não escrever 50 de uma vez? Porque, se um mago novo entrar, a média muda, e a consulta com a subconsulta continua certa sozinha.

Detalhes:
• A subconsulta vai sempre entre parênteses.
• Para comparar com > ou <, ela precisa devolver um valor só (por isso funciona com AVG, MAX, MIN, COUNT…).`,
  instructions: `Na tabela reliquias, encontre as relíquias que valem MAIS do que a média de valor de TODAS as relíquias (amaldiçoadas inclusive).

Mostre o nome e o valor, da mais valiosa para a menos valiosa. A média precisa ser calculada pela própria consulta, sem escrever o número. Devem aparecer 5 relíquias.`,
  hints: [
    "A média vem de SELECT AVG(valor) FROM reliquias. Coloque essa consulta inteira entre parênteses no lugar do número: WHERE valor > ( ... ).",
    "SELECT nome, valor FROM reliquias WHERE valor > (SELECT AVG(valor) FROM reliquias) ORDER BY valor DESC;",
  ],
  solution: `SELECT nome, valor
FROM reliquias
WHERE valor > (SELECT AVG(valor) FROM reliquias)
ORDER BY valor DESC;`,
  codeTemplate: `-- O Vampiro da Média
-- Colunas: nome e valor
-- Filtro: valor maior que a média de todas (calcule com outro SELECT, entre parênteses)
-- Ordem: da mais valiosa para a menos valiosa
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "valor"],
    rowCount: 5,
    rows: [
      ["Escudo do Rei", "260"],
      ["Anel do Eclipse", "210"],
      ["Machado Rúnico", "200"],
      ["Lança do Vigia", "170"],
      ["Colar de Presas", "150"],
    ],
    tooMany: "Vieram relíquias demais. O Vampiro só quer as que valem MAIS que a média (>), e a média é de TODAS as relíquias. Confira se a subconsulta não tem um WHERE sobrando.",
    tooFew: "Vieram relíquias de menos. A média precisa ser de TODAS as relíquias, as amaldiçoadas inclusive: a subconsulta não leva WHERE. E não filtre as amaldiçoadas na consulta de fora.",
  }),
  xpReward: 30,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\(\\s*SELECT\\s+AVG\\s*\\(", flags: "i", hint: "Calcule a média dentro da consulta: WHERE valor > (SELECT AVG(valor) FROM reliquias). Escrever o número na mão não vale!" },
    { pattern: "\\bORDER\\s+BY\\b", flags: "i", hint: "Deixe da mais valiosa para a menos valiosa com ORDER BY valor DESC." },
  ],
  dataFile: RELIQUIAS,
  unlockCondition: { requiredMissionIds: [10] },
};

export default mission29;
