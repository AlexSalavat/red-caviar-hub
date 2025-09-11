import React from "react";
import type { Supplier, Listing } from "../types";

/* helpers */
const cn = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

export type SupplierCardProps = {
  supplier: Supplier;
  listings?: Listing[];
  onOpenProfile?: (supplier: Supplier) => void;
  onOpenListings?: (supplier: Supplier) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (supplierId: string) => void;
};

function productTagsFromSupplier(s: Supplier): string[] {
  const tags = (s.categories && s.categories.length ? s.categories : s.products) ?? [];
  return [...new Set(tags)].slice(0, 3);
}

export default function SupplierCard({
  supplier,
  listings = [],
  onOpenProfile,
  onOpenListings,
  isFavorite,
  onToggleFavorite,
}: SupplierCardProps) {
  const announcementsCount = React.useMemo(
    () => (listings ?? []).filter(l => l && l.supplierId === supplier.id).length,
    [listings, supplier.id]
  );

  const tags = productTagsFromSupplier(supplier);

  return (
    <div className={cn("ui-card rounded-3xl")}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50 ring-1 ring-slate-200/80">
            {supplier.logoUrl ? (
              <img src={supplier.logoUrl} alt={supplier.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-sm font-bold text-slate-600">
                {supplier.displayName.slice(0,2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-slate-900 font-semibold leading-tight truncate">{supplier.displayName}</h3>
              {!!supplier.rating && (
                <span className="text-xs text-slate-600">★ {supplier.rating.toFixed(1)}</span>
              )}
              {supplier.verified && (
                <span className="text-[11px] px-1.5 py-0.5 rounded border border-emerald-300/70 text-emerald-700">
                  Проверено
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 truncate mt-0.5">
              {supplier.city ? `${supplier.city}, ` : ''}{supplier.regions.join(", ")}
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite?.(supplier.id)}
            className={cn(
              "h-9 w-9 grid place-items-center rounded-full border",
              isFavorite ? "bg-yellow-400 border-yellow-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
            aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
            title={isFavorite ? "Убрать из избранного" : "В избранное"}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>

        {/* Категории / продукция */}
        {!!tags.length && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tags.map(t => (
              <span key={t} className="chip chip-muted">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenProfile?.(supplier)}
            className="btn rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            title="Открыть профиль компании"
          >
            Профиль компании
          </button>
          <button
            onClick={() => onOpenListings?.(supplier)}
            className="btn btn-secondary"
            title="Показать все объявления"
          >
            Объявления ({announcementsCount})
          </button>
        </div>
      </div>
    </div>
  );
}
