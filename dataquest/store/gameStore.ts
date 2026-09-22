"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MissionAttempts, PlayerProfile } from "@/types";
import { computeLevel, computeUnlockedMissions } from "@/lib/xp";
import { MISSIONS } from "@/lib/missions";

interface GameState {
  profile: PlayerProfile | null;
  totalXP: number;
  completedMissionIds: number[];
  unlockedMissionIds: number[];
  /** XP efetivamente ganho por missão (metade se usou o Grimório) */
  xpByMission: Record<number, number>;
  attempts: Record<number, MissionAttempts>;
  currentMissionId: number;
  level: number;
  levelLabel: string;

  setProfile: (profile: PlayerProfile) => void;
  completeMission: (missionId: number, xpEarned: number) => void;
  recordFail: (missionId: number) => void;
  openGrimoire: (missionId: number) => void;
  setCurrentMission: (missionId: number) => void;
}

const NO_ATTEMPTS: MissionAttempts = { fails: 0, grimoireOpened: false };

export function getAttempts(state: Pick<GameState, "attempts">, missionId: number): MissionAttempts {
  return state.attempts[missionId] ?? NO_ATTEMPTS;
}

const initialState = {
  profile: null as PlayerProfile | null,
  totalXP: 0,
  completedMissionIds: [] as number[],
  unlockedMissionIds: [0],
  xpByMission: {} as Record<number, number>,
  attempts: {} as Record<number, MissionAttempts>,
  currentMissionId: 0,
  level: 1,
  levelLabel: "Aprendiz",
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

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
            xpByMission: { ...state.xpByMission, [missionId]: xpEarned },
            level,
            levelLabel: label,
          };
        }),

      recordFail: (missionId) =>
        set((state) => {
          const a = getAttempts(state, missionId);
          return { attempts: { ...state.attempts, [missionId]: { ...a, fails: a.fails + 1 } } };
        }),

      openGrimoire: (missionId) =>
        set((state) => {
          const a = getAttempts(state, missionId);
          return { attempts: { ...state.attempts, [missionId]: { ...a, grimoireOpened: true } } };
        }),

      setCurrentMission: (missionId) =>
        set({ currentMissionId: missionId }),
    }),
    {
      name: "dataquest-progress",
    }
  )
);
