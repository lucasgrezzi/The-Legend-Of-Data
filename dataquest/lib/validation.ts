import type { Mission, RunResult, ValidationResult, TableData, ChartMeta } from "@/types";
import { explainError, errorContext } from "@/lib/friendlyErrors";

function normalize(s: string): string {
  return s.trim().replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

function validateExact(stdout: string, mission: Mission): ValidationResult {
  const passed = normalize(stdout) === normalize(mission.expectedOutput);
  return {
    passed,
    feedback: passed
      ? `Perfeito! +${mission.xpReward} XP conquistados!`
      : `Saída incorreta.\n\nEsperado:\n${mission.expectedOutput}\n\nObtido:\n${stdout}`,
    xpEarned: passed ? mission.xpReward : 0,
  };
}

function validateTable(
  tableData: TableData | undefined,
  mission: Mission
): ValidationResult {
  if (!tableData) {
    return { passed: false, feedback: "Nenhuma tabela retornada.", xpEarned: 0 };
  }

  let expected: { headers: string[]; rowCount: number; firstRow?: string[] };
  try {
    expected = JSON.parse(mission.expectedOutput);
  } catch {
    return { passed: false, feedback: "Configuração de missão inválida.", xpEarned: 0 };
  }

  const headersMatch = expected.headers.every((h) =>
    tableData.headers.map((x) => x.toLowerCase()).includes(h.toLowerCase())
  );
  if (!headersMatch) {
    return {
      passed: false,
      feedback: `Colunas incorretas.\nEsperado: ${expected.headers.join(", ")}\nObtido: ${tableData.headers.join(", ")}`,
      xpEarned: 0,
    };
  }

  if (tableData.rows.length !== expected.rowCount) {
    return {
      passed: false,
      feedback: `Número de linhas incorreto.\nEsperado: ${expected.rowCount}\nObtido: ${tableData.rows.length}`,
      xpEarned: 0,
    };
  }

  if (expected.firstRow) {
    const got = tableData.rows[0] ?? [];
    const same = expected.firstRow.every((v, i) => String(got[i]) === String(v));
    if (!same) {
      return {
        passed: false,
        feedback: `${
          expected.rowCount > 1
            ? "O número de linhas está certo, mas a primeira não é a esperada (confira o filtro e a ordem)."
            : "Os valores calculados não batem (confira o filtro e as funções)."
        }
Primeira linha esperada: ${expected.firstRow.join(", ")}
Obtida: ${got.join(", ")}`,
        xpEarned: 0,
      };
    }
  }

  return {
    passed: true,
    feedback: `Perfeito! +${mission.xpReward} XP conquistados!`,
    xpEarned: mission.xpReward,
  };
}

/** O que a missão espera do gráfico (expectedOutput em JSON). Campos ausentes não são conferidos. */
interface ChartExpectation {
  kind?: "bar" | "line";
  /** nº de barras ou de pontos da linha */
  count?: number;
  /** alturas das barras / valores da linha, na ordem */
  values?: number[];
  /** texto exato do título, ou true = só precisa ter título */
  title?: string | boolean;
  xlabel?: string | boolean;
  ylabel?: string | boolean;
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function validateChart(
  chartBase64: string | undefined,
  meta: ChartMeta | undefined,
  mission: Mission
): ValidationResult {
  const fail = (feedback: string): ValidationResult => ({ passed: false, feedback, xpEarned: 0 });
  if (!chartBase64) {
    return fail("Nenhum gráfico apareceu.\n\nConfira se você chamou plt.bar(...) ou plt.plot(...) com os dados — e se não apagou o gráfico com plt.close().");
  }
  let exp: ChartExpectation = {};
  try { exp = mission.expectedOutput ? JSON.parse(mission.expectedOutput) : {}; } catch { /* sem expectativa: basta existir */ }

  if (meta) {
    const bars = meta.bars;
    const line = meta.lines[0];
    if (exp.kind === "bar" && !bars.length) {
      return fail(meta.lines.length
        ? "Saiu um gráfico de LINHA, mas a missão pede BARRAS.\n\nTroque plt.plot(...) por plt.bar(...)."
        : "O gráfico não tem barras. Use plt.bar(nomes, valores).");
    }
    if (exp.kind === "line" && !line) {
      return fail(bars.length
        ? "Saiu um gráfico de BARRAS, mas a missão pede uma LINHA.\n\nTroque plt.bar(...) por plt.plot(...)."
        : "O gráfico não tem linha. Use plt.plot(x, y).");
    }
    if (exp.kind === "line" && bars.length) {
      return fail("A missão pede só a LINHA, mas o gráfico também tem barras.\n\nApague o plt.bar(...) e deixe só o plt.plot(...).");
    }
    if (exp.kind === "bar" && meta.lines.length) {
      return fail("A missão pede só as BARRAS, mas o gráfico também tem uma linha.\n\nApague o plt.plot(...) e deixe só o plt.bar(...).");
    }
    const got = exp.kind === "line" ? line ?? [] : bars;
    const what = exp.kind === "line" ? "pontos na linha" : "barras";
    if (exp.count !== undefined && got.length !== exp.count) {
      return fail(`O gráfico tem ${got.length} ${what}, mas eram para ser ${exp.count}.\n\nConfira se passou todos os dados (e só eles).`);
    }
    if (exp.values && exp.values.some((v, i) => got[i] !== v)) {
      return fail(`Os valores do gráfico não batem.\n\nEsperado: ${exp.values.join(", ")}\nNo seu gráfico: ${got.map((v) => v ?? "?").join(", ")}\n\nConfira a ordem das listas e se os nomes e os valores não foram trocados.`);
    }
    const checkText = (label: string, wanted: string | boolean | undefined, have: string, how: string) => {
      if (wanted === undefined || wanted === false) return null;
      if (!have.trim()) return `O gráfico está sem ${label}.\n\nUse ${how}.`;
      if (typeof wanted === "string" && !sameText(have, wanted)) return `O ${label} precisa ser "${wanted}", mas está "${have}".`;
      return null;
    };
    const textErr =
      checkText("título", exp.title, meta.title, "plt.title(\"...\")") ??
      checkText("nome do eixo de baixo (x)", exp.xlabel, meta.xlabel, "plt.xlabel(\"...\")") ??
      checkText("nome do eixo do lado (y)", exp.ylabel, meta.ylabel, "plt.ylabel(\"...\")");
    if (textErr) return fail(textErr);
  }

  return {
    passed: true,
    feedback: `Gráfico perfeito! +${mission.xpReward} XP conquistados!`,
    xpEarned: mission.xpReward,
  };
}

/** Primeiro padrão obrigatório que falta no código (ou null se todos aparecem) */
function missingCode(code: string, mission: Mission): string | null {
  // ignora comentários para o aluno não "passar" só escrevendo o padrão num comentário
  const clean = code.split("\n").map((l) => l.replace(/#.*$|--.*$/, "")).join("\n");
  const miss = mission.requiredCode?.find((r) => !new RegExp(r.pattern, r.flags).test(clean));
  return miss ? miss.hint : null;
}

export function validateOutput(
  result: RunResult,
  mission: Mission,
  code = ""
): ValidationResult {
  const base = validateResult(result, mission, code);
  if (!base.passed) return base;
  const hint = missingCode(code, mission);
  if (hint) {
    return {
      passed: false,
      feedback: `A saída está certa, mas o feitiço ainda não foi escrito do jeito pedido.

Dica: ${hint}`,
      xpEarned: 0,
    };
  }
  return base;
}

function validateResult(
  result: RunResult,
  mission: Mission,
  code: string
): ValidationResult {
  if (mission.validationType === "narrative") {
    return { passed: true, feedback: "Missão concluída!", xpEarned: mission.xpReward };
  }

  if (!result.success) {
    const err = explainError(result.stderr, errorContext(mission, code));
    const plain = (t: string) => t.replace(/`/g, "");
    return {
      passed: false,
      feedback: `O feitiço quebrou antes de terminar.

🔮 ${plain(err.title)}${err.line ? ` (linha ${err.line})` : ""}
${plain(err.explain)}${err.fix ? `\n\nComo consertar: ${plain(err.fix)}` : ""}

A explicação completa e a mensagem original estão no painel Saída.`,
      xpEarned: 0,
    };
  }

  switch (mission.validationType) {
    case "exact":
      return validateExact(result.stdout, mission);
    case "table":
      return validateTable(result.tableData, mission);
    case "chart":
      return validateChart(result.chartBase64, result.chartMeta, mission);
    case "contains": {
      const passed = normalize(result.stdout).includes(normalize(mission.expectedOutput));
      return {
        passed,
        feedback: passed
          ? `Perfeito! +${mission.xpReward} XP conquistados!`
          : `A saída não contém o esperado.`,
        xpEarned: passed ? mission.xpReward : 0,
      };
    }
    default:
      return { passed: true, feedback: "Missão concluída!", xpEarned: mission.xpReward };
  }
}
