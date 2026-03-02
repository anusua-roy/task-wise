import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import "./styles/theme.css";
import { checkHealth } from "./api/health.service";
import AppRoutes from "./routes";

export default function App() {
  useEffect(() => {
    checkHealth();
  }, []);

 useEffect(() => {
   const userData = JSON.parse(localStorage.getItem("app_user") || "{}");
   if (!userData?.expiresAt) return;

   const warningTime = 5 * 60 * 1000; // 5 minutes before expiry
   const now = Date.now();
   const timeUntilWarning = userData.expiresAt - now - warningTime;
   const timeUntilLogout = userData.expiresAt - now;

   // Warning timer
   let warningTimer: number | undefined;
   if (timeUntilWarning <= 0) {
     toast("Your session will expire soon!", { duration: 5000 });
   } else {
     warningTimer = setTimeout(() => {
       toast("Your session will expire in 5 minutes!", { duration: 5000 });
     }, timeUntilWarning);
   }

   // Logout timer
   const logoutTimer = setTimeout(() => {
     localStorage.removeItem("app_user"); // clear session
     toast("Your session has expired. Logging out...", { duration: 3000 });
     window.location.reload(); // or navigate to login page
   }, timeUntilLogout);

   return () => {
     clearTimeout(warningTimer);
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
