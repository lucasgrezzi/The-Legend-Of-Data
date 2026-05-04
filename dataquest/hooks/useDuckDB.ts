"use client";

import { useState } from "react";
import type { EngineStatus, RunResult } from "@/types";
import { runQuery } from "@/lib/engines/duckdb-engine";

export function useDuckDB() {
  const [status, setStatus] = useState<EngineStatus>("idle");

  async function runSQL(sql: string, csvData?: string): Promise<RunResult> {
    setStatus("running");
    try {
      const result = await runQuery(sql, csvData);
      setStatus("ready");
      return result;
    } catch (err: unknown) {
      setStatus("error");
      return {
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        success: false,
        executionTimeMs: 0,
      };
    }
  }

  return { status, runSQL };
}
