"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { Mission, Track } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { useGate } from "@/hooks/useGate";
import { MISSIONS, bossOf, isBoss, missionsOfTrack } from "@/lib/missions";
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

// ── Geometria da trilha de uma região (px verticais, % horizontais) ──
const VIEW_W = 100;
const NODE_H = 128;
const ZIGZAG = [50, 70, 50, 30];

type Node = { mission: Mission; x: number; y: number };

/** Posição de cada fase na trilha da região (a primeira fica no meio, as outras em zigue-zague) */
function trailLayout(track: Track): { nodes: Node[]; height: number } {
  const nodes = missionsOfTrack(track).map((mission, n) => ({ mission, x: ZIGZAG[n % ZIGZAG.length], y: 70 + n * NODE_H }));
  const last = nodes[nodes.length - 1];
  return { nodes, height: last ? last.y + NODE_H / 2 + 24 : 0 };
}

// ── Neblina: âncora = id da fase depois da qual tudo fica encoberto, ou FOG_END se nada da região está bloqueado ──
const FOG_END = "fim";

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

/** Estado de cada fase a partir do progresso salvo */
function usePinState() {
  const { completedMissionIds, totalXP } = useGameStore();
  return (m: Mission): PinState =>
    completedMissionIds.includes(m.id) ? "completed"
    : isMissionUnlocked(m, completedMissionIds, totalXP) ? "available"
    : "locked";
}

/**
 * Mapa do jogo. Sem `track`: o Mapa-Múndi, com as regiões numa tela só.
 * Com `track`: a trilha de fases daquela região, terminando no chefe.
 * Nos dois casos, é aqui que ficam a entrada (conta → personagem) e a barra do topo.
 */
export default function WorldMap({ track }: { track?: Track }) {
  const gate = useGate();
  const { profile, setProfile, completedMissionIds, totalXP, coins } = useGameStore();
  const loggedIn = useAccountStore((s) => s.email !== null);

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

  return (
    <div className="min-h-screen flex flex-col">
      <WorldBackground />

      {/* ── Top bar ── */}
      <header
        className="wood-bar flex items-center justify-between gap-4 px-6 shrink-0 sticky top-0 z-20"
        style={{ height: 68 }}
      >
        <Link href="/map" className="no-underline" title="Mapa-Múndi">
          <p className="gate-logo">DataQuest</p>
          <p style={{ margin: 0, fontSize: 12, color: "#b8a88c" }}>Aprenda Python, SQL e análise de dados jogando um RPG</p>
        </Link>
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

      <main className="flex-1 px-4 pt-6 pb-16" style={{ overflowX: "clip" }}>
        {track ? <RegionTrail track={track} /> : <WorldHub />}
      </main>
    </div>
  );
}

// ─────────────────────────────── Mapa-Múndi ───────────────────────────────

/** Onde cada lugar fica no Mapa-Múndi (% da largura, px do topo) — a estrada sobe e desce entre eles */
const HUB_SPOTS = [
  { x: 10, y: 285 }, { x: 30, y: 125 }, { x: 50, y: 285 }, { x: 70, y: 125 }, { x: 90, y: 285 },
];
const HUB_H = 470;
const HUB_W = 1080;

