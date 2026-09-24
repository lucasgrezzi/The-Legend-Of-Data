"use client";

import { useState } from "react";
import Link from "next/link";
import type { Mission, Track } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { useHydrated } from "@/hooks/useHydrated";
import { MISSIONS } from "@/lib/missions";
import { TRACKS, TRACK_ORDER } from "@/lib/tracks";
import { isMissionUnlocked, missingRequirements } from "@/lib/xp";
import XPBar from "@/components/ui/XPBar";
import Sprite from "@/components/ui/Sprite";
import WorldBackground from "@/components/ui/WorldBackground";
import CharacterCreation from "@/components/player/CharacterCreation";
import LoginScreen from "@/components/account/LoginScreen";
import GateShell, { delay } from "@/components/ui/GateShell";
import PlayerChip from "@/components/player/PlayerChip";
import AccountButton from "@/components/account/AccountButton";
import { supabase } from "@/lib/supabase";
import { useAccountStore } from "@/store/accountStore";
import MissionPin, { type PinState } from "./MissionPin";

// ── Geometria do mapa (px verticais, % horizontais) ──
const VIEW_W = 100;
const REGION_H = 112;   // banner (88) + respiro (24)
const NODE_H = 128;
const ZIGZAG = [50, 70, 50, 30];

type Item =
  | { kind: "region"; track: Track; y: number }
  | { kind: "node"; mission: Mission; x: number; y: number };

function layout(): { items: Item[]; height: number } {
  const items: Item[] = [];
  let y = 0;
  let n = 0;
  for (const track of TRACK_ORDER) {
    items.push({ kind: "region", track, y });
    y += REGION_H;
    for (const mission of MISSIONS.filter((m) => m.track === track)) {
      items.push({ kind: "node", mission, x: ZIGZAG[n % ZIGZAG.length], y: y + NODE_H / 2 });
      y += NODE_H;
      n++;
    }
    y += 8;
  }
  return { items, height: y };
}

const { items: ITEMS, height: MAP_H } = layout();

function GateLoading({ text }: { text: string }) {
  return (
    <GateShell maxWidth={480}>
      <section className="panel flex items-center justify-center gap-3" style={{ padding: "22px" }}>
        <span className="spinner" aria-hidden />
        <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{text}</span>
      </section>
    </GateShell>
  );
}
const CONTENT_W = 680;

