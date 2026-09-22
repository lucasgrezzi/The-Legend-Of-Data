import type { Mission } from "@/types";

// Posição na trilha: depois da missão 5 (variáveis), antes da 2 (loops).
const mission6: Mission = {
  id: 6,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo III",
  missionTitle: "O Guardião do Portão",
  concept: "Decisões com if / elif / else",
  narrative: `No fim da Vila fica o Portão das Catacumbas, vigiado por um Guardião de pedra. Ele não aceita subornos — só obedece a regras. Quem tem nível alto passa direto. Quem tem nível médio só passa se trouxer a chave. Os demais voltam para treinar.

Programas também tomam decisões assim: SE uma condição for verdadeira, fazem uma coisa; SENÃO, fazem outra. Ensine as regras ao Guardião.`,
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

and exige que as duas condições sejam verdadeiras:

  tem_pocao = True
  if vida > 20 and tem_pocao:
      print("Pode continuar")`,
  instructions: `Seu Arquivista tem nivel = 7 e tem_chave = True. Escreva as regras do Guardião:
  • Se nivel for maior ou igual a 10, imprima "Passagem livre"
  • Senão, se nivel for maior ou igual a 5 e tem_chave for verdadeiro, imprima "Pode passar, Arquivista"
  • Caso contrário, imprima "Volte quando for mais forte"

Saída esperada:
  Pode passar, Arquivista`,
  codeTemplate: `# O Guardião do Portão
nivel = 7
tem_chave = True

if nivel >= ___:
    print("Passagem livre")
elif nivel >= ___ and ___:
    print("Pode passar, Arquivista")
___:
    print("Volte quando for mais forte")`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Pode passar, Arquivista",
  xpReward: 25,
  requiredCode: [
    { pattern: "\\bif\\s+nivel\\s*>=\\s*10\\s*:", hint: "A primeira regra é: if nivel >= 10:" },
    { pattern: "\\belif\\s+nivel\\s*>=\\s*5\\s+and\\s+tem_chave", hint: "A segunda regra usa elif com and: elif nivel >= 5 and tem_chave:" },
    { pattern: "\\belse\\s*:", hint: "Falta o caso contrário: else:" },
  ],
  unlockCondition: { requiredMissionIds: [5] },
};

export default mission6;
