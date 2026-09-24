"use client";

import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/store/gameStore";
import { useAccountStore } from "@/store/accountStore";
import { useHydrated } from "./useHydrated";

/**
 * Em que etapa de entrada a pessoa está:
 * - "loading"     → lendo o progresso local ou a sessão / o save da nuvem
 * - "login"       → precisa entrar ou criar conta (SEMPRE antes de jogar, quando o Supabase está configurado)
 * - "cloud-error" → logado, mas o save da nuvem não carregou
 * - "character"   → precisa criar o personagem
 * - "play"        → pode jogar
 */
export type GateStep = "loading" | "login" | "cloud-error" | "character" | "play";

export function useGate(): GateStep {
  const hydrated = useHydrated();
  const hasProfile = useGameStore((s) => s.profile !== null);
  const { ready, email, sync } = useAccountStore();

  if (!hydrated) return "loading";
  if (supabase) {
    if (!ready) return "loading";
    if (!email) return "login";
    if (sync === "loading") return "loading";
    if (sync === "error" && !hasProfile) return "cloud-error";
  }
  return hasProfile ? "play" : "character";
}
