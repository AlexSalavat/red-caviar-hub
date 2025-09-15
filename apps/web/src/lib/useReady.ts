import { useEffect, useState } from "react";

/** Возвращает true через delay мс — чтобы показать скелетоны на холодном старте/переходе */
export function useReady(delay = 320) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return ready;
}
