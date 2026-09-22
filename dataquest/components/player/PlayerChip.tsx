"use client";

import type { PlayerProfile } from "@/types";
import { RACES } from "@/lib/races";
import { computeLevel } from "@/lib/xp";
import Sprite from "@/components/ui/Sprite";

interface PlayerChipProps {
  profile: PlayerProfile;
  totalXP: number;
  coins: number;
  onClick?: () => void;
}

/** Avatar + nome + nível/XP — usado nas top bars */
export default function PlayerChip({ profile, totalXP, coins, onClick }: PlayerChipProps) {
  const race = RACES[profile.race];
  const { level, label } = computeLevel(totalXP);

  const content = (
    <>
      <span
        className="flex items-center justify-center overflow-hidden"
        style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${race.rgb},0.14)`, border: `1px solid rgba(${race.rgb},0.45)` }}
      >
        <Sprite src={race.sprite} size={32} alt={race.name} />
      </span>
      <span className="flex flex-col items-start" style={{ lineHeight: 1.25 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>{profile.name}</span>
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
          {race.name} · Nv {level} {label} · <span style={{ color: "var(--color-xp)", fontWeight: 700 }}>{totalXP} XP</span>
        </span>
      </span>
      <span
        className="flex items-center"
        title="Moedas — ganhe concluindo missões, gaste em dicas do Grimório"
        style={{ marginLeft: 4, paddingLeft: 10, borderLeft: "1px solid var(--color-border)", fontSize: 15, fontWeight: 800, color: "var(--color-xp)" }}
      >
        <Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-6px -2px" }} />
        {coins}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "5px 14px 5px 5px",
    borderRadius: 14,
    background: "var(--color-panel)",
    border: "1px solid var(--color-border)",
  };

  return onClick ? (
    <button type="button" onClick={onClick} title="Editar personagem" className="player-chip" style={{ ...style, cursor: "pointer" }}>
      {content}
    </button>
  ) : (
    <div style={style}>{content}</div>
  );
}
