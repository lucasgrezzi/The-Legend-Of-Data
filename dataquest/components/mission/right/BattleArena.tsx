"use client";

import { useEffect, useRef, useState } from "react";
import type { Mission } from "@/types";
import { monsterOf } from "@/lib/monsters";
import { isBoss } from "@/lib/missions";
import { TRACKS } from "@/lib/tracks";
import { SOLUTION_UNLOCK_FAILS } from "@/lib/xp";
import { play } from "@/lib/sfx";
import { burst, centerOf, flash, floatText, shake } from "@/lib/juice";
import { powerBanner, raceStrike } from "@/lib/powers";
import { useGameStore } from "@/store/gameStore";
import MonsterSprite from "@/components/ui/MonsterSprite";
import Icon from "@/components/ui/Icon";

/**
 * Cada fase é um encontro: o monstro (o "bug" da fase) tem vida, reage ao código e cai no Enviar certo.
 * Executar sem erro = feitiço que fere (nunca mata: só a resposta enviada vence);
 * erro = o monstro ri e se cura; Enviar errado = contra-ataque que quebra um escudo
 * (os 3 escudos são os 3 erros que liberam a solução no Grimório).
 * Os golpes do herói usam o poder da raça (lib/powers.ts): leve no Executar, completo no golpe final.
 */
export type BattleEvent = { kind: "run-ok" | "run-error" | "miss" | "victory"; seq: number };

