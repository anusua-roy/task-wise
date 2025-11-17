import React, { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import AppRoutes from "./routes";
import { ROUTE_NAMES } from "./routes/constants";

function InternalRouter() {
  const [user, setUser] = useState<any>(null);
  const [initialised, setInitialised] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tw_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to read auth from localStorage", e);
    } finally {
      setInitialised(true);
    }
  }, []);

  function handleSign(u: any) {
    setUser(u);
    localStorage.setItem("tw_user", JSON.stringify(u));
    navigate(ROUTE_NAMES.DASHBOARD, { replace: true });
  }

  function handleSignOut() {
    setUser(null);
    localStorage.removeItem("tw_user");
    navigate(ROUTE_NAMES.SIGNIN, { replace: true });
  }

  if(!initialised){
    return <div>Loading</div>
  }

  return (
    <AppRoutes user={user} onSign={handleSign} onSignOut={handleSignOut} />
  );
}

export default function RouterProvider() {
  return (
    <BrowserRouter>
      <InternalRouter />
    </BrowserRouter>
  );
}
