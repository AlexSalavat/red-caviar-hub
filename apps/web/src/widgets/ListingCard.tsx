import { useState } from "react";
import type { Listing, Supplier } from "../types";
import GalleryLightbox from "./GalleryLightbox";

export type ListingCardProps = {
  listing: Listing;
  supplier?: Supplier;
};

export default function ListingCard({ listing, supplier }: ListingCardProps) {
  const [lb, setLb] = useState<{ images: string[]; index: number } | null>(null);
  const photos = Array.isArray(listing.photos) ? listing.photos : [];
  const date = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("ru-RU") : "";

  return (
    <article className="glass glass-neon rounded-2xl border border-[var(--border)] p-3 sm:p-4">
      {/* Верх карточки: на мобиле столбиком, на ≥sm — в строку */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        {/* Поставщик */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="relative shrink-0 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[rgba(255,255,255,.03)]"
            style={{ width: 32, height: 32 }}
            aria-hidden
          >
            {supplier?.logoUrl ? (
              <img
                src={supplier.logoUrl}
                alt={supplier.displayName}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-[11px] font-semibold">RK</div>
            )}
            <span className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-[rgba(54,209,204,.18)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <a
                href={supplier ? `/listings?supplier=${encodeURIComponent(supplier.id)}` : "#"}
                className="truncate text-[13px] font-medium hover:underline"
                title={supplier?.displayName}
              >
                {supplier?.displayName ?? "Поставщик"}
              </a>
              {supplier?.verified && <span className="pill pill-verified">Проверено</span>}
            </div>
            <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
              {listing.region} • {date}
            </div>
          </div>
        </div>

        {/* Цена/объём — уходит вниз на мобиле, справа на ≥sm */}
        <div className="text-right sm:text-right">
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>Цена</div>
          <div className="font-semibold">{tryRub(listing.pricePerKgRUB)} ₽/кг</div>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            Объём: {tryRub(listing.batchVolumeKg)} кг
          </div>
        </div>
      </div>

      {/* Заголовок */}
      <div className="mt-2 text-sm sm:text-[15px] font-semibold">
        {listing.title}
      </div>

      {/* Мини-галерея объявлений */}
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.slice(0, 6).map((p, i) => (
            <button
              key={i}
              type="button"
              className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.03)] focus:outline-none focus:ring-2 focus:ring-[rgba(54,209,204,.35)]"
              onClick={() => setLb({ images: photos, index: i })}
            >
              <img
                src={p}
                alt={`Фото ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* бейджи */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {listing.badges?.map((b) => <span key={b} className="pill">{b}</span>)}
        {listing.__category && <span className="pill">{listing.__category}</span>}
      </div>

      {lb && (
        <GalleryLightbox
          images={lb.images}
          startIndex={lb.index}
          onClose={() => setLb(null)}
        />
      )}
    </article>
  );
}

function tryRub(n?: number) {
  if (typeof n !== "number") return "";
  try { return n.toLocaleString("ru-RU"); } catch { return String(n); }
}
