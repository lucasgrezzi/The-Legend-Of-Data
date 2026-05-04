"use client";

import { useGameStore } from "@/store/gameStore";
import { MISSIONS } from "@/lib/missions";
import MissionPin from "./MissionPin";

const TRACK_INFO: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  python:  { label: "Linguagem dos Antigos", color: "var(--color-python)",  icon: "🐍", desc: "Python" },
  sql:     { label: "Catacumbas de Dados",    color: "var(--color-sql)",     icon: "🗄️", desc: "SQL"    },
  pandas:  { label: "A Forja de Dados",       color: "var(--color-pandas)",  icon: "🔨", desc: "Pandas" },
  dataviz: { label: "O Farol da Verdade",     color: "var(--color-dataviz)", icon: "📊", desc: "Data Viz" },
};

const TRACK_ORDER = ["python", "sql", "pandas", "dataviz"];

export default function WorldMap() {
  const { completedMissionIds, unlockedMissionIds, totalXP, level, levelLabel } = useGameStore();

  const missionsByTrack = TRACK_ORDER.map((track) => ({
    track,
    info: TRACK_INFO[track],
    missions: MISSIONS.filter((m) => m.track === track),
  }));

  const totalMissions   = MISSIONS.length;
  const completedCount  = completedMissionIds.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 11,
              color: "var(--color-accent)",
              letterSpacing: 1,
            }}
          >
            DataQuest
          </span>
          <p className="pixel-chapter mt-1">A Guilda dos Arquivistas</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="pixel-label" style={{ color: "var(--color-xp)" }}>
              {totalXP} XP
            </p>
            <p className="pixel-label" style={{ color: "var(--color-muted)" }}>
              Nv {level} — {levelLabel}
            </p>
          </div>
          <div
            className="pixel-label px-3 py-2"
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            {completedCount}/{totalMissions} missões
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <p
          className="mb-8 text-center"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 9,
            color: "var(--color-muted)",
            letterSpacing: 2,
          }}
        >
          ESCOLHA SUA TRILHA
        </p>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {missionsByTrack.map(({ track, info, missions }) => {
            const trackUnlocked = missions.some((m) => unlockedMissionIds.includes(m.id));
            const trackCompleted = missions.filter((m) => completedMissionIds.includes(m.id)).length;

            return (
              <div
                key={track}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  opacity: trackUnlocked ? 1 : 0.45,
                  padding: "20px 24px",
                }}
              >
                {/* Track header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 22 }}>{info.icon}</span>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-pixel)",
                          fontSize: 9,
                          color: info.color,
                          letterSpacing: 0.5,
                        }}
                      >
                        # {info.desc}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          color: "var(--color-muted)",
                          marginTop: 2,
                        }}
                      >
                        {info.label}
                      </p>
                    </div>
                  </div>
                  <span className="pixel-label" style={{ color: "var(--color-muted)" }}>
                    {trackCompleted}/{missions.length}
                  </span>
                </div>

                {/* Mission pins */}
                <div className="flex flex-wrap gap-4">
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
