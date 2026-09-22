import type { Mission } from "@/types";

const mission1: Mission = {
  id: 1,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo I",
  missionTitle: "O Primeiro Feitiço",
  concept: "print() e variáveis",
  narrative: `O Grimório do Arquivo está na sua frente. Suas páginas revelam que toda comunicação com o Arquivo se faz através da fala — comandos que o Arquivo obedece.

O primeiro feitiço que todo Arquivista aprende é o da Revelação: ele faz o Arquivo mostrar uma mensagem ao mundo.`,
  theory: `Em Python, usamos print() para exibir mensagens.
Variáveis armazenam valores que podemos reutilizar:

  nome = "Arquivista"
  nivel = 1
  print(nome)
  print("Nivel:", nivel)

Strings usam aspas simples ou duplas.
Números não precisam de aspas.`,
  instructions: `Crie duas variáveis:
  • nome com o valor "Arquivista"
  • nivel com o valor 1

Depois imprima exatamente:
  Arquivista
  Nivel: 1`,
  codeTemplate: `# O Primeiro Feitiço
# Crie as variáveis e use print() para exibi-las

nome = ___
nivel = ___

print(___)
print("Nivel:", ___)`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Arquivista\nNivel: 1",
  xpReward: 20,
  requiredCode: [
    { pattern: "nome\\s*=\\s*[\"']Arquivista[\"']", hint: "Crie a variável: nome = \"Arquivista\"" },
    { pattern: "print\\(\\s*nome\\s*\\)", hint: "Imprima a variável, não o texto: print(nome)" },
  ],
  unlockCondition: { requiredMissionIds: [0] },
};

export default mission1;
