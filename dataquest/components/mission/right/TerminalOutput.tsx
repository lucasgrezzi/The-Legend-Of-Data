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
        <span style={{ color: "#ffff00" }}>▌ Executando...</span>
      ) : content ? (
        content
      ) : (
        <span style={{ color: "#555" }}>{">"} Aguardando execucao...</span>
      )}
    </div>
  );
}
