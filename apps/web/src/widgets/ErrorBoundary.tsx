import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: unknown };

/** Глобальный перехват ошибок страниц/чанков.
 * Показывает аккуратную карточку и даёт кнопку «Обновить».
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: unknown) {
    // сюда можно отправить в аналитику
    console.error("[ErrorBoundary]", error);
  }

  private reload = () => {
    // иногда помогает сбросить битые чанки кэша
    try {
      if ("caches" in window) {
        caches.keys().then(keys => keys.forEach(k => /^vite/i.test(k) && caches.delete(k)));
      }
    } catch {}
    location.reload();
  };

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-app grid place-items-center">
        <div className="glass glass-neon p-6 rounded-2xl text-center max-w-[520px]">
          <div className="text-lg font-semibold mb-2">Что-то пошло не так</div>
          <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>
            Не удалось загрузить страницу. Попробуйте обновить.
          </div>
          <button className="btn px-4 py-2" onClick={this.reload}>Обновить</button>
        </div>
      </div>
    );
  }
}
