# DataQuest — CLAUDE.md

> Tagline para o jogador: **"Aprenda Python, SQL e análise de dados jogando um RPG"**.
> "A Guilda dos Arquivistas" continua existindo só **dentro da história** (lore), não como nome do produto — jogadores não entendiam.

Plataforma educacional gamificada estilo RPG 8/16-bits para ensinar **Python, SQL, Pandas e Data Visualization**.
Inspirada no Codédex. O jogo roda 100% no navegador; o **Supabase** (opcional) guarda contas, save na nuvem e ranking.

---

## 📍 Onde paramos (retomar aqui)

> Última sessão: **2026-10-25** (Sessão 18, com Claude Code). Leia esta seção primeiro ao retomar.

### ⚠ Estado do repositório
- **Sessões 1–3 commitadas e enviadas** ao GitHub (`master`, commit `10363cd`) em 2026-09-22.
- **Sessão 4 commitada e enviada** ao GitHub (`master`) em 2026-09-22 — ver `git log`.
- **Sessão 5 commitada e enviada** em 2026-09-24 (commits `7766fdd` → `f483f80`). Tudo em produção.
  Clone local em `C:\Users\Lucas\Documents\The-Legend-Of-Data`.
- 🌐 **Produção:** https://the-legend-of-data.vercel.app (Vercel, Root Directory `dataquest`, deploy automático
  a cada push no `master`). O usuário pede para **commitar e dar push** ao terminar cada mudança — é assim que o
  site atualiza.
- ✅ **Licenças resolvidas:** a imagem Freepik com marca d'água foi **removida**. O fundo agora é
  `public/assets/bg/mapa-mundo.png`, gerado por nós com tiles CC0 (ver Sessão 3). Tudo pode ser commitado.
- **Sessões 6, 7 e 8 commitadas e enviadas** em 2026-09-27 (trilha SQL; 10 níveis + neblina; perfil só leitura).
- **Sessão 9 commitada e enviada** em 2026-10-08 (mapa com visual RPG imersivo).
- **Sessão 10 commitada e enviada** em 2026-10-09 (Forja II: groupby; história reescrita em tom meta + "No mundo real").
- **Sessão 11 commitada e enviada** em 2026-10-24 (o Grimório traduz os erros de Python e SQL).
- **Sessão 12 commitada e enviada** em 2026-10-24 (tela da missão no estilo RPG + tutorial guiado).
- **Sessão 13 commitada e enviada** em 2026-10-24 (Bestiário, Loja do Mercador, M14–M16, login/ranking RPG).
- **Sessão 15 commitada e enviada** em 2026-10-26 (mapa corrigido + 5 fases novas de SQL e Pandas; Modo Teste local).
- **Sessão 16 commitada e enviada** (`dc0d855`): Mapa-Múndi, uma tela por região e chefe do Data Viz (fase 22).
- **Sessão 17 commitada e enviada** (redesign profissional de todas as telas; aprovado pelo usuário).
- **Sessão 18 commitada e enviada**: batalha em toda fase, sons, juice, Mapa-Múndi com HUD e fundo novo em 4 biomas.
- **Sessão 14 commitada e enviada** em 2026-10-24 (revisão das 17 fases). Em 2026-10-25, para liberar espaço no PC
  (disco 96% cheio), foram apagados `node_modules/`, `.next/` e o cache do npm: **rode `npm install` antes de
  `npm run dev`/`build`**. O script de revisão das fases foi salvo em `scripts/revisar_fases.mjs`.
- Hoje são **23 missões** (7 de Python, 7 de SQL, 6 Pandas, 3 Data Viz), em 4 regiões, cada uma terminando num chefe — ver "As 23 Missões". Os `expectedOutput` das
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

### Sessão 5 — Publicação, contas (Supabase), ranking, login obrigatório e cursor (2026-09-24)
Pedidos do usuário, na ordem: publicar para colaboradores → login + banco para ranking → tela de login antes do
personagem, alinhada e animada → login obrigatório para todos, telas menores, sem "Entrar" dentro do jogo →
cursor de RPG (manopla dourada).

**Publicação (Vercel)**
- Projeto importado do GitHub com Root Directory `dataquest`. Variáveis em Settings → Environment Variables:
  `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (mudou variável → **Redeploy**).
- Localmente as mesmas variáveis ficam em `dataquest/.env.local` (ignorado pelo git; já criado).
- GitHub Pages **não serve**: não permite os headers COOP/COEP de que Pyodide/DuckDB precisam.

**Supabase** (projeto `ooidqzdrngzvdvzwzznl`, criado pelo usuário)
- `supabase/schema.sql` (já executado no SQL Editor): tabela `saves` — 1 linha por conta (`user_id`, `name`,
  `race`, `total_xp` 0–5000, `missions_done`, `state` jsonb = `{ version, state }` do gameStore, `updated_at`).
  RLS: cada pessoa só lê/cria/atualiza a própria linha; `anon` não lê nada. Função `get_leaderboard(lim)`
  (security definer) expõe só nome, raça, XP, missões e `is_me` — nunca e-mail nem o save.
- Auth: **e-mail + senha**, **confirmação de e-mail DESLIGADA** (decisão do usuário: cadastrou, já joga).
  URL Configuration: Site URL = domínio da Vercel; Redirect URLs com `https://<dominio>/**` e
  `http://localhost:3000/**` (necessário para o link de "Esqueci minha senha").
- O usuário já tinha uma tabela própria (`id`, `created_at`, `nome_jogador`, `email`) — **não foi usada nem
  alterada**; o nome dela não foi informado. A chave publishable não cria tabelas: DDL é pelo SQL Editor.

**Fluxo de entrada** (`hooks/useGate.ts`, usado no mapa e na missão)
- Etapas: `loading` → `login` → `cloud-error` → `character` → `play`. Com Supabase configurado, **todo mundo
  passa pelo login antes de jogar** — inclusive quem já tinha personagem só no navegador. `/mission/N` sem
  login volta para `/map` (tela de login). Sem Supabase, o jogo funciona como antes (só localStorage).
- `LoginScreen` (abas Entrar / Criar conta com indicador deslizante, "Esqueci minha senha") →
  `CharacterCreation` (com indicador de etapas) → mapa. `/conta/nova-senha` recebe o link de redefinição.
- Moldura comum `components/ui/GateShell.tsx`: logo com brilho + etapas Conta → Personagem → Jornada num painel
  só; entrada em cascata `.anim-rise` + `delay(ms)`; `.anim-bob` nas raças do login. As telas cabem em
  **1366×768 sem rolar** (lema da raça virou `title` da carta).

**Save na nuvem** (`components/account/CloudSync.tsx`, montado no `layout.tsx`)
- Ao entrar: lê o save da nuvem e **fica o que tiver mais XP** (nuvem × navegador) — ninguém perde progresso.
- Só depois de ler com sucesso (`syncedId`) cada mudança do store sobe (debounce 800 ms) — nunca sobrescreve a
  nuvem sem ter lido antes. Se a leitura falhar, tela "Tentar de novo".
- Ao sair (`SIGNED_OUT`): `resetProgress()` zera o navegador para o próximo usuário.
- Store: `loadProgress`, `resetProgress`, `progressSnapshot()` (também é o `partialize`), `PROGRESS_VERSION`.
  Save da nuvem com versão diferente é ignorado — **ao subir a versão do store, migrar ali também**.
- Estado da conta em `store/accountStore.ts` (`ready`, `email`, `sync`: idle/loading/saving/saved/error).

**UI de conta e ranking**
- Topo do mapa: 🏆 Ranking + `AccountButton` (☁️ "Salvo na nuvem" → menu com e-mail e "Sair da conta").
  Dentro do jogo **não aparece "Entrar"** (a pessoa já está logada).
- `AuthDialog` (janela, só usada no `/ranking` para quem não entrou) abre via **portal** em `document.body`:
  o `backdrop-filter` da top bar prendia o `position: fixed` e cortava a janela ao meio.
- `/ranking` (`Leaderboard`): medalhas 🥇🥈🥉, raça, nível, XP, missões; destaca "(você)".

**Cursor de RPG**
- Manopla toda dourada em pixel art, **arte própria** (o usuário mostrou uma referência estilo League of Legends:
  dedo para cima, punho redondo, polegar na frente, pulseira com rebites — não copiar arte da Riot).
- `scripts/gerar_cursor.py` → `public/assets/cursors/luva.png` e `luva-hover.png` (mais brilhante + faísca),
  32×32, ponto de clique (9,1) = `HOTSPOT` do script (se mudar, atualizar o CSS).
- CSS: `--cursor-default` no `html`; `--cursor-hover` em botões/links/abas — **use `var(--cursor-hover)` em vez
  de `pointer`**; campos de texto e CodeMirror mantêm `cursor: text`.

**Testado** (script CDP em Node, contas `dataquest.teste.*@example.com` — o usuário deve apagá-las em
Authentication → Users): 12 testes de API (RLS, XP absurdo recusado, ranking sem dados sensíveis, senha errada);
na interface: pessoa nova (login → personagem → mapa → "Salvo na nuvem" → ranking), conta existente em
navegador limpo (progresso volta), convidado antigo cai no login, sair zera o navegador, telas em 1366×768,
cursor aplicado em produção.

**Limitações conhecidas**
- O XP é calculado no navegador: alguém técnico poderia gravar XP falso via API (banco limita 0–5000).
- Com a confirmação desligada, qualquer um com o link cria conta (inclusive com e-mail que não é seu).
- O SMTP padrão do Supabase envia poucos e-mails por hora ("Esqueci minha senha").
- Dev server ligado por muitas horas pode quebrar `/mission/[id]` com "Jest worker … exceeding retry limit":
  parar, apagar `.next` e rodar `npm run dev` de novo.

