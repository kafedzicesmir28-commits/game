import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import type { HeartRunCollectible, HeartRunConfig, HeartRunObstacle } from "@/types/heartRun";

interface Entity {
  id: number;
  lane: number;
  y: number;
  kind: "obstacle" | "collectible";
  data: HeartRunObstacle | HeartRunCollectible;
}

interface HeartRunProps {
  config: HeartRunConfig;
  onComplete: () => void;
  onHit?: () => void;
  onCollect?: () => void;
}

type GamePhase = "ready" | "playing" | "won";

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export function HeartRun({ config, onComplete, onHit, onCollect }: HeartRunProps) {
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [playerLane, setPlayerLane] = useState(config.playerStartLane);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const entityId = useRef(0);
  const lastObstacleSpawn = useRef(0);
  const lastCollectibleSpawn = useRef(0);
  const invincibleUntil = useRef(0);
  const rafRef = useRef(0);
  const startTime = useRef(0);
  const touchStartX = useRef(0);
  const playerLaneRef = useRef(playerLane);
  playerLaneRef.current = playerLane;

  const progress = Math.min(1, elapsed / config.timerDurationSeconds);
  const scrollSpeed = Math.min(
    config.maxScrollSpeed,
    config.baseScrollSpeed + elapsed * config.speedIncreasePerSecond,
  );

  const moveLane = useCallback(
    (dir: -1 | 1) => {
      setPlayerLane((l) => Math.max(0, Math.min(config.laneCount - 1, l + dir)));
    },
    [config.laneCount],
  );

  const spawnBurst = (lane: number, y: number, emoji: string) => {
    const id = ++entityId.current;
    setParticles((p) => [...p.slice(-12), { id, x: lane, y, emoji }]);
    setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 600);
  };

  const startGame = () => {
    setPhase("playing");
    setEntities([]);
    setElapsed(0);
    setScore(0);
    entityId.current = 0;
    lastObstacleSpawn.current = 0;
    lastCollectibleSpawn.current = 0;
    startTime.current = performance.now();
  };

  useEffect(() => {
    if (phase !== "playing") return;

    const loop = (now: number) => {
      const dt = 1 / 60;
      const seconds = (now - startTime.current) / 1000;
      setElapsed(seconds);

      if (seconds >= config.timerDurationSeconds) {
        setPhase("won");
        return;
      }

      const obstacleInterval = Math.max(
        config.obstacleSpawnIntervalMinMs,
        config.obstacleSpawnIntervalMs - seconds * 4,
      );

      if (now - lastObstacleSpawn.current > obstacleInterval) {
        lastObstacleSpawn.current = now;
        const lane = Math.floor(Math.random() * config.laneCount);
        setEntities((e) => [
          ...e,
          {
            id: ++entityId.current,
            lane,
            y: -0.12,
            kind: "obstacle",
            data: pickWeighted(config.obstacles),
          },
        ]);
      }

      if (now - lastCollectibleSpawn.current > config.collectibleSpawnIntervalMs) {
        lastCollectibleSpawn.current = now;
        const lane = Math.floor(Math.random() * config.laneCount);
        setEntities((e) => [
          ...e,
          {
            id: ++entityId.current,
            lane,
            y: -0.12,
            kind: "collectible",
            data: pickWeighted(config.collectibles),
          },
        ]);
      }

      setEntities((prev) => {
        const next: Entity[] = [];
        for (const ent of prev) {
          const newY = ent.y + (scrollSpeed / 600) * dt;
          if (newY > 1.15) continue;

          if (newY > 0.72 && newY < 0.92 && ent.lane === playerLaneRef.current) {
            if (ent.kind === "obstacle" && now > invincibleUntil.current) {
              onHit?.();
              setShaking(true);
              setTimeout(() => setShaking(false), config.hitShakeDurationMs);
              invincibleUntil.current = now + config.invincibilityMs;
              continue;
            }
            if (ent.kind === "collectible") {
              const col = ent.data as HeartRunCollectible;
              onCollect?.();
              setScore((s) => s + col.points);
              spawnBurst(ent.lane, ent.y, col.emoji);
              continue;
            }
          }
          next.push({ ...ent, y: newY });
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, scrollSpeed, config, onHit, onCollect]);

  useEffect(() => {
    if (phase === "won") {
      const t = setTimeout(onComplete, 2800);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (e.key === "ArrowLeft") moveLane(-1);
      if (e.key === "ArrowRight") moveLane(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, moveLane]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (phase !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) moveLane(dx > 0 ? 1 : -1);
  };

  const laneLeft = (lane: number) => `${((lane + 0.5) / config.laneCount) * 100}%`;

  if (phase === "ready") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-cream/80">{config.startPrompt}</p>
        <p className="text-xs text-lavender">← → ili prevuci lijevo/desno</p>
        <GameButton onClick={startGame} className="w-full">
          Kreni ❤️
        </GameButton>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs px-0.5">
        <span className="text-gold-warm font-bold font-display text-sm">
          {Math.max(0, Math.ceil(config.timerDurationSeconds - elapsed))}s
        </span>
        <span className="text-cream/60">{score} pts</span>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-400 to-gold-warm"
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      <motion.div
        animate={shaking ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.25 }}
        className="relative rounded-2xl overflow-hidden touch-none select-none w-full h-[clamp(240px,42dvh,340px)]"
        style={{ background: config.background }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, rgba(255,182,193,${config.particleOpacity}) 0%, transparent 60%)`,
          }}
        />

        {Array.from({ length: config.laneCount - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-white/10"
            style={{ left: `${((i + 1) / config.laneCount) * 100}%` }}
          />
        ))}

        {entities.map((ent) => (
          <motion.div
            key={ent.id}
            className="absolute -translate-x-1/2 text-2xl sm:text-3xl drop-shadow-lg pointer-events-none"
            style={{
              left: laneLeft(ent.lane),
              top: `${ent.y * 100}%`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {ent.data.emoji}
          </motion.div>
        ))}

        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute -translate-x-1/2 text-xl pointer-events-none"
            style={{ left: laneLeft(p.x), top: `${p.y * 100}%` }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -30, scale: 1.5 }}
          >
            {p.emoji}
          </motion.span>
        ))}

        <motion.div
          className="absolute -translate-x-1/2 text-4xl sm:text-5xl z-10 drop-shadow-xl"
          style={{ left: laneLeft(playerLane), bottom: "8%" }}
          animate={
            phase === "won"
              ? { y: -120, scale: 1.3, opacity: [1, 1, 0.9] }
              : { y: [0, -4, 0] }
          }
          transition={
            phase === "won"
              ? { duration: 2, ease: "easeOut" }
              : { duration: 1.2, repeat: Infinity }
          }
        >
          ❤️
        </motion.div>

        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: config.laneCount }).map((_, i) => (
            <div key={i} className="flex-1 h-full" />
          ))}
        </div>

        <AnimatePresence>
          {phase === "won" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none"
            >
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-display text-xl text-gold-warm font-bold text-center px-4"
              >
                {config.victoryMessage}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={() => moveLane(-1)}
          disabled={phase !== "playing"}
          className="touch-target col-span-1 cozy-card rounded-xl text-cream font-display font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          ← Lijevo
        </button>
        <button
          type="button"
          onClick={() => setPlayerLane(1)}
          disabled={phase !== "playing"}
          className="touch-target col-span-1 cozy-card rounded-xl text-cream/80 font-display text-xs disabled:opacity-40 active:scale-95 transition-transform"
        >
          Sredina
        </button>
        <button
          type="button"
          onClick={() => moveLane(1)}
          disabled={phase !== "playing"}
          className="touch-target col-span-1 cozy-card rounded-xl text-cream font-display font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          Desno →
        </button>
      </div>
    </div>
  );
}
