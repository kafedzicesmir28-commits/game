import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { DetectiveHotspot } from "@/types/game";

interface MemoryDetectiveProps {
  imageSrc: string;
  hotspots: DetectiveHotspot[];
  wrongClickMessage: string;
  onComplete: () => void;
}

export function MemoryDetective({
  imageSrc,
  hotspots,
  wrongClickMessage,
  onComplete,
}: MemoryDetectiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrongHint, setWrongHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const total = hotspots.length;

  const handleTapAt = useCallback(
    (clientX: number, clientY: number) => {
      if (completed) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      const hit = hotspots.find((h) => {
        if (found.has(h.id)) return false;
        const dx = x - h.x;
        const dy = y - h.y;
        return Math.sqrt(dx * dx + dy * dy) <= h.radius;
      });

      if (hit) {
        const next = new Set(found);
        next.add(hit.id);
        setFound(next);
        setWrongHint(null);
        if (next.size >= total) {
          setCompleted(true);
          setTimeout(onComplete, 2200);
        }
      } else {
        setWrongHint(wrongClickMessage);
        setTimeout(() => setWrongHint(null), 1800);
      }
    },
    [completed, found, hotspots, onComplete, total, wrongClickMessage],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <p className="text-cream/70">Pronađi skrivene tragove u uspomeni</p>
        <p className="text-gold-warm font-display font-bold">
          {found.size}/{total}
        </p>
      </div>

      <div className={`relative ${zoomed ? "overflow-auto max-h-[50dvh]" : ""}`}>
        <motion.div
          ref={containerRef}
          onClick={(e) => handleTapAt(e.clientX, e.clientY)}
          onTouchEnd={(e) => {
            const touch = e.changedTouches[0];
            if (touch) handleTapAt(touch.clientX, touch.clientY);
          }}
          className={`relative rounded-2xl overflow-hidden cursor-crosshair select-none ${
            zoomed ? "scale-150 origin-top-left min-w-[150%]" : ""
          }`}
          animate={completed ? { boxShadow: "0 0 40px rgba(255, 209, 102, 0.8)" } : {}}
          transition={{ duration: 1.2 }}
        >
          <img src={imageSrc} alt="Uspomena" className="w-full block" draggable={false} />

          {hotspots.map((h) => {
            const isFound = found.has(h.id);
            if (!isFound && !completed) return null;
            return (
              <motion.div
                key={h.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <div className="relative flex flex-col items-center">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl drop-shadow-lg"
                  >
                    {h.icon}
                  </motion.span>
                  <span className="text-[10px] text-gold-warm font-medium mt-0.5 bg-black/40 px-1.5 rounded">
                    {h.label}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gold-warm/30 blur-md scale-150 -z-10" />
                </div>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-amber-300/40 via-gold-warm/30 to-rose-400/20 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </motion.div>

        <button
          type="button"
          onClick={() => setZoomed((z) => !z)}
          className="absolute bottom-2 right-2 touch-target text-sm bg-black/60 text-cream px-3 py-2 rounded-xl z-10"
        >
          {zoomed ? "🔍−" : "🔍+"}
        </button>
      </div>

      <AnimatePresence>
        {wrongHint && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-rose-200/80"
          >
            {wrongHint}
          </motion.p>
        )}
      </AnimatePresence>

      {found.size > 0 && found.size < total && (
        <div className="flex flex-wrap gap-2 justify-center">
          {hotspots
            .filter((h) => found.has(h.id))
            .map((h) => (
              <span
                key={h.id}
                className="text-xs cozy-card px-2 py-1 rounded-full text-gold-warm"
              >
                {h.icon} {h.label}
              </span>
            ))}
        </div>
      )}

      {completed && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center font-display text-gold-warm font-bold"
        >
          Uspomena otključana ✨
        </motion.p>
      )}
    </div>
  );
}
