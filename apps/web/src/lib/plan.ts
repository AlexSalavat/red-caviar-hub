export type Plan = 'lite' | 'pro' | 'vip' | null;

const LS_PLAN = 'rch.plan';
const LS_REVEALS = 'rch.reveals'; // { month: 'YYYY-MM', count: number }

export const planTitles: Record<Exclude<Plan, null>, string> = {
  lite: 'Lite',
  pro: 'Pro',
  vip: 'VIP',
};

export function getPlan(): Plan {
  try {
    const v = localStorage.getItem(LS_PLAN);
    return (v as Plan) ?? 'lite';
  } catch {
    return 'lite';
  }
}

export function setPlan(p: Plan) {
  try { localStorage.setItem(LS_PLAN, p ?? 'lite'); } catch {}
}

function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

export function getReveals(): { month: string; count: number } {
  try {
    const raw = localStorage.getItem(LS_REVEALS);
    if (!raw) return { month: monthKey(), count: 0 };
    const parsed = JSON.parse(raw) as { month: string; count: number };
    // если месяц сменился — сбрасываем
    if (parsed.month !== monthKey()) return { month: monthKey(), count: 0 };
    return parsed;
  } catch {
    return { month: monthKey(), count: 0 };
  }
}

export function setReveals(v: { month: string; count: number }) {
  try { localStorage.setItem(LS_REVEALS, JSON.stringify(v)); } catch {}
}

/** Лимиты на раскрытие контактов в месяц по планам */
export function contactLimitByPlan(p: Plan): number | 'unlimited' {
  if (p === 'vip' || p === 'pro') return 'unlimited';
  return 3; // Lite
}

/** Можно ли раскрыть контакт с текущим планом и счётчиком */
export function canRevealContact(p: Plan): boolean {
  const limit = contactLimitByPlan(p);
  if (limit === 'unlimited') return true;
  const { count } = getReveals();
  return count < limit;
}

/** Увеличить счётчик раскрытий (если не безлимит) */
export function incRevealCount(p: Plan) {
  const limit = contactLimitByPlan(p);
  if (limit === 'unlimited') return;
  const cur = getReveals();
  setReveals({ month: cur.month, count: cur.count + 1 });
}

/** Сбросить счётчик текущего месяца */
export function resetReveals() {
  setReveals({ month: monthKey(), count: 0 });
}
