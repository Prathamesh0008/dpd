"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";
import { ArrowLeft, FileDown, Package } from "lucide-react";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("Loading shipment history...");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch("/api/shipments/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();

        if (!j.ok) {
          setMsg(j.message || "Failed to load history");
          return;
        }

        setItems(j.shipments || []);
        setMsg("");
      } catch {
        setMsg("Something went wrong");
      }
    })();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white px-4 py-8 text-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold">Shipment History</h1>
              <p className="text-gray-500 text-sm mt-1">
                All previously created DPD labels
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>

          {/* Message */}
          {msg && (
            <div className="mt-6 text-gray-500 text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              {msg}
            </div>
          )}

          {/* History List */}
          <div className="mt-6 space-y-4">
            {items.map((s) => (
              <div
                key={s.id}
                className="border border-gray-200 rounded-xl p-5 hover:border-red-600 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-100 text-red-600">
                      <Package />
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Tracking Number</div>
                      <div className="text-lg font-semibold">
                        {s.trackingNumber || "-"}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        To:{" "}
                        <span className="font-medium">
                          {s.recipient?.name1 || "-"}
                        </span>
                        , {s.recipient?.city || "-"}{" "}
                        {s.recipient?.zipCode || ""}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <button
                    onClick={() =>
                      downloadPdfFromBase64(
                        s.labelBase64,
                        `${s.trackingNumber || "label"}.pdf`
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2 rounded-lg font-medium transition"
                  >
                    <FileDown size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {!msg && items.length === 0 && (
              <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl text-gray-500">
                No shipments found yet.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-400">
            DPD Shipping Platform · History
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
