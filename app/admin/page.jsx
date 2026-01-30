"use client";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <AuthGuard role="admin">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link href="/admin/shipments" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="text-lg font-semibold">All Shipments</div>
            <div className="text-white/70 text-sm mt-1">See which user created label for which address.</div>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
