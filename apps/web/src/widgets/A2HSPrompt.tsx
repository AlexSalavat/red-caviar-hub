import { useEffect, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isTMA() {
  // в Telegram Mini App подсказку не показываем
  // @ts-ignore
  return !!(window?.Telegram && window?.Telegram.WebApp);
}

export default function A2HSPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isTMA()) return;
    if (localStorage.getItem("a2hs.dismissed") === "1") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!canInstall) return null;

  const onAdd = async () => {
    const ev = deferredRef.current;
    if (!ev) return;
    await ev.prompt();
    try {
      const res = await ev.userChoice;
      if (res?.outcome === "accepted") {
        setCanInstall(false);
        localStorage.setItem("a2hs.dismissed", "1");
      }
    } catch {}
  };

  const onClose = () => {
    setCanInstall(false);
    localStorage.setItem("a2hs.dismissed", "1");
  };

  return (
    <div className="fixed left-0 right-0 bottom-[calc(var(--bottom-nav-h)+16px+env(safe-area-inset-bottom))] z-[60] px-3">
      <div className="glass glass-neon max-w-[520px] mx-auto p-3 rounded-xl border border-[var(--border)] flex items-center gap-3">
        <img src="/logo-mark.svg" alt="" className="h-7 w-7 shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">Добавить на экран</div>
          <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
            Установите как приложение для быстрого доступа
          </div>
        </div>
        <button className="btn px-3 py-1.5 text-[12px]" onClick={onAdd}>Добавить</button>
        <button className="btn btn-muted px-2 py-1 text-[12px]" onClick={onClose} aria-label="Скрыть">×</button>
      </div>
    </div>
  );
}
