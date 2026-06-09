import { motion } from "framer-motion";
import { content } from "@/types/game";

export function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 game-gradient-bg flex flex-col items-center justify-center z-50 safe-x safe-top safe-bottom"
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-5xl mb-6"
      >
        💎
      </motion.div>
      <h1 className="font-display text-2xl font-bold text-gold-warm mb-2">
        {content.meta.title}
      </h1>
      <motion.div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden mt-4">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-400 to-amber-300"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.div>
      <p className="text-cream/50 text-sm mt-4">Učitavanje avanture...</p>
    </motion.div>
  );
}
