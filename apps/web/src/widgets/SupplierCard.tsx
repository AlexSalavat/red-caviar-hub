import React from "react";
import type { Supplier, Listing } from "../types";

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
  const isPremium = (supplier.badges || []).some(b => ["premium","top","vip"].includes(b.toLowerCase()));

  return (
    <div className="glass neon spot p-5 rounded-3xl hover-raise group">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 grid place-items-center group-hover:scale-105 transition">
          {supplier.logoUrl ? (
            <img src={supplier.logoUrl} alt={supplier.displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-white/80">{supplier.displayName.slice(0,2).toUpperCase()}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold leading-tight truncate">{supplier.displayName}</h3>
            {supplier.verified && <span className="pill pill-verified">Проверенный</span>}
            {isPremium && <span className="pill pill-premium">PREMIUM</span>}
          </div>
          <div className="text-[12px] text-white/60 mt-0.5 truncate">
            {supplier.city ? `${supplier.city}, ` : ''}{supplier.regions.join(", ")}
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite?.(supplier.id)}
          className={cn(
            "h-9 w-9 grid place-items-center rounded-full border border-white/15 transition",
            isFavorite ? "bg-white/20 text-white" : "bg-transparent text-white/80 hover:bg-white/10"
          )}
          aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
          title={isFavorite ? "Убрать из избранного" : "В избранное"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      {/* Категории */}
      {!!tags.length && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span key={t} className="tag-dark">{t}</span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => onOpenProfile?.(supplier)} className="btn btn-solid" title="Открыть профиль компании">
          Профиль
        </button>
        <button onClick={() => onOpenListings?.(supplier)} className="btn btn-ghost" title="Показать все объявления">
          Объявления ({announcementsCount})
        </button>
      </div>
    </div>
  );
}
