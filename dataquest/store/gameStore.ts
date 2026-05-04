"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeLevel, computeUnlockedMissions } from "@/lib/xp";
import { MISSIONS } from "@/lib/missions";

interface GameState {
  totalXP: number;
  completedMissionIds: number[];
  unlockedMissionIds: number[];
  currentMissionId: number;
  level: number;
  levelLabel: string;

  completeMission: (missionId: number, xpEarned: number) => void;
  setCurrentMission: (missionId: number) => void;
  resetProgress: () => void;
}

const initialState = {
  totalXP: 0,
  completedMissionIds: [] as number[],
  unlockedMissionIds: [0],
  currentMissionId: 0,
  level: 1,
  levelLabel: "Aprendiz",
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      completeMission: (missionId, xpEarned) =>
        set((state) => {
          if (state.completedMissionIds.includes(missionId)) return state;
          const newXP = state.totalXP + xpEarned;
          const newCompleted = [...state.completedMissionIds, missionId];
          const { level, label } = computeLevel(newXP);
          const unlocked = computeUnlockedMissions(newCompleted, newXP, MISSIONS);
          return {
            totalXP: newXP,
            completedMissionIds: newCompleted,
            unlockedMissionIds: unlocked,
            level,
            levelLabel: label,
          };
        }),

      setCurrentMission: (missionId) =>
        set({ currentMissionId: missionId }),

      resetProgress: () =>
        set({
          ...initialState,
          unlockedMissionIds: computeUnlockedMissions([], 0, MISSIONS),
        }),
    }),
    {
      name: "dataquest-progress",
    }
  )
);
