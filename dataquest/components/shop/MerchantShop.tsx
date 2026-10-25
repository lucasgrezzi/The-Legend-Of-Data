"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useGate } from "@/hooks/useGate";
import { getMission } from "@/lib/missions";
import { SHOP_ITEMS, SLOT_INFO, SHOP_UNLOCK_MISSION_ID, equippedLook, type ShopItem, type ShopSlot } from "@/lib/shop";
import Sprite from "@/components/ui/Sprite";
import WorldBackground from "@/components/ui/WorldBackground";
import PlayerChip from "@/components/player/PlayerChip";
import HeroPortrait from "@/components/player/HeroPortrait";
import TopBar from "@/components/ui/TopBar";
import Icon from "@/components/ui/Icon";

const SLOTS: ShopSlot[] = ["titulo", "moldura", "mascote"];
const SLOT_ICON = { titulo: "crown", moldura: "user", mascote: "sparkle" } as const;

/** Falas do Seu Bartolo — uma por visita, para a loja não parecer um formulário */
const GREETINGS = [
  "Bem-vindo, bem-vindo! Nada aqui ajuda a passar de fase — mas olha como fica bonito.",
  "Moedas no bolso? Ótimo. Eu aceito moedas. Também aceito mais moedas.",
  "Tudo original, nada roubado das Catacumbas. Quase nada.",
  "Dicas? Isso é com aquele livro metido. Aqui é só estilo, freguês.",
];

function Preview({ item }: { item: ShopItem }) {
  if (item.slot === "mascote") return <Sprite src={item.value} size={64} alt={item.name} />;
  if (item.slot === "moldura") {
    return (
      <span
        className={`shop-frame-swatch ${item.glow ? "is-glow" : ""}`}
        style={{ ["--ring" as string]: item.value, boxShadow: `0 0 0 2px var(--frame-dark), 0 0 0 6px ${item.value}, 0 0 0 8px var(--frame-dark)` }}
      />
    );
  }
  return <span className="shop-title-swatch">“{item.value}”</span>;
}

export default function MerchantShop() {
  const gate = useGate();
  const router = useRouter();
  const { profile, totalXP, coins, completedMissionIds, ownedItems, equipped, buyItem, equipItem } = useGameStore();
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const [flash, setFlash] = useState<string | null>(null);

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

  const open = completedMissionIds.includes(SHOP_UNLOCK_MISSION_ID);
  const look = equippedLook(equipped);

  const onBuy = (item: ShopItem) => {
    if (buyItem(item.id)) {
      setFlash(item.id);
      setTimeout(() => setFlash(null), 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <WorldBackground />

      <TopBar right={<PlayerChip profile={profile} totalXP={totalXP} coins={coins} />} />

      <main className="flex-1 px-4 pt-8 pb-16">
        <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 960 }}>
          {/* ── Balcão: Seu Bartolo + prévia do personagem (o título da página fica dentro do cartão, nunca solto sobre o mapa) ── */}
          <section className="rpg-frame anim-rise flex items-center gap-6 flex-wrap" style={{ padding: "22px 26px", background: "radial-gradient(60% 140% at 0% 50%, rgba(245,196,81,0.1), transparent 70%), linear-gradient(180deg, rgba(27,33,49,0.97), rgba(19,24,36,0.97))" }}>
            <HeroPortrait race={profile.race} box={120} sprite={96} frame={look.frame} pet={look.pet} radius={18} className="anim-bob" />
            <div className="flex-1" style={{ minWidth: 260 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="pixel-chapter" style={{ margin: 0 }}>Vila do Arquivo</p>
                  <h1 style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.15 }}>Loja do Mercador</h1>
                </div>
                <Link href="/map" className="btn-nav btn-pixel is-compact shrink-0"><Icon name="arrowLeft" size={16} /> Mapa-Múndi</Link>
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600, lineHeight: 1.55, color: "var(--color-text)" }}>
                <b style={{ color: "var(--color-accent)" }}>Seu Bartolo:</b>{" "}
                “{open ? greeting : "Ô de casa! A loja ainda está fechada para balanço. Passe no Mercado da Vila primeiro — aí a gente conversa."}”
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 13.5, fontWeight: 600, color: "var(--color-muted)" }}>
                <b style={{ color: "var(--color-text)" }}>{profile.name}</b>
                {look.title && <span style={{ color: "var(--color-accent)" }}>, {look.title}</span>}
                {" · "}você tem <b style={{ color: "var(--color-xp)" }}>{coins} moedas</b>. Itens são só visuais: não dão XP nem dicas.
              </p>
            </div>
          </section>

          {!open && (
            <section className="rpg-frame" style={{ padding: "18px 22px" }}>
              <p className="flex items-center gap-2" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                <Icon name="lock" size={16} style={{ color: "var(--color-muted)" }} />
                <span>A loja abre depois de concluir <b>{getMission(SHOP_UNLOCK_MISSION_ID)?.missionTitle}</b>.</span>
              </p>
            </section>
          )}

          {open && SLOTS.map((slot) => {
            const info = SLOT_INFO[slot];
            const items = SHOP_ITEMS.filter((i) => i.slot === slot);
            return (
              <section key={slot} className="rpg-frame" style={{ padding: "18px 22px 22px" }}>
                <div className="section-header">
                  <span className="section-icon" style={{ color: "var(--color-accent)" }}><Icon name={SLOT_ICON[slot]} size={18} /></span>
                  <span className="section-label" style={{ color: "var(--color-accent)" }}>{info.label}</span>
                  <div className="section-line" style={{ background: "var(--color-accent)" }} />
                </div>
                <p style={{ margin: "-6px 0 16px", fontSize: 14, fontWeight: 600, color: "var(--color-muted)" }}>{info.hint}</p>

                <div className="shop-grid">
                  {items.map((item) => {
                    const owned = ownedItems.includes(item.id);
                    const isOn = equipped[slot] === item.id;
                    const lockedBy = item.requiresMissionId !== undefined && !completedMissionIds.includes(item.requiresMissionId)
                      ? getMission(item.requiresMissionId) : undefined;
                    const poor = !owned && coins < item.price;
                    return (
                      <article key={item.id} className={`shop-card ${isOn ? "is-on" : ""} ${lockedBy ? "is-locked" : ""} ${flash === item.id ? "is-flash" : ""}`}>
                        <div className="shop-preview"><Preview item={item} /></div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className="shop-actions">
                          {owned ? (
                            isOn ? (
                              <button type="button" className="btn-nav btn-pixel is-compact" onClick={() => equipItem(slot, null)}>Tirar</button>
                            ) : (
                              <button type="button" className="btn-run btn-pixel is-compact" onClick={() => equipItem(slot, item.id)}>Usar</button>
                            )
                          ) : lockedBy ? (
                            <span className="shop-lock"><Icon name="lock" size={13} /> Conclua <b>{lockedBy.missionTitle}</b></span>
                          ) : (
                            <button
                              type="button"
                              className="btn-next btn-pixel is-compact"
                              disabled={poor}
                              title={poor ? `Faltam ${item.price - coins} moedas` : undefined}
                              onClick={() => onBuy(item)}
                            >
                              Comprar
                            </button>
                          )}
                          <span className="shop-price">
                            {owned ? <span className="chip is-done"><Icon name="check" size={11} style={{ strokeWidth: 3 }} />{isOn ? "Em uso" : "Seu"}</span> : <><Sprite src="/assets/sprites/moedas.png" size={32} style={{ margin: "-8px -4px" }} />{item.price}</>}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
