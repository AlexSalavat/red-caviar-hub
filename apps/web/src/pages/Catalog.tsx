import { useMemo, useState } from "react";
import suppliers from "../mocks/suppliers.json";

export default function Catalog() {
  const [q, setQ] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (onlyVerified && !s.verified) return false;
      if (!query) return true;
      const hay = `${s.displayName} ${s.regions.join(" ")}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, onlyVerified]);

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию или региону…"
          className="flex-1 text-sm px-3 py-2 rounded-2xl bg-white shadow outline-none text-brand-slate"
        />
        <button
          onClick={() => setOnlyVerified((v) => !v)}
          className={`px-3 py-2 rounded-2xl text-sm shadow ${
            onlyVerified ? "bg-brand-verify text-white" : "bg-white text-brand-slate"
          }`}
          title="Показать только проверенных"
        >
          Проверено
        </button>
      </div>

      <div className="text-xs opacity-70 mb-2">
        Найдено: {items.length}
        {onlyVerified && " • фильтр: Проверено"}
        {q && ` • поиск: “${q}”`}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.length === 0 && (
          <div className="col-span-2 text-sm opacity-70">
            Пока нет подходящих результатов. Сбросьте фильтры или измените запрос.
          </div>
        )}

        {items.map((x) => (
          <div key={x.id} className="bg-white text-brand-slate rounded-2xl p-3 shadow">
            <div className="flex items-center gap-2">
              <img src={x.logoUrl} className="w-8 h-8 rounded-full" />
              <div className="text-sm font-medium">{x.displayName}</div>
            </div>
            <div className="mt-1 text-[11px] opacity-70">
              Регионы: {x.regions.join(", ")}
            </div>
            <div className="mt-2 flex gap-2 items-center">
              {x.verified && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-verify/10 text-brand-verify">
                  Проверено
                </span>
              )}
              {x.badges?.includes("top") && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-red/10 text-brand-red">
                  ТОП
                </span>
              )}
            </div>
            <div className="mt-2 text-xs">★ {x.rating?.toFixed(1) ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
