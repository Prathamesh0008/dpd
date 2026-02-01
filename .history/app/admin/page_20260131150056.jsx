"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package } from "lucide-react";

const DPD_RED = "#DC0032";

export default function AdminDashboard() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-white text-gray-900 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage shipments and platform activity
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Admin Actions */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* All Shipments */}
            <Link
              href="/admin/shipments"
              className="group border border-gray-200 rounded-xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
                  <Package size={20} />
                </div>
                <h2 className="text-lg font-semibold">All Shipments</h2>
              </div>

              <p className="text-sm text-gray-600">
                View all labels created by users, including recipient details
                and tracking numbers.
              </p>
            </Link>

            {/* Placeholder for future admin cards */}
            <div className="border border-dashed border-gray-300 rounded-xl p-6 text-gray-400 flex items-center justify-center text-sm">
              More admin tools coming soon
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-400">
            DPD Shipping Platform · Admin Panel
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
