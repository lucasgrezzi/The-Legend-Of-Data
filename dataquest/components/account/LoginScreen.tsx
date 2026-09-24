"use client";

import { RACES, RACE_ORDER } from "@/lib/races";
import Sprite from "@/components/ui/Sprite";
import GateShell, { delay } from "@/components/ui/GateShell";
import { AuthForm } from "./AuthDialog";

/** Primeiro acesso: entrar ou criar conta ANTES de escolher nome e raça */
export default function LoginScreen() {
  return (
    <GateShell step={1} maxWidth={420}>
      <section className="panel" style={{ padding: "18px 24px 20px" }}>
        {/* As quatro raças esperando o novo Arquivista */}
        <div className="flex justify-center gap-2" aria-hidden style={{ marginBottom: 8 }}>
          {RACE_ORDER.map((r, i) => (
            <span
              key={r}
              className="anim-bob flex items-center justify-center"
              style={{
                width: 38, height: 38, borderRadius: 9,
                background: `rgba(${RACES[r].rgb},0.12)`,
                border: `1px solid rgba(${RACES[r].rgb},0.4)`,
                ...delay(i * 220),
              }}
            >
              <Sprite src={RACES[r].sprite} size={32} alt="" />
            </span>
          ))}
        </div>

        <div className="text-center" style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
            Boas-vindas, Arquivista!
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5 }}>
            Entre ou crie sua conta para começar a jornada.
          </p>
        </div>

        <AuthForm />
      </section>
    </GateShell>
  );
}
