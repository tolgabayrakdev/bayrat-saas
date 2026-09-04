import { useEffect, useState, type ReactNode } from "react";
import { api, tokenStorage } from "@/lib/api";
import type { ApiResponse, Session, User } from "@/types/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasStoredSession = Boolean(tokenStorage.getAccess() || tokenStorage.getRefresh());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasStoredSession);

  const reloadUser = async () => {
    const response = await api.get<ApiResponse<User>>("/users/me", true);
    setUser(response.data);
  };

  useEffect(() => {
    if (!hasStoredSession) return;
    api.get<ApiResponse<User>>("/users/me", true)
      .then((response) => setUser(response.data))
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [hasStoredSession]);

  const startSession = (session: Session) => {
    tokenStorage.set(session.accessToken, session.refreshToken);
    setUser(session.user);
  };

  const endSession = () => {
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, startSession, endSession, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
