import type { DataFilePreview, Mission } from "@/types";
import mission0 from "@/data/missions/mission-0";
import mission1 from "@/data/missions/mission-1";
import mission2 from "@/data/missions/mission-2";
import mission3 from "@/data/missions/mission-3";
import mission4 from "@/data/missions/mission-4";
import mission5 from "@/data/missions/mission-5";
import mission6 from "@/data/missions/mission-6";
import mission7 from "@/data/missions/mission-7";
import mission8 from "@/data/missions/mission-8";
import mission9 from "@/data/missions/mission-9";
import mission10 from "@/data/missions/mission-10";
import mission11 from "@/data/missions/mission-11";
import mission12 from "@/data/missions/mission-12";
import mission13 from "@/data/missions/mission-13";
import mission14 from "@/data/missions/mission-14";
import mission15 from "@/data/missions/mission-15";
import mission16 from "@/data/missions/mission-16";
import mission17 from "@/data/missions/mission-17";
import mission18 from "@/data/missions/mission-18";
import mission19 from "@/data/missions/mission-19";
import mission20 from "@/data/missions/mission-20";
import mission21 from "@/data/missions/mission-21";
import mission22 from "@/data/missions/mission-22";

/**
 * Ordem de jogo. O `id` é estável (é a chave do progresso salvo) e NÃO define a ordem:
 * missões novas recebem o próximo id livre e são inseridas aqui na posição certa.
 */
export const MISSIONS: Mission[] = [
  mission0, // Python — Prólogo
  mission1, // Python — print() e variáveis
  mission5, // Python — variáveis e contas
  mission6, // Python — if / elif / else
  mission2, // Python — for + range
  mission7, // Python — listas
  mission8, // Python — funções (chefe)
  mission3,  // SQL — SELECT, WHERE, ORDER BY
  mission17, // SQL — LIMIT
  mission9,  // SQL — AND / OR / IN
  mission18, // SQL — LIKE
  mission10, // SQL — agregações
  mission11, // SQL — GROUP BY + HAVING
  mission12, // SQL — JOIN (chefe)
  mission4,  // Pandas — ler CSV e filtrar
  mission19, // Pandas — sort_values + head
  mission20, // Pandas — sum, mean e max
  mission21, // Pandas — value_counts
  mission13, // Pandas — groupby, sum e sort_values
  mission14, // Pandas — colunas calculadas (chefe)
  mission15, // Data Viz — gráfico de barras
  mission16, // Data Viz — gráfico de linha, título e eixos
  mission22, // Data Viz — gráfico a partir de groupby (chefe)
];

/** Todos os arquivos de dados da missão (principal + extras), na ordem da aba Dados */
export function missionDataFiles(m: Mission): DataFilePreview[] {
  return [...(m.dataFile ? [m.dataFile] : []), ...(m.extraDataFiles ?? [])];
}

export function getMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

/** Fases de uma região (trilha), na ordem de jogo */
export function missionsOfTrack(track: Mission["track"]): Mission[] {
  return MISSIONS.filter((m) => m.track === track);
}

/** O chefe de uma região é sempre a última fase dela */
export function bossOf(track: Mission["track"]): Mission | undefined {
  const list = missionsOfTrack(track);
  return list[list.length - 1];
}

export const isBoss = (m: Mission) => bossOf(m.track)?.id === m.id;

/** Missão anterior/seguinte na ordem de jogo */
export function getNeighbors(id: number): { prev: Mission | null; next: Mission | null } {
  const i = MISSIONS.findIndex((m) => m.id === id);
  return { prev: MISSIONS[i - 1] ?? null, next: MISSIONS[i + 1] ?? null };
}
