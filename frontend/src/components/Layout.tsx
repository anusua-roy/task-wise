import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-bg text-fg">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
