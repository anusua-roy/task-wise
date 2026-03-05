import React, { createContext, useContext, useState } from "react";
import {
  clearSessionUser,
  setSessionUser,
  getSessionUser,
} from "../utils/session";
import { login } from "../api/auth.service";
import { User } from "../types/user.type";

type AuthContextValue = {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getSessionUser());
  const [initialized, setInitialized] = useState(false);

  // optional: run once to mark initialized
  React.useEffect(() => {
    setInitialized(true);
  }, []);

  async function signIn(email: string) {
    const user = await login(email.toLowerCase());
    setUser(user);
    setSessionUser(user, 1000 * 60 * 60); // 1 hour TTL
  }

  function signOut() {
    setUser(null);
    clearSessionUser();
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthContext not found");
  }
  return ctx;
}
