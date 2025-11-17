import React, { createContext, useContext, useEffect, useState } from "react";

type User = { name: string; email?: string } | null;

type AuthContextValue = {
  user: User;
  signIn: (u: User) => void;
  signOut: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tw_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.warn("auth: failed read", e);
    } finally {
      setInitialized(true);
    }
  }, []);

  function signIn(u: User) {
    setUser(u);
    try {
      localStorage.setItem("tw_user", JSON.stringify(u));
    } catch {}
  }
  function signOut() {
    setUser(null);
    try {
      localStorage.removeItem("tw_user");
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
