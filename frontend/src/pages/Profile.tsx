// frontend/src/pages/Profile.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { BUTTON_NAMES, PROFILE_PAGE } from "../constants/App.constants";
import { ROUTE_NAMES } from "../routes/constants";
import { useNavigate } from "react-router-dom";

type FormValues = {
  name?: string;
  email?: string;
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  function handleSignOut() {
    signOut();
    navigate(ROUTE_NAMES.SIGNIN, { replace: true });
  }
  return (
    <section>
      <div className="mb-4">
        <div className="text-sm text-[color:var(--muted)]">{PROFILE_PAGE.ACCOUNT}</div>
        <h2 className="text-lg font-semibold">{PROFILE_PAGE.PROFILE}</h2>
      </div>

      <div className="p-4 border rounded-md bg-[color:var(--card-bg)] max-w-xl">
        <>
          <div className="mb-3">
            <div className="text-sm text-[color:var(--muted)]">{PROFILE_PAGE.NAME}</div>
            <div className="font-medium">{user?.name ?? "—"}</div>
          </div>
          <div className="mb-3">
            <div className="text-sm text-[color:var(--muted)]">{PROFILE_PAGE.EMAIL}</div>
            <div className="font-medium">{user?.email ?? "—"}</div>
          </div>
          <div className="mb-3">
            <div className="text-sm text-[color:var(--muted)]">
              {PROFILE_PAGE.LOGGED_IN_AS}
            </div>
            <div className="font-medium">{(user as any)?.role ?? "—"}</div>
          </div>
          <div className="mb-3 w-fit text-white bg-red-600 rounded-lg">
            <button className="py-1 px-2" onClick={handleSignOut}>
              {BUTTON_NAMES.LOGOUT}
            </button>
          </div>
        </>
      </div>
    </section>
  );
}
