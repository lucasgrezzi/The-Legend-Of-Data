"use client";

import { useEffect, useState } from "react";
import { levelProgress } from "@/lib/xp";

interface XPBarProps {
  totalXP: number;
  /** Se definido, a barra anima a partir deste XP */
  fromXP?: number;
  compact?: boolean;
}

export default function XPBar({ totalXP, fromXP, compact = false }: XPBarProps) {
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
      <div className="flex justify-between items-baseline gap-3" style={{ fontSize: compact ? 12 : 13 }}>
        <span style={{ color: "var(--color-xp)", fontWeight: 700 }}>
          Nv {target.level} · {target.label}
        </span>
        <span style={{ color: "var(--color-muted)" }}>
          {target.nextXP !== null
            ? `${totalXP} / ${target.nextXP} XP → ${target.nextLabel}`
            : `${totalXP} XP · nível máximo`}
        </span>
      </div>
      <div
        style={{
          height: compact ? 8 : 10,
          background: "var(--color-border)",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #d4a010, #f0c040, #ffe08a)",
            borderRadius: 20,
            boxShadow: "0 0 10px rgba(240,192,64,0.5)",
            transition: "width 0.9s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
