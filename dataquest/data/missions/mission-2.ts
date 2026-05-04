import type { Mission } from "@/types";

const mission2: Mission = {
  id: 2,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capitulo II",
  missionTitle: "As Portas Condicionais",
  narrative: `Nas profundezas do Arquivo existem portas que so abrem sob certas condicoes. Para atravessa-las, o Arquivista precisa dominar a logica condicional e a arte de repetir encantamentos — o Loop Eterno.`,
  theory: `Condicionais verificam uma condicao e executam codigo diferente:

  xp = 120
  if xp >= 100:
      print("Arquivista Desbloqueado")
  elif xp >= 50:
      print("Escriba")
  else:
      print("Aprendiz")

Loops for repetem um bloco de codigo:

  for i in range(1, 4):
      print(i)
  # imprime: 1, 2, 3`,
  instructions: `Use um loop for com range(1, 4) para imprimir
os numeros 1, 2 e 3, um por linha.

Em seguida, verifique se xp = 120 e maior ou
igual a 100 e imprima "Arquivista Desbloqueado".

Output esperado:
  1
  2
  3
  Arquivista Desbloqueado`,
  codeTemplate: `# Missao 2: As Portas Condicionais

# Parte 1: Loop de 1 a 3
for i in range(___, ___):
    print(___)

# Parte 2: Verificacao de XP
xp = 120
if xp >= ___:
    print(___)`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "1\n2\n3\nArquivista Desbloqueado",
  xpReward: 20,
  unlockCondition: { requiredMissionIds: [1] },
};

export default mission2;
