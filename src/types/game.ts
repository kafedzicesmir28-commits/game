import gameContent from "@/config/gameContent.json";

export type ChallengeType =
  | "question"
  | "multiple-choice"
  | "boss"
  | "puzzle"
  | "code"
  | "hearts"
  | "future"
  | "hidden-hearts"
  | "treasure"
  | "memory-detective"
  | "conversation-reconstruct"
  | "image-jigsaw"
  | "cipher-decrypt"
  | "heart-run";

export interface MultipleChoiceOption {
  text: string;
  correct: boolean;
}

export interface BossQuestion {
  question: string;
  answers: string[];
  correctAnswer: number;
}

export interface FutureQuestion {
  question: string;
  answers: string[];
  correctAnswer: number;
}

export interface DetectiveHotspot {
  id: string;
  x: number;
  y: number;
  radius: number;
  icon: string;
  label: string;
}

export interface ConversationMessage {
  id: string;
  text: string;
  order: number;
}

export interface LocationConfig {
  id: number;
  slug: string;
  title: string;
  mapLabel: string;
  story: string;
  hint: string;
  challengeType: ChallengeType;
  question?: string;
  answers?: string[];
  correctAnswer?: number;
  options?: MultipleChoiceOption[];
  bossName?: string;
  bossHp?: number;
  damagePerHit?: number;
  questions?: BossQuestion[] | FutureQuestion[];
  photosFolder?: string;
  photoOrder?: string[];
  secretCode?: string;
  codeHint?: string;
  messages?: string[];
  heartsToCollect?: number;
  heartsToFind?: number;
  keyName: string;
  /** Memory Detective (level 1) */
  detectivePhoto?: string;
  detectiveHotspots?: DetectiveHotspot[];
  wrongClickMessage?: string;
  /** Conversation Reconstruct (level 3) */
  conversationMessages?: ConversationMessage[];
  conversationHint?: string;
  /** Image Jigsaw (level 8) */
  jigsawPhoto?: string;
  jigsawGrid?: number;
  jigsawMessage?: string;
}

export interface MapPosition {
  id: number;
  x: number;
  y: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface GameContent {
  meta: {
    title: string;
    playerName: string;
    finalMessage: string;
  };
  opening: {
    lines: string[];
    startButton: string;
  };
  treasure: {
    title: string;
    lines: string[];
    customMessageLabel: string;
  };
  locations: LocationConfig[];
  achievements: Achievement[];
  audio: Record<string, string>;
  mapPositions: MapPosition[];
}

export const content = gameContent as GameContent;

export function getLocation(id: number): LocationConfig | undefined {
  return content.locations.find((l) => l.id === id);
}

export function getMapPosition(id: number): MapPosition | undefined {
  return content.mapPositions.find((p) => p.id === id);
}

export function photoUrl(folder: string, filename: string): string {
  return `/photos/${folder}/${filename}`;
}

export function getPhotosFromFolder(folder: string, filenames: string[]): string[] {
  return filenames.map((f) => photoUrl(folder, f));
}
