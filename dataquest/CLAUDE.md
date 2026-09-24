# DataQuest — CLAUDE.md

> Tagline para o jogador: **"Aprenda Python, SQL e análise de dados jogando um RPG"**.
> "A Guilda dos Arquivistas" continua existindo só **dentro da história** (lore), não como nome do produto — jogadores não entendiam.

Plataforma educacional gamificada estilo RPG 8/16-bits para ensinar **Python, SQL, Pandas e Data Visualization**.
Inspirada no Codédex. O jogo roda 100% no navegador; o **Supabase** (opcional) guarda contas, save na nuvem e ranking.

---

## 📍 Onde paramos (retomar aqui)

> Última sessão: **2026-09-24** (com Claude Code). Leia esta seção primeiro ao retomar.

### ⚠ Estado do repositório
- **Sessões 1–3 commitadas e enviadas** ao GitHub (`master`, commit `10363cd`) em 2026-09-22.
- **Sessão 4 commitada e enviada** ao GitHub (`master`) em 2026-09-22 — ver `git log`.
  Clone local em `C:\Users\Lucas\Documents\The-Legend-Of-Data`.
- ✅ **Licenças resolvidas:** a imagem Freepik com marca d'água foi **removida**. O fundo agora é
  `public/assets/bg/mapa-mundo.png`, gerado por nós com tiles CC0 (ver Sessão 3). Tudo pode ser commitado.
- Hoje são **9 missões** (7 de Python, 1 SQL, 1 Pandas) — ver "As 9 Missões". Os `expectedOutput` das
  5 missões originais não mudaram.

### Sessão 1 — Redesign da interface
- **Tela de missão:** card QUEST fixo no topo; Lore/Grimório/Dados em abas; editor ocupa toda a altura;
  `Ctrl+Enter` executa; painel "Saída" redimensionável (splitter) com status/ms/nº de linhas;
  barra do topo mostra progresso real da trilha (1 segmento por missão).
- **Dialog de resultado** novo (`MissionResultDialog`): contador de XP animado, barra de nível, aviso de level up;
  no erro mostra esperado × obtido e treme.
- **Legibilidade:** pixel font mínimo 9px; acentuação corrigida em todos os textos.
- **Mapa estilo RPG:** trilha em zigue-zague (SVG) ligando nós, banners de região com requisito de desbloqueio,
  painel do jogador com "Continuar".
- **Bloqueio de URL:** `/mission/N` bloqueada mostra tela "Missão Bloqueada" com o que falta.
- **Bugs corrigidos:** (1) "Enviar Resposta" validava a *última execução*, não o código atual → agora reexecuta;
  (2) desbloqueio/nível eram lidos do localStorage (quebraria ao adicionar missões) → agora derivados de XP + concluídas.

### Sessão 2 — Personagem, imagens e Grimório
- **Criação de personagem** (substitui o botão "Reiniciar", que foi removido): nome + raça
  (Elfo / Anão / Orc / Goblin, cada um com guilda e lema — `lib/races.ts`). Editável clicando no `PlayerChip`.
- **Fundo do mundo** (`WorldBackground`) no mapa e na criação de personagem, com véu escuro.
- **Sprites CC0** (Dungeon Crawl Stone Soup) no lugar de emojis/imagens antigas — ver `public/assets/CREDITS.md`.
- **Texto nunca direto sobre imagem:** tudo em `.panel` / `.map-label` sólidos.
- **NES.css removido:** era importado sem `layer` e o reset dele anulava `flex`/`gap` do Tailwind
  (causa do "espaçamento errado").
- **Grimório com custo:** selado até 3 envios errados; abrir pede confirmação e a missão rende **metade do XP**.

### Sessão 3 — Fundo próprio, nomes claros e trilha Python mais rica
- **Fundo novo (CC0):** vila + floresta + estradas gerada por `scripts/gerar_fundo_mapa.py` a partir dos tiles
  Kenney **Tiny Town** (CC0). Saída 2048×1152 PNG (~100 KB). Mudar `random.seed(...)` gera outra vila.
- **Nomes mais claros:** tagline "Aprenda Python, SQL e análise de dados jogando um RPG" no topo do mapa e no
  `<title>`; criação diz "Crie seu personagem" / "Sua raça" e explica o que é o site.
