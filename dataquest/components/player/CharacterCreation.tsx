"use client";

import { useState } from "react";
import type { PlayerProfile, Race } from "@/types";
import { RACES, RACE_ORDER } from "@/lib/races";
import Sprite from "@/components/ui/Sprite";
import GateShell, { delay } from "@/components/ui/GateShell";

interface CharacterCreationProps {
  initial?: PlayerProfile | null;
  onConfirm: (profile: PlayerProfile) => void;
  /** Presente quando é edição de um personagem existente */
  onCancel?: () => void;
  /** Mostra o indicador "Conta → Personagem → Jornada" (primeiro acesso com conta) */
  showSteps?: boolean;
  /** Canto superior direito (ex.: conta conectada) */
  corner?: React.ReactNode;
}

const NAME_MAX = 20;

export default function CharacterCreation({ initial, onConfirm, onCancel, showSteps, corner }: CharacterCreationProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [race, setRace] = useState<Race | null>(initial?.race ?? null);

  const trimmed = name.trim();
  const ready = trimmed.length >= 2 && race !== null;
  const chosen = race ? RACES[race] : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ready) onConfirm({ name: trimmed, race: race! });
  };

  return (
    <GateShell step={showSteps ? 2 : undefined} maxWidth={760} corner={corner}>
      <form onSubmit={submit} className="panel w-full" style={{ padding: "18px 24px" }}>

        <div className="text-center mb-3">
          <h2 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 2px", color: "var(--color-accent)", textShadow: "0 0 30px rgba(240,192,64,0.35)" }}>
            {initial ? "Editar personagem" : "Crie seu personagem"}
          </h2>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 13 }}>
            Escolha seu nome e sua raça — cada raça faz parte de uma guilda.
          </p>
        </div>

        {/* Nome */}
        <label className="block mb-3">
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>Seu nome</span>
          <input
            autoFocus
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Lyra, Thorin, Grok…"
            className="field field-sm mt-2"
          />
          <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--color-muted)", textAlign: "right" }}>
            {trimmed.length}/{NAME_MAX}
          </span>
        </label>

        {/* Raças */}
        <span className="pixel-label" style={{ color: "var(--color-muted)" }}>Sua raça</span>
        <div className="grid gap-3 mt-2 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {RACE_ORDER.map((r, i) => {
            const info = RACES[r];
            const selected = race === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRace(r)}
                aria-pressed={selected}
                title={info.motto}
                className="race-card race-card-sm anim-rise"
                style={{
                  ...delay(260 + i * 90),
                  borderColor: selected ? info.color : undefined,
                  background: selected ? `linear-gradient(180deg, rgba(${info.rgb},0.18), rgba(${info.rgb},0.04))` : undefined,
                  boxShadow: selected ? `0 0 0 1px ${info.color}, 0 10px 28px rgba(${info.rgb},0.25)` : undefined,
                }}
              >
                <div className="race-portrait" style={{ borderColor: selected ? `rgba(${info.rgb},0.6)` : undefined }}>
                  <Sprite src={info.sprite} size={64} alt={info.name} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: selected ? info.color : "var(--color-text)" }}>{info.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", opacity: 0.85 }}>{info.guild}</span>
                
              </button>
            );
          })}
        </div>

        {/* Confirmação */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-muted)", minHeight: 20 }}>
            {ready && chosen ? (
              <>Boas-vindas, <b style={{ color: "var(--color-text)" }}>{trimmed}</b>! Sua guilda: <b style={{ color: chosen.color }}>{chosen.guild}</b>.</>
            ) : (
              "Escolha um nome (mín. 2 letras) e uma raça."
            )}
          </p>
          <div className="flex gap-2">
            {onCancel && <button type="button" className="btn-nav" onClick={onCancel}>Cancelar</button>}
            <button type="submit" className="btn-next" disabled={!ready}>
              {initial ? "Salvar" : "Entrar na Guilda →"}
            </button>
          </div>
        </div>
      </form>
    </GateShell>
  );
}
