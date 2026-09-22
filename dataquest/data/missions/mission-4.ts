import type { Mission } from "@/types";

const VENDAS_CSV = `id,produto,valor,regiao
1,Espada de Dados,300,Norte
2,Escudo SQL,150,Sul
3,Pocao Python,80,Leste
4,Manto Pandas,200,Oeste
5,Anel Viz,180,Norte`;

const mission4: Mission = {
  id: 4,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo I",
  missionTitle: "A Forja Desperta",
  concept: "Pandas: ler CSV e filtrar linhas",
  narrative: `A Forja dos Arquivistas é onde os fragmentos de dados brutos — as relíquias imperfeitas — são transformados. Com as ferramentas certas, um Arquivista pode filtrar, reorganizar e purificar qualquer conjunto de dados.`,
  theory: `Pandas é a biblioteca de Python para trabalhar com tabelas, chamadas DataFrames.

  import pandas as pd
  df = pd.read_csv("caminho/do/arquivo.csv")
  print(df.head())     # mostra as primeiras linhas

Para filtrar, escreva a condição dentro de df[ ... ] — só as linhas em que ela é verdadeira ficam:

  veteranos = df[df["nivel"] >= 10]

len() conta as linhas de um DataFrame:

  print(len(veteranos))

df.columns lista os nomes das colunas; df.shape mostra (linhas, colunas).`,
  instructions: `A Forja recebeu o registro de vendas em /data/mission.csv. Descubra quantos produtos valem mais de 150 e informe só esse número — deixe o Pandas fazer a contagem.

O ferreiro espera ouvir apenas:
  3`,
  hints: [
    "Leia o arquivo com pd.read_csv(\"/data/mission.csv\") e guarde numa variável, como df.",
    "Filtre com df[df[\"valor\"] > 150] e conte as linhas do resultado com len().",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
filtrado = df[df["valor"] > 150]
print(len(filtrado))`,
  codeTemplate: `import pandas as pd

# Leia o registro de vendas

# Separe os produtos valiosos e conte-os
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "3",
  xpReward: 30,
  coinReward: 25,
  requiredCode: [
    { pattern: "read_csv\\(", hint: "Leia o arquivo com pd.read_csv(\"/data/mission.csv\")." },
    { pattern: "\\[\\s*[\"']valor[\"']\\s*\\]\\s*>", hint: "Filtre o DataFrame pela coluna valor: df[df[\"valor\"] > 150]." },
    { pattern: "\\blen\\(", hint: "Conte as linhas com len() — não digite o número." },
  ],
  dataFile: {
    filename: "vendas.csv",
    headers: ["id", "produto", "valor", "regiao"],
    rows: [
      ["1", "Espada de Dados", "300", "Norte"],
      ["2", "Escudo SQL", "150", "Sul"],
      ["3", "Pocao Python", "80", "Leste"],
      ["4", "Manto Pandas", "200", "Oeste"],
      ["5", "Anel Viz", "180", "Norte"],
    ],
    rawCsv: VENDAS_CSV,
  },
  unlockCondition: { requiredMissionIds: [3] },
};

export default mission4;
