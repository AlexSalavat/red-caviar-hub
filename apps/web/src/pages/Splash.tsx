import React from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const nav = useNavigate();

  const launch = React.useCallback(() => {
    try {
      // @ts-ignore
      const tg = window?.Telegram?.WebApp;
      tg?.ready?.(); tg?.expand?.();
    } catch {}
    nav("/catalog", { replace: true });
  }, [nav]);

  return (
    <div className="min-h-screen bg-page-dark grid place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto w-28 h-28 rounded-3xl glass neon spot grid place-items-center overflow-hidden">
          <img src="/logo-mark.svg" alt="Red Caviar Hub" className="h-24 w-24 object-contain" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Red Caviar Hub</h1>
        <p className="mt-2 text-white/70 max-w-md">
          Каталог поставщиков, объявления о партиях и быстрые сделки. Премиум-площадка для икры и морепродуктов.
        </p>
        <button onClick={launch} className="mt-6 btn btn-solid rounded-2xl px-6 py-3 text-base">
          Запуск
        </button>
      </div>
    </div>
  );
}
