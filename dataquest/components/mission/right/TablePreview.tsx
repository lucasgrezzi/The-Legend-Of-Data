"use client";

import type { TableData } from "@/types";

interface TablePreviewProps {
  data: TableData | undefined;
}

export default function TablePreview({ data }: TablePreviewProps) {
  if (!data) return null;

  return (
    <div className="overflow-auto mt-2" style={{ maxHeight: 200 }}>
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
    </div>
  );
}
