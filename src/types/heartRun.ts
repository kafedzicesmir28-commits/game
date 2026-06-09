import heartRunConfig from "@/data/heartRunConfig.json";

export interface HeartRunObstacle {
  id: string;
  emoji: string;
  label: string;
  weight: number;
}

export interface HeartRunCollectible {
  id: string;
  emoji: string;
  label: string;
  points: number;
  weight: number;
  heal?: boolean;
}

export interface HeartRunConfig {
  locationId: number;
  timerDurationSeconds: number;
  laneCount: number;
  playerStartLane: number;
  lives: number;
  failOnZeroLives?: boolean;
  invincibilityMs: number;
  baseScrollSpeed: number;
  speedIncreasePerSecond: number;
  maxScrollSpeed: number;
  obstacleSpawnIntervalMs: number;
  obstacleSpawnIntervalMinMs: number;
  collectibleSpawnIntervalMs: number;
  hitShakeDurationMs: number;
  victoryMessage: string;
  failureMessage: string;
  startPrompt: string;
  background: string;
  particleOpacity: number;
  obstacles: HeartRunObstacle[];
  collectibles: HeartRunCollectible[];
}

export const heartRun = heartRunConfig as HeartRunConfig;

export function getHeartRunConfig(locationId: number): HeartRunConfig | undefined {
  return heartRun.locationId === locationId ? heartRun : undefined;
}
