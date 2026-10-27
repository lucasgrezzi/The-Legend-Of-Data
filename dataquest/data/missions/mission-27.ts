import type { Mission } from "@/types";

// BÔNUS — chefe da Masmorra Secreta. Dificuldade 5/5.
// Conceito novo: dicionário (chave → valor): criar, ler, mudar, acrescentar e percorrer com .items().
// Revisão: for, contas, f-string. Template quase vazio. Libera a Fênix e o título "Decifrador de Enigmas" na loja.
const mission27: Mission = {
  id: 27,
  track: "python",
  type: "python",
  bonus: true,
  chapterTitle: "A Masmorra Secreta — Sala II (Chefe Bônus)",
  missionTitle: "O Enigma da Esfinge",
  concept: "Dicionários: chave e valor",
  narrative: `A última sala da Masmorra Secreta é um salão de pedra coberto de joias. No meio, deitada sobre um baú, está a Esfinge: corpo de leão, asas de águia e a paciência de uma professora no último dia de aula.

"Ninguém passa sem responder ao meu enigma", ela ronrona. "E o meu enigma é sempre o mesmo: quantas gemas de cada cor você carrega?"

Você abre a bolsa. Tem rubis e safiras, guardados num DICIONÁRIO: cada cor da gema é uma etiqueta, e cada etiqueta aponta para uma quantidade. No caminho até aqui você achou 2 esmeraldas. E a Esfinge, claro, cobra pedágio: uma safira.

"Responda certo e o tesouro é seu. Erre", ela boceja, "e eu almoço mais cedo."`,
  realWorld: `Um dicionário guarda pares de chave e valor: dá para achar qualquer valor pelo nome, sem lembrar a posição. É a agenda do celular (nome → telefone), o cardápio (prato → preço) e o estoque de uma loja (produto → quantidade). Dados que chegam da internet (JSON) são, quase sempre, dicionários.`,
  theory: `Um dicionário guarda pares chave: valor, entre chaves { }:

  cardapio = {"pastel": 8, "suco": 5}

Para LER um valor, use a chave entre colchetes:

  print(cardapio["suco"])          # 5

Para MUDAR um valor, atribua de novo:

  cardapio["suco"] = cardapio["suco"] + 1     # agora 6

Para ACRESCENTAR um par novo, é igual: se a chave não existe, ela é criada:

  cardapio["bolo"] = 7

Para PERCORRER, o .items() entrega a chave e o valor a cada volta do for:

  for prato, preco in cardapio.items():
      print(f"{prato}: {preco}")

Saída:
  pastel: 8
  suco: 6
  bolo: 7

E o .values() junta só os valores. Com o sum(), dá o total:

  print(sum(cardapio.values()))    # 21`,
  instructions: `Sua bolsa de gemas é o dicionário gemas = {"rubi": 3, "safira": 5}.

• Você achou 2 esmeraldas: acrescente a esmeralda na bolsa.
• A Esfinge cobra 1 safira de pedágio: tire 1 da safira.
• Responda ao enigma: mostre cada gema e a quantidade, uma por linha, e termine com o total de gemas.

A resposta deve sair assim:
  rubi: 3
  safira: 4
  esmeralda: 2
  Total: 9`,
  hints: [
    "Acrescentar e mudar usam o mesmo jeito: gemas[\"esmeralda\"] = 2 e gemas[\"safira\"] = gemas[\"safira\"] - 1. Depois, um for com .items() mostra cada par.",
    "for cor, qtd in gemas.items(): print(f\"{cor}: {qtd}\") — e, fora do for, print(f\"Total: {sum(gemas.values())}\").",
  ],
  solution: `gemas = {"rubi": 3, "safira": 5}

gemas["esmeralda"] = 2
gemas["safira"] = gemas["safira"] - 1

for cor, qtd in gemas.items():
    print(f"{cor}: {qtd}")

print(f"Total: {sum(gemas.values())}")`,
  codeTemplate: `# O Enigma da Esfinge
gemas = {"rubi": 3, "safira": 5}
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "rubi: 3\nsafira: 4\nesmeralda: 2\nTotal: 9",
  xpReward: 45,
  coinReward: 40,
  requiredCode: [
    { pattern: "gemas\\[\\s*[\"']esmeralda[\"']\\s*\\]\\s*=", hint: "Acrescente a esmeralda no dicionário: gemas[\"esmeralda\"] = 2." },
    { pattern: "gemas\\[\\s*[\"']safira[\"']\\s*\\]\\s*(-=|=)", hint: "Mude a quantidade de safiras no próprio dicionário: gemas[\"safira\"] = gemas[\"safira\"] - 1." },
    { pattern: "\\.items\\(\\)", hint: "Percorra a bolsa com for cor, qtd in gemas.items(): — assim funciona para qualquer número de gemas." },
    { pattern: "sum\\(\\s*gemas\\.values\\(\\)\\s*\\)|\\+=|=\\s*\\w+\\s*\\+\\s*\\w+", hint: "Calcule o total com sum(gemas.values()) — sem digitar o número." },
  ],
  unlockCondition: { requiredMissionIds: [26] },
};

export default mission27;
