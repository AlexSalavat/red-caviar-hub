import { useMemo, useState } from "react";
import type { Listing, Supplier } from "../types";
import { Link } from "react-router-dom";

function rub(n: number) {
  try { return n.toLocaleString("ru-RU"); } catch { return String(n); }
}
function relDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(+d)) return "";
  const diff = Date.now() - +d;
  const day = 86_400_000;
  if (diff < day) return "сегодня";
  if (diff < 2 * day) return "вчера";
  return d.toLocaleDateString("ru-RU");
}

export default function ListingCard({ listing, supplier }: { listing: Listing; supplier: Supplier }) {
  const [showContacts, setShowContacts] = useState(false);

  const docs = supplier?.docs || {};
  const hasMercury = docs?.mercury?.status === "linked";
  const hasCZ = docs?.chestnyZnak?.status === "linked";
  const verified = !!supplier?.verified;

  const photos = useMemo(() => {
    const p = listing.photos && listing.photos.length ? listing.photos : (supplier.gallery || []);
    return p.slice(0, 6); // ровная сетка до 6 фото
  }, [listing.photos, supplier.gallery]);

  return (
    <article
      className="glass card border border-[var(--border)] hover:border-[var(--border-strong)] transition"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,.04) inset, 0 12px 28px var(--shadow)" }}
    >
      {/* Верхняя зона: теги + заголовок + мета + кнопки */}
      <div className="grid grid-cols-[1fr_auto] gap-3">
        {/* Левый блок */}
        <div className="min-w-0 space-y-2">
          {/* Теги / бейджи — тонкие, без заливки */}
          <div className="flex flex-wrap items-center gap-2">
            {listing.__category && <span className="tag-dark">{listing.__category}</span>}
            {hasMercury && <span className="pill">Меркурий</span>}
            {hasCZ && <span className="pill">Честный знак</span>}
            {verified && <span className="pill pill-verified">Проверено</span>}
          </div>

          {/* Заголовок */}
          <h3 className="title truncate">{listing.title}</h3>

          {/* Метаданные */}
          <div className="meta flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="truncate max-w-[220px]">{supplier.displayName}</span>
            <span>•</span>
            <span>{listing.region}</span>
            {listing.createdAt && (
              <>
                <span>•</span>
                <span>{relDate(listing.createdAt)}</span>
              </>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex flex-wrap gap-2">
            <button
              className="btn px-3 py-1.5 text-[12px]"
              onClick={() => setShowContacts((v) => !v)}
              aria-expanded={showContacts}
            >
              {showContacts ? "Скрыть контакты" : "Показать контакты"}
            </button>
            <Link to={`/supplier/${supplier.id}`} className="btn px-3 py-1.5 text-[12px]">
              Профиль поставщика
            </Link>
          </div>

          {/* Контакты (раскрывашка) */}
          {showContacts && (
            <div className="glass p-3 border border-[var(--border)] rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {supplier.contacts?.phone && (
                  <div>
                    Телефон: <span className="opacity-90">{supplier.contacts.phone}</span>
                  </div>
                )}
                {supplier.contacts?.whatsapp && (
                  <div>
                    WhatsApp: <span className="opacity-90">{supplier.contacts.whatsapp}</span>
                  </div>
                )}
                {supplier.contacts?.tg && (
                  <div>
                    Telegram: <span className="opacity-90">{supplier.contacts.tg}</span>
                  </div>
                )}
                {supplier.contacts?.email && (
                  <div>
                    Email: <span className="opacity-90">{supplier.contacts.email}</span>
                  </div>
                )}
                {supplier.contacts?.website && (
                  <div>
                    Сайт:{" "}
                    <a className="underline opacity-90" href={supplier.contacts.website} target="_blank" rel="noreferrer">
                      перейти
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Правый тонкий блок: Цена / Объём */}
        <aside className="shrink-0 pl-2 self-start text-right">
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Цена
          </div>
          <div className="text-lg font-semibold">{rub(listing.pricePerKgRUB)} ₽/кг</div>
          <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
            Объём
          </div>
          <div className="text-base">{listing.batchVolumeKg} кг</div>
        </aside>
      </div>

      {/* Ровная сетка фото (тонкие рамки) */}
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.03)]"
            >
              <img
                src={src}
                alt={`${listing.title} — фото ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
