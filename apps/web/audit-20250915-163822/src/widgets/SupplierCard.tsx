import type { Supplier } from "../types";
import { Link } from "react-router-dom";

export default function SupplierCard({ s }: { s: Supplier }) {
  return (
    <article className="glass card transition">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
        <div className="logo-wrap">
          {s.logoUrl ? (
            <img className="logo-img" src={s.logoUrl} alt={s.displayName} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          ) : <div className="logo-img" aria-hidden /> }
        </div>

        <div className="min-w-0">
          <h3 className="title truncate">{s.displayName}</h3>
          <div className="meta truncate">{[s.city, (s.regions||[]).join(", ")].filter(Boolean).join(" • ")}</div>
          {s.categories?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {s.categories.slice(0,3).map(c => <span key={c} className="pill">{c}</span>)}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {/* Открывает страницу профиля */}
          <Link to={`/supplier/${s.id}`} className="btn px-3 py-1.5 text-[12px]">Профиль</Link>
          <Link to={`/listings?supplier=${s.id}`} className="btn px-3 py-1.5 text-[12px]">Объявления</Link>
        </div>
      </div>
    </article>
  );
}
