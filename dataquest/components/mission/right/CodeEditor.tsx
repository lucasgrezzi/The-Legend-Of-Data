"use client";

import { useEffect, useMemo, useRef } from "react";
import CodeMirror, {
  keymap, Prec, StateEffect, StateField, Decoration, EditorView,
  type DecorationSet, type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "python" | "sql";
  /** Chamado com Ctrl/Cmd+Enter */
  onRunShortcut?: () => void;
  /** Linha com erro (destacada até o código mudar). Objeto novo a cada execução. */
  errorMark?: { line: number } | null;
}

// Destaque da linha com erro: some assim que o jogador edita o código
const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value === null || e.value < 1 || e.value > tr.state.doc.lines) return Decoration.none;
        const line = tr.state.doc.line(e.value);
        return Decoration.set([Decoration.line({ class: "cm-error-line" }).range(line.from)]);
      }
    }
    return tr.docChanged ? Decoration.none : deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export default function CodeEditor({ value, onChange, language, onRunShortcut, errorMark }: CodeEditorProps) {
  // ref para o atalho sempre chamar a versão mais recente sem recriar as extensões
  const runRef = useRef(onRunShortcut);
  runRef.current = onRunShortcut;
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  const extensions = useMemo(
    () => [
      language === "python" ? python() : sql(),
      errorLineField,
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", run: () => { runRef.current?.(); return true; } },
        ])
      ),
    ],
    [language]
  );

  useEffect(() => {
    const view = cmRef.current?.view;
    if (!view) return;
    view.dispatch({ effects: setErrorLine.of(errorMark?.line ?? null) });
  }, [errorMark]);

  return (
    <CodeMirror
      ref={cmRef}
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={oneDark}
      height="100%"
      className="h-full"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        autocompletion: true,
      }}
      style={{ fontSize: 14, height: "100%" }}
    />
  );
}
