import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import BottomNav from "./widgets/BottomNav";
import ErrorBoundary from "./widgets/ErrorBoundary";
import { TMA } from "./lib/tma";

/** Ленивые страницы (чанки) */
const Splash = lazy(() => import("./pages/Splash"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Listings = lazy(() => import("./pages/Listings"));
const Manufacturers = lazy(() => import("./pages/Manufacturers"));
const Profile = lazy(() => import("./pages/Profile"));
const Supplier = lazy(() => import("./pages/Supplier"));

/** Скелетон на время загрузки чанка */
function PageFallback() {
  return (
    <div className="py-10">
      <div className="glass glass-neon p-6 rounded-2xl">
        <div className="animate-pulse space-y-3">
          <div className="h-6 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="h-4 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="h-4 rounded bg-[rgba(255,255,255,.06)] w-2/3" />
        </div>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="bg-page-dark min-h-app has-bottom-nav">
      <div className="container-safe mx-auto px-3 pb-4 pt-3">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

/** Тихий прелоад основных страниц на простое */
function PrefetchOnIdle() {
  useEffect(() => {
    const preload = () => {
      import("./pages/Catalog");
      import("./pages/Listings");
      import("./pages/Manufacturers");
      import("./pages/Profile");
      import("./pages/Supplier");
    };
    // @ts-ignore
    const ric = window.requestIdleCallback || ((cb: any) => setTimeout(cb, 800));
    ric(preload);
  }, []);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {[
          { path: "/", el: <Splash /> },
          { path: "/catalog", el: <Catalog /> },
          { path: "/listings", el: <Listings /> },
          { path: "/manufacturers", el: <Manufacturers /> },
          { path: "/profile", el: <Profile /> },
          { path: "/supplier/:id", el: <Supplier /> },
        ].map(({ path, el }) => (
          <Route key={path} path={path} element={<Suspense fallback={<PageFallback />}>{el}</Suspense>} />
        ))}
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  useEffect(() => { TMA.ready(); }, []);
  return (
    <BrowserRouter>
      <PrefetchOnIdle />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
