// Telegram Mini App adapter — безопасный no-op в обычном браузере
type TG = {
  ready: () => void;
  expand?: () => void;
};
declare global { interface Window { Telegram?: { WebApp?: TG } } }

export const TMA = {
  ready() {
    try {
      const wa = window?.Telegram?.WebApp;
      if (wa && typeof wa.ready === "function") wa.ready();
    } catch {}
  },
};
