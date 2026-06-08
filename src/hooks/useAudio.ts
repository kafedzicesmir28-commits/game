import { useCallback, useEffect, useRef } from "react";
import { content } from "@/types/game";

type SfxName = "unlock" | "keyCollected" | "correct" | "treasure" | "wrong";

export function useAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<Partial<Record<SfxName, HTMLAudioElement>>>({});

  useEffect(() => {
    const music = new Audio(content.audio.backgroundMusic);
    music.loop = true;
    music.volume = 0.35;
    musicRef.current = music;

    const sfxNames: SfxName[] = ["unlock", "keyCollected", "correct", "treasure", "wrong"];
    sfxNames.forEach((name) => {
      const key = name === "keyCollected" ? "keyCollected" : name;
      const src = content.audio[key];
      if (src) {
        const audio = new Audio(src);
        audio.volume = 0.6;
        sfxRefs.current[name] = audio;
      }
    });

    return () => {
      music.pause();
      musicRef.current = null;
      sfxRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    if (musicEnabled) {
      music.play().catch(() => {});
    } else {
      music.pause();
    }
  }, [musicEnabled]);

  const playSfx = useCallback(
    (name: SfxName) => {
      if (!sfxEnabled) return;
      const audio = sfxRefs.current[name];
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    [sfxEnabled],
  );

  return { playSfx };
}
