import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_NAMES } from "../routes/constants";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim()); // will call /login internally
      navigate(ROUTE_NAMES.DASHBOARD, { replace: true });
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg text-fg">
      <div className="w-full max-w-md bg-card p-6 rounded-xl shadow">
        <div className="mb-6">
          <h1 className="text-lg font-semibold">Welcome</h1>
          <p className="text-sm text-muted">
            Enter your email to access your dashboard.
          </p>
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="creator@taskwise.com"
          className="w-full p-2.5 rounded-lg border border-border bg-bg text-fg mb-4"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-orange-600 text-white rounded-lg disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
