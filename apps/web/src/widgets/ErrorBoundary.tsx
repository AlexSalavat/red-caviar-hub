import { Component, type ReactNode } from "react";

type State = { hasError: boolean };

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    console.error("ErrorBoundary caught:", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-10">
          <div className="glass p-6 rounded-2xl border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-2">Что-то пошло не так</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Обновите страницу и попробуйте ещё раз.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
