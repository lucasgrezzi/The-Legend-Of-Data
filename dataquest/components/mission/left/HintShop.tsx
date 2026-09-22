"use client";

import { useEffect, useState } from "react";
import type { Mission } from "@/types";
import { SOLUTION_UNLOCK_FAILS, hintCost, solutionXP } from "@/lib/xp";
import Sprite from "@/components/ui/Sprite";

interface HintShopProps {
  mission: Mission;
  color: string;
  coins: number;
  fails: number;
  hintsBought: number;
  solutionRevealed: boolean;
  /** Missão já concluída → tudo liberado de graça (para revisar) */
  free: boolean;
  onBuyHint: (cost: number) => void;
  onRevealSolution: () => void;
}

function Coin({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1" style={{ color: "var(--color-xp)", fontWeight: 800, verticalAlign: "middle" }}>
      <Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-8px -4px" }} />
      {n}
    </span>
  );
}

/**
 * Aba Grimório: o livro vivo vende dicas em troca de moedas (em ordem, cada uma mais cara).
 * A solução completa só aparece após SOLUTION_UNLOCK_FAILS erros e custa metade do XP.
 */
export default function HintShop({
  mission, color, coins, fails, hintsBought, solutionRevealed, free, onBuyHint, onRevealSolution,
}: HintShopProps) {
  const [confirming, setConfirming] = useState(false);
  const shown = free ? mission.hints.length : hintsBought;
  const nextIdx = shown < mission.hints.length ? shown : null;
  const nextCost = nextIdx !== null ? hintCost(nextIdx) : 0;
  const failsLeft = Math.max(0, SOLUTION_UNLOCK_FAILS - fails);
  const showSolution = free || solutionRevealed;

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setConfirming(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  if (mission.hints.length === 0 && !mission.solution) {
    return <p style={{ margin: 0, fontSize: 14, color: "var(--color-muted)" }}>O Grimório não tem nada a dizer sobre esta missão.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Sprite src="/assets/sprites/grimorio.png" size={64} />
        <p style={{ margin: 0, fontSize: 14, color: "var(--color-muted)", lineHeight: 1.6 }}>
          {free
            ? "Missão concluída — o Grimório mostra tudo de graça para você revisar."
            : <>&ldquo;Perdido, Arquivista? Tenho dicas&hellip; por um preço.&rdquo; Você tem <Coin n={coins} />.</>}
        </p>
      </div>

      {/* Dicas compradas */}
      {mission.hints.slice(0, shown).map((h, i) => (
        <div key={i} className="hint-card is-open" style={{ borderColor: `${color}` }}>
          <p className="pixel-label" style={{ margin: "0 0 6px", color }}>Dica {i + 1}</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{h}</p>
        </div>
      ))}

      {/* Próxima dica à venda */}
      {nextIdx !== null && (
        <div className="hint-card flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="pixel-label" style={{ margin: 0, color: "var(--color-muted)" }}>Dica {nextIdx + 1} de {mission.hints.length}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
              {coins >= nextCost ? "Selada. Compre para ler." : `Faltam ${nextCost - coins} moedas — conclua missões para ganhar mais.`}
            </p>
          </div>
          <button className="btn-submit" disabled={coins < nextCost} onClick={() => onBuyHint(nextCost)}>
            Comprar · {nextCost}
            <Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-10px -8px -10px -6px" }} />
          </button>
        </div>
      )}

      {/* Solução completa */}
      {mission.solution && (
        showSolution ? (
          <div className="hint-card is-open" style={{ borderColor: "var(--color-accent)" }}>
            <p className="pixel-label" style={{ margin: "0 0 8px", color: "var(--color-accent)" }}>Solução completa</p>
            <code className="code-block">{mission.solution}</code>
          </div>
        ) : (
          <div className="hint-card flex items-center justify-between gap-3 flex-wrap" style={{ borderStyle: "dashed" }}>
            <div>
              <p className="pixel-label" style={{ margin: 0, color: "var(--color-muted)" }}>Solução completa</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
                {failsLeft > 0
                  ? `Liberada após ${SOLUTION_UNLOCK_FAILS} respostas erradas (faltam ${failsLeft}). Custa metade do XP.`
                  : `Grátis em moedas, mas a missão passa a valer só +${solutionXP(mission.xpReward)} XP.`}
              </p>
            </div>
            <button className="btn-nav" disabled={failsLeft > 0} onClick={() => setConfirming(true)}
              style={failsLeft > 0 ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
              Revelar
            </button>
          </div>
        )
      )}

      {confirming && (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 px-7 pt-7 pb-5 text-left">
              <Sprite src="/assets/sprites/grimorio.png" size={64} />
              <div>
                <p className="pixel-title" style={{ color: "var(--color-accent)", margin: 0 }}>Revelar a solução?</p>
                <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7 }}>
                  Você verá o código completo, mas <b style={{ color: "var(--color-error)" }}>perde metade do XP</b> desta missão:
                  ganha só <b style={{ color: "var(--color-xp)" }}>+{solutionXP(mission.xpReward)} XP</b> em vez de +{mission.xpReward}.
                  As moedas da missão continuam as mesmas.
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-muted)" }}>Essa escolha não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4" style={{ background: "var(--color-panel)", borderTop: "1px solid var(--color-border)" }}>
              <button className="btn-nav" onClick={() => setConfirming(false)} autoFocus>Tentar mais</button>
              <button className="btn-next" onClick={() => { setConfirming(false); onRevealSolution(); }}>Revelar (−50% XP)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