const RUN_LINES = [
  "Ai! Mas Executar não me derrota… Envie a resposta!",
  "Arranhou! Agora manda o Enviar, se tiver coragem.",
  "Hmpf. Feitiço bonito. Mas só o Enviar me derruba.",
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** De onde sai o golpe do herói: o botão que lançou o feitiço */
const origin = (sel: string, fallback: Element | null) => centerOf(document.querySelector(sel) ?? fallback);

interface BattleArenaProps {
  mission: Mission;
  /** Já estava concluída ao abrir (monstro aparece derrotado) */
  defeated: boolean;
  event: BattleEvent | null;
  fails: number;
  /** Fica à direita da arena (aba do arquivo) */
  children?: React.ReactNode;
}

export default function BattleArena({ mission, defeated, event, fails, children }: BattleArenaProps) {
  const monster = monsterOf(mission.id);
  const race = useGameStore((s) => s.profile?.race ?? "elfo");
  const boss = isBoss(mission);
  const track = TRACKS[mission.track];
  const maxHP = mission.xpReward * (boss ? 6 : 4);
  const [hp, setHP] = useState(defeated ? 0 : maxHP);
  const [dead, setDead] = useState(defeated);
  const [line, setLine] = useState(defeated ? "Derrotado. Você já venceu esta fase." : monster.intro);
  const [lineKey, setLineKey] = useState(0);
  const spriteRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef(hp);
  hpRef.current = hp;

  const say = (text: string) => { setLine(text); setLineKey((k) => k + 1); };

  useEffect(() => {
    if (!event || dead) return;
    const el = spriteRef.current;
    const at = centerOf(el);
    const cur = hpRef.current;

    if (event.kind === "run-ok") {
      const floor = Math.round(maxHP * 0.15);
      const dmg = Math.min(cur - floor, Math.round(maxHP * (0.18 + Math.random() * 0.12)));
      const impact = raceStrike(race, origin(".btn-run", arenaRef.current), at, false);
      setTimeout(() => {
        play("hit");
        if (dmg > 0) {
          setHP(cur - dmg);
          floatText(at.x, at.y - 20, `−${dmg}`, "#ffe08a");
        } else {
          floatText(at.x, at.y - 20, "ESQUIVOU", "#b7bfce");
        }
        el?.animate(
          [{ transform: "translateX(0)", filter: "brightness(4) saturate(0)" }, { transform: "translateX(10px)", filter: "none", offset: 0.4 }, { transform: "translateX(0)" }],
          { duration: 320, easing: "ease-out" }
        );
        burst(at.x, at.y, { count: 10, colors: [track.color, "#fff"], spread: 60, size: 5 });
        say(pick(RUN_LINES));
      }, impact);
    }

    if (event.kind === "run-error") {
      play("fizzle");
      const heal = Math.min(maxHP - cur, Math.round(maxHP * 0.1));
      if (heal > 0) {
        setHP(cur + heal);
        floatText(at.x, at.y - 20, `+${heal}`, "#3ccf7e");
      }
      el?.animate(
        [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-8px) scale(1.06)" }, { transform: "translateY(0) scale(1)" }, { transform: "translateY(-5px) scale(1.03)" }, { transform: "translateY(0)" }],
        { duration: 480, easing: "ease-in-out" }
      );
      say(pick(monster.taunts));
    }

    if (event.kind === "miss") {
      // contra-ataque: avança, acerta a tela, recua
      el?.animate(
        [{ transform: "translateX(0) scale(1)" }, { transform: "translateX(36px) scale(1.18)", offset: 0.35 }, { transform: "translateX(0) scale(1)" }],
        { duration: 420, easing: "cubic-bezier(.5,0,.3,1)" }
      );
      setTimeout(() => {
        play("hurt");
        shake(document.querySelector<HTMLElement>("[data-shake-root]"), "md");
        flash("rgba(255,70,70,0.28)", 120);
        // `fails` já inclui este erro: o escudo que acabou de quebrar é o seguinte aos que sobraram
        const broken = Math.min(SOLUTION_UNLOCK_FAILS, Math.max(1, SOLUTION_UNLOCK_FAILS - fails + 1));
        const shield = document.querySelector(`[data-shield="${broken}"]`);
        const s = centerOf(shield ?? arenaRef.current);
        floatText(s.x, s.y, "−1 escudo", "#ff6b6b");
        setHP(Math.max(cur, Math.round(maxHP * 0.5)));
      }, 150);
      say(pick(monster.taunts));
    }

    if (event.kind === "victory") {
      // faixa com o nome do golpe → o golpe especial da raça → hit-stop → o monstro desaba
      powerBanner(race, mission.bonus && boss ? "Golpe final · Masmorra Secreta" : undefined);
      const impact = raceStrike(race, origin(".btn-submit", arenaRef.current), at, true);
      setTimeout(() => {
        play("hit");
        // hit-stop: congela em silhueta branca, depois desaba
        el?.animate([{ filter: "brightness(6) saturate(0)" }, { filter: "brightness(6) saturate(0)" }], { duration: 140 });
        setHP(0);
      }, impact);
      setTimeout(() => {
        shake(document.querySelector<HTMLElement>("[data-shake-root]"), "lg");
        flash("rgba(255,255,255,0.5)", 120);
        burst(at.x, at.y, { count: 34, colors: [track.color, "#f5c451", "#fff3c4", "#ffffff"], spread: 170, size: 7 });
        floatText(at.x, at.y - 30, mission.bonus && boss ? "MASMORRA CONQUISTADA!" : boss ? "CHEFE DERROTADO!" : "GOLPE FINAL!", "#f5c451", true);
        play("victory");
        setDead(true);
        say(monster.defeat);
      }, impact + 140);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.seq]);

  const shields = Math.max(0, SOLUTION_UNLOCK_FAILS - fails);
  const pct = Math.round((hp / maxHP) * 100);
  const size = boss ? 72 : 60;

  return (
    <div
      ref={arenaRef}
      className={`battle-arena${boss ? " is-boss" : ""}${mission.bonus ? " is-secret" : ""}${dead ? " is-dead" : ""}`}
      style={{ ["--track" as string]: track.color, ["--track-rgb" as string]: track.rgb }}
      data-tour="arena"
    >
      {/* a cena da região atrás da batalha (a Masmorra Secreta fica com o roxo do portal) */}
      {!mission.bonus && <span className={`battle-scene is-${mission.track}`} aria-hidden />}
      <div className="battle-foe" title={monster.name}>
        <div ref={spriteRef} className="battle-sprite">
          <MonsterSprite monster={monster} size={size} boss={boss} />
        </div>
        <span className="battle-shadow" aria-hidden />
      </div>

      <div className="flex flex-col min-w-0 flex-1" style={{ gap: 5 }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="battle-name truncate">{monster.name}</span>
          {boss && <span className="chip is-boss">Chefe</span>}
          {dead && <span className="chip is-done"><Icon name="check" size={12} /> Derrotado</span>}
        </div>
        <div className="battle-hp" role="meter" aria-label="Vida do monstro" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={maxHP}>
          <span className="battle-hp-lag" style={{ width: `${pct}%` }} />
          <span className="battle-hp-fill" style={{ width: `${pct}%` }} />
          <span className="battle-hp-text">{hp} / {maxHP} HP</span>
        </div>
        <p key={lineKey} className="battle-line" title={line}>“{line}”</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {children}
        {!dead && <div
          className="battle-shields"
          title={
            shields > 0
              ? `Escudos: cada resposta errada quebra um. Sem escudos, a solução pode ser revelada no Grimório.`
              : "Sem escudos: a solução completa pode ser revelada no Grimório (custa metade do XP)."
          }
        >
          <span>Escudo</span>
          {Array.from({ length: SOLUTION_UNLOCK_FAILS }, (_, i) => (
            <span key={i} data-shield={i + 1} className={`shield-pip${i < shields ? "" : " is-broken"}`} aria-hidden>
              <svg viewBox="0 0 16 18" width="14" height="16"><path d="M8 1 15 3.5V9c0 4-3 6.6-7 8C4 15.6 1 13 1 9V3.5Z" /></svg>
            </span>
          ))}
        </div>}
      </div>
    </div>
  );
}
