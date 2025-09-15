import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import suppliersJson from "../mocks/suppliers.json";
import listingsJson from "../mocks/listings.json";
import type { Supplier, Listing } from "../types";

export default function SupplierPage() {
  const { id } = useParams();
  const suppliers = (Array.isArray(suppliersJson) ? suppliersJson : []) as Supplier[];
  const listings = (Array.isArray(listingsJson) ? listingsJson : []) as Listing[];

  const supplier = useMemo(() => suppliers.find((s) => s.id === id), [suppliers, id]);
  const lastListings = useMemo(
    () =>
      listings
        .filter((l) => l.supplierId === id)
        .sort((a, b) => (b.createdAt ? +new Date(b.createdAt) : 0) - (a.createdAt ? +new Date(a.createdAt) : 0))
        .slice(0, 3),
    [listings, id]
  );

  const [showContacts, setShowContacts] = useState(false);

  if (!supplier) {
    return (
      <div className="glass p-6 border border-[var(--border)] rounded-2xl">
        <div className="text-lg">Поставщик не найден</div>
        <div className="mt-3">
          <Link to="/catalog" className="btn">← Назад в каталог</Link>
        </div>
      </div>
    );
  }

  const docs = supplier.docs || {};
  const hasMercury = docs?.mercury?.status === "linked";
  const hasCZ = docs?.chestnyZnak?.status === "linked";

  const gallery =
    supplier.gallery && supplier.gallery.length
      ? supplier.gallery
      : listings.filter((l) => l.supplierId === supplier.id).flatMap((l) => l.photos || []).slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="glass glass-neon p-4 border border-[var(--border)] rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="logo-wrap">
            {supplier.logoUrl ? (
              <img className="logo-img" src={supplier.logoUrl} alt={supplier.displayName} loading="lazy" decoding="async" />
            ) : (
              <div className="avatar">{(supplier.displayName || "RK").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold">{supplier.displayName}</h1>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              {[supplier.city, (supplier.regions || []).join(", ")].filter(Boolean).join(" • ")}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {hasMercury && <span className="pill">Меркурий</span>}
              {hasCZ && <span className="pill">Честный знак</span>}
              {supplier.verified && <span className="pill pill-verified">Проверено</span>}
              {(supplier.categories || []).slice(0, 4).map((c) => (
                <span key={c} className="tag-dark">{c}</span>
              ))}
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            {supplier.priceList?.url && (
              <a className="btn" href={supplier.priceList.url} target="_blank" rel="noreferrer">
                Прайс (PDF)
              </a>
            )}
            <button className="btn" onClick={() => setShowContacts((v) => !v)}>
              {showContacts ? "Скрыть контакты" : "Показать контакты"}
            </button>
          </div>
        </div>

        {showContacts && (
          <div className="glass p-3 border border-[var(--border)] rounded-xl mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {supplier.contacts?.phone && <div>Телефон: <span className="opacity-90">{supplier.contacts.phone}</span></div>}
              {supplier.contacts?.whatsapp && <div>WhatsApp: <span className="opacity-90">{supplier.contacts.whatsapp}</span></div>}
              {supplier.contacts?.tg && <div>Telegram: <span className="opacity-90">{supplier.contacts.tg}</span></div>}
              {supplier.contacts?.email && <div>Email: <span className="opacity-90">{supplier.contacts.email}</span></div>}
              {supplier.contacts?.website && (
                <div>Сайт: <a className="underline opacity-90" href={supplier.contacts.website} target="_blank" rel="noreferrer">перейти</a></div>
              )}
            </div>
          </div>
        )}
      </div>

      {supplier.about && (
        <div className="glass p-4 border border-[var(--border)] rounded-2xl text-sm" style={{ color: "var(--ink)" }}>
          {supplier.about}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="glass p-4 border border-[var(--border)] rounded-2xl">
          <div className="grid grid-cols-4 gap-2">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.03)]">
                <img src={src} alt={`${supplier.displayName} фото ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <Link to="/catalog" className="btn">← Назад в каталог</Link>
      </div>
    </div>
  );
}
