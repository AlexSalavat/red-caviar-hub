// Типобезопасный адаптер Telegram WebApp (безопасно работает и вне Telegram)

export type TelegramWebApp = {
  ready: () => void;
  expand?: () => void;
  close?: () => void;
  MainButton?: { show: () => void; hide: () => void; setText: (t: string) => void };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export const inTelegram = (): boolean =>
  typeof window !== "undefined" && !!window.Telegram?.WebApp;

export const getTWA = (): TelegramWebApp | undefined =>
  typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export const safeReady = (): void => {
  try {
    getTWA()?.ready();
  } catch {
    /* noop */ void 0;
  }
};
