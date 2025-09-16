import { useEffect, useMemo, useState } from "react";
import type { Supplier, Listing } from "../types";
import GalleryLightbox from "./GalleryLightbox";

export default function SupplierProfileSheet({
  open,
  supplier,
  listings = [],
  onClose,
}: {
  open: boolean;
  supplier: Supplier | null;
  listings?: Listing[];
  onClose: () => void;
}) {
  const [showContacts, setShowContacts] = useState(false);
  const [lbIdx, setLbIdx] = useState<number | null>(null);

  // сброс при каждом открытии/смене поставщика
  useEffect(() => { setShowContacts(false); setLbIdx(null); }, [open, supplier?.id]);

  // ESC закрывает шит
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Лочим фон — скроллится только панель
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prev; };
  }, [open]);

  const docs = supplier?.docs || {};
  const hasMercury = docs?.mercury?.status === "linked";
  const hasCZ = docs?.chestnyZnak?.status === "linked";
  const verified = !!supplier?.verified;

  // ТОЛЬКО фирменная галерея
  const gallery = useMemo(() => {
    if (!supplier) return [];
    return Array.isArray(supplier.gallery) ? supplier.gallery.slice(0, 24) : [];
  }, [supplier]);

  // Последние 3 объявления (без фото)
  const last3 = useMemo(() => {
    if (!supplier) return [];
    return listings
      .filter((l) => l.supplierId === supplier.id)
      .sort((a,b)=> (b.createdAt?+new Date(b.createdAt):0) - (a.createdAt?+new Date(a.createdAt):0))
      .slice(0,3);
  }, [supplier, listings]);

  if (!open || !supplier) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-200 data-[show=true]:opacity-100"
        data-show={open}
        onClick={onClose}
        aria-label="Закрыть"
      />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={supplier.displayName}
          className="
            glass glass-neon mx-auto mt-auto sm:mt-0 w-full max-w-[980px]
            rounded-t-2xl sm:rounded-2xl border border-[var(--border)]
            translate-y-4 opacity-0 transition-all duration-200 ease-out
            data-[show=true]:translate-y-0 data-[show=true]:opacity-100
            overflow-hidden
          "
          data-show={open}
          style={{ maxHeight: "calc(100svh - 16px)", WebkitOverflowScrolling: "touch" as any }}
        >
          {/* внутренний скролл */}
          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: "calc(100svh - 16px)", WebkitOverflowScrolling: "touch" as any }}
          >
            {/* ШАПКА: мобильная — колонками, ≥sm — в строку */}
            <header
              className="sticky top-0 z-10 border-b border-[var(--border)] backdrop-blur-sm"
              style={{ background: "rgba(18,24,38,.72)", paddingTop: "max(env(safe-area-inset-top), 10px)" }}
            >
              <div className="px-4 pt-3 pb-3 sm:py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* блок: лого + текст */}
                  <div className="grid grid-cols-[auto,1fr] items-center gap-3 min-w-0">
                    {/* LOGO: 84 мобайл / 96 десктоп */}
                    <div
                      className="relative shrink-0 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,.03)]"
                      style={{ width: 84, height: 84 }}
                    >
                      {supplier.logoUrl ? (
                        <img
                          className="h-full w-full object-cover"
                          src={supplier.logoUrl}
                          alt={supplier.displayName}
                          loading="lazy"
                          decoding="async"
                          style={{ objectPosition: "50% 50%" }}
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-sm font-semibold">
                          {initials(supplier.displayName)}
                        </div>
                      )}
                      <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-[rgba(54,209,204,.18)]" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-[16px] sm:text-[17px] leading-[1.25] font-semibold">
                        {supplier.displayName}
                      </h2>
                      <div className="truncate text-[12px] leading-[1.25] mt-0.5" style={{ color: "var(--muted)" }}>
                        {[supplier.city, (supplier.regions || []).join(", ")].filter(Boolean).join(" • ")}
                      </div>

                      {/* бейджи переносятся аккуратно */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {hasMercury && <span className="pill">Меркурий</span>}
                        {hasCZ && <span className="pill">Честный знак</span>}
                        {verified && <span className="pill pill-verified">Проверено</span>}
                        {(supplier.categories || []).slice(0, 4).map((c) => (
                          <span key={c} className="tag-dark">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* КНОПКИ: на мобиле отдельной строкой ниже, на ≥sm справа */}
                  <div className="flex gap-2 sm:gap-2">
                    {supplier.priceList?.url && (
                      <a
                        className="btn px-3 py-1.5 text-[12px]"
                        href={supplier.priceList.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Прайс (PDF)
                      </a>
                    )}
                    <button className="btn px-3 py-1.5 text-[12px]" onClick={onClose}>Закрыть</button>
                  </div>
                </div>
              </div>
            </header>

            {/* КОНТЕНТ */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
              {/* ЛЕВАЯ КОЛОНКА */}
              <div className="space-y-4">
                {(supplier.about || supplier.warehouseAddress) && (
                  <div className="glass p-4 rounded-xl border border-[var(--border)]">
                    {supplier.about && <p className="text-sm leading-relaxed">{supplier.about}</p>}
                    {supplier.warehouseAddress && (
                      <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
                        Склад: {supplier.warehouseAddress}
                      </p>
                    )}
                  </div>
                )}

                {/* Документы */}
                <div className="glass p-4 rounded-xl border border-[var(--border)]">
                  <div className="text-sm font-semibold mb-3">Документы</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge ok={hasMercury} label="Меркурий" />
                    <Badge ok={hasCZ} label="Честный знак" />
                    <Badge ok={verified} label="Проверено" green />
                  </div>
                </div>

                {/* Прайс-лист — отдельный и заметный блок */}
                {supplier.priceList?.url && (
                  <div className="glass p-4 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">Прайс-лист</div>
                      <a
                        className="btn px-3 py-1.5 text-[12px]"
                        href={supplier.priceList.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        onClick={(e)=>e.stopPropagation()}
                      >
                        Открыть PDF
                      </a>
                    </div>
                    <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                      Файл: {supplier.priceList.url}
                    </div>
                  </div>
                )}

                {/* Галерея: 3 колонки на мобиле, 4 на десктопе */}
                {gallery.length > 0 && (
                  <div className="glass p-4 rounded-xl border border-[var(--border)]">
                    <div className="text-sm font-semibold mb-3">Галерея</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {gallery.map((src, i) => (
                        <button
                          type="button"
                          key={i}
                          className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.03)] focus:outline-none focus:ring-2 focus:ring-[rgba(54,209,204,.35)]"
                          onClick={() => setLbIdx(i)}
                        >
                          <img
                            src={src}
                            alt={`${supplier.displayName} фото ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ПРАВАЯ КОЛОНКА */}
              <aside className="space-y-4">
                <div className="glass p-4 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Контакты</div>
                    <button className="btn px-3 py-1.5 text-[12px]" onClick={() => setShowContacts(v => !v)}>
                      {showContacts ? "Скрыть" : "Показать"}
                    </button>
                  </div>
                  {showContacts && (
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                      {supplier.contacts?.phone    && <div>Телефон: <span className="opacity-90">{supplier.contacts.phone}</span></div>}
                      {supplier.contacts?.whatsapp && <div>WhatsApp: <span className="opacity-90">{supplier.contacts.whatsapp}</span></div>}
                      {supplier.contacts?.tg       && <div>Telegram: <span className="opacity-90">{supplier.contacts.tg}</span></div>}
                      {supplier.contacts?.email    && <div>Email: <span className="opacity-90">{supplier.contacts.email}</span></div>}
                      {supplier.contacts?.website  && <div>Сайт: <a className="underline opacity-90" href={supplier.contacts.website} target="_blank" rel="noreferrer">перейти</a></div>}
                    </div>
                  )}
                </div>

                {/* Последние объявления — без фото, с кнопкой «Все объявления» */}
                <div className="glass p-4 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Последние объявления</div>
                    <a href={`/listings?supplier=${encodeURIComponent(supplier.id)}`} className="btn btn-muted px-3 py-1.5 text-[12px]">
                      Все объявления
                    </a>
                  </div>
                  <div className="mt-3 space-y-2">
                    {last3.length === 0 && (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>Пока нет объявлений.</div>
                    )}
                    {last3.map((l) => (
                      <div key={l.id} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                        <div className="min-w-0">
                          <div className="truncate">{l.title}</div>
                          <div className="text-xs" style={{ color: "var(--muted)" }}>
                            {l.region} • {l.createdAt ? new Date(l.createdAt).toLocaleDateString("ru-RU") : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[12px]" style={{ color: "var(--muted)" }}>Цена</div>
                          <div className="font-semibold">{tryRub(l.pricePerKgRUB)} ₽/кг</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>

      {/* Лайтбокс */}
      {lbIdx !== null && (
        <GalleryLightbox
          images={gallery}
          startIndex={lbIdx}
          onClose={() => setLbIdx(null)}
        />
      )}
    </div>
  );
}

function Badge({ ok, label, green }: { ok: boolean; label: string; green?: boolean }) {
  if (green) return <span className={`pill ${ok ? "pill-verified" : ""}`}>{label}{!ok && " — нет"}</span>;
  return <span className="pill">{label}{!ok && " — нет"}</span>;
}
function tryRub(n?: number) {
  if (typeof n !== "number") return "";
  try { return n.toLocaleString("ru-RU"); } catch { return String(n); }
}
function initials(name?: string) {
  return (name || "")
    .split(/\s+/).filter(Boolean).slice(0,2)
    .map(w => w[0]?.toUpperCase() || "").join("") || "RK";
}
