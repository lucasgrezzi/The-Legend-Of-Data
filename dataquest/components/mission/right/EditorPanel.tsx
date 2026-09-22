"use client";

import { useState, useCallback, useRef } from "react";
import type { Mission, RunResult, EngineStatus } from "@/types";
import CodeEditor from "./CodeEditor";
import TerminalOutput from "./TerminalOutput";
import TablePreview from "./TablePreview";
import GraphPanel from "./GraphPanel";

interface EditorPanelProps {
  mission: Mission;
  pyodideStatus: EngineStatus;
  onRun: (code: string) => Promise<RunResult>;
  /** Recebe o resultado do código ATUAL (sempre reexecutado antes de validar) */
  onSubmit: (result: RunResult, code: string) => void;
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

const OUTPUT_DEFAULT = 220;
const OUTPUT_MIN = 90;
const EDITOR_MIN = 140;

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
  const [copied, setCopied] = useState(false);
  const [outputHeight, setOutputHeight] = useState(OUTPUT_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pyodide só importa para missões Python; SQL usa DuckDB (lazy)
  const isLoading = mission.editorLanguage === "python" && pyodideStatus === "loading";
  const busy = isRunning || isSubmitting || isLoading;

  const handleRun = useCallback(async () => {
    if (busy) return;
    setIsRunning(true);
    try {
      setResult(await onRun(code));
    } finally {
      setIsRunning(false);
    }
  }, [busy, code, onRun]);

  const handleSubmit = useCallback(async () => {
    if (busy) return;
    setIsSubmitting(true);
    try {
      const r = await onRun(code);
      setResult(r);
      onSubmit(r, code);
    } finally {
      setIsSubmitting(false);
    }
  }, [busy, code, onRun, onSubmit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }).catch(() => {});
  };
  const handleReset = () => { setCode(mission.codeTemplate); setResult(null); };

  // ── Redimensionar editor ↕ saída ──
  const onSplitterDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onSplitterMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const max = rect.height - EDITOR_MIN;
    setOutputHeight(Math.max(OUTPUT_MIN, Math.min(max, rect.bottom - e.clientY)));
  };
  const onSplitterUp = () => setDragging(false);

  const fileName = mission.editorLanguage === "python" ? "script.py" : "query.sql";
  const langColor = LANG_COLOR[mission.editorLanguage] ?? "var(--color-submit)";

  const hasError = !!result && !result.success;
  const rowCount = result?.tableData?.rows.length;

  return (
    <div ref={containerRef} className="flex flex-col h-full" style={{ userSelect: dragging ? "none" : undefined }}>

      {/* ── Aba do arquivo ── */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", height: 46 }}
      >
        <div
          className="flex items-center gap-2 px-3 h-full"
          style={{ borderBottom: `2px solid ${langColor}`, fontSize: 13 }}
        >
          <span>{LANG_ICON[mission.editorLanguage]}</span>
          <span>{fileName}</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
          <span className="kbd">Ctrl</span> + <span className="kbd">Enter</span> executa
        </span>
      </div>

      {/* ── Banner de carregamento ── */}
      {isLoading && (
        <div
          className="px-5 py-2 shrink-0 flex items-center gap-3"
          style={{
            background: "rgba(240,192,64,0.08)",
            borderBottom: "1px solid rgba(240,192,64,0.2)",
            color: "var(--color-accent)",
            fontSize: 13,
          }}
        >
          <span style={{ animation: "blink 1s step-end infinite" }}>⏳</span>
          Despertando o Arquivo Antigo… (carregando Python, só na primeira vez)
        </div>
      )}

      {/* ── Editor (ocupa todo o espaço livre) ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={mission.editorLanguage}
          onRunShortcut={handleRun}
        />
      </div>

      {/* ── Ações ── */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
        style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <button className="icon-btn" onClick={handleCopy} title="Copiar código">
            {copied ? "✓ Copiado" : "⎘ Copiar"}
          </button>
          <button className="icon-btn" onClick={handleReset} title="Voltar ao código inicial">
            ↺ Resetar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-run" onClick={handleRun} disabled={busy}>
            {isRunning ? "…" : "▶"} Executar
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={busy || validated}>
            {validated ? "✓ Concluída" : isSubmitting ? "Verificando…" : "Enviar Resposta"}
          </button>
        </div>
      </div>

      {/* ── Alça de redimensionamento ── */}
      <div
        className={`splitter ${dragging ? "dragging" : ""}`}
        onPointerDown={onSplitterDown}
        onPointerMove={onSplitterMove}
        onPointerUp={onSplitterUp}
        onPointerCancel={onSplitterUp}
        onDoubleClick={() => setOutputHeight(OUTPUT_DEFAULT)}
        role="separator"
        aria-orientation="horizontal"
        title="Arraste para redimensionar (duplo clique restaura)"
      />

      {/* ── Saída ── */}
      <div className="flex flex-col shrink-0" style={{ height: outputHeight, background: "#060a10" }}>
        <div className="output-header">
          <span>● Saída</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 0 }}>
            {isRunning || isSubmitting ? (
              <span style={{ color: "var(--color-accent)" }}>executando…</span>
            ) : result ? (
              <span style={{ color: hasError ? "var(--color-error)" : "var(--color-run)" }}>
                {hasError ? "✗ erro" : "✓ ok"}
                {rowCount !== undefined && !hasError && ` · ${rowCount} ${rowCount === 1 ? "linha" : "linhas"}`}
                {` · ${result.executionTimeMs} ms`}
              </span>
            ) : null}
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {(!result?.tableData || result.stdout || result.stderr || isRunning) && (
            <TerminalOutput
              stdout={result?.stdout ?? ""}
              stderr={result?.stderr ?? ""}
              isRunning={isRunning || isSubmitting}
            />
          )}
          {result?.tableData && !isRunning && (
            <div className="px-4 py-3">
              <TablePreview data={result.tableData} />
            </div>
          )}
          {result?.chartBase64 && <GraphPanel chartBase64={result.chartBase64} />}
        </div>
      </div>
    </div>
  );
}
