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
  chapterTitle: "A Forja de Dados — Capitulo I",
  missionTitle: "A Forja Desperta",
  narrative: `A Forja dos Arquivistas e onde os fragmentos de dados brutos — as reliquias imperfeitas — sao transformados. Com as ferramentas certas, um Arquivista pode filtrar, reorganizar e purificar qualquer conjunto de dados.`,
  theory: `Pandas e a biblioteca Python para manipulacao de dados.

  import pandas as pd

  df = pd.read_csv("/data/mission.csv")
  print(df.head())

  # Filtrar linhas onde valor > 150
  filtrado = df[df["valor"] > 150]
  print(len(filtrado))

df.shape retorna (linhas, colunas).
df.columns lista os nomes das colunas.`,
  instructions: `1. Leia o arquivo /data/mission.csv com pd.read_csv()
2. Filtre para manter apenas produtos com valor > 150
3. Imprima o numero de linhas com print(len(filtrado))

Dica: df[df["coluna"] > valor] filtra linhas.`,
  codeTemplate: `import pandas as pd

# Leia o arquivo CSV
df = pd.read_csv("___")

# Filtre os produtos com valor > 150
filtrado = df[df["___"] > ___]

# Imprima a quantidade de itens encontrados
print(len(___))`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "3",
  xpReward: 30,
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
  unlockCondition: { requiredMissionIds: [2, 3] },
};

export default mission4;
