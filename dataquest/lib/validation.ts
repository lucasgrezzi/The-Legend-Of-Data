import type { Mission, RunResult, ValidationResult, TableData } from "@/types";

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
        feedback: `As linhas certas vieram, mas fora de ordem.
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

function validateChart(
  chartBase64: string | undefined,
  mission: Mission
): ValidationResult {
  const passed = !!chartBase64;
  return {
    passed,
    feedback: passed
      ? `Gráfico gerado! +${mission.xpReward} XP conquistados!`
      : "Nenhum gráfico foi gerado. Use matplotlib para criar um gráfico.",
    xpEarned: passed ? mission.xpReward : 0,
  };
}

/** Primeiro padrão obrigatório que falta no código (ou null se todos aparecem) */
function missingCode(code: string, mission: Mission): string | null {
  // ignora comentários para o aluno não "passar" só escrevendo o padrão num comentário
  const clean = code.split("\n").map((l) => l.replace(/#.*$|--.*$/, "")).join("\n");
  const miss = mission.requiredCode?.find((r) => !new RegExp(r.pattern).test(clean));
  return miss ? miss.hint : null;
}

export function validateOutput(
  result: RunResult,
  mission: Mission,
  code = ""
): ValidationResult {
  const base = validateResult(result, mission);
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
  mission: Mission
): ValidationResult {
  if (mission.validationType === "narrative") {
    return { passed: true, feedback: "Missão concluída!", xpEarned: mission.xpReward };
  }

  if (!result.success) {
    return {
      passed: false,
      feedback: `Erro de execução:\n${result.stderr}`,
      xpEarned: 0,
    };
  }

  switch (mission.validationType) {
    case "exact":
      return validateExact(result.stdout, mission);
    case "table":
      return validateTable(result.tableData, mission);
    case "chart":
      return validateChart(result.chartBase64, mission);
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
