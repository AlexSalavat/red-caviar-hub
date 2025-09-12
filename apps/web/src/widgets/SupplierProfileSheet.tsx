import React from "react";
import type { Supplier, Listing } from "../types";

/* ───────── helpers ───────── */
const uniq = <T,>(xs: T[]) => Array.from(new Set(xs)).filter(Boolean) as T[];
const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="pill pill-verified">{children}</span>
);

function DocStatus({ s }: { s: Supplier }) {
  const hasMercury = !!(s.docs?.mercury && (s.docs.mercury.status === "linked" || s.docs.mercury.orgId));
  const hasCZ = !!(s.docs?.chestnyZnak && (s.docs.chestnyZnak.status === "linked" || s.docs.chestnyZnak.companyId));
  if (!hasMercury && !hasCZ && !s.verified) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasMercury && <Pill>Меркурий</Pill>}
      {hasCZ && <Pill>Честный знак</Pill>}
      {s.verified && <Pill>Проверено</Pill>}
    </div>
  );
}
const waLink = (raw?: string) => {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/[^\d+]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  return digits ? `https://wa.me/${digits}` : null;
};

/* ───────── props ───────── */
export type SupplierProfileSheetProps = {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  allListings: Listing[];
  onRevealContact?: (supplier: Supplier) => void | Promise<void>;
  onOpenListings?: (supplier: Supplier) => void;
};

