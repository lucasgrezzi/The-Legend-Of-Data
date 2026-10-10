import type { Mission } from "@/types";

// Dificuldade 4/5 — listas. Só a lista inicial é dada; o código deve funcionar para qualquer tamanho.
// Ordem de jogo: depois da 2, antes da 8.
const mission7: Mission = {
  id: 7,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo V",
  missionTitle: "A Mochila do Arquivista",
  concept: "Listas: append, len e for",
  narrative: `Do outro lado do corredor fica o Salão das Relíquias: prateleiras empoeiradas, objetos esquecidos desde a Grande Bagunça e um cheiro forte de "ninguém limpa isso há séculos".

Sua mochila já tem tocha, corda e poção. E ali no canto tem um mapa antigo dando sopa. Pega. Mapa nunca é demais.

Conselho de livro velho: herói que confia na memória é herói perdido. Faça uma lista do que carrega. E, cá entre nós, você vai usar listas em praticamente TODO programa que escrever daqui pra frente. Bem-vindo ao clube.`,
  realWorld: `Uma lista guarda vários valores em ordem dentro de uma única variável. É a sua lista de compras, a playlist do celular, o carrinho de uma loja online: dá para adicionar itens (append), contar quantos tem (len) e passar por cada um (for).`,
  theory: `Uma lista guarda vários valores entre colchetes, separados por vírgula:

  feiticos = ["fogo", "gelo"]

Cada item tem uma posição (índice), que começa em 0:

  print(feiticos[0])    # fogo

.append() coloca um item novo no fim da lista:

  feiticos.append("raio")   # ["fogo", "gelo", "raio"]

len() conta quantos itens a lista tem:

  print(len(feiticos))  # 3

E o for percorre a lista item por item:

  for f in feiticos:
      print(f)`,
  instructions: `Sua mochila já tem tocha, corda e pocao. Neste salão você encontra um mapa antigo: guarde-o na mochila.

Depois faça o inventário: mostre cada item, um por linha, e termine dizendo quantos itens você carrega. O código precisa continuar funcionando mesmo se a mochila tivesse 50 itens.

O inventário deve sair assim:
  tocha
  corda
  pocao
  mapa antigo
  Itens: 4`,
  hints: [
    `Para colocar algo no fim da lista existe .append(). Repare que "mapa antigo" tem espaço — mas continua sendo um único texto entre aspas.`,
    `for item in mochila: percorre a lista; dentro, print(item). No final (fora do for), len(mochila) dá o total — monte a frase com uma f-string.`,
  ],
  solution: `mochila = ["tocha", "corda", "pocao"]

mochila.append("mapa antigo")

for item in mochila:
    print(item)

print(f"Itens: {len(mochila)}")`,
  codeTemplate: `# A Mochila do Arquivista
mochila = ["tocha", "corda", "pocao"]

# 1. Guarde o mapa antigo

# 2. Faça o inventário
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "tocha\ncorda\npocao\nmapa antigo\nItens: 4",
  xpReward: 25,
  coinReward: 20,
  requiredCode: [
    { pattern: "mochila\\.append\\(", hint: "O mapa precisa entrar na lista — não basta imprimir o nome dele." },
    { pattern: "\\bfor\\s+\\w+\\s+in\\s+mochila\\b", hint: "Percorra a mochila com um for — assim funciona para 4 ou 50 itens." },
    { pattern: "len\\(\\s*mochila\\s*\\)", hint: "Conte os itens com len(), sem digitar o número." },
  ],
  unlockCondition: { requiredMissionIds: [2] },
};

export default mission7;
