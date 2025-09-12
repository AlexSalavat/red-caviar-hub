import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Splash from "./pages/Splash";
import Catalog from "./pages/Catalog";
import Listings from "./pages/Listings";
import Manufacturers from "./pages/Manufacturers";
import Profile from "./pages/Profile";

import BottomNav, { type TabKey } from "./widgets/BottomNav";

/** Лэйаут с нижней панелью — для всех страниц, кроме Splash */
function Layout() {
  const loc = useLocation();
  const nav = useNavigate();

  const path = loc.pathname;
  const active: TabKey =
    path.startsWith("/listings") ? "listings" :
    path.startsWith("/manufacturers") ? "manufacturers" :
    path.startsWith("/profile") ? "profile" :
    "catalog";

  const go = (t: TabKey) => {
    const map: Record<TabKey, string> = {
      catalog: "/catalog",
      listings: "/listings",
      manufacturers: "/manufacturers",
      profile: "/profile",
    };
    nav(map[t]);
  };

  return (
    <div className="min-h-screen bg-page-dark pb-24">
      <Outlet />
      <BottomNav active={active} onChange={go} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ВСЕГДА показываем Splash на корне */}
        <Route path="/" element={<Splash />} />

        {/* Остальные страницы в общем лэйауте с нижней панелью */}
        <Route element={<Layout />}>
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/manufacturers" element={<Manufacturers />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Фолбэк — на сплэш */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
