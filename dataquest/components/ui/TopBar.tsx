"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { BestiaryButton } from "@/components/glossary/Bestiary";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/store/gameStore";
import { SHOP_UNLOCK_MISSION_ID } from "@/lib/shop";
import SoundToggle from "./SoundToggle";

/** Logo do jogo: marca dourada + nome em pixel. Leva sempre ao Mapa-Múndi. */
export function Brand({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link href="/map" className="brand" title="Mapa-Múndi">
      <span className="brand-mark" aria-hidden><Icon name="sparkle" size={18} /></span>
      <span className="brand-text">
        <span className="gate-logo">DataQuest</span>
        {tagline && <span className="brand-sub">Python, SQL e dados num RPG</span>}
      </span>
    </Link>
  );
}

/** Atalhos do jogo: Mapa, Bestiário, Loja, Perfil e Ranking — o atual fica destacado */
export function TopNav({ compact = false }: { compact?: boolean }) {
  const path = usePathname() ?? "";
  const shopOpen = useGameStore((s) => s.completedMissionIds.includes(SHOP_UNLOCK_MISSION_ID));
  const on = (p: string) => (path === p || path.startsWith(`${p}/`) ? " is-active" : "");
  const label = (text: string) => <span className={compact ? "hidden 2xl:inline" : undefined}>{text}</span>;
  return (
    <nav className="topbar-nav" aria-label="Menu do jogo">
      <Link href="/map" className={`icon-btn${on("/map") || on("/regiao")}`} title="Mapa-Múndi">
        <Icon name="map" />{label("Mapa")}
      </Link>
      <BestiaryButton compact={compact} />
      <Link
        href="/loja"
        className={`icon-btn${on("/loja")}`}
        title={shopOpen ? "Loja do Mercador: títulos, molduras e mascotes" : "Abre depois do Mercado da Vila"}
      >
        <Icon name="bag" />{label("Loja")}
      </Link>
      <Link href="/perfil" className={`icon-btn${on("/perfil")}`} title="Seu perfil: conquistas, troféus e coleção">
        <Icon name="user" />{label("Perfil")}
      </Link>
      {supabase && (
        <Link href="/ranking" className={`icon-btn${on("/ranking")}`} title="Ranking dos jogadores">
          <Icon name="trophy" />{label("Ranking")}
        </Link>
      )}
    </nav>
  );
}

/** Barra do topo das telas do jogo (mapa, região, loja, ranking) */
export default function TopBar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="wood-bar flex items-center justify-between gap-4 px-6 shrink-0 sticky top-0 z-20" style={{ height: 64 }}>
      <div className="flex items-center gap-5 min-w-0">
        <Brand tagline />
        <span className="topbar-sep" aria-hidden />
        <TopNav />
      </div>
      <div className="flex items-center gap-3 shrink-0"><SoundToggle />{right}</div>
    </header>
  );
}
