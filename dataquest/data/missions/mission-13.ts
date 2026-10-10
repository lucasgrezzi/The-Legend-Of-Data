import type { Mission } from "@/types";
import { ENCOMENDAS } from "@/data/forja";

// Dificuldade 3/5 — filtro + groupby + sum + sort_values + .items(). Template só com comentários.
// Ordem de jogo: depois da 4 (A Forja Desperta).
const mission13: Mission = {
  id: 13,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo II",
  missionTitle: "O Fole das Regiões",
  concept: "Pandas: groupby, sum e sort_values",
  narrative: `Com o fogo aceso, a Forja voltou a receber encomendas das quatro regiões do reino. Mas o fole — aquele saco de couro gigante que sopra ar no fogo, tipo um pulmão de sanfona — está murcho e parado.

Brokk bate o martelo na bigorna. BLÉM. "O fole só respira para quem sabe de onde vem o ouro! Quero saber quanto cada região já PAGOU, da mais generosa para a mais pão-dura."

Ele cruza os braços. "E encomenda pendente não conta. Promessa não enche fole nenhum."`,
  realWorld: `groupby é o GROUP BY do Pandas: separa as linhas em grupos (aqui, por região) e calcula algo para cada um, como a soma. sort_values ordena o resultado. É o relatório de "faturamento por região" que toda empresa pede: primeiro filtra o que foi pago, depois agrupa, soma e ordena.`,
  theory: `Para resumir uma tabela por grupos, o Pandas tem o groupby — a mesma ideia do GROUP BY do SQL:

  forca_por_habitat = df.groupby("habitat")["forca"].sum()

Leia assim: agrupe as linhas por habitat, pegue a coluna forca de cada grupo e some. O resultado é uma Series: os habitats são o índice e as somas são os valores. Em vez de sum() você pode usar count(), mean() ou max().

Para ordenar uma Series pelos valores, do maior para o menor:

  forca_por_habitat = forca_por_habitat.sort_values(ascending=False)

E para percorrer uma Series, .items() entrega o par (índice, valor) a cada volta:

  for habitat, forca in forca_por_habitat.items():
      print(f"{habitat} -> {forca}")

Lembre do filtro da Forja: df[df["coluna"] == "valor"] mantém só as linhas que satisfazem a condição. Filtre ANTES de agrupar.`,
  instructions: `As encomendas da Forja estão em /data/mission.csv. Some o ouro das encomendas já pagas de cada região e mostre uma região por linha, da que pagou mais para a que pagou menos.

O ferreiro espera ouvir exatamente:
  Norte: 270
  Oeste: 220
  Leste: 150
  Sul: 100`,
  hints: [
    "Primeiro fique só com as encomendas pagas: df[df[\"status\"] == \"paga\"]. Depois agrupe esse resultado por regiao e some a coluna ouro.",
    "totais = pagas.groupby(\"regiao\")[\"ouro\"].sum().sort_values(ascending=False) — e então: for regiao, total in totais.items(): print(f\"{regiao}: {total}\")",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
pagas = df[df["status"] == "paga"]
totais = pagas.groupby("regiao")["ouro"].sum().sort_values(ascending=False)

for regiao, total in totais.items():
    print(f"{regiao}: {total}")`,
  codeTemplate: `import pandas as pd

# Leia as encomendas da Forja

# Só o ouro já pago enche o fole

# Some por região, da mais generosa para a mais avarenta

# Uma região por linha
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Norte: 270\nOeste: 220\nLeste: 150\nSul: 100",
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "read_csv\\(", hint: "Leia o arquivo com pd.read_csv(\"/data/mission.csv\")." },
    { pattern: "\\[\\s*[\"']status[\"']\\s*\\]", hint: "Filtre as encomendas pela coluna status — só as pagas contam." },
    { pattern: "\\.groupby\\(", hint: "Agrupe por região com .groupby(\"regiao\") — deixe o Pandas somar." },
    { pattern: "\\.sum\\(", hint: "Some o ouro de cada grupo com .sum()." },
    { pattern: "\\.sort_values\\(", hint: "Ordene o resultado com .sort_values(ascending=False) — não ordene na mão." },
  ],
  dataFile: ENCOMENDAS,
  unlockCondition: { requiredMissionIds: [4] },
};

export default mission13;
