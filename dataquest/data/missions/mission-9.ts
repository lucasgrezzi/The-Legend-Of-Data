import type { Mission } from "@/types";
import { RELIQUIAS } from "@/data/catacumbas";

// Dificuldade 2/5 — WHERE com AND / OR / IN e parênteses. Template só com comentários.
// Ordem de jogo: depois da 17, antes da 18.
const mission9: Mission = {
  id: 9,
  track: "sql",
  type: "sql",
  chapterTitle: "As Catacumbas de Dados — Capítulo III",
  missionTitle: "O Salão dos Ossos",
  concept: "SQL: WHERE com AND, OR e IN",
  narrative: `Mais fundo, o chão faz crec-crec. São ossos. Muitos. Você decide não perguntar.

No meio do salão, um esqueleto de armadura levanta a cabeça bem devagar: é o Guardião dos Ossos, bibliotecário das Catacumbas há quinhentos anos. Ele anota cada relíquia na tabela reliquias e tem regras MUITO específicas.

"Pode levar, Arquivista... mas só armas e amuletos. Só das salas Norte e Leste, que as outras desabaram. E nada amaldiçoado." Pausa dramática. "Quem sai com maldição nunca acha a saída."

São três regras ao mesmo tempo. Cuidado com os parênteses — maldição de parêntese é a pior que existe.`,
  realWorld: `AND, OR e IN combinam várias condições num filtro só. É o que você faz numa loja online: tênis E tamanho 40 E (preto OU branco). Os parênteses dizem o que vai junto — sem eles, o computador pode entender "tênis preto tamanho 40, ou então qualquer coisa branca de qualquer tamanho".`,
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
  unlockCondition: { requiredMissionIds: [17] },
};

export default mission9;