- **Campo `concept` em toda missão** (ex.: "Decisões com if / elif / else"): aparece no mapa (abaixo do título),
  no cabeçalho da missão ("Você vai aprender: …"), no painel "Próxima" e na tela de bloqueio.
- **Prólogo (missão 0)** agora explica como jogar (QUEST, Executar × Enviar, XP, regra do Grimório).
- **+2 missões Python** para fixar variáveis e condicionais:
  - `mission-5` **O Mercado da Vila** — variáveis, contas e f-string (comprar poções com moedas).
  - `mission-6` **O Guardião do Portão** — `if / elif / else` + `and` (nível e chave para passar no portão).
  - A antiga "As Portas Condicionais" (id 2) virou **O Corredor das Tochas** (foco em `for`), agora Capítulo IV.
- **Ordem de jogo = ordem do array `MISSIONS`** (não mais `id ± 1`). `getNeighbors(id)` em `lib/missions.ts`
  dá anterior/próxima. Ids são estáveis (chave do progresso salvo) — missão nova recebe o próximo id livre.
- **`requiredCode` (anti-"trapaça")**: regex que o código precisa conter (comentários são ignorados).
  Se a saída está certa mas o padrão falta → erro com dica. Usado nas missões 1, 2, 5 e 6.
- Testado no navegador (Pyodide real): soluções corretas das missões 1, 2, 5, 6 passam; `print` da resposta
  pura é recusado nas 5 e 6 com a dica certa.

### Sessão 4 — Estudo, Grimório com moedas, dificuldade progressiva e fim do arco Python
Pedido do usuário: QUEST estava explícita/fácil demais; queria algo para LER a sintaxe, QUEST só como
direcionamento, dicas bloqueadas pagas com moedas ganhas a cada fase, dificuldade crescente, mais missões seguindo a lore.
- **Aba `📜 Estudo` (livre):** o campo `theory` ensina a sintaxe da fase com exemplo **diferente** da resposta
  (ex.: missão das moedas ensina com `flechas`/`dano`). Links no rodapé da QUEST levam ao Estudo/Grimório.
- **QUEST reescrita** em todas as missões: objetivo + saída esperada, sem passo a passo.
- **Dificuldade progressiva dos templates:** M1 e M3 (1ª de cada trilha) têm lacunas `___`; as seguintes só
  comentários; o chefe (M8) começa quase vazio. Comentário `// Dificuldade N/5` no topo de cada arquivo.
- **Moedas** (`coins` no store, `coinReward` em cada missão): ganhas ao concluir (1ª vez). Aparecem no
  `PlayerChip`, no cabeçalho da missão e no dialog de sucesso (sprite `moedas.png`).
- **Grimório = loja de dicas** (`HintShop.tsx`, substitui `GrimoireGate`): `hints[]` compradas **em ordem**,
  preço `hintCost(i) = 5·(i+1)` (5, 10…). A **solução completa** (`solution`) libera após
  `SOLUTION_UNLOCK_FAILS` (3) erros, não custa moedas mas faz a missão render `solutionXP` = metade do XP
  (pedido anterior do usuário mantido). Depois de concluída, tudo fica livre para revisão.
- **+2 missões Python** fechando o arco antes das Catacumbas:
  - `mission-7` **A Mochila do Arquivista** — listas (`append`, `len`, `for` em lista).
  - `mission-8` **O Selo das Catacumbas** (chefe) — funções (`def`/`return`) + if + for + f-string.
  - SQL (M3) agora começa com "Com o Selo rompido…" e exige a M8; Pandas (M4) exige a M3.
- **SQL valida a ordem**: `firstRow` do `expectedOutput` agora é checado (ORDER BY errado reprova).
- **Store v1 com `migrate`**: progresso antigo (v0) ganha as moedas das missões já concluídas;
  `attempts.grimoireOpened` → `solutionRevealed`; novo `attempts.hintsBought`.
- Testado no navegador: as 8 soluções (M1,5,6,2,7,8,3,4) passam na sequência; compra de dica desconta
  moedas e bloqueia a próxima sem saldo; 3 erros → revelar → +10 XP em vez de +20; migração credita 35 moedas.

