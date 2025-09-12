import React from "react";
import type { Plan } from "../types";

type CardProps = {
  title: string;
  price: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
  badge?: string;
};

const PlanCard: React.FC<CardProps> = ({ title, price, features, selected, onSelect, badge }) => (
  <div className={"glass neon spot p-5 rounded-3xl border " + (selected ? "border-white/20" : "border-white/10")}>
    <div className="flex items-start justify-between">
      <h3 className="text-white font-semibold">{title}</h3>
      {badge && <span className="pill pill-premium">{badge}</span>}
    </div>
    <div className="text-2xl font-bold mt-2" style={{ color: "var(--neon1)" }}>{price}</div>
    <ul className="mt-3 space-y-1 text-white/75 text-sm">
      {features.map((f, i) => <li key={i}>• {f}</li>)}
    </ul>
    <button onClick={onSelect} className={"mt-4 w-full btn " + (selected ? "btn-solid" : "btn-ghost")}>
      {selected ? "Текущий план" : "Выбрать"}
    </button>
  </div>
);

const PLANS: { key: Plan; title: string; price: string; features: string[]; badge?: string }[] = [
  { key: "lite", title: "Lite", price: "299 ₽/мес", features: ["Без рекламы", "Избранное", "3 контакта / мес"] },
  { key: "pro", title: "Pro", price: "999 ₽/мес", features: ["Все контакты", "10 объявлений / мес", "1 «Проверено» / мес"], badge: "Хит" },
  { key: "vip", title: "VIP", price: "2999 ₽/мес", features: ["Безлимит контактов", "Приоритет", "3 «Проверено» / мес", "Саппорт DM"], badge: "PRO" },
];

export default function Profile() {
  const [plan, setPlan] = React.useState<Plan>(() => (localStorage.getItem("plan") as Plan) || "lite");
  const [reveals, setReveals] = React.useState<number>(() => Number(localStorage.getItem("reveals") || 0));

  const select = (p: Plan) => {
    setPlan(p);
    try { localStorage.setItem("plan", String(p)); } catch {}
  };

  const resetLocal = () => {
    try {
      localStorage.removeItem("plan");
      localStorage.removeItem("reveals");
    } catch {}
    setPlan("lite");
    setReveals(0);
  };

  return (
    <div className="min-h-screen bg-page-dark">
      <div className="container-safe py-4 space-y-4">
        <h1>Профиль</h1>

        {/* Карточка компании/пользователя */}
        <div className="glass neon p-5 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 grid place-items-center border border-white/10">
              <span className="text-white/80 font-semibold">RK</span>
            </div>
            <div>
              <div className="text-white font-semibold">Рыбный край Москва</div>
              <div className="text-white/60 text-sm">Москва</div>
            </div>
          </div>
          <div className="mt-3 text-white/70 text-sm">
            План: <span className="text-white font-semibold uppercase">{String(plan)}</span> · раскрытий контактов: {reveals}
          </div>
        </div>

        {/* Планы */}
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard
              key={p.title}
              title={p.title}
              price={p.price}
              features={p.features}
              badge={p.badge}
              selected={plan === p.key}
              onSelect={() => select(p.key)}
            />
          ))}
        </div>

        {/* Настройки */}
        <div className="glass neon p-5 rounded-3xl">
          <h3 className="text-white font-semibold">Настройки</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <button className="btn btn-muted" onClick={resetLocal}>Очистить локальные данные</button>
            <a className="btn btn-muted" href="mailto:support@example.com">Поддержка</a>
          </div>
        </div>
      </div>
    </div>
  );
}
