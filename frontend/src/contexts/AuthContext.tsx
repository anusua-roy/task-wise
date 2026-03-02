import React, { createContext, useContext, useState } from "react";
import { clearSessionUser, setSessionUser } from "../utils/session";
import { login } from "../api/auth.service";

type User = {
  id: string;
  name: string;
  email: string;
  role_id: string;
};

type AuthContextValue = {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

 async function signIn(email: string) {
   const user = await login(email);
   setUser(user);
   setSessionUser(user);
 }

 function signOut() {
   setUser(null);
   clearSessionUser();
 }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        initialized: true, // no async restore, so always ready
      }}
    >
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
