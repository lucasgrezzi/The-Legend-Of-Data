import type { Mission } from "@/types";
import { CATALOGO, PEDIDOS_SEMANA } from "@/data/forja";

// Dificuldade 4/5 — merge: juntar duas tabelas por uma coluna em comum (o JOIN do Pandas). O resto é revisão
// (groupby + sum + sort_values + .items(), da fase 13). Template só com comentários. Dois arquivos em /data.
// Ordem de jogo: depois da 13 (O Fole das Regiões).
const mission23: Mission = {
  id: 23,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo VI",
  missionTitle: "O Ettin dos Dois Livros",
  concept: "Pandas: juntar duas tabelas com merge",
  narrative: `O fole respira, o fogo ruge, e Brokk finalmente sorri. Dura pouco.

Na porta da Forja está um Ettin: um gigante com DUAS cabeças. A da esquerda segura o livro de pedidos da semana. A da direita segura o catálogo de preços. E as duas cabeças não se falam desde uma briga antiga sobre quem ficava com o chapéu.

"Quero cobrar os fregueses", diz Brokk, "mas o livro de pedidos só diz o NÚMERO da peça. O preço está no outro livro. E esse grandalhão não deixa um livro chegar perto do outro."

Você vai ter que juntar os dois livros numa tabela só. No SQL isso se chamava JOIN, lembra do Rei Esquecido? No Pandas, o nome é merge.`,
  realWorld: `Quase nunca a informação está toda numa tabela só. A loja guarda os pedidos de um lado e o cadastro de produtos do outro, ligados por um código. O merge junta as duas usando essa coluna em comum, igual ao JOIN do SQL. É como juntar a lista de chamada com o boletim pelo número do aluno.`,
  theory: `Duas tabelas que têm uma coluna em comum podem virar uma só com o merge:

  alunos = pd.read_csv("/data/alunos.csv")     # colunas: aluno_id, nome
  notas  = pd.read_csv("/data/notas.csv")      # colunas: aluno_id, nota

  juntas = notas.merge(alunos, on="aluno_id")

Leia assim: pegue as notas e cole, em cada linha, os dados do aluno que tem o MESMO aluno_id. O "on" diz qual é a coluna em comum. O resultado tem as colunas das duas tabelas: aluno_id, nota e nome.

Depois do merge, é uma tabela normal. Dá para agrupar e somar como você já fez no Fole:

  media = juntas.groupby("nome")["nota"].mean()

Nesta fase há DOIS arquivos. O principal continua em /data/mission.csv. O segundo está em /data/catalogo.csv. Veja os dois na aba Dados.`,
  instructions: `O livro de pedidos está em /data/mission.csv (colunas id, cliente, peca_id). O catálogo está em /data/catalogo.csv (colunas peca_id, peca, preco).

Junte os dois livros pela peça e descubra quanto cada freguês gastou na semana. Mostre um freguês por linha, de quem gastou mais para quem gastou menos.

Brokk espera ouvir exatamente:
  Grosh: 200
  Durin: 190
  Lia: 140
  Zik: 40`,
  hints: [
    "Leia os dois arquivos com pd.read_csv (um para cada caminho) e junte com pedidos.merge(catalogo, on=\"peca_id\"). Só depois disso a coluna preco aparece ao lado de cada pedido.",
    "gasto = juntos.groupby(\"cliente\")[\"preco\"].sum().sort_values(ascending=False) — e então: for cliente, total in gasto.items(): print(f\"{cliente}: {total}\")",
  ],
  solution: `import pandas as pd

pedidos = pd.read_csv("/data/mission.csv")
catalogo = pd.read_csv("/data/catalogo.csv")

juntos = pedidos.merge(catalogo, on="peca_id")
gasto = juntos.groupby("cliente")["preco"].sum().sort_values(ascending=False)

for cliente, total in gasto.items():
    print(f"{cliente}: {total}")`,
  codeTemplate: `import pandas as pd

# Os dois livros: pedidos em /data/mission.csv, preços em /data/catalogo.csv

# Junte os livros pela peça

# Quanto cada freguês gastou, de quem gastou mais para quem gastou menos
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Grosh: 200\nDurin: 190\nLia: 140\nZik: 40",
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "read_csv\\([^)]*catalogo", hint: "Leia também o catálogo: pd.read_csv(\"/data/catalogo.csv\")." },
    { pattern: "\\.merge\\(|pd\\.merge\\(", hint: "Junte as duas tabelas com .merge(..., on=\"peca_id\") — é a lição desta fase." },
    { pattern: "\\.groupby\\(", hint: "Some o gasto de cada freguês com .groupby(\"cliente\")[\"preco\"].sum()." },
    { pattern: "\\.sort_values\\(", hint: "Ordene com .sort_values(ascending=False) — não ordene na mão." },
  ],
  dataFile: PEDIDOS_SEMANA,
  extraDataFiles: [CATALOGO],
  unlockCondition: { requiredMissionIds: [13] },
};

export default mission23;
