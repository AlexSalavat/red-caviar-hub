import { useMemo, useState } from "react";
import suppliersJson from "../mocks/suppliers.json";
import type { Supplier } from "../types";
import SupplierCard from "../widgets/SupplierCard";

const norm = (s:string)=> (s||"").toLowerCase().normalize("NFKD").replace(/\s+/g," ").trim();

export default function Catalog(){
  const suppliers: Supplier[] = useMemo(() => {
    const arr = Array.isArray(suppliersJson) ? suppliersJson : [];
    return (arr.filter(Boolean) as Supplier[]).map(s => ({
      ...s,
      regions: s.regions || [],
      categories: s.categories || [],
      products: s.products || [],
      gallery: s.gallery || [],
      contacts: s.contacts || {},
      docs: s.docs || {},
    }));
  }, []);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const nq = norm(q);
    if(!nq) return suppliers;
    return suppliers.filter(s => {
      const hay = [s.displayName, s.city, (s.regions||[]).join(" "), (s.categories||[]).join(" "), (s.products||[]).join(" ")]
        .filter(Boolean).map(norm).join(" ");
      return hay.includes(nq);
    });
  }, [q, suppliers]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Каталог поставщиков</h1>

      <div className="glass glass-neon p-2">
        <input
          className="input-neon w-full"
          placeholder="Поиск по названию, городу, регионам или продукции…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <div className="mt-2 text-xs" style={{color:"var(--muted)"}}>
          Найдено: {filtered.length} из {suppliers.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length===0 && <div className="text-sm" style={{color:"var(--muted)"}}>Ничего не найдено.</div>}
        {filtered.map(s => <SupplierCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}
