"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MISSIONS, getMission } from "@/lib/missions";
import { TEST_MODE } from "@/lib/testMode";
import { useGameStore } from "@/store/gameStore";

const TRACK_ICON: Record<string, string> = { python: "🐍", sql: "🗄", pandas: "🐼", dataviz: "📊" };

/**
 * Painel do Modo Teste (`npm run teste`): pular para qualquer fase, ver a solução da fase aberta
 * e mexer no progresso. Não existe no site publicado (TEST_MODE é sempre false em produção).
 */
export default function TestPanel() {
  const [open, setOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const pathname = usePathname();
  const completed = useGameStore((s) => s.completedMissionIds);
  if (!TEST_MODE) return null;

  const currentId = /^\/mission\/(\d+)/.exec(pathname ?? "")?.[1];
  const current = currentId !== undefined ? getMission(Number(currentId)) : undefined;

  const completeAll = () => {
    const { completeMission } = useGameStore.getState();
    for (const m of MISSIONS) completeMission(m.id, m.xpReward, m.coinReward);
  };
  const resetKeepingHero = () => {
    const { profile, resetProgress, setProfile } = useGameStore.getState();
    resetProgress();
    if (profile) setProfile(profile);
    try { localStorage.removeItem("dataquest-tour-seen"); } catch { /* sem localStorage: tudo bem */ }
  };
  const addCoins = () => useGameStore.setState((s) => ({ coins: s.coins + 100 }));

  return (
    <div className="test-panel">
      {open && (
        <div className="test-panel-box panel rpg-frame">
          <p className="pixel-label" style={{ margin: 0, color: "var(--color-accent)" }}>🧪 Modo Teste</p>
          <p className="test-panel-note">
            Só no seu computador: todas as fases abertas, sem login e nada vai para a nuvem ou o ranking.
          </p>

          {current && current.solution && (
            <div className="test-panel-solution">
              <button type="button" className="test-btn" onClick={() => setShowSolution((v) => !v)}>
                {showSolution ? "Esconder" : "Ver"} a solução desta fase
              </button>
              {showSolution && <pre>{current.solution}</pre>}
            </div>
          )}

          <div className="test-panel-list">
            {MISSIONS.map((m) => (
              <Link
                key={m.id}
                href={`/mission/${m.id}`}
                className={`test-panel-item ${current?.id === m.id ? "is-current" : ""}`}
                onClick={() => setShowSolution(false)}
              >
                <span>{TRACK_ICON[m.track] ?? "•"}</span>
                <span className="test-panel-title">{m.missionTitle}</span>
                <span className="test-panel-id">#{m.id}{completed.includes(m.id) ? " ✓" : ""}</span>
              </Link>
            ))}
          </div>

          <div className="test-panel-actions">
            <button type="button" className="test-btn" onClick={addCoins}>+100 moedas</button>
            <button type="button" className="test-btn" onClick={completeAll}>Concluir todas</button>
            <button type="button" className="test-btn" onClick={resetKeepingHero}>Zerar progresso</button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="test-panel-toggle"
        onClick={() => setOpen((v) => !v)}
        title="Modo Teste"
        aria-label={open ? "Fechar o Modo Teste" : "Abrir o Modo Teste"}
      >
        {open ? "✕" : "🧪"}
      </button>
    </div>
  );
}
