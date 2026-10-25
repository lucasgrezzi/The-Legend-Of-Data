"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Mission, Track } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { useGate } from "@/hooks/useGate";
import { MISSIONS } from "@/lib/missions";
import { TRACKS, TRACK_ORDER } from "@/lib/tracks";
import { RACES } from "@/lib/races";
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
import MapFog, { useFogReveal } from "./MapFog";
import { BestiaryButton } from "@/components/glossary/Bestiary";
import { equippedLook, SHOP_UNLOCK_MISSION_ID } from "@/lib/shop";

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
const NODES = ITEMS.filter((i): i is Extract<Item, { kind: "node" }> => i.kind === "node");

// ── Neblina: âncora = id da próxima missão (tudo abaixo dela fica encoberto) ou FOG_END se tudo foi concluído ──
const FOG_END = "fim";
const fogOrder = (a: string) => (a === FOG_END ? NODES.length : NODES.findIndex((n) => String(n.mission.id) === a));
function fogTop(a: string): number {
  const last = NODES[NODES.length - 1];
  if (a === FOG_END) return last ? last.y + NODE_H / 2 + 4 : 0;
  const node = NODES[fogOrder(a)];
  return node ? node.y + 46 : 0;
}

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
  const gate = useGate();
  const { profile, setProfile, completedMissionIds, totalXP, coins, xpByMission, equipped } = useGameStore();
  const look = equippedLook(equipped);
  const loggedIn = useAccountStore((s) => s.email !== null);

  const stateOf = (m: Mission): PinState =>
    completedMissionIds.includes(m.id) ? "completed"
    : isMissionUnlocked(m, completedMissionIds, totalXP) ? "available"
    : "locked";
  const nextMission = MISSIONS.find((m) => stateOf(m) === "available");

  // Neblina recua (com animação) quando o jogador avançou desde a última visita ao mapa
  const fogAnchor = nextMission ? String(nextMission.id) : FOG_END;
  const fog = useFogReveal(fogAnchor, fogOrder, gate === "play" && !!profile);
  const mapRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!fog.revealing || !mapRef.current) return;
    // acompanha a neblina recuando: centraliza a próxima missão na tela
    const y = mapRef.current.getBoundingClientRect().top + window.scrollY + fogTop(fogAnchor) - window.innerHeight * 0.5;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, [fog.revealing, fogAnchor]);

  // ── Entrada: conta (sempre primeiro, se o Supabase estiver configurado) → personagem → mapa ──
  if (gate === "loading") {
    return <GateLoading text={loggedIn ? "Carregando seu progresso…" : "Abrindo os portões…"} />;
  }
  if (gate === "login") return <LoginScreen />;
  if (gate === "cloud-error") {
    return (
      <GateShell maxWidth={440} corner={<AccountButton />}>
        <section className="panel text-center" style={{ padding: "24px" }}>
          <p style={{ margin: "0 0 16px", color: "var(--color-error)", fontSize: 14, lineHeight: 1.6 }}>
            Não foi possível carregar seu progresso da nuvem. Verifique sua conexão.
          </p>
          <button type="button" className="btn-next" onClick={() => window.location.reload()}>Tentar de novo</button>
        </section>
      </GateShell>
    );
  }
  // Personagem é criado uma única vez — depois o chip do jogador só abre a ficha (ProfileDialog)
  if (gate === "character" || !profile) {
    return (
      <CharacterCreation
        onConfirm={setProfile}
        showSteps={loggedIn}
        corner={loggedIn ? <AccountButton /> : undefined}
      />
    );
  }

  const completedCount = completedMissionIds.filter((id) => MISSIONS.some((m) => m.id === id)).length;
  const nodes = NODES;
  const shownFogTop = fogTop(fog.shown);

  return (
    <div className="min-h-screen flex flex-col">
      <WorldBackground />

      {/* ── Top bar ── */}
      <header
        className="wood-bar flex items-center justify-between gap-4 px-6 shrink-0 sticky top-0 z-20"
        style={{ height: 68 }}
      >
        <div>
          <p className="gate-logo">DataQuest</p>
          <p style={{ margin: 0, fontSize: 12, color: "#b8a88c" }}>Aprenda Python, SQL e análise de dados jogando um RPG</p>
        </div>
        <div className="flex items-center gap-3">
          <BestiaryButton />
          <Link
            href="/loja"
            className="icon-btn"
            title={completedMissionIds.includes(SHOP_UNLOCK_MISSION_ID) ? "Loja do Mercador: títulos, molduras e mascotes" : "Abre depois do Mercado da Vila"}
          >
            <span style={{ fontSize: 15 }}>🛒</span> Loja
          </Link>
          {supabase && (
            <Link href="/ranking" className="icon-btn" title="Ranking dos jogadores">
              <span style={{ fontSize: 15 }}>🏆</span> Ranking
            </Link>
          )}
          <PlayerChip profile={profile} totalXP={totalXP} coins={coins} />
        </div>
      </header>

      <main className="flex-1 px-4 pt-8 pb-16" style={{ overflowX: "clip" }}>
        <div className="mx-auto flex flex-col gap-8" style={{ maxWidth: CONTENT_W }}>

          {/* ── Painel do jogador ── */}
          <section className="rpg-frame anim-rise flex flex-col gap-5" style={{ padding: "22px 26px" }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="pixel-label" style={{ margin: 0, color: "var(--color-accent)" }}>📜 SUA JORNADA</p>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-muted)" }}>
                  <b style={{ color: "var(--color-text)" }}>{completedCount}</b> de {MISSIONS.length} missões concluídas
                </p>
              </div>
              {nextMission ? (
                <Link href={`/mission/${nextMission.id}`} className="btn-next btn-pixel">
                  ▶ {completedCount === 0 ? "Começar" : "Continuar"}
                </Link>
              ) : (
                <span className="pixel-label" style={{ color: "var(--color-run)" }}>✓ Tudo concluído!</span>
              )}
            </div>
            <XPBar totalXP={totalXP} pixel />
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
          <section ref={mapRef} className="relative anim-rise" style={{ height: MAP_H, ...delay(150) }}>
            {shownFogTop < MAP_H - 40 && (
              <MapFog
                top={shownFogTop}
                mapHeight={MAP_H}
                revealing={fog.revealing}
                title="Terras inexploradas"
                text={nextMission
                  ? <>Uma neblina densa cobre o caminho adiante. Conclua <b style={{ color: "var(--color-text)" }}>{nextMission.missionTitle}</b> para desbravar o que vem depois.</>
                  : "Estas terras ainda não foram mapeadas. Novas missões chegam em breve!"}
              />
            )}
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
                const d = `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
                return (
                  <g key={b.mission.id}>
                    {/* contorno escuro para a trilha ler bem sobre o fundo */}
                    {/* estrada de terra: contorno escuro → chão batido → pegadas douradas (ou pedras soltas, se bloqueada) */}
                    <path d={d} fill="none" stroke="rgba(8,10,14,0.7)" strokeWidth={reached ? 16 : 12}
                      strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <path d={d} fill="none" stroke={reached ? "#9c7a45" : "#3a4050"} strokeWidth={reached ? 11 : 7}
                      strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <path d={d} fill="none" stroke={reached ? "#ffe08a" : "#6b7385"} strokeWidth={reached ? 3 : 3}
                      strokeDasharray={reached ? "4 10" : "1 12"} strokeLinecap={reached ? "butt" : "round"} vectorEffect="non-scaling-stroke"
                      style={reached ? { filter: "drop-shadow(0 0 3px rgba(240,192,64,0.8))" } : undefined} />
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
                    heroSprite={RACES[profile.race].sprite}
                    petSprite={look.pet?.value}
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
                  className={`rpg-frame region-banner${open ? "" : " is-locked"} absolute flex items-center gap-4`}
                  style={{
                    top: item.y,
                    left: 34,
                    right: 34,
                    height: REGION_H - 24,
                    zIndex: 3,
                    padding: "0 22px 0 14px",
                    ...(open ? { "--tint": info.rgb } : {}),
                  } as React.CSSProperties}
                >
                  <span className="banner-tail is-left" aria-hidden />
                  <span className="banner-tail is-right" aria-hidden />
                  <div className="banner-medal">
                    <Sprite src={info.sprite} size={64} alt={info.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)", textShadow: "2px 2px 0 #0b0d13" }}>
                      {info.name.toUpperCase()}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 800, color: open ? "var(--color-text)" : "var(--color-muted)", textShadow: "0 2px 0 #0b0d13" }}>
                      {info.subtitle}
                    </p>
                    {!open && (
                      <p className="truncate" style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
                        🔒 {missions.length === 0 ? "Em breve — novas missões chegando" : `Requer: ${reasons.join(" · ")}`}
                      </p>
                    )}
                  </div>

                  {missions.length > 0 && (
                    <div className="text-right shrink-0" style={{ width: 88 }}>
                      <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)", textShadow: "2px 2px 0 #0b0d13" }}>
                        {done}/{missions.length}
                      </p>
                      <div className="banner-progress" style={{ marginTop: 8 }}>
                        <div style={{ width: `${(done / missions.length) * 100}%`, background: open ? info.color : "#4a5163" }} />
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
