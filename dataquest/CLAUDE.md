# DataQuest: A Guilda dos Arquivistas — CLAUDE.md

Plataforma educacional gamificada estilo RPG 8/16-bits para ensinar **Python, SQL, Pandas e Data Visualization**.
Inspirada no Codédex. Roda 100% no navegador — sem backend.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 + NES.css 2.2 |
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
- Fontes via `next/font/google` — **não** usar `@import url()` no CSS (conflita com NES.css)
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
│   ├── map/page.tsx             # Tela do Mapa do Mundo
│   └── mission/[id]/page.tsx   # Tela de Missão (await params)
├── components/
│   ├── map/
│   │   ├── WorldMap.tsx         # Mapa com trilhas e cards de missão
│   │   └── MissionPin.tsx       # Card clicável — usa imagens para locked/completed
│   ├── mission/
│   │   ├── MissionScreen.tsx    # Layout raiz: top bar + 55/45 colunas
│   │   ├── left/
│   │   │   ├── MissionPanel.tsx # Narrativa (typewriter), tutorial (grimório), quest (passos), rodapé
│   │   │   └── DataFilePreview.tsx # Preview do CSV da missão
│   │   └── right/
│   │       ├── EditorPanel.tsx  # Editor + Run (verde) + Submit (azul) + Terminal
│   │       ├── CodeEditor.tsx   # Wrapper CodeMirror
│   │       ├── TerminalOutput.tsx
│   │       ├── TablePreview.tsx # Resultado SQL como tabela HTML
│   │       └── GraphPanel.tsx   # Gráfico matplotlib base64
│   └── ui/
│       ├── TypewriterText.tsx   # Efeito typewriter: digita char a char com pausa em pontuação
│       ├── PixelButton.tsx      # Botão NES.css com variants
│       ├── XPBar.tsx            # Barra de XP com nível
│       └── PixelDialog.tsx      # Modal de sucesso/erro
├── lib/
│   ├── missions.ts              # Array MISSIONS[] + getMission(id)
│   ├── xp.ts                    # computeLevel(), computeUnlockedMissions(), LEVEL_THRESHOLDS
│   ├── validation.ts            # validateOutput() — exact/table/chart/contains/narrative
│   └── engines/
│       ├── pyodide-engine.ts    # Singleton Worker: initPyodideWorker(), runPython(), subscribePyodideStatus()
│       └── duckdb-engine.ts     # Singleton DuckDB: runQuery()
├── hooks/
│   ├── usePyodide.ts            # Hook React para Pyodide (subscriber pattern)
│   └── useDuckDB.ts             # Hook React para DuckDB (lazy init)
├── store/
│   └── gameStore.ts             # Zustand: totalXP, completedMissionIds, unlockedMissionIds
├── data/
│   ├── missions/
│   │   ├── mission-0.ts … mission-4.ts
│   └── csv/vendas.csv
├── types/index.ts               # Mission, RunResult, ValidationResult, EngineStatus…
└── public/
    ├── pyodide-worker.js        # Web Worker Pyodide (deve ficar em /public/)
    └── assets/
        ├── python.jpg           # Cobra RPG animada — ícone da trilha Python
        ├── bau_tesouro.jpg      # Baú de ouro — ícone de missão concluída
        └── interrogacao.png     # ? pixel art — ícone de missão bloqueada
