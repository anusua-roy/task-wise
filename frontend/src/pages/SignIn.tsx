import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_NAMES } from "../routes/constants";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  function handleSSO() {
    const u = { name: "SSO User", email: "" };
    signIn(u);
    navigate(ROUTE_NAMES.DASHBOARD, { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg text-fg">
      <div className="w-full max-w-md bg-card p-6 rounded-xl shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            ✓
          </div>
          <div>
            <h1 className="text-lg font-semibold">Welcome</h1>
            <p className="text-sm text-muted">
              Sign in to access your dashboard.
            </p>
          </div>
        </div>

        <button
          className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-medium"
          onClick={handleSSO}
        >
          Sign in with SSO
        </button>

        <div className="my-4 text-center text-muted text-sm">
          or continue with email
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full p-2.5 rounded-lg border border-border bg-bg text-fg mb-3"
        />

        <button
          className="w-full py-2.5 rounded-lg border border-border bg-white"
          onClick={() => {
            signIn({ name: email || "Guest", email });
            navigate(ROUTE_NAMES.DASHBOARD, { replace: true });
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