### Sessão 6 — Trilha SQL completa: "As Catacumbas de Dados" (2026-09-27)
Pedido do usuário: priorizar conteúdo (SQL) pensando na experiência do jogador; a **loja vem depois** (próximo foco).
- **+4 missões SQL** no padrão da Sessão 4 (Estudo com exemplo de outro contexto — tabelas `monstros`/`magos` —,
  QUEST enxuta, 2 dicas, solução, `requiredCode`), entre a M3 e a Forja:
  - `mission-9` **O Salão dos Ossos** (2/5) — `WHERE` com `AND`/`OR`/`IN` e parênteses. O Guardião dos Ossos
    (esqueleto) só deixa levar armas/amuletos das salas Norte/Leste, sem maldição.
  - `mission-10` **O Inventário do Guardião** (3/5) — `COUNT`/`SUM`/`AVG`/`MAX` + `AS`, uma linha.
  - `mission-11` **As Criptas por Tipo** (4/5) — `GROUP BY` + `HAVING` + `ORDER BY`.
  - `mission-12` **O Rei Esquecido** (chefe, 5/5) — `JOIN` `expedicoes` × `herois` + `GROUP BY`. Lyra (sem
    expedições) é a armadilha: com `LEFT JOIN` saem 5 linhas e reprova.
  - A Forja (M4) agora exige a M12 e a narrativa começa "Atrás do trono do Rei Esquecido…".
- **Dados próprios** em `data/catacumbas.ts` (`RELIQUIAS`, `HEROIS`, `EXPEDICOES`, helper `csvTable`). Mudou um
  valor? recalcule os `expectedOutput` das missões 9–12.
- **Várias tabelas por missão SQL:** `DataFilePreview.table` (nome da view; padrão `vendas`) +
  `Mission.extraDataFiles`; `missionDataFiles(m)` em `lib/missions.ts`; `runQuery(sql, tables[])` cria uma view
  por tabela. A aba Dados mostra todas ("tabela herois", "tabela expedicoes").
- **`requiredCode.flags`** (ex.: `"i"`) — SQL não diferencia maiúsculas.
- Validação de tabela: quando a 1ª linha não bate, a mensagem agora diz "valores calculados não batem" (1 linha) ou
  "confira o filtro e a ordem" (várias) — antes dizia sempre "fora de ordem".
- **Testado:** 12 casos no DuckDB-Wasm (Node, com a `validateOutput` real) — soluções e variações corretas passam;
  sem parênteses, filtro por id, sem `WHERE` na M10, `WHERE` indevido na M11 e `LEFT JOIN` na M12 reprovam.
  No navegador (build sem Supabase via `.env.production.local` temporário, já apagado): as 4 soluções enviadas pela
  tela passam, XP +125 e moedas +95 creditados, aba Dados com as 2 tabelas.
- ⚠ **Observação:** o nível máximo (Mestre dos Dados) é 200 XP e o jogo já soma 335 XP — quem termina o Python
  já está quase no teto. Vale criar mais níveis (ver próximos passos).

### Sessão 7 — 10 níveis e neblina nas terras inexploradas (2026-09-27)
Pedido do usuário: resolver o teto de nível e "não dar para ver os próximos níveis" — uma névoa/nuvens tampando o que
está mais abaixo na página.
- **Níveis:** 5 → 10 (ver "Sistema de Gamificação"). Quem estava em "Mestre dos Dados" com 200–329 XP passou a
  Explorador de Criptas/Arquivista — os nomes são derivados do XP, nada a migrar no store nem no banco.
- **Neblina no mapa** (`components/map/MapFog.tsx` + CSS `.map-fog*` em `globals.css`): véu escuro quase opaco
  (borda com máscara de 64 px), duas camadas de névoa que derivam, nuvens em pixel art na borda (derivando) e mais
  fracas no fundo, cartão "Terras inexploradas". Largura total da tela (`100vw`; o `main` tem `overflow-x: clip`).
  `backdrop-filter: blur` é bônus — no Chrome headless não aplicou, por isso a opacidade sozinha já esconde o texto.
- **Recuo animado:** `useFogReveal(anchor, order, enabled)` usa `useLayoutEffect` (volta para a âncora antiga antes da
  1ª pintura, sem piscar) e só roda com o gate em `play` (senão gravaria a âncora do estado inicial).
- **Nuvens:** `scripts/gerar_nuvens.py` → `public/assets/fog/nuvem-1..3.png` (arte própria; ver CREDITS.md).
- Testado (build sem Supabase + CDP, 1366×768): jogador novo (neblina logo após o Prólogo; clique na área encoberta
  não chega nas missões), jogador que avançou (recua da M10 para a M11, rola a página, grava a âncora), tudo concluído
  (só a trilha Data Viz "Em breve" encoberta); chip mostra "Nv 5 Explorador de Criptas" sem quebrar.

### Sessão 8 — Personagem fixo e ficha do perfil (2026-09-27)
Pedido do usuário: depois de criado, o personagem **não pode mais ser alterado**; clicar no perfil deve só mostrar a
ficha (boneco grande, nome, XP, moedas…). E o botão "☁️ Salvo na nuvem" não precisa ficar exposto.
- `PlayerChip` (mapa e missão) abre `components/player/ProfileDialog.tsx` (portal, Esc fecha): retrato 96 px com
  `anim-bob`, nome, raça · guilda, lema, `XPBar`, XP/moedas/missões, progresso por trilha e — logado — e-mail, status da
  nuvem (vermelho só se der erro) e **Sair da conta**. Cabe em 1366×768 (`maxHeight` + rolagem de segurança).
- Edição removida: `CharacterCreation` não tem mais `initial`/`onCancel` ("Editar personagem"/"Cancelar"); o texto avisa
  "não dá para mudar depois". `setProfile` no store só grava se ainda não houver personagem (o `resetProgress` ao sair
  limpa, então a próxima conta cria o seu normalmente).
- `AccountButton` saiu do topo do mapa; no ranking usa `guestOnly` (só "Entrar" para visitantes). Continua como `corner`
  nas telas de entrada (criação de personagem / erro da nuvem) para dar como sair da conta ali.
- Limitação: o `name`/`race` do save na nuvem ainda pode ser mudado por alguém técnico via API (RLS permite atualizar a
  própria linha) — como o XP; só importa se o ranking virar competição.

### Decisões tomadas (podem ser revistas)
- Só `Enviar Resposta` errado conta como erro (`Executar` não conta).
- Dicas custam moedas e podem ser compradas a qualquer momento; a **solução** exige 3 erros e custa metade
  do XP (não moedas) — assim ninguém fica travado sem moedas.
- Preço das dicas: `hintCost(i) = 5 * (i + 1)` em `lib/xp.ts`. Metade do XP arredonda para baixo (25 → 12).
- Moedas só na 1ª conclusão; revelar a solução não reduz as moedas da missão.
- Grimório e solução ficam livres depois que a missão é concluída (revisão).
- Não há reset de progresso na UI; para testar, apagar `localStorage["dataquest-progress"]` no DevTools
  (logado, o save da nuvem volta ao recarregar — use uma aba anônima ou saia da conta).
- Login obrigatório (e-mail + senha, sem confirmação); ao entrar, vale o save com mais XP; ao sair, zera o navegador.
- Ranking ordena por XP, depois missões concluídas, depois quem chegou primeiro.
- Recompensas: ver tabela "As 14 Missões". Total de moedas possível hoje: 275.

### Sessão 9 — Mapa com visual RPG imersivo (2026-10-08)
Pedido do usuário: "design melhor e mais bonito" → escolheu **RPG mais imersivo**, prioridade **só o mapa**.
- **Molduras pixel art** (`.rpg-frame`): contorno escuro + filete dourado + rebites (SVG em `--rivet`) nos cantos.
  Usada no painel "Sua Jornada", nos estandartes e no cartão da neblina.
- **Estandartes de região** (`.region-banner`): tecido tingido com `--tint` = `rgb` da trilha, medalhão redondo
  com o sprite e caudas de fita (`.banner-tail`) nas laterais; bloqueado vira cinza.
- **Nós** = medalhões com aro duplo (`--ring`), sombra no chão e selo verde ✓ quando concluídos; a próxima missão brilha.
- **Rótulos em pergaminho** (`.map-label.is-completed/.is-available`); bloqueados continuam escuros. Texto sobre
  pergaminho usa `track.ink` (novo campo em `lib/tracks.ts`) e `var(--ink)`.
- **Estrada de terra** no SVG: contorno → chão batido → pegadas douradas tracejadas (bloqueada = pedras cinza).
- **Herói no mapa:** sprite da raça (`.map-hero`) parado ao lado da próxima missão, do lado oposto ao rótulo.
- **Barra de madeira** no topo (`.wood-bar`, logo com brilho `.gate-logo`), chip do jogador em placa dourada.
- `XPBar pixel` (barra reta com marcas a cada 10%), botão `.btn-pixel` (bisel 3D) no "Continuar".
- **Vaga-lumes** (`.firefly`, posições fixas) e vinheta no `WorldBackground` (também aparece na criação de personagem).
- Tela de missão, login e ranking **não mudaram** — próximos candidatos para o mesmo estilo.

### Sessão 10 — Forja II: "O Fole das Regiões" (2026-10-09)
Pedido do usuário: criar uma fase nova por dia, seguindo a campanha. Lembrete diário às 19h (Brasília) via rotinas na
nuvem (claude.ai/code/routines) que só preparam um briefing — a fase é criada junto, nesta máquina.
- `mission-13` **O Fole das Regiões** (Pandas, 3/5) — filtro + `groupby` + `sum` + `sort_values` + `.items()`.
  O ferreiro anão só acende o fole sabendo quanto ouro cada região já **pagou** (pendentes não contam).
- Dados novos em `data/forja.ts` (`ENCOMENDAS`, 12 linhas: id, peca, regiao, ouro, status 'paga'/'pendente');
  `csvTable` agora é exportado de `data/catacumbas.ts`; `csvFile` remove o `table` para a aba Dados mostrar o arquivo.
- Testado com pandas 2.3: a solução passa; sem o filtro (Norte 330…), ordem crescente e sem ordenar reprovam.
  `tsc` e `build` ok. **Não testado no navegador (Pyodide)**.
