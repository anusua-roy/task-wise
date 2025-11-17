import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import SignIn from "./components/SignIn";
import "./styles/theme.css";

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("tw_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function handleSign(u: any) {
    setUser(u);
    localStorage.setItem("tw_user", JSON.stringify(u));
  }

  if (!user) return <SignIn onSign={handleSign} />;

  return <Dashboard />;
}
