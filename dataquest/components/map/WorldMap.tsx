"use client";

import { useGameStore } from "@/store/gameStore";
import { MISSIONS } from "@/lib/missions";
import MissionPin from "./MissionPin";

const TRACK_INFO: Record<string, {
  label: string;
  color: string;
  icon: string;
  imageSrc?: string;
  desc: string;
  bg: string;
}> = {
  python:  { label: "A Linguagem dos Antigos", color: "var(--color-python)",  icon: "🐍", imageSrc: "/assets/python.jpg",  desc: "Python",   bg: "rgba(79,195,247,0.05)" },
  sql:     { label: "As Catacumbas de Dados",   color: "var(--color-sql)",     icon: "🏛️",                                  desc: "SQL",      bg: "rgba(107,203,119,0.05)" },
  pandas:  { label: "A Forja de Dados",         color: "var(--color-pandas)",  icon: "⚒️",                                  desc: "Pandas",   bg: "rgba(255,183,77,0.05)" },
  dataviz: { label: "O Farol da Verdade",       color: "var(--color-dataviz)", icon: "🌠",                                  desc: "Data Viz", bg: "rgba(244,143,177,0.05)" },
};

const TRACK_ORDER = ["python", "sql", "pandas", "dataviz"];

export default function WorldMap() {
  const { completedMissionIds, unlockedMissionIds, totalXP, level, levelLabel } = useGameStore();

  const missionsByTrack = TRACK_ORDER.map((track) => ({
    track,
    info: TRACK_INFO[track],
    missions: MISSIONS.filter((m) => m.track === track),
  }));

  const totalMissions  = MISSIONS.length;
  const completedCount = completedMissionIds.length;
  const progressPct    = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-8 py-4 shrink-0"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--color-accent)",
              letterSpacing: "-0.5px",
              textShadow: "0 0 30px rgba(240,192,64,0.35)",
            }}
          >
            DataQuest
          </span>
          <p className="pixel-chapter mt-1">⬡ A Guilda dos Arquivistas</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "var(--color-xp)", letterSpacing: 0.5 }}>
              ✦ {totalXP} XP
            </p>
            <p className="pixel-label mt-1" style={{ color: "var(--color-muted)" }}>
              Nv {level} — {levelLabel}
            </p>
          </div>

          <div
            className="pixel-label px-4 py-2"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", borderRadius: 20, color: "var(--color-text)" }}
          >
            {completedCount}/{totalMissions} missões
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <p style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "var(--color-muted)", letterSpacing: 4, marginBottom: 16 }}>
            ⬡ ESCOLHA SUA TRILHA ⬡
          </p>
          <div style={{ maxWidth: 400, margin: "0 auto", background: "var(--color-border)", borderRadius: 20, height: 8, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--color-python), var(--color-submit))",
                borderRadius: 20,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <p className="pixel-label mt-2" style={{ color: "var(--color-muted)" }}>
            {progressPct}% concluído
          </p>
        </div>

        {/* Tracks */}
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          {missionsByTrack.map(({ track, info, missions }) => {
            const trackUnlocked  = missions.some((m) => unlockedMissionIds.includes(m.id));
            const trackCompleted = missions.filter((m) => completedMissionIds.includes(m.id)).length;
            const trackPct       = missions.length > 0 ? Math.round((trackCompleted / missions.length) * 100) : 0;

            return (
              <div
                key={track}
                style={{
                  background: trackUnlocked ? info.bg : "rgba(255,255,255,0.01)",
                  border: `1px solid ${trackUnlocked ? info.color : "var(--color-border)"}`,
                  borderRadius: 18,
                  opacity: trackUnlocked ? 1 : 0.45,
                  padding: "22px 26px",
                  transition: "opacity 0.3s",
                }}
              >
                {/* Track header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">

                    {/* Ícone da trilha — imagem ou emoji */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        border: `1px solid ${info.color}44`,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--color-panel)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {info.imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={info.imageSrc}
                          alt={info.desc}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: 28 }}>{info.icon}</span>
                      )}
                    </div>

                    <div>
                      <p style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: info.color, letterSpacing: 0.5, marginBottom: 4 }}>
                        {info.desc}
                      </p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-muted)" }}>
                        {info.label}
                      </p>
                    </div>
                  </div>

                  {/* Track progress */}
                  <div className="text-right" style={{ minWidth: 80 }}>
                    <p className="pixel-label" style={{ color: info.color }}>
                      {trackCompleted}/{missions.length}
                    </p>
                    <div style={{ width: 80, height: 5, background: "var(--color-border)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${trackPct}%`,
                          background: info.color,
                          borderRadius: 10,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mission pins */}
                <div className="flex flex-wrap gap-3">
                  {missions.map((m) => (
                    <MissionPin
                      key={m.id}
                      mission={m}
                      completed={completedMissionIds.includes(m.id)}
                      unlocked={unlockedMissionIds.includes(m.id)}
                      trackColor={info.color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