- **História reescrita (todas as 14 fases)** para quem nunca jogou RPG nem programou. Decisões do usuário: tom
  **bem-humorado e meta** (o Grimório é o narrador e fala com o jogador "do outro lado da tela") + caixa
  **🌍 No mundo real** em cada fase. Só `narrative`/`realWorld` (e o `theory` do Prólogo) mudaram — QUEST,
  `expectedOutput` e validação ficaram iguais.
  - Novo campo `Mission.realWorld` (2–3 frases: o que o conceito é + analogia do dia a dia), renderizado no fim da
    aba Lore (`MissionPanel`), com borda na cor da trilha.
  - Termos de RPG são explicados na própria fala na 1ª vez (nível na M6, masmorra e XP na M2, chefe na M8, cripta
    na M11, forja e fole na M4/M13); o Estudo do Prólogo tem um mini glossário (XP, moedas, chefe, raça/guilda).
  - Elenco: Grimório (narrador), Seu Bartolo (mercador, M5), Guardião de pedra (M6), Guardião dos Ossos (M9–11,
    esqueleto de óculos), Rei Esquecido (M12), Brokk (ferreiro anão, M4/M13). "Grande Corrupção" → **Grande Bagunça**
    (alguém derrubou café no Grande Arquivo).

### Sessão 11 — O Grimório traduz os erros (2026-10-24)
Pedido do usuário: melhorar a experiência para **quem não sabe programar nem jogar RPG** (e quem já sabe), mantendo as
missões no padrão atual e o visual cada vez mais RPG. Roteiro combinado (nesta ordem):
**(1) erros traduzidos ✅ → (2) tela da missão no estilo RPG + tutorial guiado na 1ª fase de código → (3) glossário fixo
("Bestiário de Palavras") → (4) Loja do Mercador e fases novas.**
- `lib/friendlyErrors.ts`: `explainError(stderr, errorContext(mission, code))` → `{ kind, title, explain, fix, line,
  lineText, raw }`. Regras para ~40 erros comuns de Python (aspas, parênteses, `:`, recuo, `=` × `==`, aspas curvas,
  NameError com "você quis dizer…?", concatenação texto+número, KeyError de coluna do Pandas, import…) e de SQL/DuckDB
  (tabela/coluna inexistente com sugestão, `"texto"` em vez de `'texto'`, GROUP BY, agregação no WHERE → HAVING, coluna
  ambígua no JOIN, palavra-chave com letra trocada `FORM`→`FROM`, vírgula antes do FROM…). Trechos entre crases viram código.
  Sugestões: distância de edição até 2; nomes com < 3 letras não recebem sugestão; a dica `None` do Python é ignorada
  (`nome` → "Did you mean: 'None'?" só confundia).
- `GrimoireError.tsx` no painel Saída: título, "Linha N" + texto da linha, explicação, **Como consertar** e, recolhida,
  a **mensagem original** (para quem já programa — e para aprender a ler). A saída cresce para 340px num erro.
  A linha com erro fica destacada no editor (`.cm-error-line`, some ao editar). O dialog "Ainda não…" usa o mesmo texto.
- **Motor Python** (`pyodide-worker.js`): o código do aluno roda **sem embrulho** (`runPythonAsync(code, { globals })`)
  — os números de linha batem com o editor e textos de três aspas não são mais alterados; **namespace novo a cada
  execução** (antes, uma variável de uma execução antiga "salvava" a seguinte); o que foi impresso antes do erro também
  aparece. `plt`/`pd` não vêm mais prontos — as missões já importam.
- Testado: 38 casos do tradutor em Node (erros reais do CPython e do DuckDB-Wasm); no navegador (build sem Supabase,
  CDP, 1366×768) 13 cenários — erros de Python, Pandas e SQL com linha e destaque certos, envio errado mostra a
  tradução no dialog, soluções da M1 e M4 passam pela tela.

### Sessão 12 — Tela da missão no estilo RPG + tutorial guiado (2026-10-24)
Item (2) do roteiro da Sessão 11. Mesmo vocabulário visual do mapa (Sessão 9); CSS no bloco "RPG imersivo (tela da
missão)" no fim de `globals.css`.
- **Topo** `.wood-bar` (logo `.gate-logo`), progresso da trilha em **gemas** (`.quest-gem` + `--gem`), botão **❔ Como
  jogar** (só em fases com código). **Rodapé** `.wood-bar.is-bottom`. Botões com `.btn-pixel .is-compact` (brilho por
  `--glow`: verde no Executar, azul no Enviar).
- **Esquerda** `.mission-stage` (pedra tingida com `--track-rgb`); **QUEST em pergaminho** `.quest-scroll` com bastões de
  madeira (texto em `track.ink`; RichText aceita `--rt-text`/`--rt-on-accent`); abas num `.mission-book.rpg-frame`
  (sem `overflow: hidden`, senão corta os rebites).
- **Direita** `.mission-tome`: barras `.tome-bar` de madeira, arquivo em `.file-tag`, "✍️ Escreva seu código aqui",
  "🔮 Saída — o que o código mostra". Prólogo: bloco da direita em `.rpg-frame` avisando que o tutorial vem na próxima.
- **Tutorial** `components/mission/GuidedTour.tsx`: holofote (`.tour-spot`, sombra de 9999px) + balão do Grimório
  (`.tour-card.rpg-frame`) posicionado abaixo/acima/ao lado do alvo. Alvos = atributos `data-tour` (quest, tab-estudo,
  tab-dados, editor, run, output, submit, tab-grimorio, player). `missionTourSteps()` pula o que a fase não tem e fala das
  lacunas `___` se o template tiver. Abre sozinho **só na 1ª fase com código** (`FIRST_CODE_MISSION_ID`), não concluída,
  uma vez por navegador (`localStorage["dataquest-tour-seen"]`, marcado ao Pular ou concluir). Teclas: → / Enter / ← / Esc.
- Testado (build sem Supabase + CDP, 1366×768): jogador novo na M1 → tutorial abre, 8 passos com alvo e balão dentro da
  tela, fecha e grava; reload não reabre; "Como jogar" reabre; M9 não abre sozinho. Os 13 cenários da Sessão 11 passam.

### Sessão 13 — Bestiário, Loja do Mercador, fases novas e login/ranking RPG (2026-10-24)
Pedido do usuário: "pode fazer todas as etapas e a gente verifica tudo depois". Um commit por etapa.
- **Bestiário de Palavras** (`lib/glossary.ts`, `components/glossary/Bestiary.tsx`, `store/glossaryStore.ts`): 70 termos
  (`kind` "jogo" ou "codigo", `missionId` = fase onde aparece). Descoberto = a missão já está disponível (derivado, nada
  salvo). Diálogo montado no `layout.tsx`, aberto por `useGlossary().show(id?)`; abas Todas/Jogo/Programação, busca (só
  entre as descobertas), destaque da palavra pedida. `BestiaryButton` no mapa, na loja e na missão (`compact` = só ícone
  abaixo de 1536px). `MissionWords` = "Palavras novas nesta fase" na tela da missão. Passo "bestiary" no tutorial.
  **Fase nova → acrescentar as palavras dela no glossário.**
- **Loja do Mercador** (`/loja`, `components/shop/MerchantShop.tsx`, catálogo em `lib/shop.ts`): títulos, molduras e
  mascotes, só visuais. Abre após a M5 (`SHOP_UNLOCK_MISSION_ID`); alguns itens exigem um chefe (`requiresMissionId`).
  Store: `ownedItems` + `equipped` (por espaço) + `buyItem` (comprar já equipa) / `equipItem(slot, id|null)` — campos novos
  com padrão, **sem subir `PROGRESS_VERSION`**. `HeroPortrait` (retrato + moldura + mascote) no chip, na ficha e na loja;
  mascote ao lado do herói no mapa (`.map-pet`). Mascotes em pixel art próprio: `scripts/gerar_mascotes.py` →
  `public/assets/pets/*.png`. Ids de item são estáveis (ficam no save).
  **Ranking com título:** o usuário precisa rodar `supabase/2026-10-titulo-no-ranking.sql` no SQL Editor (a função passa a
  devolver `title_id`); sem isso o ranking funciona, só sem título. `schema.sql` já está atualizado.
- **Fases novas** M14 (chefe Pandas), M15 e M16 (Data Viz, região aberta). **Validação de gráfico real:** o worker devolve
  `chartMeta` (alturas das barras, valores das linhas, título, eixos) e `validateChart` compara com o `expectedOutput`
  JSON `{ kind, count, values, title, xlabel, ylabel }` (texto exato ou `true` = só precisa existir), recusando também
  tipo misturado (barra + linha). A Saída mostra "✓ Gráfico desenhado logo abaixo." e cresce como no erro.
- **Login, criação de personagem, nova senha e ranking** com `.rpg-frame`; ranking com `.wood-bar` ("Salão da Fama") e
  linhas `.rank-row` (pódio em pergaminho, "você" com aro dourado).
- Testado (build sem Supabase + CDP, 1366×768): Bestiário (20/60 para novato → 60/60, foco, busca não revela bloqueadas);
  loja (fechada para novato, compra desconta, sem saldo não compra, equipado aparece no chip/ficha/mapa); M14–M16 com
  variações erradas recusadas (sem filtro, sem coluna, linha em vez de barra, sem barras, título errado, valores fora de
  ordem, sem ylabel, barra + linha) e soluções aceitas. Login e ranking vistos com `next dev` + `.env.local` (sem entrar).
- ⚠ Neste Windows, `\n` dentro de heredoc no Bash às vezes vira quebra de linha real — para editar strings com `\n`
  em .ts, use o Edit (ou um script Python salvo em arquivo).

### Sessão 14 — Revisão das 17 fases com o checklist de acessibilidade (2026-10-24)
- **Textos:** M3 explica tabela/linha/coluna e o `;`, e a QUEST diz "Devem sobrar 3 produtos"; M4 (1ª de Pandas) ganhou
  lacunas `___` (padrão da 1ª fase de cada trilha) e explica biblioteca/`import … as pd`; M6 explica True/False; M7 mostra
  `len()` no print/f-string (era usado sem ter sido ensinado); M11 e M12 dizem quantas linhas devem sair.
- **Feedback:** `describeDiff()` em `lib/validation.ts` aponta a 1ª linha diferente e o motivo (acento, maiúscula, espaço,
  linha faltando/sobrando, "None" = função sem return). Tabela: diz qual coluna faltou e lembra do AS; linhas a mais/a
  menos com dicas (> × >=, parênteses com AND/OR, LEFT JOIN). Grimório: `=` dentro de if/elif → "use ==" mesmo quando o
  Python só diz "invalid syntax"; KeyError do Pandas sem o prefixo "Column not found:".
