"use client";

import type { Race } from "@/types";
import { RACES } from "@/lib/races";
import type { ShopItem } from "@/lib/shop";
import Sprite from "@/components/ui/Sprite";

interface HeroPortraitProps {
  race: Race;
  /** Lado do quadro, em px (o sprite usa 32/64/96) */
  box: number;
  sprite: 32 | 64 | 96;
  frame?: ShopItem;
  pet?: ShopItem;
  radius?: number;
  className?: string;
}

/** Retrato do personagem com a moldura e o mascote comprados na Loja do Mercador */
export default function HeroPortrait({ race, box, sprite, frame, pet, radius = 10, className }: HeroPortraitProps) {
  const r = RACES[race];
  const ring = frame?.value;
  const petSize = sprite >= 64 ? 32 : 0; // no chip (32) não cabe mascote
  return (
    <span
      className={`hero-portrait ${frame?.glow ? "is-glow" : ""} ${className ?? ""}`}
      style={{
        width: box,
        height: box,
        borderRadius: radius,
        background: `rgba(${r.rgb},0.14)`,
        border: ring ? "none" : `1px solid rgba(${r.rgb},0.45)`,
        boxShadow: ring ? `0 0 0 2px var(--frame-dark), 0 0 0 ${sprite >= 64 ? 5 : 3}px ${ring}, 0 0 0 ${sprite >= 64 ? 7 : 4}px var(--frame-dark)` : undefined,
        ["--ring" as string]: ring,
      }}
    >
      <Sprite src={r.sprite} size={sprite} alt={r.name} />
      {pet && petSize > 0 && (
        <span className="hero-portrait-pet"><Sprite src={pet.value} size={32} alt={pet.name} /></span>
      )}
    </span>
  );
}
