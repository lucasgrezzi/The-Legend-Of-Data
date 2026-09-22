import type { Mission } from "@/types";

// Dificuldade 2/5 — variáveis dadas; o aluno escreve as contas e os prints sozinho.
// Ordem de jogo: depois da missão 1, antes da 6 (a ordem real vem do array MISSIONS).
const mission5: Mission = {
  id: 5,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo II",
  missionTitle: "O Mercado da Vila",
  concept: "Variáveis e contas (+ - * /)",
  narrative: `Antes de descer às Catacumbas, todo Arquivista passa pelo Mercado da Vila para se equipar. O mercador anota tudo num pergaminho encantado: cada item tem um nome e um preço — e, a cada compra, as moedas da bolsa mudam.

Em programação, esse pergaminho é feito de variáveis: nomes que guardam valores, entram em contas e podem ser atualizados a qualquer momento.`,
  theory: `Variáveis podem entrar em contas, e o resultado pode ser guardado em outra variável:

  forca = 4
  dano = forca * 3        # 12

Operadores: + soma, - subtração, * multiplicação, / divisão.

Uma variável pode ser ATUALIZADA usando o valor que ela já tem:

  flechas = 20
  flechas = flechas - 6   # agora flechas vale 14

Para misturar texto e variáveis numa frase, use f-string: um f antes das aspas e o nome da variável entre chaves:

  print(f"Restam {flechas} flechas")   # Restam 14 flechas`,
  instructions: `A Guilda confiou a você uma bolsa de viagem com 100 moedas. Cada poção custa 15 e você precisa de 3.

Descubra quanto vai gastar (guarde numa variável chamada gasto), tire isso da bolsa e mostre o resultado ao mercador. Nada de fazer a conta de cabeça: quem calcula é o Python.

O mercador espera ler:
  Gasto: 45
  Moedas restantes: 55`,
  hints: [
    `Multiplicação em Python é *. O gasto é o preço de uma poção vezes a quantidade — use as variáveis que já existem, não os números.`,
    `Uma variável pode receber ela mesma menos alguma coisa: bolsa = bolsa - custo. Para as frases finais, f-strings resolvem: f"Gasto: {gasto}".`,
  ],
  solution: `moedas = 100
preco_pocao = 15
quantidade = 3

gasto = preco_pocao * quantidade
moedas = moedas - gasto

print(f"Gasto: {gasto}")
print(f"Moedas restantes: {moedas}")`,
  codeTemplate: `# O Mercado da Vila
moedas = 100
preco_pocao = 15
quantidade = 3

# Calcule o gasto e atualize suas moedas


# Mostre o resultado ao mercador
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Gasto: 45\nMoedas restantes: 55",
  xpReward: 20,
  coinReward: 15,
  requiredCode: [
    { pattern: "gasto\\s*=\\s*\\w+\\s*\\*\\s*\\w+", hint: "O gasto deve ser calculado pelo Python multiplicando as variáveis — não digite 45." },
    { pattern: "moedas\\s*(=\\s*moedas\\s*-|-=)", hint: "Atualize a variável moedas a partir dela mesma: a bolsa perde o gasto." },
    { pattern: "print\\(.*\\bmoedas\\b", hint: "Mostre o valor da variável moedas — não o número digitado." },
  ],
  unlockCondition: { requiredMissionIds: [1] },
};

export default mission5;
