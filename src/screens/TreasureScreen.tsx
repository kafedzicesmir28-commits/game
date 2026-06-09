import { motion } from "framer-motion";
import { useEffect } from "react";
import { FloatingHearts } from "@/components/effects/FloatingHearts";
import { GameButton } from "@/components/ui/GameButton";
import { StoryCard } from "@/components/ui/StoryCard";
import { content } from "@/types/game";
import { fireTreasureConfetti } from "@/utils/confetti";

interface TreasureScreenProps {
  onReturn: () => void;
  onReset: () => void;
}

export function TreasureScreen({ onReturn, onReset }: TreasureScreenProps) {
  useEffect(() => {
    fireTreasureConfetti();
    const interval = setInterval(fireTreasureConfetti, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 game-gradient-bg flex flex-col items-center justify-center px-6 z-50 overflow-y-auto py-6 safe-x safe-top safe-bottom"
    >
      <FloatingHearts />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="text-center max-w-md space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-7xl"
        >
          💎
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-gold-warm">
          {content.treasure.title}
        </h1>
        {content.treasure.lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.3 }}
            className="text-cream/90 text-base sm:text-lg leading-relaxed"
          >
            {line}
          </motion.p>
        ))}

        <StoryCard title={content.treasure.customMessageLabel}>
          <p className="italic">{content.meta.finalMessage}</p>
        </StoryCard>

        <div className="flex flex-col gap-3 pt-4">
          <GameButton onClick={onReturn}>Nazad na mapu 🗺️</GameButton>
          <GameButton variant="ghost" size="sm" onClick={onReset}>
            Igraj ponovo
          </GameButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
