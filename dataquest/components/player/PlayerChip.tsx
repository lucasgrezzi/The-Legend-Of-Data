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
      <HeroPortrait race={profile.race} box={38} sprite={32} frame={look.frame} />
      <span className="flex flex-col items-start" style={{ lineHeight: 1.2 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
          {profile.name}
          {look.title && <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>, {look.title}</span>}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)" }}>
          Nv {level} · {label} · <span style={{ color: "var(--color-xp)" }}>{totalXP} XP</span>
        </span>
      </span>
      <span className="coin-pill" data-coin-target title="Moedas — ganhe concluindo missões, gaste em dicas do Grimório">
        <Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-6px -4px -6px -6px" }} />
        {coins}
      </span>
    </>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title={`Ver meu perfil (${race.name})`} className="player-chip">
        {content}
      </button>
      {open && <ProfileDialog onClose={() => setOpen(false)} />}
    </>
  );
}
