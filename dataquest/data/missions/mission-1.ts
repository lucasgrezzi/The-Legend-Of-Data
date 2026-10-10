import type { Mission } from "@/types";

// Dificuldade 1/5 — primeira missão de código: template com lacunas (___).
const mission1: Mission = {
  id: 1,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo I",
  missionTitle: "O Primeiro Feitiço",
  concept: "print() e variáveis",
  narrative: `Sou eu de novo, o Grimório, agora aberto em cima da mesa da Guilda. Duas regras antes de começar:

Regra número um: aqui, "feitiço" é só um nome chique para CÓDIGO. Você escreve, o computador obedece. Sem varinha, sem latim, sem acenar para a tela (eu vi).

Regra número dois: eu sei TODAS as respostas, mas cobro por elas. Sou um livro, preciso pagar o aluguel da estante.

Agora, o Arquivo — aquela estante gigante lá no fundo — quer saber quem você é. Ele é meio surdo e só entende uma língua: Python. Apresente-se.`,
  realWorld: `Variável é uma caixinha com etiqueta: você guarda um valor (um nome, um número) e depois chama pela etiqueta. É como salvar um contato no celular — você não decora o número, procura por "Mãe". E o print() é o jeito de o programa falar com você: ele mostra na tela o que tem dentro da caixinha.`,
  theory: `print() faz o Arquivo mostrar algo na tela:

  print("Olá, reino!")

Variáveis guardam valores com um nome, usando =. Textos (strings) vão entre aspas; números não:

  heroi = "Lyra"
  vidas = 3

Para mostrar uma variável, passe o NOME dela para o print, sem aspas:

  print(heroi)      # Lyra
  print("heroi")    # heroi  ← com aspas vira texto!

O print aceita vários valores separados por vírgula e coloca um espaço entre eles:

  print("Vidas:", vidas)   # Vidas: 3`,
  instructions: `Apresente-se ao Arquivo usando variáveis: guarde seu título (Arquivista) e seu nível (1), e depois mostre os dois.

O Arquivo precisa ouvir exatamente:
  Arquivista
  Nivel: 1`,
  hints: [
    `Crie cada variável com nome = valor. O título é texto, então vai entre aspas. O nível é número: sem aspas.`,
    `Para mostrar uma variável, use o nome dela sem aspas: print(nome). Na segunda linha, junte texto e variável com vírgula: print("Nivel:", nivel).`,
  ],
  solution: `nome = "Arquivista"
nivel = 1

print(nome)
print("Nivel:", nivel)`,
  codeTemplate: `# O Primeiro Feitiço
# Preencha as lacunas ___

nome = ___
nivel = ___

print(___)
print("Nivel:", ___)`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Arquivista\nNivel: 1",
  xpReward: 20,
  coinReward: 10,
  requiredCode: [
    { pattern: "nome\\s*=\\s*[\"']Arquivista[\"']", hint: "Guarde o título numa variável: nome = \"Arquivista\"" },
    { pattern: "print\\(\\s*nome\\s*\\)", hint: "Mostre a variável, não o texto: print(nome)" },
  ],
  unlockCondition: { requiredMissionIds: [0] },
};

export default mission1;
