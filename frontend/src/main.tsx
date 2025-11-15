// frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx"; // Explicitly set the .tsx extension for maximum compatibility

// Import the global CSS file which contains Tailwind directives
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
