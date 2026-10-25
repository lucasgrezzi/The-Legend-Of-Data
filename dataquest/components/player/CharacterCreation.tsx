"use client";

import { useState } from "react";
import type { PlayerProfile, Race } from "@/types";
import { RACES, RACE_ORDER } from "@/lib/races";
import Sprite from "@/components/ui/Sprite";
import GateShell, { delay } from "@/components/ui/GateShell";
import Icon from "@/components/ui/Icon";

interface CharacterCreationProps {
  onConfirm: (profile: PlayerProfile) => void;
  /** Mostra o indicador "Conta → Personagem → Jornada" (primeiro acesso com conta) */
  showSteps?: boolean;
  /** Canto superior direito (ex.: conta conectada) */
  corner?: React.ReactNode;
}

const NAME_MAX = 20;

/** Criação do personagem — acontece uma única vez; nome e raça não podem ser alterados depois. */
export default function CharacterCreation({ onConfirm, showSteps, corner }: CharacterCreationProps) {
  const [name, setName] = useState("");
  const [race, setRace] = useState<Race | null>(null);

  const trimmed = name.trim();
  const ready = trimmed.length >= 2 && race !== null;
  const chosen = race ? RACES[race] : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ready) onConfirm({ name: trimmed, race: race! });
  };

  return (
    <GateShell step={showSteps ? 2 : undefined} maxWidth={760} corner={corner}>
      <form onSubmit={submit} className="panel rpg-frame w-full" style={{ padding: "22px 26px" }}>

        <div className="text-center mb-3">
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px", color: "var(--color-text)" }}>
            Crie seu personagem
          </h2>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 14, fontWeight: 600 }}>
            Escolha seu nome e sua raça — cada raça faz parte de uma guilda. Escolha com calma: não dá para mudar depois.
          </p>
        </div>

        {/* Nome */}
        <label className="block mb-3">
          <span className="field-label">Seu nome</span>
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
        <span className="field-label">Sua raça</span>
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
                <span style={{ fontSize: 17, fontWeight: 900, color: selected ? info.color : "var(--color-text)" }}>{info.name}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-2)" }}>{info.guild}</span>
                
              </button>
            );
          })}
        </div>

        {/* Confirmação */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-muted)", minHeight: 20 }}>
            {ready && chosen ? (
              <>Boas-vindas, <b style={{ color: "var(--color-text)" }}>{trimmed}</b>! Sua guilda: <b style={{ color: chosen.color }}>{chosen.guild}</b>.</>
            ) : (
              "Escolha um nome (mín. 2 letras) e uma raça."
            )}
          </p>
          <div className="flex gap-2">
            <button type="submit" className="btn-next" disabled={!ready}>
              Entrar na guilda <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </div>
      </form>
    </GateShell>
  );
}
