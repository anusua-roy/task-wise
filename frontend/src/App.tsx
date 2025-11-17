import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import "./styles/theme.css";
import SignIn from "./components/SignIn";

export default function App() {
  const [user, setUser] = useState<{ name: string; email?: string } | null>(
    null
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tw_user")
      if(raw)setUser(JSON.parse(raw))
    } catch {}
  }, []);

  function handleSign(u: { name: string; email?: string }){
    setUser(u)
    localStorage.setItem("tw_user", JSON.stringify(u))
  };

  if(!user) return <SignIn onSign={handleSign}/>
  return <Dashboard />;
}
