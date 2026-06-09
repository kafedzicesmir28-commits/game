import { useCallback, useRef, useState, type ReactNode } from "react";

interface DragReorderListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  getKey: (item: T) => string;
  renderItem: (item: T, index: number, state: { isDragging: boolean; isOver: boolean }) => ReactNode;
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
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startY = useRef(0);

  const finishDrag = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    },
    [items, onReorder],
  );

  const onPointerDown = (index: number, e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    setDragIndex(index);
    setHoverIndex(index);
    setOffsetY(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    setOffsetY(e.clientY - startY.current);

    let closest = dragIndex;
    let minDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(e.clientY - mid);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const to = hoverIndex ?? dragIndex;
    finishDrag(dragIndex, to);
    setDragIndex(null);
    setHoverIndex(null);
    setOffsetY(0);
  };

  const onPointerCancel = () => {
    setDragIndex(null);
    setHoverIndex(null);
    setOffsetY(0);
  };

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isOver = hoverIndex === index && dragIndex !== null && dragIndex !== index;
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
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            className={`relative select-none touch-none ${itemClassName} ${
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
              } transition-shadow`}
            >
              {renderItem(item, index, { isDragging, isOver })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
