import type { Mission } from "@/types";

// Dificuldade 3/5 — template só com comentários; restrição: um único print para as tochas.
const mission2: Mission = {
  id: 2,
  track: "python",
  type: "python",
  chapterTitle: "A Linguagem dos Antigos — Capítulo IV",
  missionTitle: "O Corredor das Tochas",
  concept: "Repetição com for e range()",
  narrative: `Depois do portão vem o Corredor das Tochas. Escuro. Comprido. Com um leve cheiro de meia velha.

Você precisa acender as tochas uma por uma. Hoje são só três... mas corredor de masmorra (masmorra = labirinto subterrâneo cheio de perigo, o lugar favorito de todo RPG) cresce quando ninguém está olhando. Amanhã podem ser trezentas.

Copiar a mesma linha trezentas vezes? Isso é castigo de estagiário amaldiçoado. Programador manda o computador REPETIR.

E no fim do corredor tem um portal que só abre para quem juntou XP suficiente. XP são os pontos de experiência que você ganha vencendo desafios — tipo pontos de fidelidade, só que mais heroicos.`,
  realWorld: `Um loop (for) repete um bloco de código sozinho. É o que um app faz para mandar a mesma mensagem para mil clientes ou somar todas as compras do mês: escreve a instrução uma vez e manda repetir. range(1, 4) gera os números 1, 2 e 3 — uma volta do loop para cada um.`,
  theory: `Um loop repete um bloco de código. O for percorre uma sequência, e range(início, fim) gera números do início até ANTES do fim:

  for n in range(1, 6):
      print(n * 10)
  # 10, 20, 30, 40, 50 — um por linha

Tudo que está indentado embaixo do for se repete. O que volta para a margem roda uma vez só, depois do loop.

Depois do loop, o if continua valendo como sempre:

  energia = 80
  if energia >= 50:
      print("Pronto para lutar")`,
  instructions: `O corredor tem 3 tochas. Acenda-as em ordem, anunciando o número de cada uma — mas o anúncio só pode ser escrito uma vez (imagine se fossem 300 tochas!).

No fim do corredor, um portal só se abre para quem tem 100 de xp ou mais. Você tem 120: se for digno, anuncie Arquivista Desbloqueado.

O corredor deve ecoar:
  1
  2
  3
  Arquivista Desbloqueado`,
  hints: [
    `range(1, 4) gera 1, 2 e 3 — o número do fim nunca entra. Um for percorre esses números um por um, e dentro dele basta um print.`,
    `Dentro do for, imprima a variável do loop. Depois do loop (de volta à margem, sem indentação), use if xp >= 100: para o anúncio final.`,
  ],
  solution: `for tocha in range(1, 4):
    print(tocha)

xp = 120
if xp >= 100:
    print("Arquivista Desbloqueado")`,
  codeTemplate: `# O Corredor das Tochas

# Acenda as tochas 1, 2 e 3


# O portal final
xp = 120
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "1\n2\n3\nArquivista Desbloqueado",
  xpReward: 20,
  coinReward: 15,
  requiredCode: [
    { pattern: "\\bfor\\s+\\w+\\s+in\\s+range\\(", hint: "Use um loop: for ... in range(...):" },
    { pattern: "^(?![\\s\\S]*print[\\s\\S]*print[\\s\\S]*print)", hint: "O anúncio das tochas deve ser escrito uma vez só, dentro do loop — não um print por tocha." },
    { pattern: "\\bif\\s+xp\\s*>=", hint: "O portal final verifica o xp com if." },
  ],
  unlockCondition: { requiredMissionIds: [6] },
};

export default mission2;
