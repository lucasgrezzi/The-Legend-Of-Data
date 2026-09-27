import type { DataFilePreview } from "@/types";

// Tabelas da trilha SQL "As Catacumbas de Dados" (missões 9–12).
// Valores sem vírgula (o parser abaixo é simples). Mudou um valor? Recalcule o expectedOutput das missões.

function csvTable(table: string, rawCsv: string): DataFilePreview {
  const [head, ...lines] = rawCsv.trim().split("\n");
  return {
    filename: `${table}.csv`,
    table,
    headers: head.split(","),
    rows: lines.map((l) => l.split(",")),
    rawCsv,
  };
}

/** Relíquias guardadas nas salas das Catacumbas (missões 9, 10 e 11) */
export const RELIQUIAS = csvTable(
  "reliquias",
  `id,nome,tipo,sala,valor,amaldicoada
1,Espada de Ossos,arma,Norte,120,nao
2,Amuleto da Lua,amuleto,Leste,90,nao
3,Machado Rúnico,arma,Sul,200,sim
4,Pergaminho do Eco,pergaminho,Norte,60,nao
5,Colar de Presas,amuleto,Norte,150,sim
6,Lança do Vigia,arma,Leste,170,nao
7,Tomo das Sombras,pergaminho,Sul,110,sim
8,Adaga Silenciosa,arma,Oeste,80,nao
9,Anel do Eclipse,amuleto,Sul,210,nao
10,Mapa das Criptas,pergaminho,Leste,40,nao
11,Escudo do Rei,armadura,Oeste,260,nao
12,Elmo Partido,armadura,Norte,70,sim`
);

/** Heróis que já desceram às Catacumbas (missão 12 — chefe) */
export const HEROIS = csvTable(
  "herois",
  `id,nome,raca
1,Brenna,anao
2,Kael,elfo
3,Grom,orc
4,Zix,goblin
5,Lyra,elfo`
);

/** Livro das Expedições: cada linha é uma expedição; heroi_id aponta para herois.id (missão 12) */
export const EXPEDICOES = csvTable(
  "expedicoes",
  `id,heroi_id,destino,ouro
1,1,Cripta Norte,120
2,2,Poço Sombrio,200
3,1,Salão dos Ossos,90
4,3,Cripta Norte,150
5,4,Túnel Estreito,60
6,2,Cripta Sul,110
7,3,Poço Sombrio,180
8,1,Cripta Sul,140
9,4,Salão dos Ossos,70`
);
