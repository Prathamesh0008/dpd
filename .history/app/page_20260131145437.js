"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, LogIn, Database } from "lucide-react";

const DPD_RED = "#DC0032";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function seed() {
    setMsg("Seeding default users...");
    const r = await fetch("/api/auth/seed", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setMsg(j.message || "Seed completed");
  }

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const j = await r.json().catch(() => ({}));
    setLoading(false);

    if (!j.ok) {
      setMsg(j.message || "Login failed");
      return;
    }

    localStorage.setItem("token", j.token);
    localStorage.setItem("user", JSON.stringify(j.user));

    if (j.user.role === "admin") router.push("/admin");
    else router.push("/dashboard");
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

        {/* Seed */}
        <button
          onClick={seed}
          className="w-full mb-6 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          <Database size={16} />
          Seed Default Users
        </button>

        {/* Form */}
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: DPD_RED }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        {/* Message */}
        {msg && (
          <div className="mt-4 text-sm text-red-600 text-center">{msg}</div>
        )}

        {/* Demo Info */}
        <div className="mt-8 border-t pt-4 text-xs text-gray-500 space-y-1">
          <div className="font-medium text-gray-700">Demo Credentials</div>
          <div>Admin: admin@demo.com / admin123</div>
          <div>User: user1@demo.com / user123</div>
        </div>
      </div>
    </div>
  );
}
