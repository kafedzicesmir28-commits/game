export type GamePhase = "loading" | "opening" | "map" | "location" | "treasure";

export interface GameSaveData {
  version: number;
  hasStarted: boolean;
  unlockedLocations: number[];
  completedLocations: number[];
  collectedKeys: string[];
  achievements: string[];
  characterPosition: { x: number; y: number };
  currentLocationId: number | null;
  treasureOpened: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export const SAVE_VERSION = 1;
export const SAVE_KEY = "treasure-of-our-story-save";

export const defaultSave: GameSaveData = {
  version: SAVE_VERSION,
  hasStarted: false,
  unlockedLocations: [1],
  completedLocations: [],
  collectedKeys: [],
  achievements: [],
  characterPosition: { x: 18, y: 78 },
  currentLocationId: null,
  treasureOpened: false,
  musicEnabled: true,
  sfxEnabled: true,
};

export function loadSave(): GameSaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...defaultSave };
    const parsed = JSON.parse(raw) as GameSaveData;
    if (parsed.version !== SAVE_VERSION) return { ...defaultSave, ...parsed, version: SAVE_VERSION };
    return { ...defaultSave, ...parsed };
  } catch {
    return { ...defaultSave };
  }
}

export function persistSave(data: GameSaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function completionPercentage(save: GameSaveData, totalLocations: number): number {
  return Math.round((save.completedLocations.length / totalLocations) * 100);
}
