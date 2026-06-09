import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const DRAG_THRESHOLD = 12;

interface DragReorderListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  getKey: (item: T) => string;
  renderItem: (
    item: T,
    index: number,
    state: { isDragging: boolean; isOver: boolean; isSelected: boolean },
  ) => ReactNode;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  gap?: number;
}

export function DragReorderList<T>({
  items,
  onReorder,
  getKey,
  renderItem,
  className = "space-y-2",
  itemClassName = "",
  disabled = false,
  gap = 8,
}: DragReorderListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemsRef = useRef(items);
  const onReorderRef = useRef(onReorder);
  const activePointerRef = useRef<number | null>(null);
  const pointerIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  itemsRef.current = items;
  onReorderRef.current = onReorder;

  const moveItem = useCallback((from: number, to: number) => {
    if (from === to) return;
    const next = [...itemsRef.current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorderRef.current(next);
  }, []);

  const swapItems = useCallback((a: number, b: number) => {
    if (a === b) return;
    const next = [...itemsRef.current];
    [next[a], next[b]] = [next[b], next[a]];
    onReorderRef.current(next);
  }, []);

  const findIndexAtY = useCallback((clientY: number) => {
    let closest = 0;
    let minDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - mid);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    return closest;
  }, []);

  const resetDragVisuals = useCallback(() => {
    isDraggingRef.current = false;
    pointerIndexRef.current = null;
    hoverIndexRef.current = null;
    activePointerRef.current = null;
    setDragIndex(null);
    setHoverIndex(null);
    setOffsetY(0);
  }, []);

  const handlePointerMoveRef = useRef<(e: PointerEvent) => void>(() => {});
  const handlePointerUpRef = useRef<(e: PointerEvent) => void>(() => {});
  const handlePointerCancelRef = useRef<(e: PointerEvent) => void>(() => {});

  const removeWindowListeners = useCallback(() => {
    window.removeEventListener("pointermove", handlePointerMoveRef.current);
    window.removeEventListener("pointerup", handlePointerUpRef.current);
    window.removeEventListener("pointercancel", handlePointerCancelRef.current);
  }, []);

  handlePointerMoveRef.current = (e: PointerEvent) => {
    if (activePointerRef.current !== e.pointerId || pointerIndexRef.current === null) return;

    const dy = e.clientY - startYRef.current;
    const dx = e.clientX - startXRef.current;

    if (!isDraggingRef.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      isDraggingRef.current = true;
      setSelectedIndex(null);
      setDragIndex(pointerIndexRef.current);
    }

    setOffsetY(dy);
    const closest = findIndexAtY(e.clientY);
    hoverIndexRef.current = closest;
    setHoverIndex(closest);
  };

  handlePointerUpRef.current = (e: PointerEvent) => {
    if (activePointerRef.current !== e.pointerId) return;

    const index = pointerIndexRef.current;
    if (index !== null) {
      if (isDraggingRef.current) {
        const to = hoverIndexRef.current ?? index;
        moveItem(index, to);
      } else {
        setSelectedIndex((prev) => {
          if (prev === null) return index;
          if (prev === index) return null;
          swapItems(prev, index);
          return null;
        });
      }
    }

    resetDragVisuals();
    removeWindowListeners();
  };

  handlePointerCancelRef.current = (e: PointerEvent) => {
    if (activePointerRef.current !== e.pointerId) return;
    resetDragVisuals();
    removeWindowListeners();
  };

  useEffect(() => {
    return () => removeWindowListeners();
  }, [removeWindowListeners]);

  const onPointerDown = (index: number, e: React.PointerEvent) => {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    activePointerRef.current = e.pointerId;
    pointerIndexRef.current = index;
    hoverIndexRef.current = index;
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    isDraggingRef.current = false;

    window.addEventListener("pointermove", handlePointerMoveRef.current);
    window.addEventListener("pointerup", handlePointerUpRef.current);
    window.addEventListener("pointercancel", handlePointerCancelRef.current);
  };

  return (
    <div className={className}>
      {selectedIndex !== null && !disabled && (
        <p className="text-xs text-lavender text-center mb-2 animate-pulse">
          Odaberi drugu stavku za zamjenu mjesta
        </p>
      )}
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isOver = hoverIndex === index && dragIndex !== null && dragIndex !== index;
        const isSelected = selectedIndex === index;

        const shift =
          dragIndex !== null && !isDragging && hoverIndex !== null && dragIndex < hoverIndex
            ? index > dragIndex && index <= hoverIndex
              ? -1
              : 0
            : dragIndex !== null && !isDragging && hoverIndex !== null && dragIndex > hoverIndex
              ? index < dragIndex && index >= hoverIndex
                ? 1
                : 0
              : 0;

        const refH = itemRefs.current[index]?.offsetHeight ?? 72;
        const translateY = isDragging ? offsetY : shift * (refH + gap);

        return (
          <div
            key={getKey(item)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onPointerDown={(e) => onPointerDown(index, e)}
            className={`relative select-none touch-manipulation ${itemClassName} ${
              isDragging ? "z-50" : "z-0"
            } ${disabled ? "pointer-events-none opacity-60" : "cursor-grab active:cursor-grabbing"}`}
            style={{
              transform: `translateY(${translateY}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease",
              opacity: isDragging ? 0.95 : 1,
            }}
          >
            <div
              className={`${isDragging ? "shadow-2xl scale-[1.02]" : ""} ${
                isOver ? "ring-2 ring-gold-warm/60 rounded-2xl" : ""
              } ${isSelected ? "ring-2 ring-lavender rounded-2xl" : ""} transition-shadow`}
            >
              {renderItem(item, index, { isDragging, isOver, isSelected })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
