export type MissionType = "narrative" | "python" | "sql" | "pandas" | "dataviz";
export type Track = "python" | "sql" | "pandas" | "dataviz";
export type ValidationMode = "exact" | "contains" | "table" | "chart" | "narrative";

export interface DataFilePreview {
  filename: string;
  headers: string[];
  rows: string[][];
  rawCsv: string;
}

export interface UnlockCondition {
  requiredMissionIds?: number[];
  requiredXP?: number;
}

export interface Mission {
  id: number;
  track: Track;
  type: MissionType;
  chapterTitle: string;
  missionTitle: string;
  narrative: string;
  theory: string;
  instructions: string;
  codeTemplate: string;
  editorLanguage: "python" | "sql";
  expectedOutput: string;
  validationType: ValidationMode;
  xpReward: number;
  dataFile?: DataFilePreview;
  unlockCondition?: UnlockCondition;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface RunResult {
  stdout: string;
  stderr: string;
  tableData?: TableData;
  chartBase64?: string;
  success: boolean;
  executionTimeMs: number;
}

export interface ValidationResult {
  passed: boolean;
  feedback: string;
  xpEarned: number;
}

export type EngineStatus = "idle" | "loading" | "ready" | "running" | "error";

export interface UserProgress {
  totalXP: number;
  completedMissionIds: number[];
  unlockedMissionIds: number[];
  currentMissionId: number;
  level: number;
  levelLabel: string;
}
