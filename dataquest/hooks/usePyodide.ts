"use client";

import { useState, useEffect } from "react";
import type { EngineStatus, RunResult } from "@/types";
import {
  initPyodideWorker,
  runPython,
  getPyodideStatus,
  subscribePyodideStatus,
} from "@/lib/engines/pyodide-engine";

export function usePyodide() {
  const [status, setStatus] = useState<EngineStatus>(() => getPyodideStatus());

  useEffect(() => {
    // Start worker globally once — safe to call multiple times
    if (getPyodideStatus() === "idle") {
      initPyodideWorker();
    }
    const unsub = subscribePyodideStatus(setStatus);
    return unsub;
  }, []);

  async function runCode(code: string, csvData?: string): Promise<RunResult> {
    return runPython(code, csvData);
  }

  return { status, runCode };
}
