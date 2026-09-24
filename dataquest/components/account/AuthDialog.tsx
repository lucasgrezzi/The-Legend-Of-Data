"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "forgot";

const PASSWORD_MIN = 6;

/** Traduz as mensagens de erro mais comuns do Supabase Auth */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Já existe uma conta com esse e-mail. Use “Entrar”.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("password should be")) return `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`;
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
  if (m.includes("invalid") && m.includes("email")) return "Esse e-mail não parece válido.";
  if (m.includes("same") && m.includes("password")) return "A nova senha precisa ser diferente da atual.";
  return message;
}

const TITLES: Record<Mode, string> = {
  login: "Entrar na conta",
  signup: "Criar conta",
  forgot: "Recuperar senha",
};

export default function AuthDialog({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    const origin = window.location.origin;
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/map` },
        });
        if (error) throw error;
        if (data.session) {
          onClose();
        } else {
          setNotice("Conta criada! Enviamos um link de confirmação para o seu e-mail — clique nele e depois entre aqui.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/conta/nova-senha` });
        if (error) throw error;
        setNotice("Se existir uma conta com esse e-mail, você vai receber um link para criar uma nova senha.");
      }
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{ padding: "28px 28px 24px" }}
      >
        <p className="pixel-chapter" style={{ margin: 0 }}>CONTA</p>
        <h2 id="auth-title" style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 6px", color: "var(--color-accent)" }}>
          {TITLES[mode]}
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6 }}>
          {mode === "forgot"
            ? "Digite o e-mail da sua conta e enviaremos um link para criar uma nova senha."
            : "Com uma conta, seu progresso fica salvo na nuvem (continue em qualquer aparelho) e você aparece no ranking."}
        </p>

        <label className="block mb-4">
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>E-mail</span>
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-2"
          />
        </label>

        {mode !== "forgot" && (
          <label className="block mb-2">
            <span className="pixel-label" style={{ color: "var(--color-muted)" }}>Senha</span>
            <input
              type="password"
              required
              minLength={PASSWORD_MIN}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-2"
            />
            {mode === "signup" && (
              <span style={{ display: "block", marginTop: 6, fontSize: 12, color: "var(--color-muted)" }}>
                Mínimo de {PASSWORD_MIN} caracteres.
              </span>
            )}
          </label>
        )}

        {mode === "login" && (
          <button type="button" className="link-btn" onClick={() => switchMode("forgot")} style={{ marginBottom: 4 }}>
            Esqueci minha senha
          </button>
        )}

        {error && (
          <p role="alert" style={{ margin: "14px 0 0", fontSize: 13, color: "var(--color-error)", lineHeight: 1.5 }}>{error}</p>
        )}
        {notice && (
          <p role="status" style={{ margin: "14px 0 0", fontSize: 13, color: "var(--color-run)", lineHeight: 1.5 }}>{notice}</p>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {mode === "login" && <>Não tem conta? <button type="button" className="link-btn" onClick={() => switchMode("signup")}>Criar conta</button></>}
            {mode === "signup" && <>Já tem conta? <button type="button" className="link-btn" onClick={() => switchMode("login")}>Entrar</button></>}
            {mode === "forgot" && <button type="button" className="link-btn" onClick={() => switchMode("login")}>← Voltar</button>}
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn-nav" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-next" disabled={busy}>
              {busy ? "Aguarde…" : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
