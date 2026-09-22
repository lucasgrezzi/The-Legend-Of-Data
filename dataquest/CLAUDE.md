# DataQuest — CLAUDE.md

> Tagline para o jogador: **"Aprenda Python, SQL e análise de dados jogando um RPG"**.
> "A Guilda dos Arquivistas" continua existindo só **dentro da história** (lore), não como nome do produto — jogadores não entendiam.

Plataforma educacional gamificada estilo RPG 8/16-bits para ensinar **Python, SQL, Pandas e Data Visualization**.
Inspirada no Codédex. Roda 100% no navegador — sem backend.

---

## 📍 Onde paramos (retomar aqui)

> Última sessão: **2026-09-22** (com Claude Code). Leia esta seção primeiro ao retomar.

### ⚠ Estado do repositório
- **Sessões 1–3 commitadas e enviadas** ao GitHub (`master`) em 2026-09-22 — ver `git log`.
  Clone local em `C:\Users\Lucas\Documents\The-Legend-Of-Data`.
- ✅ **Licenças resolvidas:** a imagem Freepik com marca d'água foi **removida**. O fundo agora é
  `public/assets/bg/mapa-mundo.png`, gerado por nós com tiles CC0 (ver Sessão 3). Tudo pode ser commitado.
- As 5 missões originais foram **mantidas** (acentuação, nomes/conceitos mais claros; `expectedOutput` intacto)
  e ganhamos **+2 missões de Python** (ids 5 e 6). Total: 7 missões.

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

### Decisões tomadas (podem ser revistas)
- "Errar mais de 3 vezes" foi interpretado como **libera após o 3º erro** → `GRIMOIRE_UNLOCK_FAILS = 3` em `lib/xp.ts`.
- Metade do XP arredonda para baixo (`grimoireXP`): 25 → 12.
- Só `Enviar Resposta` errado conta como erro (`Executar` não conta).
- Grimório é livre na missão narrativa (0) e depois que a missão já foi concluída.
- O Grimório exibe o campo `theory` da missão (tratado como "a resolução").
- Não há reset de progresso na UI; para testar, apagar `localStorage["dataquest-progress"]` no DevTools.

- SQL (id 3) agora exige só a última missão de Python (id 2, que por sua vez exige 6 → 5 → 1 → 0).
- Missão 5 vale +20 XP e missão 6 vale +25 XP.

### Próximos passos sugeridos
1. **Commitar/push** (branch `master`) — não há mais bloqueio de licença.
2. **Continuar enriquecendo Python** (pedido do usuário: "enriquecer Python primeiro, depois as outras"):
   ideias na ordem — listas (inventário), `while`, funções (`def` = criar seu próprio feitiço), dicionários
   (fichas de personagem). Depois SQL (GROUP BY, JOIN), Pandas e o módulo **Data Viz** (validação `"chart"`).
3. Talvez: separar `theory` (ensino) de uma nova `solution` (resolução) se o Grimório deve mostrar só a resposta.
4. Talvez: dar efeito real às raças (hoje são só visuais) — ex.: bônus de XP por trilha.
5. Responsividade mobile (hoje o layout é pensado para desktop ≥ 1280px).

### Como testar rapidamente
- `npm run dev -- -p 3123` → http://localhost:3123 (sem progresso salvo abre a criação de personagem).
- Estados de teste: criar temporariamente `public/__seed.html` que grava um JSON em
  `localStorage["dataquest-progress"]` (formato `{ state: {...}, version: 0 }`) e redireciona — **apagar depois**.
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
| Estado | Zustand 5 com `persist` → `localStorage` |
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
│   │   │   ├── MissionPanel.tsx # QUEST no topo + abas Lore/Grimório/Dados + rodapé
│   │   │   ├── GrimoireGate.tsx # Grimório selado/liberado + confirmação de −50% XP
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
│   │   ├── mission-0.ts … mission-6.ts   # ordem de jogo definida em lib/missions.ts
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

## As 7 Missões (na ordem de jogo)

Dataset `vendas.csv`: `id, produto, valor, regiao` — 5 linhas (Espada 300, Escudo 150, Pocao 80, Manto 200, Anel 180)

