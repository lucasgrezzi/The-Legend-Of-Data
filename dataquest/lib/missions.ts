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
import mission23 from "@/data/missions/mission-23";
import mission24 from "@/data/missions/mission-24";
import mission25 from "@/data/missions/mission-25";
import mission26 from "@/data/missions/mission-26";
import mission27 from "@/data/missions/mission-27";
import mission28 from "@/data/missions/mission-28";
import mission29 from "@/data/missions/mission-29";
import mission30 from "@/data/missions/mission-30";
import mission31 from "@/data/missions/mission-31";
import mission32 from "@/data/missions/mission-32";

/**
 * Ordem de jogo. O `id` é estável (é a chave do progresso salvo) e NÃO define a ordem:
 * missões novas recebem o próximo id livre e são inseridas aqui na posição certa.
 */
const MAIN_MISSIONS: Mission[] = [
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
  mission28, // SQL — CASE WHEN
  mission10, // SQL — agregações
  mission29, // SQL — subconsulta
  mission11, // SQL — GROUP BY + HAVING
  mission30, // SQL — JOIN
  mission31, // SQL — LEFT JOIN + IS NULL
  mission12, // SQL — JOIN + GROUP BY (chefe)
  mission4,  // Pandas — ler CSV e filtrar
  mission19, // Pandas — sort_values + head
  mission20, // Pandas — sum, mean e max
  mission21, // Pandas — value_counts
  mission13, // Pandas — groupby, sum e sort_values
  mission23, // Pandas — merge
  mission24, // Pandas — pivot_table
  mission14, // Pandas — colunas calculadas (chefe)
  mission15, // Data Viz — gráfico de barras
  mission16, // Data Viz — gráfico de linha, título e eixos
  mission25, // Data Viz — duas linhas, cores e legenda
  mission22, // Data Viz — gráfico a partir de groupby (chefe)
];

/**
 * Masmorra Secreta: fases bônus (`bonus: true`) que abrem depois do chefe do Python. Ficam FORA da trilha da região
 * (não contam como chefe, não aparecem nos nós do mapa e não bloqueiam nada) — a entrada é o portal no fim da região.
 */
export const BONUS_MISSIONS: Mission[] = [
  mission26, // Python — while (Hidra)
  mission32, // Python — try / except (Mímico)
  mission27, // Python — dicionários (Esfinge, chefe bônus)
];

/** Região onde fica a entrada da Masmorra Secreta (o portal aparece depois do chefe dela) */
export const SECRET_DUNGEON_TRACK: Mission["track"] = "python";

/** Todas as fases: as da jornada principal (na ordem de jogo) e, no fim, as bônus */
export const MISSIONS: Mission[] = [...MAIN_MISSIONS, ...BONUS_MISSIONS];

/** Todos os arquivos de dados da missão (principal + extras), na ordem da aba Dados */
export function missionDataFiles(m: Mission): DataFilePreview[] {
  return [...(m.dataFile ? [m.dataFile] : []), ...(m.extraDataFiles ?? [])];
}

export function getMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

/** Fases de uma região (trilha), na ordem de jogo — sem as bônus */
export function missionsOfTrack(track: Mission["track"]): Mission[] {
  return MAIN_MISSIONS.filter((m) => m.track === track);
}

/** As fases "irmãs" de uma missão: as da Masmorra Secreta para uma bônus, as da região para as outras */
export function siblingsOf(m: Mission): Mission[] {
  return m.bonus ? BONUS_MISSIONS : missionsOfTrack(m.track);
}

/** Próxima fase da jornada principal (a bônus nunca é "a próxima": é um desvio opcional) */
export function nextMainMission(isAvailable: (m: Mission) => boolean): Mission | undefined {
  return MAIN_MISSIONS.find(isAvailable);
}

/** O chefe de uma região é sempre a última fase dela */
export function bossOf(track: Mission["track"]): Mission | undefined {
  const list = missionsOfTrack(track);
  return list[list.length - 1];
}

/** Chefe = última fase da região; na Masmorra Secreta, a última sala */
export const isBoss = (m: Mission) =>
  m.bonus ? BONUS_MISSIONS[BONUS_MISSIONS.length - 1]?.id === m.id : bossOf(m.track)?.id === m.id;

/** Missão anterior/seguinte na ordem de jogo (as bônus só navegam entre si) */
export function getNeighbors(id: number): { prev: Mission | null; next: Mission | null } {
  const list = getMission(id)?.bonus ? BONUS_MISSIONS : MAIN_MISSIONS;
  const i = list.findIndex((m) => m.id === id);
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}
