import type { Mission } from "@/types";

// Dificuldade 3/5 — só as variáveis são dadas; as regras vêm da narrativa.
// Ordem de jogo: depois da 5, antes da 2.
const mission6: Mission = {
  id: 6,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo III",
  missionTitle: "O Guardião do Portão",
  concept: "Decisões com if / elif / else",
  narrative: `Equipado, você chega ao fim da Vila. Ali fica o Portão das Catacumbas, vigiado por um Guardião de pedra. Ele não aceita subornos — só obedece a regras. Quem tem nível alto passa direto. Quem tem nível médio só passa se trouxer a chave. Os demais voltam para treinar.

Programas também tomam decisões assim: SE uma condição for verdadeira, fazem uma coisa; SENÃO, fazem outra. O Guardião perdeu a memória das próprias leis — ensine-as a ele.`,
  theory: `if testa uma condição. elif testa outra, caso a primeira seja falsa. else pega todo o resto. A indentação (4 espaços) mostra o que pertence a cada bloco:

  vida = 30
  if vida > 50:
      print("Saudável")
  elif vida > 20:
      print("Ferido")
  else:
      print("Em perigo")
  # imprime: Ferido

Comparações: > maior, < menor, >= maior ou igual, <= menor ou igual, == igual, != diferente.

and exige que as duas condições sejam verdadeiras ao mesmo tempo:

  tem_escudo = True
  if vida > 20 and tem_escudo:
      print("Pode continuar")`,
  instructions: `O Guardião recita suas leis, nesta ordem:
  • Nível 10 ou mais: "Passagem livre"
  • Nível 5 ou mais E com a chave: "Pode passar, Arquivista"
  • Qualquer outro caso: "Volte quando for mais forte"

Você chegou com nivel = 7 e tem_chave = True. Escreva as três leis — o Guardião deve decidir sozinho qual frase dizer, para qualquer visitante.

O Guardião deve responder:
  Pode passar, Arquivista`,
  hints: [
    `Uma decisão com três caminhos usa if, elif e else — nessa ordem. Cada linha de condição termina com dois-pontos e o bloco de dentro tem 4 espaços.`,
    `Na segunda lei, junte as duas condições com and: nivel >= 5 and tem_chave. Como tem_chave já é True ou False, não precisa comparar com nada.`,
  ],
  solution: `nivel = 7
tem_chave = True

if nivel >= 10:
    print("Passagem livre")
elif nivel >= 5 and tem_chave:
    print("Pode passar, Arquivista")
else:
    print("Volte quando for mais forte")`,
  codeTemplate: `# O Guardião do Portão
nivel = 7
tem_chave = True

# Escreva as três leis do Guardião
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Pode passar, Arquivista",
  xpReward: 25,
  coinReward: 15,
  requiredCode: [
    { pattern: "\\bif\\s+nivel\\s*>=\\s*10\\s*:", hint: "A primeira lei compara o nível com 10 (maior ou igual)." },
    { pattern: "\\belif\\b[^\\n]*\\band\\b", hint: "A segunda lei tem duas condições ao mesmo tempo — e deve vir num elif." },
    { pattern: "\\belse\\s*:", hint: "Falta a lei para qualquer outro caso." },
  ],
  unlockCondition: { requiredMissionIds: [5] },
};

export default mission6;
