import React from "react";
import { useNavigate } from "react-router-dom";
import type { Supplier, Listing } from "../types";
import suppliersJson from "../mocks/suppliers.json";
import listingsJson from "../mocks/listings.json";
import SupplierCard from "../widgets/SupplierCard";
import { SupplierProfileSheet } from "../widgets/SupplierProfileSheet";

const suppliers = (suppliersJson as unknown as Supplier[]) || [];
const listingsAll = (listingsJson as unknown as Listing[]) || [];

const normalize = (s: string) => s.normalize("NFKC").toLowerCase();

export default function Catalog() {
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState<Supplier | null>(null);
  const [open, setOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!q.trim()) return suppliers;
    const needle = normalize(q.trim());
    return suppliers.filter((s) => {
      const hay = [
        s.displayName,
        s.city || "",
        (s.regions || []).join(" "),
        (s.categories || []).join(" "),
        (s.products || []).join(" "),
      ]
        .filter(Boolean)
        .map(normalize)
        .join(" ");
      return hay.includes(needle);
    });
  }, [q]);

  const onOpenProfile = (s: Supplier) => {
    setActive(s);
    setOpen(true);
  };

  const onOpenListings = (s: Supplier) => {
    // ведём на ленту объявлений c фильтром supplierId
    nav(`/listings?supplierId=${encodeURIComponent(s.id)}`);
  };

  return (
    <div className="min-h-screen bg-page-dark">
      <div className="container-safe py-4 space-y-4">

        {/* Поиск наверху */}
        <div className="glass neon rounded-3xl p-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0 h-9 w-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center">
              🔎
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию, городу, регионам или продукции…"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-white/40 text-white outline-none focus:ring-2 focus:ring-white/20"
            />
            {q && (
              <button onClick={() => setQ("")} className="btn btn-muted px-3">
                Сброс
              </button>
            )}
          </div>
          <div className="mt-2 text-[12px] text-white/60">
            Найдено: {filtered.length} из {suppliers.length}
          </div>
        </div>

        {/* Грид компаний */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              listings={listingsAll}
              onOpenProfile={onOpenProfile}
              onOpenListings={onOpenListings}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-white/70">Нет поставщиков по запросу.</div>
          )}
        </div>
      </div>

      {/* Профиль (sheet) */}
      <SupplierProfileSheet
        open={open}
        onClose={() => setOpen(false)}
        supplier={active}
        allListings={listingsAll}
        onOpenListings={onOpenListings}
      />
    </div>
  );
}
