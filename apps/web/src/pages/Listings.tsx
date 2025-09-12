import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Supplier, Listing } from "../types";
import suppliersJson from "../mocks/suppliers.json";
import listingsJson from "../mocks/listings.json";

const suppliers: Supplier[] = (suppliersJson as unknown as Supplier[]) || [];
const allListings: Listing[] = (listingsJson as unknown as Listing[]) || [];

/* ───────── helpers ───────── */
const byId = new Map(suppliers.map(s => [s.id, s]));
const normalize = (s: string) => s.normalize("NFKC").toLowerCase();
const fmtRub = (n: number) => (Number.isFinite(n) ? n.toLocaleString("ru-RU") + " ₽" : "—");
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("ru-RU") : "");

function getCategory(l: Listing): string {
  // приоритет: явная категория → эвристика по названию
  const title = (l.title || "").toLowerCase();
  if ((l as any).__category) return (l as any).__category;
  if (/икр/.test(title)) return "Красная икра";
  if (/краб/.test(title)) return "Краб";
  return "Рыба/морепродукты";
}

function hasMercury(s?: Supplier | null) {
  return !!(s?.docs?.mercury && (s.docs.mercury.status === "linked" || s.docs.mercury.orgId));
}
function hasCZ(s?: Supplier | null) {
  // поле может отсутствовать — учитываем оба кейса
  const cz: any = (s as any)?.docs?.chestnyZnak;
  return !!(cz && (cz.status === "linked" || cz.companyId));
}

/* ───────── UI parts ───────── */
const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2 py-[3px] rounded-full text-[11px] font-medium bg-white/10 border border-white/10 text-white">
    {children}
  </span>
);

type Filters = {
  q: string;
  category: string;
  region: string;
  priceMin: string;
  priceMax: string;
  volMin: string;
};

