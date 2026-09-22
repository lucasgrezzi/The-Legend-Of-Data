"use client";

import type { DataFilePreview } from "@/types";

interface DataFilePreviewProps {
  dataFile: DataFilePreview;
}

export default function DataFilePreviewComponent({ dataFile }: DataFilePreviewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3" style={{ fontSize: 13 }}>
        <span style={{ color: "var(--color-pandas)", fontWeight: 700 }}>📂 {dataFile.filename}</span>
        <span style={{ color: "var(--color-muted)" }}>
          {dataFile.rows.length} linhas · {dataFile.headers.length} colunas
        </span>
      </div>
      <div className="overflow-auto" style={{ maxHeight: 260 }}>
        <table className="table-preview">
          <thead>
            <tr>
              {dataFile.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataFile.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
