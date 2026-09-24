"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAccountStore } from "@/store/accountStore";
import WorldBackground from "@/components/ui/WorldBackground";
import { authErrorMessage } from "./AuthDialog";

/** Destino do link "Esqueci minha senha" — o supabase-js abre a sessão a partir da URL. */
export default function NewPasswordForm() {
  const { ready, email } = useAccountStore();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(authErrorMessage(error.message));
    else setDone(true);
  };

  let body: React.ReactNode;
  if (!ready) {
    body = <p style={{ color: "var(--color-muted)" }}>Carregando…</p>;
  } else if (done) {
    body = (
      <>
        <p style={{ color: "var(--color-run)", fontSize: 14 }}>Senha alterada! Você já está conectado.</p>
        <Link href="/map" className="btn-next" style={{ marginTop: 12 }}>Voltar ao mapa →</Link>
      </>
    );
  } else if (!email) {
    body = (
      <>
        <p style={{ color: "var(--color-muted)", fontSize: 14, lineHeight: 1.6 }}>
          Este link expirou ou já foi usado. Peça um novo em <b>Entrar → Esqueci minha senha</b>.
        </p>
        <Link href="/map" className="btn-nav" style={{ marginTop: 12 }}>← Mapa</Link>
      </>
    );
  } else {
    body = (
      <form onSubmit={submit}>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-muted)" }}>Conta: <b style={{ color: "var(--color-text)" }}>{email}</b></p>
        <label className="block">
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>Nova senha</span>
          <input
            type="password"
            required
            minLength={6}
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2"
          />
        </label>
        {error && <p role="alert" style={{ margin: "12px 0 0", fontSize: 13, color: "var(--color-error)" }}>{error}</p>}
        <button type="submit" className="btn-next" disabled={busy} style={{ marginTop: 18 }}>
          {busy ? "Aguarde…" : "Salvar nova senha"}
        </button>
      </form>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <WorldBackground />
      <section className="panel w-full" style={{ maxWidth: 440, padding: "28px 28px 24px" }}>
        <p className="pixel-chapter" style={{ margin: 0 }}>CONTA</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 16px", color: "var(--color-accent)" }}>Criar nova senha</h1>
        {body}
      </section>
    </div>
  );
}
