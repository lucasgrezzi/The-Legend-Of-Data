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
            "linear-gradient(180deg, rgba(14,17,23,0.55) 0%, rgba(14,17,23,0.72) 45%, rgba(14,17,23,0.88) 100%)",
        }}
      />
    </div>
  );
}
