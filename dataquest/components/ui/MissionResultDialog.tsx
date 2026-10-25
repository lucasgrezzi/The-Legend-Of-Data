"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { computeLevel, SOLUTION_UNLOCK_FAILS } from "@/lib/xp";
import XPBar from "./XPBar";
import Sprite from "./Sprite";
import Icon from "./Icon";
import { play } from "@/lib/sfx";
import { burst, centerOf } from "@/lib/juice";

export interface MissionResult {
  passed: boolean;
  feedback: string;
  xpGained: number;
  coinsGained: number;
  /** XP total antes de ganhar esta recompensa */
  prevXP: number;
  /** Concluiu depois de revelar a solução (ganhou metade do XP) */
  penalized?: boolean;
  /** Número da tentativa errada (só em erro, missão ainda não concluída) */
  fails?: number;
  solutionRevealed?: boolean;
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
  const levelRef = useRef<HTMLDivElement>(null);

  // Subiu de nível: fanfarra + chuva de faíscas quando o aviso aparece
  useEffect(() => {
    if (!leveledUp) return;
    const t = setTimeout(() => {
      play("levelup");
      const c = centerOf(levelRef.current);
      burst(c.x, c.y, { count: 40, spread: 200, colors: ["#f5c451", "#fff3c4", "#ffffff", "#ff9f43"] });
    }, 700);
    return () => clearTimeout(t);
  }, [leveledUp]);

  return (
    <>
      <div
        className="flex flex-col items-center text-center px-8 pt-8 pb-6"
        style={{ background: "radial-gradient(ellipse at top, rgba(245,196,81,0.2), transparent 70%)" }}
      >
        <div style={{ animation: "float 2.4s ease-in-out infinite" }}><Sprite src="/assets/sprites/missao-concluida.png" size={96} alt="" /></div>
        <p className="pixel-title mt-5" style={{ color: "var(--color-accent)", fontSize: 14 }}>
          Missão Concluída!
        </p>
        {result.xpGained > 0 && (
          <p
            className="mt-3"
            style={{ margin: "12px 0 0", fontSize: 40, fontWeight: 900, lineHeight: 1.1, color: "var(--color-xp)", textShadow: "0 0 28px rgba(245,196,81,0.45)" }}
          >
            +{xp} XP
          </p>
        )}
        {result.coinsGained > 0 && (
          <p className="flex items-center gap-1" style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "var(--color-xp)" }}>
            <Sprite src="/assets/sprites/moedas.png" size={32} /> +{result.coinsGained} moedas
          </p>
        )}
        {result.penalized && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
            Metade do XP — a solução foi revelada no Grimório.
          </p>
        )}
      </div>

      <div className="px-8 pb-6 flex flex-col gap-4">
        <XPBar totalXP={newXP} fromXP={result.prevXP} />

        {leveledUp && (
          <div
            ref={levelRef}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: "rgba(245,196,81,0.1)",
              border: "1px solid rgba(245,196,81,0.35)",
              borderRadius: 12,
              animation: "pop-in 0.3s 0.6s both",
            }}
          >
            <span className="level-badge" style={{ width: 38, height: 38, fontSize: 12, borderRadius: 10 }}>{after.level}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Você subiu para o <b style={{ color: "var(--color-accent)" }}>Nível {after.level} — {after.label}</b>!
            </span>
          </div>
        )}
      </div>

      <div className="modal-foot">
        <button className="btn-nav" onClick={onClose}>Ficar aqui</button>
        <Link href={nextHref ?? "/map"} className="btn-next" autoFocus>
          {nextHref ? <>Próxima missão <Icon name="arrowRight" size={16} /></> : "Voltar ao mapa"}
        </Link>
      </div>
    </>
  );
}

function ErrorBody({ result, onClose }: { result: MissionResult; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center gap-4 px-7 pt-7 pb-4">
        <span
          className="grid place-items-center shrink-0"
          style={{ width: 52, height: 52, borderRadius: 16, color: "var(--color-error)", background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)" }}
        >
          <Icon name="alert" size={26} />
        </span>
        <div>
          <p className="pixel-title" style={{ margin: 0, color: "var(--color-error)" }}>Ainda não…</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-muted)", margin: "2px 0 0" }}>
            O feitiço falhou. Compare o resultado e tente de novo.
          </p>
        </div>
      </div>
      <div className="px-7 pb-6">
        <pre
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "var(--editor-bg-2)",
            color: "var(--color-text)",
            border: "1px solid rgba(255,107,107,0.28)",
            borderLeft: "3px solid var(--color-error)",
            borderRadius: 10,
            padding: "12px 14px",
            maxHeight: 260,
            overflow: "auto",
          }}
        >
          {result.feedback}
        </pre>
        {result.fails !== undefined && (
          <p style={{ margin: "12px 0 0", fontSize: 13.5, fontWeight: 600, color: "var(--color-muted)" }}>
            Tentativa errada nº <b style={{ color: "var(--color-error)" }}>{result.fails}</b>.{" "}
            {result.solutionRevealed
              ? "A solução está no Grimório."
              : result.fails >= SOLUTION_UNLOCK_FAILS
                ? "A solução completa já pode ser revelada no Grimório — mas custa metade do XP."
                : "Releia o Estudo ou compre uma dica no Grimório."}
          </p>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn-submit" onClick={onClose} autoFocus><Icon name="reset" size={16} /> Tentar de novo</button>
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
