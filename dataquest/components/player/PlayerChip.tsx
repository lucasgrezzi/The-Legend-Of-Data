"use client";

import { useState } from "react";
import type { PlayerProfile } from "@/types";
import { RACES } from "@/lib/races";
import { computeLevel } from "@/lib/xp";
import Sprite from "@/components/ui/Sprite";
import ProfileDialog from "./ProfileDialog";
import HeroPortrait from "./HeroPortrait";
import { useGameStore } from "@/store/gameStore";
import { equippedLook } from "@/lib/shop";

interface PlayerChipProps {
  profile: PlayerProfile;
  totalXP: number;
  coins: number;
}

/** Avatar + nome + nível/XP — usado nas top bars. Clicar abre a ficha do personagem (só visualização). */
export default function PlayerChip({ profile, totalXP, coins }: PlayerChipProps) {
  const [open, setOpen] = useState(false);
  const race = RACES[profile.race];
  const { level, label } = computeLevel(totalXP);
  const look = equippedLook(useGameStore((s) => s.equipped));

  const content = (
    <>
      <HeroPortrait race={profile.race} box={40} sprite={32} frame={look.frame} />
      <span className="flex flex-col items-start" style={{ lineHeight: 1.25 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
          {profile.name}
          {look.title && <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>, {look.title}</span>}
        </span>
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

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title="Ver meu perfil" className="player-chip" style={{ ...style, cursor: "var(--cursor-hover)" }}>
        {content}
      </button>
      {open && <ProfileDialog onClose={() => setOpen(false)} />}
    </>
  );
}
