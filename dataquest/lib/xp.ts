import type { Mission } from "@/types";

/** Após quantos envios errados o Grimório pode ser aberto */
export const GRIMOIRE_UNLOCK_FAILS = 3;

/** XP de uma missão concluída com o Grimório aberto */
export const grimoireXP = (reward: number) => Math.floor(reward / 2);

export const LEVEL_THRESHOLDS = [
  { minXP: 0,   label: "Aprendiz" },
  { minXP: 50,  label: "Escriba" },
  { minXP: 100, label: "Cronista" },
  { minXP: 150, label: "Arquivista" },
  { minXP: 200, label: "Mestre dos Dados" },
];

export function computeLevel(totalXP: number): { level: number; label: string } {
  let level = 1;
  let label = LEVEL_THRESHOLDS[0].label;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i].minXP) {
      level = i + 1;
      label = LEVEL_THRESHOLDS[i].label;
    }
  }
  return { level, label };
}

export function xpForNextLevel(totalXP: number): number {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP < threshold.minXP) return threshold.minXP;
  }
  return 999;
}

export function computeUnlockedMissions(
  completedIds: number[],
  totalXP: number,
  missions: Mission[]
): number[] {
  return missions
    .filter((m) => {
      if (!m.unlockCondition) return true;
      const { requiredMissionIds, requiredXP } = m.unlockCondition;
      const missionsOk = requiredMissionIds
        ? requiredMissionIds.every((id) => completedIds.includes(id))
        : true;
      const xpOk = requiredXP !== undefined ? totalXP >= requiredXP : true;
      return missionsOk && xpOk;
    })
    .map((m) => m.id);
}

export interface LevelProgress {
  level: number;
  label: string;
  /** XP mínimo do nível atual */
  floorXP: number;
  /** XP do próximo nível, ou null se já estiver no nível máximo */
  nextXP: number | null;
  nextLabel: string | null;
  /** 0–100 dentro do nível atual */
  pct: number;
}

export function levelProgress(totalXP: number): LevelProgress {
  const { level, label } = computeLevel(totalXP);
  const floorXP = LEVEL_THRESHOLDS[level - 1].minXP;
  const next = LEVEL_THRESHOLDS[level];
  if (!next) {
    return { level, label, floorXP, nextXP: null, nextLabel: null, pct: 100 };
  }
  const pct = Math.min(100, ((totalXP - floorXP) / (next.minXP - floorXP)) * 100);
  return { level, label, floorXP, nextXP: next.minXP, nextLabel: next.label, pct };
}

export function isMissionUnlocked(
  mission: Mission,
  completedIds: number[],
  totalXP: number
): boolean {
  return computeUnlockedMissions(completedIds, totalXP, [mission]).length > 0;
}

/** Lista legível do que ainda falta para desbloquear a missão (vazia = desbloqueada). */
export function missingRequirements(
  mission: Mission,
  completedIds: number[],
  totalXP: number,
  missions: Mission[]
): string[] {
  const reqs: string[] = [];
  const cond = mission.unlockCondition;
  if (!cond) return reqs;
  for (const id of cond.requiredMissionIds ?? []) {
    if (!completedIds.includes(id)) {
      const m = missions.find((x) => x.id === id);
      reqs.push(m ? `Concluir “${m.missionTitle}”` : `Concluir missão ${id}`);
    }
  }
  if (cond.requiredXP !== undefined && totalXP < cond.requiredXP) {
    reqs.push(`Alcançar ${cond.requiredXP} XP (faltam ${cond.requiredXP - totalXP})`);
  }
  return reqs;
}
