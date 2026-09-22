import type { Mission } from "@/types";

// Dificuldade 1/5 — primeira missão de código: template com lacunas (___).
const mission1: Mission = {
  id: 1,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo I",
  missionTitle: "O Primeiro Feitiço",
  concept: "print() e variáveis",
  narrative: `No salão da Guilda, um livro velho se abre sozinho sobre a mesa: é o Grimório, o livro vivo dos Arquivistas. Ele conhece todos os feitiços — mas é ganancioso, e só sussurra dicas em troca de ouro.

"Todo Arquivista começa se apresentando ao Arquivo", ele resmunga. "Diga quem você é e qual o seu nível. O Arquivo só escuta quem fala a língua dos Antigos: Python."`,
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
