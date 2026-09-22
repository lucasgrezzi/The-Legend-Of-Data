/* eslint-disable @next/next/no-img-element */

interface SpriteProps {
  src: string;
  /** Tamanho em px — use múltiplos de 32 (32/64/96) para pixels nítidos */
  size?: number;
  alt?: string;
  style?: React.CSSProperties;
}

/** Sprite pixel art 32×32 escalado sem suavização */
export default function Sprite({ src, size = 32, alt = "", style }: SpriteProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      style={{ imageRendering: "pixelated", width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}