### Sessão 5 — Contas (Supabase), save na nuvem e ranking (2026-09-24)
Site publicado na **Vercel** (Root Directory `dataquest`, deploy automático a cada push no `master`).
- **Login opcional com e-mail e senha** (escolha do usuário). Sem conta, joga como antes (só localStorage).
- `lib/supabase.ts`: cliente criado só se `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  (ou `..._ANON_KEY`) existirem; sem elas, botões de conta/ranking **somem** e o build funciona igual.
- `supabase/schema.sql`: tabela `saves` (1 linha por conta, RLS: só o dono lê/grava; `state` jsonb = snapshot
  do gameStore) + função `get_leaderboard(lim)` (security definer, expõe só nome/raça/XP/missões/`is_me`).
- `components/account/CloudSync.tsx` (montado no `layout.tsx`): ao entrar, **fica o save com mais XP**
  (nuvem × navegador); depois, cada mudança do store sobe com debounce de 800 ms. **Ao sair, o progresso local
  é zerado** (`resetProgress`) para o próximo usuário do navegador.
- Store: `loadProgress`, `resetProgress`, `progressSnapshot()` (também usado como `partialize`), `PROGRESS_VERSION`.
  Save na nuvem com versão diferente é ignorado — ao subir a versão do store, tratar a migração ali também.
- UI: `AccountButton` (☁️ Entrar / "Salvo na nuvem" + Sair) e link 🏆 Ranking no topo do mapa; "Já tem conta?"
  na criação de personagem; `/ranking` (`Leaderboard`); `/conta/nova-senha` (link do "Esqueci minha senha").
- **Configuração no Supabase** (feita pelo usuário): rodar `schema.sql`; Auth → URL Configuration: Site URL =
  domínio da Vercel e Redirect URLs `https://<dominio>/**` e `http://localhost:3000/**`; variáveis na Vercel
  e em `dataquest/.env.local` (ignorado pelo git).
- Limitações conhecidas: o XP é calculado no navegador — alguém técnico poderia gravar XP falso via API
  (limite no banco: 0–5000). O SMTP padrão do Supabase envia poucos e-mails por hora (confirmação/senha).

### Decisões tomadas (podem ser revistas)
- Só `Enviar Resposta` errado conta como erro (`Executar` não conta).
- Dicas custam moedas e podem ser compradas a qualquer momento; a **solução** exige 3 erros e custa metade
  do XP (não moedas) — assim ninguém fica travado sem moedas.
- Preço das dicas: `hintCost(i) = 5 * (i + 1)` em `lib/xp.ts`. Metade do XP arredonda para baixo (25 → 12).
- Moedas só na 1ª conclusão; revelar a solução não reduz as moedas da missão.
- Grimório e solução ficam livres depois que a missão é concluída (revisão).
- Não há reset de progresso na UI; para testar, apagar `localStorage["dataquest-progress"]` no DevTools.
- Recompensas: ver tabela "As 9 Missões". Total de moedas possível hoje: 155.

### Próximos passos sugeridos
1. Python extra (opcional): `while` e dicionários (fichas de personagem) — encaixar antes do chefe M8
   ou como "missões bônus" depois dele.
2. Aplicar o mesmo padrão (Estudo + QUEST enxuta + dicas + dificuldade crescente) às próximas missões de
   **SQL** (GROUP BY, JOIN), **Pandas** (groupby, merge) e ao módulo **Data Viz** (validação `"chart"`).
3. Loja: talvez outras coisas compráveis com moedas (cosméticos da raça, títulos).
4. Talvez: dar efeito real às raças (hoje só visuais) — ex.: desconto em dicas de uma trilha.
5. Responsividade mobile (hoje o layout é pensado para desktop ≥ 1280px).

### Como testar rapidamente
- `npm run dev -- -p 3123` → http://localhost:3123 (sem progresso salvo abre a criação de personagem).
- Estados de teste: criar temporariamente `public/__seed.html` que grava um JSON em
  `localStorage["dataquest-progress"]` (formato `{ state: {...}, version: 1 }`; use `version: 0` para testar a
  migração) e redireciona — **apagar depois**.
- Teste de todas as soluções: extrair `solution` de `data/missions/*.ts` e enviá-las pela tela da missão via CDP
  (foi assim que as 8 soluções foram validadas na Sessão 4).
- Screenshots headless: Chrome `--headless=new --screenshot` com **um `--user-data-dir` novo por captura**
  (reutilizar o perfil gera tela branca). Fluxos (digitar no CodeMirror, clicar, enviar) foram testados via
  Chrome DevTools Protocol com um script Node (`WebSocket` nativo do Node 24).
