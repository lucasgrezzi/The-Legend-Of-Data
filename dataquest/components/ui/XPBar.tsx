"use client";

interface XPBarProps {
  currentXP: number;
  level: number;
  levelLabel: string;
}

export default function XPBar({ currentXP, level, levelLabel }: XPBarProps) {
  const THRESHOLDS = [0, 50, 100, 150, 200, 300];
  const nextThreshold = THRESHOLDS.find((t) => t > currentXP) ?? 300;
  const prevThreshold = THRESHOLDS.filter((t) => t <= currentXP).at(-1) ?? 0;
  const progress = Math.min(
    100,
    ((currentXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="pixel-label" style={{ color: "var(--color-xp)" }}>
          Nv {level} — {levelLabel}
        </span>
        <span className="pixel-label" style={{ color: "var(--color-xp)" }}>
          {currentXP} XP
        </span>
      </div>
      <progress
        className="nes-progress is-warning w-full"
        value={Math.round(progress)}
        max={100}
        style={{ height: "16px" }}
      />
    </div>
  );
}
