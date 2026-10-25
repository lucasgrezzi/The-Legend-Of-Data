"use client";

import Link from "next/link";
import type { Mission } from "@/types";
import { TRACKS } from "@/lib/tracks";
import Sprite from "@/components/ui/Sprite";
import Icon from "@/components/ui/Icon";

export type PinState = "locked" | "available" | "completed";

interface MissionPinProps {
  mission: Mission;
  state: PinState;
  /** posição do centro do nó, em % da largura e px do topo */
  x: number;
  y: number;
  isNext: boolean;
  /** Última fase da região: o chefe — medalhão maior e etiqueta própria */
  isBoss?: boolean;
  lockReasons: string[];
  /** XP realmente ganho (pode ser metade se usou o Grimório) */
  xpEarned?: number;
  /** Sprite do personagem do jogador — aparece ao lado da próxima missão */
  heroSprite?: string;
  /** Mascote comprado na Loja do Mercador — acompanha o herói */
  petSprite?: string;
}

const STATE_CHIP: Record<PinState, { text: string; cls: string }> = {
  locked: { text: "Bloqueada", cls: "is-locked" },
  available: { text: "Disponível", cls: "is-open" },
  completed: { text: "Concluída", cls: "is-done" },
};

const LABEL_GAP = 18;
const NODE_R = 40;

export default function MissionPin({ mission, state, x, y, isNext, isBoss, lockReasons, xpEarned, heroSprite, petSprite }: MissionPinProps) {
  const track = TRACKS[mission.track];
  const r = isBoss ? NODE_R + 8 : NODE_R; // o medalhão do chefe é maior (96px)
  const locked = state === "locked";
  const labelOnRight = x <= 50;
  const halfXP = state === "completed" && xpEarned !== undefined && xpEarned < mission.xpReward;
  const chip = STATE_CHIP[state];

  const sprite =
    state === "completed" ? "/assets/sprites/missao-concluida.png"
    : locked ? "/assets/sprites/missao-bloqueada.png"
    : track.sprite;

  const node = (
    <div
      className={`map-node is-${state}${isBoss ? " is-boss" : ""}`}
      style={{
        left: `${x}%`,
        top: y,
        cursor: locked ? "not-allowed" : "var(--cursor-hover)",
      }}
      title={locked ? `Bloqueada — ${lockReasons.join("; ")}` : mission.missionTitle}
    >
      <Sprite src={sprite} size={64} />
      {state === "completed" && <span className="node-check" aria-hidden><Icon name="check" size={15} style={{ strokeWidth: 3 }} /></span>}
      {isBoss && <span className="boss-crown" aria-hidden><Icon name="crown" size={16} /></span>}
    </div>
  );

  const title = (
    <span className="block">
      {isBoss && <span className="chip is-boss boss-tag"><Icon name="crown" size={11} /> CHEFE DA REGIÃO</span>}
      <span className="map-label-title">{mission.missionTitle}</span>
    </span>
  );

  return (
    <>
      {isNext && (
        <span className="next-flag" style={{ left: `${x}%`, top: y - r - (isBoss ? 30 : 14) }}>
          PRÓXIMA
        </span>
      )}

      {/* O herói espera do lado oposto ao rótulo */}
      {isNext && heroSprite && (
        <div className="map-hero" style={{ left: `calc(${x}% ${labelOnRight ? "-" : "+"} ${r + 44}px)`, top: y }}>
          <Sprite src={heroSprite} size={64} />
          {petSprite && <span className="map-pet"><Sprite src={petSprite} size={32} /></span>}
        </div>
      )}

      {locked ? node : (
        <Link href={`/mission/${mission.id}`} aria-label={mission.missionTitle}>{node}</Link>
      )}

      {/* Rótulo sempre dentro de um cartão sólido — nunca texto direto sobre o fundo */}
      <div
        className={`map-label is-${state}${isBoss ? " is-boss" : ""}`}
        style={{
          top: y,
          ...(labelOnRight
            ? { left: `calc(${x}% + ${r + LABEL_GAP}px)` }
            : { right: `calc(${100 - x}% + ${r + LABEL_GAP}px)` }),
        }}
      >
        {locked ? title : <Link href={`/mission/${mission.id}`}>{title}</Link>}
        <span className="map-label-concept" style={{ color: locked ? undefined : track.color }}>
          {mission.concept}
        </span>
        <span className="map-label-meta">
          <span className={`chip ${locked ? "is-locked" : "is-xp"}`}>
            <Icon name="sparkle" size={11} /> {halfXP ? `+${xpEarned}/${mission.xpReward}` : `+${mission.xpReward}`} XP
          </span>
          <span className={`chip ${chip.cls}`}>
            {state === "completed" && <Icon name="check" size={11} style={{ strokeWidth: 3 }} />}
            {locked && <Icon name="lock" size={11} />}
            {chip.text}
          </span>
        </span>
      </div>
    </>
  );
}
