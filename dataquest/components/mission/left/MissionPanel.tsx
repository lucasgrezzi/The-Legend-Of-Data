"use client";

import type { Mission } from "@/types";
import DataFilePreviewComponent from "./DataFilePreview";
import Link from "next/link";

const TRACK_COLOR: Record<string, string> = {
  python:  "var(--color-python)",
  sql:     "var(--color-sql)",
  pandas:  "var(--color-pandas)",
  dataviz: "var(--color-dataviz)",
};

const TRACK_ICON: Record<string, string> = {
  python:  "🐍",
  sql:     "🗄️",
  pandas:  "🔨",
  dataviz: "📊",
};

interface MissionPanelProps {
  mission: Mission;
  trackIndex: number;
  trackTotal: number;
  validated: boolean;
  prevId: number | null;
  nextId: number | null;
}

export default function MissionPanel({
  mission,
  trackIndex,
  trackTotal,
  validated,
  prevId,
  nextId,
}: MissionPanelProps) {
  const trackColor = TRACK_COLOR[mission.track] ?? "#fff";
  const trackIcon  = TRACK_ICON[mission.track] ?? "◆";

  return (
    <div className="flex flex-col h-full">

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ paddingBottom: 0 }}>

        {/* Chapter label */}
        <p className="pixel-chapter mb-3">
          {String(trackIndex + 1).padStart(2, "0")}. {mission.chapterTitle}
        </p>

        {/* Title */}
        <h1
          className="mb-4"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--color-text)",
          }}
        >
          {mission.missionTitle}
        </h1>

        {/* Track badge */}
        <div className="track-badge mb-5" style={{ color: trackColor }}>
          <span>{trackIcon}</span>
          <span style={{ textTransform: "capitalize" }}>{mission.track}</span>
        </div>

        {/* Narrative */}
        <p
          className="mb-5"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--color-text)",
            lineHeight: 1.7,
            whiteSpace: "pre-line",
          }}
        >
          {mission.narrative}
        </p>

        {/* Theory */}
        {mission.theory && (
          <div className="mb-5">
            <p
              className="pixel-label mb-2"
              style={{ color: trackColor }}
            >
              📖 Teoria
            </p>
            <pre
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--color-text)",
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                padding: "14px 16px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                overflowX: "auto",
              }}
            >
              {mission.theory}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-5">
          <p className="pixel-label mb-2" style={{ color: trackColor }}>
            ⚔️ Missão
          </p>
          <pre
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--color-text)",
              background: "rgba(74,174,255,0.06)",
              border: "1px solid rgba(74,174,255,0.2)",
              padding: "14px 16px",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
            }}
          >
            {mission.instructions}
          </pre>
        </div>

        {/* Data file preview */}
        {mission.dataFile && (
          <div className="mb-6">
            <DataFilePreviewComponent dataFile={mission.dataFile} />
          </div>
        )}
      </div>

      {/* ── Fixed footer ── */}
      <div
        className="shrink-0 flex items-center justify-between px-8 py-3"
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {/* Exercise counter + XP */}
        <div className="flex items-center gap-3">
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>
            {mission.missionTitle}
          </span>
          <span
            className="pixel-label px-2 py-1"
            style={{
              background: "var(--color-panel)",
              color: "var(--color-xp)",
              border: "1px solid var(--color-border)",
            }}
          >
            Exercise {trackIndex + 1}/{trackTotal}
          </span>
          <span
            className="pixel-label px-2 py-1"
            style={{
              background: "var(--color-panel)",
              color: trackColor,
              border: "1px solid var(--color-border)",
            }}
          >
            +{mission.xpReward} XP
          </span>
        </div>

        {/* Back / Next */}
        <div className="flex gap-2">
          {prevId !== null ? (
            <Link href={`/mission/${prevId}`}>
              <button
                className="btn-run"
                style={{ fontSize: 7, padding: "8px 16px" }}
              >
                ← Back
              </button>
            </Link>
          ) : (
            <Link href="/map">
              <button
                className="btn-run"
                style={{ fontSize: 7, padding: "8px 16px" }}
              >
                🗺️ Mapa
              </button>
            </Link>
          )}

          {nextId !== null ? (
            <Link
              href={validated ? `/mission/${nextId}` : "#"}
              onClick={(e) => { if (!validated) e.preventDefault(); }}
            >
              <button
                className="btn-submit"
                style={{ padding: "8px 20px", opacity: validated ? 1 : 0.35, cursor: validated ? "pointer" : "not-allowed" }}
                disabled={!validated}
              >
                Next →
              </button>
            </Link>
          ) : validated ? (
            <Link href="/map">
              <button className="btn-submit" style={{ padding: "8px 20px" }}>
                ★ Fim
              </button>
            </Link>
          ) : (
            <button className="btn-submit" style={{ padding: "8px 20px", opacity: 0.35 }} disabled>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
