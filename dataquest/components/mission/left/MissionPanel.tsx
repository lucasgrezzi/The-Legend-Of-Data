"use client";

import type { Mission } from "@/types";
import DataFilePreviewComponent from "./DataFilePreview";
import Link from "next/link";
import TypewriterText from "@/components/ui/TypewriterText";

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

interface MissionPanelProps {
  mission: Mission;
  trackIndex: number;
  trackTotal: number;
  validated: boolean;
  prevId: number | null;
  nextId: number | null;
}

function SectionHeader({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <div className="section-header">
      <span className="section-icon">{icon}</span>
      <span className="section-label" style={{ color }}>
        {label}
      </span>
      <div className="section-line" style={{ background: color }} />
    </div>
  );
}

function TutorialSteps({ text, trackColor }: { text: string; trackColor: string }) {
  const lines = text.split("\n");
  let stepCount = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} style={{ height: 4 }} />;

        if (trimmed.startsWith("•")) {
          stepCount++;
          const content = trimmed.slice(1).trim();
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "12px 16px",
                background: "rgba(74,174,255,0.05)",
                border: "1px solid rgba(74,174,255,0.18)",
                borderRadius: 10,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  background: trackColor,
                  color: "#000",
                  borderRadius: "50%",
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  fontFamily: "var(--font-body)",
                  marginTop: 1,
                }}
              >
                {stepCount}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--color-text)",
                }}
              >
                {content}
              </span>
            </div>
          );
        }

        if (line.startsWith("  ") || line.startsWith("\t")) {
          return (
            <code
              key={i}
              style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-accent)",
                background: "var(--color-bg)",
                padding: "5px 14px",
                borderRadius: 6,
                marginLeft: 16,
                borderLeft: `2px solid ${trackColor}55`,
              }}
            >
              {trimmed}
            </code>
          );
        }

        return (
          <p
            key={i}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--color-muted)",
              fontWeight: 600,
              marginTop: stepCount > 0 ? 8 : 0,
              marginBottom: 0,
            }}
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
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
  const isNarrative = mission.validationType === "narrative";

  return (
    <div className="flex flex-col h-full">

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-7" style={{ paddingBottom: 0 }}>

        {/* Chapter label */}
        <p className="pixel-chapter mb-4">
          &gt; {String(trackIndex + 1).padStart(2, "0")} — {mission.chapterTitle}
        </p>

        {/* ── Título principal (grande, bold, JetBrains Mono) ── */}
        <h1
          className="mb-5"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.25,
            color: "var(--color-text)",
            letterSpacing: "-0.5px",
            textShadow: "0 0 40px rgba(240,192,64,0.15), 0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          {mission.missionTitle}
        </h1>

        {/* Track badge */}
        <div
          className={`track-badge track-${mission.track} mb-7`}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{trackIcon}</span>
          <span style={{ textTransform: "uppercase", letterSpacing: 2 }}>{mission.track}</span>
        </div>

        {/* ── Narrativa (typewriter) ── */}
        <div
          className="mb-6"
          style={{
            background: "rgba(240,192,64,0.04)",
            border: "1px solid rgba(240,192,64,0.16)",
            borderRadius: 14,
            padding: "20px 24px",
          }}
        >
          <SectionHeader icon="📯" label="LORE" color="var(--color-accent)" />
          <TypewriterText
            text={mission.narrative}
            speed={16}
            delay={350}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-text)",
              lineHeight: 1.85,
            }}
          />
        </div>

        {/* ── Tutorial / Teoria ── */}
        {mission.theory && (
          <div
            className="mb-5"
            style={{
              background: "rgba(74,174,255,0.04)",
              border: "1px solid rgba(74,174,255,0.16)",
              borderRadius: 14,
              padding: "20px 24px",
            }}
          >
            <SectionHeader icon="🔮" label="GRIMÓRIO" color={trackColor} />
            <pre
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-text)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              {mission.theory}
            </pre>
          </div>
        )}

        {/* ── Missão: passos do tutorial ── */}
        {!isNarrative && (
          <div
            className="mb-5"
            style={{
              background: "var(--color-panel)",
              border: `1px solid ${trackColor}33`,
              borderRadius: 14,
              padding: "20px 24px",
            }}
          >
            <SectionHeader icon="🗡️" label="QUEST" color={trackColor} />
            <TutorialSteps text={mission.instructions} trackColor={trackColor} />
          </div>
        )}

        {/* ── Data file preview ── */}
        {mission.dataFile && (
          <div className="mb-6">
            <DataFilePreviewComponent dataFile={mission.dataFile} />
          </div>
        )}
      </div>

      {/* ── Rodapé fixo ── */}
      <div
        className="shrink-0 flex items-center justify-between px-8 py-4"
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="pixel-label px-3 py-1"
            style={{
              background: "var(--color-panel)",
              color: "var(--color-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: 20,
            }}
          >
            {trackIndex + 1}/{trackTotal}
          </span>
          <span
            className="pixel-label px-3 py-1"
            style={{
              background: "rgba(240,192,64,0.1)",
              color: "var(--color-xp)",
              border: "1px solid rgba(240,192,64,0.25)",
              borderRadius: 20,
            }}
          >
            ✦ +{mission.xpReward} XP
          </span>
        </div>

        <div className="flex gap-2">
          {prevId !== null ? (
            <Link href={`/mission/${prevId}`}>
              <button className="btn-nav">← Voltar</button>
            </Link>
          ) : (
            <Link href="/map">
              <button className="btn-nav">⬡ Mapa</button>
            </Link>
          )}

          {nextId !== null ? (
            <Link
              href={validated ? `/mission/${nextId}` : "#"}
              onClick={(e) => { if (!validated) e.preventDefault(); }}
            >
              <button
                className="btn-next"
                disabled={!validated}
                style={{ opacity: validated ? 1 : 0.35, cursor: validated ? "pointer" : "not-allowed" }}
              >
                Próximo →
              </button>
            </Link>
          ) : validated ? (
            <Link href="/map">
              <button className="btn-next">⭐ Concluído</button>
            </Link>
          ) : (
            <button className="btn-next" disabled style={{ opacity: 0.35 }}>
              Próximo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
