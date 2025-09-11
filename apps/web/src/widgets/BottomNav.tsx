type Tab = 'catalog'|'listings'|'manufacturers'|'profile';

export default function BottomNav({
  value, onChange,
}: { value: Tab; onChange: (t: Tab) => void }) {
  const Item = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => onChange(id)}
      className={`flex-1 py-2 text-sm ${value === id ? 'text-brand-red' : 'opacity-70'}`}
    >
      {label}
    </button>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 text-brand-slate backdrop-blur shadow-md rounded-t-2xl">
      <div className="flex">
        <Item id="catalog" label="Каталог" />
        <Item id="listings" label="Объявления" />
        <Item id="manufacturers" label="Производители" />
        <Item id="profile" label="Профиль" />
      </div>
    </nav>
  );
}
