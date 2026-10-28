import type { Track } from "@/types";

// Vaga-lumes: posições fixas (sem Math.random, para não divergir entre servidor e cliente)
const FIREFLIES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: 25 + ((i * 53) % 70),
  dur: 9 + (i % 5) * 2.5,
  delay: -((i * 1.7) % 12),
  dx: ((i % 2 ? 1 : -1) * (20 + (i * 7) % 30)),
}));

/** Partículas de cada região, também em posições fixas */
const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 41 + 7) % 100,
  top: (i * 59 + 13) % 100,
  dur: 10 + (i % 6) * 2.2,
  delay: -((i * 2.3) % 16),
  dx: (i % 2 ? 1 : -1) * (24 + (i * 11) % 50),
  size: 3 + (i % 3),
  tone: i % 3,
}));

/** Ponto do farol na imagem regiao-dataviz.png (em % da cena), de onde sai o facho de luz */
const LIGHTHOUSE = { x: 86.5, y: 11.5 };

/**
 * Fundo do mundo (pixel art) com véu escuro por cima.
 * Sem `region`: o mapa do reino (Mapa-Múndi, loja, ranking, entrada).
 * Com `region`: a cena daquela região (floresta, catacumbas, forja, costa do farol), com partículas próprias.
 * O véu garante contraste: texto NUNCA fica direto sobre a imagem —
 * tudo que tem texto vai dentro de painéis sólidos (.panel).
 */
export default function WorldBackground({ region }: { region?: Track }) {
  const src = region ? `/assets/bg/regiao-${region}.png` : "/assets/bg/mapa-mundo.png";
  return (
    <div aria-hidden className={`fixed inset-0${region ? ` region-bg is-${region}` : ""}`} style={{ zIndex: -1, background: "var(--color-bg)", overflow: "hidden" }}>
      {/* a cena tem o mesmo enquadramento de background-size: cover, para as partículas ficarem no lugar certo da imagem */}
      <div className="region-scene">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${src})`, backgroundSize: "100% 100%", imageRendering: "pixelated" }}
        />
        {/* mar do reino: 24 quadros (mapa-mar.png) só da faixa da água, colados por cima do mesmo lugar da imagem */}
        {!region && <span className="world-sea" />}
        {region === "dataviz" && (
          <span className="lighthouse-beam" style={{ left: `${LIGHTHOUSE.x}%`, top: `${LIGHTHOUSE.y}%` }} />
        )}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: region
            // nas regiões o véu escurece o meio (onde ficam as fases) e deixa as laterais aparecerem
            ? "linear-gradient(90deg, rgba(10,13,20,0.18) 0%, rgba(10,13,20,0.62) 30%, rgba(10,13,20,0.7) 50%, rgba(10,13,20,0.62) 70%, rgba(10,13,20,0.18) 100%), " +
              "linear-gradient(180deg, rgba(10,13,20,0.35) 0%, transparent 18%, transparent 80%, rgba(10,13,20,0.5) 100%)"
            : "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 40%, rgba(5,7,11,0.55) 100%), " +
              "linear-gradient(180deg, rgba(14,17,23,0.5) 0%, rgba(14,17,23,0.68) 45%, rgba(14,17,23,0.86) 100%)",
        }}
      />
      {region === "sql" && <div className="crypt-mist" />}
      {region === "pandas" && <div className="forge-heat" />}
      {region
        ? PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`region-particle is-tone-${p.tone}`}
              style={{
                left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size,
                "--dur": `${p.dur}s`, "--delay": `${p.delay}s`, "--dx": `${p.dx}px`,
              } as React.CSSProperties}
            />
          ))
        : FIREFLIES.map((f, i) => (
            <span
              key={i}
              className="firefly"
              style={{
                left: `${f.left}%`, top: `${f.top}%`,
                "--dur": `${f.dur}s`, "--delay": `${f.delay}s`, "--dx": `${f.dx}px`,
              } as React.CSSProperties}
            />
          ))}
    </div>
  );
}
