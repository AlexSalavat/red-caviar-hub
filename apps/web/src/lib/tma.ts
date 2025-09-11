// Мини-адаптер Telegram Mini App SDK с безопасными фоллбеками.

type TWA = {
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      allows_write_to_pm?: boolean;
    };
  };
  ready: () => void;
  expand: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  HapticFeedback?: { impact: (style: "light" | "medium" | "heavy") => void };
  BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void };
  MainButton?: {
    show: () => void;
    hide: () => void;
    setText: (t: string) => void;
    onClick: (cb: () => void) => void;
  };
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  openInvoice?: (slug: string, cb?: (status: string) => void) => void;
  CloudStorage?: {
    getItem: (k: string, cb: (err: unknown, v?: string) => void) => void;
    setItem: (k: string, v: string, cb: (err: unknown) => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TWA };
  }
}

export const tg = (typeof window !== "undefined" ? window.Telegram?.WebApp : null) ?? null;
export const isTMA = !!tg;

/** Безопасная инициализация TMA (в браузере — no-op) */
export function initTMA() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    // По желанию: здесь можно читать tg.themeParams и применить их к CSS-переменным
  } catch {
    /* no-op */
  }
}

/** Текущий пользователь из initDataUnsafe (или null в браузере) */
export function getTmaUser() {
  return tg?.initDataUnsafe?.user ?? null;
}

/** Лёгкий хаптик */
export function hapticTap() {
  try {
    tg?.HapticFeedback?.impact("light");
  } catch {
    /* no-op */
  }
}

/** Примитивный шэр через t.me/share/url (работает и в TMA, и в браузере) */
export function openShare(text: string, url?: string) {
  const share = `https://t.me/share/url?text=${encodeURIComponent(text)}${
    url ? `&url=${encodeURIComponent(url)}` : ""
  }`;
  const open = tg?.openTelegramLink ?? tg?.openLink ?? ((u: string) => window.open(u, "_blank"));
  open(share);
}

/** Обёртка над CloudStorage с фоллбеком на localStorage */
export const cloud = {
  async get(key: string): Promise<string | undefined> {
    return await new Promise((resolve) => {
      if (tg?.CloudStorage?.getItem) {
        tg.CloudStorage.getItem(key, (_err, val) => resolve(val));
      } else {
        resolve(localStorage.getItem(key) ?? undefined);
      }
    });
  },
  async set(key: string, val: string): Promise<void> {
    return await new Promise((resolve) => {
      if (tg?.CloudStorage?.setItem) {
        tg.CloudStorage.setItem(key, val, () => resolve());
      } else {
        localStorage.setItem(key, val);
        resolve();
      }
    });
  },
};

/** Заглушка под будущие платежи Stars (openInvoice) */
export function openStarsInvoiceStub(slug: string) {
  if (!tg?.openInvoice) {
    alert("Платежи доступны при открытии в Telegram Mini App.");
    return;
  }
  tg.openInvoice(slug, (status) => {
    // status: "paid" | "failed" | "pending" | ...
    alert(`Invoice status: ${status}`);
  });
}