- Sempre rodar `npx tsc --noEmit` e `npm run build` antes de commitar.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 (NES.css **removido** — seu reset sem layer sobrescrevia `flex`/`gap` do Tailwind) |
| Fontes | Press Start 2P (pixel labels/botões) + JetBrains Mono (corpo/títulos bold) via `next/font/google` |
| Estado | Zustand 5 com `persist` → `localStorage` (+ nuvem via Supabase quando logado) |
| Contas | Supabase Auth (e-mail/senha) + Postgres (`saves`, `get_leaderboard`) — opcional |
| Editor | @uiw/react-codemirror + @codemirror/lang-python + lang-sql |
| Python | Pyodide 0.27.5 via Web Worker (`/public/pyodide-worker.js`) |
| SQL | @duckdb/duckdb-wasm (lazy init) |
| TypeScript | Strict, sem erros |

---

## Regras críticas do Next.js 16

- `params` é uma **Promise** → sempre `const { id } = await params`
- Turbopack é padrão → usar `turbopack: {}` em `next.config.ts` (não `webpack`)
- Tailwind v4 usa `@import "tailwindcss"` (não `@tailwind base/components/utilities`)
- Fontes via `next/font/google` — **não** usar `@import url()` no CSS
- CSS de terceiros importado sem `layer(...)` vence os utilitários do Tailwind v4 — sempre importar em layer
- Headers COOP/COEP obrigatórios para `SharedArrayBuffer` (Pyodide + DuckDB)
- Imagens locais em `/public/assets/` — usar `<img>` direto (não `next/image`) para evitar configuração extra de domínios

---

## Estrutura de Pastas

```
dataquest/
├── app/
│   ├── layout.tsx               # Root layout — fontes + metadata
│   ├── globals.css              # Tailwind + NES.css + variáveis CSS + classes de botões/seções
│   ├── page.tsx                 # Redirect → /map
│   ├── player/
│   │   ├── CharacterCreation.tsx # Criação/edição de personagem (nome + raça) — aparece no 1º acesso ao /map
│   │   └── PlayerChip.tsx       # Avatar + nome + nível/XP nas top bars (substitui o antigo "Reiniciar")
│   ├── map/page.tsx             # Tela do Mapa do Mundo
│   └── mission/[id]/page.tsx   # Tela de Missão (await params)
├── components/
│   ├── player/
│   │   ├── CharacterCreation.tsx # Criação/edição de personagem (nome + raça) — aparece no 1º acesso ao /map
│   │   └── PlayerChip.tsx       # Avatar + nome + nível/XP nas top bars (substitui o antigo "Reiniciar")
│   ├── map/
│   │   ├── WorldMap.tsx         # Painel do jogador + trilha em zigue-zague (SVG) com banners de região
│   │   └── MissionPin.tsx       # Nó circular + rótulo — locked/available/completed
│   ├── mission/
│   │   ├── MissionScreen.tsx    # Guard de bloqueio + top bar + 55/45 colunas + dialog de resultado
│   │   ├── left/
│   │   │   ├── MissionPanel.tsx # QUEST no topo + abas Lore/Estudo/Grimório/Dados + rodapé
│   │   │   ├── HintShop.tsx     # Grimório: dicas compradas com moedas + solução (3 erros, −50% XP)
│   │   │   └── DataFilePreview.tsx # Preview do CSV da missão
│   │   └── right/
│   │       ├── EditorPanel.tsx  # Editor (altura total) + Run/Submit + splitter + painel Saída
│   │       ├── CodeEditor.tsx   # Wrapper CodeMirror (Ctrl/Cmd+Enter executa)
│   │       ├── TerminalOutput.tsx
│   │       ├── TablePreview.tsx # Resultado SQL como tabela HTML
│   │       └── GraphPanel.tsx   # Gráfico matplotlib base64
│   └── ui/
│       ├── TypewriterText.tsx   # Efeito typewriter: digita char a char com pausa em pontuação
│       ├── Sprite.tsx           # <img> pixelated para sprites 32×32 (usar 32/64/96 px)
│       ├── WorldBackground.tsx  # Fundo do mapa pixel art + véu escuro (mapa e criação de personagem)
│       ├── RichText.tsx         # Renderiza theory/instructions (código, passos, parágrafos)
│       ├── XPBar.tsx            # Barra de nível (animável a partir de fromXP)
│       └── MissionResultDialog.tsx # Modal sucesso (contador XP, level up) / erro (feedback)
├── lib/
│   ├── missions.ts              # Array MISSIONS[] + getMission(id)
│   ├── races.ts                 # RACES (Elfo, Anão, Orc, Goblin): guilda, lema, sprite, cor
│   ├── tracks.ts                # TRACKS (nome, cor, rgb, ícone) + TRACK_ORDER — fonte única
│   ├── xp.ts                    # computeLevel(), levelProgress(), isMissionUnlocked(), missingRequirements()
│   ├── validation.ts            # validateOutput() — exact/table/chart/contains/narrative
│   └── engines/
│       ├── pyodide-engine.ts    # Singleton Worker: initPyodideWorker(), runPython(), subscribePyodideStatus()
│       └── duckdb-engine.ts     # Singleton DuckDB: runQuery()
├── hooks/
│   ├── usePyodide.ts            # Hook React para Pyodide (subscriber pattern)
│   ├── useDuckDB.ts             # Hook React para DuckDB (lazy init)
│   └── useHydrated.ts           # true após mount — evita mismatch com progresso do localStorage
├── store/
│   └── gameStore.ts             # Zustand: totalXP, completedMissionIds, unlockedMissionIds
├── data/
│   ├── missions/
│   │   ├── mission-0.ts … mission-8.ts   # ordem de jogo definida em lib/missions.ts
│   └── csv/vendas.csv
├── scripts/
│   └── gerar_fundo_mapa.py      # Gera public/assets/bg/mapa-mundo.png com tiles CC0 Kenney Tiny Town
├── types/index.ts               # Mission, RunResult, ValidationResult, EngineStatus…
└── public/
    ├── pyodide-worker.js        # Web Worker Pyodide (deve ficar em /public/)
    └── assets/
        ├── CREDITS.md           # Origem e licença de cada asset
        ├── bg/mapa-mundo.png    # Fundo do mapa (CC0 — gerado por scripts/gerar_fundo_mapa.py)
        └── sprites/             # Sprites 32×32 CC0 (Dungeon Crawl Stone Soup): raca-*, trilha-*, missao-*, grimorio
```

