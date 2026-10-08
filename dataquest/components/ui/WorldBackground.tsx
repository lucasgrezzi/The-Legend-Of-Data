// Vaga-lumes: posições fixas (sem Math.random, para não divergir entre servidor e cliente)
const FIREFLIES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: 25 + ((i * 53) % 70),
  dur: 9 + (i % 5) * 2.5,
  delay: -((i * 1.7) % 12),
  dx: ((i % 2 ? 1 : -1) * (20 + (i * 7) % 30)),
}));

/**
 * Fundo do mundo (mapa pixel art) com véu escuro por cima.
 * O véu garante contraste: texto NUNCA fica direto sobre a imagem —
 * tudo que tem texto vai dentro de painéis sólidos (.panel).
 */
export default function WorldBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10" style={{ background: "var(--color-bg)" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/assets/bg/mapa-mundo.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 40%, rgba(5,7,11,0.55) 100%), " +
            "linear-gradient(180deg, rgba(14,17,23,0.5) 0%, rgba(14,17,23,0.68) 45%, rgba(14,17,23,0.86) 100%)",
        }}
      />
      {FIREFLIES.map((f, i) => (
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
