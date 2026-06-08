import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface HiddenHeartsProps {
  heartsToFind: number;
  onComplete: () => void;
}

export function HiddenHearts({ heartsToFind, onComplete }: HiddenHeartsProps) {
  const [found, setFound] = useState<Set<number>>(new Set());

  const hearts = useMemo(
    () =>
      Array.from({ length: heartsToFind }, (_, i) => ({
        id: i,
        x: 8 + Math.random() * 84,
        y: 15 + Math.random() * 70,
        size: 0.6 + Math.random() * 0.6,
      })),
    [heartsToFind],
  );

  const find = (id: number) => {
    const next = new Set(found);
    next.add(id);
    setFound(next);
    if (next.size >= heartsToFind) setTimeout(onComplete, 800);
  };

  return (
    <div className="relative min-h-[360px] cozy-card rounded-3xl overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(180deg, #4a2c6a 0%, #2d1b4e 50%, #1a0f2e 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
        <span className="text-6xl opacity-20">🏰</span>
      </div>
      <p className="relative z-10 text-center text-sm text-cream/70 pt-4">
        Pronađi skrivena srca u zamku — {found.size}/{heartsToFind}
      </p>
      {hearts.map(
        (h) =>
          !found.has(h.id) && (
            <motion.button
              key={h.id}
              className="absolute z-20 opacity-60 hover:opacity-100 transition-opacity"
              style={{ left: `${h.x}%`, top: `${h.y}%`, fontSize: `${h.size}rem` }}
              whileTap={{ scale: 1.5 }}
              onClick={() => find(h.id)}
            >
              ♥
            </motion.button>
          ),
      )}
      {found.size >= heartsToFind && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-0 right-0 text-center font-display text-gold-warm font-bold"
        >
          Sva srca pronađena! ✨
        </motion.p>
      )}
    </div>
  );
}
