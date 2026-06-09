import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { DragReorderList } from "@/components/ui/DragReorderList";
import type { ConversationMessage } from "@/types/game";
import { fireTreasureConfetti } from "@/utils/confetti";

interface ConversationReconstructProps {
  messages: ConversationMessage[];
  hintText: string;
  onComplete: () => void;
}

function normalizeMessages(msgs: ConversationMessage[]): ConversationMessage[] {
  const seen = new Set<string>();
  return msgs.map((m, i) => {
    let id = m.id || `msg-${i}`;
    if (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    return { ...m, id };
  });
}

function shuffleMessages(msgs: ConversationMessage[]): ConversationMessage[] {
  const copy = [...msgs];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ConversationReconstruct({
  messages,
  hintText,
  onComplete,
}: ConversationReconstructProps) {
  const normalized = useMemo(() => normalizeMessages(messages), [messages]);

  const correctOrder = useMemo(
    () => [...normalized].sort((a, b) => a.order - b.order).map((m) => m.id),
    [normalized],
  );

  const [items, setItems] = useState(() => shuffleMessages(normalized));
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animating, setAnimating] = useState(false);

  const checkOrder = () => {
    setChecked(true);
    const currentOrder = items.map((m) => m.id);
    const isCorrect = currentOrder.every((id, i) => id === correctOrder[i]);
    if (isCorrect) {
      setSuccess(true);
      setAnimating(true);
      fireTreasureConfetti();
      setTimeout(() => {
        setAnimating(false);
        onComplete();
      }, 2400);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream/70">
        Povuci poruke ili dodirni dvije da zamijene mjesta i sastavi rečenicu
      </p>

      <DragReorderList
        items={items}
        onReorder={(next) => {
          setItems(next);
          setChecked(false);
        }}
        getKey={(msg) => msg.id}
        disabled={success}
        renderItem={(msg, index) => (
          <div
            className={`cozy-card rounded-2xl px-3 py-3 min-h-[52px] flex items-center gap-2 ${
              success && animating ? "animate-pulse" : ""
            }`}
          >
            <span className="text-cream/40 text-lg shrink-0" aria-hidden>
              ⠿
            </span>
            <span className="text-gold-warm font-display font-bold text-xs w-4 shrink-0">
              {index + 1}
            </span>
            <span className="text-lg shrink-0">💬</span>
            <p className="text-sm text-cream/90 flex-1 pointer-events-none">{msg.text}</p>
          </div>
        )}
      />

      {showHint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-lavender italic text-center"
        >
          💡 {hintText}
        </motion.p>
      )}

      {checked && !success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-rose-300 text-sm text-center"
        >
          Nije baš redoslijed — pokušaj ponovo 💭
        </motion.p>
      )}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6 }}
              className="text-4xl mb-2"
            >
              💕
            </motion.div>
            <p className="font-display text-gold-warm font-bold">Razgovor obnovljen!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <div className="flex flex-col gap-2">
          <GameButton variant="ghost" size="sm" onClick={() => setShowHint((h) => !h)}>
            {showHint ? "Sakrij savjet" : "Savjet 💡"}
          </GameButton>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={checkOrder}
            className="w-full font-display font-semibold bg-gradient-to-r from-lavender to-purple-500 text-white rounded-2xl py-3 min-h-[48px]"
          >
            Provjeri redoslijed ✨
          </motion.button>
        </div>
      )}
    </div>
  );
}
