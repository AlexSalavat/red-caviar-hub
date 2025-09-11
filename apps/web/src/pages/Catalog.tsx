import React from 'react';
import { useNavigate } from 'react-router-dom';
import suppliersJson from '../mocks/suppliers.json';
import listingsJson from '../mocks/listings.json';
import SupplierCard from '../widgets/SupplierCard';
import { SupplierProfileSheet } from '../widgets/SupplierProfileSheet';
import type { Supplier, Listing } from '../types';

// Если вдруг файлы будут не массивами — аккуратно достанем
const suppliers: Supplier[] = Array.isArray(suppliersJson)
  ? (suppliersJson as Supplier[])
  : ((suppliersJson as any)?.suppliers ?? []);

const listings: Listing[] = Array.isArray(listingsJson)
  ? (listingsJson as Listing[])
  : ((listingsJson as any)?.listings ?? []);

export default function Catalog() {
  const navigate = useNavigate();

  const [selected, setSelected] = React.useState<Supplier | null>(null);
  const [open, setOpen] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });

  const toggleFav = (id: string) => setFavorites(prev => {
    const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    localStorage.setItem('favorites', JSON.stringify(next));
    return next;
  });

  const handleOpenProfile = (s: Supplier) => { setSelected(s); setOpen(true); };
  const handleOpenListings = (s: Supplier) => navigate(`/listings?supplierId=${s.id}`);
  const handleReveal = async (s: Supplier) => {
    alert(`Контакты поставщика «${s.displayName}» будут показаны после оплаты/проверки плана.`);
  };

  return (
    <div className="p-3">
      {!Array.isArray(suppliers) || !Array.isArray(listings) ? (
        <div className="text-sm text-rose-600">
          Ошибка данных: ожидаются массивы suppliers/listings. Проверь содержимое JSON.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suppliers.map((s) => (
              <SupplierCard
                key={s.id}
                supplier={s}
                listings={listings}
                onOpenProfile={handleOpenProfile}
                onOpenListings={handleOpenListings}
                isFavorite={favorites.includes(s.id)}
                onToggleFavorite={toggleFav}
              />
            ))}
          </div>

          <SupplierProfileSheet
            open={open}
            onClose={() => setOpen(false)}
            supplier={selected}
            allListings={listings}
            onRevealContact={handleReveal}
            onOpenListings={handleOpenListings}
          />
        </>
      )}
    </div>
  );
}
