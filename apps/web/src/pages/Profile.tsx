import { useEffect, useMemo, useState } from "react";
import {
  type Plan,
  getPlan,
  setPlan,
  contactLimitByPlan,
  getReveals,
  resetReveals,
  planTitles,
} from "../lib/plan";

type CardProps = {
  code: Exclude<Plan, null>;
  price: string;
  features: string[];
  current: boolean;
  onSelect: () => void;
};

function PlanCard({ code, price, features, current, onSelect }: CardProps) {
  return (
    <div className={`bg-white text-brand-slate rounded-2xl p-4 shadow border
      ${current ? "border-brand-red" : "border-transparent"}`}>
      <div className="flex items-baseline justify-between">
        <div className="text-lg font-semibold">{planTitles[code]}</div>
        <div className="text-sm opacity-70">{price}</div>
      </div>
      <ul className="mt-2 text-sm list-disc list-inside space-y-1">
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <button
        onClick={onSelect}
        className={`mt-3 px-4 py-2 rounded-2xl text-sm font-medium
          ${current ? "bg-brand-verify text-white" : "bg-brand-red text-white"}`}
      >
        {current ? "Текущий план" : "Выбрать"}
      </button>
    </div>
  );
}

export default function Profile() {
  const [plan, setPlanState] = useState<Plan>('lite');
  const reveals = getReveals();

  useEffect(() => {
    setPlanState(getPlan());
  }, []);

  const limit = contactLimitByPlan(plan);
  const revealsLeft = useMemo(() => {
    if (limit === 'unlimited') return "безлимит";
    return Math.max(0, limit - reveals.count);
  }, [limit, reveals.count]);

  function selectPlan(p: Exclude<Plan, null>) {
    setPlan(p);
    setPlanState(p);
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="bg-white text-brand-slate rounded-2xl p-4 shadow">
        <div className="font-semibold">Мой план: {plan ? planTitles[plan] : "Lite"}</div>
        <div className="text-sm opacity-70 mt-1">
          Лимит раскрытия контактов / мес:{" "}
          {limit === "unlimited" ? "безлимит" : `${limit} (осталось ${revealsLeft})`}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => resetReveals()}
            className="px-3 py-1.5 rounded-2xl bg-white border text-sm"
            title="Сбросить счётчик текущего месяца (для теста)"
          >
            Сбросить счётчик
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <PlanCard
          code="lite"
          price="Lite — 299 Stars/мес"
          features={[
            "Без рекламы",
            "Избранное",
            "3 контакта/мес",
          ]}
          current={plan === "lite" || plan === null}
          onSelect={() => selectPlan("lite")}
        />
        <PlanCard
          code="pro"
          price="Pro — 999 Stars/мес"
          features={[
            "Полный доступ к контактам",
            "10 объявлений/мес",
            "1 «Проверено»/мес",
          ]}
          current={plan === "pro"}
          onSelect={() => selectPlan("pro")}
        />
        <PlanCard
          code="vip"
          price="VIP — 2999 Stars/мес"
          features={[
            "Безлимит контактов, приоритет",
            "3 «Проверено»/мес",
            "Саппорт DM",
          ]}
          current={plan === "vip"}
          onSelect={() => selectPlan("vip")}
        />
      </div>

      <div className="text-xs opacity-60">
        * Оплата и подписки позже подключим через Telegram Stars. Сейчас это локальный режим для теста UX.
      </div>
    </div>
  );
}
