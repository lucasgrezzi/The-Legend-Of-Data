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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <WorldBackground />

      {corner && (
        <div className="fixed anim-rise" style={{ top: 16, right: 24, zIndex: 20, ...delay(400) }}>
          {corner}
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-3" style={{ maxWidth }}>
        {/* Logo + tagline + etapas num único painel compacto (texto nunca direto sobre a imagem) */}
        <header className="panel anim-rise flex flex-col items-center gap-2" style={{ padding: "10px 22px", borderRadius: 14 }}>
          <div className="text-center">
            <h1 className="gate-logo">DataQuest</h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
              Aprenda Python, SQL e análise de dados jogando um RPG
            </p>
          </div>

          {step && (
            <nav className="stepper" aria-label="Etapas" style={{ paddingTop: 8, borderTop: "1px solid var(--color-border)", width: "100%" }}>
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
        </header>

        <div className="w-full anim-rise" style={delay(160)}>
          {children}
        </div>
      </div>
    </div>
  );
}
