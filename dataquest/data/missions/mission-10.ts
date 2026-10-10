import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 3/5 — funções de agregação (COUNT, SUM, AVG, MAX) + apelidos com AS. Template só com comentários.
// Ordem de jogo: depois da 9, antes da 11.
const mission10: Mission = {
  id: 10,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo III",
  missionTitle: "O Inventário do Guardião",
  concept: "SQL: COUNT, SUM, AVG, MAX e AS",
  narrative: `Com as relíquias na mochila, você chega a uma porta de ferro. O Guardião bate o cajado no chão. A porta não se mexe. Ele bate de novo. Nada. Ele finge que era isso mesmo que queria.

"Antes de passar, preciso de um relatório para o meu livro", diz, ajeitando os óculos (sim, esqueletos usam óculos). "A lista inteira não, meus olhos já não leem tanto. Quero os números: quantas relíquias podem sair, quanto valem juntas, quanto vale uma em média e quanto vale a mais preciosa."

Traduzindo: ele quer um resumo. Esqueletos adoram resumos. Ocupam menos espaço na caveira.`,
  realWorld: `COUNT conta, SUM soma, AVG tira a média e MAX acha o maior valor. São as contas do rodapé de uma planilha, só que feitas pelo banco de dados. Todo painel de empresa ("vendas do mês", "ticket médio") começa com elas. O AS só dá um nome legível para a coluna do resultado.`,
  theory: `Às vezes você não quer as linhas, e sim um resumo delas. As funções de agregação transformam muitas linhas em um único valor:

  COUNT(*)     → quantas linhas existem
  SUM(coluna)  → soma dos valores
  AVG(coluna)  → média dos valores
  MAX(coluna)  → maior valor   ·   MIN(coluna) → menor valor

AS dá um apelido para a coluna do resultado:

  SELECT COUNT(*) AS quantos,
         AVG(forca) AS forca_media
  FROM monstros;

O WHERE continua funcionando: ele filtra as linhas ANTES do resumo ser calculado.

  SELECT MAX(forca) AS mais_forte
  FROM monstros
  WHERE habitat = 'caverna';`,
  instructions: `Faça o relatório do Guardião só com as relíquias que podem sair das Catacumbas — as que não estão amaldiçoadas.

O resultado deve ter uma única linha, com estas colunas, nesta ordem:
  total  → quantas relíquias
  soma   → o valor de todas juntas
  media  → o valor médio
  maior  → o maior valor`,
  hints: [
    "Primeiro o filtro: WHERE amaldicoada = 'nao'. Depois, no SELECT, uma função para cada número: COUNT, SUM, AVG e MAX.",
    "Cada coluna precisa do apelido pedido: COUNT(*) AS total, SUM(valor) AS soma, e assim por diante — separadas por vírgula.",
  ],
  solution: `SELECT COUNT(*) AS total,
       SUM(valor) AS soma,
       AVG(valor) AS media,
       MAX(valor) AS maior
FROM reliquias
WHERE amaldicoada = 'nao';`,
  codeTemplate: `-- O Inventário do Guardião
-- Uma linha só: total, soma, media e maior
-- Apenas relíquias que podem sair (não amaldiçoadas)
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["total", "soma", "media", "maior"],
    rowCount: 1,
    firstRow: ["8", "1030", "128.75", "260"],
  }),
  xpReward: 30,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\bcount\\s*\\(", flags: "i", hint: "Conte as relíquias com COUNT(*)." },
    { pattern: "\\bsum\\s*\\(", flags: "i", hint: "Some os valores com SUM(valor)." },
    { pattern: "\\bavg\\s*\\(", flags: "i", hint: "Calcule a média com AVG(valor)." },
    { pattern: "\\bmax\\s*\\(", flags: "i", hint: "Encontre o maior valor com MAX(valor)." },
  ],
  dataFile: RELIQUIAS,
  unlockCondition: { requiredMissionIds: [9] },
};

export default mission10;
