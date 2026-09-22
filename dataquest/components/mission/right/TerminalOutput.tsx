"use client";

interface TerminalOutputProps {
  stdout: string;
  stderr: string;
  isRunning: boolean;
}

export default function TerminalOutput({ stdout, stderr, isRunning }: TerminalOutputProps) {
  const hasError = !!stderr;
  const content = hasError ? stderr : stdout;

  return (
    <div className={`terminal ${hasError ? "has-error" : ""}`}>
      {isRunning ? (
        <span style={{ color: "var(--color-accent)" }}>▌ Executando…</span>
      ) : content ? (
        content
      ) : (
        <span style={{ color: "#4b5566" }}>{">"} Aguardando execução… pressione ▶ Executar ou Ctrl+Enter</span>
      )}
    </div>
  );
}
