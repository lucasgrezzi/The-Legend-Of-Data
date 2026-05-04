import type { Mission } from "@/types";

const mission1: Mission = {
  id: 1,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capitulo I",
  missionTitle: "O Primeiro Feitico",
  narrative: `O Grimorio do Arquivo esta na sua frente. Suas paginas revelam que toda comunicacao com o Arquivo se faz atraves da fala — comandos que o Arquivo obedece.

O primeiro feitico que todo Arquivista aprende e o da Revelacao: ele faz o Arquivo mostrar uma mensagem ao mundo.`,
  theory: `Em Python, usamos print() para exibir mensagens.
Variaveis armazenam valores que podemos reutilizar:

  nome = "Arquivista"
  nivel = 1
  print(nome)
  print("Nivel:", nivel)

Strings usam aspas simples ou duplas.
Numeros nao precisam de aspas.`,
  instructions: `Crie duas variaveis:
  • nome com o valor "Arquivista"
  • nivel com o valor 1

Depois imprima exatamente:
  Arquivista
  Nivel: 1`,
  codeTemplate: `# Missao 1: O Primeiro Feitico
# Crie as variaveis e use print() para exibi-las

nome = ___
nivel = ___

print(___)
print("Nivel:", ___)`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Arquivista\nNivel: 1",
  xpReward: 20,
  unlockCondition: { requiredMissionIds: [0] },
};

export default mission1;
