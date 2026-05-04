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
        background: completed
          ? `linear-gradient(135deg, ${trackColor}22, ${trackColor}44)`
          : "var(--color-panel)",
        border: `1px solid ${completed ? trackColor : locked ? "var(--color-border)" : trackColor + "55"}`,
        padding: "12px 16px",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.45 : 1,
        minWidth: 175,
        borderRadius: 12,
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: completed ? `0 4px 16px ${trackColor}30` : "0 2px 8px rgba(0,0,0,0.3)",
      }}
      className="flex items-center gap-3"
      onMouseEnter={(e) => {
        if (locked) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow = completed ? `0 10px 28px ${trackColor}45` : "0 8px 22px rgba(0,0,0,0.45)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = completed ? `0 4px 16px ${trackColor}30` : "0 2px 8px rgba(0,0,0,0.3)";
      }}
    >
      {/* Ícone de estado */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          border: `1px solid ${completed ? trackColor + "55" : "var(--color-border)"}`,
          background: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {locked ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/assets/interrogacao.png"
            alt="Bloqueado"
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
          />
        ) : completed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/assets/bau_tesouro.jpg"
            alt="Concluído"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 20 }}>⚡</span>
        )}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: completed ? trackColor : locked ? "var(--color-muted)" : "var(--color-text)",
            lineHeight: 1.7,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {mission.missionTitle}
        </p>
        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 6,
            color: completed ? trackColor + "bb" : "var(--color-muted)",
            marginTop: 4,
          }}
        >
          ✦ +{mission.xpReward} XP
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
