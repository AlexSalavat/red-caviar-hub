import { useEffect, useState } from "react";
import Catalog from "./pages/Catalog";
import Listings from "./pages/Listings";
import Manufacturers from "./pages/Manufacturers";
import Profile from "./pages/Profile";
import BottomNav from "./widgets/BottomNav";
import Splash from "./pages/Splash";
import { initTMA, isTMA, getTmaUser } from "./lib/tma";

export type Tab = "catalog" | "listings" | "manufacturers" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [splash, setSplash] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Инициализация Telegram Mini App (в браузере — no-op) + баннер один раз
  useEffect(() => {
    initTMA();
    const u = getTmaUser();
    if (u) setUserName(u.first_name || u.username || String(u.id));

    if (!isTMA) {
      try {
        const seen = localStorage.getItem("rch.tma.hint");
        if (!seen) setShowBanner(true);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  if (splash) return <Splash onStart={() => setSplash(false)} />;

  return (
    <div className="min-h-screen pb-16 bg-page">
      {/* Баннер-подсказка (можно закрыть навсегда) */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-brand-red text-white text-sm py-2 px-3">
          <div className="max-w-screen-sm mx-auto flex items-center justify-center gap-3">
            <span className="text-center">
              Откройте приложение из Telegram, чтобы использовать оплаты Stars и нативный шэр.
            </span>
            <button
              onClick={() => {
                try { localStorage.setItem("rch.tma.hint", "1"); } catch {}
                setShowBanner(false);
              }}
              className="ml-2 bg-white/20 hover:bg-white/30 rounded-full px-2"
              aria-label="Закрыть"
              title="Больше не показывать"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className={showBanner ? "pt-10" : ""}>
        {userName && (
          <div className="px-4 pt-2 text-sm opacity-70">Привет, {userName}! 👋</div>
        )}

        {tab === "catalog" && <Catalog />}
        {tab === "listings" && <Listings />}
        {tab === "manufacturers" && <Manufacturers />}
        {tab === "profile" && <Profile />}
      </div>

      <BottomNav value={tab} onChange={setTab} />
    </div>
  );
}
