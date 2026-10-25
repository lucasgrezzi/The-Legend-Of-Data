"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Race } from "@/types";
import { supabase } from "@/lib/supabase";
import { RACES } from "@/lib/races";
import { MISSIONS } from "@/lib/missions";
import { computeLevel } from "@/lib/xp";
import { useAccountStore } from "@/store/accountStore";
import Sprite from "@/components/ui/Sprite";
import WorldBackground from "@/components/ui/WorldBackground";
import AccountButton from "./AccountButton";
import { getItem } from "@/lib/shop";

interface Row {
  name: string;
  race: Race;
  total_xp: number;
  missions_done: number;
  is_me: boolean;
  /** Título equipado (só depois de rodar supabase/2026-10-titulo-no-ranking.sql) */
  title_id?: string | null;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { email, sync } = useAccountStore();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recarrega ao entrar/sair e quando o próprio save termina de subir
  useEffect(() => {
    if (!supabase || sync === "saving" || sync === "loading") return;
    let cancelled = false;
    supabase.rpc("get_leaderboard", { lim: 100 }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else { setRows(data as Row[]); setError(null); }
    });
    return () => { cancelled = true; };
  }, [email, sync]);

  return (
    <div className="min-h-screen flex flex-col">
      <WorldBackground />

      <header className="wood-bar flex items-center justify-between gap-4 px-6 shrink-0 sticky top-0 z-20" style={{ height: 68 }}>
        <div className="flex items-center gap-4">
          <Link href="/map" className="btn-nav btn-pixel is-compact">← Mapa</Link>
          <p className="gate-logo" style={{ margin: 0 }}>Salão da Fama</p>
        </div>
        <AccountButton guestOnly />
      </header>

      <main className="flex-1 px-4 pt-8 pb-16">
        <section className="panel rpg-frame mx-auto" style={{ maxWidth: 680, padding: "24px 24px 12px" }}>
          <p className="pixel-chapter" style={{ margin: 0 }}>SALÃO DA FAMA</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 6px", color: "var(--color-accent)", textShadow: "0 0 30px rgba(240,192,64,0.35)" }}>
            🏆 Ranking
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--color-muted)" }}>
            Os Arquivistas com mais XP. {!email && supabase && "Entre na sua conta para aparecer aqui."}
          </p>

          {!supabase && (
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>O ranking ainda não foi configurado neste site.</p>
          )}
          {error && (
            <p role="alert" style={{ fontSize: 14, color: "var(--color-error)" }}>Não foi possível carregar o ranking: {error}</p>
          )}
          {supabase && !error && rows === null && (
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Carregando…</p>
          )}
          {rows?.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Ninguém no ranking ainda — seja o primeiro!</p>
          )}

          {rows && rows.length > 0 && (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((r, i) => {
                const race = RACES[r.race];
                const { label } = computeLevel(r.total_xp);
                return (
                  <li key={i} className={`rank-row flex items-center gap-3 ${i < 3 ? "is-podium" : ""} ${r.is_me ? "is-me" : ""}`}>
                    <span className="rank-pos" style={{ width: 36, textAlign: "center", fontSize: i < 3 ? 22 : 14, fontWeight: 800 }}>
                      {MEDALS[i] ?? `${i + 1}º`}
                    </span>
                    {race && (
                      <span
                        className="flex items-center justify-center shrink-0"
                        style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${race.rgb},0.14)`, border: `1px solid rgba(${race.rgb},0.45)` }}
                      >
                        <Sprite src={race.sprite} size={32} alt={race.name} />
                      </span>
                    )}
                    <span className="flex-1 min-w-0 flex flex-col" style={{ lineHeight: 1.3 }}>
                      <span className="rank-name truncate" style={{ fontSize: 15, fontWeight: 800 }}>
                        {r.name}
                        {getItem(r.title_id ?? undefined)?.slot === "titulo" && (
                          <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>, {getItem(r.title_id!)!.value}</span>
                        )}
                        {r.is_me && <span style={{ color: "var(--color-accent)", fontWeight: 700 }}> (você)</span>}
                      </span>
                      <span className="rank-sub" style={{ fontSize: 12 }}>
                        {race?.name ?? r.race} · {label} · {r.missions_done}/{MISSIONS.length} missões
                      </span>
                    </span>
                    <span className="rank-xp" style={{ fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" }}>{r.total_xp} XP</span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
