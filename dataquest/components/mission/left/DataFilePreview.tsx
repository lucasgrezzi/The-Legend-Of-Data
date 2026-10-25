"use client";

import Icon from "@/components/ui/Icon";
import type { DataFilePreview } from "@/types";

interface DataFilePreviewProps {
  dataFile: DataFilePreview;
}

export default function DataFilePreviewComponent({ dataFile }: DataFilePreviewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3" style={{ fontSize: 13, fontWeight: 700 }}>
        <span className="flex items-center gap-2" style={{ color: "var(--color-pandas)" }}>
          <Icon name="folder" size={15} /> {dataFile.table ? <>tabela <code style={{ fontFamily: "var(--font-mono)" }}>{dataFile.table}</code></> : <code style={{ fontFamily: "var(--font-mono)" }}>{dataFile.filename}</code>}
        </span>
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
