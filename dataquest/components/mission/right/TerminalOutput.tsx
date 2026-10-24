"use client";

import type { FriendlyError } from "@/lib/friendlyErrors";
import GrimoireError from "./GrimoireError";

interface TerminalOutputProps {
  stdout: string;
  stderr: string;
  isRunning: boolean;
  /** Erro já traduzido pelo Grimório (no lugar do stderr cru) */
  friendly?: FriendlyError | null;
  language?: "python" | "sql";
}

export default function TerminalOutput({ stdout, stderr, isRunning, friendly, language = "python" }: TerminalOutputProps) {
  if (isRunning) {
    return <div className="terminal"><span style={{ color: "var(--color-accent)" }}>▌ Executando…</span></div>;
  }

  if (stderr) {
    return (
      <>
        {/* o que foi impresso antes do erro ajuda a ver até onde o código chegou */}
        {stdout && <div className="terminal" style={{ paddingBottom: 0 }}>{stdout}</div>}
        {friendly
          ? <GrimoireError error={friendly} language={language} />
          : <div className="terminal has-error">{stderr}</div>}
      </>
    );
  }

  return (
    <div className="terminal">
      {stdout || (
        <span style={{ color: "#4b5566" }}>{">"} Aguardando execução… pressione ▶ Executar ou Ctrl+Enter</span>
      )}
    </div>
  );
}
