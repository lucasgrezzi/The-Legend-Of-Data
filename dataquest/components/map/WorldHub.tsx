"use client";

import Link from "next/link";
import type { Mission, Track } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { MISSIONS, bossOf, isBoss, missionsOfTrack } from "@/lib/missions";
import { TRACKS, TRACK_ORDER } from "@/lib/tracks";
import { RACES } from "@/lib/races";
import { isMissionUnlocked, missingRequirements } from "@/lib/xp";
import { monsterOf } from "@/lib/monsters";
import { equippedLook } from "@/lib/shop";
import XPBar from "@/components/ui/XPBar";
import Sprite from "@/components/ui/Sprite";
import Icon from "@/components/ui/Icon";
import { delay } from "@/components/ui/GateShell";
import HeroPortrait from "@/components/player/HeroPortrait";
import MonsterSprite from "@/components/ui/MonsterSprite";
import type { PinState } from "./MissionPin";

/** Estado de cada fase a partir do progresso salvo */
export function usePinState() {
  const { completedMissionIds, totalXP } = useGameStore();
  return (m: Mission): PinState =>
    completedMissionIds.includes(m.id) ? "completed"
    : isMissionUnlocked(m, completedMissionIds, totalXP) ? "available"
    : "locked";
}

/** Onde cada lugar fica no Mapa-Múndi (% da largura, px do topo) — a estrada sobe e desce entre eles */
const HUB_SPOTS = [
  { x: 13, y: 300 }, { x: 31.5, y: 156 }, { x: 50, y: 300 }, { x: 68.5, y: 156 }, { x: 87, y: 300 },
];
const HUB_H = 510;
const HUB_W = 1120;

/**
 * Mapa-Múndi: a ficha do herói e a próxima batalha no topo; embaixo, o reino com uma região por lugar —
 * cada uma com o chefe de guarda ao lado, uma estrela por fase e a estrada até a seguinte.
 */
