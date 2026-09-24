"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { useAccountStore, type SyncStatus } from "@/store/accountStore";
import AuthDialog from "./AuthDialog";

const SYNC_LABEL: Record<SyncStatus, { text: string; color: string }> = {
  idle:    { text: "Conectado",       color: "var(--color-muted)" },
  loading: { text: "Carregando…",     color: "var(--color-muted)" },
  saving:  { text: "Salvando…",       color: "var(--color-muted)" },
  saved:   { text: "Salvo na nuvem",  color: "var(--color-run)" },
  error:   { text: "Erro ao salvar",  color: "var(--color-error)" },
};

/** Entrar / estado da conta nas top bars. Some quando o Supabase não está configurado. */
export default function AccountButton() {
  const { ready, email, sync } = useAccountStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!supabase || !ready) return null;

  if (!email) {
    return (
      <>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setDialogOpen(true)}
          title="Crie uma conta para salvar o progresso na nuvem e aparecer no ranking"
        >
          <span style={{ fontSize: 15 }}>☁️</span> Entrar
        </button>
        {/* Portal: a top bar tem backdrop-filter, que prenderia o position:fixed da janela dentro dela (cortada) */}
        {dialogOpen && createPortal(<AuthDialog onClose={() => setDialogOpen(false)} />, document.body)}
      </>
    );
  }

  const status = SYNC_LABEL[sync];
  return (
    <div className="relative">
      <button type="button" className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} title={email}>
        <span style={{ fontSize: 15 }}>☁️</span>
        <span style={{ color: status.color }}>{status.text}</span>
      </button>
      {menuOpen && (
        <div
          className="panel absolute right-0 flex flex-col gap-3"
          style={{ top: "calc(100% + 8px)", zIndex: 30, padding: "14px 16px", minWidth: 240 }}
        >
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
            Conectado como<br />
            <b style={{ color: "var(--color-text)", wordBreak: "break-all" }}>{email}</b>
          </span>
          <button
            type="button"
            className="btn-nav"
            onClick={() => { setMenuOpen(false); supabase!.auth.signOut(); }}
          >
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
