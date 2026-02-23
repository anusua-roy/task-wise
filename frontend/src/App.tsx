import React, { useEffect } from "react";
import "./styles/theme.css";
import RouterProvider from "./RouterProvider";

export default function App() {
  useEffect(() => {
    fetch("http://3.107.12.140:8000/health")
      .then((res) => res.json())
      .then((data) => console.log("Backend:", data))
      .catch((err) => console.error("Error:", err));
  }, []);
  return <RouterProvider />;
}
