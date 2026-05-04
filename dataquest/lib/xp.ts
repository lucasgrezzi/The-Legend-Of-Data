import type { Mission } from "@/types";

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
