import type { Mission } from "@/types";
import { CARVAO } from "@/data/forja";

// Dificuldade 2/5 — sum, mean e max numa coluna (o mesmo que COUNT/SUM/AVG/MAX do SQL, agora no Pandas).
// Ordem de jogo: depois da 19, antes da 21.
const mission20: Mission = {
  id: 20,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo III",
  missionTitle: "O Carvão da Semana",
  concept: "Pandas: somar, tirar a média e achar o maior",
  narrative: `Fogo de forja come carvão. MUITO carvão. Brokk anota num caderninho quantos sacos queima por dia — e agora quer fazer as contas da semana para encomendar mais.

"Quero três números", diz ele, contando nos dedos grossos. "Quantos sacos gastei no total. Quantos gasto, em média, por dia. E qual foi o meu recorde."

Ele faz uma pausa. "O recorde foi na quarta. Aquele elmo do orc deu trabalho." Você não pergunta. Fica a dica.`,
  realWorld: `Somar, tirar a média e achar o maior são as contas mais usadas em qualquer planilha: o total de vendas do mês, o gasto médio por dia, o dia de maior movimento. No Pandas, cada uma é um comando curto aplicado numa coluna — e funciona igualzinho com 6 ou com 6 milhões de linhas.`,
  theory: `Lembra das contas do SQL (SUM, AVG e MAX)? O Pandas tem as mesmas, e elas funcionam em uma coluna:

  df["pontos"].sum()    → soma todos os valores
  df["pontos"].mean()   → a média (soma ÷ quantidade)
  df["pontos"].max()    → o maior valor

Por exemplo, numa tabela com pontos 4, 6 e 8:

  total = df["pontos"].sum()     # 18
  media = df["pontos"].mean()    # 6.0
  maior = df["pontos"].max()     # 8

Repare: a média aparece com ponto e casa decimal (6.0), porque dividir pode dar número quebrado.

Para mostrar o resultado com um texto na frente, use a f-string que você aprendeu no Mercado da Vila:

  print(f"Total: {total}")`,
  instructions: `O caderno de carvão de Brokk está em /data/mission.csv (colunas dia e sacos). Calcule, com o Pandas, o total de sacos da semana, a média por dia e o maior gasto de um dia só.

O ferreiro espera ouvir exatamente:
  Total: 57
  Por dia: 9.5
  Recorde: 15`,
  hints: [
    "As três contas são feitas na coluna sacos: df[\"sacos\"].sum(), df[\"sacos\"].mean() e df[\"sacos\"].max().",
    "Guarde cada conta numa variável e mostre com f-string, por exemplo: print(f\"Total: {total}\"), print(f\"Por dia: {media}\") e print(f\"Recorde: {maior}\").",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
total = df["sacos"].sum()
media = df["sacos"].mean()
maior = df["sacos"].max()

print(f"Total: {total}")
print(f"Por dia: {media}")
print(f"Recorde: {maior}")`,
  codeTemplate: `import pandas as pd

df = pd.read_csv("/data/mission.csv")

# Total de sacos da semana

# Média de sacos por dia

# O maior gasto de um dia só

# Mostre os três: Total, Por dia e Recorde
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Total: 57\nPor dia: 9.5\nRecorde: 15",
  xpReward: 30,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\.sum\\(", hint: "Calcule o total com df[\"sacos\"].sum() — não digite o número." },
    { pattern: "\\.mean\\(", hint: "Calcule a média com df[\"sacos\"].mean() — não digite o número." },
    { pattern: "\\.max\\(", hint: "Ache o recorde com df[\"sacos\"].max() — não digite o número." },
    { pattern: "read_csv\\(", hint: "Leia o arquivo com pd.read_csv(\"/data/mission.csv\")." },
  ],
  dataFile: CARVAO,
  unlockCondition: { requiredMissionIds: [19] },
};

export default mission20;