export default function WorldMap() {
  const hydrated = useHydrated();
  const { profile, setProfile, completedMissionIds, totalXP, coins, xpByMission } = useGameStore();
  const [editing, setEditing] = useState(false);
  const accountReady = useAccountStore((s) => s.ready);
  const loggedIn = useAccountStore((s) => s.email !== null);
  const sync = useAccountStore((s) => s.sync);

  if (!hydrated) {
    return <div className="min-h-screen" style={{ background: "var(--color-bg)" }} />;
  }

  // ── Primeira visita: conta (se o Supabase estiver configurado) → personagem ──
  if (!profile && !editing && supabase) {
    if (!accountReady || (loggedIn && sync === "loading")) {
      return <GateLoading text={loggedIn ? "Carregando seu progresso…" : "Abrindo os portões…"} />;
    }
    if (!loggedIn) return <LoginScreen />;
    if (sync === "error") {
      return (
        <GateShell maxWidth={480} corner={<AccountButton />}>
          <section className="panel text-center" style={{ padding: "28px" }}>
            <p style={{ margin: "0 0 16px", color: "var(--color-error)", fontSize: 14, lineHeight: 1.6 }}>
              Não foi possível carregar seu progresso da nuvem. Verifique sua conexão.
            </p>
            <button type="button" className="btn-next" onClick={() => window.location.reload()}>Tentar de novo</button>
          </section>
        </GateShell>
      );
    }
  }

  if (!profile || editing) {
    return (
      <CharacterCreation
        initial={editing ? profile : null}
        onConfirm={(p) => { setProfile(p); setEditing(false); }}
        onCancel={editing ? () => setEditing(false) : undefined}
        showSteps={!editing && loggedIn}
        corner={!editing && loggedIn ? <AccountButton /> : undefined}
      />
    );
  }

  const stateOf = (m: Mission): PinState =>
    completedMissionIds.includes(m.id) ? "completed"
    : isMissionUnlocked(m, completedMissionIds, totalXP) ? "available"
    : "locked";

  const nextMission = MISSIONS.find((m) => stateOf(m) === "available");
  const completedCount = completedMissionIds.filter((id) => MISSIONS.some((m) => m.id === id)).length;
  const nodes = ITEMS.filter((i): i is Extract<Item, { kind: "node" }> => i.kind === "node");

  return (
    <div className="min-h-screen flex flex-col">
      <WorldBackground />

      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between gap-4 px-6 shrink-0 sticky top-0 z-20"
        style={{ background: "rgba(22,27,39,0.94)", borderBottom: "1px solid var(--color-border)", height: 68, backdropFilter: "blur(6px)" }}
      >
        <div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "-0.5px", textShadow: "0 0 30px rgba(240,192,64,0.35)" }}>
            DataQuest
          </span>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>Aprenda Python, SQL e análise de dados jogando um RPG</p>
        </div>
        <div className="flex items-center gap-3">
          {supabase && (
            <Link href="/ranking" className="icon-btn" title="Ranking dos jogadores">
              <span style={{ fontSize: 15 }}>🏆</span> Ranking
            </Link>
          )}
          <AccountButton />
          <PlayerChip profile={profile} totalXP={totalXP} coins={coins} onClick={() => setEditing(true)} />
        </div>
      </header>

      <main className="flex-1 px-4 pt-8 pb-16">
        <div className="mx-auto flex flex-col gap-8" style={{ maxWidth: CONTENT_W }}>

          {/* ── Painel do jogador ── */}
          <section className="panel anim-rise flex flex-col gap-5" style={{ padding: "22px 24px" }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="pixel-chapter" style={{ margin: 0 }}>SUA JORNADA</p>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-muted)" }}>
                  <b style={{ color: "var(--color-text)" }}>{completedCount}</b> de {MISSIONS.length} missões concluídas
                </p>
              </div>
              {nextMission ? (
                <Link href={`/mission/${nextMission.id}`} className="btn-next">
                  ▶ {completedCount === 0 ? "Começar" : "Continuar"}
                </Link>
              ) : (
                <span className="pixel-label" style={{ color: "var(--color-run)" }}>✓ Tudo concluído!</span>
              )}
            </div>
            <XPBar totalXP={totalXP} />
            {nextMission && (
              <p className="flex items-center gap-2" style={{ margin: 0, fontSize: 13, color: "var(--color-muted)" }}>
                Próxima:
                <Sprite src={TRACKS[nextMission.track].sprite} size={32} />
                <span style={{ color: TRACKS[nextMission.track].color, fontWeight: 700 }}>{nextMission.missionTitle}</span>
                <span>— {nextMission.concept}</span>
              </p>
            )}
          </section>

          {/* ── Mapa: trilha contínua passando por todas as regiões ── */}
          <section className="relative anim-rise" style={{ height: MAP_H, ...delay(150) }}>
            <svg
              className="absolute inset-0"
              width="100%"
              height={MAP_H}
              viewBox={`0 0 ${VIEW_W} ${MAP_H}`}
              preserveAspectRatio="none"
              aria-hidden
              style={{ zIndex: 1 }}
            >
              {nodes.slice(1).map((b, i) => {
                const a = nodes[i];
                const midY = (a.y + b.y) / 2;
                const reached = stateOf(b.mission) !== "locked";
                return (
                  <g key={b.mission.id}>
                    {/* contorno escuro para a trilha ler bem sobre o fundo */}
                    <path d={`M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`} fill="none"
                      stroke="rgba(0,0,0,0.55)" strokeWidth={10} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <path d={`M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`} fill="none"
                      stroke={reached ? "#f0c040" : "#6b7385"} strokeWidth={5}
                      strokeDasharray={reached ? undefined : "1 11"} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </g>
                );
              })}
            </svg>

            {ITEMS.map((item) => {
              if (item.kind === "node") {
                const state = stateOf(item.mission);
                return (
                  <MissionPin
                    key={`n${item.mission.id}`}
                    mission={item.mission}
                    state={state}
                    x={item.x}
                    y={item.y}
                    isNext={item.mission.id === nextMission?.id}
                    xpEarned={xpByMission[item.mission.id]}
                    lockReasons={state === "locked" ? missingRequirements(item.mission, completedMissionIds, totalXP, MISSIONS) : []}
                  />
                );
              }

              const info = TRACKS[item.track];
              const missions = MISSIONS.filter((m) => m.track === item.track);
              const done = missions.filter((m) => completedMissionIds.includes(m.id)).length;
              const open = missions.some((m) => stateOf(m) !== "locked");
              const reasons = missions[0] ? missingRequirements(missions[0], completedMissionIds, totalXP, MISSIONS) : [];

              return (
                <div
                  key={`r${item.track}`}
                  className="panel absolute left-0 right-0 flex items-center gap-4"
                  style={{
                    top: item.y,
                    height: REGION_H - 24,
                    zIndex: 3,
                    padding: "0 20px 0 12px",
                    borderRadius: 16,
                    borderColor: open ? `rgba(${info.rgb},0.5)` : undefined,
                    background: open
                      ? `linear-gradient(90deg, rgba(${info.rgb},0.16), rgba(${info.rgb},0.03) 60%), rgba(22,27,39,0.96)`
                      : undefined,
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 68, height: 68, borderRadius: 12,
                      background: "var(--color-bg)",
                      border: `1px solid ${open ? `rgba(${info.rgb},0.45)` : "var(--color-border)"}`,
                      filter: open ? undefined : "grayscale(1)",
                      opacity: open ? 1 : 0.55,
                    }}
                  >
                    <Sprite src={info.sprite} size={64} alt={info.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)" }}>
                      {info.name.toUpperCase()}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800, color: open ? "var(--color-text)" : "var(--color-muted)" }}>
                      {info.subtitle}
                    </p>
                    {!open && (
                      <p className="truncate" style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
                        🔒 {missions.length === 0 ? "Em breve — novas missões chegando" : `Requer: ${reasons.join(" · ")}`}
                      </p>
                    )}
                  </div>

                  {missions.length > 0 && (
                    <div className="text-right shrink-0" style={{ width: 84 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: open ? info.color : "var(--color-muted)" }}>
                        {done}/{missions.length}
                      </p>
                      <div style={{ height: 6, background: "var(--color-border)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(done / missions.length) * 100}%`, background: info.color, borderRadius: 10, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
