import { useEffect, useMemo, useState } from "react";
import type { Supplier, Listing } from "../types";

/** Премиум-шит профиля поставщика.
 * Микроанимации на CSS, без framer-motion.
 */
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
  useEffect(() => { setShowContacts(false); }, [open, supplier?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const docs = supplier?.docs || {};
  const hasMercury = docs?.mercury?.status === "linked";
  const hasCZ = docs?.chestnyZnak?.status === "linked";
  const verified = !!supplier?.verified;

  const gallery = useMemo(() => {
    if (!supplier) return [];
    const g = supplier.gallery && supplier.gallery.length ? supplier.gallery : [];
    const fromListings = listings
      .filter(l => l.supplierId === supplier.id)
      .flatMap(l => l.photos || []);
    return (g.length ? g : fromListings).slice(0, 20);
  }, [supplier, listings]);

  const last3 = useMemo(() => {
    if (!supplier) return [];
    return listings
      .filter(l => l.supplierId === supplier.id)
      .sort((a,b)=>(b.createdAt?+new Date(b.createdAt):0)-(a.createdAt?+new Date(a.createdAt):0))
      .slice(0,3);
  }, [supplier, listings]);

  if (!open || !supplier) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-200 data-[show=true]:opacity-100"
        data-show={open}
        onClick={onClose}
        aria-label="Закрыть"
      />
      {/* panel */}
      <div
        className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none"
        aria-hidden
      >
        <section
          className="pointer-events-auto bg-transparent"
          style={{ width: "100%" }}
        >
          <div
            className="glass glass-neon mx-auto mt-auto sm:mt-0 max-w-[980px] rounded-t-2xl sm:rounded-2xl border border-[var(--border)]
                       translate-y-4 opacity-0 transition-all duration-220 ease-out data-[show=true]:translate-y-0 data-[show=true]:opacity-100"
            data-show={open}
          >
            {/* шапка */}
            <header className="p-4 border-b border-[var(--border)] flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="logo-wrap">
                  {supplier.logoUrl ? (
                    <img className="logo-img" src={supplier.logoUrl} alt={supplier.displayName} loading="lazy" decoding="async" />
                  ) : (
                    <div className="avatar">{initials(supplier.displayName)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate">{supplier.displayName}</h2>
                  <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
                    {[supplier.city, (supplier.regions || []).join(", ")].filter(Boolean).join(" • ")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hasMercury && <span className="pill">Меркурий</span>}
                    {hasCZ && <span className="pill">Честный знак</span>}
                    {verified && <span className="pill pill-verified">Проверено</span>}
                    {(supplier.categories || []).slice(0, 4).map((c) => <span key={c} className="tag-dark">{c}</span>)}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {supplier.priceList?.url && (
                  <a className="btn px-3 py-1.5 text-[12px]" href={supplier.priceList.url} target="_blank" rel="noreferrer">Прайс (PDF)</a>
                )}
                <button className="btn px-3 py-1.5 text-[12px]" onClick={onClose}>Закрыть</button>
              </div>
            </header>

            {/* тело */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
              {/* левая колонка */}
              <div className="space-y-4">
                {/* Описание */}
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
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: "var(--muted)" }}>
                    {docs?.mercury?.orgId && <div>Орг. ID (Меркурий): <span className="opacity-90">{docs.mercury.orgId}</span></div>}
                    {docs?.chestnyZnak?.companyId && <div>ID компании (ЧЗ): <span className="opacity-90">{docs.chestnyZnak.companyId}</span></div>}
                  </div>
                </div>

                {/* Галерея 4×N */}
                {gallery.length > 0 && (
                  <div className="glass p-4 rounded-xl border border-[var(--border)]">
                    <div className="text-sm font-semibold mb-3">Галерея</div>
                    <div className="grid grid-cols-4 gap-2">
                      {gallery.map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.03)]">
                          <img
                            src={src}
                            alt={`${supplier.displayName} фото ${i+1}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* правая колонка */}
              <aside className="space-y-4">
                {/* Контакты */}
                <div className="glass p-4 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Контакты</div>
                    <button className="btn px-3 py-1.5 text-[12px]" onClick={() => setShowContacts(v=>!v)}>
                      {showContacts ? "Скрыть" : "Показать"}
                    </button>
                  </div>
                  {showContacts && (
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                      {supplier.contacts?.phone   && <div>Телефон: <span className="opacity-90">{supplier.contacts.phone}</span></div>}
                      {supplier.contacts?.whatsapp&& <div>WhatsApp: <span className="opacity-90">{supplier.contacts.whatsapp}</span></div>}
                      {supplier.contacts?.tg      && <div>Telegram: <span className="opacity-90">{supplier.contacts.tg}</span></div>}
                      {supplier.contacts?.email   && <div>Email: <span className="opacity-90">{supplier.contacts.email}</span></div>}
                      {supplier.contacts?.website && <div>Сайт: <a className="underline opacity-90" href={supplier.contacts.website} target="_blank" rel="noreferrer">перейти</a></div>}
                    </div>
                  )}
                </div>

                {/* Последние объявления */}
                <div className="glass p-4 rounded-xl border border-[var(--border)]">
                  <div className="text-sm font-semibold mb-3">Последние объявления</div>
                  <div className="space-y-2">
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
    </div>
  );
}

function Badge({ ok, label, green }: { ok: boolean; label: string; green?: boolean }) {
  if (green) {
    return <span className={`pill ${ok ? "pill-verified" : ""}`}>{label}{!ok && " — нет"}</span>;
  }
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
