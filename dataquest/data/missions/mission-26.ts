import type { Mission } from "@/types";

// BÔNUS da Masmorra Secreta (abre depois do chefe do Python, não bloqueia nada). Dificuldade 4/5.
// Conceito novo: while (repetir ENQUANTO algo for verdade, sem saber quantas voltas). Revisão: if, contas, f-string.
const mission26: Mission = {
  id: 26,
  track: "python",
  type: "python",
  bonus: true,
  chapterTitle: "A Masmorra Secreta — Sala I (Bônus)",
  missionTitle: "A Hidra Sem Fim",
  concept: "Repetição com while",
  narrative: `Quando o Selo das Catacumbas se rompeu, uma pedra da parede rachou. Atrás dela, um brilho roxo. Uma porta que não estava em mapa nenhum.

Bem-vindo à Masmorra Secreta. Fase BÔNUS: é opcional, não bloqueia nada e é mais difícil. Em compensação, o tesouro é raro.

A primeira sala é da Hidra: um monstro de cinco cabeças. Cada golpe da sua espada corta DUAS cabeças. Mas, se ainda sobrar alguma, UMA cabeça nova nasce no lugar. É nojento. É mágico. É matemática.

Quantos golpes até a Hidra cair? Você não sabe. E é exatamente por isso que esta fase existe: o for repete um número certo de vezes; agora você precisa repetir ENQUANTO a Hidra tiver cabeça.`,
  realWorld: `O while repete um bloco de código enquanto uma condição for verdadeira, sem saber de antemão quantas vezes. É o "enquanto tiver louça na pia, lave um prato". Programas usam isso para tentar de novo até a internet voltar, para rodar um jogo até o jogador sair ou para ler um arquivo até ele acabar.`,
  theory: `O for repete um número conhecido de vezes. O while repete ENQUANTO uma condição for verdadeira:

  agua = 10
  while agua > 0:
      agua = agua - 3
      print("Sobrou", agua)

Leia assim: enquanto tiver água, beba 3 goles. A cada volta, o Python confere a condição de novo. Quando ela fica falsa, o loop para.

Saída:
  Sobrou 7
  Sobrou 4
  Sobrou 1
  Sobrou -2

Dois cuidados:
• Dentro do while, algo PRECISA mudar a condição (aqui, a agua diminui). Senão o loop nunca acaba e o feitiço trava.
• Para contar as voltas, crie um contador antes do loop e some 1 dentro dele:

  voltas = 0
  while agua > 0:
      voltas = voltas + 1
      ...`,
  instructions: `A Hidra começa com 5 cabeças. A cada golpe:
• você corta 2 cabeças;
• se ainda sobrar cabeça, 1 cabeça nova nasce.

Repita os golpes enquanto a Hidra tiver cabeça. Depois de cada golpe, mostre o número do golpe e quantas cabeças sobraram. No fim, diga em quantos golpes ela caiu.

A batalha deve sair assim:
  Golpe 1: 4 cabeças
  Golpe 2: 3 cabeças
  Golpe 3: 2 cabeças
  Golpe 4: 0 cabeças
  A Hidra caiu em 4 golpes!`,
  hints: [
    "Crie cabecas = 5 e golpes = 0. Use while cabecas > 0: e, dentro dele, some 1 em golpes e tire 2 de cabecas. Só então confira com if se ainda sobrou cabeça.",
    "Dentro do while: golpes += 1 · cabecas -= 2 · if cabecas > 0: cabecas += 1 · print(f\"Golpe {golpes}: {cabecas} cabeças\"). Fora do while (sem recuo): print(f\"A Hidra caiu em {golpes} golpes!\").",
  ],
  solution: `cabecas = 5
golpes = 0

while cabecas > 0:
    golpes = golpes + 1
    cabecas = cabecas - 2
    if cabecas > 0:
        cabecas = cabecas + 1
    print(f"Golpe {golpes}: {cabecas} cabeças")

print(f"A Hidra caiu em {golpes} golpes!")`,
  codeTemplate: `# A Hidra Sem Fim
cabecas = 5
golpes = 0

# Golpeie enquanto a Hidra tiver cabeça
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Golpe 1: 4 cabeças\nGolpe 2: 3 cabeças\nGolpe 3: 2 cabeças\nGolpe 4: 0 cabeças\nA Hidra caiu em 4 golpes!",
  xpReward: 30,
  coinReward: 25,
  requiredCode: [
    { pattern: "\\bwhile\\s+", hint: "Repita os golpes com um while — você não sabe quantas voltas vão ser." },
    { pattern: "^(?![\\s\\S]*print[\\s\\S]*print[\\s\\S]*print)", hint: "Escreva o print do golpe uma vez só, dentro do while — não um print por golpe." },
    { pattern: "\\bif\\s+", hint: "A cabeça nova só nasce SE ainda sobrar cabeça: use um if dentro do while." },
  ],
  unlockCondition: { requiredMissionIds: [8] },
};

export default mission26;
