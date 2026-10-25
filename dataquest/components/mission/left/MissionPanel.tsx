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
import Icon, { type IconName } from "@/components/ui/Icon";
import Sprite from "@/components/ui/Sprite";

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

function SectionHeader({ icon, label, color }: { icon: IconName; label: string; color: string }) {
  return (
    <div className="section-header">
      <span className="section-icon" style={{ color }}><Icon name={icon} size={18} /></span>
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

  const tabs: { id: TabId; icon: IconName; label: string }[] = [
    { id: "lore", icon: "scroll", label: "Lore" },
    ...(mission.theory ? [{ id: "estudo" as const, icon: "book" as const, label: "Estudo" }] : []),
    ...(hasGrimoire ? [{ id: "grimorio" as const, icon: "wand" as const, label: "Grimório" }] : []),
    ...(mission.dataFile ? [{ id: "dados" as const, icon: "folder" as const, label: "Dados" }] : []),
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Conteúdo rolável ── */}
      <div className="mission-stage flex-1 overflow-y-auto px-8 pt-7 pb-8" style={{ ["--track-rgb" as string]: track.rgb }}>
      <div className="mission-col">

        {/* Capítulo */}
        <p className="pixel-chapter mission-kicker">
          <span style={{ color: track.color }}>Fase {trackIndex + 1} de {trackTotal}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{mission.chapterTitle}</span>
        </p>

        {/* Título */}
        <h1 className="mission-title">{mission.missionTitle}</h1>
        <p className="mission-learn">
          Você vai aprender: <b style={{ color: track.color, fontWeight: 800 }}>{mission.concept}</b>
        </p>

        <MissionWords missionId={mission.id} />

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={`track-badge track-${mission.track}`}>{track.name}</span>
          <span
            className="track-badge"
            style={{ color: "var(--color-xp)", border: "1px solid rgba(245,196,81,0.3)", background: "rgba(245,196,81,0.08)" }}
          >
            <Icon name="sparkle" size={13} /> +{penalized ? solutionXP(mission.xpReward) : mission.xpReward} XP
          </span>
          {mission.coinReward > 0 && (
            <span
              className="track-badge"
              style={{ color: "var(--color-xp)", border: "1px solid rgba(245,196,81,0.3)", background: "rgba(245,196,81,0.08)", paddingLeft: 4 }}
            >
              <Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-6px -6px -6px -4px" }} /> +{mission.coinReward} moedas
            </span>
          )}
          {penalized && (
            <span className="track-badge" style={{ color: "var(--color-muted)", border: "1px solid var(--line-strong)", background: "rgba(255,255,255,0.03)" }}>
              Solução revelada: −50% XP
            </span>
          )}
          {validated && !isNarrative && (
            <span
              className="track-badge"
              style={{ color: "var(--color-run)", border: "1px solid rgba(60,207,126,0.35)", background: "rgba(60,207,126,0.08)" }}
            >
              <Icon name="check" size={13} style={{ strokeWidth: 3 }} /> Concluída
            </span>
          )}
        </div>

        {/* ── QUEST: o objetivo sempre visível no topo ── */}
        {!isNarrative && (
          <div className="quest-scroll" data-tour="quest">
            <SectionHeader icon="target" label="Quest · seu objetivo" color={track.color} />
            <RichText text={mission.instructions} color={track.color} numbered />
            <p className="quest-meta flex flex-wrap items-center gap-x-4 gap-y-1">
              {mission.theory && (
                <button type="button" className="link-btn" onClick={() => openTab("estudo")}><Icon name="book" size={14} /> Não conhece a sintaxe? Leia o Estudo</button>
              )}
              {hasGrimoire && !validated && (
                <button type="button" className="link-btn" onClick={() => openTab("grimorio")}><Icon name="wand" size={14} /> Dicas no Grimório</button>
              )}
              {!validated && fails > 0 && (
                <span>
                  Erros: <b style={{ color: "var(--color-error)" }}>{fails}</b>
                  {!solutionRevealed && fails < SOLUTION_UNLOCK_FAILS && ` · solução libera após ${SOLUTION_UNLOCK_FAILS}`}
                </span>
              )}
            </p>
          </div>
        )}

        {/* ── Abas: Lore / Estudo / Grimório / Dados ── */}
        <div ref={tabsRef} className="mission-book rpg-frame" data-tour="tabs" style={{ scrollMarginTop: 16 }}>
          <div className="tabs" role="tablist">
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
                <span className="tab-icon"><Icon name={t.icon} size={16} /></span>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px 22px 22px" }}>
            {/* Painéis ficam montados para o typewriter não reiniciar ao trocar de aba */}
            <div hidden={tab !== "lore"}>
              <TypewriterText
                text={mission.narrative}
                speed={16}
                delay={350}
                style={{ fontSize: 15, color: "var(--color-text)", lineHeight: 1.8 }}
              />
              {mission.realWorld && (
                <div
                  className="anim-rise"
                  style={{
                    ["--d" as string]: "600ms",
                    marginTop: 20,
                    padding: "14px 16px",
                    background: `rgba(${track.rgb},0.06)`,
                    border: `1px solid rgba(${track.rgb},0.22)`,
                    borderRadius: 12,
                  }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: 6, color: track.color }}>
                    <Icon name="globe" size={16} />
                    <span className="pixel-label">No mundo real</span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-2)", margin: 0 }}>
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
      </div>

      {/* ── Rodapé fixo ── */}
      <div
        className="wood-bar is-bottom shrink-0 flex items-center justify-between px-6"
        style={{ height: 64 }}
        data-tour="next"
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-muted)" }}>
          Fase {trackIndex + 1} de {trackTotal}
        </span>

        <div className="flex gap-2">
          {prevId !== null ? (
            <Link href={`/mission/${prevId}`} className="btn-nav btn-pixel is-compact"><Icon name="arrowLeft" size={16} /> Voltar</Link>
          ) : (
            <Link href={`/regiao/${mission.track}`} className="btn-nav btn-pixel is-compact"><Icon name="map" size={16} /> Mapa</Link>
          )}

          {nextId !== null ? (
            validated ? (
              <Link href={`/mission/${nextId}`} className="btn-next btn-pixel is-compact">Próxima <Icon name="arrowRight" size={16} /></Link>
            ) : (
              <button className="btn-next btn-pixel is-compact" disabled title="Envie uma resposta correta para avançar">
                <Icon name="lock" size={15} /> Próxima
              </button>
            )
          ) : validated ? (
            <Link href={`/regiao/${mission.track}`} className="btn-next btn-pixel is-compact"><Icon name="star" size={15} /> Concluído</Link>
          ) : (
            <button className="btn-next btn-pixel is-compact" disabled><Icon name="lock" size={15} /> Próxima</button>
          )}
        </div>
      </div>
    </div>
  );
}
