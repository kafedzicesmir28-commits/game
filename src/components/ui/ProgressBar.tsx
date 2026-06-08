import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label = "Napredak" }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 px-1">
        <span className="text-xs text-cream/70 font-medium">{label}</span>
        <span className="text-xs font-bold text-gold-warm">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
