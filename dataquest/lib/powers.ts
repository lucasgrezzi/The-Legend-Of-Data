/**
 * Golpes especiais das raças: a animação do herói na batalha. Mesmo esquema do juice (DOM solto no overlay,
 * Web Animations, sem estado do React). `raceStrike` devolve em quantos ms o golpe ACERTA o monstro — a
 * BattleArena espera esse tempo para tirar a vida, tremer a tela etc.
 * Versão leve (Executar sem erro) e versão completa (golpe final, com a faixa do nome do golpe).
 */
import type { Race } from "@/types";
import { RACES } from "@/lib/races";
import { burst, flash, overlay, reduced, shake } from "@/lib/juice";
import { play } from "@/lib/sfx";

type Pt = { x: number; y: number };

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, css: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  e.style.cssText = css;
  overlay().appendChild(e);
  return e;
}

function svg(cls: string, css: string, inner: string, viewBox: string): HTMLElement {
  const wrap = el("span", cls, css);
  wrap.innerHTML = `<svg viewBox="${viewBox}" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;
  return wrap;
}

const done = (a: Animation, e: Element) => { a.onfinish = () => e.remove(); };
const shakeRoot = (s: "sm" | "md" | "lg") => shake(document.querySelector<HTMLElement>("[data-shake-root]"), s);

/** Anel que se expande do ponto de impacto */
function ring(at: Pt, color: string, size: number, ms: number, width = 5) {
  const r = el("span", "pw-ring", `left:${at.x}px;top:${at.y}px;width:${size}px;height:${size}px;border-width:${width}px;border-color:${color};box-shadow:0 0 18px ${color}`);
  done(r.animate(
    [{ transform: "translate(-50%,-50%) scale(0.1)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 0 }],
    { duration: ms, easing: "cubic-bezier(.1,.7,.3,1)" },
  ), r);
}

// ───────────── Elfo: Chuva de Flechas Lunares ─────────────
function elfo(from: Pt, to: Pt, finale: boolean): number {
  const [c1, c2] = RACES.elfo.power.colors;
  const n = finale ? 7 : 3;
  const travel = 280;
  play("arrows");
  for (let i = 0; i < n; i++) {
    const start = { x: from.x + (Math.random() - 0.5) * 80, y: from.y + (Math.random() - 0.5) * 40 };
    const end = { x: to.x + (Math.random() - 0.5) * 34, y: to.y + (Math.random() - 0.5) * 34 };
    const ang = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    const a = el("span", "pw-arrow", `left:${start.x}px;top:${start.y}px;--c1:${c1};--c2:${c2}`);
    const anim = a.animate(
      [
        { transform: `translate(-100%,-50%) rotate(${ang}deg)`, transformOrigin: "100% 50%", opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { transform: `translate(calc(-100% + ${end.x - start.x}px), calc(-50% + ${end.y - start.y}px)) rotate(${ang}deg)`, transformOrigin: "100% 50%", opacity: 1 },
      ],
      { duration: travel, delay: i * 70, easing: "cubic-bezier(.5,0,.9,.6)", fill: "backwards" },
    );
    anim.onfinish = () => {
      a.remove();
      burst(end.x, end.y, { count: 6, colors: [c1, c2], spread: 40, size: 4 });
    };
  }
  const impact = travel + (n - 1) * 70;
  if (finale) {
    setTimeout(() => {
      // a lua crescente se abre sobre o monstro
      const moon = el("span", "pw-moon", `left:${to.x}px;top:${to.y}px;--c1:${c1}`);
      done(moon.animate(
        [{ transform: "translate(-50%,-50%) scale(0.2) rotate(-40deg)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1.1) rotate(0deg)", opacity: 1, offset: 0.35 }, { transform: "translate(-50%,-50%) scale(1.5) rotate(10deg)", opacity: 0 }],
        { duration: 800, easing: "ease-out" },
      ), moon);
      ring(to, c1, 220, 650, 3);
    }, impact - 60);
  }
  return impact;
}

// ───────────── Anão: Martelo Sísmico ─────────────
const HAMMER = `<rect x="27" y="40" width="10" height="56" rx="3" fill="#7a4a24" stroke="#2a1608" stroke-width="3"/>
<rect x="4" y="8" width="56" height="34" rx="5" fill="#b9c2cf" stroke="#2a2f3a" stroke-width="3"/>
<rect x="8" y="12" width="48" height="8" rx="3" fill="#eef2f7"/>
<rect x="24" y="8" width="16" height="34" fill="#ffb74d" stroke="#2a2f3a" stroke-width="3"/>`;

function anao(_from: Pt, to: Pt, finale: boolean): number {
  const [c1, c2] = RACES.anao.power.colors;
  const size = finale ? 120 : 76;
  const fall = finale ? 460 : 340;
  const h = svg("pw-hammer", `left:${to.x}px;top:${to.y}px;width:${size}px;height:${size * 1.5}px`, HAMMER, "0 0 64 96");
  // A arena fica no topo da tela: o martelo vem girando pela direita (e não de cima, onde sairia da tela)
  // e termina com a cabeça (≈26% da altura do desenho) em cima do monstro.
  const dx = finale ? 260 : 180;
  const end = "translate(-50%, -26%)";
  done(h.animate(
    [
      { transform: `translate(calc(-50% + ${dx}px), calc(-26% + ${dx * 0.35}px)) rotate(150deg)`, opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(calc(-50% + ${dx * 0.35}px), calc(-26% - 30px)) rotate(60deg)`, offset: 0.55 },
      { transform: `${end} rotate(-12deg) scale(1.1)`, opacity: 1, offset: 0.78 },
      { transform: `${end} rotate(0deg) scale(1)`, opacity: 1, offset: 0.88 },
      { transform: `${end} rotate(0deg) scale(1)`, opacity: 0 },
    ],
    { duration: Math.round(fall / 0.78), easing: "cubic-bezier(.5,0,.8,.6)" },
  ), h);
  setTimeout(() => {
    play("quake");
    shakeRoot(finale ? "lg" : "md");
    const ground = { x: to.x, y: to.y + 26 };
    // rachaduras no chão
    const cracks = Array.from({ length: finale ? 7 : 4 }, (_, i) => {
      const ang = (i / (finale ? 7 : 4)) * Math.PI * 2 + Math.random();
      let x = 60, y = 60, d = `M60 60`;
      for (let k = 0; k < 4; k++) {
        x += Math.cos(ang + (Math.random() - 0.5) * 0.9) * 13;
        y += Math.sin(ang + (Math.random() - 0.5) * 0.9) * 7;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return `<path d="${d}" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#1a0f05" stroke-width="1.4" stroke-linecap="round"/>`;
    }).join("");
    const cs = finale ? 240 : 150;
    const crack = svg("pw-crack", `left:${ground.x}px;top:${ground.y}px;width:${cs}px;height:${cs}px`, cracks, "0 0 120 120");
    done(crack.animate(
      [{ transform: "translate(-50%,-50%) scale(0.2)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.2 }, { transform: "translate(-50%,-50%) scale(1.05)", opacity: 0 }],
      { duration: finale ? 1100 : 700, easing: "ease-out" },
    ), crack);
    ring(ground, c1, finale ? 260 : 150, 600, 4);
    burst(ground.x, ground.y, { count: finale ? 26 : 12, colors: ["#8a6a48", "#5b4330", c1, c2], spread: finale ? 150 : 90, size: 7 });
    if (finale) flash("rgba(255,183,77,0.35)", 120);
  }, fall);
  return fall;
}

// ───────────── Orc: Investida Furiosa ─────────────
function orc(from: Pt, to: Pt, finale: boolean): number {
  const [c1, c2] = RACES.orc.power.colors;
  const rush = finale ? 300 : 240;
  play("roar");
  const ang = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
  const lines = finale ? 6 : 3;
  for (let i = 0; i < lines; i++) {
    const off = (i - (lines - 1) / 2) * 12;
    const s = el("span", "pw-streak", `left:${from.x}px;top:${from.y + off}px;--c1:${c1};--c2:${c2}`);
    done(s.animate(
      [
        { transform: `translate(0,-50%) rotate(${ang}deg) scaleX(0.2)`, transformOrigin: "0 50%", opacity: 0 },
        { opacity: 1, offset: 0.3 },
        { transform: `translate(${to.x - from.x}px, calc(-50% + ${to.y - from.y - off}px)) rotate(${ang}deg) scaleX(1)`, transformOrigin: "0 50%", opacity: 0 },
      ],
      { duration: rush, delay: i * 25, easing: "cubic-bezier(.7,0,1,.5)", fill: "backwards" },
    ), s);
  }
  // o punho/presa do orc: um bloco de fúria que voa junto
  const fist = el("span", "pw-fist", `left:${from.x}px;top:${from.y}px;--c1:${c1};--c2:${c2}`);
  done(fist.animate(
    [
      { transform: "translate(-50%,-50%) scale(0.4)", opacity: 0 },
      { transform: `translate(calc(-50% + ${(to.x - from.x) * 0.3}px), calc(-50% + ${(to.y - from.y) * 0.3}px)) scale(1)`, opacity: 1, offset: 0.4 },
      { transform: `translate(calc(-50% + ${to.x - from.x}px), calc(-50% + ${to.y - from.y}px)) scale(${finale ? 1.8 : 1.3})`, opacity: 1 },
    ],
    { duration: rush, easing: "cubic-bezier(.7,0,1,.5)" },
  ), fist);
  setTimeout(() => {
    ring(to, c1, finale ? 300 : 170, finale ? 700 : 500, finale ? 8 : 5);
    if (finale) setTimeout(() => ring(to, c2, 220, 550, 4), 90);
    burst(to.x, to.y, { count: finale ? 28 : 12, colors: [c1, c2, "#fff"], spread: finale ? 170 : 90, size: 7 });
    shakeRoot(finale ? "lg" : "sm");
    flash(finale ? "rgba(255,70,40,0.4)" : "rgba(255,90,60,0.18)", 110);
  }, rush);
  return rush;
}

// ───────────── Goblin: Bomba de Engenhoca ─────────────
function goblin(from: Pt, to: Pt, finale: boolean): number {
  const [c1, c2] = RACES.goblin.power.colors;
  const flight = finale ? 560 : 440;
  play("boom");
  const bomb = el("span", `pw-bomb${finale ? " is-big" : ""}`, `left:${from.x}px;top:${from.y}px`);
  const peak = Math.min(from.y, to.y) - (finale ? 200 : 130);
  const frames: Keyframe[] = [];
  for (let k = 0; k <= 12; k++) {
    const p = k / 12;
    const x = from.x + (to.x - from.x) * p;
    // parábola passando pelo pico
    const y = (1 - p) * (1 - p) * from.y + 2 * (1 - p) * p * (peak * 2 - (from.y + to.y) / 2) + p * p * to.y;
    frames.push({ transform: `translate(calc(-50% + ${x - from.x}px), calc(-50% + ${y - from.y}px)) rotate(${p * 540}deg)` });
  }
  done(bomb.animate(frames, { duration: flight, easing: "linear" }), bomb);
  setTimeout(() => {
    ring(to, c1, finale ? 280 : 160, 600, finale ? 10 : 6);
    // engrenagens voando
    const gears = finale ? 9 : 5;
    for (let i = 0; i < gears; i++) {
      const g = svg("pw-gear", `left:${to.x}px;top:${to.y}px;width:${14 + Math.random() * 14}px;height:${14 + Math.random() * 14}px`,
        `<path d="M10 1h4l1 3 3 1 3-2 3 3-2 3 1 3 3 1v4l-3 1-1 3 2 3-3 3-3-2-3 1-1 3h-4l-1-3-3-1-3 2-3-3 2-3-1-3-3-1v-4l3-1 1-3-2-3 3-3 3 2 3-1z" fill="${i % 2 ? "#9aa3b2" : c2}" stroke="#2a2f3a" stroke-width="1.5"/><circle cx="12" cy="12" r="3.5" fill="#2a2f3a"/>`,
        "-2 -2 28 28");
      const a = Math.random() * Math.PI * 2, d = (finale ? 150 : 90) * (0.5 + Math.random() * 0.5);
      done(g.animate(
        [{ transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 40}px)) rotate(${(Math.random() - 0.5) * 900}deg)`, opacity: 0 }],
        { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.15,.7,.3,1)" },
      ), g);
    }
    // fumaça
    for (let i = 0; i < (finale ? 6 : 3); i++) {
      const s = el("span", "pw-smoke", `left:${to.x + (Math.random() - 0.5) * 60}px;top:${to.y + (Math.random() - 0.5) * 30}px`);
      done(s.animate(
        [{ transform: "translate(-50%,-50%) scale(0.3)", opacity: 0.8 }, { transform: `translate(-50%, calc(-50% - ${40 + Math.random() * 40}px)) scale(${1.4 + Math.random()})`, opacity: 0 }],
        { duration: 900 + Math.random() * 500, easing: "ease-out" },
      ), s);
    }
    burst(to.x, to.y, { count: finale ? 24 : 10, colors: [c1, c2, "#fff3c4"], spread: finale ? 150 : 80, size: 6 });
    shakeRoot(finale ? "lg" : "md");
    flash(finale ? "rgba(255,180,80,0.45)" : "rgba(255,180,80,0.2)", 110);
  }, flight);
  return flight;
}

const STRIKES: Record<Race, (from: Pt, to: Pt, finale: boolean) => number> = { elfo, anao, orc, goblin };

/** Faixa com o nome do golpe atravessando a tela (golpe final) */
export function powerBanner(race: Race, subtitle?: string) {
  const info = RACES[race];
  const b = el("div", "pw-banner", `--c1:${info.power.colors[0]};--rgb:${info.rgb}`);
  b.innerHTML = `<img src="${info.sprite}" alt="" /><span><small>${subtitle ?? `Golpe especial · ${info.name}`}</small><b>${info.power.name}!</b></span>`;
  const reducedMotion = reduced();
  done(b.animate(
    reducedMotion
      ? [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]
      : [
          { transform: "translate(-110%, -50%) skewX(-12deg)", opacity: 0 },
          { transform: "translate(-50%, -50%) skewX(-12deg)", opacity: 1, offset: 0.18 },
          { transform: "translate(-46%, -50%) skewX(-12deg)", opacity: 1, offset: 0.78 },
          { transform: "translate(60%, -50%) skewX(-12deg)", opacity: 0 },
        ],
    { duration: 1150, easing: "cubic-bezier(.2,.8,.3,1)" },
  ), b);
}

/**
 * Golpe da raça de `from` (o botão que lançou o feitiço) até `to` (o monstro).
 * Devolve os ms até o impacto. Com prefers-reduced-motion, só um flash curto.
 */
export function raceStrike(race: Race, from: Pt, to: Pt, finale = false): number {
  if (reduced()) {
    flash("rgba(255,255,255,0.25)", 100);
    return 120;
  }
  return STRIKES[race](from, to, finale);
}
