"use client";

import Link from "next/link";
import type { Mission } from "@/types";
import { TRACKS } from "@/lib/tracks";
import Sprite from "@/components/ui/Sprite";

export type PinState = "locked" | "available" | "completed";

interface MissionPinProps {
  mission: Mission;
  state: PinState;
  /** posição do centro do nó, em % da largura e px do topo */
  x: number;
  y: number;
  isNext: boolean;
  lockReasons: string[];
  /** XP realmente ganho (pode ser metade se usou o Grimório) */
  xpEarned?: number;
  /** Sprite do personagem do jogador — aparece ao lado da próxima missão */
  heroSprite?: string;
}

const STATE_LABEL: Record<PinState, string> = {
  locked: "Bloqueada",
  available: "Disponível",
  completed: "Concluída",
};

const LABEL_GAP = 16;
const NODE_R = 40;

export default function MissionPin({ mission, state, x, y, isNext, lockReasons, xpEarned, heroSprite }: MissionPinProps) {
  const track = TRACKS[mission.track];
  const locked = state === "locked";
  const labelOnRight = x <= 50;
  const halfXP = state === "completed" && xpEarned !== undefined && xpEarned < mission.xpReward;

  const sprite =
    state === "completed" ? "/assets/sprites/missao-concluida.png"
    : locked ? "/assets/sprites/missao-bloqueada.png"
    : track.sprite;

  const node = (
    <div
      className={`map-node is-${state}`}
      style={{
        left: `${x}%`,
        top: y,
        cursor: locked ? "not-allowed" : "var(--cursor-hover)",
      }}
      title={locked ? `Bloqueada — ${lockReasons.join("; ")}` : mission.missionTitle}
    >
      <Sprite src={sprite} size={64} />
      {state === "completed" && <span className="node-check" aria-hidden>✓</span>}
    </div>
  );

  const title = (
    <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: locked ? "var(--color-muted)" : "var(--ink)" }}>
      {mission.missionTitle}
    </span>
  );

  return (
    <>
      {isNext && (
        <span className="next-flag" style={{ left: `${x}%`, top: y - NODE_R - 10 }}>
          ▼ PRÓXIMA
        </span>
      )}

      {/* O herói espera do lado oposto ao rótulo */}
      {isNext && heroSprite && (
        <div className="map-hero" style={{ left: `calc(${x}% ${labelOnRight ? "-" : "+"} ${NODE_R + 44}px)`, top: y }}>
          <Sprite src={heroSprite} size={64} />
        </div>
      )}

      {locked ? node : (
        <Link href={`/mission/${mission.id}`} aria-label={mission.missionTitle}>{node}</Link>
      )}

      {/* Rótulo sempre dentro de um cartão sólido — nunca texto direto sobre o fundo */}
      <div
        className={`map-label is-${state}`}
        style={{
          top: y,
          ...(labelOnRight
            ? { left: `calc(${x}% + ${NODE_R + LABEL_GAP}px)` }
            : { right: `calc(${100 - x}% + ${NODE_R + LABEL_GAP}px)` }),
        }}
      >
        {locked ? title : <Link href={`/mission/${mission.id}`}>{title}</Link>}
        <span style={{ display: "block", marginTop: 2, fontSize: 12, color: locked ? "var(--color-muted)" : track.ink, fontWeight: 700 }}>
          {mission.concept}
        </span>
        <span style={{ display: "block", marginTop: 4, fontSize: 12, color: locked ? "var(--color-muted)" : "var(--ink-soft)" }}>
          <span style={{ color: locked ? "var(--color-xp)" : "#8a5a00", fontWeight: 700 }}>
            ✦ {halfXP ? `+${xpEarned}/${mission.xpReward}` : `+${mission.xpReward}`} XP
          </span>
          {" · "}
          <span style={{ color: state === "completed" ? "#2a6b33" : state === "available" ? "#8a5a00" : undefined, fontWeight: state === "locked" ? 400 : 700 }}>
            {STATE_LABEL[state]}
          </span>
        </span>
      </div>
    </>
  );
}
