import { useMemo, useState } from "react";
import { TMA } from "../lib/tma";

type Plan = "lite" | "pro" | "vip";

const PRICES: Record<Plan, number> = { lite: 299, pro: 999, vip: 2999 };
const PLAN_NAME: Record<Plan, string> = { lite: "Lite", pro: "Pro", vip: "VIP" };

const FEATURES: Record<Plan, string[]> = {
  lite: [
    "Без рекламы",
    "Избранное",
    "3 контакта в мес.",
  ],
  pro: [
    "Все контакты",
    "10 объявлений в мес.",
    "1 «Проверено» в мес.",
  ],
  vip: [
    "Безлимит контактов",
    "Приоритет в каталоге",
    "3 «Проверено» в мес.",
    "Саппорт в DM",
  ],
};

export default function Profile() {
  // локальные стейты (потом свяжем с бэкендом/Stars)
  const [currentPlan, setCurrentPlan] = useState<Plan>("lite");
  const [walletStars, setWalletStars] = useState<number>(0);
  const [contactsLeft, setContactsLeft] = useState<number>(3); // для lite-демо
  const [refCode] = useState<string>(() => makeRefCode());

  const plans: Plan[] = useMemo(() => ["lite", "pro", "vip"], []);
  const onBuy = (plan: Plan) => {
    // Заглушка «оплаты Stars». Позже заменим на openInvoice.
    try {
      TMA.ready(); // инициализация webapp
    } catch {}
    alert(`Открыть оплату: ${PLAN_NAME[plan]} — ${PRICES[plan]} Stars (sandbox)`);
    // Демо-апгрейд
    setCurrentPlan(plan);
    if (plan === "pro") { setContactsLeft(100); }
    if (plan === "vip") { setContactsLeft(999); }
  };

  const onPromo = (type: "bump" | "pin" | "dm") => {
    const title = type === "bump" ? "Поднятие объявления (99 Stars / 7д)"
      : type === "pin" ? "Закреп в топе (299 Stars / 7д)"
      : "Платное DM (99 Stars / сообщение)";
    alert(`${title}\n(заглушка sandbox)`);
  };

  const isLite = currentPlan === "lite";
  const isPro  = currentPlan === "pro";
  const isVip  = currentPlan === "vip";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Профиль</h1>

      {/* Статус / кошелёк */}
      <section className="glass glass-neon spot p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass p-4 rounded-xl border border-[var(--border)]">
            <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>Мой план</div>
            <div className="text-lg font-semibold">{PLAN_NAME[currentPlan]}</div>
            <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
              {isLite && "Базовый доступ"}
              {isPro  && "Расширенный доступ"}
              {isVip  && "Максимальные привилегии"}
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-[var(--border)]">
            <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>Кошелёк</div>
            <div className="text-lg font-semibold">{walletStars} Stars</div>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-muted px-3 py-1.5 text-[12px]" onClick={() => setWalletStars((s) => s + 100)}>
                +100 Stars (демо)
              </button>
              <button className="btn px-3 py-1.5 text-[12px]" onClick={() => setWalletStars(0)}>
                Обнулить
              </button>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-[var(--border)]">
            <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>Лимит контактов</div>
            <div className="text-lg font-semibold">
              {isVip ? "Безлимит" : isPro ? "Много" : `${contactsLeft} / 3`}
            </div>
            <div className="mt-2">
              <button className="btn btn-muted px-3 py-1.5 text-[12px]" onClick={() => setContactsLeft((n) => Math.max(0, n - 1))}>
                -1 контакт (демо)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Тарифы */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {plans.map((p) => (
          <PlanCard
            key={p}
            plan={p}
            price={PRICES[p]}
            features={FEATURES[p]}
            active={currentPlan === p}
            onSelect={() => onBuy(p)}
          />
        ))}
      </section>

      {/* Инструменты продвижения */}
      <section className="glass glass-neon p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-semibold">Продвижение</div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>Оплата Stars (sandbox)</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PromoCard
            title="Поднятие объявления"
            subtitle="99 Stars · 7 дней"
            onClick={() => onPromo("bump")}
          />
          <PromoCard
            title="Закреп в топе каталога"
            subtitle="299 Stars · 7 дней"
            onClick={() => onPromo("pin")}
          />
          <PromoCard
            title="Платное DM"
            subtitle="99 Stars · сообщение"
            onClick={() => onPromo("dm")}
          />
        </div>
      </section>

      {/* Рефералка */}
      <section className="glass p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-base font-semibold">Реферальная программа</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              20% от подписок привлечённых пользователей в первые 3 месяца.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,.03)] text-sm">{refCode}</code>
            <button className="btn px-3 py-1.5 text-[12px]" onClick={() => copyText(refCode)}>Скопировать</button>
          </div>
        </div>
      </section>

      <div className="pb-24" />
    </div>
  );
}

/* === Вспомогательные компоненты === */

function PlanCard({
  plan, price, features, active, onSelect,
}: {
  plan: Plan;
  price: number;
  features: string[];
  active?: boolean;
  onSelect: () => void;
}) {
  const label = PLAN_NAME[plan];
  return (
    <article className={`glass ${active ? "glass-neon" : ""} p-4 rounded-2xl border border-[var(--border)]`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold">{label}</div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>/ мес</div>
      </div>
      <div className="text-2xl font-bold mb-3">{price} Stars</div>
      <ul className="space-y-2 mb-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {active ? (
        <button className="btn btn-muted w-full py-2.5" disabled>Текущий план</button>
      ) : (
        <button className="btn w-full py-2.5" onClick={onSelect}>Оформить</button>
      )}
    </article>
  );
}

function PromoCard({ title, subtitle, onClick }: { title: string; subtitle: string; onClick: () => void }) {
  return (
    <article className="glass p-4 rounded-xl border border-[var(--border)]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>{subtitle}</div>
      <button className="btn w-full py-2" onClick={onClick}>Активировать</button>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--teal)" }}>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

/* === Утилиты === */

function makeRefCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RCH-${rand}`;
}
async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); alert("Скопировано!"); }
  catch { alert("Не удалось скопировать"); }
}
