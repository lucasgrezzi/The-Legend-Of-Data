"use client";

import PixelButton from "./PixelButton";

interface PixelDialogProps {
  open: boolean;
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  success: "var(--color-sql)",
  error: "#ff4444",
  info: "var(--color-accent)",
};

const TYPE_ICON: Record<string, string> = {
  success: "★",
  error: "✗",
  info: "i",
};

export default function PixelDialog({ open, type, message, onClose }: PixelDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="nes-container is-dark with-title"
        style={{ maxWidth: 480, width: "90%", cursor: "default" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="title pixel-h2"
          style={{ color: TYPE_COLOR[type] }}
        >
          {TYPE_ICON[type]} {type === "success" ? "Missao Concluida!" : type === "error" ? "Tente Novamente" : "Info"}
        </p>
        <p className="mission-text whitespace-pre-wrap" style={{ color: "#e0e0e0", fontSize: 16 }}>
          {message}
        </p>
        <div className="flex justify-center mt-4">
          <PixelButton
            variant={type === "success" ? "success" : type === "error" ? "error" : "primary"}
            onClick={onClose}
          >
            OK
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
