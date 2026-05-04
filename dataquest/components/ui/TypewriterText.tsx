"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function TypewriterText({
  text,
  speed = 18,
  delay = 400,
  style,
  className,
}: TypewriterTextProps) {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setCount(0);
    setActive(false);
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [text, delay]);

  useEffect(() => {
    if (!active) return;
    if (count >= text.length) return;
    const ch = text[count];
    const pause =
      ch === "\n" ? 0
      : ch === "." || ch === "!" || ch === "?" ? speed * 9
      : ch === "," ? speed * 3
      : speed;
    timerRef.current = setTimeout(() => setCount((c) => c + 1), pause);
    return () => clearTimeout(timerRef.current);
  }, [active, count, text, speed]);

  const done = count >= text.length;

  return (
    <span style={{ whiteSpace: "pre-line", ...style }} className={className}>
      {text.slice(0, count)}
      {!done && <span className="typewriter-cursor" />}
    </span>
  );
}
