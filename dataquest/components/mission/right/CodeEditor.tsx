"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "python" | "sql";
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const extensions = language === "python" ? [python()] : [sql()];

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={oneDark}
      height="280px"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        autocompletion: true,
      }}
      style={{
        fontSize: 13,
        border: "3px solid #444",
      }}
    />
  );
}
