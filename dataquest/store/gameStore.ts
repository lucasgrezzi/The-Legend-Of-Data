"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MissionAttempts, PlayerProfile } from "@/types";
import { computeLevel, computeUnlockedMissions } from "@/lib/xp";
import { MISSIONS } from "@/lib/missions";

interface GameState {
  profile: PlayerProfile | null;
  totalXP: number;
  /** Moedas de ouro — ganhas ao concluir missões, gastas em dicas do Grimório */
  coins: number;
  completedMissionIds: number[];
  unlockedMissionIds: number[];
  /** XP efetivamente ganho por missão (metade se revelou a solução) */
  xpByMission: Record<number, number>;
  attempts: Record<number, MissionAttempts>;
  currentMissionId: number;
  level: number;
  levelLabel: string;

  setProfile: (profile: PlayerProfile) => void;
  completeMission: (missionId: number, xpEarned: number, coinsEarned: number) => void;
  recordFail: (missionId: number) => void;
  /** Compra a próxima dica; retorna false se não houver moedas suficientes */
  buyHint: (missionId: number, cost: number) => boolean;
  revealSolution: (missionId: number) => void;
  setCurrentMission: (missionId: number) => void;
  /** Substitui todo o progresso (ex.: save baixado da nuvem ao entrar na conta) */
  loadProgress: (snapshot: ProgressSnapshot) => void;
  /** Volta ao estado inicial (ao sair da conta — o próximo a usar o navegador começa do zero) */
  resetProgress: () => void;
}

/** Campos persistidos do progresso — o mesmo formato vai para o localStorage e para a nuvem */
export type ProgressSnapshot = typeof initialState;

/** Versão do formato persistido — também gravada junto do save na nuvem */
export const PROGRESS_VERSION = 1;

export function progressSnapshot(state: GameState): ProgressSnapshot {
  const { profile, totalXP, coins, completedMissionIds, unlockedMissionIds, xpByMission, attempts, currentMissionId, level, levelLabel } = state;
  return { profile, totalXP, coins, completedMissionIds, unlockedMissionIds, xpByMission, attempts, currentMissionId, level, levelLabel };
}

const NO_ATTEMPTS: MissionAttempts = { fails: 0, hintsBought: 0, solutionRevealed: false };

export function getAttempts(state: Pick<GameState, "attempts">, missionId: number): MissionAttempts {
  return state.attempts[missionId] ?? NO_ATTEMPTS;
}

const initialState = {
  profile: null as PlayerProfile | null,
  totalXP: 0,
  coins: 0,
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
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      completeMission: (missionId, xpEarned, coinsEarned) =>
        set((state) => {
          if (state.completedMissionIds.includes(missionId)) return state;
          const newXP = state.totalXP + xpEarned;
          const newCompleted = [...state.completedMissionIds, missionId];
          const { level, label } = computeLevel(newXP);
          const unlocked = computeUnlockedMissions(newCompleted, newXP, MISSIONS);
          return {
            totalXP: newXP,
            coins: state.coins + coinsEarned,
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

      buyHint: (missionId, cost) => {
        const state = get();
        if (state.coins < cost) return false;
        const a = getAttempts(state, missionId);
        set({
          coins: state.coins - cost,
          attempts: { ...state.attempts, [missionId]: { ...a, hintsBought: a.hintsBought + 1 } },
        });
        return true;
      },

      revealSolution: (missionId) =>
        set((state) => {
          const a = getAttempts(state, missionId);
          return { attempts: { ...state.attempts, [missionId]: { ...a, solutionRevealed: true } } };
        }),

      setCurrentMission: (missionId) =>
        set({ currentMissionId: missionId }),

      loadProgress: (snapshot) => set({ ...initialState, ...snapshot }),

      resetProgress: () => set(initialState),
    }),
    {
      name: "dataquest-progress",
      version: PROGRESS_VERSION,
      // v0 → v1: moedas creditadas pelas missões já concluídas; grimoireOpened → solutionRevealed
      migrate: (persisted, version) => {
        const s = persisted as Record<string, unknown>;
        if (version < 1) {
          const completed = (s.completedMissionIds as number[] | undefined) ?? [];
          s.coins = MISSIONS.filter((m) => completed.includes(m.id)).reduce((sum, m) => sum + m.coinReward, 0);
          const old = (s.attempts as Record<number, { fails?: number; grimoireOpened?: boolean }> | undefined) ?? {};
          s.attempts = Object.fromEntries(
            Object.entries(old).map(([id, a]) => [id, { fails: a.fails ?? 0, hintsBought: 0, solutionRevealed: !!a.grimoireOpened }])
          );
        }
        return s as unknown as GameState;
      },
      partialize: progressSnapshot,
    }
  )
);
