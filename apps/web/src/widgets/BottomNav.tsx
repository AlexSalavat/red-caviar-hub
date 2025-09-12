import React from "react";

export type TabKey = "catalog" | "listings" | "manufacturers" | "profile";

type Props = { active: TabKey; onChange: (tab: TabKey) => void };

/* Иконки — минимализм */
const iconCls = "h-6 w-6";
const stroke = "currentColor";

function CatalogIcon() {
  return (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}
function ListingsIcon() {
  return (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" />
    </svg>
  );
}
function FactoryIcon() {
  return (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V9l7 4V9l7 4V5a2 2 0 0 1 2-2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
      <path d="M3 21a9 9 0 0 1 18 0" />
    </svg>
  );
}

const ITEMS: { key: TabKey; label: string; Icon: React.FC }[] = [
  { key: "catalog",        label: "Каталог",       Icon: CatalogIcon },
  { key: "listings",       label: "Объявления",    Icon: ListingsIcon },
  { key: "manufacturers",  label: "Производители", Icon: FactoryIcon },
  { key: "profile",        label: "Профиль",       Icon: ProfileIcon },
];

export default function BottomNav({ active, onChange }: Props) {
  const activeIdx = Math.max(0, ITEMS.findIndex(i => i.key === active));
  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 pointer-events-none safe-bottom">
      <div className="container-safe max-w-2xl pointer-events-auto">
        <nav className="relative glass neon rounded-3xl border-white/10 px-2 py-1.5 backdrop-saturate-150">
          {/* Индикация активной вкладки: ровная капсула, двигается плавно */}
          <div
            className="absolute inset-y-1 left-2 w-1/4 rounded-2xl border border-white/10 bg-white/10 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${activeIdx * 100}%)` }}
          />
          <ul className="relative grid grid-cols-4">
            {ITEMS.map(({ key, label, Icon }, idx) => {
              const isActive = idx === activeIdx;
              return (
                <li key={key} className="select-none">
                  <button
                    onClick={() => onChange(key)}
                    className={
                      "w-full h-full px-3 py-2 flex flex-col items-center justify-center text-[11px] leading-none font-medium rounded-2xl " +
                      (isActive ? "text-white" : "text-white/75 hover:text-white")
                    }
                    title={label}
                    aria-current={isActive ? "page" : undefined}
                    // убираем любые браузерные хвосты
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <div className="h-6 grid place-items-center">
                      <Icon />
                    </div>
                    <span className="mt-1 no-underline">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
