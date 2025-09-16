import { Link, useNavigate } from "react-router-dom";
import type { Supplier } from "../types";

/**
 * Премиум-карточка поставщика:
 * - Лого 92×92, object-cover, тонкая бирюзовая окантовка
 * - Заголовок, город/регионы, бейджи: Проверено / Меркурий / Честный знак + категории
 * - Кнопки: "Подробнее" (Sheet/роут) и "Объявления"
 * - Клик по карточке = Подробнее (если передан onOpenSheet)
 * - Учитывает мобильную сетку и длинные названия
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={[
        "glass glass-neon card transition",
        // микроанимация наведения/нажатия
        "hover:translate-y-[-1px] active:translate-y-[0px]",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(54,209,204,.35)]",
        "cursor-pointer",
      ].join(" ")}
    >
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
        {/* LOGO */}
        <div
          className="relative shrink-0 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,.03)]"
          style={{ width: 92, height: 92 }}
          aria-hidden
          onClick={(e) => e.stopPropagation()} // чтобы клик по логотипу не триггерил open
        >
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt={s.displayName}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 50%", imageRendering: "auto" }}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm font-semibold">
              {initials(s.displayName)}
            </div>
          )}
          {/* тонкая бирюзовая окантовка */}
          <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-[rgba(54,209,204,.18)]" />
        </div>

        {/* TEXT */}
        <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
          <h3 className="truncate text-[15px] leading-[1.25] font-semibold">
            {s.displayName}
          </h3>
          <div
            className="truncate text-[12px] leading-[1.25]"
            style={{ color: "var(--muted)" }}
            title={[s.city, (s.regions || []).join(", ")].filter(Boolean).join(" • ")}
          >
            {[s.city, (s.regions || []).join(", ")].filter(Boolean).join(" • ")}
          </div>

          {/* Рейтинг (если есть) */}
          {typeof s.rating === "number" && (
            <div
              className="mt-1 text-[12px] leading-none opacity-90"
              style={{ color: "var(--muted)" }}
            >
              <span aria-hidden>★</span> {s.rating.toFixed(1)}
            </div>
          )}

          {/* Бейджи */}
          <div className="mt-2 flex flex-wrap gap-1">
            {verified && <span className="pill pill-verified">Проверено</span>}
            {hasMercury && <span className="pill">Меркурий</span>}
            {hasCZ && <span className="pill">Честный знак</span>}
            {(s.categories || []).slice(0, 2).map((c) => (
              <span key={c} className="pill">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* CTA блок — клики НЕ всплывают (чтобы не открывать всю карточку) */}
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn px-3 py-1.5 text-[12px]" onClick={open}>
            Подробнее
          </button>
          <Link
            to={`/listings?supplier=${encodeURIComponent(s.id)}`}
            className="btn btn-muted px-3 py-1.5 text-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            Объявления
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =================== helpers =================== */

function initials(name?: string) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "RK";
}
