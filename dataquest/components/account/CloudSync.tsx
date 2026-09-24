"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MISSIONS } from "@/lib/missions";
import { useGameStore, progressSnapshot, PROGRESS_VERSION, type ProgressSnapshot } from "@/store/gameStore";
import { useAccountStore } from "@/store/accountStore";

const SAVE_DEBOUNCE_MS = 800;

interface CloudSave {
  version: number;
  state: ProgressSnapshot;
}

function waitForLocalProgress(): Promise<void> {
  if (useGameStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = useGameStore.persist.onFinishHydration(() => { unsub(); resolve(); });
  });
}

async function upload(userId: string): Promise<void> {
  if (!supabase) return;
  const snapshot = progressSnapshot(useGameStore.getState());
  // Sem personagem ainda não há o que salvar (nome e raça são obrigatórios no banco)
  if (!snapshot.profile) return;

  const { setSync } = useAccountStore.getState();
  setSync("saving");
  const { error } = await supabase.from("saves").upsert({
    user_id: userId,
    name: snapshot.profile.name,
    race: snapshot.profile.race,
    total_xp: snapshot.totalXP,
    missions_done: snapshot.completedMissionIds.filter((id) => MISSIONS.some((m) => m.id === id)).length,
    state: { version: PROGRESS_VERSION, state: snapshot } satisfies CloudSave,
    updated_at: new Date().toISOString(),
  });
  setSync(error ? "error" : "saved");
  if (error) console.error("[DataQuest] Falha ao salvar na nuvem:", error.message);
}

/**
 * Ao entrar: junta o progresso do navegador com o da nuvem — fica o que tiver MAIS XP
 * (quem jogou como convidado e depois criou a conta não perde nada).
 */
async function reconcile(userId: string): Promise<void> {
  if (!supabase) return;
  const { setSync } = useAccountStore.getState();
  setSync("loading");
  await waitForLocalProgress();

  const { data, error } = await supabase.from("saves").select("state").eq("user_id", userId).maybeSingle();
  if (error) {
    setSync("error");
    console.error("[DataQuest] Falha ao carregar da nuvem:", error.message);
    return;
  }

  const cloud = data?.state as CloudSave | undefined;
  const local = useGameStore.getState();
  if (cloud && cloud.version === PROGRESS_VERSION && (!local.profile || cloud.state.totalXP >= local.totalXP)) {
    useGameStore.getState().loadProgress(cloud.state);
    setSync("saved");
  } else {
    await upload(userId);
  }
}

/** Montado uma vez no layout: acompanha a sessão e salva o progresso na nuvem a cada mudança. */
export default function CloudSync() {
  useEffect(() => {
    if (!supabase) {
      useAccountStore.getState().setSession(null);
      return;
    }

    let userId: string | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let applyingRemote = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextId = session?.user.id ?? null;
      useAccountStore.getState().setSession(session?.user.email ?? null);

      if (event === "SIGNED_OUT") {
        userId = null;
        clearTimeout(timer);
        useGameStore.getState().resetProgress();
        useAccountStore.getState().setSync("idle");
        return;
      }
      if (nextId && nextId !== userId) {
        userId = nextId;
        // Fora do callback: o supabase-js não deve ser chamado de dentro do onAuthStateChange
        setTimeout(async () => {
          applyingRemote = true;
          await reconcile(nextId);
          applyingRemote = false;
        }, 0);
      }
    });

    const unsubStore = useGameStore.subscribe(() => {
      if (!userId || applyingRemote) return;
      clearTimeout(timer);
      const id = userId;
      timer = setTimeout(() => upload(id), SAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      unsubStore();
      clearTimeout(timer);
    };
  }, []);

  return null;
}
