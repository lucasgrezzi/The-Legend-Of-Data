import type { Mission } from "@/types";
import { VISITAS } from "@/data/forja";

// Dificuldade 3/5 — value_counts + .items() (ponte para o groupby da 13). O for já vem quase pronto.
// Ordem de jogo: depois da 20, antes da 13.
const mission21: Mission = {
  id: 21,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo IV",
  missionTitle: "O Livro de Visitas",
  concept: "Pandas: contar quantas vezes cada valor aparece",
  narrative: `Na entrada da Forja tem um livro de visitas. Todo cliente escreve o nome e a raça — anão, elfo, orc ou goblin. Brokk nunca leu. "Tenho mais o que fazer", diz, martelando uma ferradura que claramente não precisava de mais marteladas.

Mas hoje ele ficou curioso: quer saber qual raça mais visita a Forja, para decidir o desconto da semana. (Ele jura que não vai ser para os anões. Ninguém acredita.)

Contar uma por uma, risquinho por risquinho? Nada disso. O Pandas conta para você.`,
  realWorld: `value_counts conta quantas vezes cada valor aparece numa coluna e já entrega do mais comum para o menos comum. É o que se usa para responder "qual produto mais vende?", "de que cidade vem a maioria dos clientes?" ou "qual a reclamação mais frequente?".`,
  theory: `value_counts() conta quantas vezes cada valor aparece numa coluna. Imagine uma coluna cor com: azul, verde, azul, azul, verde, rosa.

  contagem = df["cor"].value_counts()

O resultado já vem do MAIS comum para o MENOS comum:

  azul     3
  verde    2
  rosa     1

Ele tem duas partes: o valor (azul) e quantas vezes apareceu (3). Para mostrar uma linha por vez, use um for com .items(), que entrega as duas partes a cada volta:

  for cor, quantidade in contagem.items():
      print(f"{cor}: {quantidade}")

Saída:
  azul: 3
  verde: 2
  rosa: 1`,
  instructions: `O livro de visitas está em /data/mission.csv (colunas id, visitante e raca). Conte quantas visitas cada raça fez e mostre uma raça por linha, da que mais visitou para a que menos visitou.

O ferreiro espera ouvir exatamente:
  anao: 5
  elfo: 3
  orc: 2
  goblin: 1`,
  hints: [
    "A contagem é feita na coluna raca: df[\"raca\"].value_counts(). Ela já vem do maior para o menor.",
    "contagem = df[\"raca\"].value_counts() — o for que já está no código mostra cada raça com a sua quantidade.",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
contagem = df["raca"].value_counts()

for raca, quantidade in contagem.items():
    print(f"{raca}: {quantidade}")`,
  codeTemplate: `import pandas as pd

df = pd.read_csv("/data/mission.csv")

# Conte quantas visitas cada raça fez
contagem = ___

# Mostra cada raça com a sua quantidade (este pedaço já está pronto)
for raca, quantidade in contagem.items():
    print(f"{raca}: {quantidade}")`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "anao: 5\nelfo: 3\norc: 2\ngoblin: 1",
  xpReward: 30,
  coinReward: 25,
  requiredCode: [
    { pattern: "\\.value_counts\\(", hint: "Conte com df[\"raca\"].value_counts() — não escreva os números à mão." },
    { pattern: "read_csv\\(", hint: "Leia o arquivo com pd.read_csv(\"/data/mission.csv\")." },
  ],
  dataFile: VISITAS,
  unlockCondition: { requiredMissionIds: [20] },
};

export default mission21;
