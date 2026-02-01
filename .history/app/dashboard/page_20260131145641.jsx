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
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
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
              <h1 className="text-3xl font-bold">DPD Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Manage shipments, labels & tracking
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
              <div className="font-semibold">{user?.email}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <Package className="text-red-600" />
                <span className="text-gray-500 text-sm">Labels Created</span>
              </div>
              <div className="text-2xl font-bold mt-2">128</div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <Truck className="text-red-600" />
                <span className="text-gray-500 text-sm">In Transit</span>
              </div>
              <div className="text-2xl font-bold mt-2">42</div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-red-600" />
                <span className="text-gray-500 text-sm">Delivered</span>
              </div>
              <div className="text-2xl font-bold mt-2">86</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/dashboard/create"
              className="group border border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <PlusSquare className="text-red-600" />
                Create Label
              </h2>
              <p className="text-sm text-gray-600 mt-3">
                Create a new DPD shipment and download the PDF label.
              </p>
            </Link>

            <Link
              href="/dashboard/history"
              className="group border border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <History className="text-red-600" />
                Shipment History
              </h2>
              <p className="text-sm text-gray-600 mt-3">
                View all previously created shipments.
              </p>
            </Link>

            <Link
              href="/dashboard/bulk-create"
              className="group border border-gray-200 rounded-2xl p-6 hover:border-red-600 hover:bg-red-50 transition"
            >
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <UploadCloud className="text-red-600" />
                Bulk Create
              </h2>
              <p className="text-sm text-gray-600 mt-3">
                Upload CSV to generate multiple labels at once.
              </p>
            </Link>
          </div>

          {/* How it works */}
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              How DPD Label Creation Works
            </h3>
            <ol className="list-decimal ml-5 space-y-2 text-gray-600 text-sm">
              <li>Enter shipment address and parcel details</li>
              <li>DPD generates tracking number instantly</li>
              <li>Download & print shipping label</li>
              <li>Hand over parcel to DPD for pickup or drop-off</li>
            </ol>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} DPD Shipping Platform · Official Red & White UI
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
