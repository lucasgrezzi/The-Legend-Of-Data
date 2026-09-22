import type { Mission } from "@/types";

// Dificuldade 5/5 — chefe da trilha Python: funções + if/elif/else + for + f-string.
// Template quase vazio. Ordem de jogo: depois da 7; abre a trilha SQL.
const mission8: Mission = {
  id: 8,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo VI (Chefe)",
  missionTitle: "O Selo das Catacumbas",
  concept: "Funções: def e return",
  narrative: `No fundo do Salão está a entrada das Catacumbas, lacrada pelo Selo dos Antigos. Nele há runas gravadas, cada uma com uma força — e o Selo só se rompe quando cada runa é classificada em voz alta.

Você poderia escrever a mesma regra várias vezes... mas Arquivistas experientes criam seus próprios feitiços: funções. Uma função é uma receita com nome — escrita uma vez, usada quantas vezes quiser. Este é o último desafio da Linguagem dos Antigos.`,
  theory: `def cria uma função (um feitiço seu). Ela recebe valores (parâmetros) e devolve um resultado com return:

  def dobro(x):
      return x * 2

  print(dobro(5))    # 10
  print(dobro(21))   # 42

Dentro de uma função vale tudo o que você já aprendeu — inclusive if/elif/else. Cada return encerra a função e devolve o valor:

  def humor(vida):
      if vida > 50:
          return "animado"
      else:
          return "cansado"

  print(humor(80))   # animado

Uma função pode ser chamada em qualquer lugar onde caberia um valor: numa variável, num print, num for, até dentro das chaves de uma f-string.`,
  instructions: `Crie seu próprio feitiço: uma função chamada classificar que recebe a força de uma runa e devolve fraca (força menor que 5), média (de 5 a 9) ou forte (10 ou mais).

Depois use o feitiço em todas as runas do Selo, na ordem, anunciando cada uma.

Para o Selo se romper, ele precisa ouvir:
  Runa 3: fraca
  Runa 8: média
  Runa 12: forte`,
  hints: [
    `Comece com def classificar(forca): e, dentro dela, um if/elif/else que faz return de "fraca", "média" ou "forte". Pense na ordem das condições: da menor força para a maior.`,
    `Com a função pronta, percorra runas com um for e chame classificar(runa) dentro de uma f-string: f"Runa {runa}: {...}".`,
  ],
  solution: `def classificar(forca):
    if forca < 5:
        return "fraca"
    elif forca < 10:
        return "média"
    else:
        return "forte"

runas = [3, 8, 12]
for runa in runas:
    print(f"Runa {runa}: {classificar(runa)}")`,
  codeTemplate: `# O Selo das Catacumbas
runas = [3, 8, 12]
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Runa 3: fraca\nRuna 8: média\nRuna 12: forte",
  xpReward: 35,
  coinReward: 25,
  requiredCode: [
    { pattern: "\\bdef\\s+classificar\\s*\\(\\s*\\w+\\s*\\)\\s*:", hint: "Crie o feitiço com def classificar(forca):" },
    { pattern: "\\breturn\\b", hint: "A função deve DEVOLVER a classificação com return — não imprimir dentro dela." },
    { pattern: "\\bfor\\s+\\w+\\s+in\\s+runas\\b", hint: "Percorra a lista runas com um for." },
    { pattern: "(?<!def\\s+)classificar\\(\\s*\\w+\\s*\\)", hint: "Use o feitiço em cada runa: classificar(runa)." },
  ],
  unlockCondition: { requiredMissionIds: [7] },
};

export default mission8;
