import { motion } from "framer-motion";
import { useMemo } from "react";

export function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
        size: 2 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/30"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, bottom: -10 }}
          animate={{ y: [0, -(typeof window !== "undefined" ? window.innerHeight : 800) - 20], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}
