import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/types/game";
import {
  completionPercentage,
  defaultSave,
  loadSave,
  persistSave,
  type GamePhase,
  type GameSaveData,
} from "@/types/save";

export interface AchievementToast {
  id: string;
  title: string;
  description: string;
}

export function useGameState() {
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [save, setSave] = useState<GameSaveData>(() => loadSave());
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);
  const [achievement, setAchievement] = useState<AchievementToast | null>(null);
  const achievementTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase(save.hasStarted ? "map" : "opening");
    }, 1800);
    return () => clearTimeout(timer);
  }, [save.hasStarted]);

  const updateSave = useCallback((patch: Partial<GameSaveData>) => {
    setSave((prev) => {
      const next = { ...prev, ...patch };
      persistSave(next);
      return next;
    });
  }, []);

  const showAchievement = useCallback((id: string) => {
    const def = content.achievements.find((a) => a.id === id);
    if (!def) return;
    setSave((prev) => {
      if (prev.achievements.includes(id)) return prev;
      const next = { ...prev, achievements: [...prev.achievements, id] };
      persistSave(next);
      return next;
    });
    setAchievement({ id: def.id, title: def.title, description: def.description });
    if (achievementTimer.current) clearTimeout(achievementTimer.current);
    achievementTimer.current = setTimeout(() => setAchievement(null), 3500);
  }, []);

  const startAdventure = useCallback(() => {
    updateSave({ hasStarted: true });
    setPhase("map");
  }, [updateSave]);

  const moveCharacter = useCallback(
    (x: number, y: number) => {
      updateSave({ characterPosition: { x, y } });
    },
    [updateSave],
  );

  const openLocation = useCallback(
    (id: number) => {
      if (!save.unlockedLocations.includes(id)) return;
      setActiveLocationId(id);
      setPhase("location");
    },
    [save.unlockedLocations],
  );

  const closeLocation = useCallback(() => {
    setActiveLocationId(null);
    setPhase("map");
  }, []);

  const completeLocation = useCallback(
    (locationId: number, keyName: string) => {
      const nextId = locationId + 1;
      const total = content.locations.length;

      setSave((prev) => {
        const completed = prev.completedLocations.includes(locationId)
          ? prev.completedLocations
          : [...prev.completedLocations, locationId];
        const keys = prev.collectedKeys.includes(keyName)
          ? prev.collectedKeys
          : [...prev.collectedKeys, keyName];
        const unlocked =
          nextId <= total && !prev.unlockedLocations.includes(nextId)
            ? [...prev.unlockedLocations, nextId]
            : prev.unlockedLocations;

        const next: GameSaveData = {
          ...prev,
          completedLocations: completed,
          collectedKeys: keys,
          unlockedLocations: unlocked,
        };
        persistSave(next);
        return next;
      });

      if (locationId === 1) showAchievement("first-key");
      if (locationId === 4) showAchievement("boss-slayer");
      if (locationId === 5) showAchievement("halfway");
      if (locationId === 7) showAchievement("heart-collector");
    },
    [showAchievement],
  );

  const openTreasure = useCallback(() => {
    updateSave({ treasureOpened: true });
    showAchievement("treasure-found");
    setPhase("treasure");
  }, [showAchievement, updateSave]);

  const resetProgress = useCallback(() => {
    persistSave(defaultSave);
    setSave(defaultSave);
    setActiveLocationId(null);
    setPhase("opening");
  }, []);

  const toggleMusic = useCallback(() => {
    updateSave({ musicEnabled: !save.musicEnabled });
  }, [save.musicEnabled, updateSave]);

  const toggleSfx = useCallback(() => {
    updateSave({ sfxEnabled: !save.sfxEnabled });
  }, [save.sfxEnabled, updateSave]);

  const progress = completionPercentage(save, content.locations.length);

  return {
    phase,
    save,
    activeLocationId,
    achievement,
    progress,
    startAdventure,
    moveCharacter,
    openLocation,
    closeLocation,
    completeLocation,
    openTreasure,
    resetProgress,
    toggleMusic,
    toggleSfx,
    setPhase,
  };
}

export type GameState = ReturnType<typeof useGameState>;
