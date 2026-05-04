"use client";

import { useState, useCallback, useEffect } from "react";
import type { Mission, RunResult } from "@/types";
import { validateOutput } from "@/lib/validation";
import { MISSIONS } from "@/lib/missions";
import { useGameStore } from "@/store/gameStore";
import { usePyodide } from "@/hooks/usePyodide";
import { useDuckDB } from "@/hooks/useDuckDB";
import MissionPanel from "./left/MissionPanel";
import EditorPanel from "./right/EditorPanel";
import PixelDialog from "@/components/ui/PixelDialog";
import Link from "next/link";

interface MissionScreenProps {
  mission: Mission;
}

const TRACK_COLOR: Record<string, string> = {
  python:  "var(--color-python)",
  sql:     "var(--color-sql)",
  pandas:  "var(--color-pandas)",
  dataviz: "var(--color-dataviz)",
};

const TRACK_ICON: Record<string, string> = {
  python:  "🐍",
  sql:     "🏛️",
  pandas:  "⚒️",
  dataviz: "🌠",
};

export default function MissionScreen({ mission }: MissionScreenProps) {
  const { totalXP, level, levelLabel, completeMission, completedMissionIds } = useGameStore();
  const { status: pyodideStatus, runCode } = usePyodide();
  const { runSQL } = useDuckDB();

  const alreadyCompleted = completedMissionIds.includes(mission.id);
  const [validated, setValidated] = useState(
    alreadyCompleted || mission.validationType === "narrative"
  );
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ open: false, type: "info", message: "" });

  useEffect(() => {
    if (mission.validationType === "narrative" && !alreadyCompleted) {
      completeMission(mission.id, mission.xpReward);
      setValidated(true);
    }
  }, [mission, alreadyCompleted, completeMission]);

  const trackMissions = MISSIONS.filter((m) => m.track === mission.track);
  const trackIndex    = trackMissions.findIndex((m) => m.id === mission.id);
  const trackTotal    = trackMissions.length;

  const prevId      = mission.id > 0 ? mission.id - 1 : null;
  const nextMission = MISSIONS.find((m) => m.id === mission.id + 1);
  const nextId      = nextMission ? nextMission.id : null;

  const handleRun = useCallback(
    async (code: string): Promise<RunResult> => {
      let result: RunResult;
      if (mission.editorLanguage === "sql") {
        result = await runSQL(code, mission.dataFile?.rawCsv);
      } else {
        result = await runCode(code, mission.dataFile?.rawCsv);
      }
      setLastResult(result);
      return result;
    },
    [mission, runCode, runSQL]
  );

  const handleSubmit = useCallback(
    async (code: string): Promise<void> => {
      let result = lastResult;
      if (!result) {
        result = await handleRun(code);
      }
      const validation = validateOutput(result, mission);
      if (validation.passed && !alreadyCompleted) {
        completeMission(mission.id, validation.xpEarned);
        setValidated(true);
      }
      setDialog({
        open: true,
        type: validation.passed ? "success" : "error",
        message: validation.feedback,
      });
    },
    [lastResult, handleRun, mission, alreadyCompleted, completeMission]
  );

  const trackColor   = TRACK_COLOR[mission.track] ?? "var(--color-accent)";
  const trackIcon    = TRACK_ICON[mission.track] ?? "◆";
  const progressPct  = trackTotal > 0 ? ((trackIndex + 1) / trackTotal) * 100 : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="no-underline"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--color-accent)",
              letterSpacing: "-0.5px",
              textShadow: "0 0 20px rgba(240,192,64,0.3)",
            }}
          >
            DataQuest
          </Link>
          <span style={{ color: "var(--color-border)", fontSize: 16 }}>/</span>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: trackColor,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {trackIcon} {mission.track.charAt(0).toUpperCase() + mission.track.slice(1)}
          </span>
          <span style={{ color: "var(--color-border)", fontSize: 16 }}>/</span>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 7,
              color: "var(--color-muted)",
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {mission.missionTitle}
          </span>
        </div>

        {/* Center: progress bar da trilha */}
        <div className="flex items-center gap-3" style={{ minWidth: 220 }}>
          <div
            style={{
              flex: 1,
              height: 8,
              background: "var(--color-border)",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: trackColor,
                borderRadius: 20,
                transition: "width 0.5s ease",
                boxShadow: `0 0 8px ${trackColor}80`,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 7,
              color: "var(--color-muted)",
              minWidth: 30,
            }}
          >
            {Math.round(progressPct)}%
          </span>
        </div>

        {/* Right: XP + level */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              background: "rgba(240,192,64,0.08)",
              border: "1px solid rgba(240,192,64,0.2)",
              borderRadius: 20,
            }}
          >
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "var(--color-xp)" }}>
              ⭐ {totalXP} XP
            </span>
            <span style={{ color: "var(--color-border)" }}>·</span>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "var(--color-muted)" }}>
              Nv {level}
            </span>
          </div>
        </div>
      </div>

      {/* ── Two columns ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left 55% */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            width: "55%",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <MissionPanel
            mission={mission}
            trackIndex={trackIndex}
            trackTotal={trackTotal}
            validated={validated}
            prevId={prevId}
            nextId={nextId}
          />
        </div>

        {/* Right 45% */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ background: "var(--color-surface)" }}
        >
          {mission.validationType === "narrative" ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-4"
              style={{ padding: 32 }}
            >
              <span style={{ fontSize: 48 }}>📜</span>
              <p
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 9,
                  color: "var(--color-muted)",
                  textAlign: "center",
                  lineHeight: 2,
                }}
              >
                Leia a história e pressione{" "}
                <span style={{ color: "var(--color-accent)" }}>Próximo</span>{" "}
                para começar.
              </p>
            </div>
          ) : (
            <EditorPanel
              mission={mission}
              pyodideStatus={pyodideStatus}
              onRun={handleRun}
              onSubmit={handleSubmit}
              validated={validated}
            />
          )}
        </div>
      </div>

      <PixelDialog
        open={dialog.open}
        type={dialog.type}
        message={dialog.message}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
      />
    </div>
  );
}
