"use client";

import { useLayoutEffect, useState } from "react";

/** Até onde o mapa estava revelado na última visita (conveniência por navegador — pode faltar) */
const SEEN_KEY = "dataquest-fog-seen";

function readSeen(): string | null {
  try { return localStorage.getItem(SEEN_KEY); } catch { return null; }
}
function writeSeen(v: string) {
  try { localStorage.setItem(SEEN_KEY, v); } catch { /* sem storage: só não anima */ }
}

/**
 * Qual âncora mostrar agora. Se o jogador avançou desde a última visita, começa na âncora antiga e,
 * depois de um instante, passa para a nova — a neblina recua com animação.
 * `order` = posição de cada âncora no mapa (maior = mais abaixo).
 */
export function useFogReveal(anchor: string, order: (a: string) => number, enabled: boolean) {
  const [shown, setShown] = useState(anchor);
  const [revealing, setRevealing] = useState(false);

  // layout effect: volta para a âncora antiga ANTES da primeira pintura (sem piscar)
  useLayoutEffect(() => {
    // só depois que o progresso real carregou — senão gravaria a âncora do estado inicial
    if (!enabled) return;
    const seen = readSeen();
    writeSeen(anchor);
    if (seen === null || order(seen) < 0 || order(seen) >= order(anchor)) {
      setShown(anchor);
      return;
    }
    setShown(seen);
    const t1 = setTimeout(() => { setShown(anchor); setRevealing(true); }, 650);
    const t2 = setTimeout(() => setRevealing(false), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [anchor, enabled, order]);

  return { shown, revealing };
}

// Nuvens em pixel art (scripts/gerar_nuvens.py) — posições fixas para não "pular" entre renders
const EDGE_CLOUDS = [
  { src: 2, left: -4, top: 18, scale: 5, dur: 26, delay: 0 },
  { src: 1, left: 22, top: 46, scale: 4, dur: 21, delay: -6 },
  { src: 3, left: 44, top: 8, scale: 5, dur: 24, delay: -12 },
  { src: 2, left: 63, top: 40, scale: 4, dur: 29, delay: -3 },
  { src: 1, left: 84, top: 12, scale: 5, dur: 23, delay: -9 },
];
const DEEP_CLOUDS = [
  { src: 3, left: 6, scale: 4 }, { src: 1, left: 70, scale: 5 }, { src: 2, left: 36, scale: 5 },
  { src: 3, left: 82, scale: 4 }, { src: 1, left: 14, scale: 5 }, { src: 2, left: 56, scale: 4 },
];
const CLOUD_W = { 1: 48, 2: 64, 3: 36 } as Record<number, number>;

interface MapFogProps {
  /** px do topo do mapa onde a neblina começa */
  top: number;
  /** altura total do mapa — a neblina vai até o fim dele */
  mapHeight: number;
  revealing: boolean;
  title: string;
  text: React.ReactNode;
}

export default function MapFog({ top, mapHeight, revealing, title, text }: MapFogProps) {
  const deepCount = Math.max(0, Math.floor((mapHeight - top - 260) / 190));

  return (
    <div className={`map-fog${revealing ? " is-revealing" : ""}`} style={{ top }}>
      <div className="map-fog-veil" />
      <div className="map-fog-mist" />
      <div className="map-fog-mist is-slow" />

      {EDGE_CLOUDS.map((c, i) => (
        <img
          key={`e${i}`}
          src={`/assets/fog/nuvem-${c.src}.png`}
          alt=""
          className="map-fog-cloud"
          style={{
            left: `${c.left}%`, top: c.top, width: CLOUD_W[c.src] * c.scale,
            animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`,
          }}
        />
      ))}
      {Array.from({ length: deepCount }, (_, i) => {
        const c = DEEP_CLOUDS[i % DEEP_CLOUDS.length];
        return (
          <img
            key={`d${i}`}
            src={`/assets/fog/nuvem-${c.src}.png`}
            alt=""
            className="map-fog-cloud is-deep"
            style={{
              left: `${c.left}%`, top: 300 + i * 190, width: CLOUD_W[c.src] * c.scale,
              animationDuration: `${22 + (i % 4) * 5}s`, animationDelay: `${-i * 4}s`,
            }}
          />
        );
      })}

      <div className="map-fog-card panel">
        <img src="/assets/fog/nuvem-3.png" alt="" width={72} style={{ imageRendering: "pixelated", display: "inline-block" }} />
        <p className="pixel-label" style={{ margin: "10px 0 0", color: "var(--color-accent)" }}>
          {revealing ? "A neblina se dissipa..." : title}
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>{text}</p>
      </div>
    </div>
  );
}
