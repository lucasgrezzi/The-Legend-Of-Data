import type { Mission } from "@/types";
import { missionDataFiles } from "@/lib/missions";

/**
 * O Grimório traduz erros de Python (Pyodide) e SQL (DuckDB) para quem nunca programou.
 * A mensagem original continua disponível (`raw`) para quem já sabe — e para aprender a ler.
 * Trechos entre `crases` são renderizados como código.
 */
export interface FriendlyError {
  /** Nome técnico do erro (NameError, Binder Error…) */
  kind: string;
  /** Resumo curto: o que aconteceu */
  title: string;
  /** Explicação na voz do Grimório */
  explain: string;
  /** Como consertar */
  fix?: string;
  /** Linha do código do jogador (1 = primeira) */
  line?: number;
  /** Texto da linha com erro */
  lineText?: string;
  /** Mensagem original, sem as linhas internas do motor */
  raw: string;
}

export interface ErrorContext {
  code: string;
  language: "python" | "sql";
  /** Tabelas/CSVs da missão — para sugerir nomes de colunas e tabelas */
  tables?: { name: string; headers: string[] }[];
}

export function errorContext(mission: Mission, code: string): ErrorContext {
  return {
    code,
    language: mission.editorLanguage,
    tables: missionDataFiles(mission).map((f) => ({ name: f.table ?? "vendas", headers: f.headers })),
  };
}

export function explainError(stderr: string, ctx: ErrorContext): FriendlyError {
  const base = ctx.language === "sql" ? explainSql(stderr, ctx) : explainPython(stderr, ctx);
  if (base.line) {
    const text = ctx.code.split("\n")[base.line - 1];
    if (text !== undefined && text.trim()) base.lineText = text;
  }
  return base;
}

// ───────────────────────── helpers ─────────────────────────

/** Distância de edição (com troca de letras vizinhas) — para "você quis dizer…?" */
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Comandos que o iniciante escreve em português → o nome certo, em inglês */
const PT_METHODS: Record<string, string> = {
  media: "mean", soma: "sum", somar: "sum", maximo: "max", maior: "max", minimo: "min", menor: "min",
  contar: "count", ordenar: "sort_values", adicionar: "append", agrupar: "groupby", cabeca: "head",
};

/** Nome parecido (até 2 letras de diferença, ignorando maiúsculas) */
function closest(word: string, options: string[]): string | undefined {
  // nomes curtos (x, y, df) são todos "parecidos" — sugerir só confundiria
  if (word.length < 3) return undefined;
  const w = word.toLowerCase();
  let best: string | undefined;
  let bestD = Math.min(2, Math.max(1, Math.floor(word.length / 3)));
  for (const o of options) {
    if (o === word) continue;
    const dd = distance(w, o.toLowerCase());
    if (dd <= bestD) { best = o; bestD = dd; }
  }
  return best;
}