```

---

## As 5 Missões

Dataset `vendas.csv`: `id, produto, valor, regiao` — 5 linhas (Espada 300, Escudo 150, Pocao 80, Manto 200, Anel 180)

| ID | Trilha  | Título                   | Tipo       | XP  | Desbloqueio  |
|----|---------|--------------------------|------------|-----|--------------|
| 0  | python  | O Chamado do Arquivo     | narrative  | +10 | sempre       |
| 1  | python  | O Primeiro Feitiço       | exact      | +20 | missão 0     |
| 2  | python  | As Portas Condicionais   | exact      | +20 | missão 1     |
| 3  | sql     | A Primeira Escavação     | table      | +25 | missões 1+2  |
| 4  | pandas  | A Forja Desperta         | exact      | +30 | missões 2+3  |

**Outputs esperados:**
- M1: `"Arquivista\nNivel: 1"`
- M2: `"1\n2\n3\nArquivista Desbloqueado"`
- M3: tabela `["produto","valor"]` com 3 linhas (valor > 150)
- M4: `"3"` (len do DataFrame filtrado)

---

## Sistema de Gamificação

**Níveis:** Aprendiz (0 XP) → Escriba (50) → Cronista (100) → Arquivista (150) → Mestre dos Dados (200+)

**Fluxo por missão:**
1. Aluno digita código no editor
2. `▶ Executar` (verde) — executa e exibe resultado no terminal (sem validar)
3. `Enviar Resposta` (azul) — valida output, dá XP se correto, mostra dialog
4. Botão `Próximo →` (dourado) — desbloqueia apenas após Submit correto
5. Missão 0 (narrative) — auto-valida no mount, sem necessidade de código

**Persistência:** `localStorage["dataquest-progress"]` via Zustand persist

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

Ícones por seção: `📯 LORE`, `🔮 GRIMÓRIO`, `🗡️ QUEST`

### Ícones de trilha (WorldMap)
- Python: imagem `/assets/python.jpg` (cobra RPG)
- SQL: `🏛️` (templo/catacumba)
- Pandas: `⚒️` (martelos de forja)
- DataViz: `🌠` (estrela cadente / farol)

### Ícones de missão (MissionPin)
- Bloqueada: imagem `/assets/interrogacao.png` (? pixel art)
- Disponível: `⚡` emoji
- Concluída: imagem `/assets/bau_tesouro.jpg` (baú de ouro)

### Layout da tela de missão
- Top bar: logo bold + breadcrumb track → missão + barra progresso com glow + badge XP dourado
- Coluna esquerda 55%: chapter label → h1 bold 28px → track badge → seções → rodapé fixo
- Coluna direita 45%: tab arquivo → CodeMirror → botões → terminal
- Missão narrative: painel direito mostra placeholder com 📜 e texto instrucional

### Efeito Typewriter (`TypewriterText`)
- Usado na seção LORE de todas as missões
- `speed=16ms` por char, pausa longa em `.?!`, pausa curta em `,`
- Re-anima toda vez que a missão é carregada (comportamento intencional)
- Cursor piscante via `.typewriter-cursor` CSS (não usa emoji)

---

## Como Adicionar uma Nova Missão

1. Criar `data/missions/mission-N.ts` seguindo o padrão dos existentes
2. Definir `validationType`:
   - `"exact"` — compara stdout string literal
   - `"table"` — `expectedOutput` é JSON `{ headers, rowCount, firstRow? }`
   - `"chart"` — só verifica se `chartBase64` foi gerado
   - `"narrative"` — auto-valida sem executar código
3. Adicionar `unlockCondition` com `requiredMissionIds` e/ou `requiredXP`
4. Importar e adicionar no array `MISSIONS` em `lib/missions.ts`
5. `instructions`: usar `•` para bullets (renderizados como passos numerados coloridos)

---

## Melhorias Futuras Sugeridas

### Conteúdo
- [ ] Módulo Data Viz (missão 5+): matplotlib, seaborn — validação por `"chart"`
- [ ] Mais missões Python: listas, dicionários, funções
- [ ] Missões SQL avançadas: JOIN, GROUP BY, subconsultas
- [ ] Missões Pandas: merge, groupby, pivot_table

### Funcionalidades
- [ ] Imagens RPG para trilhas SQL/Pandas/DataViz (atualmente usam emoji)
- [ ] Animação de XP ao completar missão (counter animado)
- [ ] Tela de perfil / histórico de missões concluídas
- [ ] Hints/dicas desbloqueáveis por missão (custo XP)
- [ ] Timer de execução visível no terminal
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
