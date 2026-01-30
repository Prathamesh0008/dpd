"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function seed() {
    setMsg("Seeding...");
    const r = await fetch("/api/auth/seed", { method: "POST" });
    const j = await r.json();
    setMsg(j.message || "Seed done");
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

    const j = await r.json();
    setLoading(false);

    if (!j.ok) return setMsg(j.message || "Login failed");

    localStorage.setItem("token", j.token);
    localStorage.setItem("user", JSON.stringify(j.user));

    if (j.user.role === "admin") router.push("/admin");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <p className="text-white/70 text-sm mb-6">
          First time? Click <b>Seed Default Users</b>.
        </p>

        <button
          onClick={seed}
          className="w-full mb-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2"
        >
          Seed Default Users (6)
        </button>

        <form onSubmit={login} className="space-y-3">
          <input
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {msg && <div className="mt-4 text-sm text-yellow-300 break-words">{msg}</div>}

        <div className="mt-6 text-xs text-white/60">
          Demo:
          <div>Admin: admin@demo.com / admin123</div>
          <div>User: user1@demo.com / user123</div>
        </div>
      </div>
    </div>
  );
}