/** Nomes criados no código (variáveis, funções, parâmetros, for) */
function pythonNames(code: string): string[] {
  const names = new Set<string>();
  const clean = code.replace(/#.*$/gm, "").replace(/(["'])(?:\\.|(?!\1).)*\1/g, '""');
  for (const m of clean.matchAll(/^\s*([A-Za-z_]\w*)\s*(?:[+\-*/]?=)(?!=)/gm)) names.add(m[1]);
  for (const m of clean.matchAll(/\bdef\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/g)) {
    names.add(m[1]);
    m[2].split(",").map((p) => p.split("=")[0].trim()).filter(Boolean).forEach((p) => names.add(p));
  }
  for (const m of clean.matchAll(/\bfor\s+([A-Za-z_]\w*)\s+in\b/g)) names.add(m[1]);
  for (const m of clean.matchAll(/\bimport\s+\w+(?:\.\w+)*\s+as\s+(\w+)/g)) names.add(m[1]);
  return [...names];
}

const PY_BUILTINS = ["print", "len", "range", "int", "str", "float", "list", "dict", "input", "sum", "max", "min",
  "round", "abs", "sorted", "True", "False", "None", "type", "bool"];

const BRACKET: Record<string, string> = {
  "(": "parêntese `(`", ")": "parêntese `)`",
  "[": "colchete `[`", "]": "colchete `]`",
  "{": "chave `{`", "}": "chave `}`",
};

function columnsHint(ctx: ErrorContext): string {
  const t = ctx.tables ?? [];
  if (!t.length) return "";
  if (t.length === 1) return `As colunas disponíveis são: ${t[0].headers.map((h) => `\`${h}\``).join(", ")}.`;
  return t.map((x) => `\`${x.name}\`: ${x.headers.map((h) => `\`${h}\``).join(", ")}`).join(" · ");
}

// ───────────────────────── Python ─────────────────────────

function explainPython(stderr: string, ctx: ErrorContext): FriendlyError {
  const lines = stderr.trim().split("\n");
  // última linha no formato "AlgumaCoisaError: mensagem"
  let idx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^[A-Za-z_][\w.]*(Error|Exception|Warning|Interrupt|Exit)\b/.test(lines[i])) { idx = i; break; }
  }
  const header = idx >= 0 ? lines[idx] : lines[lines.length - 1] ?? "";
  const colon = header.indexOf(":");
  const kind = (colon >= 0 ? header.slice(0, colon) : header).split(".").pop()!.trim();
  const msg = colon >= 0 ? header.slice(colon + 1).trim() : "";

  const lineMatches = [...stderr.matchAll(/File "<exec>", line (\d+)/g)];
  const line = lineMatches.length ? Number(lineMatches[lineMatches.length - 1][1]) : undefined;

  // mensagem original a partir do 1º trecho do código do aluno (sem as entranhas do Pyodide)
  const first = lines.findIndex((l) => l.includes('File "<exec>"'));
  const raw = first >= 0
    ? (stderr.includes("Traceback") && !/^(SyntaxError|IndentationError|TabError)/.test(kind) ? "Traceback (most recent call last):\n" : "") +
      lines.slice(first).join("\n")
    : stderr.trim();

  const r = (title: string, explain: string, fix?: string): FriendlyError => ({ kind, title, explain, fix, line, raw });
  const lineText = line ? ctx.code.split("\n")[line - 1] ?? "" : "";
  let m: RegExpMatchArray | null;

  // ── Erros de escrita (o Python nem começou a rodar) ──
  if (/unterminated triple-quoted string/.test(msg)) {
    return r("Texto de três aspas sem fim",
      "Você abriu um texto com três aspas (`\"\"\"`) e não fechou. Para o Python, todo o resto do código virou parte desse texto.",
      "Feche com as mesmas três aspas no fim do texto.");
  }
  if (/unterminated string literal|EOL while scanning/.test(msg)) {
    return r("Faltou fechar as aspas",
      "Você abriu aspas e esqueceu de fechar. Para o Python, tudo depois delas virou um texto sem fim — e ele se perdeu.",
      "Todo texto começa e termina com aspas iguais: `\"assim\"` ou `'assim'`.");
  }
  if ((m = msg.match(/invalid character '(.)' \(U\+(201C|201D|2018|2019)\)/))) {
    return r("Aspas \"tortas\" no código",
      "Essas aspas curvinhas (“ ” ‘ ’) vêm do Word, do celular ou de sites. Elas parecem aspas, mas o Python não reconhece.",
      "Apague e digite as aspas de novo direto no editor: `\"` ou `'`.");
  }
  if ((m = msg.match(/invalid character '(.)'/))) {
    return r("Um símbolo estranho apareceu",
      `O caractere ${m[1]} não faz parte do Python. Às vezes ele vem junto quando se copia código de outro lugar.`,
      "Apague esse símbolo e digite o trecho de novo.");
  }
  if ((m = msg.match(/'(.)' was never closed/))) {
    return r(`Abriu ${BRACKET[m[1]] ?? m[1]} e não fechou`,
      `Na linha ${line ?? "marcada"} tem um ${BRACKET[m[1]] ?? m[1]} aberto que nunca foi fechado. Todo símbolo que abre precisa de um par que fecha.`,
      "Conte os símbolos da linha: cada `(` precisa de um `)`, cada `[` de um `]`.");
  }
  if ((m = msg.match(/closing parenthesis '(.)' does not match opening parenthesis '(.)'/))) {
    return r("Símbolos trocados",
      `Você abriu com ${BRACKET[m[2]] ?? m[2]} mas fechou com ${BRACKET[m[1]] ?? m[1]}. Eles precisam ser do mesmo tipo.`,
      "Use pares iguais: `( )`, `[ ]`, `{ }`.");
  }
  if ((m = msg.match(/unmatched '(.)'/))) {
    return r(`${BRACKET[m[1]] ?? m[1]} sobrando`,
      `Tem um ${BRACKET[m[1]] ?? m[1]} fechando algo que nunca foi aberto.`,
      "Apague o símbolo extra ou abra o par que faltou.");
  }
  if (/Missing parentheses in call to 'print'/.test(msg)) {
    return r("O print precisa de parênteses",
      "No Python, o `print` só funciona com parênteses em volta do que você quer mostrar.",
      "Escreva assim: `print(\"Olá\")`.");
  }
  if (kind === "SyntaxError" && (m = msg.match(/Did you mean '(\w+)'\?/))) {
    return r(`Era \`${m[1]}\`, com letra minúscula?`,
      `O Python diferencia maiúsculas de minúsculas: para ele, \`${lineText.trim().split(/\W/)[0] || "If"}\` e \`${m[1]}\` são palavras diferentes.`,
      `Escreva \`${m[1]}\` exatamente assim.`);
  }
  if (/Maybe you meant '==' or ':=' instead of '='/.test(msg) || /cannot assign to .*Maybe you meant '=='/.test(msg)) {
    return r("Para comparar, use ==",
      "Um `=` sozinho GUARDA um valor numa variável. Para PERGUNTAR se duas coisas são iguais, o Python usa dois: `==`.",
      "Exemplo: `if nivel == 10:`");
  }
  if (/expected ':'/.test(msg)) {
    return r("Faltaram os dois-pontos",
      "Linhas que começam com `if`, `elif`, `else`, `for`, `while` ou `def` precisam terminar com `:`. É como o Python sabe que vem um bloco logo abaixo.",
      "Coloque `:` no fim da linha. Ex.: `if xp >= 10:`");
  }
  if (/Perhaps you forgot a comma/.test(msg)) {
    return r("Faltou uma vírgula",
      "Você colocou dois valores lado a lado sem nada entre eles. O Python precisa de uma vírgula para separar.",
      "Ex.: `print(\"Nivel:\", nivel)` — repare na vírgula.");
  }
  if (/invalid decimal literal/.test(msg)) {
    return r("Número grudado em letra",
      "Nomes de variáveis não podem começar com número (`3pocoes`), e números não podem ter letras grudadas.",
      "Comece o nome com letra: `pocoes3` ou `tres_pocoes`.");
  }
  if (/cannot assign to (literal|expression|function call)/.test(msg)) {
    return r("O lado esquerdo do = está errado",
      "O `=` guarda o valor da DIREITA dentro do nome da ESQUERDA. À esquerda precisa ficar um nome de variável, não um número nem uma conta.",
      "Ex.: `moedas = 100` (e não `100 = moedas`).");
  }
  if ((m = msg.match(/expected an indented block after '?(\w+)'? .*on line (\d+)/))) {
    return r("Faltou o recuo (os espaços no começo)",
      `A linha ${m[2]} termina com \`:\`, então as linhas de baixo, que fazem parte dela, precisam começar com 4 espaços. Esse recuo mostra ao Python o que está DENTRO do \`${m[1]}\`.`,
      "Aperte Tab (ou 4 espaços) no começo da linha marcada.");
  }
  if (/expected an indented block/.test(msg)) {
    return r("Faltou o recuo (os espaços no começo)",
      "Depois de uma linha que termina com `:`, a linha seguinte precisa começar com 4 espaços. Esse recuo mostra o que está DENTRO do bloco.",
      "Aperte Tab (ou 4 espaços) no começo da linha marcada.");
  }
  if (/unexpected indent/.test(msg)) {
    return r("Espaço sobrando no começo da linha",
      "Essa linha começa com espaços, mas não está dentro de nenhum `if`, `for` ou `def`. No Python, o espaço no começo da linha tem significado.",
      "Apague os espaços do começo da linha marcada.");
  }
  if (/unindent does not match|inconsistent use of tabs/.test(msg)) {
    return r("Recuos desalinhados",
      "As linhas de um mesmo bloco precisam começar exatamente na mesma coluna. Aqui uma tem mais (ou menos) espaços que as vizinhas.",
      "Alinhe a linha marcada com as de cima — use sempre 4 espaços por nível.");
  }
  if (/'return' outside function/.test(msg)) {
    return r("return fora de uma função",
      "O `return` só existe dentro de uma função (`def`). Ele é a resposta que a função devolve.",
      "Coloque o `return` dentro da função, com recuo, ou troque por `print(...)`.");
  }
  if (kind === "SyntaxError" && /^\s*(if|elif|while)\b.*[^=!<>]=[^=]/.test(lineText)) {
    return r("Para comparar, use ==",
      "Um `=` sozinho GUARDA um valor numa variável. Dentro de um `if`, para PERGUNTAR se duas coisas são iguais, o Python usa dois: `==`.",
      "Troque o `=` da condição por `==`. Ex.: `if nivel == 10:` — e, se for True/False, nem precisa comparar: `if tem_chave:`");
  }
  if (kind === "SyntaxError" || kind === "IndentationError") {
    const cap = lineText.match(/^\s*(If|Elif|Else|For|While|Def|Print|Return|In)\b/);
    if (cap) {
      return r(`Era \`${cap[1].toLowerCase()}\`, com letra minúscula?`,
        "O Python diferencia maiúsculas de minúsculas. Todas as palavras dele são escritas em minúsculas.",
        `Troque \`${cap[1]}\` por \`${cap[1].toLowerCase()}\`.`);
    }
    return r("O Python não entendeu essa linha",
      "Tem algo fora do lugar na escrita — o Python nem chegou a rodar o código.",
      "Confira com calma: aspas abrem e fecham? Parênteses fecham? Faltou `:` ou vírgula? Compare com os exemplos da aba Estudo.");
  }

  // ── Erros durante a execução ──
  if (kind === "NameError" && (m = msg.match(/name '(\w+)' is not defined/))) {
    const name = m[1];
    // o Python sugere `None` para `nome` — dica que mais confunde do que ajuda
    const pyHint = msg.match(/Did you mean: '(\w+)'\?/)?.[1]?.replace(/^(True|False|None)$/, "") || undefined;
    if (/^_{2,}$/.test(name)) {
      return r("Ainda tem lacuna para preencher",
        "O `___` é um espaço em branco que o Grimório deixou para VOCÊ completar. O Python não sabe o que colocar ali.",
        "Troque cada `___` pelo que falta (a linha está marcada). Releia o Estudo se não lembrar o que vai ali.");
    }
    if (name === "pd") {
      return r("Faltou importar o Pandas",
        "`pd` é o apelido do Pandas, mas ele só existe depois que você o chama para a aventura.",
        "Na primeira linha: `import pandas as pd`.");
    }
    if (name === "plt") {
      return r("Faltou importar o matplotlib",
        "`plt` é o apelido da biblioteca de gráficos, e ela precisa ser importada antes.",
        "Na primeira linha: `import matplotlib.pyplot as plt`.");
    }
    if (/^(true|false|none|TRUE|FALSE|NONE)$/.test(name)) {
      const ok = name[0].toUpperCase() + name.slice(1).toLowerCase();
      return r(`Em Python é \`${ok}\`, com maiúscula`,
        `\`True\`, \`False\` e \`None\` são palavras especiais do Python e sempre começam com letra maiúscula.`,
        `Troque \`${name}\` por \`${ok}\`.`);
    }
    const builtin = PY_BUILTINS.find((b) => b.toLowerCase() === name.toLowerCase());
    if (builtin) {
      return r(`Era \`${builtin}\`?`,
        "O Python diferencia maiúsculas de minúsculas: para ele, essas são duas palavras diferentes.",
        `Escreva \`${builtin}\` exatamente assim.`);
    }
    const similar = pyHint ?? closest(name, [...pythonNames(ctx.code), ...PY_BUILTINS.filter((b) => !/^(True|False|None)$/.test(b))]);
    if (similar) {
      return r(`Você quis dizer \`${similar}\`?`,
        `O Python não conhece nada chamado \`${name}\`, mas conhece \`${similar}\`. Uma letra trocada já basta para ele não reconhecer.`,
        `Troque \`${name}\` por \`${similar}\`.`);
    }
    return r(`O Python não conhece \`${name}\``,
      `Ele procurou uma variável chamada \`${name}\` e não achou. Ou ela ainda não foi criada nesse ponto, ou o nome está escrito diferente — ou era para ser um TEXTO e faltaram as aspas.`,
      `Se é uma variável, crie antes de usar (\`${name} = ...\`). Se é um texto, use aspas: \`"${name}"\`.`);
  }
  if (kind === "UnboundLocalError" || /referenced before assignment|cannot access local variable/.test(msg)) {
    const name = msg.match(/variable '(\w+)'/)?.[1] ?? "essa variável";
    return r(`\`${name}\` foi usada antes de ganhar valor`,
      "Dentro da função você usou essa variável antes de guardar algo nela. Para a função, as variáveis de fora não valem se você tenta mudá-las lá dentro.",
      "Passe o valor como parâmetro da função (`def f(x):`) e devolva o resultado com `return`.");
  }
  if (kind === "TypeError") {
    if (/can only concatenate str \(not "(\w+)"\) to str/.test(msg)) {
      return r("Juntou texto com número usando +",
        "O `+` soma números OU emenda textos — mas não mistura os dois. `\"Nivel: \" + 1` deixa o Python confuso.",
        "Separe com vírgula no print (`print(\"Nivel:\", 1)`), use f-string (`f\"Nivel: {nivel}\"`) ou converta com `str(nivel)`.");
    }
    if ((m = msg.match(/unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/))) {
      return r("Conta com texto no meio",
        `Você tentou fazer \`${m[1]}\` entre um \`${m[2]}\` e um \`${m[3]}\`. Provavelmente um dos valores é TEXTO (está entre aspas, tipo \`"100"\`) e não número.`,
        "Números ficam sem aspas: `moedas = 100`, e não `moedas = \"100\"`.");
    }
    if ((m = msg.match(/'(.+)' not supported between instances of '(\w+)' and '(\w+)'/))) {
      return r("Comparou texto com número",
        `O \`${m[1]}\` está comparando um \`${m[2]}\` com um \`${m[3]}\`. Para o Python, \`"10"\` (texto) e \`10\` (número) são coisas diferentes.`,
        "Confira se algum dos valores está entre aspas sem querer.");
    }
    if ((m = msg.match(/'(\w+)' object is not callable/))) {
      return r("Usou () em algo que não é função",
        `Os parênteses \`()\` servem para chamar funções, mas aqui eles foram colocados depois de um \`${m[1]}\`. Talvez uma variável tenha o mesmo nome de uma função (tipo \`print = ...\`).`,
        "Confira o nome antes dos parênteses e não use nomes como `print`, `len` ou `sum` para variáveis.");
    }
    if ((m = msg.match(/(\w+)\(\) missing (\d+) required positional arguments?: (.+)/))) {
      return r(`Faltou valor para a função \`${m[1]}\``,
        `A função \`${m[1]}\` espera receber ${m[3]} entre os parênteses, mas foi chamada sem.`,
        `Passe o valor ao chamar: \`${m[1]}(algum_valor)\`.`);
    }
    if ((m = msg.match(/(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:were|was) given/))) {
      return r(`Valores demais para \`${m[1]}\``,
        `A função \`${m[1]}\` recebe ${m[2]} valor(es), mas você mandou ${m[3]}.`,
        "Confira quantos parâmetros existem no `def` e quantos valores vão na chamada.");
    }
    if ((m = msg.match(/object of type '(\w+)' has no len\(\)/))) {
      return r("len() em algo que não tem tamanho",
        `O \`len()\` conta itens de listas e letras de textos, mas recebeu um \`${m[1]}\`, que não tem tamanho.`,
        "Passe a lista (ou o texto) para o `len`, não um número.");
    }
    if ((m = msg.match(/'(\w+)' object is not iterable/))) {
      return r("O for precisa de uma lista",
        `O \`for\` passa por itens um a um, mas recebeu um \`${m[1]}\` — que não tem itens.`,
        m[1] === "int" ? "Para repetir N vezes, use `range`: `for i in range(5):`" : "Use o `for` numa lista ou num `range(...)`.");
    }
    if ((m = msg.match(/'(\w+)' object is not subscriptable/))) {
      return r("Colchetes [] no lugar errado",
        `Os colchetes servem para pegar um item de uma lista ou uma coluna de tabela, mas aqui foram usados num \`${m[1]}\`.`,
        "Confira se a variável antes dos `[ ]` é mesmo uma lista ou tabela.");
    }
    return r("Tipo de valor errado",
      "Algum valor não é do tipo que a operação esperava — por exemplo, texto onde devia ser número.",
      "Confira se algum número está entre aspas, ou se a função recebeu o valor certo.");
  }
  if (kind === "ZeroDivisionError") {
    return r("Dividiu por zero",
      "Nem o mago mais poderoso divide por zero. Em algum momento o número de baixo da divisão valeu 0.",
      "Confira o valor que está depois do `/`.");
  }
  if (kind === "IndexError") {
    return r("Essa posição não existe",
      "Você pediu um item numa posição que a lista não tem. Lembre: no Python a contagem começa no 0 — numa lista de 3 itens, as posições são 0, 1 e 2.",
      "Use uma posição menor que o tamanho da lista (`len(lista)`).");
  }
  if (kind === "KeyError") {
    // o Pandas às vezes embrulha: KeyError: 'Column not found: totl'
    const key = msg.replace(/^['"]|['"]$/g, "").replace(/^Column\(?s?\)? not found:?\s*/i, "").replace(/^\[?['"]?|['"]?\]?$/g, "");
    const cols = (ctx.tables ?? []).flatMap((t) => t.headers);
    const similar = closest(key, cols);
    if (cols.length) {
      return r(`Não existe a coluna \`${key}\``,
        `A tabela não tem nenhuma coluna chamada \`${key}\`. O nome precisa ser IGUALZINHO ao do arquivo — maiúsculas e acentos contam.`,
        similar ? `Você quis dizer \`${similar}\`? ${columnsHint(ctx)}` : columnsHint(ctx));
    }
    return r(`A chave \`${key}\` não existe`,
      `Você procurou \`${key}\`, mas ela não está lá dentro. O nome precisa ser igualzinho, com maiúsculas e acentos.`,
      "Confira como a chave foi escrita quando foi criada.");
  }
  if (kind === "AttributeError" && (m = msg.match(/'([\w.]+)' (?:object )?has no attribute '(\w+)'/))) {
    // nome em português: o Python sugeriria .median para .media — que é OUTRA conta (mediana)
    const english = PT_METHODS[m[2].toLowerCase()];
    if (english) {
      return r(`Em Python é \`.${english}\``,
        `Os comandos do Python e do Pandas são em inglês. \`.${m[2]}\` não existe — o nome certo é \`.${english}\`.`,
        `Troque \`.${m[2]}\` por \`.${english}\`.`);
    }
    // ex.: df["raca"].count() devolve UM número, e o número não tem .items()
    if (/^(int|float|numpy\.(int|float)\d*)$/.test(m[1])) {
      return r("Isso virou um número só",
        `Na linha marcada, a variável guarda um número só (um \`${m[1]}\`), e um número não tem \`.${m[2]}\`. Algum comando antes devolveu um total em vez de uma lista ou tabela — o \`.count()\`, por exemplo, conta TODAS as linhas de uma vez.`,
        "Para contar quantas vezes CADA valor aparece, use `.value_counts()`. Confira no Estudo qual comando a fase pede.");
    }
    const hint = msg.match(/Did you mean: '(\w+)'\?/)?.[1];
    const what = /^module/.test(msg) ? `o módulo \`${m[1]}\`` : `um \`${m[1]}\``;
    return r(hint ? `Era \`.${hint}\`?` : `\`.${m[2]}\` não existe aqui`,
      `O ponto (\`.\`) chama uma habilidade de um valor, mas ${what} não tem nenhuma chamada \`${m[2]}\`.`,
      hint ? `Troque \`.${m[2]}\` por \`.${hint}\`.` : m[1] === "list" ? "Para colocar um item numa lista, use `.append(...)`." : "Confira o nome no Estudo da fase.");
  }
  if (kind === "ModuleNotFoundError" || kind === "ImportError") {
    const mod = msg.match(/'([\w.]+)'/)?.[1] ?? "";
    const similar = closest(mod, ["pandas", "matplotlib", "math", "random"]);
    return r(`Biblioteca \`${mod}\` não encontrada`,
      "O `import` busca uma biblioteca pelo nome, e não existe nenhuma com esse nome aqui.",
      similar ? `Você quis dizer \`${similar}\`? Ex.: \`import ${similar}${similar === "pandas" ? " as pd" : ""}\`` : "Confira o nome no Estudo da fase.");
  }
  if (kind === "FileNotFoundError") {
    return r("Arquivo não encontrado",
      "O caminho do arquivo está errado — o Python procurou e não achou nada lá.",
      "O arquivo desta fase fica em `\"/data/mission.csv\"`.");
  }
  if (kind === "ValueError" && /invalid literal for int\(\)/.test(msg)) {
    return r("Esse texto não vira número",
      "O `int()` transforma texto em número, mas só se o texto for feito de algarismos (`\"42\"`). Esse aqui tem letras.",
      "Passe só números para o `int()`.");
  }
  if (kind === "RecursionError") {
    return r("A função não para de se chamar",
      "Uma função chamou a si mesma tantas vezes que o Python desistiu. Parece um espelho na frente de outro espelho.",
      "Confira se a função não está chamando ela mesma por engano.");
  }
  return r(`O feitiço quebrou (${kind || "erro"})`,
    "O código começou a rodar, mas tropeçou no caminho." + (line ? ` O problema apareceu na linha ${line}.` : ""),
    "Leia a mensagem original abaixo e compare a linha marcada com os exemplos do Estudo.");
}

// ───────────────────────── SQL ─────────────────────────

const SQL_KEYWORDS = ["SELECT", "FROM", "WHERE", "ORDER", "GROUP", "HAVING", "JOIN", "LIMIT", "DISTINCT", "COUNT",
  "AVG", "SUM", "MAX", "MIN", "INNER", "LEFT", "BETWEEN", "LIKE", "DESC", "ASC", "AND", "NOT", "NULL"];

function explainSql(stderr: string, ctx: ErrorContext): FriendlyError {
  // DuckDB repete o bloco "LINE N: …" às vezes — mostra uma vez só
  const blocks = stderr.trim().split(/\n\s*\n/);
  const raw = [...new Set(blocks.map((b) => b.trimEnd()))].join("\n\n");
  const header = raw.split("\n")[0];
  const colon = header.indexOf(":");
  const kind = colon >= 0 ? header.slice(0, colon).trim() : "Erro";
  const msg = colon >= 0 ? header.slice(colon + 1).trim() : header;
  const lineNo = raw.match(/LINE (\d+):/);
  const line = lineNo ? Number(lineNo[1]) : undefined;
  const r = (title: string, explain: string, fix?: string): FriendlyError => ({ kind, title, explain, fix, line, raw });

  const code = ctx.code;
  const tables = ctx.tables ?? [];
  const allCols = tables.flatMap((t) => t.headers);
  const didYouMean = raw.match(/Did you mean "([^"]+)"/)?.[1];
  const candidates = raw.match(/Candidate bindings: (.+)/)?.[1];
  let m: RegExpMatchArray | null;

  if ((m = msg.match(/Table with name (\S+) does not exist/))) {
    const names = tables.map((t) => `\`${t.name}\``).join(", ");
    return r(`Não existe a tabela \`${m[1]}\``,
      `O SQL procurou uma tabela chamada \`${m[1]}\` e não achou. O nome precisa ser exatamente igual ao da aba Dados.`,
      didYouMean ? `Você quis dizer \`${didYouMean}\`? Tabelas desta fase: ${names}.` : `Tabelas desta fase: ${names}.`);
  }
  if ((m = msg.match(/Referenced column "([^"]+)" not found/))) {
    const col = m[1];
    if (new RegExp(`"${col.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(code) && !allCols.includes(col)) {
      return r("Texto em SQL usa aspas simples",
        `No SQL, aspas DUPLAS (\`"${col}"\`) significam nome de coluna — então ele foi procurar uma coluna chamada ${col}. Para escrever um TEXTO, use aspas simples.`,
        `Troque \`"${col}"\` por \`'${col}'\`.`);
    }
    const similar = closest(col, allCols) ?? candidates?.match(/"(?:\w+\.)?(\w+)"/)?.[1];
    return r(`Não existe a coluna \`${col}\``,
      `Nenhuma tabela do FROM tem uma coluna chamada \`${col}\`. Uma letra diferente já basta para o SQL não reconhecer.`,
      (similar && similar !== col ? `Você quis dizer \`${similar}\`? ` : "") + columnsHint(ctx));
  }
  if ((m = msg.match(/Referenced table "([^"]+)" not found/))) {
    return r(`\`${m[1]}\` não está no FROM`,
      `Você escreveu \`${m[1]}.coluna\`, mas \`${m[1]}\` não é nenhuma das tabelas (ou apelidos) que aparecem no FROM/JOIN.`,
      "Use o nome da tabela como está no FROM — ou crie o apelido lá: `FROM herois h`.");
  }
  if ((m = msg.match(/column "?(\w+)"? must appear in the GROUP BY clause/))) {
    return r(`\`${m[1]}\` precisa estar no GROUP BY`,
      `Com GROUP BY, cada linha do resultado é um GRUPO. A coluna \`${m[1]}\` tem vários valores dentro de cada grupo, e o SQL não sabe qual mostrar.`,
      `Coloque \`${m[1]}\` no GROUP BY, ou resuma com uma função: \`COUNT(${m[1]})\`, \`SUM(${m[1]})\`, \`MAX(${m[1]})\`…`);
  }
  if (/WHERE clause cannot contain aggregates/.test(msg)) {
    return r("Para filtrar grupos, use HAVING",
      "O WHERE filtra linha por linha, ANTES de agrupar — então ele não pode usar `SUM`, `COUNT` e companhia. Filtros sobre totais ficam no HAVING, depois do GROUP BY.",
      "Ex.: `GROUP BY tipo HAVING SUM(valor) > 300`");
  }
  if ((m = msg.match(/Ambiguous reference to column name "([^"]+)" \(use: (.+)\)/))) {
    return r(`\`${m[1]}\` existe nas duas tabelas`,
      `Com JOIN, mais de uma tabela tem uma coluna \`${m[1]}\`, e o SQL não sabe de qual você está falando.`,
      `Diga a tabela antes do nome: ${m[2].replace(/"/g, "`").replace(" or ", " ou ")}.`);
  }
  if ((m = msg.match(/Function with name (\w+) does not exist/))) {
    return r(`A função \`${m[1].toUpperCase()}\` não existe`,
      "O SQL não conhece nenhuma função com esse nome.",
      didYouMean ? `Você quis dizer \`${didYouMean.toUpperCase()}\`?` : "Funções comuns: `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`.");
  }
  if ((m = msg.match(/No function matches .*'(\w+)\(VARCHAR\)'/))) {
    return r(`\`${m[1].toUpperCase()}\` com coluna de texto`,
      `\`${m[1].toUpperCase()}\` faz contas, então precisa de uma coluna de NÚMEROS — mas recebeu uma coluna de texto.`,
      "Use uma coluna numérica (como `valor` ou `ouro`). Para contar linhas de texto, use `COUNT`.");
  }
  if ((m = msg.match(/Could not convert string '([^']*)' to/))) {
    return r("Comparou número com texto",
      `A coluna é de números, mas foi comparada com o texto \`'${m[1]}'\`.`,
      "Números ficam sem aspas: `valor > 150`, e não `valor > '150'`.");
  }
  if (/unterminated quoted string/.test(msg)) {
    return r("Faltou fechar as aspas",
      "Você abriu uma aspa simples e não fechou. Para o SQL, todo o resto virou parte do texto.",
      "Todo texto fica entre um par de aspas simples: `'arma'`.");
  }
  if (/syntax error/.test(msg)) {
    // palavras soltas (sem textos entre aspas nem comentários) parecidas com uma palavra do SQL
    const bare = code.replace(/--.*$/gm, "").replace(/'(?:[^']|'')*'?/g, "''");
    const typo = [...bare.matchAll(/[A-Za-z_]+/g)].map((x) => x[0])
      .filter((w) => w.length >= 3 && !SQL_KEYWORDS.includes(w.toUpperCase()) && !allCols.includes(w) && !tables.some((t) => t.name === w))
      .map((w) => [w, closest(w.toUpperCase(), SQL_KEYWORDS)] as const)
      .find(([, k]) => k);
    if (typo) {
      return r(`Era \`${typo[1]}\`?`,
        `O SQL não conhece a palavra \`${typo[0]}\`. Parece \`${typo[1]}\` com uma letra trocada.`,
        `Troque \`${typo[0]}\` por \`${typo[1]}\`.`);
    }
    if (/,\s*FROM\b/i.test(code)) {
      return r("Vírgula sobrando antes do FROM",
        "No SELECT, a vírgula separa uma coluna da outra. Depois da última coluna não vai vírgula.",
        "Ex.: `SELECT nome, valor FROM reliquias`");
    }
    if (/at end of input/.test(msg)) {
      return r("A consulta terminou no meio",
        "O SQL chegou ao fim do texto esperando mais alguma coisa — como um WHERE, ORDER BY ou vírgula sem nada depois.",
        "Confira o fim da consulta: cada WHERE precisa de uma condição, cada ORDER BY de uma coluna.");
    }
    const near = msg.match(/at or near "([^"]+)"/)?.[1];
    return r("O SQL não entendeu a consulta",
      near ? `Ele se perdeu perto de \`${near}\`. Normalmente o problema está nessa palavra ou logo antes dela.` : "Tem algo fora do lugar na escrita.",
      "Confira a ordem: `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY …`, vírgulas entre colunas e aspas simples em textos.");
  }
  return r(`A consulta quebrou (${kind})`,
    "O SQL não conseguiu rodar a consulta.",
    "Leia a mensagem original abaixo e compare com os exemplos do Estudo.");
}
