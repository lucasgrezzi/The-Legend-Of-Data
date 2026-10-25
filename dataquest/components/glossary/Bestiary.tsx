"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY, GLOSSARY_KIND_LABEL, type GlossaryKind } from "@/lib/glossary";
import { MISSIONS, getMission } from "@/lib/missions";
import { isMissionUnlocked } from "@/lib/xp";
import { useGameStore } from "@/store/gameStore";
import { useGlossary } from "@/store/glossaryStore";
import { useHydrated } from "@/hooks/useHydrated";
import Icon from "@/components/ui/Icon";
import Sprite from "@/components/ui/Sprite";

type Filter = "todas" | GlossaryKind;

/** Ids das palavras já descobertas (a missão delas já está disponível) */
export function useDiscoveredWords(): Set<string> {
  const completed = useGameStore((s) => s.completedMissionIds);
  const xp = useGameStore((s) => s.totalXP);
  return useMemo(() => {
    const open = new Set(MISSIONS.filter((m) => isMissionUnlocked(m, completed, xp)).map((m) => m.id));
    return new Set(GLOSSARY.filter((g) => open.has(g.missionId)).map((g) => g.id));
  }, [completed, xp]);
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Bestiário de Palavras: glossário do jogador, montado no layout e aberto por `useGlossary().show()` */
export default function Bestiary() {
  const hydrated = useHydrated();
  const { open, focus, close } = useGlossary();
  const discovered = useDiscoveredWords();
  const [filter, setFilter] = useState<Filter>("todas");
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setFilter("todas");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Rola até a palavra pedida
  useEffect(() => {
    if (!open || !focus) return;
    const t = setTimeout(() => {
      listRef.current?.querySelector(`[data-word="${focus}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [open, focus]);

  if (!hydrated || !open) return null;

  const q = norm(query.trim());
  const entries = GLOSSARY.filter((g) => filter === "todas" || g.kind === filter)
    .filter((g) => !q || (discovered.has(g.id) && (norm(g.term).includes(q) || norm(g.text).includes(q))));
  const total = GLOSSARY.length;

  return createPortal(
    <div className="modal-backdrop" onClick={close}>
      <div
        className="bestiary rpg-frame"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bestiary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bestiary-head">
          <div className="flex items-center gap-3">
            <span className="grimoire-error-book" style={{ width: 48, height: 48 }}><Sprite src="/assets/sprites/grimorio.png" size={32} /></span>
            <div>
              <p className="pixel-chapter" style={{ margin: 0, color: "var(--color-accent)" }}>Bestiário de Palavras</p>
              <h2 id="bestiary-title" style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 900 }}>
                {discovered.size} de {total} palavras descobertas
              </h2>
            </div>
          </div>
          <button type="button" className="icon-btn is-square" onClick={close} title="Fechar" aria-label="Fechar"><Icon name="x" /></button>
        </div>
        <p className="bestiary-intro">
          Toda palavra estranha do jogo e da programação mora aqui. Novas palavras aparecem conforme você avança no mapa.
        </p>

        <div className="bestiary-tools">
          <div className="tabs" role="tablist">
            {(["todas", "jogo", "codigo"] as Filter[]).map((f) => (
              <button key={f} role="tab" className="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
                {f !== "todas" && <span className="tab-icon"><Icon name={f === "jogo" ? "dice" : "code"} size={16} /></span>}
                {f === "todas" ? "Todas" : f === "jogo" ? "Jogo" : "Programação"}
              </button>
            ))}
          </div>
          <input
            className="bestiary-search"
            placeholder="Buscar palavra…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar palavra"
          />
        </div>

        <div ref={listRef} className="bestiary-list">
          {entries.map((g) => {
            const known = discovered.has(g.id);
            const mission = getMission(g.missionId);
            return known ? (
              <article key={g.id} data-word={g.id} className={`bestiary-entry ${focus === g.id ? "is-focus" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3>{g.term}</h3>
                  <span className={`bestiary-kind is-${g.kind}`}>{GLOSSARY_KIND_LABEL[g.kind]}</span>
                </div>
                <p>{g.text}</p>
                {g.example && <code className="code-block">{g.example}</code>}
              </article>
            ) : (
              <article key={g.id} data-word={g.id} className="bestiary-entry is-locked">
                <h3><Icon name="lock" size={15} /> ???</h3>
                <p>Aparece em: <b>{mission?.missionTitle ?? "uma missão futura"}</b></p>
              </article>
            );
          })}
          {entries.length === 0 && (
            <p style={{ color: "var(--color-muted)", fontSize: 13, padding: 12 }}>
              Nenhuma palavra descoberta com “{query}”. Talvez ela ainda esteja escondida mais à frente no mapa.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Botão para as barras do topo */
export function BestiaryButton({ compact = false }: { compact?: boolean }) {
  const show = useGlossary((s) => s.show);
  return (
    <button type="button" className="icon-btn" onClick={() => show()} title="Bestiário de Palavras: o glossário do jogo">
      <Icon name="book" />
      <span className={compact ? "hidden 2xl:inline" : undefined}>Bestiário</span>
    </button>
  );
}

/** "Palavras novas nesta fase" — atalhos que abrem o Bestiário na palavra */
export function MissionWords({ missionId }: { missionId: number }) {
  const show = useGlossary((s) => s.show);
  const words = GLOSSARY.filter((g) => g.missionId === missionId);
  if (!words.length) return null;
  return (
    <p className="mission-words">
      <Icon name="book" size={15} /> Palavras novas nesta fase:
      {words.map((w) => (
        <button key={w.id} type="button" className="word-chip" onClick={() => show(w.id)} title="Ver no Bestiário">
          {w.term}
        </button>
      ))}
    </p>
  );
}
