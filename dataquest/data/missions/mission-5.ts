import type { Mission } from "@/types";

// Posição na trilha: depois da missão 1 (print/variáveis), antes da 6 (condicionais).
// O id é 5 só porque foi criada depois — a ordem real vem do array MISSIONS.
const mission5: Mission = {
  id: 5,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo II",
  missionTitle: "O Mercado da Vila",
  concept: "Variáveis e contas (+ - * /)",
  narrative: `Antes de descer às Catacumbas, todo Arquivista passa pelo Mercado da Vila para se equipar. O mercador anota tudo num pergaminho encantado: cada item tem um nome e um preço — e, a cada compra, o número de moedas na sua bolsa muda.

Em programação, esse pergaminho é feito de variáveis: nomes que guardam valores, entram em contas e podem ser atualizados a qualquer momento.`,
  theory: `Variáveis guardam valores. Dá para fazer contas com elas e guardar o resultado em outra variável:

  moedas = 50
  preco = 8
  total = preco * 2         # multiplicação → 16
  moedas = moedas - total   # a variável é atualizada → 34
  print(moedas)

Operadores: + soma, - subtração, * multiplicação, / divisão.

Para misturar texto e variáveis, use f-string: um f antes das aspas e a variável entre chaves.

  print(f"Você tem {moedas} moedas")
  # imprime: Você tem 34 moedas`,
  instructions: `Você tem 100 moedas e vai comprar 3 poções de 15 moedas cada.
  • Calcule o gasto: preço × quantidade
  • Atualize a variável moedas, subtraindo o gasto
  • Mostre o resultado usando f-strings

Saída esperada:
  Gasto: 45
  Moedas restantes: 55`,
  codeTemplate: `# O Mercado da Vila
moedas = 100
preco_pocao = 15
quantidade = 3

# 1. Quanto você vai gastar?
gasto = ___ * ___

# 2. Tire o gasto da sua bolsa
moedas = moedas - ___

# 3. Mostre o resultado
print(f"Gasto: {___}")
print(f"Moedas restantes: {___}")`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Gasto: 45\nMoedas restantes: 55",
  xpReward: 20,
  requiredCode: [
    { pattern: "gasto\\s*=\\s*\\w+\\s*\\*\\s*\\w+", hint: "Calcule o gasto multiplicando as variáveis: gasto = preco_pocao * quantidade" },
    { pattern: "moedas\\s*=\\s*moedas\\s*-", hint: "Atualize a variável: moedas = moedas - gasto" },
    { pattern: "f[\"'][^\"']*\\{\\s*moedas\\s*\\}", hint: "Mostre as moedas com f-string: print(f\"Moedas restantes: {moedas}\")" },
  ],
  unlockCondition: { requiredMissionIds: [1] },
};

export default mission5;
