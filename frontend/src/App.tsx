import React, { useEffect } from "react";
import "./styles/theme.css";
import { checkHealth } from "./api/health.service";
import AppRoutes from "./routes";

export default function App() {
  useEffect(() => {
    checkHealth()
  }, []);
  return <AppRoutes />;
}
