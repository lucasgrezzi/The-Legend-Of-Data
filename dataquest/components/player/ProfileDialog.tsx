"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "@/store/gameStore";
import { useAccountStore } from "@/store/accountStore";
import { supabase } from "@/lib/supabase";
import { RACES } from "@/lib/races";
import { MISSIONS } from "@/lib/missions";
import { TRACKS, TRACK_ORDER } from "@/lib/tracks";
import Sprite from "@/components/ui/Sprite";
import XPBar from "@/components/ui/XPBar";
import HeroPortrait from "./HeroPortrait";
import Link from "next/link";
import { equippedLook } from "@/lib/shop";
import Icon from "@/components/ui/Icon";

/**
 * Ficha do personagem — só visualização. Nome e raça são escolhidos uma única vez, na criação,
 * e não podem ser alterados depois.
 * Abre via portal em document.body: o backdrop-filter das top bars prenderia o position: fixed.
 */
export default function ProfileDialog({ onClose }: { onClose: () => void }) {
  const { profile, totalXP, coins, completedMissionIds, equipped } = useGameStore();
  const look = equippedLook(equipped);
  const { email, sync } = useAccountStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!profile) return null;
  const race = RACES[profile.race];
  const done = MISSIONS.filter((m) => completedMissionIds.includes(m.id)).length;

  const stat = (label: string, value: React.ReactNode, color = "var(--color-text)") => (
    <div className="flex flex-col items-center gap-1" style={{ flex: 1, padding: "10px 6px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-strong)" }}>
      <span style={{ fontSize: 19, fontWeight: 900, color, display: "flex", alignItems: "center", gap: 2, lineHeight: 1.2 }}>{value}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)" }}>{label}</span>
    </div>
  );

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480, maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}
      >
        {/* ── Retrato + identidade ── */}
        <div
          className="flex items-center gap-5"
          style={{ padding: "20px 24px 16px", background: `radial-gradient(circle at 18% 40%, rgba(${race.rgb},0.22), transparent 65%)` }}
        >
          <HeroPortrait race={profile.race} box={116} sprite={96} frame={look.frame} pet={look.pet} radius={22} className="anim-bob" />
          <div className="min-w-0">
            <p className="pixel-chapter" style={{ margin: 0 }}>FICHA DO PERSONAGEM</p>
            <h2 id="profile-title" style={{ fontSize: 26, fontWeight: 900, margin: "4px 0 2px", color: "var(--color-text)", wordBreak: "break-word" }}>
              {profile.name}
            </h2>
            {look.title && <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "var(--color-accent)" }}>“{look.title}”</p>}
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: race.color }}>{race.name} · {race.guild}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, fontStyle: "italic", color: "var(--color-muted)" }}>“{race.motto}”</p>
          </div>
        </div>

        <div className="flex flex-col gap-3" style={{ padding: "4px 24px 16px" }}>
          <XPBar totalXP={totalXP} />

          <div className="flex gap-2">
            {stat("XP total", totalXP, "var(--color-xp)")}
            {stat("Moedas", <><Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-8px -4px" }} />{coins}</>, "var(--color-xp)")}
            {stat("Missões", `${done}/${MISSIONS.length}`)}
          </div>

          {/* ── Progresso por trilha ── */}
          <div className="flex flex-col gap-1">
            {TRACK_ORDER.map((t) => {
              const info = TRACKS[t];
              const ms = MISSIONS.filter((m) => m.track === t);
              const d = ms.filter((m) => completedMissionIds.includes(m.id)).length;
              return (
                <div key={t} className="flex items-center gap-3" style={{ fontSize: 13 }}>
                  <Sprite src={info.sprite} size={32} alt={info.name} style={{ opacity: d > 0 ? 1 : 0.45 }} />
                  <span style={{ width: 70, fontWeight: 800, color: d > 0 ? info.color : "var(--color-muted)" }}>{info.name}</span>
                  <div className="banner-progress" style={{ flex: 1 }}>
                    <div style={{ width: ms.length ? `${(d / ms.length) * 100}%` : 0, background: info.color }} />
                  </div>
                  <span style={{ width: 64, textAlign: "right", fontWeight: 700, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {ms.length ? `${d}/${ms.length}` : "em breve"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Conta (o status da nuvem fica só aqui, não exposto nas top bars) ── */}
        {supabase && email && (
          <div className="flex items-center justify-between gap-3" style={{ padding: "12px 24px", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12, color: "var(--color-muted)", minWidth: 0 }}>
              <b style={{ color: "var(--color-text)", wordBreak: "break-all" }}>{email}</b>
              <br />
              <span style={{ color: sync === "error" ? "var(--color-error)" : undefined }}>
                {sync === "error" ? "Não foi possível salvar na nuvem" : "Progresso salvo na nuvem"}
              </span>
            </span>
            <button type="button" className="btn-nav btn-sm shrink-0" onClick={() => { onClose(); supabase!.auth.signOut(); }}>
              <Icon name="logout" size={15} /> Sair da conta
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3" style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--line)", background: "rgba(0,0,0,0.18)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)" }}>
            Nome e raça são escolhidos uma única vez. Títulos, molduras e mascotes: <Link href="/loja" onClick={onClose} style={{ color: "var(--color-accent)" }}>Loja do Mercador</Link>.
          </span>
          <button type="button" className="btn-nav" onClick={onClose} autoFocus>Fechar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
