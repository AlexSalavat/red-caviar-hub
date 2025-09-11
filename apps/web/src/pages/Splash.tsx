export default function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6">
      {/* Центр: видео + тексты */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-5">
        <video
          className="w-full max-w-md rounded-2xl shadow"
          muted
          autoPlay
          loop
          playsInline
        >
          <source src="/promo.mp4" type="video/mp4" />
        </video>

        <div className="max-w-md text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-red">
            Red Caviar Hub
          </h1>
          <p className="mt-2 text-sm text-brand-slate/80">
            Рынок красной икры: проверенные производители, оптовые партии, быстрые лиды.
            Фильтры по ГОСТ/сортам, логистика и верификация — всё в одном месте.
          </p>
          <p className="mt-3 text-[11px] text-brand-slate/50">
            Подписки и промо — через Telegram Stars. Мы — агрегатор, а не продавец.
          </p>
        </div>
      </div>

      {/* Низ: зелёная кнопка по центру, приподнята выше низа */}
      <div className="w-full pb-[env(safe-area-inset-bottom)] py-6 flex justify-center mb-14">
        <button
          onClick={onStart}
          className="px-6 py-3 rounded-2xl bg-brand-verify text-white text-base font-semibold shadow hover:opacity-90 active:opacity-80 transition"
        >
          Запуск
        </button>
      </div>
    </div>
  );
}
