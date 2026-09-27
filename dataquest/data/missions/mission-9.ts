import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 2/5 — WHERE com AND / OR / IN e parênteses. Template só com comentários.
// Ordem de jogo: depois da 3, antes da 10.
const mission9: Mission = {
  id: 9,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo II",
  missionTitle: "O Salão dos Ossos",
  concept: "SQL: WHERE com AND, OR e IN",
  narrative: `Mais fundo nas Catacumbas, o ar esfria e o chão range sob ossos antigos. No centro do salão, um esqueleto de armadura enferrujada ergue a cabeça: é o Guardião dos Ossos, que há séculos cataloga cada relíquia das salas na tabela reliquias.

"Leve o que precisar, Arquivista", ele diz com a voz rouca, "mas só armas e amuletos, e só das salas Norte e Leste — as outras desabaram. E nada que esteja amaldiçoado. Quem sai daqui com uma maldição nunca mais encontra a saída."`,
  theory: `Uma condição só no WHERE raramente basta. Para combinar várias, use AND e OR:

  AND → as duas condições precisam ser verdadeiras
  OR  → basta uma delas ser verdadeira

  SELECT nome, forca
  FROM monstros
  WHERE forca > 50 AND habitat = 'caverna';

Textos em SQL ficam entre aspas simples: 'caverna'.

IN é um atalho para vários OR na mesma coluna:

  WHERE habitat IN ('caverna', 'pantano')
  -- é o mesmo que:
  WHERE habitat = 'caverna' OR habitat = 'pantano'

Cuidado ao misturar AND e OR: o AND é resolvido antes, como a multiplicação antes da soma. Use parênteses para deixar claro o que vai junto:

  WHERE (habitat = 'caverna' OR habitat = 'pantano')
    AND forca > 50

Sem os parênteses, o forca > 50 valeria só para o pântano!`,
  instructions: `Siga as regras do Guardião: das relíquias da tabela reliquias, fique só com as armas e os amuletos das salas Norte e Leste que não estão amaldiçoados.

Mostre o nome e o valor de cada uma, da mais valiosa para a menos valiosa. Devem sobrar 3 relíquias.`,
  hints: [
    "São três condições ao mesmo tempo: tipo (arma ou amuleto), sala (Norte ou Leste) e amaldicoada = 'nao'. Junte-as com AND.",
    "Use IN para não se perder nos OR: tipo IN ('arma', 'amuleto') AND sala IN ('Norte', 'Leste'). Termine com ORDER BY valor DESC.",
  ],
  solution: `SELECT nome, valor
FROM reliquias
WHERE tipo IN ('arma', 'amuleto')
  AND sala IN ('Norte', 'Leste')
  AND amaldicoada = 'nao'
ORDER BY valor DESC;`,
  codeTemplate: `-- O Salão dos Ossos
-- Colunas: nome e valor
-- Regras do Guardião: tipo, sala e maldição
-- Ordem: da mais valiosa para a menos valiosa
`,
  editorLanguage: "sql",
  validationType: "table",
  expectedOutput: JSON.stringify({
    headers: ["nome", "valor"],
    rowCount: 3,
    firstRow: ["Lança do Vigia", "170"],
  }),
  xpReward: 25,
  coinReward: 20,
  requiredCode: [
    { pattern: "\\btipo\\b", flags: "i", hint: "Filtre pela coluna tipo (arma ou amuleto) — não pelo id de cada relíquia." },
    { pattern: "\\bsala\\b", flags: "i", hint: "Filtre também pela coluna sala (Norte ou Leste)." },
    { pattern: "\\bamaldicoada\\b", flags: "i", hint: "Não esqueça a regra da maldição: use a coluna amaldicoada." },
  ],
  dataFile: RELIQUIAS,
  unlockCondition: { requiredMissionIds: [3] },
};

export default mission9;
