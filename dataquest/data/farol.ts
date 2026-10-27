import type { DataFilePreview } from "@/types";
import { csvTable } from "@/data/catacumbas";

// Dados da trilha Data Viz "O Farol da Verdade" (missão 16 em diante).

function csvFile(name: string, rawCsv: string): DataFilePreview {
  const { table: _table, ...file } = csvTable(name, rawCsv);
  return file;
}

/** Tempestades registradas pela faroleira, mês a mês (missão 16): pico em Mar (8) */
export const TEMPESTADES = csvFile(
  "tempestades",
  `mes,tempestades
Jan,3
Fev,5
Mar,8
Abr,6
Mai,2
Jun,1`
);

/** Caixas que chegaram a cada porto (missão 22 — chefe do Farol). Por porto: Norte 48 · Leste 35 · Sul 27 · Oeste 14 */
export const CARGAS = csvFile(
  "cargas",
  `id,porto,caixas
1,Norte,20
2,Sul,12
3,Leste,15
4,Oeste,6
5,Norte,18
6,Leste,20
7,Sul,15
8,Oeste,8
9,Norte,10`
);

/** Peixes pescados por mês em dois portos (missão 25 — duas linhas com cor e legenda) */
export const PESCARIA = csvFile(
  "pescaria",
  `mes,norte,sul
Jan,4,2
Fev,6,3
Mar,5,7
Abr,8,6
Mai,9,4
Jun,7,8`
);
