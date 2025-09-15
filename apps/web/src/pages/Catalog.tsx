import { useMemo, useState } from "react";
import suppliersJson from "../mocks/suppliers.json";
import listingsJson from "../mocks/listings.json";
import type { Supplier, Listing } from "../types";
import SupplierCard from "../widgets/SupplierCard";
import SupplierProfileSheet from "../widgets/SupplierProfileSheet";

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFKD").replace(/\s+/g, " ").trim();

export default function Catalog() {
  const suppliers: Supplier[] = useMemo(() => {
    const arr = Array.isArray(suppliersJson) ? suppliersJson : [];
    return (arr.filter(Boolean) as Supplier[]).map((s) => ({
      ...s,
      regions: s.regions || [],
      categories: s.categories || [],
      products: s.products || [],
      gallery: s.gallery || [],
      contacts: s.contacts || {},
      docs: s.docs || {},
    }));
  }, []);

  const listings: Listing[] = useMemo(
    () =>
      (Array.isArray(listingsJson) ? listingsJson : []).filter(
        Boolean
      ) as Listing[],
    []
  );

  const [q, setQ] = useState("");
  const [sheetId, setSheetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const nq = norm(q);
    if (!nq) return suppliers;

    return suppliers.filter((s) => {
      // Жёстко приводим к строкам и формируем string[]
      const hayParts: string[] = [
        s.displayName ?? "",
        s.city ?? "",
        ...(s.regions ?? []),
        ...(s.categories ?? []),
        ...(s.products ?? []),
      ];

      const hay = hayParts
        .filter((x) => x && x.trim().length > 0)
        .map((x) => norm(String(x)))
        .join(" ");

      return hay.includes(nq);
    });
  }, [q, suppliers]);

  const supplierSel =
    useMemo(() => suppliers.find((s) => s.id === sheetId) || null, [sheetId, suppliers]);
  const listingsForSel =
    useMemo(() => listings.filter((l) => l.supplierId === sheetId), [listings, sheetId]);

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Каталог поставщиков</h1>

        <div className="glass p-2 rounded-2xl border border-[var(--border)]">
          <input
            className="input-neon w-full"
            placeholder="Поиск по названию, городу, регионам или продукции…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
            Найдено: {filtered.length} из {suppliers.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Ничего не найдено.
            </div>
          )}
          {filtered.map((s) => (
            <SupplierCard key={s.id} s={s} onOpenSheet={() => setSheetId(s.id)} />
          ))}
        </div>
      </div>

      {/* Sheet профиля */}
      <SupplierProfileSheet
        open={!!sheetId}
        supplier={supplierSel}
        listings={listingsForSel}
        onClose={() => setSheetId(null)}
      />
    </>
  );
}
