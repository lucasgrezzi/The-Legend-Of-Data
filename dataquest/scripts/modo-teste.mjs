// `npm run teste` → abre o jogo em http://localhost:3001 no Modo Teste (ver lib/testMode.ts).
// Porta própria = progresso próprio: o que se testa aqui não mistura com o `npm run dev` (3000) nem com o site.
import { spawn } from "node:child_process";

console.log("\n🧪 Modo Teste: abra http://localhost:3001 — todas as fases abertas, sem login, nada vai para a nuvem.\n");
spawn("npx", ["next", "dev", "-p", "3001"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_MODO_TESTE: "1" },
}).on("exit", (code) => process.exit(code ?? 0));
