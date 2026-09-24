"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Mission, RunResult } from "@/types";
import { validateOutput } from "@/lib/validation";
import { MISSIONS, getNeighbors } from "@/lib/missions";
import { TRACKS } from "@/lib/tracks";
import { isMissionUnlocked, missingRequirements, solutionXP } from "@/lib/xp";
import { getAttempts, useGameStore } from "@/store/gameStore";
import { usePyodide } from "@/hooks/usePyodide";
import { useDuckDB } from "@/hooks/useDuckDB";
import { useGate } from "@/hooks/useGate";
import MissionPanel from "./left/MissionPanel";
import EditorPanel from "./right/EditorPanel";
import MissionResultDialog, { type MissionResult } from "@/components/ui/MissionResultDialog";
import Link from "next/link";
import Sprite from "@/components/ui/Sprite";
import PlayerChip from "@/components/player/PlayerChip";

interface MissionScreenProps {
  mission: Mission;
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 px-6 text-center" style={{ background: "var(--color-bg)" }}>
      {children}
    </div>
  );
}

function LockedMission({ mission, reasons }: { mission: Mission; reasons: string[] }) {
  return (
    <FullScreenMessage>
      <Sprite src="/assets/sprites/missao-bloqueada.png" size={96} />
      <p className="pixel-title" style={{ color: "var(--color-accent)" }}>Missão Bloqueada</p>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{mission.missionTitle}</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-muted)" }}>{mission.concept}</p>
      </div>
      <div
        className="text-left px-5 py-4"
        style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", borderRadius: 12, maxWidth: 440, width: "100%" }}
      >
        <p className="pixel-label mb-3" style={{ color: "var(--color-muted)" }}>Para desbloquear:</p>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
          {reasons.map((r) => (
            <li key={r}><span style={{ fontFamily: "var(--font-body)" }}>🔒</span> {r}</li>
          ))}
        </ul>
      </div>
      <Link href="/map" className="btn-next">⬡ Voltar ao Mapa</Link>
    </FullScreenMessage>
  );
}

