"use client";

import type { ReactNode } from "react";

interface RichTextProps {
  text: string;
  color: string;
  /** Bullets "•" viram passos numerados (quest) em vez de marcadores (grimório) */
  numbered?: boolean;
}

type Block =
  | { kind: "p"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "code"; lines: string[] }
  | { kind: "space" };

const isIndented = (line: string) => line.startsWith("  ") || line.startsWith("\t");

/**
 * Renderiza os textos das missões:
 * - linhas indentadas consecutivas → um bloco de código (preserva indentação relativa)
 * - linhas com "•" → passos / marcadores
 * - linha vazia → espaçamento
 */
function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const trimmed = raw.trim();
    const last = blocks[blocks.length - 1];

    if (!trimmed) {
      if (last && last.kind !== "space") blocks.push({ kind: "space" });
      continue;
    }
    if (trimmed.startsWith("•")) {
      blocks.push({ kind: "bullet", text: trimmed.slice(1).trim() });
      continue;
    }
    if (isIndented(raw)) {
      const line = raw.replace(/^\t/, "  ").slice(2);
      if (last?.kind === "code") last.lines.push(line);
      else blocks.push({ kind: "code", lines: [line] });
      continue;
    }
    // linhas consecutivas de texto são o mesmo parágrafo (quebra manual no .ts)
    if (last?.kind === "p" && !/^\d+\./.test(trimmed)) last.text += " " + trimmed;
    else blocks.push({ kind: "p", text: trimmed });
  }
  while (blocks.at(-1)?.kind === "space") blocks.pop();
  return blocks;
}

export default function RichText({ text, color, numbered = false }: RichTextProps) {
  const blocks = parse(text);
  let step = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, lineHeight: 1.75 }}>
      {blocks.map((b, i): ReactNode => {
        switch (b.kind) {
          case "space":
            return <div key={i} style={{ height: 2 }} />;

          case "code":
            return (
              <code key={i} className="code-block" style={{ ["--code-accent" as string]: color }}>
                {b.lines.join("\n")}
              </code>
            );

          case "bullet":
            step++;
            return (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {numbered ? (
                  <span
                    style={{
                      background: color,
                      color: "#000",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {step}
                  </span>
                ) : (
                  <span style={{ color, flexShrink: 0, fontWeight: 800 }}>◆</span>
                )}
                <span style={{ color: "var(--color-text)" }}>{b.text}</span>
              </div>
            );

          case "p":
            return (
              <p key={i} style={{ margin: 0, color: "var(--color-text)" }}>
                {b.text}
              </p>
            );
        }
      })}
    </div>
  );
}
