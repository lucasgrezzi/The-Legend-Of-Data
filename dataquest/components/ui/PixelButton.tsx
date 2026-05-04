"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "success" | "warning" | "error" | "default";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "nes-btn is-primary",
  success: "nes-btn is-success",
  warning: "nes-btn is-warning",
  error: "nes-btn is-error",
  default: "nes-btn",
};

export default function PixelButton({
  variant = "default",
  small,
  className = "",
  children,
  disabled,
  ...props
}: PixelButtonProps) {
  const base = disabled ? "nes-btn is-disabled" : VARIANT_CLASS[variant];
  const size = small ? "text-[6px] py-1 px-2" : "text-[7px]";
  return (
    <button
      className={`${base} ${size} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
