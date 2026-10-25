"use client";

import { useRef, useState } from "react";
import type { Mission } from "@/types";
import { TRACKS } from "@/lib/tracks";
import { missionDataFiles } from "@/lib/missions";
import DataFilePreviewComponent from "./DataFilePreview";
import Link from "next/link";
import TypewriterText from "@/components/ui/TypewriterText";
import RichText from "@/components/ui/RichText";
import HintShop from "./HintShop";
import { MissionWords } from "@/components/glossary/Bestiary";
import { SOLUTION_UNLOCK_FAILS, solutionXP } from "@/lib/xp";

interface MissionPanelProps {
  mission: Mission;
  trackIndex: number;
  trackTotal: number;
  validated: boolean;
  prevId: number | null;
  nextId: number | null;
  /** Envios errados nesta missão */
  fails: number;
  hintsBought: number;
  solutionRevealed: boolean;
  coins: number;
  onBuyHint: (cost: number) => void;
  onRevealSolution: () => void;
}

type TabId = "lore" | "estudo" | "grimorio" | "dados";

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
  hintsBought,
  solutionRevealed,
  coins,
  onBuyHint,
  onRevealSolution,
}: MissionPanelProps) {
  const track = TRACKS[mission.track];
  const isNarrative = mission.validationType === "narrative";
  const [tab, setTab] = useState<TabId>("lore");
  const tabsRef = useRef<HTMLDivElement>(null);
  const openTab = (t: TabId) => {
    setTab(t);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Solução revelada antes de concluir → a missão vale metade do XP
  const penalized = solutionRevealed && !validated;
  const hasGrimoire = mission.hints.length > 0 || !!mission.solution;

  const tabs: { id: TabId; icon: string; label: string }[] = [
    { id: "lore", icon: "📯", label: "Lore" },
    ...(mission.theory ? [{ id: "estudo" as const, icon: "📜", label: "Estudo" }] : []),
    ...(hasGrimoire ? [{ id: "grimorio" as const, icon: "🔮", label: "Grimório" }] : []),
    ...(mission.dataFile ? [{ id: "dados" as const, icon: "📂", label: "Dados" }] : []),
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Conteúdo rolável ── */}
      <div className="mission-stage flex-1 overflow-y-auto px-8 pt-7 pb-8" style={{ ["--track-rgb" as string]: track.rgb }}>

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

        <MissionWords missionId={mission.id} />

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={`track-badge track-${mission.track}`}>
            <span style={{ textTransform: "uppercase", letterSpacing: 2 }}>{track.name}</span>
          </span>
          <span
            className="track-badge"
            style={{ color: "var(--color-xp)", border: "1px solid rgba(240,192,64,0.3)", background: "rgba(240,192,64,0.08)" }}
          >
            ✦ +{penalized ? solutionXP(mission.xpReward) : mission.xpReward} XP
          </span>
          {mission.coinReward > 0 && (
            <span
              className="track-badge"
              style={{ color: "var(--color-xp)", border: "1px solid rgba(240,192,64,0.3)", background: "rgba(240,192,64,0.08)" }}
            >
              +{mission.coinReward} moedas
            </span>
          )}
          {penalized && (
            <span className="track-badge" style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)", background: "var(--color-panel)" }}>
              Solução revelada: −50% XP
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
          <div className="quest-scroll" data-tour="quest">
            <SectionHeader icon="🗡️" label="QUEST" color={track.ink} />
            <RichText text={mission.instructions} color={track.ink} numbered />
            <p className="quest-meta flex flex-wrap items-center gap-x-4 gap-y-1">
              {mission.theory && (
                <button type="button" className="link-btn" onClick={() => openTab("estudo")}>📜 Não conhece a sintaxe? Leia o Estudo</button>
              )}
              {hasGrimoire && !validated && (
                <button type="button" className="link-btn" onClick={() => openTab("grimorio")}>🔮 Dicas no Grimório</button>
              )}
              {!validated && fails > 0 && (
                <span>
                  Erros: <b style={{ color: "#a3201c" }}>{fails}</b>
                  {!solutionRevealed && fails < SOLUTION_UNLOCK_FAILS && ` · solução libera após ${SOLUTION_UNLOCK_FAILS}`}
                </span>
              )}
            </p>
          </div>
        )}

        {/* ── Abas: Lore / Estudo / Grimório / Dados ── */}
        <div ref={tabsRef} className="mission-book rpg-frame" data-tour="tabs" style={{ scrollMarginTop: 16 }}>
          <div className="tabs px-3 pt-2" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                className="tab"
                aria-selected={tab === t.id}
                data-tour={`tab-${t.id}`}
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
              {mission.realWorld && (
                <div
                  className="anim-rise"
                  style={{
                    ["--d" as string]: "600ms",
                    marginTop: 20,
                    padding: "14px 16px",
                    background: "var(--color-panel)",
                    border: "1px solid var(--color-border)",
                    borderLeft: `3px solid ${track.color}`,
                    borderRadius: 6,
                  }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>🌍</span>
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: track.color }}>
                      No mundo real
                    </span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text)", margin: 0 }}>
                    {mission.realWorld}
                  </p>
                </div>
              )}
            </div>
            {mission.theory && (
              <div hidden={tab !== "estudo"}>
                <RichText text={mission.theory} color={track.color} />
              </div>
            )}
            {hasGrimoire && (
              <div hidden={tab !== "grimorio"}>
                <HintShop
                  mission={mission}
                  color={track.color}
                  coins={coins}
                  fails={fails}
                  hintsBought={hintsBought}
                  solutionRevealed={solutionRevealed}
                  free={validated}
                  onBuyHint={onBuyHint}
                  onRevealSolution={onRevealSolution}
                />
              </div>
            )}
            {mission.dataFile && (
              <div hidden={tab !== "dados"} className="flex flex-col gap-6">
                {missionDataFiles(mission).map((f) => (
                  <DataFilePreviewComponent key={f.filename} dataFile={f} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Rodapé fixo ── */}
      <div
        className="wood-bar is-bottom shrink-0 flex items-center justify-between px-8 py-3"
        data-tour="next"
      >
        <span className="pixel-label" style={{ color: "#b8a88c" }}>
          Missão {trackIndex + 1} de {trackTotal}
        </span>

        <div className="flex gap-2">
          {prevId !== null ? (
            <Link href={`/mission/${prevId}`} className="btn-nav btn-pixel is-compact">← Voltar</Link>
          ) : (
            <Link href={`/regiao/${mission.track}`} className="btn-nav btn-pixel is-compact">⬡ Mapa</Link>
          )}

          {nextId !== null ? (
            validated ? (
              <Link href={`/mission/${nextId}`} className="btn-next btn-pixel is-compact">Próximo →</Link>
            ) : (
              <button className="btn-next btn-pixel is-compact" disabled title="Envie uma resposta correta para avançar">
                <span style={{ fontFamily: "var(--font-body)" }}>🔒</span> Próximo
              </button>
            )
          ) : validated ? (
            <Link href={`/regiao/${mission.track}`} className="btn-next btn-pixel is-compact"><span style={{ fontFamily: "var(--font-body)" }}>⭐</span> Concluído</Link>
          ) : (
            <button className="btn-next btn-pixel is-compact" disabled><span style={{ fontFamily: "var(--font-body)" }}>🔒</span> Próximo</button>
          )}
        </div>
      </div>
    </div>
  );
}
