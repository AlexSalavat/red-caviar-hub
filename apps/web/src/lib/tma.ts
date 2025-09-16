// Типобезопасный адаптер Telegram WebApp + совместимость со старым импортом { TMA }

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

// Совместимый API-объект для существующих импортов: import { TMA } from "./lib/tma";
export type TMAApi = {
  inTelegram: () => boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  mainButton: {
    show: () => void;
    hide: () => void;
    setText: (t: string) => void;
  };
};

export const TMA: TMAApi = {
  inTelegram,
  ready: safeReady,
  expand: () => {
    try {
      getTWA()?.expand?.();
    } catch {
      /* noop */ void 0;
    }
  },
  close: () => {
    try {
      getTWA()?.close?.();
    } catch {
      /* noop */ void 0;
    }
  },
  mainButton: {
    show: () => {
      try {
        getTWA()?.MainButton?.show?.();
      } catch {
        /* noop */ void 0;
      }
    },
    hide: () => {
      try {
        getTWA()?.MainButton?.hide?.();
      } catch {
        /* noop */ void 0;
      }
    },
    setText: (t: string) => {
      try {
        getTWA()?.MainButton?.setText?.(t);
      } catch {
        /* noop */ void 0;
      }
    },
  },
};
