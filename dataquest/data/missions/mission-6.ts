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
  narrative: `No fim da Vila tem um portão e, na frente dele, um Guardião de pedra com cara de quem nunca tirou férias.

Ele não aceita suborno, não ri de piada (eu tentei, foi constrangedor) e só segue regras. O problema? Esqueceu as próprias regras. Duzentos anos parado na chuva, acontece.

As leis eram assim: nível alto passa direto; nível médio só passa com a chave; o resto volta para casa treinar. "Nível", aliás, é só o quanto o personagem já evoluiu — quanto maior, mais experiente. Nesta cena você está no nível 7. Finge que é verdade.

Escreva as leis de novo para ele. Assim ele decide sozinho, seja quem for que aparecer.`,
  realWorld: `if / elif / else é como o programa toma decisões: SE isso, faça aquilo; SENÃO SE outra coisa, faça outra; SENÃO, a última opção. Você faz isso todo dia: se está chovendo, leva guarda-chuva; senão, se está frio, leva casaco; senão, vai de camiseta. O caixa eletrônico faz o mesmo antes de liberar um saque.`,
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
