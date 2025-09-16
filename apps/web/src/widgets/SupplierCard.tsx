import { Link, useNavigate } from "react-router-dom";
import type { Supplier } from "../types";

/** Премиум-карточка с мобильным лайаутом:
 * - mobile: 2 колонки (лого + текст), CTA отдельной строкой снизу (две кнопки на всю ширину)
 * - ≥sm: 3 колонки (лого, текст, CTA столбиком справа)
 */
export default function SupplierCard({
  s,
  onOpenSheet,
}: {
  s: Supplier;
  onOpenSheet?: (s: Supplier) => void;
}) {
  const nav = useNavigate();
  const open = () => (onOpenSheet ? onOpenSheet(s) : nav(`/supplier/${s.id}`));

  const hasMercury = s.docs?.mercury?.status === "linked";
  const hasCZ = s.docs?.chestnyZnak?.status === "linked";
  const verified = !!s.verified;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Поставщик ${s.displayName}. Подробнее`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      }}
      className={[
        "glass glass-neon transition",
        "rounded-2xl border border-[var(--border)]",
        "p-3 sm:p-4",
        "hover:translate-y-[-1px] active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(54,209,204,.35)]",
        "cursor-pointer",
      ].join(" ")}
    >
      {/* Сетка карточки: mobile 2 колонки, ≥sm 3 колонки */}
      <div className="grid grid-cols-[auto,1fr] sm:grid-cols-[auto,1fr,auto] gap-3 sm:gap-4 items-center">
        {/* LOGO */}
        <div
          className="relative shrink-0 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,.03)]"
          style={{ width: 84, height: 84 }}
          aria-hidden
          onClick={(e) => e.stopPropagation()}
        >
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt={s.displayName}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 50%" }}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm font-semibold">
              {initials(s.displayName)}
            </div>
          )}
          <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-[rgba(54,209,204,.18)]" />
        </div>

        {/* Текстовый блок */}
        <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
          <h3 className="truncate text-[15px] sm:text-[16px] leading-[1.25] font-semibold">
            {s.displayName}
          </h3>
          <div
            className="truncate text-[12px] leading-[1.25] mt-0.5"
            style={{ color: "var(--muted)" }}
            title={[s.city, (s.regions || []).join(", ")].filter(Boolean).join(" • ")}
          >
            {[s.city, (s.regions || []).join(", ")].filter(Boolean).join(" • ")}
          </div>

          {typeof s.rating === "number" && (
            <div className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
              <span aria-hidden>★</span> {s.rating.toFixed(1)}
            </div>
          )}

          {/* Бейджи: обёртка переносит строки аккуратно */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {verified && <span className="pill pill-verified">Проверено</span>}
            {hasMercury && <span className="pill">Меркурий</span>}
            {hasCZ && <span className="pill">Честный знак</span>}
            {(s.categories || []).slice(0, 2).map((c) => (
              <span key={c} className="pill">{c}</span>
            ))}
          </div>
        </div>

        {/* CTA: mobile — снизу на всю ширину, ≥sm — вправо столбиком */}
        <div
          className="col-span-2 sm:col-span-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mt-2 sm:mt-0 flex gap-2 sm:flex-col">
            <button
              className="btn px-3 py-2 text-[13px] flex-1 sm:flex-none"
              onClick={open}
            >
              Подробнее
            </button>
            <Link
              to={`/listings?supplier=${encodeURIComponent(s.id)}`}
              className="btn btn-muted px-3 py-2 text-[13px] flex-1 sm:flex-none text-center"
            >
              Объявления
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function initials(name?: string) {
  return (name || "")
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "").join("") || "RK";
}
