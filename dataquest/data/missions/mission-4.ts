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
  narrative: `Atrás do trono do Rei tem uma passagem secreta (todo trono tem, é regra de castelo). Ela sobe, sobe, esquenta... e termina na Forja dos Arquivistas.

Forja é a oficina do ferreiro, onde metal bruto vira espada. Aqui é igual, só que com dados: entra tabela bagunçada, sai tabela arrumadinha. A ferramenta de trabalho se chama Pandas. E não, não tem nenhum urso aqui. Eu perguntei.

O ferreiro é o Brokk, um anão com uma barba que dá três voltas no pescoço. Ele acabou de receber o registro de vendas e não quer a lista inteira. Quer um número só. Anão é assim, direto ao ponto.`,
  realWorld: `Pandas é uma biblioteca de Python para trabalhar com tabelas — pense numa planilha que você controla com código. read_csv abre o arquivo e o filtro df[condição] mantém só as linhas que interessam. Analistas usam isso para responder perguntas como "quantos pedidos passaram de R$ 150?" em segundos.`,
  theory: `Uma biblioteca é um pacote de código pronto, feito por outras pessoas, que dá novos poderes ao Python. Pandas é a biblioteca para trabalhar com tabelas — no Pandas, uma tabela se chama DataFrame.

Para usar uma biblioteca, você a chama com import no começo do código. O "as pd" dá um apelido curto, para não escrever pandas toda hora:

  import pandas as pd

read_csv abre um arquivo de tabela (CSV) e guarda o DataFrame numa variável — por costume, df:

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
  codeTemplate: `# A Forja Desperta
# Preencha as lacunas ___

import pandas as pd

# Leia o registro de vendas
df = pd.read_csv(___)

# Separe os produtos valiosos e conte-os
filtrado = df[df["valor"] > ___]
print(len(___))`,
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
  unlockCondition: { requiredMissionIds: [12] },
};

export default mission4;
