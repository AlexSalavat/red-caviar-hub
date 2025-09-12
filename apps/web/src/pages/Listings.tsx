import React from "react";
import { useSearchParams } from "react-router-dom";
import type { Supplier, Listing } from "../types";
import suppliersJson from "../mocks/suppliers.json";
import listingsJson from "../mocks/listings.json";
import { SupplierProfileSheet } from "../widgets/SupplierProfileSheet";

const suppliers = suppliersJson as unknown as Supplier[];
const listingsAll = listingsJson as unknown as Listing[];

const uniq = <T,>(xs: T[]) => Array.from(new Set(xs)).filter(Boolean) as T[];

type Cat = 'Все' | 'Красная икра' | 'Краб' | 'Рыба/морепродукты';

export default function Listings() {
  const [params] = useSearchParams();
  const supplierIdParam = params.get("supplierId") || undefined;

  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<Cat>('Все');

  const [activeSupplier, setActiveSupplier] = React.useState<Supplier | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const supplierById = React.useMemo(() => {
    const m = new Map<string, Supplier>();
    suppliers.forEach(s => m.set(s.id, s));
    return m;
  }, []);

  const cats: Cat[] = ['Все', ...uniq((listingsAll.map(l => l.__category).filter(Boolean) as Cat[]))];

  const base = React.useMemo(() => {
    let xs = listingsAll.slice().sort((a,b)=>+(new Date(b.createdAt ?? 0)) - +(new Date(a.createdAt ?? 0)));
    if (supplierIdParam) xs = xs.filter(l => l.supplierId === supplierIdParam);
    if (cat !== 'Все') xs = xs.filter(l => l.__category === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      xs = xs.filter(l => `${l.title} ${l.region}`.toLowerCase().includes(t));
    }
    return xs;
  }, [q, cat, supplierIdParam]);

  const openSupplier = (supplierId: string) => {
    const s = supplierById.get(supplierId) || null;
    setActiveSupplier(s);
    setSheetOpen(!!s);
  };

  return (
    <div className="min-h-screen bg-page-dark">
      <div className="container-safe py-4">
        {/* Фильтры */}
        <div className="glass neon p-3 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Поиск по названию или региону…"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-white/40 text-white outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="flex flex-wrap gap-2">
              {cats.map(c => (
                <button
                  key={c}
                  onClick={()=>setCat(c)}
                  className={
                    "px-3 py-1 rounded-full text-sm border " +
                    (cat===c ? "bg-white/15 border-white/20 text-white" : "bg-transparent border-white/15 text-white/80 hover:bg-white/10")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Лента объявлений */}
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {base.map(l => {
            const s = supplierById.get(l.supplierId);
            const photos = (l.photos || []).slice(0,3);
            return (
              <div key={l.id} className="glass neon spot rounded-3xl p-3">
                {/* Фото превью */}
                {!!photos.length && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((src, i)=>(
                      <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl bg-white/10">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Инфо */}
                <div className="mt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[12px] text-white/70">{l.__category || "Объявление"}</div>
                      <h3 className="text-white font-semibold leading-snug mt-0.5 truncate">{l.title}</h3>
                      <div className="text-[12px] text-white/60 mt-0.5">{l.region} · объём {l.batchVolumeKg.toLocaleString("ru-RU")} кг</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold" style={{color:"var(--neon1)"}}>
                        {l.pricePerKgRUB.toLocaleString("ru-RU")} ₽/кг
                      </div>
                    </div>
                  </div>

                  {/* Поставщик */}
                  {s && (
                    <button
                      onClick={()=>openSupplier(s.id)}
                      className="mt-3 w-full btn btn-ghost"
                      title="Открыть профиль поставщика"
                    >
                      Поставщик: {s.displayName}
                    </button>
                  )}

                  {/* Действия */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button className="btn btn-solid" onClick={()=>openSupplier(l.supplierId)}>Связаться</button>
                    <a className="btn btn-muted" href={`/?tab=listings&listing=${l.id}`} onClick={(e)=>e.preventDefault()}>Поделиться</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Профиль поставщика как шит */}
      <SupplierProfileSheet
        open={sheetOpen}
        onClose={()=>setSheetOpen(false)}
        supplier={activeSupplier}
        allListings={listingsAll}
        onOpenListings={(s)=>{ setSheetOpen(false); /* можно навигейтить на фильтр */ }}
      />
    </div>
  );
}
