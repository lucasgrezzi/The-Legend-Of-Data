import type { Mission } from "@/types";
import { PESCARIA } from "@/data/farol";

// Dificuldade 3/5 — duas linhas no mesmo gráfico, cada uma com cor e nome (label), e a legenda.
// Validação `chart` com `series` (qualquer ordem), `legend: 2` e cores diferentes. Template só com comentários.
// Ordem de jogo: depois da 16 (A Rota das Tempestades), antes do chefe 22.
const mission25: Mission = {
  id: 25,
  track: "dataviz",
  type: "dataviz",
  chapterTitle: "O Farol da Verdade — Capítulo III",
  missionTitle: "O Prisma Desbotado",
  concept: "Duas linhas, cores e legenda",
  narrative: `A lente do farol tem um coração de cristal: o Prisma. É ele que separa a luz em cores. Hoje ele acordou pálido, sem graça, tudo em cinza.

"Desbotou de tédio", explica Dona Íris. "Os pescadores do Norte e do Sul vivem perguntando quem pesca mais em cada mês. Eu desenho duas linhas, mas ficam iguais, e ninguém sabe qual é qual."

O Prisma pisca, irritado. Quer de volta as cores, uma para cada porto, e um quadrinho no canto dizendo quem é quem. Esse quadrinho se chama LEGENDA.

"Gráfico com duas linhas e sem legenda", resmunga a faroleira, "é igual a duas crianças gêmeas sem crachá."`,
  realWorld: `Quando duas coisas são comparadas no mesmo gráfico (vendas deste ano e do ano passado, duas lojas, dois remédios), cada linha precisa de uma cor e de um nome. A legenda é o quadrinho que liga a cor ao nome. Sem ela, quem lê o gráfico tem que adivinhar.`,
  theory: `Dá para desenhar várias linhas no mesmo gráfico: basta chamar plt.plot uma vez para cada uma.

Cada plt.plot aceita mais duas coisas:
• color = a cor da linha (em inglês: "red", "blue", "green", "orange", "purple"…)
• label = o nome da linha, que vai aparecer na legenda

  plt.plot(df["dia"], df["cafe"], color="brown", label="Café")
  plt.plot(df["dia"], df["cha"], color="green", label="Chá")
  plt.legend()

O plt.legend() desenha o quadrinho da legenda com os nomes de cada label. Sem ele, os nomes não aparecem.

E continua valendo o título:

  plt.title("Xícaras por dia")`,
  instructions: `Leia o registro da pescaria (/data/mission.csv): colunas mes, norte e sul.

Desenhe DUAS linhas no mesmo gráfico, uma para cada porto, com os meses no eixo de baixo. Cada linha precisa de uma cor diferente e de um nome. Mostre a legenda e dê um título ao gráfico.`,
  hints: [
    "Um plt.plot para cada porto: plt.plot(df[\"mes\"], df[\"norte\"], ...) e plt.plot(df[\"mes\"], df[\"sul\"], ...). Dentro de cada um, coloque color=\"...\" e label=\"...\".",
    "Depois dos dois plots: plt.legend() e plt.title(\"Peixes por mês\"). Exemplo de linha completa: plt.plot(df[\"mes\"], df[\"norte\"], color=\"blue\", label=\"Norte\").",
  ],
  solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("/data/mission.csv")

plt.plot(df["mes"], df["norte"], color="blue", label="Norte")
plt.plot(df["mes"], df["sul"], color="orange", label="Sul")
plt.legend()
plt.title("Peixes por mês")`,
  codeTemplate: `import pandas as pd
import matplotlib.pyplot as plt

# O registro da pescaria

# Uma linha para cada porto, cada uma com cor e nome

# A legenda e o título
`,
  editorLanguage: "python",
  validationType: "chart",
  expectedOutput: JSON.stringify({ kind: "line", series: [[4, 6, 5, 8, 9, 7], [2, 3, 7, 6, 4, 8]], legend: 2, distinctColors: true, title: true }),
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "read_csv\\(", hint: "Leia o registro com pd.read_csv(\"/data/mission.csv\")." },
    { pattern: "color\\s*=", hint: "Escolha a cor de cada linha com color=\"...\" dentro do plt.plot(...)." },
    { pattern: "label\\s*=", hint: "Dê um nome a cada linha com label=\"...\" dentro do plt.plot(...)." },
    { pattern: "plt\\.legend\\(", hint: "Mostre a legenda com plt.legend()." },
  ],
  dataFile: PESCARIA,
  unlockCondition: { requiredMissionIds: [16] },
};

export default mission25;
