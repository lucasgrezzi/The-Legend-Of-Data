import type { Mission } from "@/types";
import { ENTREGAS } from "@/data/forja";

// Dificuldade 4/5 — pivot_table: transformar uma lista longa numa grade (linhas × colunas, com soma).
// A saída é o próprio print da tabela (formato do Pandas, conferido no Pyodide). Template só com comentários.
// Ordem de jogo: depois da 23 (O Ettin dos Dois Livros).
const mission24: Mission = {
  id: 24,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo VII",
  missionTitle: "A Teia da Aranha Tecelã",
  concept: "Pandas: tabela dinâmica com pivot_table",
  narrative: `Os fregueses pagaram, o Ettin foi embora discutindo consigo mesmo, e Brokk foi dormir. Você fica sozinho com o livro de entregas. Ou quase.

No teto da Forja mora uma Aranha Tecelã. Ela não tece teias redondas: tece GRADES, com fios na horizontal e na vertical, e guarda um número em cada cruzamento.

"Que lista mais feia", diz ela, descendo pelo fio. "Uma entrega embaixo da outra, regiões repetidas, armas repetidas. Ninguém enxerga nada assim. Eu quero uma grade: as regiões nas linhas, as armas nas colunas e, em cada quadradinho, quantas armas foram para lá."

Ela sorri com os oito olhos. "Se a grade sair torta, você fica preso na teia."`,
  realWorld: `Uma tabela dinâmica (pivot table) é aquele resumo em grade que todo mundo faz no Excel: vendas por loja nas linhas, meses nas colunas, total em cada célula. Com pivot_table, o Pandas faz isso numa linha. É o jeito mais rápido de comparar duas categorias ao mesmo tempo.`,
  theory: `O groupby resume por UMA categoria. A pivot_table resume por DUAS ao mesmo tempo e monta uma grade.

Imagine uma lista de pontos de um campeonato:

  time,  jogo,  pontos
  Leões, ida,   3
  Leões, volta, 1
  Ursos, ida,   0
  Ursos, volta, 3

  grade = df.pivot_table(index="time", columns="jogo", values="pontos", aggfunc="sum")
  print(grade)

Cada parte:
• index = o que vira LINHA (os times)
• columns = o que vira COLUNA (ida e volta)
• values = o número que vai dentro de cada quadradinho
• aggfunc = a conta para juntar os números. Use "sum" para somar.

O resultado impresso:

  jogo   ida  volta
  time
  Leões    3      1
  Ursos    0      3

Cuidado: sem o aggfunc, o Pandas faz a MÉDIA (e aparecem números com .0).`,
  instructions: `O livro de entregas está em /data/mission.csv (colunas id, regiao, arma, quantidade).

Monte a grade da Aranha: as regiões nas linhas, as armas nas colunas e, em cada quadradinho, a SOMA das quantidades. Depois mostre a grade com print.

A Aranha espera ver exatamente:
  arma    arco  espada
  regiao
  Leste      6       3
  Norte      1       6
  Sul        5       5`,
  hints: [
    "Tudo sai de uma linha: df.pivot_table(index=..., columns=..., values=..., aggfunc=\"sum\"). Quem vira linha é a regiao; quem vira coluna é a arma.",
    "grade = df.pivot_table(index=\"regiao\", columns=\"arma\", values=\"quantidade\", aggfunc=\"sum\") e depois print(grade). Se apareceu .0 nos números, faltou o aggfunc=\"sum\".",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
grade = df.pivot_table(index="regiao", columns="arma", values="quantidade", aggfunc="sum")

print(grade)`,
  codeTemplate: `import pandas as pd

# O livro de entregas da Forja

# A grade: regiões nas linhas, armas nas colunas, soma das quantidades

# Mostre a grade
`,
  editorLanguage: "python",
  validationType: "exact",
  // print() de um DataFrame: a 2ª linha ("regiao") tem espaços até a largura da tabela
  expectedOutput: "arma    arco  espada\nregiao              \nLeste      6       3\nNorte      1       6\nSul        5       5",
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "read_csv\\(", hint: "Leia o livro com pd.read_csv(\"/data/mission.csv\")." },
    { pattern: "pivot_table\\(", hint: "A grade sai com .pivot_table(...) — é a lição desta fase." },
  ],
  dataFile: ENTREGAS,
  unlockCondition: { requiredMissionIds: [23] },
};

export default mission24;
