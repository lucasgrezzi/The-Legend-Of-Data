import type { RunResult, TableData } from "@/types";

let dbInstance: import("@duckdb/duckdb-wasm").AsyncDuckDB | null = null;
let initPromise: Promise<import("@duckdb/duckdb-wasm").AsyncDuckDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const duckdb = await import("@duckdb/duckdb-wasm");
    const bundles = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(bundles);

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker!}");`], {
        type: "text/javascript",
      })
    );
    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);

    dbInstance = db;
    return db;
  })();

  return initPromise;
}

export async function runQuery(sql: string, csvData?: string): Promise<RunResult> {
  const start = Date.now();
  try {
    const db = await getDB();
    const conn = await db.connect();

    try {
      if (csvData) {
        await db.registerFileText("mission.csv", csvData);
        await conn.query(
          `CREATE OR REPLACE VIEW vendas AS SELECT * FROM read_csv_auto('mission.csv')`
        );
      }

      const result = await conn.query(sql);
      const fields = result.schema.fields.map((f: { name: string }) => f.name);
      const rows: string[][] = result
        .toArray()
        .map((row: Record<string, unknown>) =>
          fields.map((h: string) => {
            const val = row[h];
            return val !== null && val !== undefined ? String(val) : "";
          })
        );

      const tableData: TableData = { headers: fields, rows };

      return {
        stdout: "",
        stderr: "",
        tableData,
        success: true,
        executionTimeMs: Date.now() - start,
      };
    } finally {
      await conn.close();
    }
  } catch (err: unknown) {
    return {
      stdout: "",
      stderr: err instanceof Error ? err.message : String(err),
      success: false,
      executionTimeMs: Date.now() - start,
    };
  }
}
