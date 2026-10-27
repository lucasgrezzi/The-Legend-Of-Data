"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Mission, RunResult } from "@/types";
import { validateOutput } from "@/lib/validation";
import { MISSIONS, getNeighbors, missionDataFiles, siblingsOf } from "@/lib/missions";
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
import GuidedTour, { missionTourSteps, tourSeen } from "./GuidedTour";
import { BestiaryButton } from "@/components/glossary/Bestiary";
import { Brand } from "@/components/ui/TopBar";
import Icon from "@/components/ui/Icon";
import BattleArena, { type BattleEvent } from "./right/BattleArena";
import { centerOf, coinsFly } from "@/lib/juice";
import { play } from "@/lib/sfx";
import SoundToggle from "@/components/ui/SoundToggle";

/** O tutorial abre sozinho na primeira fase com código (depois, só pelo botão "Como jogar") */
const FIRST_CODE_MISSION_ID = MISSIONS.find((m) => m.validationType !== "narrative")?.id;

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
      <div className="rpg-frame flex flex-col items-center gap-5 text-center" style={{ padding: "32px 32px 28px", maxWidth: 460, width: "100%" }}>
        <Sprite src="/assets/sprites/missao-bloqueada.png" size={96} />
        <div>
          <p className="pixel-title" style={{ margin: 0, color: "var(--color-accent)" }}>Missão Bloqueada</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "8px 0 0" }}>{mission.missionTitle}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: "var(--color-muted)" }}>{mission.concept}</p>
        </div>
        <div className="hint-card text-left w-full">
          <p className="pixel-label" style={{ margin: "0 0 8px", color: "var(--color-muted)" }}>Para desbloquear</p>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 }}>
            {reasons.map((r) => (
              <li key={r} className="flex items-center gap-2"><Icon name="lock" size={15} style={{ color: "var(--color-muted)" }} /> {r}</li>
            ))}
          </ul>
        </div>
        <Link href={`/regiao/${mission.track}`} className="btn-next"><Icon name="arrowLeft" size={16} /> Voltar ao mapa</Link>
      </div>
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
  const [tourOpen, setTourOpen] = useState(false);
  const [battle, setBattle] = useState<BattleEvent | null>(null);
  const battleSeq = useRef(0);
  const fire = useCallback((kind: BattleEvent["kind"]) => setBattle({ kind, seq: ++battleSeq.current }), []);

  // Sem conta ou sem personagem → volta ao mapa (lá ficam o login e a criação de personagem)
  useEffect(() => {
    if (gate !== "loading" && gate !== "play") router.replace("/map");
  }, [gate, router]);

  // Tutorial guiado na primeira fase de código (uma vez por navegador); espera a tela montar
  useEffect(() => {
    if (gate !== "play" || !unlocked || isNarrative || alreadyCompleted) return;
    if (mission.id !== FIRST_CODE_MISSION_ID || tourSeen()) return;
    const t = setTimeout(() => setTourOpen(true), 700);
    return () => clearTimeout(t);
  }, [gate, unlocked, isNarrative, alreadyCompleted, mission.id]);

  // Missão narrativa: concluída ao abrir (só depois de ler o progresso salvo)
  useEffect(() => {
    if (gate === "play" && unlocked && isNarrative && !alreadyCompleted) {
      completeMission(mission.id, mission.xpReward, mission.coinReward);
    }
  }, [gate, unlocked, isNarrative, alreadyCompleted, mission, completeMission]);

  const trackMissions = siblingsOf(mission);
  const trackIndex    = trackMissions.findIndex((m) => m.id === mission.id);
  const trackTotal    = trackMissions.length;

  const { prev, next } = getNeighbors(mission.id);
  const prevId = prev?.id ?? null;
  const nextId = next?.id ?? null;

  const handleRun = useCallback(
    (code: string): Promise<RunResult> =>
      mission.editorLanguage === "sql"
        ? runSQL(
            code,
            missionDataFiles(mission).map((f) => ({ name: f.table ?? "vendas", csv: f.rawCsv }))
          )
        : runCode(code, mission.dataFile?.rawCsv, (mission.extraDataFiles ?? []).map((f) => ({ name: f.filename, csv: f.rawCsv }))),
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
      const show = (r: MissionResult) => setResult(r);
      // Primeiro a batalha (golpe final ou contra-ataque), depois a janela de resultado
      // (o golpe final começa com o golpe especial da raça, ~0,3–0,6 s antes do impacto)
      const delay = alreadyCompleted ? 0 : validation.passed ? 2300 : 650;
      if (!alreadyCompleted) fire(validation.passed ? "victory" : "miss");
      if (firstWin) {
        setTimeout(() => {
          const from = centerOf(document.querySelector(".battle-sprite"));
          const to = centerOf(document.querySelector("[data-coin-target]"));
          let n = 0;
          coinsFly(from, to, 8, () => { if (n++ % 2 === 0) play("coin"); });
        }, 1000);
      }
      setTimeout(() => show({
        passed: validation.passed,
        feedback: validation.feedback,
        xpGained: firstWin ? xp : 0,
        coinsGained: firstWin ? mission.coinReward : 0,
        prevXP,
        penalized: firstWin && solutionRevealed,
        fails: alreadyCompleted || validation.passed ? undefined : fails + 1,
        solutionRevealed,
      }), delay);
    },
    [mission, alreadyCompleted, completeMission, recordFail, fire]
  );

  if (gate !== "play" || !profile) {
    return (
      <FullScreenMessage>
        <span className="spinner" aria-hidden />
        <p className="pixel-label" style={{ margin: 0, color: "var(--color-muted)" }}>Abrindo o pergaminho…</p>
      </FullScreenMessage>
    );
  }

  if (!unlocked) {
    return <LockedMission mission={mission} reasons={missingRequirements(mission, completedMissionIds, totalXP, MISSIONS)} />;
  }

  const track = TRACKS[mission.track];
  const trackDone = trackMissions.filter((m) => completedMissionIds.includes(m.id)).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg)" }} data-shake-root>

      {/* ── Top bar ── */}
      <div className="wood-bar flex items-center justify-between gap-5 px-5 shrink-0 relative z-10" style={{ height: 64 }}>
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Brand />
          <span className="crumb-sep" aria-hidden><Icon name="chevronRight" size={16} /></span>
          {mission.bonus ? (
            <Link href={`/regiao/${mission.track}`} className="region-chip is-secret" title="Voltar ao portal da Masmorra Secreta">
              <Icon name="sparkle" size={16} /> Masmorra Secreta
            </Link>
          ) : (
            <Link
              href={`/regiao/${mission.track}`}
              className="region-chip"
              title={`Voltar para ${track.subtitle}`}
              style={{ color: track.color, ["--tint" as string]: track.rgb }}
            >
              <Sprite src={track.sprite} size={32} style={{ margin: "-4px 0" }} /> {track.name}
            </Link>
          )}
          <span className="crumb-sep" aria-hidden><Icon name="chevronRight" size={16} /></span>
          <span className="truncate" style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>
            {mission.missionTitle}
          </span>
        </div>

        {/* Progresso real da trilha: um segmento por missão */}
        <div className="flex items-center gap-3 shrink-0" title={`${trackDone} de ${trackTotal} fases concluídas nesta região`}>
          <div className="flex items-center gap-[6px]">
            {trackMissions.map((m) => {
              const done = completedMissionIds.includes(m.id);
              const current = m.id === mission.id;
              const canOpen = isMissionUnlocked(m, completedMissionIds, totalXP);
              const seg = (
                <span
                  className={`quest-gem${done ? " is-done" : ""}${current ? " is-current" : ""}${!done && !current && !canOpen ? " is-locked" : ""}`}
                  style={{ ["--gem" as string]: mission.bonus ? "#c9a7ff" : track.color }}
                />
              );
              return canOpen && !current ? (
                <Link key={m.id} href={`/mission/${m.id}`} title={m.missionTitle} className="py-2">{seg}</Link>
              ) : (
                <span key={m.id} title={m.missionTitle} className="py-2">{seg}</span>
              );
            })}
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
            {trackDone}/{trackTotal}
          </span>
        </div>

        {/* Ajuda + Bestiário + personagem */}
        <div className="flex items-center gap-2 shrink-0">
          {!isNarrative && (
            <button type="button" className="icon-btn" onClick={() => setTourOpen(true)} title="Como jogar: ver o tutorial de novo">
              <Icon name="help" /><span className="hidden 2xl:inline">Como jogar</span>
            </button>
          )}
          <SoundToggle />
          <div data-tour="bestiary"><BestiaryButton compact /></div>
          <div data-tour="player">
            <PlayerChip profile={profile} totalXP={totalXP} coins={coins} />
          </div>
        </div>
      </div>

      {/* ── Duas colunas ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Esquerda 55% */}
        <div className="flex flex-col overflow-hidden" style={{ width: "55%" }}>
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
        <div className="mission-tome flex flex-col flex-1 overflow-hidden">
          {isNarrative ? (
            <div className="flex items-center justify-center h-full px-10">
            <div className="rpg-frame flex flex-col items-center gap-6 px-10 py-9 text-center" style={{ maxWidth: 480 }}>
              <div className="flex gap-3" style={{ animation: "float 3s ease-in-out infinite" }}>
                {(["python", "sql", "pandas", "dataviz"] as const).map((t) => (
                  <Sprite key={t} src={TRACKS[t].sprite} size={64} alt={TRACKS[t].name} />
                ))}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-2)", maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
                Esta missão é só história — leia o chamado ao lado. Na próxima, você escreve seu primeiro código, e eu mostro a tela
                passo a passo antes. Nada de pânico.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(["python", "sql", "pandas", "dataviz"] as const).map((t) => (
                  <span key={t} className={`track-badge track-${t}`}>
                    {TRACKS[t].name}
                  </span>
                ))}
              </div>
              {nextId !== null && (
                <Link href={`/mission/${nextId}`} className="btn-next">Começar a jornada <Icon name="arrowRight" size={16} /></Link>
              )}
            </div>
            </div>
          ) : (
            <EditorPanel
              key={mission.id}
              mission={mission}
              pyodideStatus={pyodideStatus}
              onRun={handleRun}
              onSubmit={handleSubmit}
              validated={validated}
              onRunResult={(r) => fire(r.success ? "run-ok" : "run-error")}
              renderArena={(fileTag) => (
                <BattleArena
                  key={mission.id}
                  mission={mission}
                  defeated={alreadyCompleted}
                  event={battle}
                  fails={attempts.fails}
                >
                  {fileTag}
                </BattleArena>
              )}
            />
          )}
        </div>
      </div>

      {tourOpen && (
        <GuidedTour
          steps={missionTourSteps({
            hasBlanks: mission.codeTemplate.includes("___"),
            hasGrimoire: mission.hints.length > 0 || !!mission.solution,
            hasData: !!mission.dataFile,
            language: mission.editorLanguage,
          })}
          onClose={() => setTourOpen(false)}
        />
      )}

      {/* Fase bônus: chega-se pelo portal — a tela abre saindo de um clarão roxo */}
      {mission.bonus && <div className="portal-exit" aria-hidden />}

      <MissionResultDialog
        result={result}
        nextHref={nextId !== null ? `/mission/${nextId}` : null}
        onClose={() => setResult(null)}
      />
    </div>
  );
}
