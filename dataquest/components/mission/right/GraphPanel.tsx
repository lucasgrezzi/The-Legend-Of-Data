"use client";

interface GraphPanelProps {
  chartBase64?: string;
}

export default function GraphPanel({ chartBase64 }: GraphPanelProps) {
  if (!chartBase64) return null;

  return (
    <div className="mx-4 my-3 p-2" style={{ background: "#fff", borderRadius: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${chartBase64}`}
        alt="Gráfico gerado"
        style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}
      />
    </div>
  );
}
