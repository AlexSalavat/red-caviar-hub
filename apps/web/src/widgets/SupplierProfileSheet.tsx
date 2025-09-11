import React from "react";
import type { Supplier, Listing } from "../types";

/* helpers */
const uniq = <T,>(xs: T[]) => Array.from(new Set(xs)).filter(Boolean) as T[];
const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
    {children}
  </span>
);

function DocStatus({ s }: { s: Supplier }) {
  // Показываем ТОЛЬКО если есть подключение
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

/* props */
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
  const [contactsOpen, setContactsOpen] = React.useState(false);
  React.useEffect(() => { if (open) setContactsOpen(false); }, [open]);
  if (!supplier) return null;

  const listings = allListings
    .filter((l) => l.supplierId === supplier.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const gallery: string[] = (supplier.gallery?.length ? supplier.gallery : listings.flatMap((l) => l.photos)).slice(0, 12);

  const productTags = uniq<string>(
    ((supplier.categories?.length ? supplier.categories : supplier.products) ?? [])
      .map(s => s.trim())
  ).slice(0, 8);

  const reveal = async () => {
    if (onRevealContact) await Promise.resolve(onRevealContact(supplier));
    setContactsOpen(true);
  };

  const contactNow = async () => {
    const tg = supplier.contacts?.tg;
    if (tg) {
      const href = tg.startsWith("http") ? tg : tg.startsWith("@") ? `https://t.me/${tg.slice(1)}` : `https://t.me/${tg}`;
      window.open(href, "_blank");
      return;
    }
    await reveal();
  };

  // Надёжное сужение типов для PDF
  let pdfUrl: string | null = null;
  if (supplier.priceList && supplier.priceList.type === "pdf") {
    pdfUrl = supplier.priceList.url;
  }

  return (
    <div className={"fixed inset-0 z-50 " + (open ? "pointer-events-auto" : "pointer-events-none")}>
      {/* backdrop */}
      <div onClick={onClose} className={"absolute inset-0 bg-black/55 transition-opacity " + (open ? "opacity-100" : "opacity-0")} />

      {/* sheet */}
      <div className={"absolute bottom-0 left-0 right-0 transition-transform duration-300 " + (open ? "translate-y-0" : "translate-y-full")}>
        <div className="rounded-t-[28px] bg-white border border-slate-200 shadow-2xl">
          {/* handle + scroll area (чтобы верх не обрезался) */}
          <div className="pt-3">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/70" />
            <div className="max-h-[90vh] overflow-y-auto px-6 pb-6">

              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                  {supplier.logoUrl ? (
                    <img src={supplier.logoUrl} alt={supplier.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-sm font-bold text-slate-600">
                      {supplier.displayName.slice(0,2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{supplier.displayName}</div>
                  <div className="text-xs text-slate-600 truncate">
                    {supplier.city ? `${supplier.city}, ` : ''}{supplier.regions.join(", ")}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button onClick={contactNow} className="btn rounded-xl bg-slate-900 text-white hover:bg-slate-800">Связаться</button>
                  <button onClick={onClose} className="btn btn-secondary">Закрыть</button>
                </div>
              </div>

              {/* Зелёные статусы (если есть) */}
              <div className="mt-3">
                <DocStatus s={supplier} />
              </div>

              {/* 1) Категории / Продукция */}
              {!!productTags.length && (
                <section className="mt-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Категории / Продукция</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {productTags.map(t => (
                      <span key={t} className="chip chip-muted">{t}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* 2) Краткое описание компании */}
              {supplier.about && (
                <section className="mt-4 rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold mb-1">Краткое описание компании</div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{supplier.about}</div>
                </section>
              )}

              {/* 3) Прайс (только файл/ссылка) */}
              <section className="mt-4 rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold mb-2">Прайс-лист</div>
                {pdfUrl ? (
                  <div className="flex gap-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Открыть PDF
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="btn btn-secondary"
                    >
                      Скачать
                    </a>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">Прайс доступен по запросу.</div>
                )}
              </section>

              {/* 4) Контакты */}
              {(supplier.contacts && (supplier.contacts.phone || supplier.contacts.email || supplier.contacts.tg || supplier.contacts.website)) && (
                <section className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Контакты</div>
                    {!contactsOpen && <button onClick={reveal} className="btn btn-secondary">Показать</button>}
                  </div>
                  {contactsOpen && (
                    <div className="mt-2 rounded-xl border border-slate-200 divide-y">
                      {supplier.contacts.phone && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-slate-500">Тел.: </span>
                          <a href={`tel:${supplier.contacts.phone}`} className="hover:underline">{supplier.contacts.phone}</a>
                        </div>
                      )}
                      {supplier.contacts.email && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-slate-500">Email: </span>
                          <a href={`mailto:${supplier.contacts.email}`} className="hover:underline">{supplier.contacts.email}</a>
                        </div>
                      )}
                      {supplier.contacts.tg && (
                        <div className="px-4 py-2 text-sm">
                          <span className="text-slate-500">Telegram: </span>{supplier.contacts.tg}
                        </div>
                      )}
                      {supplier.contacts.website && (
                        <div className="px-4 py-2 text-sm truncate">
                          <span className="text-slate-500">Сайт: </span>
                          <a href={supplier.contacts.website} target="_blank" className="hover:underline">{supplier.contacts.website}</a>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* 5) Адрес */}
              {(supplier.city || supplier.warehouseAddress || supplier.regions.length) && (
                <section className="mt-4 rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold mb-1">Адрес</div>
                  <div className="text-sm text-slate-700">
                    {supplier.city ? <>Город: {supplier.city}<br /></> : null}
                    {supplier.regions.length ? <>Регионы: {supplier.regions.join(", ")}<br /></> : null}
                    {supplier.warehouseAddress ? <>Склад: {supplier.warehouseAddress}</> : null}
                  </div>
                </section>
              )}

              {/* 6) Галерея фото */}
              {!!gallery.length && (
                <section className="mt-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Галерея фото</div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {gallery.map((src, i) => (
                      <div key={i} className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                        <img src={src} alt="gallery" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 7) Объявления (в конце) */}
              <section className="mt-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Объявления</div>
                {listings.length === 0 ? (
                  <div className="mt-2 text-sm text-slate-500">Нет опубликованных объявлений</div>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {listings.slice(0, 3).map((l) => (
                      <li key={l.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate">{l.title}</div>
                            <div className="text-xs text-slate-600">
                              {l.region} · {new Date(l.createdAt).toLocaleDateString("ru-RU")}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-semibold text-slate-900">
                              {l.pricePerKgRUB.toLocaleString("ru-RU")} ₽/кг
                            </div>
                            <div className="text-xs text-slate-600">
                              Объём: {l.batchVolumeKg.toLocaleString("ru-RU")} кг
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3">
                  <button onClick={() => onOpenListings?.(supplier)} className="btn rounded-xl bg-slate-900 text-white hover:bg-slate-800">
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
