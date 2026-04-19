import React, { createContext, useContext, useState } from "react";
import { setSession, getSession, clearSession } from "../utils/session";
import { login } from "../api/auth.service";
import { User } from "../types/user.type";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
const session = getSession();

const [user, setUser] = useState<User | null>(session?.user || null);
const [token, setToken] = useState<string | null>(session?.token || null);
  const [initialized, setInitialized] = useState(false);

  // optional: run once to mark initialized
  React.useEffect(() => {
    setInitialized(true);
  }, []);

  async function signIn(email: string) {
    const res = await login(email.toLowerCase());

    setUser(res.user);
    setToken(res.access_token);

    setSession(res.user, res.access_token);
  }

 function signOut() {
   setUser(null);
   setToken(null);
   clearSession();
 }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, initialized }}>
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
