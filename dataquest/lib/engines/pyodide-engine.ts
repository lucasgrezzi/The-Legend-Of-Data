import type { RunResult, EngineStatus } from "@/types";

type PendingCall = {
  resolve: (result: RunResult) => void;
  reject: (err: Error) => void;
};

let worker: Worker | null = null;
let workerStatus: EngineStatus = "idle";
let callId = 0;
const pending = new Map<number, PendingCall>();
const subscribers = new Set<(s: EngineStatus) => void>();

function broadcast(s: EngineStatus) {
  workerStatus = s;
  subscribers.forEach((cb) => cb(s));
}

export function getPyodideStatus(): EngineStatus {
  return workerStatus;
}

export function subscribePyodideStatus(cb: (s: EngineStatus) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function initPyodideWorker(): void {
  if (worker) return;

  broadcast("loading");
  worker = new Worker("/pyodide-worker.js");

  worker.onmessage = (event) => {
    const msg = event.data;
    if (msg.type === "READY") {
      broadcast("ready");
    } else if (msg.type === "ERROR") {
      broadcast("error");
    } else if (msg.type === "RESULT") {
      const call = pending.get(msg.id);
      if (!call) return;
      pending.delete(msg.id);
      broadcast("ready");
      call.resolve({
        stdout: msg.stdout ?? "",
        stderr: msg.error ?? "",
        chartBase64: msg.chartBase64 ?? undefined,
        success: !msg.error,
        executionTimeMs: 0,
      });
    }
  };

  worker.onerror = () => broadcast("error");
}

export function runPython(code: string, csvData?: string): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const doRun = () => {
      if (!worker) {
        reject(new Error("Worker nao inicializado"));
        return;
      }
      const id = ++callId;
      broadcast("running");
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, code, csvData: csvData ?? null });
    };

    if (workerStatus === "ready") {
      doRun();
    } else if (workerStatus === "loading") {
      // Wait for READY event via subscriber
      const unsub = subscribePyodideStatus((s) => {
        if (s === "ready") {
          unsub();
          doRun();
        } else if (s === "error") {
          unsub();
          reject(new Error("Pyodide falhou ao carregar."));
        }
      });
    } else {
      reject(new Error("Pyodide nao esta pronto. Status: " + workerStatus));
    }
  });
}
