import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import SignIn from "../pages/SignIn";
import { ROUTE_NAMES } from "./constants";

function ProtectedRoute({ children, user }: { children: JSX.Element; user: any }) {
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export default function AppRoutes({
  user,
  onSign,
  onSignOut,
}: {
  user: any;
  onSign: (u: any) => void;
  onSignOut: () => void;
}) {
  return (
    <Routes>
      {/* Public route */}
      <Route path={ROUTE_NAMES.SIGNIN} element={<SignIn onSign={onSign} />} />

      {/* Redirect root */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={ROUTE_NAMES.DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTE_NAMES.SIGNIN} replace />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path={ROUTE_NAMES.DASHBOARD}
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_NAMES.PROJECTS}
        element={
          <ProtectedRoute user={user}>
            <Projects />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_NAMES.PROJECT(":id")}
        element={
          <ProtectedRoute user={user}>
            <ProjectDetail onSignOut={onSignOut} />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={user ? ROUTE_NAMES.DASHBOARD : ROUTE_NAMES.SIGNIN} replace />}
      />
    </Routes>
  );
}
