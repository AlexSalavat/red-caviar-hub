import type { Supplier } from "../types";
import { Link, useNavigate } from "react-router-dom";

function initials(name: string){
  return (name || "")
    .split(/\s+/).filter(Boolean).slice(0,2)
    .map(w => w[0]?.toUpperCase() || "").join("") || "RK";
}

export default function SupplierCard({ s, onOpenSheet }: { s: Supplier; onOpenSheet?: (s: Supplier)=>void }) {
  const nav = useNavigate();
  const open = () => onOpenSheet ? onOpenSheet(s) : nav(`/supplier/${s.id}`);

  return (
    <article className="glass glass-neon card transition">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
        <div className="logo-wrap">
          {s.logoUrl
            ? <img className="logo-img" src={s.logoUrl} alt={s.displayName} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            : <div className="avatar">{initials(s.displayName)}</div>}
        </div>

        <div className="min-w-0">
          <h3 className="title truncate">{s.displayName}</h3>
          <div className="meta truncate">{[s.city, (s.regions||[]).join(", ")].filter(Boolean).join(" • ")}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {s.verified && <span className="pill pill-verified">Проверенный</span>}
            {(s.categories||[]).slice(0,2).map(c => <span key={c} className="pill">{c}</span>)}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={open} className="btn px-3 py-1.5 text-[12px]">Подробнее</button>
          <Link to={`/listings?supplier=${s.id}`} className="btn px-3 py-1.5 text-[12px]">Объявления</Link>
        </div>
      </div>
    </article>
  );
}
