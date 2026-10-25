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
