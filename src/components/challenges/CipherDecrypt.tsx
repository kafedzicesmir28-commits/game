import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import type { CipherLevelConfig } from "@/types/cipher";
import { validateCipherAnswer } from "@/utils/cipher";
import { fireTreasureConfetti } from "@/utils/confetti";

interface CipherDecryptProps {
  config: CipherLevelConfig;
  onComplete: () => void;
  onWrong: () => void;
  onCorrect: () => void;
}

const RUNES = ["✦", "⋆", "✧", "❋", "✵", "✶"];

export function CipherDecrypt({ config, onComplete, onWrong, onCorrect }: CipherDecryptProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [input, setInput] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stage = config.stages[stageIndex];
  const isLastStage = stageIndex >= config.stages.length - 1;

  const submit = () => {
    if (!input.trim() || successMessage) return;
    if (validateCipherAnswer(input, stage)) {
      onCorrect();
      setFeedback(null);
      const message = stage.successMessage ?? `❤️ Tačno! Poruka glasi: "${stage.solution}"`;
      setSuccessMessage(message);

      if (isLastStage) {
        setFinished(true);
        fireTreasureConfetti();
        setTimeout(() => setShowFinale(true), 1800);
        setTimeout(onComplete, 4500);
      } else {
        setTimeout(() => {
          setStageIndex((i) => i + 1);
          setInput("");
          setHintIndex(-1);
          setSuccessMessage(null);
        }, 2200);
      }
    } else {
      onWrong();
      setFeedback(config.wrongAttemptMessage);
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const nextHint = () => {
    if (hintIndex < stage.hints.length - 1) {
      setHintIndex((i) => i + 1);
    }
  };

  const difficultyLabel = {
    easy: "Lako",
    medium: "Srednje",
    hard: "Teško",
  }[stage.difficulty];

  if (showFinale) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[320px] flex flex-col items-center justify-center text-center space-y-6 py-8"
      >
        <div className="absolute inset-0 bg-black/60 rounded-2xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-center gap-3 text-2xl">
            {RUNES.map((r, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                {r}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-xl text-gold-warm font-bold px-4"
          >
            {config.completionMessage}
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-lavender font-medium">
          Faza {stageIndex + 1}/{config.stages.length} — {difficultyLabel}
        </span>
        <span className="text-cream/50 uppercase tracking-wider">{stage.cipherType}</span>
      </div>

      <div className="cozy-card rounded-2xl p-4 space-y-3">
        <p className="text-xs text-cream/60">Šifrovana poruka:</p>
        <motion.p
          key={stage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-lg sm:text-xl text-gold-warm tracking-widest text-center break-all"
        >
          {stage.encryptedText}
        </motion.p>
      </div>

      <AnimatePresence>
        {hintIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            {stage.hints.slice(0, hintIndex + 1).map((hint, i) => (
              <p key={i} className="text-xs text-lavender italic">
                💡 {hint}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-sm sm:text-base text-rose-200 font-display font-semibold px-2"
          >
            {successMessage}
          </motion.p>
        ) : (
          <motion.div key="input" animate={feedback ? { x: [-6, 6, -6, 6, 0] } : {}}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Dekodiraj poruku..."
              disabled={finished}
              className="w-full cozy-card rounded-2xl px-4 py-3 text-center text-base font-display tracking-wide bg-transparent outline-none focus:border-gold-warm/50 touch-target"
              style={{ fontSize: "16px" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && !successMessage && (
        <p className="text-center text-sm text-rose-200">{feedback}</p>
      )}

      <div className="flex flex-col gap-2">
        {hintIndex < stage.hints.length - 1 && (
          <GameButton variant="ghost" size="sm" onClick={nextHint}>
            Savjet ({hintIndex + 1}/{stage.hints.length}) 💡
          </GameButton>
        )}
        <GameButton onClick={submit} className="w-full" disabled={finished || !!successMessage}>
          Provjeri 🔐
        </GameButton>
      </div>
    </div>
  );
}
