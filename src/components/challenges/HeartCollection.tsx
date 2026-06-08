import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface HeartCollectionProps {
  photos: string[];
  messages: string[];
  heartsToCollect: number;
  onComplete: () => void;
}

export function HeartCollection({
  photos,
  messages,
  heartsToCollect,
  onComplete,
}: HeartCollectionProps) {
  const [collected, setCollected] = useState<Set<number>>(new Set());

  const heartPositions = useMemo(
    () =>
      Array.from({ length: heartsToCollect }, (_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 60,
        delay: i * 0.3,
      })),
    [heartsToCollect],
  );

  const collect = (id: number) => {
    const next = new Set(collected);
    next.add(id);
    setCollected(next);
    if (next.size >= heartsToCollect) setTimeout(onComplete, 600);
  };

  return (
    <div className="space-y-4 relative min-h-[320px]">
      <div className="grid grid-cols-2 gap-2">
        {photos.slice(0, 4).map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="rounded-xl h-24 object-cover cozy-card p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/200x150/2d1b4e/ffb4c2?text=Memory+${i + 1}`;
            }}
          />
        ))}
      </div>
      {messages.slice(0, 3).map((msg, i) => (
        <p key={i} className="text-xs text-cream/80 italic text-center">
          &ldquo;{msg}&rdquo;
        </p>
      ))}
      <p className="text-center text-sm text-gold-warm">
        Srca: {collected.size}/{heartsToCollect}
      </p>
      {heartPositions.map(
        (h) =>
          !collected.has(h.id) && (
            <motion.button
              key={h.id}
              className="absolute text-2xl z-10"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              animate={{ y: [0, -8, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: h.delay }}
              onClick={() => collect(h.id)}
            >
              💖
            </motion.button>
          ),
      )}
    </div>
  );
}
