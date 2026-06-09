import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import type { ConversationMessage } from "@/types/game";
import { fireTreasureConfetti } from "@/utils/confetti";

interface ConversationReconstructProps {
  messages: ConversationMessage[];
  hintText: string;
  onComplete: () => void;
}

/** Ensure every message has a unique id (duplicate ids break React keys and Reorder). */
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animating, setAnimating] = useState(false);
  const wasDragging = useRef(false);

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

  const swapItems = (fromId: string, toId: string) => {
    const fromIdx = items.findIndex((m) => m.id === fromId);
    const toIdx = items.findIndex((m) => m.id === toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const next = [...items];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    setItems(next);
  };

  const handleTap = (id: string) => {
    if (success || wasDragging.current) return;
    if (!selectedId) {
      setSelectedId(id);
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    swapItems(selectedId, id);
    setSelectedId(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream/70">
        Sastavi poruke u pravilan redoslijed — povuci ili dodirni dvije za zamjenu
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="space-y-2"
      >
        {items.map((msg, i) => (
          <Reorder.Item
            key={msg.id}
            value={msg}
            dragListener
            onDragStart={() => {
              wasDragging.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                wasDragging.current = false;
              }, 100);
            }}
            onClick={() => handleTap(msg.id)}
            className={`cozy-card rounded-2xl px-4 py-3.5 min-h-[52px] cursor-grab active:cursor-grabbing touch-manipulation ${
              selectedId === msg.id ? "ring-2 ring-gold-warm" : ""
            } ${success && animating ? "animate-pulse" : ""}`}
            whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 50 }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-start gap-2 pointer-events-none">
              <span className="text-lg shrink-0">💬</span>
              <p className="text-sm text-cream/90">{msg.text}</p>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {selectedId && (
        <p className="text-xs text-gold-warm text-center">
          Odabrano — dodirni drugu poruku za zamjenu
        </p>
      )}

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
            className="w-full font-display font-semibold bg-gradient-to-r from-lavender to-purple-500 text-white rounded-2xl py-3"
          >
            Provjeri redoslijed ✨
          </motion.button>
        </div>
      )}
    </div>
  );
}
