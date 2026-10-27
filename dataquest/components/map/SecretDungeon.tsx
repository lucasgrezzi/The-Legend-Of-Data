"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Mission } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { BONUS_MISSIONS, bossOf, isBoss, SECRET_DUNGEON_TRACK } from "@/lib/missions";
import { monsterOf } from "@/lib/monsters";
import { play } from "@/lib/sfx";
import { reduced } from "@/lib/juice";
import MonsterSprite from "@/components/ui/MonsterSprite";
import Icon from "@/components/ui/Icon";
import { usePinState } from "./WorldHub";

/** Já viu a parede desabar? (a revelação só toca uma vez por navegador) */
const SEEN_KEY = "dataquest-masmorra-vista";
const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

function seen(): boolean {
  try { return localStorage.getItem(SEEN_KEY) === "1"; } catch { return true; }
}
function markSeen() {
  try { localStorage.setItem(SEEN_KEY, "1"); } catch {}
}

/** A Masmorra Secreta está aberta? (o chefe da região da entrada caiu) */
export function useSecretDungeon() {
  const completed = useGameStore((s) => s.completedMissionIds);
  const boss = bossOf(SECRET_DUNGEON_TRACK);
  const open = !!boss && completed.includes(boss.id);
  const cleared = BONUS_MISSIONS.every((m) => completed.includes(m.id));
  return { open, cleared };
}

/**
 * Cinemática de entrada: um portal se abre no meio da tela, as runas giram, a silhueta do monstro aparece
 * e um clarão leva para a sala. Chama `onDone` no fim (ou logo, com prefers-reduced-motion).
 */
function PortalCinematic({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const foe = monsterOf(mission.id);
  const room = BONUS_MISSIONS.findIndex((m) => m.id === mission.id) + 1;
  const finish = useRef(onDone);
  finish.current = onDone;
  useEffect(() => {
    play("portal");
    const t = setTimeout(() => finish.current(), reduced() ? 250 : 2100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="portal-cine" role="presentation">
      <div className="portal-cine-vortex">
        <span className="portal-ring is-1" />
        <span className="portal-ring is-2" />
        <span className="portal-ring is-3" />
        <span className="portal-runes" aria-hidden>
          {RUNES.slice(0, 16).split("").map((r, i) => (
            <i key={i} style={{ transform: `rotate(${i * 22.5}deg) translateY(-150px)` }}>{r}</i>
          ))}
        </span>
        <span className="portal-foe"><MonsterSprite monster={foe} size={128} boss={isBoss(mission)} /></span>
      </div>
      <p className="portal-cine-title">
        <small>Masmorra Secreta · Sala {room === 0 ? "?" : ["I", "II", "III", "IV"][room - 1]}</small>
        <b>{mission.missionTitle}</b>
      </p>
      <span className="portal-cine-flash" />
    </div>
  );
}

/**
 * A entrada da Masmorra Secreta, no fim da região do Python: parede selada até o chefe cair;
 * depois, o portal com as salas bônus (cada uma é uma batalha com monstro raro).
 */
export default function SecretDungeon() {
  const router = useRouter();
  const stateOf = usePinState();
  const xpByMission = useGameStore((s) => s.xpByMission);
  const { open, cleared } = useSecretDungeon();
  const [entering, setEntering] = useState<Mission | null>(null);
  const [reveal, setReveal] = useState(false);

  // primeira vez com a masmorra aberta: a parede racha e desaba
  useEffect(() => {
    if (!open || seen()) return;
    markSeen();
    setReveal(true);
    const t = setTimeout(() => play("quake"), 350);
    const t2 = setTimeout(() => play("portal"), 1100);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [open]);

  if (!open) {
    return (
      <section className="secret-door is-sealed anim-rise" aria-label="Parede rachada">
        <div className="secret-wall" aria-hidden>
          <span className="secret-glint" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="pixel-label" style={{ margin: 0, color: "#9d8cc8" }}>???</p>
          <p className="secret-title">Uma parede rachada</p>
          <p className="secret-text">
            Um brilho roxo escapa pelas frestas. Dizem que a parede só cede para quem derrota o chefe desta região.
          </p>
        </div>
        <span className="chip is-locked"><Icon name="lock" size={12} /> Selada</span>
      </section>
    );
  }

  return (
    <section className={`secret-door is-open${reveal ? " is-revealing" : ""}${cleared ? " is-cleared" : ""} anim-rise`}>
      {reveal && <span className="secret-rubble" aria-hidden>{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>}
      <div className="secret-head">
        <div className="secret-portal" aria-hidden>
          <span className="portal-ring is-1" />
          <span className="portal-ring is-2" />
          <span className="secret-portal-core" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="pixel-label" style={{ margin: 0, color: "#c9a7ff" }}>Bônus · Masmorra Secreta</p>
          <p className="secret-title">{cleared ? "Masmorra conquistada!" : "Um portal se abriu na parede"}</p>
          <p className="secret-text">
            {cleared
              ? "A Esfinge abriu o baú. A Fênix e o título de quem decifra enigmas esperam por você na Loja."
              : "Fases opcionais e mais difíceis, com monstros raros. Não bloqueiam nada — e o tesouro no fim é lendário."}
          </p>
        </div>
      </div>

      <div className="secret-rooms">
        {BONUS_MISSIONS.map((m, i) => {
          const state = stateOf(m);
          const foe = monsterOf(m.id);
          const boss = isBoss(m);
          const xp = xpByMission[m.id];
          const card = (
            <>
              <span className="secret-room-foe">
                {state === "locked"
                  ? <span className="secret-room-unknown"><Icon name="lock" size={22} /></span>
                  : <MonsterSprite monster={foe} size={64} boss={boss && state !== "completed"} />}
              </span>
              <span className="flex-1 min-w-0 flex flex-col" style={{ gap: 3 }}>
                <span className="secret-room-kicker">Sala {["I", "II", "III"][i]}{boss ? " · Chefe bônus" : ""}</span>
                <span className="secret-room-title truncate">{state === "locked" ? "???" : m.missionTitle}</span>
                <span className="secret-room-concept truncate">{state === "locked" ? "Vença a sala anterior" : m.concept}</span>
              </span>
              <span className="flex flex-col items-end gap-1 shrink-0">
                {state === "completed"
                  ? <span className="chip is-done"><Icon name="check" size={12} /> {xp ?? m.xpReward} XP</span>
                  : <span className="chip is-xp">+{m.xpReward} XP</span>}
                {state === "available" && <span className="secret-room-go"><Icon name="swords" size={14} /> Entrar</span>}
              </span>
            </>
          );
          return state === "locked" ? (
            <div key={m.id} className="secret-room is-locked">{card}</div>
          ) : (
            <button
              key={m.id}
              type="button"
              className={`secret-room is-${state}${boss ? " is-boss" : ""}`}
              onClick={() => setEntering(m)}
              title={`Entrar: ${m.missionTitle}`}
            >
              {card}
            </button>
          );
        })}
      </div>

      {entering && <PortalCinematic mission={entering} onDone={() => router.push(`/mission/${entering.id}`)} />}
    </section>
  );
}
