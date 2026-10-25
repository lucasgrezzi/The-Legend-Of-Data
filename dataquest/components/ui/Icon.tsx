/**
 * Ícones da interface (traço de 2px, 24×24, no estilo do Lucide) — no lugar dos emojis,
 * que mudam de desenho em cada sistema. Herdam a cor do texto (currentColor).
 */
const PATHS = {
  map: "M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5m6-11v13.5",
  book: "M4 19.5V5a2 2 0 0 1 2-2h13v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H19v-5",
  bag: "M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1h-13a1 1 0 0 1-1-1.1L6 7Zm3 0V6a3 3 0 0 1 6 0v1",
  trophy: "M8 21h8m-4-4v4m-5-17h10v5a5 5 0 0 1-10 0V4Zm10 1h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-2.9-13a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01",
  play: "M7 4.5v15a.8.8 0 0 0 1.2.7l12-7.5a.8.8 0 0 0 0-1.4l-12-7.5A.8.8 0 0 0 7 4.5Z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  reset: "M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5",
  lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
  check: "M4.5 12.5 9.5 17.5 19.5 6.5",
  crown: "M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z",
  sparkle: "M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3Z",
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  volume: "M11 5 6 9H2v6h4l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13",
  volumeOff: "M11 5 6 9H2v6h4l5 4V5Zm11 4-6 6m0-6 6 6",
  heart: "M12 21s-7.5-4.6-9.5-9.3C1 8 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 6 3.5 4.5 7.2C19.5 16.4 12 21 12 21Z",
  arrowRight: "M5 12h14m-6-6 6 6-6 6",
  x: "M18 6 6 18M6 6l12 12",
  scroll: "M8 21h11a2 2 0 0 0 2-2v-1H10v1a2 2 0 1 1-4 0V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2h4m2-4h9a2 2 0 0 1 2 2v13M10 8h7m-7 4h7",
  wand: "M15 4V2m0 8V8m-4-2H9m12 0h-2m-1.8-3.2L16 4m1.2 5.2L16 8M3 21l10.5-10.5m-1.5-1.5 3 3",
  folder: "M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z",
  terminal: "M4 17l6-5-6-5m8 12h8",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Zm0 0v6h6",
  swords: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6m-3 3 4 4m-1 1 2-2M9.5 6.5 14 2h3v3l-4.5 4.5M5 14l-2 2m3 3-2 2",
  flag: "M4 22V4m0 0s1.5-1 5-1 5 2 8 2 3-1 3-1v11s-1 1-3 1-5-2-8-2-5 1-5 1",
  cloud: "M17.5 19H7a5 5 0 1 1 .9-9.9A6 6 0 0 1 19.5 11a4 4 0 0 1-2 8Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  chevronRight: "M9 6l6 6-6 6",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  keyboard: "M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10",
  alert: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  star: "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9L12 2.5Z",
  user: "M20 21a8 8 0 0 0-16 0m8-8a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  dice: "M4 4h16v16H4zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  flask: "M9 3h6m-5 0v6L4.5 19a1.3 1.3 0 0 0 1.1 2h12.8a1.3 1.3 0 0 0 1.1-2L14 9V3M7 15h10",
  mapPin: "M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
} as const;

export type IconName = keyof typeof PATHS;

/** Ícones que ficam melhores preenchidos */
const FILLED: Partial<Record<IconName, true>> = { play: true, crown: true, sparkle: true, star: true, zap: true };

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Texto para leitor de tela; sem ele o ícone é decorativo */
  label?: string;
}

export default function Icon({ name, size = 18, className, style, label }: IconProps) {
  const filled = FILLED[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 1.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
