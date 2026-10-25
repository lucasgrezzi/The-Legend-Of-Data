"use client";

import { useEffect, useState } from "react";
import { levelProgress } from "@/lib/xp";

interface XPBarProps {
  totalXP: number;
  /** Se definido, a barra anima a partir deste XP */
  fromXP?: number;
  compact?: boolean;
  /** Barra em pixel art (cantos retos, marcas a cada 10%) — usada no mapa */
  pixel?: boolean;
}

export default function XPBar({ totalXP, fromXP, compact = false, pixel = false }: XPBarProps) {
  const target = levelProgress(totalXP);
  const [pct, setPct] = useState(fromXP !== undefined ? levelProgress(fromXP).pct : target.pct);

  useEffect(() => {
    // se subiu de nível durante a animação, a barra parte do zero do novo nível
    const start = fromXP !== undefined && levelProgress(fromXP).level === target.level
      ? levelProgress(fromXP).pct
      : 0;
    setPct(fromXP !== undefined ? start : target.pct);
    const t = setTimeout(() => setPct(target.pct), 120);
    return () => clearTimeout(t);
  }, [fromXP, target.pct, target.level]);

  return (
    <div className="flex flex-col gap-2" style={{ width: "100%" }}>
      <div className="flex justify-between items-baseline gap-3" style={{ fontSize: compact ? 12 : 13, fontWeight: 700 }}>
        <span style={{ color: "var(--color-xp)", fontWeight: 800 }}>
          Nv {target.level} · {target.label}
        </span>
        <span style={{ color: "var(--color-muted)" }}>
          {target.nextXP !== null
            ? `${totalXP} / ${target.nextXP} XP → ${target.nextLabel}`
            : `${totalXP} XP · nível máximo`}
        </span>
      </div>
      <div className="xp-pixel" style={pixel ? undefined : { height: compact ? 8 : 10 }}>
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
