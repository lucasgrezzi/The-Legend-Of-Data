// Revisão completa: jogador novo percorre todas as fases em ordem; erros típicos de iniciante antes de cada solução.
// Uso (ver CLAUDE.md → "Como testar rapidamente"): com o Modo Teste aberto (`npm run teste`, porta 3001), rode
// `node scripts/revisar_fases.mjs <pasta-temporária> [http://localhost:3001]` (a pasta guarda o perfil do Chrome).
// O script cria sozinho um jogador novo no navegador de teste. Para revisar só algumas fases, passe os ids no
// fim, separados por vírgula: `node scripts/revisar_fases.mjs <pasta> http://localhost:3001 19,20`.
import { spawn } from "node:child_process";
import fs from "node:fs";
const SP = process.argv[2];
const BASE = process.argv[3] ?? "http://localhost:3001";
const ONLY = process.argv[4]?.split(",").map(Number);
const ROOT = new URL("../data/missions/", import.meta.url);
const ORDER = [0, 1, 5, 6, 2, 7, 8, 3, 17, 9, 18, 10, 11, 12, 4, 19, 20, 21, 13, 14, 15, 16]
  .filter((id) => !ONLY || ONLY.includes(id));
const solution = (id) => fs.readFileSync(new URL(`mission-${id}.ts`, ROOT), "utf-8").match(/solution: `([\s\S]*?)`,/)[1];

const P = 'import pandas as pd\ndf = pd.read_csv("/data/mission.csv")\n';
const MISTAKES = {
  1: [["acento", 'nome = "Arquivista"\nnivel = 1\nprint(nome)\nprint("Nível:", nivel)'],
      ["sem aspas", 'nome = Arquivista\nnivel = 1\nprint(nome)\nprint("Nivel:", nivel)']],
  5: [["sem vírgula", 'moedas = 100\npreco_pocao = 15\nquantidade = 3\ngasto = preco_pocao * quantidade\nmoedas = moedas - gasto\nprint("Gasto:" gasto)'],
      ["resposta pronta", 'print("Gasto: 45")\nprint("Moedas restantes: 55")']],
  6: [["sem dois-pontos", 'nivel = 7\ntem_chave = True\nif nivel >= 10\n    print("Passagem livre")'],
      ["= no lugar de ==", 'nivel = 7\ntem_chave = True\nif nivel >= 10:\n    print("Passagem livre")\nelif nivel >= 5 and tem_chave = True:\n    print("Pode passar, Arquivista")\nelse:\n    print("Volte quando for mais forte")']],
  2: [["range curto", 'for t in range(1, 3):\n    print(t)\nxp = 120\nif xp >= 100:\n    print("Arquivista Desbloqueado")'],
      ["sem recuo", 'for t in range(1, 4):\nprint(t)']],
  7: [[".add", 'mochila = ["tocha", "corda", "pocao"]\nmochila.add("mapa antigo")'],
      ["print da lista", 'mochila = ["tocha", "corda", "pocao"]\nmochila.append("mapa antigo")\nprint(mochila)\nprint("Itens:", len(mochila))']],
  8: [["sem return", 'def classificar(forca):\n    if forca < 5:\n        print("fraca")\n    elif forca < 10:\n        print("média")\n    else:\n        print("forte")\nrunas = [3, 8, 12]\nfor runa in runas:\n    print(f"Runa {runa}: {classificar(runa)}")'],
      ["sem acento", 'def classificar(forca):\n    if forca < 5:\n        return "fraca"\n    elif forca < 10:\n        return "media"\n    else:\n        return "forte"\nrunas = [3, 8, 12]\nfor runa in runas:\n    print(f"Runa {runa}: {classificar(runa)}")']],
  3: [[">= em vez de >", "SELECT produto, valor\nFROM vendas\nWHERE valor >= 150\nORDER BY valor DESC;"],
      ["sem vírgula", "SELECT produto valor\nFROM vendas\nWHERE valor > 150\nORDER BY valor DESC;"]],
  17: [["sem LIMIT", "SELECT nome, ouro\nFROM baus\nORDER BY ouro DESC;"],
       ["LIMIT sem ORDER BY", "SELECT nome, ouro\nFROM baus\nLIMIT 3;"]],
  9: [["aspas duplas", 'SELECT nome, valor FROM reliquias WHERE tipo = "arma"'],
      ["OR sem parênteses", "SELECT nome, valor FROM reliquias\nWHERE tipo = 'arma' OR tipo = 'amuleto' AND sala IN ('Norte', 'Leste') AND amaldicoada = 'nao'\nORDER BY valor DESC"]],
  18: [["sem o %", "SELECT nome, sala FROM reliquias WHERE nome LIKE 'A' ORDER BY nome"],
       ["a minúsculo", "SELECT nome, sala FROM reliquias WHERE nome LIKE 'a%' ORDER BY nome"],
       ["aspas duplas", 'SELECT nome, sala FROM reliquias WHERE nome LIKE "A%" ORDER BY nome']],
  10: [["sem AS", "SELECT COUNT(*), SUM(valor), AVG(valor), MAX(valor)\nFROM reliquias\nWHERE amaldicoada = 'nao';"]],
  11: [["SUM no WHERE", "SELECT tipo, COUNT(*) AS quantidade, SUM(valor) AS total\nFROM reliquias\nWHERE SUM(valor) > 300\nGROUP BY tipo"]],
  12: [["LEFT JOIN", "SELECT h.nome, COUNT(e.id) AS viagens, SUM(e.ouro) AS ouro_total\nFROM herois h\nLEFT JOIN expedicoes e ON e.heroi_id = h.id\nGROUP BY h.nome\nORDER BY ouro_total DESC"]],
  4: [["caminho errado", 'import pandas as pd\ndf = pd.read_csv("mission.csv")'],
      ["tabela em vez de número", P + 'filtrado = df[df["valor"] > 150]\nprint(filtrado)\nlen(filtrado)']],
  19: [["sem ascending", P + 'vitrine = df.sort_values("preco").head(3)\nfor peca in vitrine["peca"]:\n    print(peca)'],
       ["false minúsculo", P + 'vitrine = df.sort_values("preco", ascending=false).head(3)\nfor peca in vitrine["peca"]:\n    print(peca)'],
       ["lacuna", P + 'vitrine = ___\nfor peca in vitrine["peca"]:\n    print(peca)']],
  20: [["media em português", P + 'total = df["sacos"].sum()\nmedia = df["sacos"].media()'],
       ["números à mão", 'print("Total: 57")\nprint("Por dia: 9.5")\nprint("Recorde: 15")']],
  21: [["count no lugar", P + 'contagem = df["raca"].count()\nfor raca, quantidade in contagem.items():\n    print(f"{raca}: {quantidade}")'],
       ["coluna errada", P + 'contagem = df["visitante"].value_counts()\nfor raca, quantidade in contagem.items():\n    print(f"{raca}: {quantidade}")']],
  13: [["sem filtro", P + 't = df.groupby("regiao")["ouro"].sum().sort_values(ascending=False)\nfor r, v in t.items():\n    print(f"{r}: {v}")']],
  14: [["coluna errada", P + 'df["total"] = df["quantidade"] * df["preco"]\ng = df[df["quantidade"] >= 2]\nt = g.groupby("regiao")["totl"].sum()']],
  15: [["título sem acento", 'import matplotlib.pyplot as plt\nregioes = ["Norte", "Sul", "Leste", "Oeste"]\nnavios = [12, 7, 9, 4]\nplt.bar(regioes, navios)\nplt.title("Navios por regiao")']],
  16: [["esqueceu xlabel", P.replace("import pandas", "import matplotlib.pyplot as plt\nimport pandas") + 'plt.plot(df["mes"], df["tempestades"])\nplt.title("T")\nplt.ylabel("Q")']],
};