- **Teste no navegador** (`review.mjs` no scratchpad: jogador novo, 17 fases em ordem, 23 erros típicos de iniciante):
  as 16 soluções passam e nenhum erro passa por engano.
- **2ª rodada no navegador (2026-10-26, `scripts/revisar_fases.mjs`):** de novo as 16 soluções passam e os 23 erros são
  recusados. As 3 últimas correções também foram confirmadas no navegador: `=` no elif vira "use ==", "None" aponta
  falta de return e a coluna errada do Pandas aparece sem o prefixo.
  Melhoria possível: na M14, a lista "colunas disponíveis" mostra só as do CSV, sem a coluna `total` que o aluno cria.

### Sessão 15 — Mapa corrigido e mais fases de SQL e Pandas (2026-10-26)
Pedido do usuário: os estandartes ficavam por cima das fases e os cartões estavam desalinhados. Também pediu mais fases
de SQL e, principalmente, de Pandas antes do Data Viz.
- **Mapa:**
  - **Causa da sobreposição:** o `.rpg-frame` (CSS sem layer) tem `position: relative`, que vencia a classe `absolute`
    do Tailwind (que fica numa layer). Cada estandarte descia a altura dos anteriores, e o de Data Viz cobria a
    2ª fase. Agora o estandarte usa `position: "absolute"` inline (`WorldMap.tsx`).
    **Regra:** elemento com `.rpg-frame` que precisa de absolute/fixed deve receber o `position` no `style`.
  - Os cartões das fases têm largura fixa (236px), então ficam todos alinhados.
  - **Neblina:** agora começa depois da última fase NÃO bloqueada, e não mais depois da "próxima". Assim, quem já
    tinha avançado e ganhou fases novas lá atrás continua vendo as que concluiu. Conferido no build de produção com
    um jogador antigo (17 fases concluídas): sem neblina, com as fases novas "Disponível".
- **5 fases novas** (ids 17–21), uma ideia nova em cada, todas fáceis (dificuldade 1 a 3 de 5):
  - SQL: 17 LIMIT e 18 LIKE com `%`.
  - Pandas: 19 `sort_values` + `head`, 20 `sum`/`mean`/`max` e 21 `value_counts`.
  - Com elas, o `groupby` da fase 13 vira quase só revisão. As fases 19 e 21 trazem o `for` final pronto.
  - Os capítulos das fases seguintes foram renumerados.
  - Palavras novas no Bestiário: `limit`, `like`, `head`, `pdcontas`, `valuecounts`; `sortvalues` passou para a fase 19.
- **Feedback:**
  - Tabela: o JSON aceita `tooMany`/`tooFew` (dica da fase para linhas a mais ou a menos).
  - Grimório:
    - lacuna `___` não preenchida → "Ainda tem lacuna para preencher";
    - método em português (`.media`, `.soma`…) → o nome em inglês. Antes, `.media` sugeria `.median`, que é outra conta;
    - `.items()` num número (ex.: `.count()` no lugar de `.value_counts()`) → "Isso virou um número só".
- **Revisão no navegador** (`scripts/revisar_fases.mjs`, que agora roda no Modo Teste e aceita uma lista de ids): as 21
  soluções passam e os 33 erros de iniciante são recusados com mensagem clara.

### Sessão 16 — Mapa-Múndi, uma tela por região e chefe em toda região (2026-10-26)
Pedido do usuário: o mapa não deve virar uma rolagem infinita. Ele quer algo como o Codédex, sem perder a essência
do DataQuest: cada tema numa região, e toda região terminando num chefe ("transformar cada vez mais em RPG").
- `/map` virou o **Mapa-Múndi**, e cada região tem sua tela em `/regiao/[track]` (detalhes em "Mapa" mais abaixo).
- Chefe marcado no mapa e no Mapa-Múndi. **Fase 22 "O Conselho dos Portos"**: novo chefe do Farol (groupby + barras).
  O título "Guardião do Farol" da loja agora exige a fase 22.
- **Próxima região: Data Science** ("O Observatório dos Oráculos"), com o scikit-learn do Pyodide. Fases sugeridas:
  - espalhamento (desvio);
  - correlação;
  - 1ª previsão com uma reta (regressão linear);
  - treino × teste;
  - árvore de decisão;
  - chefe: acurácia.
  Ao adicionar, esticar a tabela de níveis (o XP total passa de 660).

### Sessão 17 — Redesign profissional de todas as telas (2026-10-25)
Pedido do usuário: "deixar tudo mais profissional em relação ao design… acho que tá bem iniciante".
- Novo sistema visual (ver "## Design"): Nunito no texto, mono só no código, pixel só no logo e celebrações;
  ícones SVG (`components/ui/Icon.tsx`) no lugar dos emojis da interface; cartões escuros com borda fina no lugar de
  molduras com rebites, madeira e pergaminho; botões sólidos com degrau.
- `components/ui/TopBar.tsx`: a mesma barra (logo + Mapa · Bestiário · Loja · Ranking) em mapa, região, loja e ranking.
- Mapa-Múndi: painel da jornada numa linha (nível, XP, missões, Continuar). Região: estandarte com o chefe.
  Tela da missão: título maior, QUEST como cartão com a cor da trilha, abas com ícones, editor no mesmo tom escuro.
- Janelas (resultado, ficha, Bestiário, tutorial, confirmação do Grimório), loja, ranking, login e criação de
  personagem no mesmo padrão. Ranking: medalhas de ouro/prata/bronze desenhadas.
- `friendlyErrors.ts`: no SQL, `___` agora vira "Ainda tem lacuna para preencher" (antes: "Não existe a coluna ___").
- `scripts/revisar_fases.mjs` acha o botão de enviar por `data-tour="submit"` (o texto mudou) e espera até 120 s.

### Sessão 18 — Toda fase é uma batalha + Mapa-Múndi de jogo (2026-10-25)
Pedido do usuário: com as skills de gamedev, deixar o jogo "absurdo de RPG e programação": mais design, jogabilidade,
alinhamento e animação, Mapa-Múndi com mais cara de game e o fundo sem árvores cortadas.
- **Batalha** (`components/mission/right/BattleArena.tsx`, no lugar da barra do arquivo): cada fase tem um monstro
  (`lib/monsters.ts`: nome, sprite, fala de entrada, provocações, fala de derrota; sprites CC0 do DCSS em
  `public/assets/monsters/`). Só visual — a regra do jogo não mudou:
  - Executar sem erro = feitiço (−18 a 30% da vida, nunca abaixo de 15%: só o Enviar vence) e lembra de enviar;
  - erro = o monstro ri e se cura 10%;
  - Enviar errado = contra-ataque (tremor, flash vermelho) e quebra um **escudo** — os 3 escudos são os 3 erros
    que liberam a solução no Grimório (`SOLUTION_UNLOCK_FAILS`);
  - Enviar certo = golpe final: hit-stop (silhueta branca), tremor forte, flash, partículas, "GOLPE FINAL!" /
    "CHEFE DERROTADO!", o monstro cai e as moedas voam até o contador (`[data-coin-target]` no `PlayerChip`).
    A janela de resultado espera 1,7 s (erro: 0,65 s) para a cena aparecer.
  - Chefe: arena vermelha, vida maior (XP × 6; normais XP × 4) e coroa na cabeça (`Monster.head` = ponto medido no
    sprite 32×32; `null` = o sprite já tem coroa, como o Rei Esquecido). Use `<MonsterSprite monster size boss>`.
  - Fase já concluída: o monstro aparece caído, "Derrotado". Fase nova → criar o monstro dela em `MONSTERS[id]`.
- **Juice** (`lib/juice.ts`): `shake`, `burst`, `coinsFly`, `floatText`, `flash` em DOM solto (`.juice-layer`), sem
  bloquear cliques; respeitam `prefers-reduced-motion`. A raiz da tela da missão tem `data-shake-root`.
- **Sons** (`lib/sfx.ts`): chiptune sintetizado com Web Audio (sem arquivos): cast, fizzle, hit, hurt, victory, coin,
  levelup… `SoundToggle` (ícone de volume) na `TopBar` e na tela da missão; mudo em `localStorage["dataquest-som"]`.
  Level up no diálogo de vitória toca fanfarra + chuva de faíscas.
- **Mapa-Múndi** (`components/map/WorldHub.tsx`, saiu do `WorldMap.tsx`, que importa `WorldHub` e `usePinState`):
  - HUD no topo: ficha do herói (retrato, guilda, XP, moedas, fases e chefes) + cartão **Próxima batalha** com o
    monstro da próxima fase e o botão Batalhar (vermelho quando é chefe);
  - cada região: brilho na cor da trilha, chefe de guarda ao lado (cai quando derrotado), uma estrela por fase
    (losango vermelho = chefe), cartões de altura fixa; estrada com tracejado andando; nuvens passando;
  - pontas em 13% / 87% para o herói da 1ª região não sair do quadro. Cabe em 1366×768.
- **Fundo novo** (`public/assets/bg/mapa-mundo.png`, gerado por `scripts/gerar_mundo_biomas.py` com Kenney Tiny Town +
  Tiny Dungeon, CC0): 4 biomas na ordem das regiões — floresta, cemitério com a entrada da cripta, forja com casas e
  bigornas, praia com píer, mar e farol (pixel art própria). Só árvores inteiras, uma por tile, com a copa um pouco mais
  escura que a grama (sobrepostas demais, só sobrava o contorno). Ver CREDITS.md para gerar de novo.
- Botão Executar mostra o atalho `Ctrl+Enter`.
- Testado: batalha na M3 via CDP (run ok 100→78, erro cura até 88, envio errado quebra 1 escudo, envio certo → 0 HP e
  "Missão Concluída!", console sem erros); mapa e chefes em 1366×768; bloqueio de fase no build de produção sem
  Supabase (fase 12 para quem só fez a 1 → "Missão Bloqueada"). O acesso livre a todas as fases é só o Modo Teste.
