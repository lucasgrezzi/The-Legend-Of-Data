import type { DataFilePreview } from "@/types";
import { csvTable } from "@/data/catacumbas";

// Dados da trilha Pandas "A Forja de Dados" (missão 13 em diante).
// Valores sem vírgula (o parser é simples). Mudou um valor? Recalcule o expectedOutput das missões.

/** Arquivo CSV para Pandas: lido em /data/mission.csv, a aba Dados mostra o nome do arquivo (sem `table`) */
function csvFile(name: string, rawCsv: string): DataFilePreview {
  const { table: _table, ...file } = csvTable(name, rawCsv);
  return file;
}

/**
 * Encomendas feitas à Forja (missão 13). Só as `paga` contam ouro:
 * Norte 270 · Oeste 220 · Leste 150 · Sul 100 (sem o filtro: Norte 330 · Oeste 260 · Leste 240 · Sul 210).
 */
export const ENCOMENDAS = csvFile(
  "encomendas",
  `id,peca,regiao,ouro,status
1,Espada Longa,Norte,120,paga
2,Ferradura,Sul,30,paga
3,Elmo de Aço,Leste,90,pendente
4,Machado Duplo,Norte,150,paga
5,Escudo Redondo,Oeste,80,paga
6,Lança Curta,Sul,70,paga
7,Grevas,Norte,60,pendente
8,Adaga Curva,Leste,50,paga
9,Cota de Malha,Oeste,140,paga
10,Martelo de Guerra,Sul,110,pendente
11,Arco Reforçado,Leste,100,paga
12,Broquel,Oeste,40,pendente`
);
