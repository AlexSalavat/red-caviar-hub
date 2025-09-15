import { useMemo, useState } from "react";
import listingsJson from "../mocks/listings.json";
import suppliersJson from "../mocks/suppliers.json";
import type { Listing, Supplier } from "../types";
import ListingCard from "../widgets/ListingCard";

type Filters = { q: string; cat: string; region: string; priceMin?: number | ""; priceMax?: number | ""; minBatch?: number | ""; };
const norm = (s:string)=> (s||"").toLowerCase().normalize("NFKD").replace(/\s+/g," ").trim();

export default function Listings() {
  const suppliers: Supplier[] = useMemo(() => (Array.isArray(suppliersJson) ? suppliersJson : []).filter(Boolean) as Supplier[], []);
  const supplierById = useMemo(() => new Map(suppliers.map(s=>[s.id,s])), [suppliers]);
  const listings: Listing[]  = useMemo(() => (Array.isArray(listingsJson) ? listingsJson : []).filter(Boolean) as Listing[], []);

  const categories = useMemo(()=>Array.from(new Set(listings.map(l=>l.__category).filter(Boolean) as string[])),[listings]);
  const regions    = useMemo(()=>Array.from(new Set(listings.map(l=>l.region).filter(Boolean))),[listings]);

  const [f, setF] = useState<Filters>({ q:"", cat:"", region:"", priceMin:"", priceMax:"", minBatch:"" });

  const filtered = useMemo(()=>{
    const nq = norm(f.q);
    return listings
      .filter(l=>{
        if (f.cat && l.__category !== f.cat) return false;
        if (f.region && l.region !== f.region) return false;
        if (f.priceMin !== "" && l.pricePerKgRUB < Number(f.priceMin)) return false;
        if (f.priceMax !== "" && l.pricePerKgRUB > Number(f.priceMax)) return false;
        if (f.minBatch !== "" && l.batchVolumeKg < Number(f.minBatch)) return false;
        if (!nq) return true;
        const s = supplierById.get(l.supplierId);
        const hay = [l.title,l.region,l.__category||"",...(l.packaging||[]),s?.displayName||"",s?.city||"",...(s?.regions||[])]
          .filter(Boolean).map(norm).join(" ");
        return hay.includes(nq);
      })
      .sort((a,b)=> (b.createdAt?+new Date(b.createdAt):0) - (a.createdAt?+new Date(a.createdAt):0));
  },[listings, f, supplierById]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Объявления</h1>

      {/* Фильтры */}
      <div className="glass glass-neon p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <input className="input-neon w-full" placeholder="Поиск: название, поставщик, регион…" value={f.q} onChange={e=>setF({...f, q:e.target.value})}/>
          </div>

          <select className="input-neon" value={f.cat} onChange={e=>setF({...f, cat:e.target.value})}>
            <option value="">Все категории</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="input-neon" value={f.region} onChange={e=>setF({...f, region:e.target.value})}>
            <option value="">Все регионы</option>
            {regions.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input className="input-neon" inputMode="numeric" placeholder="Цена от, ₽/кг" value={f.priceMin}
                   onChange={e=>setF({...f, priceMin: e.target.value===""? "" : Number(e.target.value.replace(/\D/g,""))})}/>
            <input className="input-neon" inputMode="numeric" placeholder="Цена до, ₽/кг" value={f.priceMax}
                   onChange={e=>setF({...f, priceMax: e.target.value===""? "" : Number(e.target.value.replace(/\D/g,""))})}/>
          </div>

          <input className="input-neon" inputMode="numeric" placeholder="Мин. партия, кг" value={f.minBatch}
                 onChange={e=>setF({...f, minBatch: e.target.value===""? "" : Number(e.target.value.replace(/\D/g,""))})}/>

          <div className="sm:col-span-3 flex items-center gap-3">
            <button className="btn" onClick={()=>setF({ q:"", cat:"", region:"", priceMin:"", priceMax:"", minBatch:"" })}>Сбросить</button>
            <div className="text-sm" style={{color:"var(--muted)"}}>Найдено: {filtered.length} из {listings.length}</div>
          </div>
        </div>
      </div>

      {/* Лента */}
      <div className="grid grid-cols-1 gap-3 pb-24">
        {filtered.map(l => {
          const s = supplierById.get(l.supplierId);
          if(!s) return null;
          return <ListingCard key={l.id} listing={l} supplier={s}/>;
        })}
      </div>
    </div>
  );
}
