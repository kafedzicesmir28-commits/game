import { motion } from "framer-motion";

interface KeyRewardProps {
  keyName: string;
  visible: boolean;
}

export function KeyReward({ keyName, visible }: KeyRewardProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-3 py-6"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, 0], y: [0, -8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        className="text-6xl drop-shadow-lg"
      >
        🗝️
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-display text-gold-warm font-bold text-lg text-center"
      >
        {keyName} osvojen!
      </motion.p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        className="h-0.5 max-w-[120px] bg-gradient-to-r from-transparent via-gold-warm to-transparent"
      />
    </motion.div>
  );
}
