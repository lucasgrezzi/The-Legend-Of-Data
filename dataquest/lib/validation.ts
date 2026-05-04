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
      : `Output incorreto.\n\nEsperado:\n${mission.expectedOutput}\n\nObtido:\n${stdout}`,
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
    return { passed: false, feedback: "Configuracao de missao invalida.", xpEarned: 0 };
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
      feedback: `Numero de linhas incorreto.\nEsperado: ${expected.rowCount}\nObtido: ${tableData.rows.length}`,
      xpEarned: 0,
    };
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
      ? `Grafico gerado! +${mission.xpReward} XP conquistados!`
      : "Nenhum grafico foi gerado. Use matplotlib para criar um grafico.",
    xpEarned: passed ? mission.xpReward : 0,
  };
}

export function validateOutput(
  result: RunResult,
  mission: Mission
): ValidationResult {
  if (mission.validationType === "narrative") {
    return { passed: true, feedback: "Missao concluida!", xpEarned: mission.xpReward };
  }

  if (!result.success) {
    return {
      passed: false,
      feedback: `Erro de execucao:\n${result.stderr}`,
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
          : `Output nao contem o esperado.`,
        xpEarned: passed ? mission.xpReward : 0,
      };
    }
    default:
      return { passed: true, feedback: "Missao concluida!", xpEarned: mission.xpReward };
  }
}
