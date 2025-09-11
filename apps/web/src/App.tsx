import { useState } from "react";
import Catalog from "./pages/Catalog";
import Listings from "./pages/Listings";
import Manufacturers from "./pages/Manufacturers";
import Profile from "./pages/Profile";
import BottomNav from "./widgets/BottomNav";
import Splash from "./pages/Splash";

export type Tab = "catalog" | "listings" | "manufacturers" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [splash, setSplash] = useState(true); // сплэш до нажатия "Запуск"

  if (splash) return <Splash onStart={() => setSplash(false)} />;

  return (
    <div className="min-h-screen bg-brand-slate text-white pb-20">
      {tab === "catalog" && <Catalog />}
      {tab === "listings" && <Listings />}
      {tab === "manufacturers" && <Manufacturers />}
      {tab === "profile" && <Profile />}
      <BottomNav value={tab} onChange={setTab} />
    </div>
  );
}
