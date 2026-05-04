"use client";

import { useState, useCallback } from "react";
import type { Mission, RunResult, EngineStatus } from "@/types";
import CodeEditor from "./CodeEditor";
import TerminalOutput from "./TerminalOutput";
import TablePreview from "./TablePreview";
import GraphPanel from "./GraphPanel";

interface EditorPanelProps {
  mission: Mission;
  pyodideStatus: EngineStatus;
  onRun: (code: string) => Promise<RunResult>;
  onSubmit: (code: string) => Promise<void>;
  validated: boolean;
}

const LANG_ICON: Record<string, string> = {
  python: "🐍",
  sql: "🗄️",
};

const LANG_COLOR: Record<string, string> = {
  python: "var(--color-python)",
  sql:    "var(--color-sql)",
};

export default function EditorPanel({
  mission,
  pyodideStatus,
  onRun,
  onSubmit,
  validated,
}: EditorPanelProps) {
  const [code, setCode] = useState(mission.codeTemplate);
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      const r = await onRun(code);
      setResult(r);
    } finally {
      setIsRunning(false);
    }
  }, [code, onRun]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(code);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, onSubmit]);

  const handleCopy  = () => navigator.clipboard.writeText(code).catch(() => {});
  const handleClear = () => { setCode(mission.codeTemplate); setResult(null); };

  const isLoading = pyodideStatus === "loading";
  const busy = isRunning || isSubmitting || isLoading;
  const fileName = mission.editorLanguage === "python" ? "script.py" : "query.sql";
  const langColor = LANG_COLOR[mission.editorLanguage] ?? "var(--color-submit)";

  return (
    <div className="flex flex-col h-full">

      {/* File tab */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          height: 44,
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-1"
          style={{
            borderBottom: `2px solid ${langColor}`,
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
          }}
        >
          <span>{LANG_ICON[mission.editorLanguage]}</span>
          <span>{fileName}</span>
        </div>
      </div>

      {/* Engine loading banner */}
      {isLoading && (
        <div
          className="px-5 py-2 shrink-0 flex items-center gap-3"
          style={{
            background: "rgba(240,192,64,0.08)",
            borderBottom: "1px solid rgba(240,192,64,0.2)",
            color: "var(--color-accent)",
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
          }}
        >
          <span style={{ animation: "blink 1s step-end infinite" }}>⏳</span>
          Despertando o Arquivo Antigo...
        </div>
      )}

      {/* Code editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={mission.editorLanguage}
        />
      </div>

      {/* Action buttons row */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {/* Icon buttons: copy, clear */}
        <div className="flex items-center gap-2">
          <button className="icon-btn" onClick={handleCopy} title="Copiar código">
            ⎘
          </button>
          <button className="icon-btn" onClick={handleClear} title="Resetar editor">
            ↺
          </button>
        </div>

        {/* Run + Submit */}
        <div className="flex items-center gap-3">
          <button
            className="btn-run"
            onClick={handleRun}
            disabled={busy}
          >
            {isRunning ? "⏳" : "▶"} Executar
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={busy || validated}
          >
            {validated ? "✓ Concluída" : isSubmitting ? "Verificando..." : "Enviar Resposta"}
          </button>
        </div>
      </div>

      {/* Terminal section */}
      <div className="shrink-0" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="terminal-label">● Terminal</div>
        <TerminalOutput
          stdout={result?.stdout ?? ""}
          stderr={result?.stderr ?? ""}
          isRunning={isRunning}
        />
        {result?.tableData && (
          <div className="px-3 py-2" style={{ background: "var(--color-bg)" }}>
            <TablePreview data={result.tableData} />
          </div>
        )}
        {result?.chartBase64 && <GraphPanel chartBase64={result.chartBase64} />}
      </div>
    </div>
  );
}
