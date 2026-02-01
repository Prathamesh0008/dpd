"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, LogIn } from "lucide-react";

const DPD_RED = "#DC0032";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const j = await r.json().catch(() => ({}));

      if (!j.ok) {
        setMsg(j.message || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Save auth
      localStorage.setItem("token", j.token);
      localStorage.setItem("user", JSON.stringify(j.user));

      // ✅ Role-based redirect
      if (j.user.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } catch {
      setMsg("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: DPD_RED }}
          >
            <LogIn className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DPD Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access your shipping dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={login} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="email@example.com"
                className="w-full pl-10 pr-3 py-2.5 
                           border border-gray-300 rounded-lg 
                           bg-white text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 
                           border border-gray-300 rounded-lg 
                           bg-white text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold 
                       disabled:opacity-50 transition"
            style={{ backgroundColor: DPD_RED }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        {/* Message */}
        {msg && (
          <div className="mt-4 text-sm text-red-600 text-center">{msg}</div>
        )}

        {/* Demo */}
        <div className="mt-8 border-t pt-4 text-xs text-gray-500 space-y-1">
          <div className="font-medium text-gray-700">Demo Credentials</div>
          <div>Admin: admin@demo.com / admin123</div>
          <div>User: user1@demo.com / user123</div>
        </div>
      </div>
    </div>
  );
}
