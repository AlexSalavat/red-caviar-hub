import { useMemo, useState } from "react";
import listingsMock from "../mocks/listings.json";
import suppliers from "../mocks/suppliers.json";
import {
  getPlan,
  canRevealContact,
  incRevealCount,
  contactLimitByPlan,
  getReveals,
} from "../lib/plan";
import { buildShare } from "../lib/ref";

type Listing = typeof listingsMock[number];

// Простая категоризация по названию (для бейджа)
function detectCategory(l: any): "Красная икра" | "Краб" | "Рыба/морепродукты" {
  const title = (l.title ?? "").toLowerCase();
  const species = (l.fishSpecies ?? l.fish_species ?? "").toLowerCase();
  if (title.includes("краб")) return "Краб";
  if (
    title.includes("икра") ||
    ["chum","pink","sockeye","coho","chinook","trout","keta","gorbusha","nerka"].some(
      (k) => title.includes(k) || species.includes(k)
    )
  ) return "Красная икра";
  return "Рыба/морепродукты";
}

// Моки контактов по поставщику (по supplierId из listings.json)
const supplierContacts: Record<
  string,
  { tg?: string; phone?: string; email?: string }
> = {
  sup1: { tg: "@SakhalinFish", phone: "+7 999 111-22-33", email: "sales@sakhfish.example" },
  sup2: { tg: "@KamchatkaSea", phone: "+7 999 222-33-44", email: "export@kamsea.example" },
  sup3: { tg: "@NordRoe", phone: "+7 999 333-44-55", email: "orders@nordroe.example" },
};

