"use client";

import type { FriendlyError } from "@/lib/friendlyErrors";
import Sprite from "@/components/ui/Sprite";

/** Texto com trechos `entre crases` virando código */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2
          ? <code key={i} className="grimoire-error-code">{part.slice(1, -1)}</code>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

/** O Grimório traduz o erro: o que aconteceu, onde e como consertar — e a mensagem original para quem quiser ler */
export default function GrimoireError({ error, language }: { error: FriendlyError; language: "python" | "sql" }) {
  return (
    <div className="grimoire-error">
      <div className="flex items-start gap-3">
        <div className="grimoire-error-book"><Sprite src="/assets/sprites/grimorio.png" size={32} alt="" /></div>
        <div className="min-w-0">
          <p className="grimoire-error-kicker">O Grimório traduziu o erro</p>
          <p className="grimoire-error-title"><Inline text={error.title} /></p>
        </div>
      </div>

      {error.line && (
        <div className="grimoire-error-line">
          <span className="grimoire-error-lineno">Linha {error.line}</span>
          {error.lineText && <code>{error.lineText.trim()}</code>}
        </div>
      )}

      <p className="grimoire-error-text"><Inline text={error.explain} /></p>

      {error.fix && (
        <p className="grimoire-error-fix">
          <b>Como consertar:</b> <Inline text={error.fix} />
        </p>
      )}

      <details className="grimoire-error-raw">
        <summary>
          Ver a mensagem original {language === "sql" ? "do SQL" : "do Python"} <span>({error.kind})</span>
        </summary>
        <p>É assim que programadores veem o erro. Com o tempo, você também vai ler isso de primeira.</p>
        <pre>{error.raw}</pre>
      </details>
    </div>
  );
}
