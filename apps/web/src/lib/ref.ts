const LS_REF = 'rch.ref';
const BOT_USERNAME = 'red_caviar_hub_bot'; // TODO: заменим на реального бота позже

export function getOrCreateRefCode(): string {
  try {
    const v = localStorage.getItem(LS_REF);
    if (v) return v;
  } catch {}
  const code = 'RC' + Math.random().toString(36).slice(2, 8).toUpperCase();
  try { localStorage.setItem(LS_REF, code); } catch {}
  return code;
}

export function buildShare(listing: any) {
  const ref = getOrCreateRefCode();
  const title = listing.title ?? 'Новая партия';
  const price = listing.pricePerKgRUB ?? listing.price_per_kg_rub;
  const batch = listing.batchVolumeKg ?? listing.batch_volume_kg;
  const region = listing.region ?? '—';

  const text =
`🧿 Red Caviar Hub — ${title}
Цена: ${Number(price).toLocaleString('ru-RU')} ₽/кг • Объём: ${batch} кг
Регион: ${region}

Открыть в Telegram: https://t.me/${BOT_USERNAME}?start=${ref}
(мой реф-код: ${ref})`;

  const url = `${location.origin}/?ref=${ref}`;
  return { text, url };
}