export default function Listings() {
  // источник данных (моки)
  const listings = listingsMock as Listing[];

  // фиксированный список категорий
  const categoryOptions = ["Красная икра", "Краб", "Рыба/морепродукты"] as const;

  // для бейджа "Проверено" в карточке
  const verifiedBySupplier = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of suppliers) m.set(s.id, !!s.verified);
    return m;
  }, []);

  // справочник регионов из данных
  const regionOptions = useMemo(
    () => Array.from(new Set(listings.map((l: any) => l.region))).sort(),
    [listings]
  );

  // состояние фильтров
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number] | "">("");
  const [region, setRegion] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [volumeMin, setVolumeMin] = useState<string>("");

  // какие лоты уже раскрыты (id листинга → true)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  function resetFilters() {
    setQ("");
    setCategory("");
    setRegion("");
    setPriceMin("");
    setPriceMax("");
    setVolumeMin("");
  }

  // фильтрация
  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return listings.filter((l: any) => {
      const price = l.pricePerKgRUB ?? l.price_per_kg_rub;
      const volume = l.batchVolumeKg ?? l.batch_volume_kg;
      const reg = l.region;
      const pkgs = (l.packaging ?? []).join(" ").toLowerCase();
      const cat = detectCategory(l);

      if (category && cat !== category) return false;
      if (region && reg !== region) return false;
      if (priceMin && Number(price) < Number(priceMin)) return false;
      if (priceMax && Number(price) > Number(priceMax)) return false;
      if (volumeMin && Number(volume) < Number(volumeMin)) return false;

      if (query) {
        const hay = `${l.title} ${reg} ${pkgs}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [listings, q, category, region, priceMin, priceMax, volumeMin]);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Скопировано в буфер обмена");
    } catch {
      // no-op
    }
  }

  function onReveal(listing: any) {
    const plan = getPlan();
    if (!canRevealContact(plan)) {
      const limit = contactLimitByPlan(plan);
      const { count } = getReveals();
      const left = limit === "unlimited" ? "безлимит" : Math.max(0, Number(limit) - count);
      alert(
        `Нужен план Pro/VIP для раскрытия контактов (или лимит исчерпан).\n` +
        `Текущий план: ${plan ?? "Lite"}\n` +
        `Осталось в этом месяце: ${left}\n\nПерейдите во вкладку «Профиль» и выберите план.`
      );
      return;
    }
    // раскрываем контакт и списываем лимит (для Lite)
    setRevealed((r) => ({ ...r, [listing.id]: true }));
    incRevealCount(plan);
  }

  async function onShare(listing: any) {
    const { text, url } = buildShare(listing);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Red Caviar Hub", text, url });
        return;
      } catch {
        // fallthrough
      }
    }
    await copyToClipboard(`${text}\n${url}`);
    alert("Ссылка скопирована. Отправьте её в чат или Stories.");
  }

  return (
    <div className="p-4 pb-24 space-y-3">
      {/* Панель фильтров (с категорией) */}
      <div className="bg-white rounded-2xl p-3 shadow space-y-2 text-brand-slate">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск: название, упаковка…"
          className="w-full text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          >
            <option value="">Категория (все)</option>
            {(["Красная икра","Краб","Рыба/морепродукты"] as const).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          >
            <option value="">Регион (все)</option>
            {regionOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="number" inputMode="numeric" value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Цена ₽/кг от"
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          />
          <input
            type="number" inputMode="numeric" value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Цена ₽/кг до"
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          />
          <input
            type="number" inputMode="numeric" value={volumeMin}
            onChange={(e) => setVolumeMin(e.target.value)}
            placeholder="Объём кг от"
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button onClick={resetFilters} className="px-3 py-1.5 rounded-2xl text-sm bg-white border">
            Сброс
          </button>
        </div>
      </div>

      {/* Счётчик результатов */}
      <div className="text-xs opacity-70">
        Найдено: {items.length}
        {q && ` • поиск: “${q}”`}
        {category && ` • категория: ${category}`}
        {region && ` • регион: ${region}`}
        {priceMin && ` • цена от ${priceMin}`}
        {priceMax && ` • цена до ${priceMax}`}
        {volumeMin && ` • объем от ${volumeMin} кг`}
      </div>

      {/* Карточки объявлений */}
      {items.length === 0 && (
        <div className="text-sm opacity-70">Нет подходящих объявлений. Измените фильтры или сбросьте их.</div>
      )}

      {items.map((x: any) => {
        const verified = verifiedBySupplier.get(x.supplierId);
        const price = x.pricePerKgRUB ?? x.price_per_kg_rub;
        const volume = x.batchVolumeKg ?? x.batch_volume_kg;
        const temp = x.temp_regime ?? x.tempRegime;
        const termsArr: string[] = x.terms ?? [];
        const cat = detectCategory(x);
        const contact = supplierContacts[x.supplierId];

        const isRevealed = !!revealed[x.id];

        return (
          <div key={x.id} className="bg-white text-brand-slate rounded-2xl p-3 shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{x.title}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-cream/80 text-brand-slate/80">
                  {cat}
                </span>
                {verified && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-verify/10 text-brand-verify">
                    Проверено
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs opacity-70">
              {(x.fishSpecies ?? x.fish_species) || "—"} • {x.grade} • {(x.packaging ?? []).join(", ")}
            </div>

            <div className="mt-2 text-sm">
              {Number(price).toLocaleString("ru-RU")} ₽/кг • MOQ {volume} кг
            </div>

            <div className="mt-2 flex gap-2 overflow-auto">
              {(x.photos ?? []).slice(0, 3).map((p: string) => (
                <img key={p} src={p} className="w-20 h-14 object-cover rounded" />
              ))}
            </div>

            <div className="mt-2 text-[11px] opacity-70">
              Регион: {x.region} • Условия: {termsArr.join("/")} • {temp}
            </div>

            {/* Действия: Показать контакт / Поделиться */}
            <div className="mt-3 flex gap-2">
              {!isRevealed ? (
                <button
                  onClick={() => onReveal(x)}
                  className="px-4 py-2 rounded-2xl bg-brand-verify text-white text-sm font-medium hover:opacity-90 active:opacity-80 transition"
                >
                  Показать контакт
                </button>
              ) : (
                <div className="flex-1 bg-brand-cream/70 rounded-2xl p-3 text-sm">
                  <div className="font-medium mb-1">Контакты поставщика</div>
                  <ul className="space-y-1">
                    {contact?.tg && (
                      <li>
                        Telegram: <span className="underline">{contact.tg}</span>
                      </li>
                    )}
                    {contact?.phone && <li>Телефон: {contact.phone}</li>}
                    {contact?.email && <li>Email: {contact.email}</li>}
                    {!contact && <li>Контакты не найдены (моки).</li>}
                  </ul>
                </div>
              )}

              <button
                onClick={() => onShare(x)}
                className="px-4 py-2 rounded-2xl bg-brand-red text-white text-sm font-medium hover:opacity-90 active:opacity-80 transition"
                title="Поделиться карточкой"
              >
                Поделиться
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
