"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Mission } from "@/types";
import { useGate } from "@/hooks/useGate";
import { useGameStore } from "@/store/gameStore";
import { useAccountStore } from "@/store/accountStore";
import { supabase } from "@/lib/supabase";
import { AFFINITY_DISCOUNT, RACES } from "@/lib/races";
import { BONUS_MISSIONS, MISSIONS, bossOf, isBoss, missionsOfTrack } from "@/lib/missions";
import { TRACKS, TRACK_ORDER } from "@/lib/tracks";
import { computeLevel, isMissionUnlocked, solutionXP } from "@/lib/xp";
import { monsterOf } from "@/lib/monsters";
import { SHOP_ITEMS, SLOT_INFO, equippedLook, type ShopSlot } from "@/lib/shop";
import WorldBackground from "@/components/ui/WorldBackground";
import TopBar from "@/components/ui/TopBar";
import Icon from "@/components/ui/Icon";
import Sprite from "@/components/ui/Sprite";
import XPBar from "@/components/ui/XPBar";
import MonsterSprite from "@/components/ui/MonsterSprite";
import PlayerChip from "./PlayerChip";
import HeroPortrait from "./HeroPortrait";

/** Posição do jogador no ranking (só com conta; null = ainda carregando ou sem ranking) */
function useMyRank(): { rank: number; of: number } | null {
  const { email, sync } = useAccountStore();
  const [rank, setRank] = useState<{ rank: number; of: number } | null>(null);
  useEffect(() => {
    if (!supabase || !email || sync === "saving" || sync === "loading") return;
    let cancelled = false;
    supabase.rpc("get_leaderboard", { lim: 100 }).then(({ data }) => {
      if (cancelled || !data) return;
      const rows = data as { is_me: boolean }[];
      const i = rows.findIndex((r) => r.is_me);
      setRank(i >= 0 ? { rank: i + 1, of: rows.length } : null);
    });
    return () => { cancelled = true; };
  }, [email, sync]);
  return rank;
}

/**
 * Perfil do jogador (/perfil): ficha completa — herói, nível, conquistas por região (com a cena de cada uma),
 * a parede de troféus com cada monstro vencido e a coleção da loja. Só leitura: o personagem é fixo.
 */
