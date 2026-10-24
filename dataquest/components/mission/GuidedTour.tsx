"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import Sprite from "@/components/ui/Sprite";

export interface TourStep {
  /** Valor do atributo data-tour do elemento iluminado */
  target: string;
  title: string;
  /** Trechos entre **asteriscos** ficam em destaque */
  text: string;
}

const CARD_W = 340;
const GAP = 16;
const PAD = 6;

/** Marca de "já viu o tutorial" — conveniência por navegador (o botão Como jogar sempre reabre) */
export const TOUR_SEEN_KEY = "dataquest-tour-seen";

export function tourSeen(): boolean {
  try { return localStorage.getItem(TOUR_SEEN_KEY) === "1"; } catch { return true; }
}
function markTourSeen() {
  try { localStorage.setItem(TOUR_SEEN_KEY, "1"); } catch { /* sem storage: tudo bem */ }
}

function Bold({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>)}</>;
}

/** Posição do balão: abaixo, acima, à direita ou à esquerda do alvo — o primeiro lado onde couber */
function placeCard(r: DOMRect, cardH: number) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const clampX = (x: number) => Math.max(GAP, Math.min(vw - CARD_W - GAP, x));
  const clampY = (y: number) => Math.max(GAP, Math.min(vh - cardH - GAP, y));
  const centerX = r.left + r.width / 2 - CARD_W / 2;
  if (r.bottom + GAP + cardH < vh - GAP) return { left: clampX(centerX), top: r.bottom + GAP };
  if (r.top - GAP - cardH > GAP) return { left: clampX(centerX), top: r.top - GAP - cardH };
  if (r.right + GAP + CARD_W < vw - GAP) return { left: r.right + GAP, top: clampY(r.top + r.height / 2 - cardH / 2) };
  if (r.left - GAP - CARD_W > GAP) return { left: r.left - GAP - CARD_W, top: clampY(r.top + r.height / 2 - cardH / 2) };
  // alvo enorme (ex.: o editor): balão por cima, no centro dele
  return { left: clampX(centerX), top: clampY(r.top + r.height / 2 - cardH / 2) };
}

export default function GuidedTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardH, setCardH] = useState(220);
  const [cardEl, setCardEl] = useState<HTMLDivElement | null>(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  const close = useCallback(() => { markTourSeen(); onClose(); }, [onClose]);

  // Mede o alvo (e acompanha rolagem/redimensionamento)
  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: "nearest" });
    const measure = () => setRect(el.getBoundingClientRect());
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step.target]);

  useLayoutEffect(() => {
    if (cardEl) setCardH(cardEl.offsetHeight);
  }, [cardEl, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); if (last) close(); else setI((n) => n + 1); }
      else if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, last]);

  const pos = rect ? placeCard(rect, cardH) : { left: window.innerWidth / 2 - CARD_W / 2, top: window.innerHeight / 2 - cardH / 2 };

  return createPortal(
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Como jogar">
      {rect ? (
        <div
          className="tour-spot"
          style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
        />
      ) : (
        <div className="tour-spot" style={{ top: "50%", left: "50%", width: 0, height: 0 }} />
      )}

      <div ref={setCardEl} className="tour-card rpg-frame anim-rise" style={{ left: pos.left, top: pos.top }} key={i}>
        <div className="flex items-center gap-3">
          <div className="grimoire-error-book" style={{ animation: "float 2.4s ease-in-out infinite" }}>
            <Sprite src="/assets/sprites/grimorio.png" size={32} alt="" />
          </div>
          <div className="min-w-0">
            <p className="tour-step" style={{ margin: 0 }}>Como jogar · {i + 1} de {steps.length}</p>
            <h3>{step.title}</h3>
          </div>
        </div>
        <p><Bold text={step.text} /></p>

        <div className="flex items-center justify-between gap-3" style={{ marginTop: 14 }}>
          <div className="tour-dots" aria-hidden>
            {steps.map((_, n) => <span key={n} className={n === i ? "is-on" : ""} />)}
          </div>
          <div className="flex items-center gap-2">
            {!last && <button type="button" className="link-btn" onClick={close}>Pular</button>}
            {i > 0 && <button type="button" className="btn-nav btn-pixel is-compact" onClick={() => setI(i - 1)}>←</button>}
            <button
              type="button"
              className="btn-next btn-pixel is-compact"
              autoFocus
              onClick={() => (last ? close() : setI(i + 1))}
            >
              {last ? "Bora jogar!" : "Próximo →"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Passos do tutorial para a missão atual (pula alvos que a fase não tem) */
export function missionTourSteps(opts: { hasBlanks: boolean; hasGrimoire: boolean; hasData: boolean; language: "python" | "sql" }): TourStep[] {
  const steps: (TourStep | false)[] = [
    {
      target: "quest",
      title: "A QUEST é o seu objetivo",
      text: "Este pergaminho diz **o que** fazer na fase e qual resultado o jogo espera ver. **Como** fazer é com você — é aí que se aprende.",
    },
    {
      target: "tab-estudo",
      title: "Estudo: a aula da fase",
      text: "Aqui eu ensino a parte de programação que a fase pede, com exemplos. **Não sabe por onde começar? Leia o Estudo primeiro.** É de graça. Na aba Lore fica a história.",
    },
    opts.hasData && {
      target: "tab-dados",
      title: "Dados: a tabela da fase",
      text: "Mostra as tabelas que você vai consultar — nomes das colunas e algumas linhas. Use os nomes **exatamente** como aparecem.",
    },
    {
      target: "editor",
      title: "O editor: onde você escreve",
      text: opts.hasBlanks
        ? `Este é o seu código em ${opts.language === "sql" ? "SQL" : "Python"}. Nesta fase ele já vem quase pronto: **troque cada ___ pelo que falta**. As linhas com # são comentários — o computador ignora, são recados para você.`
        : `Aqui você escreve o código em ${opts.language === "sql" ? "SQL" : "Python"}. Clique e digite. As linhas com ${opts.language === "sql" ? "--" : "#"} são comentários: recados que o computador ignora.`,
    },
    {
      target: "run",
      title: "▶ Executar: testar à vontade",
      text: "Roda o código e mostra o resultado. **Teste quantas vezes quiser — não conta como erro.** Atalho: Ctrl + Enter.",
    },
    {
      target: "output",
      title: "Saída: o que o código mostra",
      text: "O resultado aparece aqui. Se algo der errado, eu **traduzo o erro** e digo em que linha está e como consertar.",
    },
    {
      target: "submit",
      title: "Enviar Resposta: valendo!",
      text: "Quando a Saída estiver igual à da QUEST, envie. Acertou: ganha **XP** (pontos que fazem você subir de nível) e **moedas**. Errou: conta uma tentativa, e tudo bem.",
    },
    opts.hasGrimoire && {
      target: "tab-grimorio",
      title: "Travou? O Grimório (eu!)",
      text: "Eu vendo **dicas** em troca de moedas. Depois de 3 envios errados, também mostro a solução completa — mas aí a fase vale metade do XP.",
    },
    {
      target: "player",
      title: "Sua ficha de personagem",
      text: "Seu nível, XP e moedas ficam aqui. Clique para ver a ficha completa. Pronto — o resto se aprende jogando!",
    },
  ];
  return steps.filter(Boolean) as TourStep[];
}
