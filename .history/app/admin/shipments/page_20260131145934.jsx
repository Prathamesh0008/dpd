"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const DPD_RED = "#DC0032";

export default function AdminShipmentsPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("Loading shipments...");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch("/api/shipments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json().catch(() => ({}));

        if (!j.ok) {
          setMsg(j.message || "Failed to load shipments");
          return;
        }

        setItems(j.shipments || []);
        setMsg("");
      } catch {
        setMsg("Network error");
      }
    })();
  }, []);

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-white text-gray-900 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-2xl font-bold">All Shipments</h1>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-red-600 hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Link>
          </div>

          {/* Message */}
          {msg && (
            <div className="mt-6 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              {msg}
            </div>
          )}

          {/* Table */}
          {!msg && (
            <div className="mt-6 overflow-x-auto border border-gray-200 rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      User
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Recipient Address
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Tracking Number
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Created At
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {items.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      {/* User */}
                      <td className="p-4">
                        <div className="font-medium">
                          {s.user?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.user?.email || "—"}
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="p-4">
                        <div className="font-medium">
                          {s.recipient?.name1 || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.recipient?.street || "—"},{" "}
                          {s.recipient?.city || "—"}{" "}
                          {s.recipient?.zipCode || ""},{" "}
                          {s.recipient?.country || ""}
                        </div>
                      </td>

                      {/* Tracking */}
                      <td className="p-4 font-mono">
                        {s.trackingNumber || "—"}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No shipments found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
