import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

async function loadSquareImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = src;
  });
}

interface PuzzlePiece {
  id: number;
  correctSlot: number;
  row: number;
  col: number;
}

interface ImageJigsawPuzzleProps {
  imageSrc: string;
  grid: number;
  romanticMessage: string;
  onComplete: () => void;
  onSnap?: () => void;
}

function shufflePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
  const copy = [...pieces];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createPieces(grid: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = [];
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const id = row * grid + col;
      pieces.push({ id, correctSlot: id, row, col });
    }
  }
  return pieces;
}

function pieceBackgroundStyle(imageSrc: string, grid: number, row: number, col: number) {
  const pct = grid > 1 ? (100 / (grid - 1)) : 0;
  return {
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: `${grid * 100}% ${grid * 100}%`,
    backgroundPosition: `${col * pct}% ${row * pct}%`,
    backgroundRepeat: "no-repeat" as const,
  };
}

function PuzzleTile({
  imageSrc,
  grid,
  piece,
  className,
}: {
  imageSrc: string;
  grid: number;
  piece: PuzzlePiece;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-full ${className ?? ""}`}
      style={pieceBackgroundStyle(imageSrc, grid, piece.row, piece.col)}
    />
  );
}

export function ImageJigsawPuzzle({
  imageSrc,
  grid,
  romanticMessage,
  onComplete,
  onSnap,
}: ImageJigsawPuzzleProps) {
  const [squareSrc, setSquareSrc] = useState<string | null>(null);
  const [slots, setSlots] = useState<(PuzzlePiece | null)[]>([]);
  const [pool, setPool] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [solved, setSolved] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const total = grid * grid;
  const displaySrc = squareSrc ?? imageSrc;
  const correctCount = slots.filter((p, i) => p && p.correctSlot === i).length;
  const progress = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const initPuzzle = useCallback(() => {
    const created = createPieces(grid);
    setSlots(Array.from({ length: total }, () => null));
    setPool(shufflePieces(created));
    setSolved(false);
    setRevealing(false);
    setSelectedPieceId(null);
    setReady(true);
  }, [grid, total]);

  useEffect(() => {
    let cancelled = false;
    loadSquareImage(imageSrc)
      .then((cropped) => {
        if (!cancelled) {
          setSquareSrc(cropped);
          initPuzzle();
        }
      })
      .catch(() => {
        if (!cancelled) initPuzzle();
      });
    return () => {
      cancelled = true;
    };
  }, [imageSrc, initPuzzle]);

  useEffect(() => {
    if (correctCount === total && total > 0 && ready && !solved) {
      setSolved(true);
      setRevealing(true);
      setTimeout(onComplete, 3200);
    }
  }, [correctCount, total, solved, ready, onComplete]);

  const placePiece = (slotIndex: number, piece: PuzzlePiece) => {
    const existing = slots[slotIndex];
    const newSlots = [...slots];
    newSlots[slotIndex] = piece;
    setSlots(newSlots);
    setPool((p) => p.filter((x) => x.id !== piece.id).concat(existing ? [existing] : []));
    setSelectedPieceId(null);
    if (piece.correctSlot === slotIndex) onSnap?.();
  };

  const handleSlotClick = (slotIndex: number) => {
    if (solved) return;
    if (selectedPieceId !== null) {
      const piece = pool.find((p) => p.id === selectedPieceId);
      if (piece) placePiece(slotIndex, piece);
      return;
    }
    const inSlot = slots[slotIndex];
    if (inSlot) {
      setSlots((s) => {
        const next = [...s];
        next[slotIndex] = null;
        return next;
      });
      setPool((p) => [...p, inSlot]);
    }
  };

  const handlePoolClick = (pieceId: number) => {
    if (solved) return;
    setSelectedPieceId((prev) => (prev === pieceId ? null : pieceId));
  };

  if (!ready) {
    return <p className="text-center text-cream/60 py-8">Priprema slagalice…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <p className="text-cream/70">Sastavi sliku ({grid}×{grid})</p>
        <p className="text-gold-warm font-display font-bold">{progress}%</p>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-lavender to-gold-warm"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {revealing ? (
          <motion.div
            key="reveal"
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img src={displaySrc} alt="Uspomena" className="w-full block aspect-square object-cover" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <p className="font-display text-lg sm:text-xl text-gold-warm font-bold text-center px-4 drop-shadow-lg">
                {romanticMessage}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="puzzle" className="space-y-3">
            <div
              className="grid gap-[2px] p-[2px] rounded-xl bg-white/10 mx-auto w-full max-w-[min(100%,360px)] aspect-square"
              style={{ gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))` }}
            >
              {slots.map((piece, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSlotClick(i)}
                  className={`aspect-square rounded-[2px] overflow-hidden relative transition-shadow ${
                    piece && piece.correctSlot === i
                      ? "ring-2 ring-emerald-400/70 shadow-sm"
                      : "ring-1 ring-white/10"
                  } ${selectedPieceId !== null ? "ring-gold-warm/40" : ""}`}
                  style={{ background: piece ? undefined : "rgba(255,255,255,0.06)" }}
                >
                  {piece ? (
                    <PuzzleTile imageSrc={displaySrc} grid={grid} piece={piece} />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-white/15 text-[10px] font-mono">
                      {i + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-cream/50 text-center">
              {selectedPieceId !== null
                ? "Dodirni polje gdje želiš postaviti dio"
                : "Dodirni dio ispod, zatim polje na mreži"}
            </p>

            <div
              className="grid gap-1.5 justify-items-center mx-auto w-full max-w-[min(100%,360px)] max-h-[120px] overflow-y-auto overscroll-contain py-1"
              style={{ gridTemplateColumns: `repeat(${Math.min(grid, 5)}, minmax(0, 1fr))` }}
            >
              {pool.map((piece) => (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => handlePoolClick(piece.id)}
                  className={`aspect-square w-full max-w-[52px] touch-target rounded-md overflow-hidden border-2 transition-all ${
                    selectedPieceId === piece.id
                      ? "border-gold-warm scale-105 shadow-lg"
                      : "border-white/25 hover:border-white/40"
                  }`}
                >
                  <PuzzleTile imageSrc={displaySrc} grid={grid} piece={piece} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
