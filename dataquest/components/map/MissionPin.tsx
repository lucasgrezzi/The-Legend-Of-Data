"use client";

import Link from "next/link";
import type { Mission } from "@/types";

interface MissionPinProps {
  mission: Mission;
  completed: boolean;
  unlocked: boolean;
  trackColor: string;
}

export default function MissionPin({ mission, completed, unlocked, trackColor }: MissionPinProps) {
  const locked = !unlocked;

  const card = (
    <div
      style={{
        background: completed ? trackColor : "var(--color-panel)",
        border: `1px solid ${completed ? trackColor : "var(--color-border)"}`,
        padding: "10px 16px",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.4 : 1,
        minWidth: 160,
        transition: "border-color 0.15s, background 0.15s",
      }}
      className="flex items-center gap-3"
    >
      <span style={{ fontSize: 20 }}>
        {locked ? "🔒" : completed ? "★" : "○"}
      </span>
      <div>
        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: completed ? "#000" : "var(--color-text)",
            lineHeight: 1.6,
          }}
        >
          {mission.missionTitle}
        </p>
        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 6,
            color: completed ? "rgba(0,0,0,0.6)" : "var(--color-muted)",
            marginTop: 3,
          }}
        >
          +{mission.xpReward} XP
        </p>
      </div>
    </div>
  );

  if (locked) return card;
  return (
    <Link href={`/mission/${mission.id}`} style={{ textDecoration: "none" }}>
      {card}
    </Link>
  );
}
