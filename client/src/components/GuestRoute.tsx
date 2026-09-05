import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/auth/useAuth";

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Oturum kontrol ediliyor…
      </div>
    );
  }

  if (user) return <Navigate to="/overview" replace />;
  return <Outlet />;
}