---

## As 9 Missões (na ordem de jogo)

Dataset `vendas.csv`: `id, produto, valor, regiao` — 5 linhas (Espada 300, Escudo 150, Pocao 80, Manto 200, Anel 180)

| Ordem | ID | Trilha | Título                   | Conceito                          | Dific. | XP  | Moedas | Desbloqueio | requiredCode |
|-------|----|--------|--------------------------|-----------------------------------|--------|-----|--------|-------------|--------------|
| 1     | 0  | python | O Chamado do Arquivo     | Como o jogo funciona              | —      | +10 | +10    | sempre      | —            |
| 2     | 1  | python | O Primeiro Feitiço       | print() e variáveis               | 1/5    | +20 | +10    | 0           | `nome = "Arquivista"`, `print(nome)` |
| 3     | 5  | python | O Mercado da Vila        | Variáveis e contas (+ - * /)      | 2/5    | +20 | +15    | 1           | `gasto = a * b`, `moedas = moedas -` (ou `-=`), print com `moedas` |
| 4     | 6  | python | O Guardião do Portão     | Decisões com if / elif / else     | 3/5    | +25 | +15    | 5           | `if nivel >= 10:`, `elif … and …`, `else:` |
| 5     | 2  | python | O Corredor das Tochas    | Repetição com for e range()       | 3/5    | +20 | +15    | 6           | `for … in range(`, **no máx. 2 `print`**, `if xp >=` |
| 6     | 7  | python | A Mochila do Arquivista  | Listas: append, len e for         | 4/5    | +25 | +20    | 2           | `mochila.append(`, `for … in mochila`, `len(mochila)` |
| 7     | 8  | python | O Selo das Catacumbas    | Funções: def e return (chefe)     | 5/5    | +35 | +25    | 7           | `def classificar(x):`, `return`, `for … in runas`, chamada `classificar(…)` |
| 8     | 3  | sql    | A Primeira Escavação     | SQL: SELECT, WHERE e ORDER BY     | 1/5    | +25 | +20    | 8           | — (tabela: colunas, nº de linhas e **1ª linha**) |
| 9     | 4  | pandas | A Forja Desperta         | Pandas: ler CSV e filtrar linhas  | 2/5    | +30 | +25    | 3           | `read_csv(`, filtro `["valor"] >`, `len(` |

