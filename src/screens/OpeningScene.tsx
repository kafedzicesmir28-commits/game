import { motion } from "framer-motion";
import { FloatingHearts } from "@/components/effects/FloatingHearts";
import { FloatingParticles } from "@/components/effects/FloatingParticles";
import { GameButton } from "@/components/ui/GameButton";
import { content } from "@/types/game";

interface OpeningSceneProps {
  onStart: () => void;
}

export function OpeningScene({ onStart }: OpeningSceneProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 game-gradient-bg flex flex-col items-center justify-center px-6 z-40 safe-x safe-top safe-bottom"
    >
      <FloatingParticles />
      <FloatingHearts />
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center max-w-md space-y-6"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl"
        >
          🌸
        </motion.div>
        {content.opening.lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.4 }}
            className={`font-display ${i === 0 ? "text-2xl font-bold text-gold-warm" : "text-cream/90 text-base sm:text-lg"}`}
          >
            {line}
          </motion.p>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 }}
        >
          <GameButton size="lg" onClick={onStart} className="mt-4">
            {content.opening.startButton}
          </GameButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
