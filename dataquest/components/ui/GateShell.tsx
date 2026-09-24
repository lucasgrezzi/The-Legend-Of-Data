import WorldBackground from "./WorldBackground";

/** Atraso da animação de entrada (.anim-rise / .anim-bob) */
export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const STEPS = ["Conta", "Personagem", "Jornada"];

interface GateShellProps {
  /** Etapa atual do primeiro acesso (1 = conta, 2 = personagem). Sem valor, o indicador não aparece. */
  step?: 1 | 2;
  /** Largura do painel central */
  maxWidth: number;
  /** Algo no canto superior direito (ex.: conta conectada) */
  corner?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Moldura das telas de entrada (login → criação de personagem): fundo do mundo, logo,
 * indicador de etapas e painel central — tudo alinhado no mesmo eixo e com entrada em cascata.
 */
export default function GateShell({ step, maxWidth, corner, children }: GateShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <WorldBackground />

      {corner && (
        <div className="fixed anim-rise" style={{ top: 16, right: 24, zIndex: 20, ...delay(400) }}>
          {corner}
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-6" style={{ maxWidth }}>
        {/* Logo + tagline dentro de um painel (texto nunca direto sobre a imagem) */}
        <div className="panel anim-rise text-center" style={{ padding: "18px 28px", borderRadius: 16 }}>
          <h1 className="gate-logo">DataQuest</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
            Aprenda Python, SQL e análise de dados jogando um RPG
          </p>
        </div>

        {step && (
          <nav className="panel stepper anim-rise" aria-label="Etapas" style={{ padding: "10px 18px", borderRadius: 999, ...delay(80) }}>
            {STEPS.map((label, i) => {
              const n = i + 1;
              const state = n < step ? "is-done" : n === step ? "is-active" : "";
              return (
                <span key={label} className="flex items-center gap-[10px]">
                  {i > 0 && <span className="step-line" aria-hidden />}
                  <span className={`step ${state}`} aria-current={n === step ? "step" : undefined}>
                    <span className="step-dot">{n < step ? "✓" : n}</span>
                    {label}
                  </span>
                </span>
              );
            })}
          </nav>
        )}

        <div className="w-full anim-rise" style={delay(160)}>
          {children}
        </div>
      </div>
    </div>
  );
}
