import type { Mission } from "@/types";
import mission0 from "@/data/missions/mission-0";
import mission1 from "@/data/missions/mission-1";
import mission2 from "@/data/missions/mission-2";
import mission3 from "@/data/missions/mission-3";
import mission4 from "@/data/missions/mission-4";
import mission5 from "@/data/missions/mission-5";
import mission6 from "@/data/missions/mission-6";

/**
 * Ordem de jogo. O `id` é estável (é a chave do progresso salvo) e NÃO define a ordem:
 * missões novas recebem o próximo id livre e são inseridas aqui na posição certa.
 */
export const MISSIONS: Mission[] = [
  mission0, // Python — Prólogo
  mission1, // Python — print() e variáveis
  mission5, // Python — variáveis e contas
  mission6, // Python — if / elif / else
  mission2, // Python — for + if
  mission3, // SQL
  mission4, // Pandas
];

export function getMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

/** Missão anterior/seguinte na ordem de jogo */
export function getNeighbors(id: number): { prev: Mission | null; next: Mission | null } {
  const i = MISSIONS.findIndex((m) => m.id === id);
  return { prev: MISSIONS[i - 1] ?? null, next: MISSIONS[i + 1] ?? null };
}
