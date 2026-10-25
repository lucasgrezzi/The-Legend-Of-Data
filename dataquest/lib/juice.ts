/**
 * "Juice" — feedback visual curto e exagerado por cima da tela (tremor, partículas, números, flash).
 * Tudo é DOM solto num overlay fixo com Web Animations: não mexe no estado do React nem bloqueia cliques.
 * Com prefers-reduced-motion, tremor e partículas somem; números e flash ficam suaves.
 */

function reduced() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

let layer: HTMLDivElement | null = null;
function overlay() {
  if (!layer || !layer.isConnected) {
    layer = document.createElement("div");
    layer.className = "juice-layer";
    document.body.appendChild(layer);
  }
  return layer;
}

/** Tremor que decai (trauma²): leve para erro, forte para golpe final */
export function shake(el: HTMLElement | null, strength: "sm" | "md" | "lg" = "md") {
  if (!el || reduced()) return;
  const amp = { sm: 3, md: 7, lg: 13 }[strength];
  const frames: Keyframe[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const k = Math.pow(1 - i / steps, 2);
    const x = amp * k * Math.sin(i * 2.7);
    const y = amp * 0.6 * k * Math.sin(i * 3.9);
    const r = (strength === "lg" ? 0.6 : 0.25) * k * Math.sin(i * 1.9);
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${r}deg)` });
  }
  el.animate(frames, { duration: strength === "lg" ? 520 : 360, easing: "linear" });
}

export function centerOf(el: Element | null): { x: number; y: number } {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Explosão de partículas (faíscas quadradas, estilo pixel) */
export function burst(x: number, y: number, opts: { count?: number; colors?: string[]; spread?: number; size?: number } = {}) {
  if (reduced()) return;
  const { count = 18, colors = ["#f5c451", "#fff3c4", "#ff9f43"], spread = 120, size = 6 } = opts;
  const root = overlay();
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "juice-particle";
    const s = size * (0.6 + Math.random() * 0.8);
    p.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${colors[i % colors.length]}`;
    root.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = spread * (0.4 + Math.random() * 0.6);
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - spread * 0.25;
    p.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + spread * 0.5}px)) scale(0.2) rotate(${Math.random() * 360}deg)`, opacity: 0 },
      ],
      { duration: 550 + Math.random() * 400, easing: "cubic-bezier(.15,.7,.3,1)" }
    ).onfinish = () => p.remove();
  }
}

/** Moedas voando de um ponto até outro (ex.: do monstro até o contador de moedas) */
export function coinsFly(from: { x: number; y: number }, to: { x: number; y: number }, count = 8, onEach?: () => void) {
  if (reduced()) { onEach?.(); return; }
  const root = overlay();
  for (let i = 0; i < count; i++) {
    const c = document.createElement("img");
    c.src = "/assets/sprites/moedas.png";
    c.className = "juice-coin";
    c.style.cssText = `left:${from.x}px;top:${from.y}px`;
    root.appendChild(c);
    const mid = { x: (from.x + to.x) / 2 + (Math.random() - 0.5) * 220, y: Math.min(from.y, to.y) - 60 - Math.random() * 120 };
    const anim = c.animate(
      [
        { transform: "translate(-50%,-50%) scale(0.4)", opacity: 0 },
        { transform: `translate(calc(-50% + ${mid.x - from.x}px), calc(-50% + ${mid.y - from.y}px)) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${to.x - from.x}px), calc(-50% + ${to.y - from.y}px)) scale(0.5)`, opacity: 0.9 },
      ],
      { duration: 750 + i * 70, delay: i * 55, easing: "cubic-bezier(.45,0,.55,1)", fill: "backwards" }
    );
    anim.onfinish = () => { c.remove(); onEach?.(); };
  }
}

/** Número/texto que sobe e some (dano, +XP, "ERROU!") */
export function floatText(x: number, y: number, text: string, color = "#f5c451", big = false) {
  const root = overlay();
  const t = document.createElement("span");
  t.className = `juice-text${big ? " is-big" : ""}`;
  t.textContent = text;
  t.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  root.appendChild(t);
  const rise = reduced() ? 10 : big ? 70 : 46;
  t.animate(
    [
      { transform: "translate(-50%,-50%) scale(0.5)", opacity: 0 },
      { transform: "translate(-50%,-80%) scale(1.25)", opacity: 1, offset: 0.18 },
      { transform: "translate(-50%,-90%) scale(1)", opacity: 1, offset: 0.6 },
      { transform: `translate(-50%, calc(-90% - ${rise}px)) scale(1)`, opacity: 0 },
    ],
    { duration: big ? 1300 : 950, easing: "cubic-bezier(.2,.8,.3,1)" }
  ).onfinish = () => t.remove();
}

/** Flash de tela inteira (branco no golpe final, vermelho no contra-ataque) */
export function flash(color = "rgba(255,255,255,0.55)", ms = 140) {
  const root = overlay();
  const f = document.createElement("div");
  f.className = "juice-flash";
  f.style.background = color;
  root.appendChild(f);
  f.animate([{ opacity: reduced() ? 0.4 : 1 }, { opacity: 0 }], { duration: ms * 2.5, easing: "ease-out" }).onfinish = () => f.remove();
}
