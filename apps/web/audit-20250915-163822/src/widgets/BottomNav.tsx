import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Icons = {
  catalog: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="4" y="4" width="7" height="7" rx="2"/>
      <rect x="13" y="4" width="7" height="7" rx="2"/>
      <rect x="4" y="13" width="7" height="7" rx="2"/>
      <rect x="13" y="13" width="7" height="7" rx="2"/>
    </svg>
  ),
  listings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 6h16M4 12h16M4 18h10"/>
    </svg>
  ),
  manufacturers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 21h18M5 21V9l6 4V9l6 4v8"/>
      <path d="M9 21V13M15 21V15"/>
    </svg>
  ),
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6"/>
    </svg>
  ),
};

const NAV = [
  { to: "/catalog", label: "Каталог", icon: Icons.catalog },
  { to: "/listings", label: "Объявления", icon: Icons.listings },
  { to: "/manufacturers", label: "Производители", icon: Icons.manufacturers },
  { to: "/profile", label: "Профиль", icon: Icons.profile },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const active = useMemo(() => {
    const i = NAV.findIndex(n => pathname === n.to || pathname.startsWith(n.to + "/"));
    return i >= 0 ? i : 0;
  }, [pathname]);

  function recalc() {
    const wrap = wrapRef.current, el = itemRefs.current[active];
    if (!wrap || !el) return;
    const w = wrap.getBoundingClientRect(), r = el.getBoundingClientRect();
    setIndicator({ left: Math.round(r.left - w.left), width: Math.round(r.width) });
  }

  useLayoutEffect(() => { const id = requestAnimationFrame(recalc); return () => cancelAnimationFrame(id); }, [active]);
  useEffect(() => {
    const ro = new ResizeObserver(recalc);
    if (wrapRef.current) ro.observe(wrapRef.current);
    const on = () => recalc();
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => { ro.disconnect(); window.removeEventListener("resize", on); window.removeEventListener("orientationchange", on); };
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 pointer-events-auto">
      <div className="bottom-nav backdrop-blur-md">
        <div ref={wrapRef} className="relative grid grid-cols-4">
          <span className="nav-indicator" style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }} aria-hidden />
          {NAV.map((it, i) => {
            const isActive = active === i;
            return (
              <button
                key={it.to}
                ref={el => (itemRefs.current[i] = el)}
                className="relative h-[var(--bottom-nav-h)] px-2 text-[11px] font-medium text-[var(--ink)]/80 hover:text-[var(--ink)] transition-colors"
                onClick={() => navigate(it.to)}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="mx-auto flex h-full w-full max-w-[160px] flex-col items-center justify-center gap-1">
                  <span
                    className="inline-flex"
                    style={{ filter: isActive ? "drop-shadow(0 0 10px rgba(54,209,204,.55))" : "none" }}
                    aria-hidden
                  >
                    {it.icon}
                  </span>
                  <span className="truncate" style={{ textShadow: isActive ? "0 0 10px rgba(54,209,204,.35)" : "none" }}>
                    {it.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
