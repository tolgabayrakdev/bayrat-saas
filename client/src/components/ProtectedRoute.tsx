import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Oturum kontrol ediliyor…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
