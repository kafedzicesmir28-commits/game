import { motion, AnimatePresence } from "framer-motion";

interface AchievementPopupProps {
  title: string;
  description: string;
  visible: boolean;
}

export function AchievementPopup({ title, description, visible }: AchievementPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="cozy-card rounded-2xl p-4 flex items-center gap-3 border-amber-300/40">
            <div className="text-3xl">🏆</div>
            <div>
              <p className="font-display font-bold text-gold-warm text-sm">{title}</p>
              <p className="text-cream/80 text-xs">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
