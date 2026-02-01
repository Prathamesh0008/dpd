"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  PlusSquare,
  History,
  UploadCloud,
  User,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                📦 DPD Dashboard
              </h1>
              <p className="text-white/60 mt-1">
                Create, manage & download shipping labels
              </p>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-red-500/20 border border-white/10 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* User Info */}
          <div className="mt-6 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
            <div className="p-2 rounded-full bg-white/10">
              <User size={18} />
            </div>
            <div>
              <div className="text-sm text-white/60">Logged in as</div>
              <div className="font-medium">{user?.email || "User"}</div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Create Label */}
            <Link
              href="/dashboard/create"
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition">
                  <PlusSquare />
                </div>
                <h2 className="text-lg font-semibold">Create Label</h2>
              </div>
              <p className="text-sm text-white/60 mt-3">
                Enter address → generate tracking → download PDF label.
              </p>
            </Link>

            {/* History */}
            <Link
              href="/dashboard/history"
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/15 text-green-400 group-hover:scale-110 transition">
                  <History />
                </div>
                <h2 className="text-lg font-semibold">Label History</h2>
              </div>
              <p className="text-sm text-white/60 mt-3">
                View all previously created DPD shipments.
              </p>
            </Link>

            {/* Bulk Create */}
            <Link
              href="/dashboard/bulk-create"
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition">
                  <UploadCloud />
                </div>
                <h2 className="text-lg font-semibold">Bulk Create</h2>
              </div>
              <p className="text-sm text-white/60 mt-3">
                Upload CSV → generate multiple labels in one go.
              </p>
            </Link>
          </div>

          {/* Footer Hint */}
          <div className="mt-10 text-center text-xs text-white/40">
            DPD Shipping Platform · Secure · Fast · Reliable
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
