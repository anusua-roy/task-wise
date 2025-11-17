import React, { useState } from "react";

export default function SignIn({ onSign }: { onSign: (u:{name:string,email?:string})=>void }) {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg text-fg">
      <div className="w-full max-w-md bg-card p-6 rounded-xl shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            ✓
          </div>
          <div>
            <h1 className="text-lg font-semibold">Welcome to TaskWise</h1>
            <p className="text-sm text-muted">Sign in to access your dashboard.</p>
          </div>
        </div>

        <button
          className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-medium"
          onClick={() => onSign({ name: "SSO User" })}
        >
          Sign in with SSO
        </button>

        <div className="my-4 text-center text-muted text-sm">
          or continue with email
        </div>

        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full p-2.5 rounded-lg border border-border bg-bg text-fg mb-3"
        />

        <button
          className="w-full py-2.5 rounded-lg border border-border bg-white"
          onClick={() => onSign({ name: email || "Guest", email })}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
