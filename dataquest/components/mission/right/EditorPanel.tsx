"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import type { Mission, RunResult, EngineStatus } from "@/types";
import CodeEditor from "./CodeEditor";
import TerminalOutput from "./TerminalOutput";
import TablePreview from "./TablePreview";
import GraphPanel from "./GraphPanel";
import { explainError, errorContext } from "@/lib/friendlyErrors";
import Icon from "@/components/ui/Icon";

interface EditorPanelProps {
  mission: Mission;
  pyodideStatus: EngineStatus;
  onRun: (code: string) => Promise<RunResult>;
  /** Recebe o resultado do código ATUAL (sempre reexecutado antes de validar) */
  onSubmit: (result: RunResult, code: string) => void;
  validated: boolean;
}

const LANG_COLOR: Record<string, string> = {
  python: "var(--color-python)",
  sql:    "var(--color-sql)",
};

const OUTPUT_DEFAULT = 220;
/** Altura que cabe a explicação do Grimório inteira */
const OUTPUT_ERROR = 340;
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
  /** Código que gerou o `result` (o jogador pode editar depois; a linha do erro se refere a este) */
  const [ranCode, setRanCode] = useState("");
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
      const r = await onRun(code);
      setRanCode(code);
      setResult(r);
    } finally {
      setIsRunning(false);
    }
  }, [busy, code, onRun]);

  const handleSubmit = useCallback(async () => {
    if (busy) return;
    setIsSubmitting(true);
    try {
      const r = await onRun(code);
      setRanCode(code);
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
  const friendly = useMemo(
    () => (result && !result.success && result.stderr ? explainError(result.stderr, errorContext(mission, ranCode)) : null),
    [result, mission, ranCode]
  );
  // objeto novo a cada execução: reaplica o destaque mesmo se a linha for a mesma
  const errorMark = useMemo(() => (friendly?.line ? { line: friendly.line } : null), [friendly]);

  // Com erro ou gráfico, a saída cresce para mostrar tudo (sem espremer o editor)
  const hasChart = !!result?.chartBase64;
  useEffect(() => {
    if ((!friendly && !hasChart) || !containerRef.current) return;
    const max = containerRef.current.getBoundingClientRect().height - EDITOR_MIN - 120;
    setOutputHeight((h) => Math.max(h, Math.min(OUTPUT_ERROR, max)));
  }, [friendly, hasChart]);
  const rowCount = result?.tableData?.rows.length;

  return (
    <div ref={containerRef} className="flex flex-col h-full" style={{ userSelect: dragging ? "none" : undefined }}>

      {/* ── Aba do arquivo ── */}
      <div className="tome-bar flex items-center justify-between gap-3 px-4 shrink-0" style={{ height: 50 }}>
        <span className="file-tag" style={{ ["--tag-color" as string]: langColor }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: langColor, boxShadow: `0 0 8px ${langColor}` }} />
          <span>{fileName}</span>
        </span>
        <span className="truncate flex items-center gap-2" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-muted)" }}>
          <Icon name="keyboard" size={15} /> Escreva seu código aqui ·
          <span><span className="kbd">Ctrl</span> + <span className="kbd">Enter</span> executa</span>
        </span>
      </div>

      {/* ── Banner de carregamento ── */}
      {isLoading && (
        <div
          className="px-5 py-2 shrink-0 flex items-center gap-3"
          style={{
            background: "rgba(245,196,81,0.08)",
            borderBottom: "1px solid rgba(245,196,81,0.2)",
            color: "var(--color-accent)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span className="spinner" aria-hidden style={{ width: 14, height: 14 }} />
          Despertando o Arquivo Antigo… (carregando Python, só na primeira vez)
        </div>
      )}

      {/* ── Editor (ocupa todo o espaço livre) ── */}
      <div className="flex-1 min-h-0 overflow-hidden" data-tour="editor">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={mission.editorLanguage}
          onRunShortcut={handleRun}
          errorMark={errorMark}
        />
      </div>

      {/* ── Ações ── */}
      <div className="tome-bar is-actions flex items-center justify-between gap-3 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <button className="icon-btn" onClick={handleCopy} title="Copiar código">
            <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copiado" : "Copiar"}
          </button>
          <button className="icon-btn" onClick={handleReset} title="Voltar ao código inicial">
            <Icon name="reset" size={16} /> Resetar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-run btn-pixel is-compact" onClick={handleRun} disabled={busy} data-tour="run">
            {isRunning ? <span className="spinner" aria-hidden style={{ width: 14, height: 14, borderColor: "rgba(4,35,15,0.25)", borderTopColor: "#04230f" }} /> : <Icon name="play" size={14} />} Executar
          </button>
          <button className="btn-submit btn-pixel is-compact" onClick={handleSubmit} disabled={busy || validated} data-tour="submit">
            {validated ? <><Icon name="check" size={16} style={{ strokeWidth: 3 }} /> Concluída</> : isSubmitting ? "Verificando…" : <><Icon name="send" size={15} /> Enviar resposta</>}
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
      <div className="flex flex-col shrink-0" style={{ height: outputHeight, background: "var(--editor-bg-2)" }} data-tour="output">
        <div className="output-header">
          <span className="flex items-center gap-2">
            <Icon name="terminal" size={15} /> Saída
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0, textTransform: "none", opacity: 0.85 }}>· o que o código mostra</span>
          </span>
          <span style={{ fontSize: 12, letterSpacing: 0, textTransform: "none" }}>
            {isRunning || isSubmitting ? (
              <span style={{ color: "var(--color-accent)" }}>executando…</span>
            ) : result ? (
              <span className="inline-flex items-center gap-1" style={{ color: hasError ? "var(--color-error)" : "var(--color-run)" }}>
                <Icon name={hasError ? "x" : "check"} size={13} style={{ strokeWidth: 3 }} />
                {hasError ? "erro" : "ok"}
                {rowCount !== undefined && !hasError && ` · ${rowCount} ${rowCount === 1 ? "linha" : "linhas"}`}
                {` · ${result.executionTimeMs} ms`}
              </span>
            ) : null}
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {hasChart && !result?.stdout && !result?.stderr && !isRunning && !isSubmitting ? (
            <div className="terminal">✓ Gráfico desenhado logo abaixo.</div>
          ) : (!result?.tableData || result.stdout || result.stderr || isRunning) && (
            <TerminalOutput
              stdout={result?.stdout ?? ""}
              stderr={result?.stderr ?? ""}
              isRunning={isRunning || isSubmitting}
              friendly={friendly}
              language={mission.editorLanguage}
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
