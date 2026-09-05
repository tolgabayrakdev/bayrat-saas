import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { ApiResponse, Session, User } from "@/types/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = async () => {
    const response = await api.get<ApiResponse<User>>("/users/me", true);
    setUser(response.data);
  };

  useEffect(() => {
    api.get<ApiResponse<User>>("/users/me", true)
      .then((response) => setUser(response.data))
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const startSession = (session: Session) => {
    setUser(session.user);
  };

  const endSession = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, startSession, endSession, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
