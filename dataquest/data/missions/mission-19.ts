import type { Mission } from "@/types";
import { ESTOQUE } from "@/data/forja";

// Dificuldade 2/5 — sort_values + head (um conceito: "o top N"). O for que mostra o resultado já vem pronto.
// Ordem de jogo: depois da 4, antes da 20.
const mission19: Mission = {
  id: 19,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo II",
  missionTitle: "A Vitrine de Brokk",
  concept: "Pandas: ordenar e pegar as primeiras linhas",
  narrative: `Com o fogo aceso, Brokk resolveu caprichar na vitrine — a prateleira da frente, onde ficam as peças que todo cliente vê ao entrar.

"Vitrine boa mostra o que é CARO", ele explica, polindo um elmo com a barba. "Cliente vê peça cara, acha que a Forja é chique, compra uma ferradura e sai feliz."

Ele quer as três peças mais caras do estoque, da mais cara para a menos cara. Você podia ler a tabela inteira e procurar no olho... mas aí não seria Arquivista, seria só um curioso.`,
  realWorld: `Ordenar e pegar as primeiras linhas é a receita de qualquer "top 3", "top 10" ou "mais vendidos". sort_values ordena a tabela por uma coluna e head mostra só o começo. É o que um site de compras faz quando você clica em "ordenar por: maior preço".`,
  theory: `sort_values ordena o DataFrame (a tabela) por uma coluna. Você diz o nome da coluna entre aspas:

  ordenado = df.sort_values("pontos")

Por padrão, a ordem é do MENOR para o MAIOR. Para inverter (do maior para o menor), use ascending=False — com F maiúsculo:

  ordenado = df.sort_values("pontos", ascending=False)

head(n) pega só as n primeiras linhas:

  podio = ordenado.head(2)

Dá para fazer as duas coisas numa linha só, uma depois da outra:

  podio = df.sort_values("pontos", ascending=False).head(2)

Para mostrar só uma coluna, uma linha por vez, use um for — a coluna funciona como uma lista:

  for nome in podio["nome"]:
      print(nome)`,
  instructions: `O estoque da Forja está em /data/mission.csv. Descubra as 3 peças mais caras e mostre o nome de cada uma, uma por linha, da mais cara para a menos cara.

O ferreiro espera ouvir exatamente:
  Cota de Malha
  Martelo de Guerra
  Machado Duplo`,
  hints: [
    "Ordene pela coluna preco do maior para o menor: df.sort_values(\"preco\", ascending=False). Depois pegue o começo com .head(3).",
    "vitrine = df.sort_values(\"preco\", ascending=False).head(3) — o for que já está no código mostra os nomes.",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
vitrine = df.sort_values("preco", ascending=False).head(3)

for peca in vitrine["peca"]:
    print(peca)`,
  codeTemplate: `import pandas as pd

df = pd.read_csv("/data/mission.csv")

# Ordene pelo preço, do mais caro para o mais barato, e fique só com as 3 primeiras
vitrine = ___

# Mostra o nome de cada peça da vitrine (este pedaço já está pronto)
for peca in vitrine["peca"]:
    print(peca)`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Cota de Malha\nMartelo de Guerra\nMachado Duplo",
  xpReward: 30,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\.sort_values\\(", hint: "Ordene a tabela com .sort_values(\"preco\", ascending=False) — não escreva os nomes à mão." },
    { pattern: "\\.head\\(", hint: "Fique só com as 3 primeiras linhas usando .head(3)." },
    { pattern: "read_csv\\(", hint: "Leia o arquivo com pd.read_csv(\"/data/mission.csv\")." },
  ],
  dataFile: ESTOQUE,
  unlockCondition: { requiredMissionIds: [4] },
};

export default mission19;
