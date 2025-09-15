import { Link } from "react-router-dom";

export default function Splash(){
  return (
    <div className="min-h-app grid place-items-center">
      <div className="w-full max-w-[520px] px-4">
        <div className="glass glass-neon p-8 text-center">
          <img
            src="/logo-mark.svg"
            alt="Red Caviar Hub"
            className="mx-auto mb-6 h-20 w-20"
            loading="eager"
            decoding="sync"
          />
          <h1 className="text-2xl font-semibold mb-2">Red Caviar Hub</h1>
          <p className="text-sm mb-6" style={{color:"var(--muted)"}}>
            Каталог поставщиков, объявления о партиях и быстрые сделки.
          </p>
          <Link to="/catalog" className="btn w-full text-base py-3">Запуск</Link>
        </div>
        <p className="text-center mt-3 text-xs" style={{color:"var(--muted)"}}>RU-интерфейс • РФ/СНГ + экспорт</p>
      </div>
    </div>
  );
}
