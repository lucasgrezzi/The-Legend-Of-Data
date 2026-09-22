import type { Mission } from "@/types";

const mission2: Mission = {
  id: 2,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo IV",
  missionTitle: "O Corredor das Tochas",
  concept: "Repetição com for (+ if)",
  narrative: `Depois do Portão começa o Corredor das Tochas. Ele é escuro e longo: para atravessá-lo, o Arquivista precisa acender as tochas uma a uma — repetindo o mesmo encantamento várias vezes.

Programadores não copiam a mesma linha dez vezes: eles usam um loop, que repete um bloco de código automaticamente. No fim do corredor, uma última verificação decide se você é digno de seguir.`,
  theory: `Condicionais verificam uma condição e executam código diferente:

  xp = 120
  if xp >= 100:
      print("Arquivista Desbloqueado")
  elif xp >= 50:
      print("Escriba")
  else:
      print("Aprendiz")

Loops for repetem um bloco de código:

  for i in range(1, 4):
      print(i)
  # imprime: 1, 2, 3`,
  instructions: `Use um loop for com range(1, 4) para imprimir
os números 1, 2 e 3, um por linha.

Em seguida, verifique se xp = 120 é maior ou
igual a 100 e imprima "Arquivista Desbloqueado".

Output esperado:
  1
  2
  3
  Arquivista Desbloqueado`,
  codeTemplate: `# O Corredor das Tochas

# Parte 1: Loop de 1 a 3
for i in range(___, ___):
    print(___)

# Parte 2: Verificação de XP
xp = 120
if xp >= ___:
    print(___)`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "1\n2\n3\nArquivista Desbloqueado",
  xpReward: 20,
  requiredCode: [
    { pattern: "\\bfor\\s+\\w+\\s+in\\s+range\\(", hint: "Use um loop: for i in range(1, 4):" },
    { pattern: "\\bif\\s+xp\\s*>=", hint: "Use if para verificar o xp: if xp >= 100:" },
  ],
  unlockCondition: { requiredMissionIds: [6] },
};

export default mission2;
