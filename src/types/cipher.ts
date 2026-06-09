import cipherLevel from "@/data/cipherLevel.json";

export type CipherType = "caesar" | "reverse-words" | "symbol-substitution" | "mixed";

export type CipherDifficulty = "easy" | "medium" | "hard";

export interface CipherRule {
  type: CipherType;
  shift?: number;
  map?: Record<string, string>;
}

export interface CipherStage {
  id: string;
  difficulty: CipherDifficulty;
  cipherType: CipherType;
  shift?: number;
  map?: Record<string, string>;
  rules?: CipherRule[];
  encryptedText: string;
  solution: string;
  hints: string[];
  successMessage?: string;
}

export interface CipherLevelConfig {
  locationId: number;
  completionMessage: string;
  wrongAttemptMessage: string;
  stages: CipherStage[];
}

export const cipherConfig = cipherLevel as CipherLevelConfig;

export function getCipherLevel(locationId: number): CipherLevelConfig | undefined {
  return cipherConfig.locationId === locationId ? cipherConfig : undefined;
}
