import { useEffect, useMemo, useRef, useState } from "react";

export default function GalleryLightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const total = images?.length ?? 0;
  const img = images[idx] ?? "";

  // Закрытие по Esc, навигация стрелками
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return next();
      if (e.key === "ArrowLeft") return prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, images]);

  // Лочим фон
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  // Прелоад соседних
  useEffect(() => {
    const preload = (i: number) => {
      const p = new Image();
      p.src = images[i] ?? "";
    };
    if (total > 1) {
      preload((idx + 1) % total);
      preload((idx - 1 + total) % total);
    }
  }, [idx, images, total]);

  const wrap = (i: number) => (i + total) % total;
  const next = () => setIdx((i) => wrap(i + 1));
  const prev = () => setIdx((i) => wrap(i - 1));

  // Свайпы
  const touch = useRef<{x: number; y: number} | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
  };

  if (!total) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* фон */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden
      />
      {/* контейнер */}
      <div
        className="absolute inset-0 flex items-center justify-center p-3 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* верхняя панель */}
        <div
          className="absolute left-0 right-0 top-0 p-3 flex items-center justify-between"
          style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
        >
          <div className="glass px-2 py-1 rounded-md text-xs">
            {idx + 1} / {total}
          </div>
          <button
            className="btn px-3 py-1.5 text-[12px]"
            onClick={onClose}
            aria-label="Закрыть"
          >
            Закрыть
          </button>
        </div>

        {/* изображение */}
        <div
          className="relative max-w-[92vw] max-h-[85svh]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={img}
            alt={`Фото ${idx + 1}`}
            className="max-w-[92vw] max-h-[85svh] object-contain rounded-xl"
            loading="eager"
            decoding="async"
          />
          {/* стрелки */}
          {total > 1 && (
            <>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-2 rounded-md glass"
                onClick={prev}
                aria-label="Назад"
              >
                ‹
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 rounded-md glass"
                onClick={next}
                aria-label="Вперёд"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* подпись (необязательно) */}
        {/* <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-md text-xs opacity-80">
          Подпись к фото
        </div> */}
      </div>
    </div>
  );
}
