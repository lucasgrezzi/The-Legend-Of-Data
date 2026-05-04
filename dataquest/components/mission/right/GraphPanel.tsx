"use client";

interface GraphPanelProps {
  chartBase64?: string;
}

export default function GraphPanel({ chartBase64 }: GraphPanelProps) {
  if (!chartBase64) return null;

  return (
    <div className="mt-2 border-2 border-[#555] p-2 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${chartBase64}`}
        alt="Grafico gerado"
        style={{ maxWidth: "100%", display: "block" }}
      />
    </div>
  );
}
