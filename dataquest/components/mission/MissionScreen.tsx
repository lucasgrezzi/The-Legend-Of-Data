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
  const trackIndex   = trackMissions.findIndex((m) => m.id === mission.id);
  const trackTotal   = trackMissions.length;

  const prevId   = mission.id > 0 ? mission.id - 1 : null;
  const nextMission = MISSIONS.find((m) => m.id === mission.id + 1);
  const nextId   = nextMission ? nextMission.id : null;

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

  const trackColor = TRACK_COLOR[mission.track] ?? "var(--color-accent)";
  const progressPct = trackTotal > 0 ? ((trackIndex + 1) / trackTotal) * 100 : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-5 py-2 shrink-0"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-4">
          <Link href="/map" className="pixel-label no-underline" style={{ color: "var(--color-accent)" }}>
            DataQuest
          </Link>
          <span style={{ color: "var(--color-border)" }}>/</span>
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>
            {mission.track.charAt(0).toUpperCase() + mission.track.slice(1)}
          </span>
          <span style={{ color: "var(--color-border)" }}>/</span>
          <span className="pixel-label" style={{ color: "var(--color-text)" }}>
            {mission.missionTitle}
          </span>
        </div>

        {/* Center: progress bar */}
        <div className="flex items-center gap-2" style={{ minWidth: 200 }}>
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 8, background: "var(--color-border)" }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: trackColor,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>
            {Math.round(progressPct)}%
          </span>
        </div>

        {/* Right: XP */}
        <div className="flex items-center gap-3">
          <span className="pixel-label" style={{ color: "var(--color-xp)" }}>
            {totalXP} XP
          </span>
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>
            Nv {level} — {levelLabel}
          </span>
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
              className="flex items-center justify-center h-full"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)", fontSize: 15 }}
            >
              Pressione Próximo para começar sua jornada.
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
