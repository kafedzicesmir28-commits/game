import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GameButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function GameButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  onClick,
  type = "button",
}: GameButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/30 border border-rose-300/30",
    secondary:
      "bg-gradient-to-r from-amber-300/90 to-yellow-400/90 text-deep-purple shadow-lg shadow-amber-400/20 border border-amber-200/40",
    ghost: "bg-white/10 text-cream border border-white/20 hover:bg-white/15",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm rounded-xl min-h-[44px]",
    md: "px-6 py-3 text-base rounded-2xl min-h-[48px]",
    lg: "px-8 py-4 text-lg rounded-2xl font-bold min-h-[52px]",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`font-display font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