Cada missão tem 2 dicas (`hints`) e uma `solution`. A missão 0 não tem Grimório.

**Outputs esperados:**
- M1: `"Arquivista\nNivel: 1"`
- M5: `"Gasto: 45\nMoedas restantes: 55"` (100 moedas, 3 poções × 15)
- M6: `"Pode passar, Arquivista"` (nivel = 7, tem_chave = True)
- M2: `"1\n2\n3\nArquivista Desbloqueado"`
- M7: `"tocha\ncorda\npocao\nmapa antigo\nItens: 4"`
- M8: `"Runa 3: fraca\nRuna 8: média\nRuna 12: forte"`
- M3: tabela `["produto","valor"]` com 3 linhas, 1ª = `Espada de Dados, 300` (valor > 150, ORDER BY valor DESC)
- M4: `"3"` (len do DataFrame filtrado)

**Arco da história (Python):** Prólogo na Guilda (bolsa de ouro) → Cap. I o Grimório pede que você se apresente →
Cap. II Mercado da Vila → Cap. III Guardião do Portão → Cap. IV Corredor das Tochas → Cap. V Salão das Relíquias
(mochila) → Cap. VI Selo das Catacumbas (chefe) → **SQL:** "Com o Selo rompido…" desce às Catacumbas → **Pandas:** a Forja.
O **Grimório** é, na lore, um livro vivo e ganancioso que vende dicas por ouro.

---

## Sistema de Gamificação

**Níveis:** Aprendiz (0 XP) → Escriba (50) → Cronista (100) → Arquivista (150) → Mestre dos Dados (200+)

**Fluxo por missão:**
1. Aluno digita código no editor
2. `▶ Executar` (verde) ou `Ctrl+Enter` — executa e exibe resultado no painel Saída (sem validar)
3. `Enviar Resposta` (azul) — **reexecuta o código atual**, valida, dá XP se correto, mostra dialog
4. Botão `Próximo →` (dourado) — desbloqueia apenas após Submit correto
5. Missão 0 (narrative) — auto-valida no mount, sem necessidade de código

**Persistência:** `localStorage["dataquest-progress"]` via Zustand persist

**Desbloqueio e nível são derivados, não lidos do store:** use `isMissionUnlocked(m, completedMissionIds, totalXP)`
e `computeLevel(totalXP)`. Os campos `unlockedMissionIds`/`level` persistidos podem ficar desatualizados
(ex.: missões novas adicionadas depois). Abrir `/mission/N` bloqueada mostra a tela "Missão Bloqueada" com os requisitos.

**Personagem:** `profile: { name, race }` no store. Sem profile, `/map` mostra `CharacterCreation`
e `/mission/*` redireciona para `/map`. Não há botão de reiniciar para o jogador.

**Abas da missão:** `Lore` (história, typewriter) · `Estudo` (= `mission.theory`, livre) ·
`Grimório` (dicas + solução) · `Dados` (se houver `dataFile`).

**Moedas e Grimório:** `coins` no store; `completeMission(id, xp, coins)` credita `coinReward` na 1ª vitória.
`buyHint(id, custo)` desconta e incrementa `attempts[id].hintsBought` (dicas são lidas em ordem).
Solução: `revealSolution(id)` só é oferecido com `attempts[id].fails >= SOLUTION_UNLOCK_FAILS` (3);
com `solutionRevealed`, a vitória rende `solutionXP(reward)` = metade do XP. Tudo livre após concluir.
`attempts[id].fails` só conta `Enviar Resposta` errado (não `Executar`).
XP efetivo por missão fica em `xpByMission` (o mapa mostra `+10/20 XP` quando foi pela metade).
O store é persistido com `version: 1` — mudou o formato? incremente a versão e escreva o `migrate`.

**Hidratação:** telas que dependem do progresso (`WorldMap`, `MissionScreen`) só renderizam após `useHydrated()`.

---

## Engines de Execução

