import { motion } from "framer-motion";

const clouds = [
  { id: 1, top: "8%", width: 120, delay: 0, duration: 28 },
  { id: 2, top: "18%", width: 90, delay: 5, duration: 35 },
  { id: 3, top: "5%", width: 150, delay: 12, duration: 40 },
];

export function AnimatedClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute opacity-40"
          style={{ top: c.top, width: c.width }}
          initial={{ x: "-30%" }}
          animate={{ x: "110vw" }}
          transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: "linear" }}
        >
          <svg viewBox="0 0 120 60" className="w-full fill-white/80">
            <ellipse cx="40" cy="35" rx="35" ry="20" />
            <ellipse cx="70" cy="30" rx="40" ry="25" />
            <ellipse cx="95" cy="38" rx="25" ry="18" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
