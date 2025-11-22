import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import SignIn from "../pages/SignIn";
import Layout from "../components/Layout";
import { ROUTE_NAMES } from "./constants";
import { useAuth } from "../contexts/AuthContext";
import MyTasksPage from "../pages/MyTasks";
import UserManagement from "../pages/UserManagement";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import { PAGE_LOADING } from "../constants/App.constants";

function ProtectedRoute({
  user,
  children,
}: {
  user: any;
  children: JSX.Element;
}) {
  if (!user) return <Navigate to={ROUTE_NAMES.SIGNIN} replace />;
  return children;
}

export default function AppRoutes() {
  const { user, initialized } = useAuth();

  // while auth initializes, render nothing (or a loader)
  if (!initialized)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {PAGE_LOADING}
      </div>
    );

  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTE_NAMES.SIGNIN} element={<SignIn />} />

      {/* Redirect root */}
      <Route
        path={ROUTE_NAMES.ROOT}
        element={
          user ? (
            <Navigate to={ROUTE_NAMES.DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTE_NAMES.SIGNIN} replace />
          )
        }
      />

      {/* Protected pages with one shared layout */}
      <Route
        element={
          <ProtectedRoute user={user}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTE_NAMES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTE_NAMES.PROJECTS} element={<Projects />} />
        <Route path={ROUTE_NAMES.PROJECT(":id")} element={<ProjectDetail />} />
        <Route path={ROUTE_NAMES.TASKS} element={<MyTasksPage />} />
        <Route path={ROUTE_NAMES.USERS} element={<UserManagement />} />
        <Route path={ROUTE_NAMES.SETTINGS} element={<Settings />} />
        <Route path={ROUTE_NAMES.PROFILE} element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? ROUTE_NAMES.DASHBOARD : ROUTE_NAMES.SIGNIN}
            replace
          />
        }
      />
    </Routes>
  );
}