- ⚠ O dev server do Modo Teste (3001) pode parar de recompilar o `globals.css` (estilos novos não aparecem num
  carregamento novo da página): reiniciar o `npm run teste`.

### Próximos passos sugeridos
1. **Rodar `supabase/2026-10-titulo-no-ranking.sql`** (tarefa do usuário) para o título aparecer no ranking.
2. Mais fases: Pandas `merge`/`pivot_table` (o worker só injeta UM CSV — para merge, aceitar vários arquivos em
   `/data/`); Data Viz III (chefe: gráfico a partir de groupby, cores/legenda).
3. Python extra (opcional): `while` e dicionários (fichas de personagem) como missões bônus.
4. Talvez: dar efeito real às raças (hoje só visuais) — ex.: desconto em dicas de uma trilha.
5. Responsividade mobile (hoje o layout é pensado para desktop ≥ 1280px).
6. Contas: validar XP no servidor (ex.: função no banco que recalcula a partir das missões) se o ranking virar
   competição; tela de perfil; talvez ranking por guilda/raça.
7. Limpeza: apagar as contas de teste `dataquest.teste.*@example.com` no Supabase (tarefa do usuário).

### Como testar rapidamente
- **Modo Teste: `npm run teste` → http://localhost:3001.** É o jeito de analisar as fases sem jogar tudo de novo.
  - Todas as fases ficam abertas.
  - Não tem login, e nada vai para a nuvem nem para o ranking (o `supabase` fica `null`).
  - O botão 🧪 (canto de baixo à direita) abre o painel, que permite:
    - ir para qualquer fase;
    - ver a solução da fase aberta;
    - ganhar +100 moedas (para testar a loja);
    - concluir todas;
    - zerar o progresso (mantém o personagem e mostra o tutorial de novo).
  - Como usa outra porta, o progresso não se mistura com o do `npm run dev` (3000).
  - Arquivos: `lib/testMode.ts` (`TEST_MODE`), `components/dev/TestPanel.tsx`, `scripts/modo-teste.mjs` e o
    `computeUnlockedMissions`/`missingRequirements` em `lib/xp.ts`.
  - Ele só liga com `next dev` + `NEXT_PUBLIC_MODO_TESTE=1`. No build de produção, `TEST_MODE` vira `false`
    (conferido no bundle), então o site público nunca mostra nada disso.
- `npm run dev` → http://localhost:3000 (com `.env.local`, abre a tela de login). Produção:
  https://the-legend-of-data.vercel.app — status do deploy aparece no commit do GitHub (API `commits/<sha>/statuses`).
- Contas de teste: criar com e-mail `dataquest.teste.<algo>@example.com` (a confirmação está desligada, então
  nenhum e-mail é enviado). Não use e-mails inexistentes se a confirmação for religada.
- Estados de teste: criar temporariamente `public/__seed.html` que grava um JSON em
  `localStorage["dataquest-progress"]` (formato `{ state: {...}, version: 1 }`; use `version: 0` para testar a
  migração) e redireciona — **apagar depois**.
- Teste de todas as soluções: extrair `solution` de `data/missions/*.ts` e enviá-las pela tela da missão via CDP
  (foi assim que as 8 soluções foram validadas na Sessão 4).
- **Revisão completa (`scripts/revisar_fases.mjs`):** com o Modo Teste aberto (`npm run teste`), rode
  `node scripts/revisar_fases.mjs <pasta temporária> http://localhost:3001 [ids,separados,por,vírgula]`.
  - O script cria sozinho um jogador novo.
  - Para cada fase, ele envia os erros típicos de iniciante e depois a solução.
  - Leva ~15 min para as 22 fases e precisa de ~1,5 GB de RAM livre.
  - Ao criar uma fase nova, acrescente-a ao `ORDER` e ao `MISTAKES` do script.
  - Se a porta 9333 ficar ocupada, mate o processo pelo PID (`netstat -ano` e `taskkill`).
- **Comportamento do jogo de verdade** (bloqueios e neblina; o Modo Teste abre tudo): faça um build sem Supabase.
  1. Crie `.env.production.local` com as variáveis `NEXT_PUBLIC_SUPABASE_*` vazias.
  2. Rode `npx next build` e depois `npx next start -p 3100`.
  3. Grave o progresso desejado em `localStorage["dataquest-progress"]`.
  4. **Apague o `.env.production.local` no fim.**
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
| Fontes | Nunito (interface) + JetBrains Mono (código) + Press Start 2P (logo e celebrações) via `next/font/google` |
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
│   ├── map/page.tsx             # Tela do Mapa do Mundo (login → personagem → mapa)
│   ├── mission/[id]/page.tsx   # Tela de Missão (await params)
│   ├── ranking/page.tsx         # Ranking (Leaderboard)
│   └── conta/nova-senha/page.tsx # Destino do link "Esqueci minha senha"
├── components/
│   ├── player/
│   │   ├── CharacterCreation.tsx # Criação/edição de personagem (nome + raça) — aparece no 1º acesso ao /map
│   │   ├── PlayerChip.tsx       # Avatar + nome + nível/XP nas top bars — clique abre a ficha
│   │   └── ProfileDialog.tsx    # Ficha do personagem (só leitura) + conta (e-mail, nuvem, Sair)
│   ├── account/
│   │   ├── LoginScreen.tsx      # Tela de login do 1º acesso (etapa 1)
│   │   ├── AuthDialog.tsx       # AuthForm (Entrar/Criar conta/Esqueci) + janela usada no /ranking
│   │   ├── AccountButton.tsx    # ☁️ status do save + menu Sair (topo do mapa/ranking)
│   │   ├── CloudSync.tsx        # Sessão + sincronização do save com o Supabase (no layout)
│   │   ├── Leaderboard.tsx      # Página de ranking
│   │   └── NewPasswordForm.tsx  # Criar nova senha
│   ├── map/
│   │   ├── WorldMap.tsx         # Painel do jogador + trilha em zigue-zague (SVG) com banners de região
│   │   ├── MissionPin.tsx       # Nó circular + rótulo — locked/available/completed
│   │   └── MapFog.tsx           # Neblina sobre as terras inexploradas + useFogReveal (recuo animado)
│   ├── mission/
│   │   ├── MissionScreen.tsx    # Guard de bloqueio + top bar + 55/45 colunas + dialog de resultado
│   │   ├── GuidedTour.tsx       # Tutorial guiado (holofote + balão do Grimório) — data-tour nos alvos
│   │   ├── left/
│   │   │   ├── MissionPanel.tsx # QUEST no topo + abas Lore/Estudo/Grimório/Dados + rodapé
│   │   │   ├── HintShop.tsx     # Grimório: dicas compradas com moedas + solução (3 erros, −50% XP)
│   │   │   └── DataFilePreview.tsx # Preview do CSV da missão
│   │   └── right/
│   │       ├── EditorPanel.tsx  # Editor (altura total) + Run/Submit + splitter + painel Saída
│   │       ├── CodeEditor.tsx   # Wrapper CodeMirror (Ctrl/Cmd+Enter executa)
│   │       ├── TerminalOutput.tsx # stdout ou, no erro, o GrimoireError
│   │       ├── GrimoireError.tsx  # Erro traduzido: título, linha, explicação, como consertar, original
│   │       ├── TablePreview.tsx # Resultado SQL como tabela HTML
│   │       └── GraphPanel.tsx   # Gráfico matplotlib base64
│   └── ui/
│       ├── TypewriterText.tsx   # Efeito typewriter: digita char a char com pausa em pontuação
│       ├── Sprite.tsx           # <img> pixelated para sprites 32×32 (usar 32/64/96 px)
│       ├── WorldBackground.tsx  # Fundo do mapa pixel art + véu escuro (mapa e criação de personagem)
│       ├── GateShell.tsx        # Moldura das telas de entrada (logo + etapas + animação) + delay(ms)
│       ├── RichText.tsx         # Renderiza theory/instructions (código, passos, parágrafos)
│       ├── XPBar.tsx            # Barra de nível (animável a partir de fromXP)
│       └── MissionResultDialog.tsx # Modal sucesso (contador XP, level up) / erro (feedback)
├── lib/
│   ├── missions.ts              # Array MISSIONS[] + getMission(id)
│   ├── races.ts                 # RACES (Elfo, Anão, Orc, Goblin): guilda, lema, sprite, cor
│   ├── tracks.ts                # TRACKS (nome, cor, rgb, ícone) + TRACK_ORDER — fonte única
│   ├── xp.ts                    # computeLevel(), levelProgress(), isMissionUnlocked(), missingRequirements()
│   ├── validation.ts            # validateOutput() — exact/table/chart/contains/narrative
│   ├── friendlyErrors.ts        # explainError(): traduz erros de Python/SQL para iniciantes (Grimório)
│   ├── friendlyErrors.ts        # explainError(): traduz erros de Python/SQL para iniciantes (Grimório)
│   ├── supabase.ts              # Cliente Supabase (null sem as variáveis de ambiente)
│   └── engines/
│       ├── pyodide-engine.ts    # Singleton Worker: initPyodideWorker(), runPython(), subscribePyodideStatus()
│       └── duckdb-engine.ts     # Singleton DuckDB: runQuery()
├── hooks/
│   ├── usePyodide.ts            # Hook React para Pyodide (subscriber pattern)
│   ├── useDuckDB.ts             # Hook React para DuckDB (lazy init)
│   ├── useHydrated.ts           # true após mount — evita mismatch com progresso do localStorage
│   └── useGate.ts               # Etapa de entrada: loading / login / cloud-error / character / play
├── store/
│   ├── gameStore.ts             # Zustand: progresso (persist) + loadProgress/resetProgress/progressSnapshot
│   └── accountStore.ts          # Conta Supabase: ready, email, sync (não persistido)
├── data/
│   ├── missions/
│   │   ├── mission-0.ts … mission-16.ts  # ordem de jogo definida em lib/missions.ts
│   ├── catacumbas.ts            # Tabelas SQL das missões 9–12 (reliquias, herois, expedicoes) + csvTable
│   ├── forja.ts                 # CSVs da trilha Pandas (encomendas — missão 13)
│   └── csv/vendas.csv
├── scripts/
│   ├── gerar_fundo_mapa.py      # Gera public/assets/bg/mapa-mundo.png com tiles CC0 Kenney Tiny Town
│   ├── gerar_cursor.py          # Gera public/assets/cursors/luva*.png (manopla dourada, arte própria)
│   └── gerar_nuvens.py          # Gera public/assets/fog/nuvem-*.png (nuvens da neblina, arte própria)
├── supabase/
│   └── schema.sql               # Tabela saves + RLS + get_leaderboard (rodar no SQL Editor)
├── types/index.ts               # Mission, RunResult, ValidationResult, EngineStatus…
└── public/
    ├── pyodide-worker.js        # Web Worker Pyodide (deve ficar em /public/)
    └── assets/
        ├── CREDITS.md           # Origem e licença de cada asset
        ├── bg/mapa-mundo.png    # Fundo do mapa (CC0 — gerado por scripts/gerar_fundo_mapa.py)
        ├── cursors/             # luva.png / luva-hover.png (cursor, gerado por scripts/gerar_cursor.py)
        └── sprites/             # Sprites 32×32 CC0 (Dungeon Crawl Stone Soup): raca-*, trilha-*, missao-*, grimorio