function WorldHub() {
  const { profile, completedMissionIds, totalXP, equipped } = useGameStore();
  const stateOf = usePinState();
  const look = equippedLook(equipped);
  const nextMission = MISSIONS.find((m) => stateOf(m) === "available");
  const completedCount = completedMissionIds.filter((id) => MISSIONS.some((m) => m.id === id)).length;
  // o herói espera na região da próxima fase (ou na última, se tudo foi concluído)
  const heroTrack = nextMission?.track ?? TRACK_ORDER[TRACK_ORDER.length - 1];

  const spots = [...TRACK_ORDER.map((t) => ({ track: t as Track | null })), { track: null }]
    .slice(0, HUB_SPOTS.length)
    .map((s, i) => ({ ...s, ...HUB_SPOTS[i] }));

  const regionOpen = (t: Track) => missionsOfTrack(t).some((m) => stateOf(m) !== "locked");

  return (
    <div className="mx-auto flex flex-col gap-5" style={{ maxWidth: HUB_W }}>
      {/* ── Painel do jogador (compacto: o Mapa-Múndi inteiro cabe numa tela de notebook) ── */}
      <section className="rpg-frame anim-rise flex flex-col gap-4 mx-auto w-full" style={{ padding: "18px 24px", maxWidth: 680 }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="pixel-label" style={{ margin: 0, color: "var(--color-accent)" }}>📜 SUA JORNADA</p>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-muted)" }}>
              <b style={{ color: "var(--color-text)" }}>{completedCount}</b> de {MISSIONS.length} missões concluídas
            </p>
          </div>
          {nextMission ? (
            <Link href={`/mission/${nextMission.id}`} className="btn-next btn-pixel" title={`Próxima: ${nextMission.missionTitle}`}>
              ▶ {completedCount === 0 ? "Começar" : "Continuar"}
            </Link>
          ) : (
            <span className="pixel-label" style={{ color: "var(--color-run)" }}>✓ Tudo concluído!</span>
          )}
        </div>
        <XPBar totalXP={totalXP} pixel />
      </section>

      {/* ── O reino: uma região em cada lugar, ligadas por uma estrada ── */}
      <section className="hub-world rpg-frame anim-rise" style={{ height: HUB_H, ...delay(150) }}>
        <p className="hub-title pixel-label">🗺 MAPA-MÚNDI · escolha uma região</p>
        <svg className="absolute inset-0" width="100%" height={HUB_H} viewBox={`0 0 ${VIEW_W} ${HUB_H}`} preserveAspectRatio="none" aria-hidden style={{ zIndex: 1 }}>
          {spots.slice(1).map((b, i) => {
            const a = spots[i];
            const reached = b.track ? regionOpen(b.track) : false;
            const midX = (a.x + b.x) / 2;
            const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(8,10,14,0.7)" strokeWidth={reached ? 16 : 12} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke={reached ? "#9c7a45" : "#3a4050"} strokeWidth={reached ? 11 : 7} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke={reached ? "#ffe08a" : "#6b7385"} strokeWidth={3}
                  strokeDasharray={reached ? "4 10" : "1 12"} strokeLinecap={reached ? "butt" : "round"} vectorEffect="non-scaling-stroke"
                  style={reached ? { filter: "drop-shadow(0 0 3px rgba(240,192,64,0.8))" } : undefined} />
              </g>
            );
          })}
        </svg>

        {spots.map((s, i) => {
          if (!s.track) {
            return (
              <div key="breve" className="hub-place is-soon" style={{ left: `${s.x}%`, top: s.y }}>
                <div className="hub-medal"><Sprite src="/assets/sprites/missao-bloqueada.png" size={64} /></div>
                <div className="hub-card">
                  <p className="pixel-label" style={{ margin: 0, color: "var(--color-muted)" }}>???</p>
                  <p className="hub-name">Terras inexploradas</p>
                  <p className="hub-line">Novas regiões em breve</p>
                </div>
              </div>
            );
          }
          const t = s.track;
          const info = TRACKS[t];
          const list = missionsOfTrack(t);
          const done = list.filter((m) => completedMissionIds.includes(m.id)).length;
          const open = regionOpen(t);
          const boss = bossOf(t);
          const bossDown = boss ? completedMissionIds.includes(boss.id) : false;
          const reasons = list[0] ? missingRequirements(list[0], completedMissionIds, totalXP, MISSIONS) : [];
          const hereHero = t === heroTrack;

          const place = (
            <div
              className={`hub-place${open ? "" : " is-locked"}${hereHero ? " is-here" : ""}`}
              style={{ left: `${s.x}%`, top: s.y, "--tint": info.rgb } as React.CSSProperties}
              title={open ? `Entrar em ${info.subtitle}` : `Bloqueada — ${reasons.join("; ")}`}
            >
              {hereHero && <span className="next-flag hub-flag">▼ VOCÊ ESTÁ AQUI</span>}
              {hereHero && (
                <div className="hub-hero">
                  <Sprite src={RACES[profile!.race].sprite} size={64} />
                  {look.pet && <span className="map-pet"><Sprite src={look.pet.value} size={32} /></span>}
                </div>
              )}
              <div className="hub-medal"><Sprite src={info.sprite} size={72} alt={info.name} /></div>
              <div className="hub-card">
                <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)" }}>
                  {i + 1}. {info.name.toUpperCase()}
                </p>
                <p className="hub-name">{info.subtitle}</p>
                {open ? (
                  <>
                    <div className="banner-progress" style={{ margin: "6px 0 4px" }}>
                      <div style={{ width: `${(done / list.length) * 100}%`, background: info.color }} />
                    </div>
                    <p className="hub-line">{done}/{list.length} fases</p>
                    {boss && (
                      <p className="hub-line" style={{ color: bossDown ? "#7ee08a" : "#ff9b8a" }}>
                        {bossDown ? "✓ Chefe derrotado" : `👑 Chefe: ${boss.missionTitle}`}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="hub-line">🔒 {reasons.length ? `Vença o chefe anterior` : "Em breve"}</p>
                )}
              </div>
            </div>
          );
          return open ? <Link key={t} href={`/regiao/${t}`} aria-label={info.subtitle}>{place}</Link> : <div key={t}>{place}</div>;
        })}
      </section>
    </div>
  );
}

