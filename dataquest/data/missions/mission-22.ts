import type { Mission } from "@/types";
import { CARGAS } from "@/data/farol";

// Dificuldade 4/5 — CHEFE do Farol: junta groupby + sort_values (Forja) com plt.bar, título e eixos (Farol).
// Única novidade, explicada no Estudo: .index e .values de uma Series. Template quase vazio.
// Ordem de jogo: depois da 16 (A Rota das Tempestades).
const mission22: Mission = {
  id: 22,
  track: "dataviz",
  type: "dataviz",
  chapterTitle: "O Farol da Verdade — Capítulo III (Chefe)",
  missionTitle: "O Conselho dos Portos",
  concept: "Gráfico a partir de um groupby (chefe)",
  narrative: `Alguém bate na porta do farol. TOC. TOC. TOC. É o Conselho dos Portos: quatro capitães, quatro chapéus enormes e nenhuma paciência.

"Só temos dinheiro para UM barco novo de carga", anuncia o mais baixinho (que tem o maior chapéu). "Cada um aqui jura que o seu porto recebe mais caixas. Ninguém se entende. Faz três dias que estamos discutindo."

Dona Íris empurra o registro de cargas para você. "Um gráfico. Os portos de baixo, as caixas do lado, do que mais recebe para o que menos recebe. Quero ver alguém discutir com um gráfico."

Este é o chefe do Farol. Você vai precisar de tudo: ler o arquivo, agrupar e somar como na Forja, ordenar, e desenhar como no Farol. Respira fundo. Você já sabe fazer cada pedaço.`,
  realWorld: `Quase todo gráfico de relatório nasce assim: primeiro os dados são agrupados e somados (vendas por loja, alunos por turma), depois o resumo vira barras. Ordenar do maior para o menor deixa a resposta óbvia em um segundo — é o que se faz em reuniões para acabar com discussões.`,
  theory: `Este chefe junta o que você aprendeu em duas regiões. Só tem UMA coisa nova, pequena.

1) Da Forja — agrupar, somar e ordenar:

  pontos = df.groupby("time")["gols"].sum().sort_values(ascending=False)

O resultado é uma Series: os nomes dos times de um lado, as somas do outro.

2) A novidade — as duas partes de uma Series:

  pontos.index    → os nomes   (ex.: Leões, Tigres, Ursos)
  pontos.values   → os números (ex.: 12, 9, 4)

3) Do Farol — barras com nomes embaixo e números do lado:

  plt.bar(pontos.index, pontos.values)
  plt.title("Gols por time")
  plt.xlabel("Time")
  plt.ylabel("Gols")`,
  instructions: `Leia o registro de cargas (/data/mission.csv). Some as caixas de cada porto e desenhe um gráfico de BARRAS com os portos no eixo de baixo e o total de caixas no eixo do lado, do porto que mais recebeu para o que menos recebeu.

O gráfico precisa ter título e o nome dos dois eixos (você escolhe os textos).`,
  hints: [
    "Primeiro o resumo, como na Forja: totais = df.groupby(\"porto\")[\"caixas\"].sum().sort_values(ascending=False).",
    "Depois desenhe com plt.bar(totais.index, totais.values) e termine com plt.title(...), plt.xlabel(...) e plt.ylabel(...).",
  ],
  solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("/data/mission.csv")
totais = df.groupby("porto")["caixas"].sum().sort_values(ascending=False)

plt.bar(totais.index, totais.values)
plt.title("Caixas por porto")
plt.xlabel("Porto")
plt.ylabel("Caixas")`,
  codeTemplate: `import pandas as pd
import matplotlib.pyplot as plt

# O registro de cargas está em /data/mission.csv
`,
  editorLanguage: "python",
  validationType: "chart",
  expectedOutput: JSON.stringify({ kind: "bar", count: 4, values: [48, 35, 27, 14], title: true, xlabel: true, ylabel: true }),
  xpReward: 45,
  coinReward: 35,
  requiredCode: [
    { pattern: "\\.groupby\\(", hint: "Some as caixas de cada porto com df.groupby(\"porto\")[\"caixas\"].sum() — não digite os totais à mão." },
    { pattern: "\\.sort_values\\(", hint: "Ordene do porto que mais recebeu para o que menos recebeu com .sort_values(ascending=False)." },
    { pattern: "plt\\.bar\\(", hint: "Gráfico de barras é com plt.bar(...)." },
    { pattern: "read_csv\\(", hint: "Leia o registro com pd.read_csv(\"/data/mission.csv\")." },
  ],
  dataFile: CARGAS,
  unlockCondition: { requiredMissionIds: [16] },
};

export default mission22;