### Pyodide (Python/Pandas)
- Worker em `/public/pyodide-worker.js` — carrega Pyodide 0.27.5 + pandas + matplotlib
- Singleton global — inicia **uma vez** no primeiro mount de MissionScreen, **nunca** é terminado
- CSV injetado em `/data/mission.csv` via `pyodide.FS.writeFile()`
- stdout capturado via `io.StringIO` + redirect
- Matplotlib: detecta figuras após execução via `savefig()` → base64 PNG
- `subscribePyodideStatus()` notifica todos os hooks React quando status muda

### DuckDB-Wasm (SQL)
- Init **lazy** — só carrega quando missão SQL é aberta (economiza 6MB no load inicial)
- CSV registrado como view `vendas` via `registerFileText()` + `read_csv_auto()`
- Resultado: ArrowTable → `TableData { headers, rows }`

---

## Design

### Paleta
```
--color-bg:      #0e1117   (fundo principal)
--color-surface: #161b27   (painéis)
--color-panel:   #1c2333   (cards/blocos)
--color-border:  #2a3142   (bordas)
--color-submit:  #4aaeff   (botão Submit — azul)
--color-run:     #22c55e   (botão Run — verde)
--color-accent:  #f0c040   (amarelo/dourado — logo, XP, LORE)
--color-python:  #4fc3f7
--color-sql:     #6bcb77
--color-pandas:  #ffb74d
--color-dataviz: #f48fb1
```

### Tipografia
- `var(--font-pixel)` (Press Start 2P) → chapter labels, pixel labels, botões — **jamais** usado com emoji (emoji vira ■)
- Pixel font: **mínimo 9px** e **sem maiúsculas acentuadas** (a fonte não tem Í/Ó/Ã maiúsculos → usar "Grimório", "Saída" em caixa mista)
- `var(--font-body)` (JetBrains Mono 400/700/800) → tudo o mais: narrativa, teoria, títulos bold, terminal
- Emojis sempre em `<span style={{ fontSize: N }}>` separado da pixel font

### Botões (classes CSS)
| Classe | Cor | Uso |
|--------|-----|-----|
| `.btn-run` | Verde `#22c55e` gradiente | Executar código |
| `.btn-submit` | Azul `#4aaeff` gradiente | Enviar resposta |
| `.btn-next` | Dourado `#f0c040` gradiente | Próxima missão |
| `.btn-nav` | Cinza neutro | Voltar / Mapa |

### Section headers (classe `.section-header`)
Sempre usar o padrão: emoji grande (20px) + pixel label + linha separadora colorida.
```tsx
<div className="section-header">
  <span className="section-icon">📯</span>
  <span className="section-label" style={{ color }}>LORE</span>
  <div className="section-line" style={{ background: color }} />
</div>
```

Ícones por seção: `🗡️ QUEST` (card fixo no topo) e abas `📯 Lore`, `📜 Estudo`, `🔮 Grimório`, `📂 Dados` (classes `.tabs`/`.tab`)

### Sprites (`/assets/sprites`, CC0 — ver `CREDITS.md`)
- Trilhas: Python `trilha-python` (serpente), SQL `trilha-sql` (entrada da cripta), Pandas `trilha-pandas` (martelo), Data Viz `trilha-dataviz` (orbe)
- Raças: `raca-elfo`, `raca-anao`, `raca-orc`, `raca-goblin`
- Missão: `missao-concluida` (baú), `missao-bloqueada` (portal com ?); `grimorio` (livro), `moedas` (pilha de ouro)
- Sempre via `<Sprite size={32|64|96}>` — nunca emoji para trilhas/raças

### Texto sobre imagem
Todo texto sobre o fundo do mundo fica dentro de `.panel` / `.map-label` (fundo sólido 94–96%). Nunca texto solto sobre a imagem.

### Mapa (WorldMap + MissionPin)
- Layout calculado em `layout()`: banner de região (132px) + nós (140px), x em zigue-zague `[50, 74, 50, 26]%`
- SVG com `preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"` liga os nós; dourado sólido = alcançado, tracejado = bloqueado
- Banner de região bloqueada mostra `Requer: …` via `missingRequirements()`; trilha sem missões mostra "Em breve"
- Nó: bloqueado `missao-bloqueada`, disponível = sprite da trilha (borda dourada pulsando), concluído `missao-concluida`; tag `▼ PRÓXIMA`