export default function WorldHub() {
  const { profile, completedMissionIds, totalXP, coins, equipped } = useGameStore();
  const stateOf = usePinState();
  const look = equippedLook(equipped);
  const nextMission = MISSIONS.find((m) => stateOf(m) === "available");
  const completedCount = completedMissionIds.filter((id) => MISSIONS.some((m) => m.id === id)).length;
  const race = RACES[profile!.race];
  // o herói espera na região da próxima fase (ou na última, se tudo foi concluído)
  const heroTrack = nextMission?.track ?? TRACK_ORDER[TRACK_ORDER.length - 1];
  const foe = nextMission && nextMission.validationType !== "narrative" ? monsterOf(nextMission.id) : null;
  const bossesDown = TRACK_ORDER.filter((t) => {
    const b = bossOf(t);
    return b && completedMissionIds.includes(b.id);
  }).length;

  const spots = [...TRACK_ORDER.map((t) => ({ track: t as Track | null })), { track: null }]
    .slice(0, HUB_SPOTS.length)
    .map((s, i) => ({ ...s, ...HUB_SPOTS[i] }));

  const regionOpen = (t: Track) => missionsOfTrack(t).some((m) => stateOf(m) !== "locked");

  return (
    <div className="mx-auto flex flex-col gap-4" style={{ maxWidth: HUB_W }}>
      {/* ── HUD: ficha do herói + próxima batalha ── */}
      <div className="hub-hud anim-rise">
        <section className="hud-card hud-hero">
          <HeroPortrait race={profile!.race} box={72} sprite={64} frame={look.frame} radius={14} />
          <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 8 }}>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="hud-name truncate">{profile!.name}</span>
              <span className="hud-sub truncate">{look.title ?? race.name} · {race.guild}</span>
            </div>
            <XPBar totalXP={totalXP} pixel />
          </div>
          <div className="hud-stats">
            <span title="Moedas">
              <Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-8px -4px -8px -6px" }} />
              <b>{coins}</b>
            </span>
            <span title="Fases concluídas">
              <Icon name="star" size={16} style={{ color: "var(--color-accent)" }} />
              <b>{completedCount}</b><i>/{MISSIONS.length}</i>
            </span>
            <span title="Chefes derrotados">
              <Icon name="crown" size={16} style={{ color: "#ff8a80" }} />
              <b>{bossesDown}</b><i>/{TRACK_ORDER.length}</i>
            </span>
          </div>
        </section>

        {nextMission ? (
          <Link
            href={`/mission/${nextMission.id}`}
            className={`hud-card hud-next${isBoss(nextMission) ? " is-boss" : ""}`}
            title={`Próxima: ${nextMission.missionTitle}`}
            style={{ "--tint": TRACKS[nextMission.track].rgb } as React.CSSProperties}
          >
            <div className="hud-foe">
              {foe
                ? <MonsterSprite monster={foe} size={64} boss={isBoss(nextMission)} />
                : <Sprite src={TRACKS[nextMission.track].sprite} size={64} alt="" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="hud-kicker">{foe ? (isBoss(nextMission) ? "Chefe à frente!" : "Próxima batalha") : "Sua jornada começa"}</p>
              <p className="hud-foe-name truncate">{foe ? foe.name : nextMission.missionTitle}</p>
              <p className="hud-sub truncate">{foe ? `${nextMission.missionTitle} · ` : ""}{nextMission.concept}</p>
            </div>
            <span className="btn-next btn-pixel is-compact shrink-0">
              <Icon name={foe ? "swords" : "play"} size={16} /> {foe ? "Batalhar" : "Começar"}
            </span>
          </Link>
        ) : (
          <div className="hud-card hud-next">
            <div className="hud-foe"><Sprite src="/assets/sprites/missao-concluida.png" size={64} alt="" /></div>
            <div className="flex-1 min-w-0">
              <p className="hud-kicker">Lenda dos Dados</p>
              <p className="hud-foe-name">Todas as regiões libertadas!</p>
            </div>
          </div>
        )}
      </div>

      {/* ── O reino: uma região em cada lugar, ligadas por uma estrada ── */}
      <section className="hub-world anim-rise" style={{ height: HUB_H, ...delay(120) }}>
        <div className="hub-clouds" aria-hidden>
          <img src="/assets/fog/nuvem-1.png" alt="" style={{ top: 70, animationDuration: "70s" }} />
          <img src="/assets/fog/nuvem-2.png" alt="" style={{ top: 250, animationDuration: "95s", animationDelay: "-40s" }} />
          <img src="/assets/fog/nuvem-3.png" alt="" style={{ top: 440, animationDuration: "82s", animationDelay: "-20s" }} />
        </div>
        <p className="hub-title"><span className="hub-ribbon"><Icon name="map" size={14} /> Mapa-Múndi</span></p>

        <svg className="absolute inset-0" width="100%" height={HUB_H} viewBox={`0 0 100 ${HUB_H}`} preserveAspectRatio="none" aria-hidden style={{ zIndex: 1 }}>
          {spots.slice(1).map((b, i) => {
            const a = spots[i];
            const reached = b.track ? regionOpen(b.track) : false;
            const midX = (a.x + b.x) / 2;
            const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(8,10,14,0.75)" strokeWidth={reached ? 18 : 12} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke={reached ? "#9c7a45" : "#3a4050"} strokeWidth={reached ? 12 : 7} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path
                  d={d} fill="none" stroke={reached ? "#ffe08a" : "#6b7385"} strokeWidth={3}
                  className={reached ? "road-march" : undefined}
                  strokeDasharray={reached ? "4 10" : "1 12"} strokeLinecap={reached ? "butt" : "round"} vectorEffect="non-scaling-stroke"
                  style={reached ? { filter: "drop-shadow(0 0 3px rgba(240,192,64,0.8))" } : undefined}
                />
              </g>
            );
          })}
        </svg>

        {spots.map((s, i) => {
          if (!s.track) {
            return (
              <div key="breve" className="hub-place is-soon" style={{ left: `${s.x}%`, top: s.y }}>
                <div className="hub-place-in anim-rise" style={delay(250 + i * 90)}>
                  <div className="hub-medal"><Sprite src="/assets/sprites/missao-bloqueada.png" size={64} /></div>
                  <div className="hub-stars" />
                  <div className="hub-card">
                    <p className="pixel-label" style={{ margin: 0, color: "var(--color-muted)" }}>???</p>
                    <p className="hub-name">Terras inexploradas</p>
                    <p className="hub-line">Novas regiões em breve</p>
                  </div>
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
          const bossFoe = boss ? monsterOf(boss.id) : null;
          const reasons = list[0] ? missingRequirements(list[0], completedMissionIds, totalXP, MISSIONS) : [];
          const hereHero = t === heroTrack;

          const place = (
            <div
              className={`hub-place${open ? "" : " is-locked"}${hereHero ? " is-here" : ""}${bossDown ? " is-cleared" : ""}`}
              style={{ left: `${s.x}%`, top: s.y, "--tint": info.rgb } as React.CSSProperties}
              title={open ? `Entrar em ${info.subtitle}` : `Bloqueada — ${reasons.join("; ")}`}
            >
              <div className="hub-place-in anim-rise" style={delay(250 + i * 90)}>
                <span className="hub-glow" aria-hidden />
                {hereHero && <span className="next-flag hub-flag"><Icon name="mapPin" size={12} /> VOCÊ ESTÁ AQUI</span>}
                {hereHero && (
                  <div className="hub-hero">
                    <Sprite src={race.sprite} size={64} />
                    {look.pet && <span className="map-pet"><Sprite src={look.pet.value} size={32} /></span>}
                  </div>
                )}
                {bossFoe && (
                  <div className={`hub-boss${bossDown ? " is-down" : ""}`} title={bossDown ? `${bossFoe.name} — derrotado` : `Chefe: ${bossFoe.name}`}>
                    <MonsterSprite monster={bossFoe} size={48} boss={!bossDown} />
                  </div>
                )}
                <div className="hub-medal"><Sprite src={info.sprite} size={72} alt={info.name} /></div>
                <div className="hub-stars" aria-label={`${done} de ${list.length} fases`} title={`${done} de ${list.length} fases`}>
                  {list.map((m) => (
                    <span key={m.id} className={`hub-star${completedMissionIds.includes(m.id) ? " is-on" : ""}${isBoss(m) ? " is-boss" : ""}`} />
                  ))}
                </div>
                <div className="hub-card">
                  <p className="pixel-label" style={{ margin: 0, color: open ? info.color : "var(--color-muted)" }}>
                    Região {i + 1} · {info.name}
                  </p>
                  <p className="hub-name">{info.subtitle}</p>
                  {open ? (
                    <p className="hub-line" style={{ color: bossDown ? "var(--color-run)" : "#ff8a80" }}>
                      <Icon name={bossDown ? "check" : "crown"} size={13} />
                      {bossDown ? "Região libertada!" : `Chefe: ${bossFoe?.name ?? boss?.missionTitle}`}
                    </p>
                  ) : (
                    <p className="hub-line"><Icon name="lock" size={13} /> {reasons.length ? "Vença o chefe anterior" : "Em breve"}</p>
                  )}
                </div>
              </div>
            </div>
          );
          return open ? <Link key={t} href={`/regiao/${t}`} aria-label={info.subtitle}>{place}</Link> : <div key={t}>{place}</div>;
        })}
      </section>
    </div>
  );
}
