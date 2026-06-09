import { motion } from "framer-motion";
import { useState } from "react";
import { DragReorderList } from "@/components/ui/DragReorderList";

interface MemoryPuzzleProps {
  photos: string[];
  correctOrder: string[];
  onComplete: () => void;
}

export function MemoryPuzzle({ photos, correctOrder, onComplete }: MemoryPuzzleProps) {
  const [items, setItems] = useState(() => [...photos].sort(() => Math.random() - 0.5));
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkOrder = () => {
    setChecked(true);
    const isCorrect = items.every((item, i) => item === correctOrder[i]);
    if (isCorrect) {
      setSuccess(true);
      setTimeout(onComplete, 800);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream/70">
        Povuci fotografije u hronološki redoslijed (najranija prva)
      </p>

      <DragReorderList
        items={items}
        onReorder={setItems}
        getKey={(src) => src}
        disabled={success}
        renderItem={(src, index) => (
          <div className="cozy-card rounded-2xl p-2 flex items-center gap-2">
            <span className="text-cream/40 text-lg shrink-0 pl-1" aria-hidden>
              ⠿
            </span>
            <span className="text-gold-warm font-display font-bold text-sm w-5 shrink-0">
              {index + 1}
            </span>
            <img
              src={src}
              alt={`Uspomena ${index + 1}`}
              className="flex-1 h-20 sm:h-28 object-cover rounded-xl pointer-events-none"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://placehold.co/400x200/2d1b4e/ffd166?text=Add+Photo`;
              }}
            />
          </div>
        )}
      />

      {checked && !success && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-300 text-sm text-center">
          Nije baš to — nastavi pokušavati! 💕
        </motion.p>
      )}
      {!success && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={checkOrder}
          className="w-full font-display font-semibold bg-gradient-to-r from-lavender to-purple-500 text-white rounded-2xl py-3 min-h-[48px]"
        >
          Provjeri redoslijed ✨
        </motion.button>
      )}
    </div>
  );
}
