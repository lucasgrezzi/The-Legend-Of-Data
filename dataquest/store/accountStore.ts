"use client";

import { create } from "zustand";

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

interface AccountState {
  /** Sessão já verificada (evita piscar "Entrar" antes de saber se há conta logada) */
  ready: boolean;
  email: string | null;
  sync: SyncStatus;
  setSession: (email: string | null) => void;
  setSync: (sync: SyncStatus) => void;
}

/** Conta do Supabase — não é persistido (a sessão fica guardada pelo próprio supabase-js) */
export const useAccountStore = create<AccountState>()((set) => ({
  ready: false,
  email: null,
  sync: "idle",
  setSession: (email) => set({ ready: true, email }),
  setSync: (sync) => set({ sync }),
}));
