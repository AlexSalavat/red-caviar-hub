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

const supplierContacts: Record<string, { tg?: string; phone?: string; email?: string }> = {
  sup1: { tg: "@SakhalinFish", phone: "+7 999 111-22-33", email: "sales@sakhfish.example" },
  sup2: { tg: "@KamchatkaSea", phone: "+7 999 222-33-44", email: "export@kamsea.example" },
  sup3: { tg: "@NordRoe", phone: "+7 999 333-44-55", email: "orders@nordroe.example" },
};

const categoryOptions = ["Красная икра", "Краб", "Рыба/морепродукты"] as const;

type Draft = {
  title: string;
  category: (typeof categoryOptions)[number] | "";
  grade: string;
  tu: string;               // <-- вместо ГОСТ: ТУ
  packaging: string;        // "1kg, 3kg"
  price: string;            // ₽/кг
  volume: string;           // кг
  region: string;
  photos: string;           // по одному URL на строку
  shelfLifeDays: string;
  tempRegime: string;
};

const emptyDraft: Draft = {
  title: "",
  category: "",
  grade: "",
  tu: "",
  packaging: "",
  price: "",
  volume: "",
  region: "",
  photos: "",
  shelfLifeDays: "",
  tempRegime: "",
};

export default function Listings() {
  const baseListings = listingsMock as Listing[];
  const [userListings, setUserListings] = useState<any[]>([]);

  const regionOptions = useMemo(
    () => Array.from(new Set(baseListings.map((l: any) => l.region))).sort(),
    [baseListings]
  );

  const verifiedBySupplier = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of suppliers) m.set((s as any).id, !!(s as any).verified);
    return m;
  }, []);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number] | "">("");
  const [region, setRegion] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [volumeMin, setVolumeMin] = useState<string>("");

  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [showPreview, setShowPreview] = useState(false);

  function resetFilters() {
    setQ(""); setCategory(""); setRegion("");
    setPriceMin(""); setPriceMax(""); setVolumeMin("");
  }

  const all = useMemo(() => [...userListings, ...baseListings], [userListings, baseListings]);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all.filter((l: any) => {
      const price = l.pricePerKgRUB ?? l.price_per_kg_rub;
      const volume = l.batchVolumeKg ?? l.batch_volume_kg;
      const reg = l.region;
      const pkgs = (l.packaging ?? []).join(" ").toLowerCase();
      const cat = l.__category ?? detectCategory(l);

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
  }, [all, q, category, region, priceMin, priceMax, volumeMin]);

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); alert("Скопировано в буфер обмена"); } catch {}
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
    setRevealed((r) => ({ ...r, [listing.id]: true }));
    incRevealCount(plan);
  }

  async function onShare(listing: any) {
    const { text, url } = buildShare(listing);
    if (navigator.share) {
      try { await navigator.share({ title: "Red Caviar Hub", text, url }); return; } catch {}
    }
    await copyToClipboard(`${text}\n${url}`);
    alert("Ссылка скопирована. Отправьте её в чат или Stories.");
  }

  // === Валидация драфта: сорт ИЛИ ТУ обязательно ===
  function validateDraft(d: Draft) {
    const e: Partial<Record<keyof Draft, string>> = {};
    if (!d.title.trim()) e.title = "Укажите название партии";
    if (!d.category) e.category = "Выберите категорию";
    if (!d.packaging.trim()) e.packaging = "Укажите фасовку (через запятую)";
    if (!d.price || Number(d.price) <= 0) e.price = "Цена ₽/кг > 0";
    if (!d.volume || Number(d.volume) <= 0) e.volume = "Объём кг > 0";
    if (!d.region.trim()) e.region = "Укажите регион";
    const photoLines = d.photos.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (photoLines.length < 3) e.photos = "Нужно минимум 3 фото (URL)";
    if (!d.grade.trim() && !d.tu.trim()) e.grade = "Укажите сорт или ТУ";
    return { ok: Object.keys(e).length === 0, errors: e, photoLines };
  }

  function openCreate() {
    setDraft(emptyDraft);
    setErrors({});
    setShowPreview(false);
    setCreateOpen(true);
  }

  function submitDraft() {
    const { ok, errors: e, photoLines } = validateDraft(draft);
    setErrors(e);
    if (!ok) return;

    const newListing = {
      id: "u" + Date.now(),
      supplierId: "sup2",
      title: draft.title.trim(),
      fishSpecies: "",
      grade: draft.grade.trim() || "—",
      tu: draft.tu.trim() || null,        // <-- ТУ сохраняем в поле tu
      packaging: draft.packaging.split(",").map(s => s.trim()).filter(Boolean),
      batchVolumeKg: Number(draft.volume),
      pricePerKgRUB: Number(draft.price),
      region: draft.region.trim(),
      terms: [] as string[],
      photos: photoLines,
      shelfLifeDays: draft.shelfLifeDays ? Number(draft.shelfLifeDays) : null,
      tempRegime: draft.tempRegime.trim() || "",
      status: "pending",
      badges: ["new_batch"],
      createdAt: new Date().toISOString(),
      __category: draft.category,
    };

    setUserListings((arr) => [newListing, ...arr]);
    setCreateOpen(false);
    alert("Объявление отправлено на модерацию (локально).");
  }

  return (
    <div className="p-4 pb-24 space-y-3">
      {/* Панель фильтров + кнопка Создать */}
      <div className="bg-white rounded-2xl p-3 shadow space-y-2 text-brand-slate">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск: название, упаковка…"
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          />
          <button
            onClick={openCreate}
            className="px-3 py-2 rounded-2xl bg-brand-verify text-white text-sm font-medium"
            title="Создать объявление"
          >
            Создать
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
          >
            <option value="">Категория (все)</option>
            {categoryOptions.map((c) => (
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

      {/* Счётчик */}
      <div className="text-xs opacity-70">
        Найдено: {items.length}
        {q && ` • поиск: “${q}”`}
        {category && ` • категория: ${category}`}
        {region && ` • регион: ${region}`}
        {priceMin && ` • цена от ${priceMin}`}
        {priceMax && ` • цена до ${priceMax}`}
        {volumeMin && ` • объем от ${volumeMin} кг`}
      </div>

      {/* Карточки */}
      {items.length === 0 && (
        <div className="text-sm opacity-70">Нет подходящих объявлений. Измените фильтры или сбросьте их.</div>
      )}

      {items.map((x: any) => {
        const verified = verifiedBySupplier.get(x.supplierId);
        const price = x.pricePerKgRUB ?? x.price_per_kg_rub;
        const volume = x.batchVolumeKg ?? x.batch_volume_kg;
        const temp = x.temp_regime ?? x.tempRegime;
        const termsArr: string[] = x.terms ?? [];
        const cat = x.__category ?? detectCategory(x);
        const contact = supplierContacts[x.supplierId];
        const isRevealed = !!revealed[x.id];

        return (
          <div key={x.id} className="bg-white text-brand-slate rounded-2xl p-3 shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {x.title}
                {x.status === "pending" && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                    На модерации
                  </span>
                )}
              </div>
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
              {(x.fishSpecies ?? x.fish_species) || "—"} • {x.grade}
              {x.tu ? ` • ${x.tu}` : ""} • {(x.packaging ?? []).join(", ")}
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
                    {contact?.tg && <li>Telegram: <span className="underline">{contact.tg}</span></li>}
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

      {/* Модалка создания объявления */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-lg bg-white text-brand-slate rounded-t-2xl sm:rounded-2xl p-4 max-h-[95vh] overflow-auto">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Новое объявление</div>
              <button onClick={() => setCreateOpen(false)} className="text-sm opacity-70">Закрыть</button>
            </div>

            <div className="mt-3 grid gap-2">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Название партии (обязательно)"
                className="text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
              />
              {errors.title && <div className="text-xs text-red-700">{errors.title}</div>}

              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as any })}
                className="text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
              >
                <option value="">Категория (обязательно)</option>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div className="text-xs text-red-700">{errors.category}</div>}

              <div className="flex gap-2">
                <input
                  value={draft.grade}
                  onChange={(e) => setDraft({ ...draft, grade: e.target.value })}
                  placeholder="Сорт (например: 1)"
                  className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
                />
                <input
                  value={draft.tu}
                  onChange={(e) => setDraft({ ...draft, tu: e.target.value })}
                  placeholder="ТУ (напр. ТУ 10.20.12-001-2025)"
                  className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
                />
              </div>
              {errors.grade && <div className="text-xs text-red-700">{errors.grade}</div>}

              <input
                value={draft.packaging}
                onChange={(e) => setDraft({ ...draft, packaging: e.target.value })}
                placeholder="Фасовка (через запятую: 1kg, 3kg)"
                className="text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
              />
              {errors.packaging && <div className="text-xs text-red-700">{errors.packaging}</div>}

              <div className="flex gap-2">
                <input
                  type="number" inputMode="numeric"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  placeholder="Цена ₽/кг (обязательно)"
                  className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
                />
                <input
                  type="number" inputMode="numeric"
                  value={draft.volume}
                  onChange={(e) => setDraft({ ...draft, volume: e.target.value })}
                  placeholder="Объём партии кг (обязательно)"
                  className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
                />
              </div>
              {(errors.price || errors.volume) && (
                <div className="text-xs text-red-700">{errors.price || errors.volume}</div>
              )}

              <input
                value={draft.region}
                onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                placeholder="Регион (обязательно)"
                className="text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
              />
              {errors.region && <div className="text-xs text-red-700">{errors.region}</div>}

              <textarea
                value={draft.photos}
                onChange={(e) => setDraft({ ...draft, photos: e.target.value })}
                placeholder={"Фото (минимум 3 URL, по одному на строку)\nhttps://...\nhttps://...\nhttps://..."}
                className="text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none min-h-[88px]"
              />
              {errors.photos && <div className="text-xs text-red-700">{errors.photos}</div>}

              <div className="flex gap-2">
                <input
                  type="number" inputMode="numeric"
                  value={draft.shelfLifeDays}
                  onChange={(e) => setDraft({ ...draft, shelfLifeDays: e.target.value })}
                  placeholder="Срок годности (дней)"
                  className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
                />
                <input
                  value={draft.tempRegime}
                  onChange={(e) => setDraft({ ...draft, tempRegime: e.target.value })}
                  placeholder="Темп. режим (напр. -2..+2°C)"
                  className="flex-1 text-sm px-3 py-2 rounded-2xl bg-brand-cream/60 outline-none"
                />
              </div>

              <div className="text-[11px] opacity-70 mt-1">
                Обязательные поля: категория, название, фасовка, объём, цена за кг, регион, минимум 3 фото,
                сорт или ТУ. Запрещены ложные сведения, подмена видов.
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="px-4 py-2 rounded-2xl bg-white border text-sm"
                >
                  {showPreview ? "Скрыть предпросмотр" : "Предпросмотр"}
                </button>
                <button
                  onClick={submitDraft}
                  className="px-4 py-2 rounded-2xl bg-brand-red text-white text-sm font-medium"
                >
                  Опубликовать
                </button>
              </div>

              {showPreview && (
                <div className="mt-3 bg-white text-brand-slate rounded-2xl p-3 shadow">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{draft.title || "—"}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-cream/80 text-brand-slate/80">
                      {draft.category || "Категория"}
                    </span>
                  </div>
                  <div className="text-xs opacity-70">
                    {(draft.grade || "—")}{draft.tu ? ` • ${draft.tu}` : ""} • {(draft.packaging || "—")}
                  </div>
                  <div className="mt-2 text-sm">
                    {(draft.price ? Number(draft.price).toLocaleString("ru-RU") : "—")} ₽/кг • MOQ {draft.volume || "—"} кг
                  </div>
                  <div className="mt-2 flex gap-2 overflow-auto">
                    {draft.photos.split(/\r?\n/).filter(Boolean).slice(0,3).map((p) => (
                      <img key={p} src={p} className="w-20 h-14 object-cover rounded" />
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] opacity-70">
                    Регион: {draft.region || "—"} • {draft.tempRegime || ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
