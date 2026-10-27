importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");

let pyodide = null;

async function init() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage(["pandas", "matplotlib"]);
  pyodide.runPython(`
import sys, io
import matplotlib
matplotlib.use("Agg")
`);
  self.postMessage({ type: "READY" });
}

init().catch((err) => {
  self.postMessage({ type: "ERROR", message: err.message });
});

self.onmessage = async (event) => {
  const { id, code, csvData, extraFiles } = event.data;

  if (!pyodide) {
    self.postMessage({ type: "RESULT", id, stdout: "", chartBase64: null, tableJson: null, error: "Pyodide nao inicializado." });
    return;
  }

  if (csvData) {
    pyodide.FS.mkdirTree("/data");
    pyodide.FS.writeFile("/data/mission.csv", csvData);
  }
  // Arquivos extras da missão (ex.: catalogo.csv para o merge), em /data/<nome>
  for (const f of extraFiles ?? []) {
    pyodide.FS.mkdirTree("/data");
    pyodide.FS.writeFile(`/data/${f.name}`, f.csv);
  }

  // O código do aluno roda sozinho (sem embrulho) para os números de linha do erro baterem com o editor,
  // e num namespace novo a cada execução — variáveis de uma execução antiga não "salvam" a seguinte.
  const ns = pyodide.globals.get("dict")();
  ns.set("__name__", "__main__");
  pyodide.runPython(`
_dq_buf = io.StringIO()
_dq_real_stdout = sys.stdout
sys.stdout = _dq_buf
`);

  let error = null;
  try {
    await pyodide.runPythonAsync(code, { globals: ns });
  } catch (err) {
    error = err && err.message ? err.message : String(err);
  } finally {
    pyodide.runPython("sys.stdout = _dq_real_stdout");
    ns.destroy();
  }

  // O que foi impresso antes do erro também volta (ajuda a achar onde o feitiço quebrou)
  const stdout = pyodide.runPython("_dq_buf.getvalue()") ?? "";

  let chartBase64 = null;
  let chartMeta = null;
  if (!error) {
    try {
      pyodide.runPython(`
import io as _io, base64 as _b64, json as _json
import matplotlib.pyplot as _plt
from matplotlib.patches import Rectangle as _Rect
_fignums = _plt.get_fignums()
_chart_meta = ""
if _fignums:
    # O que foi desenhado (para validar o gráfico, não só "existe um gráfico")
    _axes = _plt.gcf().axes
    if _axes:
        _ax = _axes[0]
        _bars = [p for p in _ax.patches if isinstance(p, _Rect)]
        _num = lambda v: float(v) if hasattr(v, "__float__") else None
        _chart_meta = _json.dumps({
            "bars": [_num(p.get_height()) for p in _bars],
            "lines": [[_num(v) for v in l.get_ydata()] for l in _ax.lines],
            "title": _ax.get_title() or (_plt.gcf()._suptitle.get_text() if _plt.gcf()._suptitle else ""),
            "xlabel": _ax.get_xlabel(),
            "ylabel": _ax.get_ylabel(),
            "legend": [t.get_text() for t in _ax.get_legend().get_texts()] if _ax.get_legend() else [],
            "lineColors": [matplotlib.colors.to_hex(l.get_color()) for l in _ax.lines],
        })
    _imgbuf = _io.BytesIO()
    _plt.gcf().savefig(_imgbuf, format="png", bbox_inches="tight", dpi=96)
    _imgbuf.seek(0)
    _chart = _b64.b64encode(_imgbuf.read()).decode("utf-8")
    _plt.close("all")
else:
    _chart = ""
`);
      chartBase64 = pyodide.globals.get("_chart") || null;
      chartMeta = pyodide.globals.get("_chart_meta") || null;
    } catch (err) {
      error = err && err.message ? err.message : String(err);
    }
  } else {
    pyodide.runPython("import matplotlib.pyplot as _plt\n_plt.close('all')");
  }

  self.postMessage({ type: "RESULT", id, stdout, chartBase64, chartMeta, tableJson: null, error });
};
