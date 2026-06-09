import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import { AnimatedClouds } from "@/components/effects/AnimatedClouds";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { content, getLocation, getMapPosition } from "@/types/game";
import type { GameSaveData } from "@/types/save";

interface WorldMapProps {
  save: GameSaveData;
  progress: number;
  onMove: (x: number, y: number) => void;
  onSelectLocation: (id: number) => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export function WorldMap({
  save,
  progress,
  onMove,
  onSelectLocation,
  onToggleMusic,
  onToggleSfx,
  musicEnabled,
  sfxEnabled,
}: WorldMapProps) {
  const positions = content.mapPositions;
  const nextObjective = useMemo(() => {
    const incomplete = content.locations.find(
      (l) => save.unlockedLocations.includes(l.id) && !save.completedLocations.includes(l.id),
    );
    return incomplete?.id ?? null;
  }, [save.unlockedLocations, save.completedLocations]);

  const pathD = useMemo(() => {
    const pts = positions.map((p) => `${p.x},${p.y}`).join(" L ");
    return `M ${pts}`;
  }, [positions]);

  const handleLocationTap = useCallback(
    (id: number) => {
      const pos = getMapPosition(id);
      if (!pos) return;
      onMove(pos.x, pos.y);
      setTimeout(() => {
        if (save.unlockedLocations.includes(id)) onSelectLocation(id);
      }, 600);
    },
    [onMove, onSelectLocation, save.unlockedLocations],
  );

  return (
    <div className="fixed inset-0 flex flex-col game-gradient-bg safe-x">
      <header className="relative z-20 pt-3 pb-2 shrink-0 safe-top">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-sm sm:text-base font-bold text-gold-warm truncate">
            {content.meta.title}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={onToggleMusic}
              className="text-lg p-1.5 rounded-xl bg-white/10"
              aria-label="Toggle music"
            >
              {musicEnabled ? "🎵" : "🔇"}
            </button>
            <button
              onClick={onToggleSfx}
              className="text-lg p-1.5 rounded-xl bg-white/10"
              aria-label="Toggle sound effects"
            >
              {sfxEnabled ? "🔔" : "🔕"}
            </button>
          </div>
        </div>
        <ProgressBar value={progress} />
        <p className="text-xs text-cream/50 mt-2 text-center">
          Sakupljeni ključevi: {save.collectedKeys.length}/{content.locations.length - 1}
        </p>
      </header>

      <div className="flex-1 map-scroll relative safe-bottom">
        <div className="relative w-full min-h-full min-h-[min(680px,calc(100dvh-9rem))] sm:min-w-[600px] sm:min-h-[700px] mx-auto">
          <div
            className="absolute inset-0 rounded-none"
            style={{
              background:
                "linear-gradient(180deg, #87c4f8 0%, #a8daf8 25%, #7ec850 55%, #5a9e3a 100%)",
            }}
          />
          <AnimatedClouds />

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,209,102,0.35)"
              strokeWidth="0.4"
              strokeDasharray="1 1"
            />
          </svg>

          {positions.map((pos) => {
            const loc = getLocation(pos.id);
            if (!loc) return null;
            const unlocked = save.unlockedLocations.includes(pos.id);
            const completed = save.completedLocations.includes(pos.id);
            const isObjective = nextObjective === pos.id;

            return (
              <motion.button
                key={pos.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleLocationTap(pos.id)}
                whileTap={{ scale: 0.92 }}
                animate={isObjective ? { scale: [1, 1.08, 1] } : {}}
                transition={isObjective ? { duration: 1.5, repeat: Infinity } : {}}
              >
                <div
                  className={`relative flex flex-col items-center ${completed ? "glow-pulse" : ""}`}
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg border-2 touch-target ${
                      completed
                        ? "bg-amber-300/90 border-amber-200 text-deep-purple"
                        : unlocked
                          ? "bg-rose-400/90 border-rose-200 text-white"
                          : "bg-gray-600/80 border-gray-500 text-gray-300"
                    } ${isObjective ? "ring-2 ring-gold-warm ring-offset-2 ring-offset-transparent" : ""}`}
                  >
                    {completed ? "⭐" : unlocked ? "📍" : "🔒"}
                  </div>
                  {!unlocked && (
                    <motion.div
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 text-xs"
                    >
                      🔒
                    </motion.div>
                  )}
                  <span
                    className={`mt-1 text-[9px] sm:text-[10px] font-display font-bold text-center max-w-[72px] leading-tight drop-shadow-md ${
                      unlocked ? "text-white" : "text-white/50"
                    }`}
                  >
                    {loc.mapLabel}
                  </span>
                </div>
              </motion.button>
            );
          })}

          <motion.div
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full"
            animate={{
              left: `${save.characterPosition.x}%`,
              top: `${save.characterPosition.y}%`,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-2xl sm:text-3xl drop-shadow-lg"
            >
              🧚
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
