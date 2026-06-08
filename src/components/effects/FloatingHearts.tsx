import { motion } from "framer-motion";
import { useMemo } from "react";

export function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 3,
        scale: 0.5 + Math.random() * 0.8,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute text-rose-300/40"
          style={{ left: `${h.x}%`, fontSize: `${h.scale}rem`, bottom: -20 }}
          animate={{ y: [0, -(typeof window !== "undefined" ? window.innerHeight : 800)], x: [0, Math.sin(h.id) * 30], rotate: [0, 15] }}
          transition={{ duration: h.duration, repeat: Infinity, delay: h.delay, ease: "easeInOut" }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  );
}
