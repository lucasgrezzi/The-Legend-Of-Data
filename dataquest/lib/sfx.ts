/**
 * Efeitos sonoros chiptune sintetizados com Web Audio (sem arquivos de áudio).
 * O AudioContext só nasce no primeiro som — sempre disparado por um clique, então o navegador permite.
 * Mudo fica em localStorage["dataquest-som"] = "off".
 */

export type Sfx =
  | "click" | "cast" | "fizzle" | "hit" | "hurt" | "victory" | "coin" | "levelup" | "buy" | "open" | "boss"
  | "arrows" | "quake" | "roar" | "boom" | "portal";

const KEY = "dataquest-som";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const listeners = new Set<(on: boolean) => void>();

export function soundOn(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}

export function setSoundOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  listeners.forEach((l) => l(on));
}

export function subscribeSound(l: (on: boolean) => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Uma nota com envelope rápido (ataque curto, queda exponencial) */
function tone(freq: number, at: number, dur: number, type: OscillatorType = "square", vol = 1, slideTo?: number) {
  const a = ctx!, o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master!);
  o.start(at);
  o.stop(at + dur + 0.02);
}

/** Ruído branco filtrado — impacto, explosão */
function noise(at: number, dur: number, vol = 1, freq = 1200) {
  const a = ctx!;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = buf;
  f.type = "lowpass";
  f.frequency.setValueAtTime(freq, at);
  f.frequency.exponentialRampToValueAtTime(80, at + dur);
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(at);
}

const N = { C4: 262, E4: 330, G4: 392, A4: 440, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1047, E6: 1319, G6: 1568 };

export function play(s: Sfx) {
  if (!soundOn()) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime + 0.01;
  switch (s) {
    case "click":
      tone(1400, t, 0.04, "square", 0.25);
      break;
    case "open":
      tone(N.E5, t, 0.06, "triangle", 0.5); tone(N.A5, t + 0.05, 0.08, "triangle", 0.5);
      break;
    case "cast": // feitiço subindo
      tone(300, t, 0.22, "sawtooth", 0.25, 1400);
      tone(N.E6, t + 0.16, 0.08, "square", 0.25);
      break;
    case "fizzle": // feitiço que falha
      tone(520, t, 0.28, "square", 0.3, 90);
      noise(t, 0.18, 0.25, 600);
      break;
    case "hit": // acerto no monstro
      noise(t, 0.12, 0.7, 3000);
      tone(220, t, 0.12, "square", 0.5, 70);
      break;
    case "hurt": // o monstro contra-ataca
      noise(t, 0.25, 0.8, 900);
      tone(180, t, 0.3, "sawtooth", 0.45, 50);
      break;
    case "boss":
      tone(110, t, 0.5, "sawtooth", 0.35, 82);
      tone(N.C4 / 2, t + 0.25, 0.6, "square", 0.25);
      break;
    case "victory": // fanfarra curta
      [N.C5, N.E5, N.G5].forEach((f, i) => tone(f, t + i * 0.09, 0.12, "square", 0.45));
      tone(N.C6, t + 0.27, 0.45, "square", 0.5);
      tone(N.G5, t + 0.27, 0.45, "triangle", 0.4);
      break;
    case "coin":
      tone(N.E6 * 0.75, t, 0.06, "square", 0.3); tone(N.E6, t + 0.06, 0.16, "square", 0.3);
      break;
    case "buy":
      tone(N.G5, t, 0.07, "square", 0.35); tone(N.C6, t + 0.07, 0.07, "square", 0.35); tone(N.E6, t + 0.14, 0.18, "square", 0.35);
      break;
    case "arrows": // flechas assobiando
      for (let i = 0; i < 4; i++) tone(1800 - i * 120, t + i * 0.07, 0.09, "triangle", 0.22, 600);
      tone(N.E6, t + 0.32, 0.25, "triangle", 0.25);
      break;
    case "quake": // martelo no chão
      noise(t, 0.5, 1, 500);
      tone(90, t, 0.5, "sawtooth", 0.6, 35);
      break;
    case "roar": // investida do orc
      tone(140, t, 0.35, "sawtooth", 0.5, 70);
      noise(t + 0.05, 0.3, 0.5, 1500);
      break;
    case "boom": // bomba
      tone(900, t, 0.25, "square", 0.15, 1400);
      noise(t + 0.28, 0.55, 1, 2200);
      tone(70, t + 0.28, 0.5, "square", 0.5, 30);
      break;
    case "portal": // portal da Masmorra Secreta abrindo
      tone(110, t, 1.2, "sawtooth", 0.25, 440);
      tone(N.E5, t + 0.3, 0.9, "triangle", 0.3, N.E6);
      [N.A5, N.C6, N.E6, N.A5 * 2].forEach((f, i) => tone(f, t + 0.7 + i * 0.08, 0.3, "triangle", 0.25));
      noise(t + 1, 0.6, 0.5, 4000);
      break;
    case "levelup":
      [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(f, t + i * 0.07, 0.14, "square", 0.4));
      tone(N.C6, t + 0.45, 0.6, "triangle", 0.5); tone(N.E6, t + 0.45, 0.6, "triangle", 0.3);
      break;
  }
}