export default function MissionScreen({ mission }: MissionScreenProps) {
  const gate = useGate();
  const router = useRouter();
  const { profile, totalXP, coins, completeMission, completedMissionIds, recordFail, buyHint, revealSolution } = useGameStore();
  const attempts = useGameStore((s) => getAttempts(s, mission.id));
  const { status: pyodideStatus, runCode } = usePyodide();
  const { runSQL } = useDuckDB();

  const unlocked = isMissionUnlocked(mission, completedMissionIds, totalXP);
  const alreadyCompleted = completedMissionIds.includes(mission.id);
  const isNarrative = mission.validationType === "narrative";
  const validated = alreadyCompleted || isNarrative;
  const [result, setResult] = useState<MissionResult | null>(null);

  // Sem conta ou sem personagem → volta ao mapa (lá ficam o login e a criação de personagem)
  useEffect(() => {
    if (gate !== "loading" && gate !== "play") router.replace("/map");
  }, [gate, router]);

  // Missão narrativa: concluída ao abrir (só depois de ler o progresso salvo)
  useEffect(() => {
    if (gate === "play" && unlocked && isNarrative && !alreadyCompleted) {
      completeMission(mission.id, mission.xpReward, mission.coinReward);
    }
  }, [gate, unlocked, isNarrative, alreadyCompleted, mission, completeMission]);

  const trackMissions = MISSIONS.filter((m) => m.track === mission.track);
  const trackIndex    = trackMissions.findIndex((m) => m.id === mission.id);
  const trackTotal    = trackMissions.length;

  const { prev, next } = getNeighbors(mission.id);
  const prevId = prev?.id ?? null;
  const nextId = next?.id ?? null;

  const handleRun = useCallback(
    (code: string): Promise<RunResult> =>
      mission.editorLanguage === "sql"
        ? runSQL(code, mission.dataFile?.rawCsv)
        : runCode(code, mission.dataFile?.rawCsv),
    [mission, runCode, runSQL]
  );

  const handleSubmit = useCallback(
    (run: RunResult, code: string) => {
      const validation = validateOutput(run, mission, code);
      const state = useGameStore.getState();
      const prevXP = state.totalXP;
      const { fails, solutionRevealed } = getAttempts(state, mission.id);
      const xp = solutionRevealed ? solutionXP(validation.xpEarned) : validation.xpEarned;
      const firstWin = validation.passed && !alreadyCompleted;

      if (!alreadyCompleted) {
        if (validation.passed) completeMission(mission.id, xp, mission.coinReward);
        else recordFail(mission.id);
      }
      setResult({
        passed: validation.passed,
        feedback: validation.feedback,
        xpGained: firstWin ? xp : 0,
        coinsGained: firstWin ? mission.coinReward : 0,
        prevXP,
        penalized: firstWin && solutionRevealed,
        fails: alreadyCompleted || validation.passed ? undefined : fails + 1,
        solutionRevealed,
      });
    },
    [mission, alreadyCompleted, completeMission, recordFail]
  );

  if (gate !== "play" || !profile) {
    return (
      <FullScreenMessage>
        <p className="pixel-label" style={{ color: "var(--color-muted)", animation: "blink 1.2s step-end infinite" }}>
          Abrindo o pergaminho…
        </p>
      </FullScreenMessage>
    );
  }

  if (!unlocked) {
    return <LockedMission mission={mission} reasons={missingRequirements(mission, completedMissionIds, totalXP, MISSIONS)} />;
  }

  const track = TRACKS[mission.track];
  const trackDone = trackMissions.filter((m) => completedMissionIds.includes(m.id)).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between gap-6 px-6 shrink-0"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", height: 64 }}
      >
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/map"
            className="no-underline shrink-0"
            title="Voltar ao mapa"
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: "var(--color-accent)",
              letterSpacing: "-0.5px",
              textShadow: "0 0 20px rgba(240,192,64,0.3)",
            }}
          >
            DataQuest
          </Link>
          <span style={{ color: "var(--color-border)", fontSize: 18 }}>/</span>
          <Link href="/map" className="flex items-center gap-2 shrink-0" style={{ color: track.color, fontSize: 14, fontWeight: 700 }}>
            <Sprite src={track.sprite} size={32} /> {track.name}
          </Link>
          <span style={{ color: "var(--color-border)", fontSize: 18 }}>/</span>
          <span className="truncate" style={{ color: "var(--color-muted)", fontSize: 14 }}>
            {mission.missionTitle}
          </span>
        </div>

        {/* Progresso real da trilha: um segmento por missão */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {trackMissions.map((m) => {
              const done = completedMissionIds.includes(m.id);
              const current = m.id === mission.id;
              const canOpen = isMissionUnlocked(m, completedMissionIds, totalXP);
              const seg = (
                <span
                  style={{
                    display: "block",
                    width: 34,
                    height: 10,
                    borderRadius: 6,
                    background: done ? track.color : "var(--color-border)",
                    boxShadow: current ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${track.color}` : undefined,
                    opacity: done || current || canOpen ? 1 : 0.5,
                  }}
                />
              );
              return canOpen && !current ? (
                <Link key={m.id} href={`/mission/${m.id}`} title={m.missionTitle}>{seg}</Link>
              ) : (
                <span key={m.id} title={m.missionTitle}>{seg}</span>
              );
            })}
          </div>
          <span style={{ fontSize: 12, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
            {trackDone}/{trackTotal} concluídas
          </span>
        </div>

        {/* Personagem + XP */}
        <div className="shrink-0">
          <PlayerChip profile={profile} totalXP={totalXP} coins={coins} />
        </div>
      </div>

      {/* ── Duas colunas ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Esquerda 55% */}
        <div className="flex flex-col overflow-hidden" style={{ width: "55%", borderRight: "1px solid var(--color-border)" }}>
          <MissionPanel
            key={mission.id}
            mission={mission}
            trackIndex={trackIndex}
            trackTotal={trackTotal}
            validated={validated}
            prevId={prevId}
            nextId={nextId}
            fails={attempts.fails}
            hintsBought={attempts.hintsBought}
            solutionRevealed={attempts.solutionRevealed}
            coins={coins}
            onBuyHint={(cost) => buyHint(mission.id, cost)}
            onRevealSolution={() => revealSolution(mission.id)}
          />
        </div>

        {/* Direita 45% */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "var(--color-surface)" }}>
          {isNarrative ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-10 text-center">
              <div className="flex gap-3" style={{ animation: "float 3s ease-in-out infinite" }}>
                {(["python", "sql", "pandas", "dataviz"] as const).map((t) => (
                  <Sprite key={t} src={TRACKS[t].sprite} size={64} alt={TRACKS[t].name} />
                ))}
              </div>
              <p style={{ fontSize: 15, color: "var(--color-muted)", maxWidth: 360, lineHeight: 1.8, margin: 0 }}>
                Esta missão é só história — leia o chamado ao lado. A partir da próxima, você escreverá código aqui.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(["python", "sql", "pandas", "dataviz"] as const).map((t) => (
                  <span key={t} className={`track-badge track-${t}`}>
                    {TRACKS[t].name}
                  </span>
                ))}
              </div>
              {nextId !== null && (
                <Link href={`/mission/${nextId}`} className="btn-next">Começar a jornada →</Link>
              )}
            </div>
          ) : (
            <EditorPanel
              key={mission.id}
              mission={mission}
              pyodideStatus={pyodideStatus}
              onRun={handleRun}
              onSubmit={handleSubmit}
              validated={validated}
            />
          )}
        </div>
      </div>

      <MissionResultDialog
        result={result}
        nextHref={nextId !== null ? `/mission/${nextId}` : null}
        onClose={() => setResult(null)}
      />
    </div>
  );
}
