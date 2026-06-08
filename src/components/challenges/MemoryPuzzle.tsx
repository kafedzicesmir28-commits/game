import { motion, Reorder } from "framer-motion";
import { useState } from "react";

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
      <p className="text-sm text-cream/70">Povuci fotografije u hronološki redoslijed (najranija prva)</p>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((src) => (
          <Reorder.Item
            key={src}
            value={src}
            className="cozy-card rounded-2xl p-2 cursor-grab active:cursor-grabbing touch-none"
            whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
          >
            <img
              src={src}
              alt="Memory"
              className="w-full h-24 sm:h-32 object-cover rounded-xl"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://placehold.co/400x200/2d1b4e/ffd166?text=Add+Photo`;
              }}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {checked && !success && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-300 text-sm text-center">
          Nije baš to — nastavi pokušavati! 💕
        </motion.p>
      )}
      {!success && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={checkOrder}
          className="w-full font-display font-semibold bg-gradient-to-r from-lavender to-purple-500 text-white rounded-2xl py-3"
        >
          Provjeri redoslijed ✨
        </motion.button>
      )}
    </div>
  );
}