export default function Listings() {
  const nav = useNavigate();
  const loc = useLocation();

  // supplierId из query ?supplierId=...
  const supplierId = React.useMemo(() => {
    const qs = new URLSearchParams(loc.search);
    return qs.get("supplierId") || "";
  }, [loc.search]);

  // источники для вариантов фильтров
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const l of allListings) set.add(getCategory(l));
    return ["", ...Array.from(set)];
  }, []);
  const regions = React.useMemo(() => {
    const set = new Set<string>();
    for (const l of allListings) if (l.region) set.add(l.region);
    for (const s of suppliers) (s.regions || []).forEach(r => set.add(r));
    return ["", ...Array.from(set)];
  }, []);

  // состояние фильтров
  const [filters, setFilters] = React.useState<Filters>({
    q: "",
    category: "",
    region: "",
    priceMin: "",
    priceMax: "",
    volMin: "",
  });

  // раскрытые контакты по id объявления
  const [openContacts, setOpenContacts] = React.useState<string | null>(null);

  // применённый список
  const items = React.useMemo(() => {
    const needle = normalize(filters.q.trim());
    const minP = filters.priceMin ? Number(filters.priceMin) : -Infinity;
    const maxP = filters.priceMax ? Number(filters.priceMax) : +Infinity;
    const minV = filters.volMin ? Number(filters.volMin) : -Infinity;
    return allListings
      .filter(l => (supplierId ? l.supplierId === supplierId : true))
      .filter(l => {
        if (filters.category && getCategory(l) !== filters.category) return false;
        if (filters.region && l.region !== filters.region) return false;
        if (Number.isFinite(minP) && l.pricePerKgRUB < minP) return false;
        if (Number.isFinite(maxP) && l.pricePerKgRUB > maxP) return false;
        if (Number.isFinite(minV) && l.batchVolumeKg < minV) return false;
        if (!needle) return true;
        const hay = [
          l.title, l.region,
          getCategory(l),
          byId.get(l.supplierId)?.displayName || ""
        ].join(" ").toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => +(new Date(b.createdAt || 0)) - +(new Date(a.createdAt || 0)));
  }, [filters, supplierId]);

  const reset = () => {
    setFilters({ q: "", category: "", region: "", priceMin: "", priceMax: "", volMin: "" });
  };

  return (
    <div className="min-h-screen bg-page-dark">
      <div className="container-safe py-4 space-y-4">

        {/* Фильтры */}
        <section className="glass neon rounded-3xl p-3">
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            <input
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Поиск: название, поставщик, регион…"
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base placeholder:text-white/40 text-white outline-none focus:ring-2 focus:ring-white/20"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base text-white outline-none"
            >
              {categories.map((c) => (
                <option key={c || "any"} value={c}>
                  {c ? c : "Все категории"}
                </option>
              ))}
            </select>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base text-white outline-none"
            >
              {regions.map((r) => (
                <option key={r || "any"} value={r}>
                  {r ? r : "Все регионы"}
                </option>
              ))}
            </select>

            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Цена от, ₽/кг"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value.replace(/[^\d]/g, "") })}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base text-white outline-none"
            />
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Цена до, ₽/кг"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value.replace(/[^\d]/g, "") })}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base text-white outline-none"
            />
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Мин. партия, кг"
              value={filters.volMin}
              onChange={(e) => setFilters({ ...filters, volMin: e.target.value.replace(/[^\d]/g, "") })}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base text-white outline-none"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[12px] text-white/60">
            <div>Найдено: {items.length} из {allListings.length}</div>
            <div className="flex gap-2">
              <button onClick={reset} className="btn btn-muted px-3 py-1.5 text-xs">Сброс</button>
            </div>
          </div>
        </section>

        {/* Листинг карточек */}
        <section className="grid gap-3">
          {items.map((l) => {
            const s = byId.get(l.supplierId) || null;
            const merc = hasMercury(s);
            const cz = hasCZ(s);
            return (
              <article key={l.id} className="rounded-3xl border border-white/10 bg-white/[.03] p-4 glass">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold line-clamp-2">{l.title}</div>
                    <div className="mt-1 text-[12px] text-white/60">
                      Поставщик: <span className="text-white/80">{s?.displayName || "—"}</span>
                      {l.region ? <> · {l.region}</> : null}
                      {l.createdAt ? <> · {fmtDate(l.createdAt)}</> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {merc && <Badge>Меркурий</Badge>}
                      {cz && <Badge>Честный знак</Badge>}
                      <Badge>{getCategory(l)}</Badge>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm text-white/60">Цена</div>
                    <div className="text-lg font-bold" style={{ color: "var(--neon1)" }}>
                      {fmtRub(l.pricePerKgRUB)}<span className="text-white/70 text-xs">/кг</span>
                    </div>
                    <div className="mt-1 text-sm text-white/70">
                      Объём: <span className="text-white">{l.batchVolumeKg.toLocaleString("ru-RU")}</span> кг
                    </div>
                  </div>
                </div>

                {/* Контакты — раскрываются локально по клику */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setOpenContacts(id => id === l.id ? null : l.id)}
                    className="btn btn-solid rounded-xl"
                  >
                    {openContacts === l.id ? "Скрыть контакты" : "Показать контакты"}
                  </button>
                  <button
                    onClick={() => nav(`/catalog?supplierId=${encodeURIComponent(l.supplierId)}`)}
                    className="btn btn-muted rounded-xl"
                  >
                    Профиль поставщика
                  </button>
                </div>

                {openContacts === l.id && (
                  <div className="mt-3 rounded-2xl border border-white/10 divide-y divide-white/10 bg-white/[.03]">
                    {s?.contacts?.phone && (
                      <div className="px-4 py-2 text-sm">
                        <span className="text-white/60">Тел.: </span>
                        <a href={`tel:${s.contacts.phone}`} className="hover:underline">{s.contacts.phone}</a>
                      </div>
                    )}
                    {s?.contacts?.whatsapp && (
                      <div className="px-4 py-2 text-sm">
                        <span className="text-white/60">WhatsApp: </span>
                        <span>{s.contacts.whatsapp}</span>
                      </div>
                    )}
                    {s?.contacts?.tg && (
                      <div className="px-4 py-2 text-sm">
                        <span className="text-white/60">Telegram: </span>
                        <span>{s.contacts.tg}</span>
                      </div>
                    )}
                    {s?.warehouseAddress && (
                      <div className="px-4 py-2 text-sm">
                        <span className="text-white/60">Склад: </span>
                        <span>{s.warehouseAddress}</span>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {items.length === 0 && (
            <div className="text-white/70">Нет объявлений по текущим фильтрам.</div>
          )}
        </section>
      </div>

      {/* Липкая CTA "Создать объявление" (заглушка) */}
      <div
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 80px + 8px)" }}
      >
        <div className="container-safe pointer-events-auto">
          <button
            className="w-full btn btn-solid rounded-2xl"
            onClick={() => alert("Форма создания объявления (MVP-заглушка)")}
          >
            Создать объявление
          </button>
        </div>
      </div>
    </div>
  );
}
