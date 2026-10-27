import type { Mission } from "@/types";
import { PEDIDOS } from "@/data/forja";

// Dificuldade 5/5 — CHEFE da Forja: coluna calculada + filtro + groupby + sum + sort_values. Template quase vazio.
// Ordem de jogo: depois da 24 (A Teia da Aranha Tecelã).
const mission14: Mission = {
  id: 14,
  track: "pandas",
  type: "pandas",
  chapterTitle: "A Forja de Dados — Capítulo VIII (Chefe)",
  missionTitle: "A Têmpera do Rei",
  concept: "Pandas: criar colunas com contas (chefe)",
  narrative: `Chegou carta do castelo. Selo vermelho, letra caprichada, cheiro de perfume caro. É do Rei — o atual, não o Esquecido.

Brokk lê, resmunga, lê de novo. "O Rei quer saber quanto cada região vai faturar com as lâminas. Faturamento, ele diz. Palavra de rei pra 'quanto dinheiro entra'."

Têmpera, aliás, é quando o ferreiro esquenta e esfria o metal para ele ficar forte. É a última etapa. Esta é a última fase da Forja — a fase CHEFE: junta tudo o que você aprendeu aqui.

"Só tem um problema", diz Brokk. "A tabela não tem o faturamento pronto. Tem a quantidade e o preço de cada peça. E pedido de uma peça só o Rei nem considera — diz que é coisa de plebeu."

Eu, o Grimório, acho o Rei um pouco esnobe. Mas paga bem.`,
  realWorld: `Quase nunca a tabela vem com o número que você precisa: é comum CRIAR uma coluna a partir de outras, como total = quantidade × preço. No Pandas isso é uma linha só, e a conta é feita para todas as linhas de uma vez. É assim que se calcula faturamento, lucro, imposto ou nota média numa planilha de verdade.`,
  theory: `Para criar uma coluna nova, escreva o nome dela entre colchetes do lado esquerdo do = e a conta do lado direito. O Pandas faz a conta linha por linha, sozinho:

  df["poder"] = df["forca"] * df["nivel"]

Agora a tabela tem uma coluna poder, que pode ser usada como qualquer outra — filtrar, agrupar, somar:

  fortes = df[df["nivel"] >= 3]
  poder_por_cla = fortes.groupby("cla")["poder"].sum()

Para filtrar com "maior ou igual", use >=. As outras comparações: >, <, <=, == (igual) e != (diferente).

Lembre da ordem que funciona sempre: leia o arquivo, crie a coluna, filtre, agrupe, ordene, mostre.`,
  instructions: `Os pedidos do Rei estão em /data/mission.csv, com a quantidade e o preço de cada peça. Calcule o faturamento de cada pedido (quantidade × preço), considere só os pedidos com 2 peças ou mais e mostre o total de cada região, do maior para o menor.

O Rei espera ler exatamente:
  Norte: 220
  Leste: 210
  Oeste: 200
  Sul: 190`,
  hints: [
    "Crie a coluna antes de tudo: df[\"total\"] = df[\"quantidade\"] * df[\"preco\"]. Depois filtre df[df[\"quantidade\"] >= 2].",
    "Com o filtro pronto: grandes.groupby(\"regiao\")[\"total\"].sum().sort_values(ascending=False) — e um for com .items() para mostrar \"regiao: total\".",
  ],
  solution: `import pandas as pd

df = pd.read_csv("/data/mission.csv")
df["total"] = df["quantidade"] * df["preco"]
grandes = df[df["quantidade"] >= 2]
faturamento = grandes.groupby("regiao")["total"].sum().sort_values(ascending=False)

for regiao, total in faturamento.items():
    print(f"{regiao}: {total}")`,
  codeTemplate: `import pandas as pd

# A Têmpera do Rei — fase CHEFE
# (Você já sabe tudo o que precisa. Respire. Leia o Estudo se precisar.)
`,
  editorLanguage: "python",
  validationType: "exact",
  expectedOutput: "Norte: 220\nLeste: 210\nOeste: 200\nSul: 190",
  xpReward: 40,
  coinReward: 30,
  requiredCode: [
    { pattern: "read_csv\\(", hint: "Leia o arquivo com pd.read_csv(\"/data/mission.csv\")." },
    { pattern: "\\[\\s*[\"']\\w+[\"']\\s*\\]\\s*=(?!=)[^\\n]*\\*", hint: "Crie uma coluna nova com a conta: df[\"total\"] = df[\"quantidade\"] * df[\"preco\"]." },
    { pattern: "\\[\\s*[\"']quantidade[\"']\\s*\\]\\s*>=?", hint: "Filtre os pedidos pela quantidade: só os de 2 peças ou mais." },
    { pattern: "\\.groupby\\(", hint: "Agrupe por região com .groupby(\"regiao\")." },
    { pattern: "\\.sort_values\\(", hint: "Ordene com .sort_values(ascending=False) — não ordene na mão." },
  ],
  dataFile: PEDIDOS,
  unlockCondition: { requiredMissionIds: [24] },
};

export default mission14;
