"use client";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  return (
    <AuthGuard>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <button onClick={logout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>

        <div className="mt-2 text-white/70">Logged in as: {user?.email}</div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/create" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="text-lg font-semibold">Create Label</div>
            <div className="text-white/70 text-sm mt-1">Fill address → get tracking → download PDF.</div>
          </Link>

          <Link href="/dashboard/history" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="text-lg font-semibold">History</div>
            <div className="text-white/70 text-sm mt-1">All your created labels.</div>
          </Link>
          <Link href="/dashboard/bulk-create" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="text-lg font-semibold">bulk-create</div>
            <div className="text-white/70 text-sm mt-1">All your created labels.</div>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