```

---

## As 23 Missões (na ordem de jogo)

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
| 9     | 17 | sql    | A Sala dos Baús          | SQL: LIMIT (só as primeiras linhas)| 1/5   | +25 | +20    | 3           | `ORDER BY`, `LIMIT 3` |
| 10    | 9  | sql    | O Salão dos Ossos        | SQL: WHERE com AND, OR e IN       | 2/5    | +25 | +20    | 17          | colunas `tipo`, `sala`, `amaldicoada` |
| 11    | 18 | sql    | A Memória do Guardião    | SQL: LIKE (buscar por um pedaço)  | 2/5    | +25 | +20    | 9           | `LIKE`, `ORDER BY` |
| 12    | 10 | sql    | O Inventário do Guardião | SQL: COUNT, SUM, AVG, MAX e AS    | 3/5    | +30 | +20    | 18          | `COUNT(`, `SUM(`, `AVG(`, `MAX(` |
| 13    | 11 | sql    | As Criptas por Tipo      | SQL: GROUP BY e HAVING            | 4/5    | +30 | +25    | 10          | `GROUP BY`, `HAVING` |
| 14    | 12 | sql    | O Rei Esquecido          | SQL: JOIN entre tabelas (chefe)   | 5/5    | +40 | +30    | 11          | `JOIN`, `ON … heroi_id`, `GROUP BY` |
| 15    | 4  | pandas | A Forja Desperta         | Pandas: ler CSV e filtrar linhas  | 2/5    | +30 | +25    | 12          | `read_csv(`, filtro `["valor"] >`, `len(` |
| 16    | 19 | pandas | A Vitrine de Brokk       | Pandas: ordenar e pegar as primeiras| 2/5  | +30 | +20    | 4           | `read_csv(`, `.sort_values(`, `.head(` |
| 17    | 20 | pandas | O Carvão da Semana       | Pandas: somar, média e maior      | 2/5    | +30 | +20    | 19          | `read_csv(`, `.sum(`, `.mean(`, `.max(` |
| 18    | 21 | pandas | O Livro de Visitas       | Pandas: contar valores (value_counts)| 3/5 | +30 | +25    | 20          | `read_csv(`, `.value_counts(` |
| 19    | 13 | pandas | O Fole das Regiões       | Pandas: groupby, sum e sort_values| 3/5    | +35 | +25    | 21          | `read_csv(`, `["status"]`, `.groupby(`, `.sum(`, `.sort_values(` |
| 20    | 14 | pandas | A Têmpera do Rei         | Pandas: colunas com contas (chefe)| 5/5    | +40 | +30    | 13          | `read_csv(`, `df["x"] = … * …`, `["quantidade"] >=`, `.groupby(`, `.sort_values(` |
| 21    | 15 | dataviz| O Farol se Acende        | Gráfico de barras com matplotlib  | 1/5    | +30 | +25    | 14          | `plt.bar(`, `plt.title(` (validação `chart`) |
| 22    | 16 | dataviz| A Rota das Tempestades   | Gráfico de linha, título e eixos  | 2/5    | +35 | +25    | 15          | `read_csv(`, `plt.plot(` (validação `chart`) |
| 23    | 22 | dataviz| O Conselho dos Portos    | Gráfico a partir de groupby (chefe)| 4/5   | +45 | +35    | 16          | `.groupby(`, `.sort_values(`, `plt.bar(`, `read_csv(` (validação `chart`) |

Tabelas SQL das missões 9–12 em `data/catacumbas.ts`: `reliquias` (12 linhas: id, nome, tipo, sala, valor,
amaldicoada 'sim'/'nao'), `herois` (5) e `expedicoes` (9: id, heroi_id, destino, ouro).
CSV da missão 13 em `data/forja.ts`: `encomendas` (12 linhas: id, peca, regiao, ouro, status 'paga'/'pendente').
CSV da missão 14 em `data/forja.ts`: `pedidos` (10 linhas: id, peca, regiao, quantidade, preco).
CSV da missão 16 em `data/farol.ts`: `tempestades` (6 linhas: mes, tempestades). A M15 usa listas no próprio código.
Tabela da missão 17 em `data/catacumbas.ts`: `baus` (8 linhas: id, nome, ouro). A M18 usa `reliquias`.
CSVs das missões 19–21 em `data/forja.ts`: `estoque` (8: id, peca, preco), `carvao` (6: dia, sacos) e `visitas`
(11: id, visitante, raca — contagens sem empate).
Nas fases de tabela, o JSON do `expectedOutput` pode ter `tooMany`/`tooFew`: uma dica própria da fase para quando
vêm linhas a mais ou a menos (ex.: esqueceu o LIMIT, esqueceu o % do LIKE). Ela substitui a dica geral.

Cada missão tem 2 dicas (`hints`) e uma `solution`. A missão 0 não tem Grimório.

**Outputs esperados:**
- M1: `"Arquivista\nNivel: 1"`
- M5: `"Gasto: 45\nMoedas restantes: 55"` (100 moedas, 3 poções × 15)
- M6: `"Pode passar, Arquivista"` (nivel = 7, tem_chave = True)
- M2: `"1\n2\n3\nArquivista Desbloqueado"`
- M7: `"tocha\ncorda\npocao\nmapa antigo\nItens: 4"`
- M8: `"Runa 3: fraca\nRuna 8: média\nRuna 12: forte"`
- M3: tabela `["produto","valor"]` com 3 linhas, 1ª = `Espada de Dados, 300` (valor > 150, ORDER BY valor DESC)
- M9: tabela `["nome","valor"]`, 3 linhas, 1ª = `Lança do Vigia, 170`
- M10: tabela `["total","soma","media","maior"]`, 1 linha = `8, 1030, 128.75, 260` (só não amaldiçoadas)
- M11: tabela `["tipo","quantidade","total"]`, 3 linhas, 1ª = `arma, 4, 570` (HAVING SUM(valor) > 300)
- M12: tabela `["nome","viagens","ouro_total"]`, 4 linhas, 1ª = `Brenna, 3, 350`
- M4: `"3"` (len do DataFrame filtrado)
- M13: `"Norte: 270
Oeste: 220
Leste: 150
Sul: 100"` (só `paga`, groupby regiao, sum ouro, desc)
- M14: `"Norte: 220\nLeste: 210\nOeste: 200\nSul: 190"` (total = quantidade × preco, só quantidade ≥ 2; sem o filtro a ordem muda)
- M15 (chart): `{ kind: "bar", count: 4, values: [12, 7, 9, 4], title: "Navios por região" }`
- M16 (chart): `{ kind: "line", count: 6, values: [3, 5, 8, 6, 2, 1], title: true, xlabel: true, ylabel: true }`
- M17: tabela `["nome","ouro"]`, 3 linhas, 1ª = `Baú Real, 340` (ORDER BY ouro DESC LIMIT 3)
- M18: tabela `["nome","sala"]`, 3 linhas, 1ª = `Adaga Silenciosa, Oeste` (nome LIKE 'A%' ORDER BY nome)
- M19: `"Cota de Malha\nMartelo de Guerra\nMachado Duplo"` (sort_values preco desc + head(3))
- M20: `"Total: 57\nPor dia: 9.5\nRecorde: 15"` (sum, mean, max da coluna sacos; rótulos sem acento de propósito)
- M21: `"anao: 5\nelfo: 3\norc: 2\ngoblin: 1"` (value_counts da coluna raca)
- M22 (chart, chefe do Farol): `{ kind: "bar", count: 4, values: [48, 35, 27, 14], title: true, xlabel: true, ylabel: true }`
  (CSV `cargas` em `data/farol.ts`; groupby porto, sum caixas, desc; a única novidade é `.index`/`.values`)

**Arco da história (Python):** Prólogo na Guilda (bolsa de ouro) → Cap. I o Grimório pede que você se apresente →
Cap. II Mercado da Vila → Cap. III Guardião do Portão → Cap. IV Corredor das Tochas → Cap. V Salão das Relíquias
(mochila) → Cap. VI Selo das Catacumbas (chefe) → **SQL:** "Com o Selo rompido…" desce às Catacumbas (Cap. I Primeira Escavação → II A Sala dos Baús, onde a
mochila só aguenta 3 baús → III Salão dos Ossos, onde o Guardião dos Ossos cataloga as relíquias → IV A Memória do
Guardião, que só lembra que o nome começava com A → V Inventário do Guardião → VI Criptas por Tipo → VII O Rei Esquecido,
o primeiro Arquivista-Rei, com o Livro das Expedições) → **Pandas:** "Atrás do trono do Rei Esquecido…" a Forja (Cap. I A Forja Desperta →
II A Vitrine de Brokk, as 3 peças mais caras → III O Carvão da Semana → IV O Livro de Visitas, qual raça mais visita →
V O Fole das Regiões, o ferreiro anão e as encomendas das quatro regiões → VI A Têmpera do Rei, chefe: carta do Rei pedindo o faturamento) →
**Data Viz:** Brokk forja a lente e você a leva ao Farol da Verdade, de Dona Íris, a faroleira (Cap. I O Farol se Acende:
navios por região em barras → II A Rota das Tempestades: tempestades por mês em linha → III O Conselho dos Portos, chefe:
quatro capitães discutem qual porto recebe mais caixas, e o gráfico encerra a briga).
O **Grimório** é, na lore, um livro vivo e ganancioso que vende dicas por ouro — e o **narrador** da campanha, que
quebra a quarta parede. Ao escrever fases novas: tom bem-humorado e meta, frases curtas, explicar todo termo de RPG
na 1ª vez e sempre preencher `realWorld`.

---

## Sistema de Gamificação

**Níveis (10, `LEVEL_THRESHOLDS` em `lib/xp.ts`):** Aprendiz (0) → Escriba (40) → Copista (90) → Cronista (150) →
Explorador de Criptas (200) → Arquivista (260) → Guardião do Saber (330) → Mestre da Forja (420) → Sábio dos Dados (530) →
Mestre dos Dados (660). Calibrados pela jornada: fim do Python ≈ 155 XP (Nv 4), fim do SQL ≈ 305 (Nv 6), Forja I 335 (Nv 7), Forja II 370,
chefe da Forja 410, Data Viz I 440 (Nv 8), Data Viz II 475; 9–10 esperam o conteúdo futuro — **ao adicionar missões, revisar a tabela**.
Moedas possíveis hoje: 355.

**Fluxo por missão:**
1. Aluno digita código no editor
2. `▶ Executar` (verde) ou `Ctrl+Enter` — executa e exibe resultado no painel Saída (sem validar)
3. `Enviar Resposta` (azul) — **reexecuta o código atual**, valida, dá XP se correto, mostra dialog
4. Botão `Próximo →` (dourado) — desbloqueia apenas após Submit correto
5. Missão 0 (narrative) — auto-valida no mount, sem necessidade de código

**Persistência:** `localStorage["dataquest-progress"]` via Zustand persist + tabela `saves` no Supabase (conta logada)

**Desbloqueio e nível são derivados, não lidos do store:** use `isMissionUnlocked(m, completedMissionIds, totalXP)`
e `computeLevel(totalXP)`. Os campos `unlockedMissionIds`/`level` persistidos podem ficar desatualizados
(ex.: missões novas adicionadas depois). Abrir `/mission/N` bloqueada mostra a tela "Missão Bloqueada" com os requisitos.

**Personagem:** `profile: { name, race }` no store — definido **uma única vez** (sem edição; o chip abre a ficha). `/map` segue `useGate()`: sem login → `LoginScreen`;
logado sem profile → `CharacterCreation`; `/mission/*` fora da etapa `play` redireciona para `/map`.
Não há botão de reiniciar para o jogador.

**Abas da missão:** `Lore` (história, typewriter) · `Estudo` (= `mission.theory`, livre) ·
`Grimório` (dicas + solução) · `Dados` (se houver `dataFile`).

**Moedas e Grimório:** `coins` no store; `completeMission(id, xp, coins)` credita `coinReward` na 1ª vitória.
`buyHint(id, custo)` desconta e incrementa `attempts[id].hintsBought` (dicas são lidas em ordem).
Solução: `revealSolution(id)` só é oferecido com `attempts[id].fails >= SOLUTION_UNLOCK_FAILS` (3);
com `solutionRevealed`, a vitória rende `solutionXP(reward)` = metade do XP. Tudo livre após concluir.
`attempts[id].fails` só conta `Enviar Resposta` errado (não `Executar`).
XP efetivo por missão fica em `xpByMission` (o mapa mostra `+10/20 XP` quando foi pela metade).
O store é persistido com `version: 1` — mudou o formato? incremente a versão e escreva o `migrate`.

**Hidratação:** telas que dependem do progresso (`WorldMap`, `MissionScreen`) só renderizam com `useGate() === "play"` (que já espera `useHydrated()` e a sessão/save da nuvem).

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
- Cada CSV da missão (`missionDataFiles`) vira uma view com o nome de `table` (padrão `vendas`) via `registerFileText()` + `read_csv_auto()`
- Resultado: ArrowTable → `TableData { headers, rows }`

---

## Design

Sistema visual da Sessão 17: fantasia sombria e limpa. Fundo azul-noite, cartões com borda fina e brilho dourado
no topo, ouro só para o que importa (próximo passo, XP, moedas) e as sprites pixel art como protagonistas.
Tudo fica em `app/globals.css`, com os nomes de classe antigos mantidos (`.rpg-frame`, `.wood-bar`, `.btn-pixel`…).

### Paleta (tokens em `:root`)
```
--color-bg / --color-bg-2      #0a0d14 / #0e121b   (fundo; barras do editor)
--color-surface / --color-panel #141925 / #1b2131  (cartões)
--line / --line-strong         branco 7% / 12%     (bordas finas — preferir a cores sólidas)
--editor-bg / --editor-bg-2    #0c1018 / #080b11   (editor, blocos de código, saída)
--color-text / -text-2 / -muted #edf0f6 / #b7bfce / #8b94a8
--color-accent  #f5c451  (ouro: Continuar, PRÓXIMA, XP, moedas)
--color-run #3ccf7e · --color-submit #4aa8ff · --color-error #ff6b6b · --color-boss #ef5350
--color-python #4fc3f7 · --color-sql #6bcb77 · --color-pandas #ffb74d · --color-dataviz #f48fb1
--radius-sm/md/lg/xl 8/12/16/20 · --shadow-sm/md/lg
```
`--ink`/`--ink-soft` (antigo texto sobre pergaminho) agora apontam para o texto claro. Não há mais pergaminho.

### Tipografia
- `var(--font-body)` = **Nunito** (400–900): todo o texto da interface, títulos e narrativa.
- `var(--font-mono)` = **JetBrains Mono**: só código — editor, `.code-block`, terminal, tabelas, nomes de arquivo.
- `var(--font-pixel)` = **Press Start 2P**: só o logo (`.gate-logo`), `.pixel-title` (Missão Concluída!, Ainda não…,
  Missão Bloqueada) e o número do nível (`.level-badge`). A fonte não tem maiúsculas acentuadas.
- `.pixel-label` / `.pixel-chapter` / `.section-label` viraram rótulos em Nunito caixa alta (o nome ficou por compatibilidade).
- Títulos: 900, `letter-spacing: -0.02em` (h1 da missão = `.mission-title`, 32px).

### Ícones (`components/ui/Icon.tsx`)
- `<Icon name="map" size={18} />`: SVG de traço 2px no estilo Lucide, cor = `currentColor`. **Na interface não se usa
  emoji** (cada sistema desenha diferente). Para um ícone novo, somar o `path` em `PATHS`.
- Ícones das abas: Lore `scroll`, Estudo `book`, Grimório `wand`, Dados `folder`. QUEST `target`. Chefe `crown`.
- Emoji só dentro de textos de conteúdo (falas, feedback da validação).

### Barra do topo (`components/ui/TopBar.tsx`)
- `<TopBar right={…} />` em mapa, região, loja e ranking: `Brand` (marca dourada + "DataQuest" em pixel, leva ao
  Mapa-Múndi) + `TopNav` (Mapa · Bestiário · Loja · Ranking, com o atual em `.icon-btn.is-active`).
- A tela de missão usa `Brand` + breadcrumb (`.region-chip` da trilha → título) + segmentos `.quest-gem`.

### Botões (classes CSS)
Botões "de jogo": cor sólida com degrau embaixo (`--edge`) que afunda ao clicar. Ícone + texto, sem setas em texto.
| Classe | Cor | Uso |
|--------|-----|-----|
| `.btn-next` | Ouro (texto escuro) | Ação principal: Continuar, Próxima, Comprar |
| `.btn-run` | Verde (texto escuro) | Executar código |
| `.btn-submit` | Azul (texto branco) | Enviar resposta |
| `.btn-nav` | Neutro | Voltar / Mapa / Fechar |
| `.icon-btn` | Contorno discreto | Barra do topo, Copiar/Resetar (`.is-square` = só ícone) |
Tamanhos: padrão 44px, `.btn-pixel.is-compact` 38px, `.btn-sm` 32px. Desativado = neutro cinza (não ouro apagado).

### Peças reutilizáveis
- `.rpg-frame` / `.panel`: cartão principal. `.modal` + `.modal-foot` (rodapé das janelas).
- `.chip` (`.is-xp`, `.is-done`, `.is-open`, `.is-locked`, `.is-boss`): pílulas pequenas de estado.
- `.track-badge`: selo maior (trilha, XP, moedas). `.field` + `.field-label`: campos de formulário.
- `.xp-pixel` / `.banner-progress`: barras de progresso arredondadas. `.level-badge`: quadrado dourado do nível.
- Cuidado com `display: flex` + `gap` num parágrafo com `<b>` no meio: o gap separa o texto. Envolver o texto num `<span>`.

### Section headers (classe `.section-header`)
```tsx
<div className="section-header">
  <span className="section-icon" style={{ color }}><Icon name="target" size={18} /></span>
  <span className="section-label" style={{ color }}>Quest · seu objetivo</span>
  <div className="section-line" style={{ background: color }} />
</div>
```

### Sprites (`/assets/sprites`, CC0 — ver `CREDITS.md`)
- Trilhas: Python `trilha-python` (serpente), SQL `trilha-sql` (entrada da cripta), Pandas `trilha-pandas` (martelo), Data Viz `trilha-dataviz` (orbe)
- Raças: `raca-elfo`, `raca-anao`, `raca-orc`, `raca-goblin`
- Missão: `missao-concluida` (baú), `missao-bloqueada` (portal com ?); `grimorio` (livro), `moedas` (pilha de ouro)
- Sempre via `<Sprite size={32|64|96}>` — nunca emoji para trilhas/raças

### Texto sobre imagem
Todo texto sobre o fundo do mundo fica dentro de `.panel` / `.map-label` (fundo sólido 94–96%). Nunca texto solto sobre a imagem.

### Mapa (WorldMap + MissionPin) — Mapa-Múndi + uma tela por região (Sessão 16)
- `/map` = **Mapa-Múndi** (`WorldHub` em `components/map/WorldMap.tsx`). Ele cabe numa tela de 1366×768:
  - painel compacto do jogador;
  - um lugar por região em `HUB_SPOTS`, ligados por estrada SVG, e um lugar "???" (Terras inexploradas, em breve);
  - cada lugar mostra o progresso e o chefe (ícone de coroa + "Chefe: …", ou "Chefe derrotado");
  - região bloqueada fica cinza e diz "Vença o chefe anterior";
  - o herói e "VOCÊ ESTÁ AQUI" ficam na região da próxima fase.
- `/regiao/[track]` (`app/regiao/[track]/page.tsx` → `<WorldMap track>` → `RegionTrail`) = trilha só daquela região:
  - "← Mapa-Múndi" e Continuar no topo, depois o estandarte, depois as fases;
  - layout em `trailLayout()`: nós de 128px, x em zigue-zague `[50, 70, 50, 30]%`;
  - neblina depois da última fase não bloqueada; região bloqueada fica toda coberta ("Região bloqueada");
  - depois do chefe, aparece "Próxima região →".
- **Chefe = a última fase de cada região** (`bossOf`/`isBoss` em `lib/missions.ts`). Toda região precisa terminar
  num chefe. No mapa ele tem um medalhão de 96px com aro carmesim (`.map-node.is-boss`, brilho `boss-glow`), uma
  coroa (`.boss-crown`) em cima e a pílula "CHEFE DA REGIÃO" (`.chip.is-boss`) no cartão.
- **Região nova:**
  - Somar a trilha em `Track` (`types`), `TRACKS` e `TRACK_ORDER` (`lib/tracks.ts`), com um sprite de medalhão.
  - O Mapa-Múndi tem 5 lugares. A 6ª região pede mais um ponto em `HUB_SPOTS`; a 5ª ocupa o lugar do "???".
- Os links "Mapa" da tela de missão voltam para a região da fase. O logo DataQuest leva ao Mapa-Múndi.
- Cartões do mapa: `.map-label` escuro (título `.map-label-title`, conceito na cor da trilha, pílulas de XP e estado).
  **Cuidado:** `.rpg-frame` tem `position: relative`, que vence a classe `absolute` do Tailwind. Um elemento com
  `.rpg-frame` que precisa ser absolute deve receber o `position` no `style`.
- **Neblina** (`MapFog`): `localStorage["dataquest-fog-seen"]` guarda a última âncora vista. Se o jogador avançou, a
  neblina começa na antiga e recua com animação.
- Nó: bloqueado `missao-bloqueada`, disponível = sprite da trilha (aro dourado pulsando), concluído `missao-concluida`
  (aro dourado + selo verde); bandeira `PRÓXIMA` (`.next-flag`, com setinha).

### Layout da tela de missão
- Top bar: `Brand` + breadcrumb (`.region-chip` com sprite da trilha → título) → segmentos de progresso da trilha (1 por missão, clicáveis se desbloqueadas) → ajuda, Bestiário, `PlayerChip`
- Coluna esquerda 55% (conteúdo em `.mission-col`, até 760px): "Fase N de M · capítulo" → `.mission-title` 32px → "Você vai aprender" → palavras novas → badges (trilha, XP, moedas, "−50%" se solução revelada) → card QUEST (+ links Estudo/Grimório e contador de erros) → abas Lore/Estudo/Grimório/Dados → rodapé fixo
- Coluna direita 45%: aba arquivo → CodeMirror (flex-1) → botões → `.splitter` (arrastar / duplo clique) → painel Saída (status, ms, linhas)
- Missão narrative: painel direito mostra os 4 sprites das trilhas + texto + botão "Começar a jornada"
- Editor: CodeMirror com o tema One Dark, mas fundo, números de linha e linha ativa sobrescritos em `.mission-tome .cm-editor …`

### Efeito Typewriter (`TypewriterText`)
- Usado na seção LORE de todas as missões
- `speed=16ms` por char, pausa longa em `.?!`, pausa curta em `,`
- Re-anima toda vez que a missão é carregada (comportamento intencional)
- Cursor piscante via `.typewriter-cursor` CSS (não usa emoji)

---

## Como Adicionar uma Nova Missão

1. Criar `data/missions/mission-N.ts` com o **próximo id livre** (hoje: 23) — nunca reaproveitar/renumerar ids
   (são a chave do progresso salvo). Preencher `concept` com linguagem direta (o que a pessoa aprende).
   Campos de conteúdo (padrão da Sessão 4):
   - `narrative` — continua a história da missão anterior (ver "Arco da história"; tom meta e bem-humorado)
   - `realWorld` — caixa "No mundo real": o conceito em linguagem simples + analogia do dia a dia
   - `theory` (aba Estudo) — ensina a SINTAXE com um exemplo de outro contexto; não entrega a resposta
   - `instructions` (QUEST) — objetivo + saída esperada, sem passo a passo; menos guiada quanto mais avançada
   - `hints` — 2 dicas, da mais leve à mais específica · `solution` — código completo que passa na validação
   - `codeTemplate` — lacunas só na 1ª missão da trilha; depois, comentários; chefe quase vazio
   - `coinReward` — ~10 a 25, crescendo com a dificuldade
2. Definir `validationType`:
   - `"exact"` — compara stdout string literal
   - `"table"` — `expectedOutput` é JSON `{ headers, rowCount, firstRow? }`
   - `"chart"` — `expectedOutput` é JSON `{ kind, count, values, title, xlabel, ylabel }` (ver Sessão 13)
   - `"narrative"` — auto-valida sem executar código
3. Adicionar `unlockCondition` com `requiredMissionIds` e/ou `requiredXP`; ajustar o `unlockCondition`
   da missão que vem **depois** dela para apontar para a nova
4. Importar e inserir no array `MISSIONS` em `lib/missions.ts` **na posição de jogo** (a ordem do array é a ordem do mapa e da navegação)
5. `instructions`: usar `•` para bullets (passos numerados); linhas indentadas viram bloco de código
6. Para `exact`, adicionar `requiredCode` (regex em string TS — **escapar em dobro**: `"\\bif\\s+"`) para que
   imprimir a resposta pronta não passe. Comentários do aluno são ignorados na checagem.
7. Testar a solução real no navegador (Pyodide) — o `expectedOutput` precisa bater exatamente
8. Acrescentar as palavras novas da fase em `lib/glossary.ts` (`missionId` = id da fase) e, se for chefe, pensar num
   item da loja liberado por ela (`requiresMissionId`)

### ✅ Checklist de fase acessível (regra do usuário — vale para fases NOVAS e para REVISAR as existentes)
O público inclui quem **nunca programou** e quem **nunca jogou RPG**. Nada pode ser difícil demais para essas pessoas.
- [ ] **Um conceito novo por fase.** O resto é revisão do que já foi ensinado. Chefe = juntar o que já se sabe, nunca
      algo que não foi explicado.
- [ ] **Todo termo explicado na 1ª vez** em que aparece (de RPG e de programação), na fala do Grimório ou no Estudo, e
      cadastrado no Bestiário.
- [ ] **Estudo** ensina a sintaxe com exemplo de outro contexto, em frases curtas, mostrando o resultado de cada linha.
- [ ] **QUEST** diz o objetivo e a saída esperada com clareza — dá para saber quando se acertou.
- [ ] **Dicas** destravam de verdade: a 1ª aponta o caminho, a 2ª quase entrega.
- [ ] **No mundo real** preenchido, com analogia do dia a dia.
- [ ] **Template** coerente com a dificuldade (lacunas `___` na 1ª fase da trilha).
- [ ] **Testar no navegador:** a solução passa; os 2–3 erros mais prováveis de um iniciante dão uma mensagem
      compreensível (erro traduzido pelo Grimório ou feedback de saída/tabela/gráfico).
- [ ] Dados sem ambiguidade (sem empates que mudem a ordem, sem armadilha que não foi ensinada).
- [ ] Revisão de português (acentos, sem jargão sem explicação). Depois: `tsc`, `build`, commit e push.

---

## Melhorias Futuras Sugeridas

### Conteúdo
- [ ] Módulo Data Viz: matplotlib, seaborn — validação por `"chart"`
- [x] Missões Python de variáveis/contas e if/elif/else (ids 5 e 6)
- [ ] Mais missões Python: listas, while, funções, dicionários (próximo foco)
- [x] Missões SQL: AND/OR/IN, agregações, GROUP BY/HAVING, JOIN (ids 9–12)
- [ ] SQL extra: subconsultas, LEFT JOIN, CASE WHEN
- [ ] Missões Pandas: merge, pivot_table (groupby feito — id 13)

### Funcionalidades
- [x] Imagens RPG para trilhas SQL/Pandas/DataViz (sprites CC0)
- [x] Fundo do mapa próprio e CC0 (substituiu a imagem Freepik com marca d'água)
- [x] Animação de XP ao completar missão (counter animado + level up)
- [ ] Tela de perfil / histórico de missões concluídas
- [x] Contas (e-mail/senha), save na nuvem e ranking (Supabase)
- [x] Login antes do personagem, telas de entrada animadas e compactas
- [x] Cursor de RPG (manopla dourada)
- [ ] Validação de XP no servidor (anti-trapaça do ranking)
- [x] Hints/dicas desbloqueáveis por missão (Grimório: dicas por moedas; solução após 3 erros, −50% XP)
- [x] Timer de execução visível no terminal
- [x] Múltiplas tabelas por missão SQL (`extraDataFiles` + `table`)

### Técnico
- [ ] Pré-carregar Pyodide no `layout.tsx` (reduz espera na primeira missão Python)
- [ ] Service Worker para cache offline do bundle Pyodide (~10MB)
- [ ] Testes E2E com Playwright (validar fluxo das 5 missões)

---

## Comandos Úteis

```bash
# Desenvolvimento (precisa de .env.local com as variáveis do Supabase para login/ranking)
npm run dev          # inicia em http://localhost:3000

# Assets gerados
python scripts/gerar_cursor.py      # cursor (manopla)
python scripts/gerar_fundo_mapa.py  # fundo do mapa

# Verificação
npx tsc --noEmit     # check TypeScript sem compilar

# Build de produção
npm run build
npm run start
```
