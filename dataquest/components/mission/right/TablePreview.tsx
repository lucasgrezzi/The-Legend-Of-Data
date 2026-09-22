"use client";

import type { TableData } from "@/types";

interface TablePreviewProps {
  data: TableData | undefined;
}

export default function TablePreview({ data }: TablePreviewProps) {
  if (!data) return null;

  if (data.rows.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-muted)", margin: 0 }}>A consulta não retornou nenhuma linha.</p>;
  }

  return (
    <table className="table-preview">
      <thead>
        <tr>
          {data.headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
