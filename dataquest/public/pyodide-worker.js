importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");

let pyodide = null;

async function init() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage(["pandas", "matplotlib"]);
  self.postMessage({ type: "READY" });
}

init().catch((err) => {
  self.postMessage({ type: "ERROR", message: err.message });
});

self.onmessage = async (event) => {
  const { id, code, csvData } = event.data;

  if (!pyodide) {
    self.postMessage({ type: "RESULT", id, stdout: "", chartBase64: null, tableJson: null, error: "Pyodide nao inicializado." });
    return;
  }

  try {
    if (csvData) {
      pyodide.FS.mkdirTree("/data");
      pyodide.FS.writeFile("/data/mission.csv", csvData);
    }

    const wrappedCode = `
import sys, io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

_buf = io.StringIO()
_real_stdout = sys.stdout
sys.stdout = _buf

try:
${code.split("\n").map((l) => "    " + l).join("\n")}
finally:
    sys.stdout = _real_stdout

_output = _buf.getvalue()
`;

    await pyodide.runPythonAsync(wrappedCode);
    const stdout = pyodide.globals.get("_output") ?? "";

    // Capture matplotlib chart if any
    const figCheck = `
import io as _io, base64 as _b64
import matplotlib.pyplot as _plt
_fignums = _plt.get_fignums()
if _fignums:
    _imgbuf = _io.BytesIO()
    _plt.gcf().savefig(_imgbuf, format="png", bbox_inches="tight", dpi=96)
    _imgbuf.seek(0)
    _chart = _b64.b64encode(_imgbuf.read()).decode("utf-8")
    _plt.close("all")
else:
    _chart = ""
`;
    await pyodide.runPythonAsync(figCheck);
    const chartBase64 = pyodide.globals.get("_chart") || null;

    self.postMessage({ type: "RESULT", id, stdout, chartBase64: chartBase64 || null, tableJson: null, error: null });
  } catch (err) {
    self.postMessage({ type: "RESULT", id, stdout: "", chartBase64: null, tableJson: null, error: String(err) });
  }
};
