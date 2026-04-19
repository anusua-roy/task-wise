import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import "./styles/theme.css";
import { checkHealth } from "./api/health.service";
import AppRoutes from "./routes";
import { getSession, clearSession } from "./utils/session";

export default function App() {
  useEffect(() => {
    checkHealth();
  }, []);

 useEffect(() => {
   const session = getSession();
   if (!session?.expiresAt) return;

   const warningTime = 5 * 60 * 1000;

   const now = Date.now();
   const timeUntilWarning = session.expiresAt - now - warningTime;
   const timeUntilLogout = session.expiresAt - now;

   let warningTimer: number | undefined;

   if (timeUntilWarning <= 0) {
     toast("Your session will expire soon!", { duration: 5000 });
   } else {
     warningTimer = setTimeout(() => {
       toast("Your session will expire in 5 minutes!", { duration: 5000 });
     }, timeUntilWarning);
   }

   const logoutTimer = setTimeout(() => {
     clearSession();
     toast("Session expired. Logging out...", { duration: 3000 });
     window.location.reload();
   }, timeUntilLogout);

   return () => {
     if (warningTimer) clearTimeout(warningTimer);
     clearTimeout(logoutTimer);
   };
 }, []);

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ebebeb",
            color: "#000",
            borderRadius: "8px",
          },
        }}
      />
    </>
  );
}
