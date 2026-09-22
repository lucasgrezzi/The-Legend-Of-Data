"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { computeLevel, GRIMOIRE_UNLOCK_FAILS } from "@/lib/xp";
import XPBar from "./XPBar";
import Sprite from "./Sprite";

export interface MissionResult {
  passed: boolean;
  feedback: string;
  xpGained: number;
  /** XP total antes de ganhar esta recompensa */
  prevXP: number;
  /** Concluiu com o Grimório aberto (ganhou metade) */
  penalized?: boolean;
  /** Número da tentativa errada (só em erro, missão ainda não concluída) */
  fails?: number;
  grimoireOpened?: boolean;
}

interface MissionResultDialogProps {
  result: MissionResult | null;
  /** Para onde vai o botão principal no sucesso (null = sem próxima missão → mapa) */
  nextHref: string | null;
  onClose: () => void;
}

function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function SuccessBody({ result, nextHref, onClose }: { result: MissionResult; nextHref: string | null; onClose: () => void }) {
  const xp = useCountUp(result.xpGained);
  const newXP = result.prevXP + result.xpGained;
  const before = computeLevel(result.prevXP);
  const after = computeLevel(newXP);
  const leveledUp = after.level > before.level;

  return (
    <>
      <div
        className="flex flex-col items-center text-center px-8 pt-8 pb-6"
        style={{ background: "radial-gradient(ellipse at top, rgba(240,192,64,0.18), transparent 70%)" }}
      >
        <div style={{ animation: "float 2.4s ease-in-out infinite" }}><Sprite src="/assets/sprites/missao-concluida.png" size={96} alt="" /></div>
        <p className="pixel-title mt-5" style={{ color: "var(--color-accent)", fontSize: 14 }}>
          Missão Concluída!
        </p>
        {result.xpGained > 0 && (
          <p
            className="mt-3"
            style={{ fontSize: 34, fontWeight: 800, color: "var(--color-xp)", textShadow: "0 0 24px rgba(240,192,64,0.5)" }}
          >
            +{xp} XP
          </p>
        )}
        {result.penalized && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
            Metade da recompensa — o Grimório foi aberto nesta missão.
          </p>
        )}
      </div>

      <div className="px-8 pb-6 flex flex-col gap-4">
        <XPBar totalXP={newXP} fromXP={result.prevXP} />

        {leveledUp && (
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: "rgba(240,192,64,0.1)",
              border: "1px solid rgba(240,192,64,0.35)",
              borderRadius: 10,
              animation: "pop-in 0.3s 0.6s both",
            }}
          >
            <span style={{ fontSize: 22 }}>⬆️</span>
            <span style={{ fontSize: 14 }}>
              Você subiu para o <b style={{ color: "var(--color-accent)" }}>Nível {after.level} — {after.label}</b>!
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 px-6 py-4" style={{ background: "var(--color-panel)", borderTop: "1px solid var(--color-border)" }}>
        <button className="btn-nav" onClick={onClose}>Ficar aqui</button>
        <Link href={nextHref ?? "/map"} className="btn-next" autoFocus>
          {nextHref ? "Próxima missão →" : "Voltar ao mapa"}
        </Link>
      </div>
    </>
  );
}

function ErrorBody({ result, onClose }: { result: MissionResult; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center gap-4 px-7 pt-7 pb-4">
        <span style={{ fontSize: 36, lineHeight: 1 }}>💥</span>
        <div>
          <p className="pixel-title" style={{ color: "var(--color-error)" }}>Ainda não…</p>
          <p style={{ fontSize: 13, color: "var(--color-muted)", margin: 0 }}>
            O feitiço falhou. Compare o resultado e tente de novo.
          </p>
        </div>
      </div>
      <div className="px-7 pb-6">
        <pre
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "#060a10",
            color: "var(--color-text)",
            border: "1px solid rgba(255,92,92,0.3)",
            borderLeft: "3px solid var(--color-error)",
            borderRadius: 8,
            padding: "12px 14px",
            maxHeight: 260,
            overflow: "auto",
          }}
        >
          {result.feedback}
        </pre>
        {result.fails !== undefined && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
            Tentativa errada nº <b style={{ color: "var(--color-error)" }}>{result.fails}</b>.{" "}
            {result.grimoireOpened
              ? "O Grimório está aberto na aba ao lado."
              : result.fails >= GRIMOIRE_UNLOCK_FAILS
                ? "O Grimório já pode ser aberto — mas custa metade do XP."
                : `O Grimório abre após ${GRIMOIRE_UNLOCK_FAILS} tentativas erradas.`}
          </p>
        )}
      </div>
      <div className="flex justify-end px-6 py-4" style={{ background: "var(--color-panel)", borderTop: "1px solid var(--color-border)" }}>
        <button className="btn-submit" onClick={onClose} autoFocus>Tentar de novo</button>
      </div>
    </>
  );
}

export default function MissionResultDialog({ result, nextHref, onClose }: MissionResultDialogProps) {
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, onClose]);

  if (!result) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${result.passed ? "" : "is-error"}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {result.passed
          ? <SuccessBody result={result} nextHref={nextHref} onClose={onClose} />
          : <ErrorBody result={result} onClose={onClose} />}
      </div>
    </div>
  );
}
