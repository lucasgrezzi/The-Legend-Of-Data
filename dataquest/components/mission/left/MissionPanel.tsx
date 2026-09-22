"use client";

import { useState } from "react";
import type { Mission } from "@/types";
import { TRACKS } from "@/lib/tracks";
import DataFilePreviewComponent from "./DataFilePreview";
import Link from "next/link";
import TypewriterText from "@/components/ui/TypewriterText";
import RichText from "@/components/ui/RichText";
import GrimoireGate from "./GrimoireGate";
import { GRIMOIRE_UNLOCK_FAILS, grimoireXP } from "@/lib/xp";

interface MissionPanelProps {
  mission: Mission;
  trackIndex: number;
  trackTotal: number;
  validated: boolean;
  prevId: number | null;
  nextId: number | null;
  /** Envios errados nesta missão */
  fails: number;
  grimoireOpened: boolean;
  onOpenGrimoire: () => void;
}

type TabId = "lore" | "grimorio" | "dados";

function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
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

export default function MissionPanel({
  mission,
  trackIndex,
  trackTotal,
  validated,
  prevId,
  nextId,
  fails,
  grimoireOpened,
  onOpenGrimoire,
}: MissionPanelProps) {
  const track = TRACKS[mission.track];
  const isNarrative = mission.validationType === "narrative";
  const [tab, setTab] = useState<TabId>("lore");

  // Grimório livre na missão narrativa e depois de concluir; senão, só após errar e aceitar a penalidade
  const grimoireFree = isNarrative || validated;
  const grimoireVisible = grimoireFree || grimoireOpened;
  const grimoireUnlocked = fails >= GRIMOIRE_UNLOCK_FAILS;
  const penalized = grimoireOpened && !validated;

  const tabs: { id: TabId; icon: string; label: string }[] = [
    { id: "lore", icon: "📯", label: "Lore" },
    ...(mission.theory ? [{ id: "grimorio" as const, icon: grimoireVisible || grimoireUnlocked ? "🔮" : "🔒", label: "Grimório" }] : []),
    ...(mission.dataFile ? [{ id: "dados" as const, icon: "📂", label: "Dados" }] : []),
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Conteúdo rolável ── */}
      <div className="flex-1 overflow-y-auto px-8 pt-7 pb-8">

        {/* Chapter label */}
        <p className="pixel-chapter mb-3">
          &gt; {String(trackIndex + 1).padStart(2, "0")} — {mission.chapterTitle}
        </p>

        {/* Título */}
        <h1
          className="mb-1"
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
        <p className="mb-4" style={{ margin: "0 0 16px", fontSize: 15, color: "var(--color-muted)" }}>
          Você vai aprender: <b style={{ color: track.color }}>{mission.concept}</b>
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={`track-badge track-${mission.track}`}>
            <span style={{ textTransform: "uppercase", letterSpacing: 2 }}>{track.name}</span>
          </span>
          <span
            className="track-badge"
            style={{ color: "var(--color-xp)", border: "1px solid rgba(240,192,64,0.3)", background: "rgba(240,192,64,0.08)" }}
          >
            ✦ +{penalized ? grimoireXP(mission.xpReward) : mission.xpReward} XP
          </span>
          {penalized && (
            <span className="track-badge" style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)", background: "var(--color-panel)" }}>
              Grimório aberto: −50% XP
            </span>
          )}
          {validated && !isNarrative && (
            <span
              className="track-badge"
              style={{ color: "var(--color-run)", border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.08)" }}
            >
              ✓ Concluída
            </span>
          )}
        </div>

        {/* ── QUEST: o objetivo sempre visível no topo ── */}
        {!isNarrative && (
          <div
            className="mb-6"
            style={{
              background: `linear-gradient(180deg, rgba(${track.rgb},0.08), rgba(${track.rgb},0.02))`,
              border: `1px solid rgba(${track.rgb},0.35)`,
              borderRadius: 14,
              padding: "18px 22px",
              boxShadow: `0 0 0 1px rgba(${track.rgb},0.05), 0 8px 24px rgba(0,0,0,0.25)`,
            }}
          >
            <SectionHeader icon="🗡️" label="QUEST" color={track.color} />
            <RichText text={mission.instructions} color={track.color} numbered />
            {!validated && fails > 0 && (
              <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: `1px solid rgba(${track.rgb},0.2)`, fontSize: 12, color: "var(--color-muted)" }}>
                Tentativas erradas: <b style={{ color: "var(--color-error)" }}>{fails}</b>
                {!grimoireOpened && (grimoireUnlocked
                  ? " · o Grimório já pode ser aberto (−50% XP)"
                  : ` · o Grimório abre após ${GRIMOIRE_UNLOCK_FAILS}`)}
              </p>
            )}
          </div>
        )}

        {/* ── Abas: Lore / Grimório / Dados ── */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div className="tabs px-3 pt-2" role="tablist" style={{ background: "var(--color-panel)" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                className="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                style={{ ["--tab-color" as string]: t.id === "lore" ? "var(--color-accent)" : track.color }}
              >
                <span className="tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px 24px" }}>
            {/* Painéis ficam montados para o typewriter não reiniciar ao trocar de aba */}
            <div hidden={tab !== "lore"}>
              <TypewriterText
                text={mission.narrative}
                speed={16}
                delay={350}
                style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.85 }}
              />
            </div>
            {mission.theory && (
              <div hidden={tab !== "grimorio"}>
                {grimoireVisible ? (
                  <RichText text={mission.theory} color={track.color} />
                ) : (
                  <GrimoireGate fails={fails} xpReward={mission.xpReward} onOpen={onOpenGrimoire} />
                )}
              </div>
            )}
            {mission.dataFile && (
              <div hidden={tab !== "dados"}>
                <DataFilePreviewComponent dataFile={mission.dataFile} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Rodapé fixo ── */}
      <div
        className="shrink-0 flex items-center justify-between px-8 py-4"
        style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}
      >
        <span className="pixel-label" style={{ color: "var(--color-muted)" }}>
          Missão {trackIndex + 1} de {trackTotal}
        </span>

        <div className="flex gap-2">
          {prevId !== null ? (
            <Link href={`/mission/${prevId}`} className="btn-nav">← Voltar</Link>
          ) : (
            <Link href="/map" className="btn-nav">⬡ Mapa</Link>
          )}

          {nextId !== null ? (
            validated ? (
              <Link href={`/mission/${nextId}`} className="btn-next">Próximo →</Link>
            ) : (
              <button className="btn-next" disabled title="Envie uma resposta correta para avançar">
                <span style={{ fontFamily: "var(--font-body)" }}>🔒</span> Próximo
              </button>
            )
          ) : validated ? (
            <Link href="/map" className="btn-next"><span style={{ fontFamily: "var(--font-body)" }}>⭐</span> Concluído</Link>
          ) : (
            <button className="btn-next" disabled><span style={{ fontFamily: "var(--font-body)" }}>🔒</span> Próximo</button>
          )}
        </div>
      </div>
    </div>
  );
}
