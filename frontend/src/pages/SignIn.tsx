import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTasks } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_NAMES } from "../routes/constants";
import {
  BUTTON_NAMES,
  EMPTY_STRING,
  ERR_MSG,
  OTHERS,
  PLACEHOLDERS,
} from "../constants/App.constants";

export default function SignIn() {
  const [email, setEmail] = useState(EMPTY_STRING);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email.trim()) {
      toast.error(ERR_MSG.ENETR_EMAIL);
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim()); // will call /login internally
      navigate(ROUTE_NAMES.DASHBOARD, { replace: true });
    } catch (err: any) {
      toast.error(err.message || ERR_MSG.LOGIN_FAIL);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg text-fg bg-orange-100">
      <div className="hidden w-[50%] sm:flex justify-center ">
        <FaTasks className="text-orange-600 font-semibold text-[235px]" />
      </div>
      <div className="w-full sm:w-[50%] max-w-md bg-card border-orange-600 border-2 p-6 rounded-xl shadow">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-orange-600">
            {OTHERS.WELCOME}
          </h1>
          <p className="text-sm text-muted text-orange-600">
            {OTHERS.WELCOME_DESC}
          </p>
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={PLACEHOLDERS.EMAIL_EXAMPLE}
          className="bg-orange-100 border border-orange-600 w-full p-2.5 rounded-lg border-border bg-bg text-fg mb-4"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-orange-600 text-white rounded-lg disabled:opacity-60"
        >
          {loading ? OTHERS.SIGNING_IN : BUTTON_NAMES.SIGN_IN}
        </button>
      </div>
    </div>
  );
}