export function SupplierProfileSheet({
  open,
  onClose,
  supplier,
  allListings,
  onRevealContact,
  onOpenListings,
}: SupplierProfileSheetProps) {
  /* ХУКИ — ВСЕГДА ВЫЗЫВАЕМ (не зависят от условий) */
  const [contactsOpen, setContactsOpen] = React.useState(false);
  React.useEffect(() => { if (open) setContactsOpen(false); }, [open]);

  // Всё ниже — тоже хуки, вызываем их всегда, а внутри используем безопасные значения
  const supplierId = supplier?.id ?? ""; // пустой id никогда не совпадёт
  const listings = React.useMemo(() => {
    return (allListings || [])
      .filter((l) => l && l.supplierId === supplierId)
      .sort((a, b) => +(new Date(b.createdAt ?? 0)) - +(new Date(a.createdAt ?? 0)));
  }, [allListings, supplierId]);

  const gallery: string[] = React.useMemo(() => {
    const pics = supplier?.gallery?.length ? supplier.gallery! : listings.flatMap((l) => l.photos || []);
    return pics.slice(0, 12);
  }, [supplier?.gallery, listings]);

  const productTags = React.useMemo(() => {
    const base = supplier?.categories?.length ? supplier!.categories! : (supplier?.products ?? []);
    return uniq<string>(base.map((t) => (t || "").trim())).slice(0, 8);
  }, [supplier?.categories, supplier?.products]);

  const pdfUrl: string | null = React.useMemo(() => {
    const pl = supplier?.priceList;
    return pl && pl.type === "pdf" ? pl.url : null;
  }, [supplier?.priceList]);

  const reveal = React.useCallback(async () => {
    if (!supplier) return;
    if (onRevealContact) await Promise.resolve(onRevealContact(supplier));
    setContactsOpen(true);
  }, [onRevealContact, supplier]);

  const contactNow = React.useCallback(async () => {
    if (!supplier) return;
    const tg = supplier.contacts?.tg;
    const wa = waLink(supplier.contacts?.whatsapp);
    if (tg) {
      const href = tg.startsWith("http")
        ? tg
        : tg.startsWith("@")
        ? `https://t.me/${tg.slice(1)}`
        : `https://t.me/${tg}`;
      window.open(href, "_blank");
      return;
    }
    if (wa) { window.open(wa, "_blank"); return; }
    await reveal();
  }, [supplier, reveal]);

  /* Если шит закрыт ИЛИ supplier ещё не выбран — просто ничего не рисуем,
     но ХУКИ выше уже вызвались и порядок стабильный. */
  if (!open || !supplier) return null;

  /* ───────── UI ───────── */
  return (
    <div className={"fixed inset-0 z-50 " + (open ? "pointer-events-auto" : "pointer-events-none")}>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={
          "absolute inset-0 bg-black/70 transition-opacity " + (open ? "opacity-100" : "opacity-0")
        }
      />
      {/* sheet */}
      <div className={"absolute bottom-0 left-0 right-0 " + (open ? "sheet-open" : "sheet-enter")}>
        <div className="glass neon rounded-t-[28px] border-white/10">
          <div className="pt-3">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="max-h-[90vh] overflow-y-auto px-6 pb-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden grid place-items-center">
                  {supplier.logoUrl ? (
                    <img src={supplier.logoUrl} alt={supplier.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white/80">
                      {supplier.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{supplier.displayName}</div>
                  <div className="text-[12px] text-white/60 truncate">
                    {supplier.city ? `${supplier.city}, ` : ""}
                    {supplier.regions.join(", ")}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button onClick={contactNow} className="btn btn-solid">Связаться</button>
                  <button onClick={onClose} className="btn btn-muted">Закрыть</button>
                </div>
              </div>

              {/* Статусы */}
              <div className="mt-3">
                <DocStatus s={supplier} />
              </div>

              {/* Категории / Продукция */}
              {!!productTags.length && (
                <section className="mt-4">
                  <div className="text-xs uppercase tracking-wide text-white/60">Категории / Продукция</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {productTags.map((t) => (
                      <span key={t} className="tag-dark">{t}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* О компании */}
              {supplier.about && (
                <section className="mt-4 rounded-2xl border border-white/10 p-4 bg-white/[.03]">
                  <div className="text-sm font-semibold mb-1 text-white">Краткое описание компании</div>
                  <div className="text-sm text-white/70 whitespace-pre-wrap">{supplier.about}</div>
                </section>
              )}

              {/* Прайс */}
              <section className="mt-4 rounded-2xl border border-white/10 p-4 bg-white/[.03]">
                <div className="text-sm font-semibold mb-2 text-white">Прайс-лист</div>
                {pdfUrl ? (
                  <div className="flex gap-2">
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-solid">Открыть PDF</a>
                    <a href={pdfUrl} download className="btn btn-muted">Скачать</a>
                  </div>
                ) : (
                  <div className="text-sm text-white/70">Прайс доступен по запросу.</div>
                )}
              </section>

              {/* Контакты */}
              {Boolean(
                supplier.contacts &&
                  (supplier.contacts.phone ||
                    supplier.contacts.email ||
                    supplier.contacts.tg ||
                    supplier.contacts.whatsapp ||
                    supplier.contacts.website)
              ) && (
                <section className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Контакты</div>
                    {!contactsOpen && (
                      <button onClick={reveal} className="btn btn-muted">Показать</button>
                    )}
                  </div>
                  {contactsOpen && (
                    <div className="mt-2 rounded-2xl border border-white/10 divide-y divide-white/10 bg-white/[.03]">
                      {supplier.contacts?.phone && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-white/60">Тел.: </span>
                          <a href={`tel:${supplier.contacts.phone}`} className="hover:underline">
                            {supplier.contacts.phone}
                          </a>
                        </div>
                      )}
                      {supplier.contacts?.whatsapp && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-white/60">WhatsApp: </span>
                          {(() => {
                            const link = waLink(supplier.contacts?.whatsapp);
                            return link ? (
                              <a href={link} target="_blank" className="hover:underline">
                                {supplier.contacts!.whatsapp}
                              </a>
                            ) : (
                              supplier.contacts!.whatsapp
                            );
                          })()}
                        </div>
                      )}
                      {supplier.contacts?.tg && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-white/60">Telegram: </span>
                          {supplier.contacts.tg}
                        </div>
                      )}
                      {supplier.contacts?.email && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-white/60">Email: </span>
                          <a href={`mailto:${supplier.contacts.email}`} className="hover:underline">
                            {supplier.contacts.email}
                          </a>
                        </div>
                      )}
                      {supplier.contacts?.website && (
                        <div className="px-4 py-2 text-sm truncate">
                          <span className="text-white/60">Сайт: </span>
                          <a href={supplier.contacts.website} target="_blank" className="hover:underline">
                            {supplier.contacts.website}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Адрес */}
              {Boolean(supplier.city || supplier.warehouseAddress || supplier.regions.length) && (
                <section className="mt-4 rounded-2xl border border-white/10 p-4 bg-white/[.03]">
                  <div className="text-sm font-semibold mb-1 text-white">Адрес</div>
                  <div className="text-sm text-white/70">
                    {supplier.city ? <>Город: {supplier.city}<br /></> : null}
                    {supplier.regions.length ? <>Регионы: {supplier.regions.join(", ")}<br /></> : null}
                    {supplier.warehouseAddress ? <>Склад: {supplier.warehouseAddress}</> : null}
                  </div>
                </section>
              )}

              {/* Галерея */}
              {!!gallery.length && (
                <section className="mt-4">
                  <div className="text-xs uppercase tracking-wide text-white/60">Галерея фото</div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {gallery.map((src, i) => (
                      <div key={`${src}-${i}`} className="aspect-square overflow-hidden rounded-xl bg-white/10">
                        <img src={src} alt="gallery" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Объявления */}
              <section className="mt-4">
                <div className="text-xs uppercase tracking-wide text-white/60">Объявления</div>
                {listings.length === 0 ? (
                  <div className="mt-2 text-sm text-white/70">Нет опубликованных объявлений</div>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {listings.slice(0, 3).map((l) => (
                      <li key={l.id} className="rounded-2xl border border-white/10 p-3 bg-white/[.03]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">{l.title}</div>
                            <div className="text-xs text-white/60">
                              {l.region} · {new Date(l.createdAt ?? Date.now()).toLocaleDateString("ru-RU")}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-semibold text-white">
                              {l.pricePerKgRUB.toLocaleString("ru-RU")} ₽/кг
                            </div>
                            <div className="text-xs text-white/60">
                              Объём: {l.batchVolumeKg.toLocaleString("ru-RU")} кг
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3">
                  <button onClick={() => supplier && onOpenListings?.(supplier)} className="btn btn-solid">
                    Все объявления
                  </button>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