// ─────────────────────────────── Trilha de uma região ───────────────────────────────

const CONTENT_W = 680;

function RegionTrail({ track }: { track: Track }) {
  const { profile, completedMissionIds, totalXP, xpByMission, equipped } = useGameStore();
  const stateOf = usePinState();
  const look = equippedLook(equipped);
  const info = TRACKS[track];
  const { nodes, height: MAP_H } = useMemo(() => trailLayout(track), [track]);
  const list = nodes.map((n) => n.mission);
  const done = list.filter((m) => completedMissionIds.includes(m.id)).length;
  const open = list.some((m) => stateOf(m) !== "locked");
  const reasons = list[0] ? missingRequirements(list[0], completedMissionIds, totalXP, MISSIONS) : [];
  const nextMission = MISSIONS.find((m) => stateOf(m) === "available");
  const nextHere = nextMission?.track === track ? nextMission : undefined;
  const boss = bossOf(track);
  const bossDown = boss ? completedMissionIds.includes(boss.id) : false;
  const nextTrack = TRACK_ORDER[TRACK_ORDER.indexOf(track) + 1];

  // A neblina começa depois da última fase NÃO bloqueada da região: quem já avançou e ganhou uma fase nova
  // lá atrás continua vendo as fases que concluiu. Para quem joga em ordem, é a mesma fase que a próxima.
  const frontier = [...list].reverse().find((m) => stateOf(m) !== "locked");
  const fogAnchor = frontier && stateOf(frontier) === "available" && frontier.id !== list[list.length - 1]?.id
    ? String(frontier.id) : FOG_END;
  const fogOrder = useMemo(
    () => (a: string) => (a === FOG_END ? nodes.length : nodes.findIndex((n) => String(n.mission.id) === a)),
    [nodes],
  );
  const fogTop = (a: string) => {
    if (a === FOG_END) return MAP_H;
    const node = nodes[fogOrder(a)];
    return node ? node.y + 46 : 0;
  };
  const fog = useFogReveal(fogAnchor, fogOrder, open);
  const mapRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!fog.revealing || !mapRef.current) return;
    // acompanha a neblina recuando: centraliza a próxima missão na tela
    const y = mapRef.current.getBoundingClientRect().top + window.scrollY + fogTop(fogAnchor) - window.innerHeight * 0.5;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fog.revealing, fogAnchor]);
  const shownFogTop = open ? fogTop(fog.shown) : 0;

  return (
    <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: CONTENT_W }}>
      <div className="flex items-center justify-between gap-3 anim-rise">
        <Link href="/map" className="btn-nav btn-pixel is-compact">← Mapa-Múndi</Link>
        {nextHere && (
          <Link href={`/mission/${nextHere.id}`} className="btn-next btn-pixel is-compact">▶ Continuar</Link>
        )}
      </div>

      {/* ── Estandarte da região ── */}
      <div
        className={`rpg-frame region-banner${open ? "" : " is-locked"} flex items-center gap-4 anim-rise`}
        style={{ height: 88, margin: "0 34px", padding: "0 22px 0 14px", ...(open ? { "--tint": info.rgb } : {}) } as React.CSSProperties}
      >
        <span className="banner-tail is-left" aria-hidden />
        <span className="banner-tail is-right" aria-hidden />
        <div className="banner-medal"><Sprite src={info.sprite} size={64} alt={info.name} /></div>
        <div className="flex-1 min-w-0">
          <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)", textShadow: "2px 2px 0 #0b0d13" }}>
            {info.name.toUpperCase()}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 800, color: open ? "var(--color-text)" : "var(--color-muted)", textShadow: "0 2px 0 #0b0d13" }}>
            {info.subtitle}
          </p>
          {!open && (
            <p className="truncate" style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
              🔒 Requer: {reasons.join(" · ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0" style={{ width: 88 }}>
          <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)", textShadow: "2px 2px 0 #0b0d13" }}>
            {done}/{list.length}
          </p>
          <div className="banner-progress" style={{ marginTop: 8 }}>
            <div style={{ width: `${(done / Math.max(1, list.length)) * 100}%`, background: open ? info.color : "#4a5163" }} />
          </div>
        </div>
      </div>

      {/* ── Trilha: as fases da região, terminando no chefe ── */}
      <section ref={mapRef} className="relative anim-rise" style={{ height: MAP_H, ...delay(150) }}>
        {shownFogTop < MAP_H - 40 && (
          <MapFog
            top={shownFogTop}
            mapHeight={MAP_H}
            revealing={fog.revealing}
            title={open ? "Terras inexploradas" : "Região bloqueada"}
            text={open && nextHere
              ? <>Uma neblina densa cobre o caminho adiante. Conclua <b style={{ color: "var(--color-text)" }}>{nextHere.missionTitle}</b> para desbravar o que vem depois.</>
              : <>Vença o chefe da região anterior para entrar aqui.</>}
          />
        )}
        <svg className="absolute inset-0" width="100%" height={MAP_H} viewBox={`0 0 ${VIEW_W} ${MAP_H}`} preserveAspectRatio="none" aria-hidden style={{ zIndex: 1 }}>
          {nodes.slice(1).map((b, i) => {
            const a = nodes[i];
            const midY = (a.y + b.y) / 2;
            const reached = stateOf(b.mission) !== "locked";
            const d = `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
            return (
              <g key={b.mission.id}>
                {/* estrada de terra: contorno escuro → chão batido → pegadas douradas (ou pedras soltas, se bloqueada) */}
                <path d={d} fill="none" stroke="rgba(8,10,14,0.7)" strokeWidth={reached ? 16 : 12}
                  strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke={reached ? "#9c7a45" : "#3a4050"} strokeWidth={reached ? 11 : 7}
                  strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke={reached ? "#ffe08a" : "#6b7385"} strokeWidth={3}
                  strokeDasharray={reached ? "4 10" : "1 12"} strokeLinecap={reached ? "butt" : "round"} vectorEffect="non-scaling-stroke"
                  style={reached ? { filter: "drop-shadow(0 0 3px rgba(240,192,64,0.8))" } : undefined} />
              </g>
            );
          })}
        </svg>

        {nodes.map((n) => {
          const state = stateOf(n.mission);
          return (
            <MissionPin
              key={n.mission.id}
              mission={n.mission}
              state={state}
              x={n.x}
              y={n.y}
              isBoss={isBoss(n.mission)}
              isNext={n.mission.id === nextHere?.id}
              xpEarned={xpByMission[n.mission.id]}
              heroSprite={RACES[profile!.race].sprite}
              petSprite={look.pet?.value}
              lockReasons={state === "locked" ? missingRequirements(n.mission, completedMissionIds, totalXP, MISSIONS) : []}
            />
          );
        })}
      </section>

      {/* ── Fim da região: depois do chefe, a viagem continua ── */}
      {bossDown && (
        <div className="rpg-frame anim-rise flex items-center justify-between gap-4" style={{ padding: "16px 22px" }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            <b style={{ color: "#7ee08a" }}>✓ Chefe derrotado!</b>{" "}
            {nextTrack ? `A estrada segue para ${TRACKS[nextTrack].subtitle}.` : "Novas regiões chegam em breve."}
          </p>
          {nextTrack ? (
            <Link href={`/regiao/${nextTrack}`} className="btn-next btn-pixel is-compact">Próxima região →</Link>
          ) : (
            <Link href="/map" className="btn-nav btn-pixel is-compact">Mapa-Múndi</Link>
          )}
        </div>
      )}
    </div>
  );
}
