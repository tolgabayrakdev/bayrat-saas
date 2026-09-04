import { createContext } from "react";
import type { Session, User } from "@/types/api";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  startSession: (session: Session) => void;
  endSession: () => void;
  reloadUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