const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--remote-debugging-port=9333", `--user-data-dir=${SP}/prof-${Date.now()}`, "--window-size=1366,768", "about:blank"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 40 && !ws; i++) {
  try { const t = await (await fetch("http://127.0.0.1:9333/json")).json(); const p = t.find((x) => x.type === "page"); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
  await sleep(250);
}
if (ws.readyState !== 1) await new Promise((r) => ws.addEventListener("open", r));
let n = 0; const pend = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const cmd = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expr) => (await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const waitFor = async (expr, ms = 45000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await sleep(300); } return false; };
await cmd("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });

async function setCode(code) {
  await ev(`document.querySelector(".cm-content").focus()`);
  await cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, modifiers: 2 });
  await cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, modifiers: 2 });
  await cmd("Input.insertText", { text: code });
  await sleep(150);
}
async function send(code) {
  await ev(`document.querySelector(".modal-backdrop")?.click()`); await sleep(200);
  await setCode(code);
  await waitFor(`!![...document.querySelectorAll("button")].find(b => b.textContent.includes("Enviar Resposta") && !b.disabled)`);
  await ev(`[...document.querySelectorAll("button")].find(b => b.textContent.includes("Enviar Resposta")).click()`);
  await waitFor(`!!document.querySelector(".modal")`); await sleep(400);
  const dialog = await ev(`document.querySelector(".modal").innerText`);
  return { ok: dialog.includes("Missão Concluída"), dialog };
}
const clean = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean)
  .filter((l) => !/^(💥|Ainda não…|O feitiço falhou|Tentativa errada|Tentar de novo|Releia o Estudo)/.test(l)).slice(0, 4).join(" ⏎ ");

// jogador novo: só o prólogo concluído (no Modo Teste todas as fases já estão abertas)
await cmd("Page.navigate", { url: `${BASE}/map` }); await sleep(3000);
await ev(`localStorage.setItem("dataquest-progress", JSON.stringify({ version: 1, state: { profile: { name: "Revisor", race: "elfo" }, totalXP: 0, coins: 0, completedMissionIds: [0], unlockedMissionIds: [0, 1], xpByMission: {}, attempts: {}, currentMissionId: 1, level: 1, levelLabel: "Aprendiz", ownedItems: [], equipped: {} } })); localStorage.setItem("dataquest-tour-seen", "1")`);
for (const id of ORDER) {
  if (id === 0) continue; // prólogo (narrativa) — o seed já o marca como concluído
  await cmd("Page.navigate", { url: `${BASE}/mission/${id}` }); await sleep(2500);
  if (!(await waitFor(`!!document.querySelector(".cm-content")`, 60000))) { console.log(`M${id}: ❌ editor não abriu (bloqueada?)`); continue; }
  for (const [label, code] of MISTAKES[id] ?? []) {
    const r = await send(code);
    console.log(`M${id} ✗ ${label}: ${r.ok ? "⚠ PASSOU (não devia)" : clean(r.dialog)}`);
  }
  const r = await send(solution(id));
  console.log(`M${id} ✓ solução: ${r.ok ? "passou" : "❌ FALHOU — " + clean(r.dialog)}`);
}
chrome.kill(); process.exit(0);
