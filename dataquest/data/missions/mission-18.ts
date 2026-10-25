import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 2/5 — LIKE com % (um conceito só; WHERE e ORDER BY já foram vistos). Template com comentários.
// Ordem de jogo: depois da 9, antes da 10.
const mission18: Mission = {
  id: 18,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo IV",
  missionTitle: "A Memória do Guardião",
  concept: "SQL: LIKE (buscar por um pedaço do texto)",
  narrative: `Você já está saindo do Salão dos Ossos quando o Guardião estala os dedos. Literalmente — dá para ouvir os ossinhos.

"Espere! Esqueci de anotar umas relíquias no livro. Lembro que o nome começava com A..." Ele coça a caveira. "Ou era com E? Não, com A. Certeza. Quase certeza."

Quinhentos anos de serviço fazem isso com a memória de qualquer um. Por sorte, o SQL sabe procurar por um PEDAÇO do nome — não precisa saber ele inteiro.`,
  realWorld: `LIKE procura textos parecidos, não iguaizinhos. É o que acontece quando você digita "cam" na busca de uma loja e aparecem "camisa", "camiseta" e "caminhão de brinquedo". O % funciona como um curinga: "qualquer coisa pode vir aqui".`,
  theory: `Com o sinal de =, o SQL só acha textos IGUAIZINHOS:

  WHERE nome = 'Dragão Verde'

Para achar por um pedaço do texto, use LIKE junto com o símbolo %. O % quer dizer "qualquer coisa (ou nada) neste lugar":

  WHERE nome LIKE 'Dra%'    -- começa com Dra
  WHERE nome LIKE '%Verde'  -- termina com Verde
  WHERE nome LIKE '%ão%'    -- tem ão em qualquer lugar

Atenção a dois detalhes:
• O texto vai entre aspas simples, como sempre: 'Dra%'
• Maiúscula e minúscula contam: 'dra%' NÃO acha "Dragão"

ORDER BY também ordena texto — em ordem alfabética, de A a Z:

  ORDER BY nome`,
  instructions: `Ajude o Guardião a lembrar: na tabela reliquias, encontre as relíquias cujo nome começa com a letra A (maiúscula).

Mostre o nome e a sala de cada uma, em ordem alfabética pelo nome. Devem aparecer 3 relíquias.`,
  hints: [
    "Use WHERE nome LIKE '...' — e lembre que o % é o curinga: 'A%' quer dizer \"começa com A e depois qualquer coisa\".",
    "SELECT nome, sala FROM reliquias WHERE nome LIKE 'A%' ORDER BY nome;",
  ],
  solution: `SELECT nome, sala
FROM reliquias
WHERE nome LIKE 'A%'
ORDER BY nome;`,
  codeTemplate: `-- A Memória do Guardião
-- Colunas: nome e sala
-- Filtro: nomes que começam com A
-- Ordem: alfabética pelo nome
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "sala"],
    rowCount: 3,
    firstRow: ["Adaga Silenciosa", "Oeste"],
    tooMany: "Vieram relíquias demais. Confira se o filtro está pegando só os nomes que COMEÇAM com A: o certo é LIKE 'A%' (o % fica só no fim).",
    tooFew: "Vieram relíquias de menos. Confira:\n• o % — 'A%' quer dizer \"começa com A e depois qualquer coisa\". Sem o %, o SQL procura um nome que seja só a letra A\n• a letra precisa ser maiúscula: 'a%' não acha \"Amuleto\"",
  }),
  xpReward: 25,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\bLIKE\\b", flags: "i", hint: "Use LIKE com o curinga %: WHERE nome LIKE 'A%'." },
    { pattern: "\\bORDER\\s+BY\\b", flags: "i", hint: "Deixe em ordem alfabética com ORDER BY nome." },
  ],
  dataFile: RELIQUIAS,
  unlockCondition: { requiredMissionIds: [9] },
};

export default mission18;