export default function ProfilePage() {
  const gate = useGate();
  const router = useRouter();
  const { profile, totalXP, coins, completedMissionIds, xpByMission, ownedItems, equipped } = useGameStore();
  const { email, sync } = useAccountStore();
  const rank = useMyRank();

  useEffect(() => {
    if (gate !== "loading" && gate !== "play") router.replace("/map");
  }, [gate, router]);

  if (gate !== "play" || !profile) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--color-bg)" }}>
        <span className="spinner" aria-hidden />
      </div>
    );
  }

  const race = RACES[profile.race];
  const look = equippedLook(equipped);
  const { level, label } = computeLevel(totalXP);
  const isDone = (m: Mission) => completedMissionIds.includes(m.id);
  const done = MISSIONS.filter(isDone);
  const bosses = [...TRACK_ORDER.map((t) => bossOf(t)), BONUS_MISSIONS[BONUS_MISSIONS.length - 1]].filter(Boolean) as Mission[];
  const bossesDown = bosses.filter(isDone).length;
  const flawless = done.filter((m) => (xpByMission[m.id] ?? m.xpReward) >= m.xpReward).length;

  const stat = (icon: React.ReactNode, value: React.ReactNode, text: string, color = "var(--color-text)") => (
    <div className="profile-stat">
      <span className="profile-stat-icon" style={{ color }}>{icon}</span>
      <span className="flex flex-col min-w-0">
        <b style={{ color }}>{value}</b>
        <small>{text}</small>
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <WorldBackground />
      <TopBar right={<PlayerChip profile={profile} totalXP={totalXP} coins={coins} />} />

      <main className="flex-1 px-4 pt-8 pb-16">
        <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 980 }}>
          {/* ── Herói ── */}
          <section
            className="rpg-frame anim-rise profile-hero"
            style={{ background: `radial-gradient(50% 140% at 0% 40%, rgba(${race.rgb},0.24), transparent 70%), linear-gradient(180deg, rgba(27,33,49,0.97), rgba(19,24,36,0.97))` }}
          >
            <HeroPortrait race={profile.race} box={132} sprite={96} frame={look.frame} pet={look.pet} radius={24} className="anim-bob" />
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 6 }}>
              <p className="pixel-chapter" style={{ margin: 0 }}>Perfil do herói</p>
              <h1 className="profile-name">{profile.name}</h1>
              {look.title && <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--color-accent)" }}>“{look.title}”</p>}
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: race.color }}>{race.name} · {race.guild}</p>
              <p className="race-power-line" style={{ marginTop: 2 }}>
                <span style={{ color: race.color }}><Icon name="zap" size={12} /> {race.power.name}</span>
                <span>Afinidade: <b style={{ color: TRACKS[race.affinity].color }}>{TRACKS[race.affinity].name}</b> (dicas −{AFFINITY_DISCOUNT} moedas)</span>
              </p>
              <div style={{ marginTop: 6, maxWidth: 520 }}><XPBar totalXP={totalXP} /></div>
            </div>
            <div className="profile-level">
              <span className="level-badge" style={{ width: 64, height: 64, fontSize: 22 }}>{level}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-2)", textAlign: "center" }}>{label}</span>
            </div>
          </section>

          {/* ── Números ── */}
          <section className="profile-stats anim-rise" style={{ animationDelay: "80ms" }}>
            {stat(<Icon name="star" size={20} />, totalXP, "XP total", "var(--color-xp)")}
            {stat(<Sprite src="/assets/sprites/moedas.png" size={32} />, coins, "moedas", "var(--color-xp)")}
            {stat(<Icon name="flag" size={20} />, `${done.length}/${MISSIONS.length}`, "fases vencidas")}
            {stat(<Icon name="crown" size={20} />, `${bossesDown}/${bosses.length}`, "chefes derrotados", "#ff8a80")}
            {stat(<Icon name="check" size={20} />, flawless, "vitórias sem a solução", "var(--color-run)")}
            {supabase && email && stat(<Icon name="trophy" size={20} />, rank ? `#${rank.rank}` : "—", rank ? `no ranking (de ${rank.of})` : "no ranking", "var(--color-accent)")}
          </section>

          {/* ── Regiões: a cena de cada uma, o progresso e o chefe ── */}
          <section className="rpg-frame anim-rise" style={{ padding: "20px 22px", animationDelay: "140ms" }}>
            <h2 className="profile-h2"><Icon name="map" size={18} /> Jornada pelas regiões</h2>
            <div className="profile-regions">
              {TRACK_ORDER.map((t) => {
                const info = TRACKS[t];
                const list = missionsOfTrack(t);
                const d = list.filter(isDone).length;
                const boss = bossOf(t);
                const bossDown = boss ? isDone(boss) : false;
                const started = d > 0 || (!!list[0] && isMissionUnlocked(list[0], completedMissionIds, totalXP));
                return (
                  <Link key={t} href={`/regiao/${t}`} className={`profile-region${started ? "" : " is-locked"}`} style={{ "--tint": info.rgb } as React.CSSProperties}>
                    <span className={`profile-region-scene battle-scene is-${t}`} aria-hidden />
                    <span className="profile-region-body">
                      <span className="flex items-center gap-2">
                        <Sprite src={info.sprite} size={32} alt="" />
                        <span className="flex flex-col min-w-0">
                          <small style={{ color: info.color }}>{info.name}</small>
                          <b className="truncate">{info.subtitle}</b>
                        </span>
                      </span>
                      <span className="banner-progress" style={{ marginTop: 10 }}>
                        <span style={{ display: "block", height: "100%", width: `${(d / Math.max(1, list.length)) * 100}%`, background: info.color }} />
                      </span>
                      <span className="flex items-center justify-between" style={{ marginTop: 6, fontSize: 12.5, fontWeight: 700, color: "var(--color-text-2)" }}>
                        <span>{d}/{list.length} fases</span>
                        {boss && (
                          <span style={{ color: bossDown ? "var(--color-run)" : "#ff8a80", display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name={bossDown ? "check" : "crown"} size={13} /> {bossDown ? "Chefe derrotado" : "Chefe de pé"}
                          </span>
                        )}
                      </span>
                    </span>
                    {boss && (
                      <span className={`profile-region-boss${bossDown ? " is-down" : ""}`}>
                        <MonsterSprite monster={monsterOf(boss.id)} size={56} boss={!bossDown} />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Parede de troféus: um monstro por fase ── */}
          <section className="rpg-frame anim-rise" style={{ padding: "20px 22px", animationDelay: "200ms" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 14 }}>
              <h2 className="profile-h2" style={{ margin: 0 }}><Icon name="swords" size={18} /> Parede de troféus</h2>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-muted)" }}>
                {done.length} de {MISSIONS.length} monstros vencidos · passe o mouse para ver a fase
              </span>
            </div>
            {[...TRACK_ORDER.map((t) => ({ key: t, name: TRACKS[t].name, color: TRACKS[t].color, list: missionsOfTrack(t) })),
              { key: "bonus", name: "Masmorra Secreta", color: "#c9a7ff", list: BONUS_MISSIONS }].map((g) => (
              <div key={g.key} className="profile-trophy-row">
                <span className="profile-trophy-label" style={{ color: g.color }}>{g.name}</span>
                <div className="profile-trophies">
                  {g.list.map((m) => {
                    const won = isDone(m);
                    const foe = monsterOf(m.id);
                    const xp = xpByMission[m.id];
                    const half = won && xp !== undefined && xp <= solutionXP(m.xpReward) && xp < m.xpReward;
                    return (
                      <Link
                        key={m.id}
                        href={`/mission/${m.id}`}
                        className={`profile-trophy${won ? " is-won" : ""}${isBoss(m) ? " is-boss" : ""}`}
                        title={won
                          ? `${foe.name} — vencido em "${m.missionTitle}" (+${xp ?? m.xpReward} XP${half ? ", com a solução" : ""})`
                          : `??? — ainda não vencido ("${m.missionTitle}")`}
                      >
                        <MonsterSprite monster={foe} size={40} />
                        {won && <span className="profile-trophy-xp">{half ? "½" : <Icon name="check" size={10} />}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* ── Coleção da loja ── */}
          <section className="rpg-frame anim-rise" style={{ padding: "20px 22px", animationDelay: "260ms" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 12 }}>
              <h2 className="profile-h2" style={{ margin: 0 }}><Icon name="bag" size={18} /> Coleção</h2>
              <Link href="/loja" className="btn-nav btn-sm"><Icon name="bag" size={14} /> Loja do Mercador</Link>
            </div>
            <div className="profile-collection">
              {(Object.keys(SLOT_INFO) as ShopSlot[]).map((slot) => {
                const all = SHOP_ITEMS.filter((i) => i.slot === slot);
                const mine = all.filter((i) => ownedItems.includes(i.id));
                return (
                  <div key={slot} className="profile-collection-slot">
                    <span className="flex items-center justify-between" style={{ fontSize: 13, fontWeight: 800 }}>
                      <span>{SLOT_INFO[slot].label}</span>
                      <span style={{ color: "var(--color-muted)" }}>{mine.length}/{all.length}</span>
                    </span>
                    <span className="flex flex-wrap" style={{ gap: 6, marginTop: 8 }}>
                      {mine.length === 0 && <small style={{ color: "var(--color-muted)" }}>Nada ainda.</small>}
                      {mine.map((i) =>
                        slot === "mascote"
                          ? <span key={i.id} className="profile-pet" title={i.name}><Sprite src={i.value} size={32} alt={i.name} /></span>
                          : <span key={i.id} className={`chip${equipped[slot] === i.id ? " is-xp" : ""}`} title={i.description}>{i.name}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Conta ── */}
          {supabase && email && (
            <section className="rpg-frame flex items-center justify-between gap-3 flex-wrap" style={{ padding: "14px 22px" }}>
              <span style={{ fontSize: 13, color: "var(--color-muted)", minWidth: 0 }}>
                <b style={{ color: "var(--color-text)", wordBreak: "break-all" }}>{email}</b>
                <br />
                <span style={{ color: sync === "error" ? "var(--color-error)" : undefined }}>
                  {sync === "error" ? "Não foi possível salvar na nuvem" : "Progresso salvo na nuvem. O XP do ranking é conferido pelo servidor."}
                </span>
              </span>
              <button type="button" className="btn-nav btn-sm shrink-0" onClick={() => supabase!.auth.signOut()}>
                <Icon name="logout" size={15} /> Sair da conta
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
