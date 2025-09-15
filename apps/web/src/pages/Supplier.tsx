import { useParams, Link } from "react-router-dom";

export default function Supplier() {
  const { id } = useParams();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Поставщик</h1>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Страница-заглушка. Основной профиль открывается из каталога через «Подробнее».
      </p>
      <div className="text-sm">
        ID: <span className="opacity-80">{id}</span>
      </div>
      <Link to="/catalog" className="btn btn-muted px-3 py-1.5 text-[12px]">← В каталог</Link>
    </div>
  );
}
