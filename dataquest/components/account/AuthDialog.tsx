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

interface AuthFormProps {
  /** Chamado quando a pessoa entrou (ou criou a conta já logada) */
  onDone?: () => void;
  /** Botão extra ao lado do principal (ex.: "Cancelar" na janela) */
  secondaryAction?: React.ReactNode;
}

/** Formulário de conta — usado na tela de login (primeiro acesso) e na janela "Entrar" do mapa */
export function AuthForm({ onDone, secondaryAction }: AuthFormProps) {
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
        onDone?.();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/map` },
        });
        if (error) throw error;
        if (data.session) {
          onDone?.();
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
    <form onSubmit={submit} className="flex flex-col">
      {mode === "forgot" ? (
        <div className="anim-rise" style={{ marginBottom: 18 }}>
          <button type="button" className="link-btn" onClick={() => switchMode("login")}>← Voltar para o login</button>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6 }}>
            Digite o e-mail da sua conta e enviaremos um link para criar uma nova senha.
          </p>
        </div>
      ) : (
        <div className="auth-tabs" role="tablist" data-mode={mode} style={{ marginBottom: 16 }}>
          <span className="auth-tab-indicator" aria-hidden />
          <button type="button" role="tab" className="auth-tab" aria-selected={mode === "login"} onClick={() => switchMode("login")}>
            Entrar
          </button>
          <button type="button" role="tab" className="auth-tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")}>
            Criar conta
          </button>
        </div>
      )}

      <label className="block mb-3">
        <span className="pixel-label" style={{ color: "var(--color-muted)" }}>E-mail</span>
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mt-2 field-sm"
        />
      </label>

      {mode !== "forgot" && (
        <label className="block">
          <span className="pixel-label" style={{ color: "var(--color-muted)" }}>Senha</span>
          <input
            type="password"
            required
            minLength={PASSWORD_MIN}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? `Mínimo de ${PASSWORD_MIN} caracteres` : ""}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2 field-sm"
          />
        </label>
      )}

      {mode === "login" && (
        <button type="button" className="link-btn" onClick={() => switchMode("forgot")} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          Esqueci minha senha
        </button>
      )}

      {error && (
        <p key={error} role="alert" className="anim-rise" style={{ margin: "14px 0 0", fontSize: 13, color: "var(--color-error)", lineHeight: 1.5 }}>{error}</p>
      )}
      {notice && (
        <p role="status" className="anim-rise" style={{ margin: "14px 0 0", fontSize: 13, color: "var(--color-run)", lineHeight: 1.5 }}>{notice}</p>
      )}

      <div className="flex items-center justify-end gap-2" style={{ marginTop: 14 }}>
        {secondaryAction}
        <button type="submit" className="btn-next" disabled={busy} style={{ minWidth: 160, justifyContent: "center" }}>
          {busy ? "Aguarde…" : mode === "login" ? "Entrar →" : mode === "signup" ? "Criar conta →" : "Enviar link"}
        </button>
      </div>
    </form>
  );
}

/** Janela "Entrar" aberta pelo botão ☁️ do mapa (para quem já joga sem conta) */
export default function AuthDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "26px 28px 24px" }}
      >
        <p className="pixel-chapter" style={{ margin: 0 }}>CONTA</p>
        <h2 id="auth-title" style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 6px", color: "var(--color-accent)" }}>
          Salve seu progresso
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6 }}>
          Com uma conta, seu progresso fica na nuvem (continue em qualquer aparelho) e você aparece no ranking.
        </p>
        <AuthForm
          onDone={onClose}
          secondaryAction={<button type="button" className="btn-nav" onClick={onClose}>Cancelar</button>}
        />
      </div>
    </div>
  );
}