| Ordem | ID | Trilha | Título                 | Conceito                          | Tipo      | XP  | Desbloqueio | requiredCode |
|-------|----|--------|------------------------|-----------------------------------|-----------|-----|-------------|--------------|
| 1     | 0  | python | O Chamado do Arquivo   | Como o jogo funciona              | narrative | +10 | sempre      | —            |
| 2     | 1  | python | O Primeiro Feitiço     | print() e variáveis               | exact     | +20 | 0           | `nome = "Arquivista"`, `print(nome)` |
| 3     | 5  | python | O Mercado da Vila      | Variáveis e contas (+ - * /)      | exact     | +20 | 1           | `gasto = a * b`, `moedas = moedas -`, f-string com `{moedas}` |
| 4     | 6  | python | O Guardião do Portão   | Decisões com if / elif / else     | exact     | +25 | 5           | `if nivel >= 10:`, `elif nivel >= 5 and tem_chave`, `else:` |
| 5     | 2  | python | O Corredor das Tochas  | Repetição com for (+ if)          | exact     | +20 | 6           | `for … in range(`, `if xp >=` |
| 6     | 3  | sql    | A Primeira Escavação   | SQL: SELECT, WHERE e ORDER BY     | table     | +25 | 2           | —            |
| 7     | 4  | pandas | A Forja Desperta       | Pandas: ler CSV e filtrar linhas  | exact     | +30 | 2 + 3       | —            |

**Outputs esperados:**
- M1: `"Arquivista\nNivel: 1"`
- M5: `"Gasto: 45\nMoedas restantes: 55"` (100 moedas, 3 poções × 15)
- M6: `"Pode passar, Arquivista"` (nivel = 7, tem_chave = True)
- M2: `"1\n2\n3\nArquivista Desbloqueado"`
- M3: tabela `["produto","valor"]` com 3 linhas (valor > 150)
- M4: `"3"` (len do DataFrame filtrado)

**Capítulos da trilha Python:** Prólogo (0) → Cap. I (1) → Cap. II (5) → Cap. III (6) → Cap. IV (2).

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

**Grimório (dica com custo):** aba `Grimório` (= `mission.theory`) fica **selada** até
`GRIMOIRE_UNLOCK_FAILS` (3) envios errados. Abrir pede confirmação e marca `attempts[id].grimoireOpened`;
a missão passa a render `grimoireXP(reward)` = metade (arredonda p/ baixo). Livre na missão narrativa
e depois de concluída. `attempts[id].fails` só conta `Enviar Resposta` errado (não `Executar`).
XP efetivo por missão fica em `xpByMission` (o mapa mostra `+10/20 XP` quando foi pela metade).

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

Ícones por seção: `🗡️ QUEST` (card fixo no topo) e abas `📯 Lore`, `🔮 Grimório`, `📂 Dados` (classes `.tabs`/`.tab`)

### Sprites (`/assets/sprites`, CC0 — ver `CREDITS.md`)
- Trilhas: Python `trilha-python` (serpente), SQL `trilha-sql` (entrada da cripta), Pandas `trilha-pandas` (martelo), Data Viz `trilha-dataviz` (orbe)
- Raças: `raca-elfo`, `raca-anao`, `raca-orc`, `raca-goblin`
- Missão: `missao-concluida` (baú), `missao-bloqueada` (portal com ?); `grimorio` (livro)
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
- Coluna esquerda 55%: chapter label → h1 bold 28px → badges (trilha, XP, "−50%" se Grimório aberto) → card QUEST (+ contador de erros) → abas Lore/Grimório/Dados → rodapé fixo
- Coluna direita 45%: aba arquivo → CodeMirror (flex-1) → botões → `.splitter` (arrastar / duplo clique) → painel Saída (status, ms, linhas)
- Missão narrative: painel direito mostra os 4 sprites das trilhas + texto + botão "Começar a jornada →"

### Efeito Typewriter (`TypewriterText`)
- Usado na seção LORE de todas as missões
- `speed=16ms` por char, pausa longa em `.?!`, pausa curta em `,`
- Re-anima toda vez que a missão é carregada (comportamento intencional)
- Cursor piscante via `.typewriter-cursor` CSS (não usa emoji)

---

## Como Adicionar uma Nova Missão

1. Criar `data/missions/mission-N.ts` com o **próximo id livre** (hoje: 7) — nunca reaproveitar/renumerar ids
   (são a chave do progresso salvo). Preencher `concept` com linguagem direta (o que a pessoa aprende).
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
- [x] Hints/dicas desbloqueáveis por missão (Grimório: 3 erros, −50% XP)
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
