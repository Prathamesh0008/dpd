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
      <div className="min-h-screen bg-white text-gray-900 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                DPD Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Shipping & label management platform
              </p>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* User Info */}
          <div className="mt-6 flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <User size={18} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Logged in as</div>
              <div className="font-semibold">{user?.email || "User"}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Label */}
            <Link
              href="/dashboard/create"
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                  <PlusSquare />
                </div>
                <h2 className="text-lg font-semibold">Create Label</h2>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Create a new DPD shipment and download the label PDF.
              </p>
            </Link>

            {/* History */}
            <Link
              href="/dashboard/history"
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                  <History />
                </div>
                <h2 className="text-lg font-semibold">Shipment History</h2>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                View tracking numbers and past shipments.
              </p>
            </Link>

            {/* Bulk Create */}
            <Link
              href="/dashboard/bulk-create"
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                  <UploadCloud />
                </div>
                <h2 className="text-lg font-semibold">Bulk Create</h2>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Upload CSV and generate multiple labels instantly.
              </p>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} DPD Shipping Platform · Red & White Official UI
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
