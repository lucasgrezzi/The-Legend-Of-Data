import type { Mission } from "@/types";
import { TEMPESTADES } from "@/data/farol";

// Dificuldade 2/5 — gráfico de linha a partir de um CSV (Pandas + matplotlib), com título e eixos. Template só com comentários.
// Ordem de jogo: depois da 15 (O Farol se Acende).
const mission16: Mission = {
  id: 16,
  track: "dataviz",
  type: "dataviz",
  chapterTitle: "O Farol da Verdade — Capítulo II",
  missionTitle: "A Rota das Tempestades",
  concept: "Gráfico de linha, título e eixos",
  narrative: `O farol acendeu. Os capitães aplaudiram. Dona Íris quase sorriu — quase.

"Agora o problema de verdade", ela diz, abrindo um diário encharcado. "Anotei quantas tempestades caíram em cada mês. Os capitães querem saber: as tempestades estão aumentando ou diminuindo? Quando é o pior mês para navegar?"

Pergunta de "como uma coisa muda com o tempo" pede um gráfico de LINHA: um pontinho para cada mês, ligados em ordem. Dá para ver a subida e a descida de longe.

"E escreve o nome dos eixos", resmunga ela. "Gráfico sem legenda é que nem mapa sem norte."`,
  realWorld: `O gráfico de linha mostra como algo muda ao longo do tempo: temperatura do dia, vendas do mês, seguidores no ano. O eixo de baixo (x) costuma ser o tempo e o de lado (y), o valor. Nomear os eixos é o que separa um gráfico útil de um rabisco bonito.`,
  theory: `Para um gráfico de linha, use plt.plot com os valores do eixo x (embaixo) e do eixo y (do lado):

  plt.plot(df["dia"], df["temperatura"])

Repare que dá para passar colunas do Pandas direto — cada coluna já é uma lista de valores.

Nomeie as partes do gráfico:

  plt.title("Temperatura na semana")   # título no topo
  plt.xlabel("Dia")                    # nome do eixo de baixo
  plt.ylabel("Graus")                  # nome do eixo do lado

O diário da faroleira está em /data/mission.csv — veja as colunas na aba Dados. Leia com pd.read_csv, como na Forja.`,
  instructions: `Leia o diário de tempestades (/data/mission.csv) e desenhe um gráfico de LINHA com os meses no eixo de baixo e o número de tempestades no eixo do lado.

O gráfico precisa ter título e o nome dos dois eixos (você escolhe os textos).`,
  hints: [
    "Leia o arquivo com pd.read_csv e use as colunas mes e tempestades: plt.plot(df[\"mes\"], df[\"tempestades\"]).",
    "Depois do plot, três linhas: plt.title(\"...\"), plt.xlabel(\"Mês\") e plt.ylabel(\"Tempestades\").",
  ],
  solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("/data/mission.csv")

plt.plot(df["mes"], df["tempestades"])
plt.title("Tempestades por mês")
plt.xlabel("Mês")
plt.ylabel("Tempestades")`,
  codeTemplate: `import pandas as pd
import matplotlib.pyplot as plt

# Leia o diário da faroleira

# Uma linha: meses embaixo, tempestades do lado

# Título e o nome dos dois eixos
`,
  editorLanguage: "python",
  validationType: "chart",
  expectedOutput: JSON.stringify({ kind: "line", count: 6, values: [3, 5, 8, 6, 2, 1], title: true, xlabel: true, ylabel: true }),
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "read_csv\\(", hint: "Leia o diário com pd.read_csv(\"/data/mission.csv\")." },
    { pattern: "plt\\.plot\\(", hint: "Gráfico de linha é com plt.plot(...)." },
  ],
  dataFile: TEMPESTADES,
  unlockCondition: { requiredMissionIds: [15] },
};

export default mission16;
