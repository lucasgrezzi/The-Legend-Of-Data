"use client";

import { useState, useEffect } from "react";
import type { EngineStatus, RunResult } from "@/types";
import {
  type ExtraFile,
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

  async function runCode(code: string, csvData?: string, extraFiles?: ExtraFile[]): Promise<RunResult> {
    return runPython(code, csvData, extraFiles);
  }

  return { status, runCode };
}
