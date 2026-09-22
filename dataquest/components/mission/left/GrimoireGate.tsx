"use client";

import { useEffect, useState } from "react";
import { GRIMOIRE_UNLOCK_FAILS, grimoireXP } from "@/lib/xp";
import Sprite from "@/components/ui/Sprite";

interface GrimoireGateProps {
  fails: number;
  xpReward: number;
  onOpen: () => void;
}

/**
 * Conteúdo da aba Grimório enquanto ele não foi aberto:
 * - selado: ainda não errou o suficiente
 * - liberado: pode abrir, mas perde metade do XP (pede confirmação)
 */
export default function GrimoireGate({ fails, xpReward, onOpen }: GrimoireGateProps) {
  const [confirming, setConfirming] = useState(false);
  const remaining = Math.max(0, GRIMOIRE_UNLOCK_FAILS - fails);
  const unlocked = remaining === 0;
  const half = grimoireXP(xpReward);

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setConfirming(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  return (
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <div style={{ filter: unlocked ? undefined : "grayscale(1) brightness(0.7)" }}>
        <Sprite src="/assets/sprites/grimorio.png" size={64} alt="" />
      </div>

      {unlocked ? (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>O Grimório pode ser aberto</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-muted)", maxWidth: 420 }}>
            Ele revela o caminho da resolução. Mas a Guilda cobra um preço: esta missão passará a valer
            só <b style={{ color: "var(--color-xp)" }}>+{half} XP</b> em vez de +{xpReward}.
          </p>
          <button className="btn-submit" onClick={() => setConfirming(true)}>Abrir o Grimório</button>
        </>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>O Grimório está selado</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-muted)", maxWidth: 420 }}>
            Tente resolver sozinho primeiro. O selo se rompe depois de {GRIMOIRE_UNLOCK_FAILS} tentativas erradas.
          </p>
          <div className="flex gap-2" aria-label={`${fails} de ${GRIMOIRE_UNLOCK_FAILS} tentativas erradas`}>
            {Array.from({ length: GRIMOIRE_UNLOCK_FAILS }, (_, i) => (
              <span
                key={i}
                style={{
                  width: 28, height: 8, borderRadius: 4,
                  background: i < fails ? "var(--color-error)" : "var(--color-border)",
                }}
              />
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>
            Faltam {remaining} {remaining === 1 ? "tentativa" : "tentativas"}
          </p>
        </>
      )}

      {confirming && (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 px-7 pt-7 pb-5 text-left">
              <Sprite src="/assets/sprites/grimorio.png" size={64} alt="" />
              <div>
                <p className="pixel-title" style={{ color: "var(--color-accent)", margin: 0 }}>Tem certeza?</p>
                <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7 }}>
                  Ao abrir o Grimório você <b style={{ color: "var(--color-error)" }}>perde metade do XP</b> desta missão.
                  Você ainda passa de fase, mas ganha só <b style={{ color: "var(--color-xp)" }}>+{half} XP</b> em vez de +{xpReward}.
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-muted)" }}>Essa escolha não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4" style={{ background: "var(--color-panel)", borderTop: "1px solid var(--color-border)" }}>
              <button className="btn-nav" onClick={() => setConfirming(false)} autoFocus>Tentar mais</button>
              <button className="btn-next" onClick={() => { setConfirming(false); onOpen(); }}>Abrir (−50% XP)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
