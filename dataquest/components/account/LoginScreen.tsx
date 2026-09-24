"use client";

import { RACES, RACE_ORDER } from "@/lib/races";
import Sprite from "@/components/ui/Sprite";
import GateShell, { delay } from "@/components/ui/GateShell";
import { AuthForm } from "./AuthDialog";

/** Primeiro acesso: entrar ou criar conta ANTES de escolher nome e raça */
export default function LoginScreen() {
  return (
    <GateShell step={1} maxWidth={480}>
      <section className="panel" style={{ padding: "26px 28px 24px" }}>
        {/* As quatro raças esperando o novo Arquivista */}
        <div className="flex justify-center gap-3" aria-hidden style={{ marginBottom: 14 }}>
          {RACE_ORDER.map((r, i) => (
            <span
              key={r}
              className="anim-bob flex items-center justify-center"
              style={{
                width: 56, height: 56, borderRadius: 12,
                background: `rgba(${RACES[r].rgb},0.12)`,
                border: `1px solid rgba(${RACES[r].rgb},0.4)`,
                ...delay(i * 220),
              }}
            >
              <Sprite src={RACES[r].sprite} size={32} alt="" />
            </span>
          ))}
        </div>

        <div className="text-center" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
            Boas-vindas, Arquivista!
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6 }}>
            Entre ou crie sua conta para começar. Seu progresso fica salvo e você aparece no ranking da guilda.
          </p>
        </div>

        <AuthForm />
      </section>
    </GateShell>
  );
}