### Layout da tela de missão
- Top bar: logo + breadcrumb (com sprite da trilha) → segmentos de progresso da trilha (1 por missão, clicáveis se desbloqueadas) → `PlayerChip`
- Coluna esquerda 55%: chapter label → h1 bold 28px → badges (trilha, XP, moedas, "−50%" se solução revelada) → card QUEST (+ links Estudo/Grimório e contador de erros) → abas Lore/Estudo/Grimório/Dados → rodapé fixo
- Coluna direita 45%: aba arquivo → CodeMirror (flex-1) → botões → `.splitter` (arrastar / duplo clique) → painel Saída (status, ms, linhas)
- Missão narrative: painel direito mostra os 4 sprites das trilhas + texto + botão "Começar a jornada →"

### Efeito Typewriter (`TypewriterText`)
- Usado na seção LORE de todas as missões
- `speed=16ms` por char, pausa longa em `.?!`, pausa curta em `,`
- Re-anima toda vez que a missão é carregada (comportamento intencional)
- Cursor piscante via `.typewriter-cursor` CSS (não usa emoji)

---

## Como Adicionar uma Nova Missão

1. Criar `data/missions/mission-N.ts` com o **próximo id livre** (hoje: 9) — nunca reaproveitar/renumerar ids
   (são a chave do progresso salvo). Preencher `concept` com linguagem direta (o que a pessoa aprende).
   Campos de conteúdo (padrão da Sessão 4):
   - `narrative` — continua a história da missão anterior (ver "Arco da história")
   - `theory` (aba Estudo) — ensina a SINTAXE com um exemplo de outro contexto; não entrega a resposta
   - `instructions` (QUEST) — objetivo + saída esperada, sem passo a passo; menos guiada quanto mais avançada
   - `hints` — 2 dicas, da mais leve à mais específica · `solution` — código completo que passa na validação
   - `codeTemplate` — lacunas só na 1ª missão da trilha; depois, comentários; chefe quase vazio
   - `coinReward` — ~10 a 25, crescendo com a dificuldade
2. Definir `validationType`:
   - `"exact"` — compara stdout string literal
   - `"table"` — `expectedOutput` é JSON `{ headers, rowCount, firstRow? }`
   - `"chart"` — só verifica se `chartBase64` foi gerado
   - `"narrative"` — auto-valida sem executar código
3. Adicionar `unlockCondition` com `requiredMissionIds` e/ou `requiredXP`; ajustar o `unlockCondition`
   da missão que vem **depois** dela para apontar para a nova
4. Importar e inserir no array `MISSIONS` em `lib/missions.ts` **na posição de jogo** (a ordem do array é a ordem do mapa e da navegação)
5. `instructions`: usar `•` para bullets (passos numerados); linhas indentadas viram bloco de código
6. Para `exact`, adicionar `requiredCode` (regex em string TS — **escapar em dobro**: `"\\bif\\s+"`) para que
   imprimir a resposta pronta não passe. Comentários do aluno são ignorados na checagem.
7. Testar a solução real no navegador (Pyodide) — o `expectedOutput` precisa bater exatamente

---

## Melhorias Futuras Sugeridas

### Conteúdo
- [ ] Módulo Data Viz: matplotlib, seaborn — validação por `"chart"`
- [x] Missões Python de variáveis/contas e if/elif/else (ids 5 e 6)
- [ ] Mais missões Python: listas, while, funções, dicionários (próximo foco)
- [ ] Missões SQL avançadas: JOIN, GROUP BY, subconsultas
- [ ] Missões Pandas: merge, groupby, pivot_table

### Funcionalidades
- [x] Imagens RPG para trilhas SQL/Pandas/DataViz (sprites CC0)
- [x] Fundo do mapa próprio e CC0 (substituiu a imagem Freepik com marca d'água)
- [x] Animação de XP ao completar missão (counter animado + level up)
- [ ] Tela de perfil / histórico de missões concluídas
- [x] Hints/dicas desbloqueáveis por missão (Grimório: dicas por moedas; solução após 3 erros, −50% XP)
- [x] Timer de execução visível no terminal
- [ ] Suporte a múltiplos datasets por missão

### Técnico
- [ ] Pré-carregar Pyodide no `layout.tsx` (reduz espera na primeira missão Python)
- [ ] Service Worker para cache offline do bundle Pyodide (~10MB)
- [ ] Testes E2E com Playwright (validar fluxo das 5 missões)

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # inicia em http://localhost:3000

# Verificação
npx tsc --noEmit     # check TypeScript sem compilar

# Build de produção
npm run build
npm run start
```
