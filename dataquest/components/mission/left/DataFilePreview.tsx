"use client";

import type { DataFilePreview } from "@/types";

interface DataFilePreviewProps {
  dataFile: DataFilePreview;
}

export default function DataFilePreviewComponent({ dataFile }: DataFilePreviewProps) {
  return (
    <div>
      <div className="pixel-label mb-1" style={{ color: "var(--color-pandas)" }}>
        📂 {dataFile.filename}
      </div>
      <div className="overflow-auto" style={{ maxHeight: 140 }}>
        <table className="table-preview" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              {dataFile.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataFile.rows.slice(0, 5).map((row, i) => (
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
