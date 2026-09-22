"use client";

import { useMemo, useRef } from "react";
import CodeMirror, { keymap, Prec } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "python" | "sql";
  /** Chamado com Ctrl/Cmd+Enter */
  onRunShortcut?: () => void;
}

export default function CodeEditor({ value, onChange, language, onRunShortcut }: CodeEditorProps) {
  // ref para o atalho sempre chamar a versão mais recente sem recriar as extensões
  const runRef = useRef(onRunShortcut);
  runRef.current = onRunShortcut;

  const extensions = useMemo(
    () => [
      language === "python" ? python() : sql(),
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", run: () => { runRef.current?.(); return true; } },
        ])
      ),
    ],
    [language]
  );

  return (
    <CodeMirror
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
