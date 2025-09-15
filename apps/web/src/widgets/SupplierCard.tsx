import type { Supplier } from "../types";
import { Link, useNavigate } from "react-router-dom";

function initials(name: string){
  return (name || "")
    .split(/\s+/).filter(Boolean).slice(0,2)
    .map(w => w[0]?.toUpperCase() || "").join("") || "RK";
}

/** Карточка поставщика для каталога
 * - Лого увеличено до 72×72
 * - Текст выровнен, межстрочные интервалы аккуратные
 */
export default function SupplierCard({ s, onOpenSheet }: { s: Supplier; onOpenSheet?: (s: Supplier)=>void }) {
  const nav = useNavigate();
  const open = () => onOpenSheet ? onOpenSheet(s) : nav(`/supplier/${s.id}`);

  return (
    <article className="glass glass-neon card transition">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
        {/* LOGO */}
        <div
          className="relative shrink-0 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,.03)]"
          style={{ width: 72, height: 72 }}
          aria-hidden
        >
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt={s.displayName}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain p-2"
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
        <div className="min-w-0">
          <h3 className="truncate text-[15px] leading-[1.25] font-semibold">{s.displayName}</h3>
          <div className="truncate text-[12px] leading-[1.25]" style={{ color: "var(--muted)" }}>
            {[s.city, (s.regions||[]).join(", ")].filter(Boolean).join(" • ")}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {s.verified && <span className="pill pill-verified">Проверенный</span>}
            {(s.categories||[]).slice(0,2).map(c => <span key={c} className="pill">{c}</span>)}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <button onClick={open} className="btn px-3 py-1.5 text-[12px]">Подробнее</button>
          <Link to={`/listings?supplier=${s.id}`} className="btn btn-muted px-3 py-1.5 text-[12px]">
            Объявления
          </Link>
        </div>
      </div>
    </article>
  );
}
