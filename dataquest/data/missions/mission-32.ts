import type { Mission } from "@/types";

// BÔNUS da Masmorra Secreta (Sala II, entre a Hidra e a Esfinge). Dificuldade 4/5.
// Conceito novo: try / except (tratar o erro sem parar o programa) + int() para virar texto em número.
// Revisão: for em lista, contas, f-string.
const mission32: Mission = {
  id: 32,
  track: "python",
  type: "python",
  bonus: true,
  chapterTitle: "A Masmorra Secreta — Sala II (Bônus)",
  missionTitle: "O Baú Mímico",
  concept: "Tratar erros com try / except",
  narrative: `A segunda sala da Masmorra Secreta tem um baú só, no meio do chão. Dourado. Brilhando. Sem armadilha nenhuma à vista. Óbvio que é uma armadilha.

É um Mímico: um monstro que se disfarça de baú. Dentro dele há runas de poder, pedrinhas com números gravados. Só que o Mímico misturou runas falsas no meio: uma tem um "x" rabiscado, outra tem "??". Quando o seu feitiço tenta somar uma runa falsa, ele EXPLODE com um erro e para tudo. O Mímico ri. Ele adora isso.

Você precisa de um feitiço que tropeça, levanta e continua: separe as runas falsas, some as verdadeiras e mostre ao Mímico que erro nenhum para você.`,
  realWorld: `try/except é o "plano B" do programa. Um app de banco tenta ler o valor que você digitou e, se você escrever "dez" em vez de 10, ele não fecha sozinho: mostra "valor inválido" e continua funcionando. Programas de verdade usam isso o tempo todo, para arquivos que não existem, internet que cai ou dados mal preenchidos.`,
  theory: `Um texto que parece número ainda é texto. O int() transforma o texto em número de verdade:

  int("12")   → 12
  int("12") + 1   → 13

Mas, se o texto não for um número, o int() dá erro, e o programa PARA ali:

  int("doze")
  → ValueError: invalid literal for int()

Para não parar, use try / except. O Python TENTA o bloco do try; se der aquele erro, ele pula para o bloco do except e segue em frente:

  pocoes = ["3", "dez", "2"]
  total = 0
  for p in pocoes:
      try:
          total = total + int(p)
      except ValueError:
          print("Poção estragada:", p)
  print("Total:", total)

Saída:
  Poção estragada: dez
  Total: 5

Detalhes:
• Coloque no try só o que pode falhar (aqui, a conversão), DENTRO do for. Se o try ficar em volta do for inteiro, o loop para na primeira poção estragada.
• Depois de except vem o nome do erro que você espera (ValueError) e dois-pontos. O que estiver dentro do except só roda quando der erro.`,
  instructions: `O Mímico guardou estas runas (já estão no código):

  runas = ["7", "3", "x", "10", "??", "5"]

Para cada runa, tente somá-la ao poder. Quando a runa for falsa, avise e continue para a próxima. No fim, mostre o poder total das runas verdadeiras.

A saída deve ser exatamente:
  Runa falsa: x
  Runa falsa: ??
  Poder total: 25`,
  hints: [
    "Use for runa in runas: e, dentro dele, um try: com poder = poder + int(runa). Logo abaixo do try, no mesmo recuo, vem except ValueError: com o print da runa falsa.",
    "for runa in runas: · try: poder = poder + int(runa) · except ValueError: print(f\"Runa falsa: {runa}\"). Fora do for (sem recuo): print(f\"Poder total: {poder}\").",
  ],
  solution: `runas = ["7", "3", "x", "10", "??", "5"]
poder = 0

for runa in runas:
    try:
        poder = poder + int(runa)
    except ValueError:
        print(f"Runa falsa: {runa}")

print(f"Poder total: {poder}")`,
  codeTemplate: `# O Baú Mímico
runas = ["7", "3", "x", "10", "??", "5"]
poder = 0

# Para cada runa: tente somar (int) e, se for falsa, avise e continue

# No fim, mostre o poder total
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Runa falsa: x\nRuna falsa: ??\nPoder total: 25",
  xpReward: 35,
  coinReward: 30,
  requiredCode: [
    { pattern: "\\btry\\s*:", hint: "Proteja a conversão com try: — é o que impede o feitiço de explodir na runa falsa." },
    { pattern: "\\bexcept\\b", hint: "Logo depois do try, trate o erro com except ValueError:." },
    { pattern: "\\bint\\s*\\(", hint: "Transforme cada runa em número com int(runa) antes de somar." },
    { pattern: "\\bfor\\s+\\w+\\s+in\\s+runas\\b", hint: "Percorra as runas com for runa in runas:." },
    { pattern: "^(?![\\s\\S]*print[\\s\\S]*print[\\s\\S]*print)", hint: "Use só dois print: um dentro do except (a runa falsa) e um no fim (o total)." },
  ],
  unlockCondition: { requiredMissionIds: [26] },
};

export default mission32;
