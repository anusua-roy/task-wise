import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTasks } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ROUTE_NAMES } from "../routes/constants";
import { OTHERS } from "../constants/App.constants";

declare global {
  interface Window {
    google: any;
  }
}

export default function SignIn() {
  const navigate = useNavigate();
  const { googleSignIn } = useAuth();

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      {
        theme: "outline",
        size: "large",
        width: 300,
      },
    );
  }, []);

  async function handleCredentialResponse(response: any) {
    try {
      await googleSignIn(response.credential);

      navigate(ROUTE_NAMES.DASHBOARD, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Google login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-orange-100">
      <div className="hidden w-[50%] sm:flex justify-center">
        <FaTasks className="text-orange-600 text-[235px]" />
      </div>

      <div className="w-full sm:w-[50%] max-w-md bg-card border-orange-600 border-2 p-6 rounded-xl shadow">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-orange-600">
            {OTHERS.WELCOME}
          </h1>
          <p className="text-sm text-orange-600">Sign in with Google</p>
        </div>

        <div id="google-btn" className="flex justify-center mt-4"></div>
      </div>
    </div>
  );
}
