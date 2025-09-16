import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import listingsJson from "../mocks/listings.json";
import suppliersJson from "../mocks/suppliers.json";
import type { Listing, Supplier } from "../types";
import ListingCard from "../widgets/ListingCard";

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFKD").replace(/\s+/g, " ").trim();

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const supplierParam = params.get("supplier") || "";
  const [q, setQ] = useState("");

  const suppliers: Supplier[] = useMemo(
    () => (Array.isArray(suppliersJson) ? suppliersJson : []) as Supplier[],
    []
  );
  const byId = useMemo<Record<string, Supplier>>(() => {
    const m: Record<string, Supplier> = {};
    for (const s of suppliers) m[s.id] = s;
    return m;
  }, [suppliers]);

  const listings: Listing[] = useMemo(
    () => (Array.isArray(listingsJson) ? listingsJson : []).filter(Boolean) as Listing[],
    []
  );

  const filtered = useMemo(() => {
    let arr = listings;
    if (supplierParam) arr = arr.filter((l) => l.supplierId === supplierParam);

    const nq = norm(q);
    if (nq) {
      arr = arr.filter((l) => {
        const hay = [
          l.title,
          l.region,
          (l.packaging || []).join(" "),
          (l.badges || []).join(" "),
          l.__category || "",
        ]
          .map(norm)
          .join(" ");
        return hay.includes(nq);
      });
    }
    return arr;
  }, [listings, supplierParam, q]);

  const supplierActive = supplierParam ? byId[supplierParam] : undefined;

  const clearSupplier = () => {
    params.delete("supplier");
    setParams(params);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Объявления{supplierActive ? ` • ${supplierActive.displayName}` : ""}
        </h1>
        {supplierActive && (
          <button className="btn btn-muted px-3 py-1.5 text-[12px]" onClick={clearSupplier}>
            Сбросить фильтр
          </button>
        )}
      </div>

      {/* Поиск */}
      <div className="glass p-2 rounded-2xl border border-[var(--border)]">
        <input
          className="input-neon w-full"
          placeholder="Поиск по заголовку, региону, фасовке…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          Найдено: {filtered.length} из {listings.length}
        </div>
      </div>

      {/* Лента */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 && (
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            Объявлений не найдено.
          </div>
        )}
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} supplier={byId[l.supplierId]} />
        ))}
      </div>

      {/* Sticky CTA */}
      <div className="h-[80px]" />
      <div className="fixed left-0 right-0 bottom-[calc(var(--bottom-nav-h)+8px+env(safe-area-inset-bottom))] z-40 px-3">
        <div className="max-w-[980px] mx-auto">
          <button className="btn w-full py-3 text-[14px] rounded-xl">Создать объявление</button>
        </div>
      </div>
    </div>
  );
}
