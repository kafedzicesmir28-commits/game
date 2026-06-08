import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StoryCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function StoryCard({ title, children, className = "" }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`cozy-card rounded-3xl p-5 ${className}`}
    >
      {title && (
        <h3 className="font-display text-lg font-bold text-gold-warm mb-3">{title}</h3>
      )}
      <div className="text-cream/90 leading-relaxed text-sm sm:text-base">{children}</div>
    </motion.div>
  );
}
