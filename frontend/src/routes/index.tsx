import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import SignIn from "../pages/SignIn";

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
      <Route path="/signin" element={<SignIn onSign={onSign} />} />

      {/* Redirect root */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute user={user}>
            <Projects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute user={user}>
            <ProjectDetail onSignOut={onSignOut} />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate to={user ? "/dashboard" : "/signin"} replace />
        }
      />
    </Routes>
  );
}
