import type { Mission } from "@/types";

// Dificuldade 1/5 — primeira missão de Data Viz: template com lacunas (___). Validação pelo gráfico (chart).
// Ordem de jogo: depois da 14 (A Têmpera do Rei, chefe da Forja).
const mission15: Mission = {
  id: 15,
  track: "dataviz",
  type: "dataviz",
  chapterTitle: "O Farol da Verdade — Capítulo I",
  missionTitle: "O Farol se Acende",
  concept: "Gráfico de barras com matplotlib",
  narrative: `Com o ouro do Rei, Brokk forjou uma lente enorme e te mandou entregar no alto do penhasco. Lá mora o Farol da Verdade e sua guardiã, Dona Íris — faroleira há quarenta anos, óculos fundo de garrafa, paciência zero.

"Os capitães não leem tabela", ela diz, já sem paciência. "Navio passando, vento uivando, ninguém tem tempo de ler número. Eles precisam OLHAR e entender."

Ela aponta para um caderno com o número de navios que passaram por cada região na última noite. "Transforma isso num desenho que até um papagaio entende."

Esse desenho tem nome: gráfico. E esta região inteira é sobre eles. Bem-vindo ao Farol, Arquivista. Aqui os dados viram imagem.`,
  realWorld: `Um gráfico mostra num relance o que uma tabela leva minutos para explicar. O gráfico de barras é o mais usado de todos: cada barra é uma categoria (região, produto, mês) e a altura mostra o valor. É o que aparece em relatório de vendas, pesquisa eleitoral e no app do banco mostrando seus gastos por categoria.`,
  theory: `Para desenhar gráficos em Python, usamos a biblioteca matplotlib. Por costume, a parte de desenhar ganha o apelido plt:

  import matplotlib.pyplot as plt

Um gráfico de barras precisa de duas listas do mesmo tamanho: os nomes (eixo de baixo) e os valores (a altura de cada barra):

  frutas = ["Maçã", "Uva", "Pera"]
  vendidas = [30, 12, 18]

  plt.bar(frutas, vendidas)
  plt.title("Frutas vendidas hoje")

plt.bar desenha uma barra para cada par (nome, valor), na mesma ordem das listas. plt.title escreve o título no topo — todo gráfico precisa de um título, senão ninguém sabe do que ele fala.

O gráfico aparece embaixo da Saída quando você clica em ▶ Executar.`,
  instructions: `Desenhe um gráfico de barras com os navios que passaram em cada região: Norte 12, Sul 7, Leste 9, Oeste 4 (nessa ordem).

O gráfico precisa ter o título:
  Navios por região`,
  hints: [
    "As listas já estão prontas no código: regioes e navios. Passe as duas para plt.bar(...), nessa ordem: primeiro os nomes, depois os valores.",
    "plt.bar(regioes, navios) e, na linha de baixo, plt.title(\"Navios por região\") — com acento, igualzinho.",
  ],
  solution: `import matplotlib.pyplot as plt

regioes = ["Norte", "Sul", "Leste", "Oeste"]
navios = [12, 7, 9, 4]

plt.bar(regioes, navios)
plt.title("Navios por região")`,
  codeTemplate: `# O Farol se Acende
# Preencha as lacunas ___

import matplotlib.pyplot as plt

regioes = ["Norte", "Sul", "Leste", "Oeste"]
navios = [12, 7, 9, 4]

plt.bar(___, ___)
plt.title(___)`,
  editorLanguage: "python",
  validationType: "chart",
  expectedOutput: JSON.stringify({ kind: "bar", count: 4, values: [12, 7, 9, 4], title: "Navios por região" }),
  xpReward: 30,
  coinReward: 25,
  requiredCode: [
    { pattern: "plt\\.bar\\(", hint: "Use plt.bar(...) para desenhar as barras." },
    { pattern: "plt\\.title\\(", hint: "Dê um título ao gráfico com plt.title(...)." },
  ],
  unlockCondition: { requiredMissionIds: [14] },
};

export default mission15;
